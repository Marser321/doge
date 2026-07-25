import 'server-only';

import { Resend } from 'resend';

import TransactionalEmail, { emailSubject } from '@/emails/TransactionalEmail';
import { getServiceSupabase } from './supabase';

let resendClient: Resend | null = null;

function getResend() {
  if (!resendClient) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error('Resend no está configurado.');
    resendClient = new Resend(key);
  }
  return resendClient;
}

type OutboxRow = {
  id: string;
  event_key: string;
  template: string;
  recipient: string;
  locale: 'es' | 'en';
  payload: Record<string, unknown>;
  attempts: number;
};

export async function dispatchEmailOutbox(limit = 10) {
  const db = getServiceSupabase();
  const now = new Date().toISOString();
  await Promise.all([
    db.from('api_idempotency_keys').delete().lt('expires_at', now),
    db.from('rate_limit_windows').delete().lt('expires_at', now),
  ]);
  const claimed = await db.rpc('claim_email_outbox', { p_limit: limit });
  if (claimed.error) throw new Error(claimed.error.message);
  const rows = (claimed.data || []) as OutboxRow[];
  const results: Array<{ id: string; status: 'sent' | 'failed' }> = [];

  for (const row of rows) {
    try {
      const { data, error } = await getResend().emails.send({
        from: process.env.EMAIL_FROM || 'DOGE <onboarding@resend.dev>',
        to: row.recipient,
        subject: emailSubject(row.template, row.locale, row.payload),
        react: TransactionalEmail({ template: row.template, locale: row.locale, payload: row.payload }),
      }, { idempotencyKey: row.event_key });
      if (error) throw new Error(error.message);
      const safePayload = row.template === 'quote-ready'
        ? { ...row.payload, approvalUrl: '[redacted]' }
        : row.payload;
      await db.from('email_outbox').update({
        status: 'sent',
        provider_id: data?.id || null,
        sent_at: new Date().toISOString(),
        last_error: null,
        payload: safePayload,
      }).eq('id', row.id);
      results.push({ id: row.id, status: 'sent' });
    } catch (cause) {
      const delayMinutes = Math.min(60, 2 ** Math.min(row.attempts, 5));
      await db.from('email_outbox').update({
        status: row.attempts >= 5 ? 'suppressed' : 'failed',
        last_error: cause instanceof Error ? cause.message.slice(0, 1000) : 'Error desconocido',
        next_attempt_at: new Date(Date.now() + delayMinutes * 60_000).toISOString(),
      }).eq('id', row.id);
      results.push({ id: row.id, status: 'failed' });
    }
  }
  return results;
}
