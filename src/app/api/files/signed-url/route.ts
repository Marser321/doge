import { NextResponse } from 'next/server';
import { z } from 'zod';

import { requireStaff } from '@/lib/server/auth';
import { badRequest, errorResponse, rateLimit } from '@/lib/server/http';
import { createUserSupabase, getServiceSupabase } from '@/lib/server/supabase';

export async function GET(request: Request) {
  try {
    const limited = await rateLimit(request, 'private-file-read', 120, 15 * 60_000);
    if (limited) return limited;
    await requireStaff(['owner', 'manager', 'dispatcher', 'crew']);
    const parsed = z.string().uuid().safeParse(new URL(request.url).searchParams.get('attachment'));
    if (!parsed.success) return badRequest('Adjunto inválido.');

    const userDb = await createUserSupabase();
    const attachment = await userDb.from('request_attachments')
      .select('id,bucket,object_key,mime_type')
      .eq('id', parsed.data)
      .maybeSingle();
    if (attachment.error || !attachment.data) {
      return NextResponse.json({ error: 'No tienes acceso a este archivo.' }, { status: 404 });
    }
    if (!['booking-attachments', 'job-evidence'].includes(attachment.data.bucket)) {
      return badRequest('Bucket privado no válido.');
    }
    const signed = await getServiceSupabase().storage
      .from(attachment.data.bucket)
      .createSignedUrl(attachment.data.object_key, 300);
    if (signed.error || !signed.data?.signedUrl) throw new Error(signed.error?.message || 'No fue posible firmar el archivo.');
    return NextResponse.json({
      url: signed.data.signedUrl,
      expires_in: 300,
      mime_type: attachment.data.mime_type,
    }, {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    return errorResponse(error, 'No fue posible abrir el archivo.');
  }
}
