import { z } from 'zod';

import { badRequest, errorResponse, rateLimit, runIdempotentJson } from '@/lib/server/http';
import { createCommerceIntent } from '@/lib/server/repository';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const limited = await rateLimit(request, 'commerce-intent', 12, 15 * 60_000);
    if (limited) return limited;
    const parsed = z.object({
      product_id: z.string().uuid(),
      channel: z.enum(['whatsapp', 'affiliate']),
      source: z.string().trim().max(80).optional(),
      contact_name: z.string().trim().max(120).optional(),
      contact_email: z.string().email().max(254).optional(),
      contact_phone: z.string().trim().max(40).optional(),
    }).safeParse(await request.json());
    if (!parsed.success) return badRequest('La intención comercial no es válida.');
    return await runIdempotentJson(
      request,
      'commerce-intent:create',
      'public',
      JSON.stringify(parsed.data),
      async () => {
        const intent = await createCommerceIntent({
          product_id: parsed.data.product_id,
          channel: parsed.data.channel,
          source: parsed.data.source || 'store',
          contact_name: parsed.data.contact_name || null,
          contact_email: parsed.data.contact_email || null,
          contact_phone: parsed.data.contact_phone || null,
          metadata: { user_agent: request.headers.get('user-agent')?.slice(0, 300) || null },
        });
        return { id: intent.id };
      },
      201,
    );
  } catch (error) {
    return errorResponse(error, 'No fue posible registrar la intención comercial.');
  }
}
