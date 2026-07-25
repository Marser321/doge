import { createHash } from 'node:crypto';
import sharp from 'sharp';

import { requireStaff } from '@/lib/server/auth';
import { badRequest, errorResponse, rateLimit, requireSameOrigin, runIdempotentJson } from '@/lib/server/http';
import { getServiceSupabase } from '@/lib/server/supabase';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  let objectKey = '';
  let imageId = '';
  try {
    requireSameOrigin(request);
    const limited = await rateLimit(request, 'product-media', 30, 15 * 60_000);
    if (limited) return limited;
    const staff = await requireStaff(['owner', 'manager']);
    const form = await request.formData();
    const productId = String(form.get('product_id') || '');
    const photo = form.get('photo');
    if (!(photo instanceof File) || !productId) return badRequest('Imagen de producto inválida.');
    if (photo.size > 10 * 1024 * 1024 || !photo.type.startsWith('image/')) return badRequest('La imagen debe pesar hasta 10 MB.');
    const normalized = await sharp(Buffer.from(await photo.arrayBuffer()), { failOn: 'warning' })
      .rotate()
      .resize({ width: 1800, height: 1800, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 86 })
      .toBuffer();
    return await runIdempotentJson(
      request,
      'product-media:create',
      staff.id,
      `${productId}:${createHash('sha256').update(normalized).digest('hex')}`,
      async () => {
        objectKey = `${productId}/${crypto.randomUUID()}.webp`;
        const db = getServiceSupabase();
        const upload = await db.storage.from('product-media').upload(objectKey, normalized, { contentType: 'image/webp' });
        if (upload.error) throw new Error(upload.error.message);
        const { data: publicUrl } = db.storage.from('product-media').getPublicUrl(objectKey);
        const image = await db.from('product_images').insert({
          product_id: productId,
          object_key: objectKey,
          image_url: publicUrl.publicUrl,
          alt_text: photo.name.replace(/\.[^.]+$/, ''),
          is_primary: true,
          sort_order: 0,
        }).select().single();
        if (image.error || !image.data) throw new Error(image.error?.message || 'No fue posible registrar la imagen.');
        imageId = String(image.data.id);
        const audit = await db.from('audit_events').insert({
          actor_id: staff.id,
          actor_email: staff.email,
          action: 'product.image_added',
          entity_type: 'products',
          entity_id: productId,
          metadata: { object_key: objectKey },
        });
        if (audit.error) throw new Error(audit.error.message);
        return image.data;
      },
      201,
    );
  } catch (error) {
    if (imageId) await getServiceSupabase().from('product_images').delete().eq('id', imageId);
    if (objectKey) await getServiceSupabase().storage.from('product-media').remove([objectKey]);
    return errorResponse(error, 'No fue posible guardar la imagen.');
  }
}
