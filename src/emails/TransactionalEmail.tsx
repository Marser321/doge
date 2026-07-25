import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from 'react-email';

type Props = {
  template: string;
  locale: 'es' | 'en';
  payload: Record<string, unknown>;
};

const copy = {
  es: {
    preview: 'Actualización de DOGE',
    greeting: 'Hola',
    requestReceived: 'Recibimos tu solicitud',
    requestBody: 'Nuestro equipo revisará la información y te contactará para confirmar alcance y disponibilidad.',
    appointment: 'Tu visita fue programada',
    rescheduled: 'Tu visita fue reprogramada',
    cancelled: 'El servicio fue cancelado',
    quote: 'Tu propuesta está lista',
    quoteBody: 'Revisa los detalles y registra tu decisión mediante el enlace seguro.',
    review: 'Ver propuesta',
    decision: 'Registramos tu decisión',
    footer: 'DOGE · Servicio operativo en Miami y South Florida',
  },
  en: {
    preview: 'DOGE update',
    greeting: 'Hello',
    requestReceived: 'We received your request',
    requestBody: 'Our team will review the information and contact you to confirm scope and availability.',
    appointment: 'Your visit was scheduled',
    rescheduled: 'Your visit was rescheduled',
    cancelled: 'The service was cancelled',
    quote: 'Your proposal is ready',
    quoteBody: 'Review the details and record your decision through the secure link.',
    review: 'Review proposal',
    decision: 'We recorded your decision',
    footer: 'DOGE · Operations in Miami and South Florida',
  },
};

export function emailSubject(template: string, locale: 'es' | 'en', payload: Record<string, unknown>) {
  const reference = typeof payload.reference === 'string' ? ` · ${payload.reference}` : '';
  if (template === 'request-received') return locale === 'es' ? `Solicitud recibida${reference}` : `Request received${reference}`;
  if (template === 'appointment-scheduled') return locale === 'es' ? `Visita programada${reference}` : `Visit scheduled${reference}`;
  if (template === 'appointment-rescheduled') return locale === 'es' ? `Visita reprogramada${reference}` : `Visit rescheduled${reference}`;
  if (template === 'request-cancelled') return locale === 'es' ? `Servicio cancelado${reference}` : `Service cancelled${reference}`;
  if (template === 'quote-ready') return locale === 'es' ? `Propuesta DOGE${reference}` : `DOGE proposal${reference}`;
  if (template === 'quote-decision') return locale === 'es' ? `Decisión registrada${reference}` : `Decision recorded${reference}`;
  return locale === 'es' ? 'Actualización DOGE' : 'DOGE update';
}

export default function TransactionalEmail({ template, locale, payload }: Props) {
  const text = copy[locale];
  const name = typeof payload.name === 'string' ? payload.name : '';
  const reference = typeof payload.reference === 'string' ? payload.reference : '';
  const service = typeof payload.service === 'string' ? payload.service : '';
  const startsAt = typeof payload.startsAt === 'string'
    ? new Intl.DateTimeFormat(locale === 'es' ? 'es-US' : 'en-US', {
      dateStyle: 'long',
      timeStyle: 'short',
      timeZone: 'America/New_York',
    }).format(new Date(payload.startsAt))
    : '';
  const approvalUrl = typeof payload.approvalUrl === 'string' ? payload.approvalUrl : '';

  const heading = template === 'request-received' ? text.requestReceived
    : template === 'appointment-scheduled' ? text.appointment
      : template === 'appointment-rescheduled' ? text.rescheduled
        : template === 'request-cancelled' ? text.cancelled
      : template === 'quote-ready' ? text.quote
        : text.decision;
  const body = template === 'request-received' ? text.requestBody
    : template === 'quote-ready' ? text.quoteBody
      : ['appointment-scheduled', 'appointment-rescheduled'].includes(template) ? `${service} · ${startsAt}`
        : template === 'request-cancelled' ? `${service} · ${String(payload.reason || '')}`
          : `${String(payload.decision || '')} · ${String(payload.quoteNumber || '')}`;

  return (
    <Html>
      <Head />
      <Preview>{text.preview}</Preview>
      <Body style={{ margin: 0, backgroundColor: '#0b0b0c', color: '#f5f5f5', fontFamily: 'Arial, sans-serif' }}>
        <Container style={{ maxWidth: 560, margin: '0 auto', padding: '48px 24px' }}>
          <Text style={{ color: '#f87171', fontSize: 12, letterSpacing: 2, fontWeight: 700 }}>DOGE</Text>
          <Heading style={{ margin: '16px 0', fontSize: 28, lineHeight: 1.2 }}>{heading}</Heading>
          <Text style={{ color: '#d4d4d8', fontSize: 16 }}>{text.greeting}{name ? `, ${name}` : ''}.</Text>
          <Text style={{ color: '#d4d4d8', fontSize: 15, lineHeight: 1.7 }}>{body}</Text>
          {reference && (
            <Section style={{ margin: '24px 0', padding: 16, borderRadius: 12, backgroundColor: '#18181b' }}>
              <Text style={{ margin: 0, color: '#a1a1aa', fontSize: 12 }}>REFERENCE</Text>
              <Text style={{ margin: '6px 0 0', fontFamily: 'monospace', fontSize: 17 }}>{reference}</Text>
            </Section>
          )}
          {approvalUrl && <Button href={approvalUrl} style={{ display: 'inline-block', marginTop: 12, padding: '14px 20px', borderRadius: 10, backgroundColor: '#b91c1c', color: '#fff', fontWeight: 700 }}>{text.review}</Button>}
          <Text style={{ marginTop: 40, color: '#71717a', fontSize: 12 }}>{text.footer}</Text>
        </Container>
      </Body>
    </Html>
  );
}
