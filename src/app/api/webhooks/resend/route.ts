import { NextResponse } from 'next/server';

import { getServiceSupabase } from '@/lib/server/supabase';
import { errorResponse } from '@/lib/server/http';
import { Resend } from 'resend';

export async function POST(request: Request) {
  try {
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
    if (!webhookSecret) throw new Error('El webhook de Resend no está configurado.');
    const payload = await request.text();
    const webhookId = request.headers.get('svix-id') || '';
    const event = new Resend().webhooks.verify({
      payload,
      headers: {
        id: webhookId,
        timestamp: request.headers.get('svix-timestamp') || '',
        signature: request.headers.get('svix-signature') || '',
      },
      webhookSecret,
    });
    const providerId = 'email_id' in event.data ? String(event.data.email_id) : null;
    const db = getServiceSupabase();
    const outbox = providerId
      ? await db.from('email_outbox').select('id').eq('provider_id', providerId).maybeSingle()
      : { data: null };
    const delivery = await db.from('email_deliveries').insert({
      webhook_id: webhookId,
      outbox_id: outbox.data?.id || null,
      provider_id: providerId,
      event_type: event.type,
      metadata: event.data,
    });
    if (delivery.error && delivery.error.code !== '23505') throw new Error(delivery.error.message);
    if (delivery.error?.code === '23505') return NextResponse.json({ received: true, duplicate: true });
    if (outbox.data?.id && ['email.bounced', 'email.complained', 'email.suppressed'].includes(event.type)) {
      await db.from('email_outbox').update({ status: 'suppressed', last_error: event.type }).eq('id', outbox.data.id);
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    return errorResponse(error, 'Webhook inválido.');
  }
}
