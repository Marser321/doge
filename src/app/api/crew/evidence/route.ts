import { NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

import { requireStaff } from '@/lib/server/auth';
import { badRequest, errorResponse, rateLimit, requireSameOrigin, runIdempotentJson } from '@/lib/server/http';
import { crewAppointments } from '@/lib/server/repository';
import { getServiceSupabase } from '@/lib/server/supabase';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  let objectKey = '';
  let attachmentId = '';
  let activityId = '';
  try {
    requireSameOrigin(request);
    const limited = await rateLimit(request, 'crew-evidence', 30, 15 * 60_000);
    if (limited) return limited;
    const staff = await requireStaff(['crew'], { requireMfa: false });
    const form = await request.formData();
    const appointmentId = String(form.get('appointmentId') || '');
    const kind = String(form.get('kind') || '');
    const note = String(form.get('note') || '').trim().slice(0, 1000);
    const photo = form.get('photo');
    const photoFile = photo instanceof File && photo.size > 0 ? photo : null;
    if (!['before', 'after', 'incident', 'note'].includes(kind) || (!photoFile && !note)) return badRequest('Agrega una nota o una foto válida.');
    if (photoFile && (photoFile.size > 5 * 1024 * 1024 || !photoFile.type.startsWith('image/'))) return badRequest('La foto debe pesar hasta 5 MB.');
    const assigned = await crewAppointments(staff.id);
    const appointment = assigned.find((item) => String(item.id) === appointmentId);
    if (!appointment) return NextResponse.json({ error: 'No tienes acceso a esta asignación.' }, { status: 403 });
    const normalized = photoFile
      ? await sharp(Buffer.from(await photoFile.arrayBuffer()), { failOn: 'warning' })
        .rotate()
        .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 84 })
        .toBuffer()
      : null;
    return await runIdempotentJson(
      request,
      'crew-evidence:create',
      staff.id,
      `${appointmentId}:${kind}:${note}:${normalized ? createHash('sha256').update(normalized).digest('hex') : 'no-photo'}`,
      async () => {
        const db = getServiceSupabase();
        if (normalized) {
          const attachmentKind = kind === 'note' ? 'incident' : kind;
          objectKey = `${appointment.service_request_id}/${attachmentKind}/${crypto.randomUUID()}.webp`;
          const upload = await db.storage.from('job-evidence').upload(objectKey, normalized, { contentType: 'image/webp' });
          if (upload.error) throw new Error(upload.error.message);
          const attachment = await db.from('request_attachments').insert({
            service_request_id: appointment.service_request_id,
            bucket: 'job-evidence',
            object_key: objectKey,
            kind: attachmentKind,
            mime_type: 'image/webp',
            size_bytes: normalized.byteLength,
            uploaded_by: staff.id,
          }).select('id').single();
          if (attachment.error || !attachment.data) throw new Error(attachment.error?.message || 'No fue posible registrar la evidencia.');
          attachmentId = String(attachment.data.id);
        }
        if (note) {
          const activity = await db.from('request_activity').insert({
            service_request_id: appointment.service_request_id,
            actor_id: staff.id,
            action: kind === 'incident' ? 'crew.incident' : normalized ? 'crew.evidence_added' : 'crew.note',
            note,
            metadata: { attachment: objectKey || null },
          }).select('id').single();
          if (activity.error || !activity.data) throw new Error(activity.error?.message || 'No fue posible registrar la nota.');
          activityId = String(activity.data.id);
        }
        return { saved: true };
      },
      201,
    );
  } catch (error) {
    const db = getServiceSupabase();
    if (activityId) await db.from('request_activity').delete().eq('id', activityId);
    if (attachmentId) await db.from('request_attachments').delete().eq('id', attachmentId);
    if (objectKey) await getServiceSupabase().storage.from('job-evidence').remove([objectKey]);
    return errorResponse(error, 'No fue posible guardar la evidencia.');
  }
}
