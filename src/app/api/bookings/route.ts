import { createHash } from 'node:crypto';
import sharp from 'sharp';

import { badRequest, errorResponse, rateLimit, runIdempotentJson } from '@/lib/server/http';
import { getServiceSupabase } from '@/lib/server/supabase';
import { dispatchEmailOutbox } from '@/lib/server/email';
import { createBooking } from '@/lib/server/repository';
import { validateBookingFields } from '@/lib/booking';
import { newYorkDate } from '@/lib/domain';

export const runtime = 'nodejs';

const MAX_IMAGES = 4;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
function text(form: FormData, key: string, max = 2_000) {
  const value = form.get(key);
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export async function POST(request: Request) {
  const uploaded: string[] = [];
  try {
    const limited = await rateLimit(request, 'booking', 5, 15 * 60_000);
    if (limited) return limited;
    const form = await request.formData();
    const serviceCode = text(form, 'service_code', 120);
    const input = {
      name: text(form, 'name', 120),
      email: text(form, 'email', 254).toLowerCase(),
      phone: text(form, 'phone', 40),
      address: text(form, 'address', 240),
      city: text(form, 'city', 120),
      property_type: text(form, 'property_type', 80),
      square_feet: Number(text(form, 'square_feet', 10)) || null,
      bedrooms: Number(text(form, 'bedrooms', 3)) || null,
      bathrooms: Number(text(form, 'bathrooms', 3)) || null,
      service_type: serviceCode,
      service_name: '',
      service_code: serviceCode,
      preferred_date: text(form, 'preferred_date', 40) || null,
      notes: text(form, 'notes', 2_000) || null,
      locale: text(form, 'locale', 2) === 'en' ? 'en' : 'es',
      consent: form.get('consent') === 'accepted',
    };
    const validationError = validateBookingFields(input);
    if (validationError) return badRequest(validationError);
    if (input.preferred_date && (!/^\d{4}-\d{2}-\d{2}$/.test(input.preferred_date) || input.preferred_date < newYorkDate(new Date()))) {
      return badRequest('La fecha preferida debe ser válida y no puede estar en el pasado.');
    }
    if (
      (input.square_feet !== null && input.square_feet < 1)
      || (input.bedrooms !== null && input.bedrooms < 0)
      || (input.bathrooms !== null && input.bathrooms < 0)
    ) {
      return badRequest('Las dimensiones de la propiedad no son válidas.');
    }

    const files = form.getAll('photos').filter((value): value is File => value instanceof File && value.size > 0);
    if (files.length > MAX_IMAGES) return badRequest(`Puedes adjuntar hasta ${MAX_IMAGES} fotos.`);
    if (files.some((file) => !file.type.startsWith('image/') || file.size > MAX_IMAGE_BYTES)) {
      return badRequest('Cada foto debe ser una imagen de hasta 5 MB.');
    }

    const normalizedFiles: Array<{ name: string; data: Buffer }> = [];
    try {
      for (const file of files) {
        const data = await sharp(Buffer.from(await file.arrayBuffer()), { failOn: 'warning' })
          .rotate()
          .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 84 })
          .toBuffer();
        normalizedFiles.push({ name: file.name, data });
      }
    } catch {
      return badRequest('Uno de los archivos no es una imagen válida.');
    }

    return await runIdempotentJson(
      request,
      'public-booking:create',
      'public',
      JSON.stringify({
        ...input,
        files: normalizedFiles.map((file) => ({
          name: file.name,
          bytes: file.data.byteLength,
          sha256: createHash('sha256').update(file.data).digest('hex'),
        })),
      }),
      async () => {
        const bucket = getServiceSupabase().storage.from('booking-attachments');
        for (const file of normalizedFiles) {
          const key = `booking-intake/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.webp`;
          const { error } = await bucket.upload(key, file.data, { contentType: 'image/webp', upsert: false });
          if (error) throw new Error(`No fue posible adjuntar ${file.name}.`);
          uploaded.push(key);
        }
        const booking = await createBooking(input, uploaded);
        await dispatchEmailOutbox(1).catch(() => undefined);
        return booking;
      },
      201,
    );
  } catch (error) {
    if (uploaded.length) await getServiceSupabase().storage.from('booking-attachments').remove(uploaded);
    return errorResponse(error, 'No fue posible registrar la solicitud.');
  }
}
