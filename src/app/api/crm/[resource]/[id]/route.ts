import { NextResponse } from 'next/server';
import { z } from 'zod';

import { requireStaff } from '@/lib/server/auth';
import { badRequest, errorResponse, rateLimit, requireSameOrigin, runIdempotentJson } from '@/lib/server/http';
import { sanitizeCrmPayload, validateCrmPayload } from '@/lib/crm-validation';
import {
  archiveClient,
  archiveOffer,
  archiveProduct,
  getClientDetail,
  rescheduleAppointment,
  transitionServiceRequest,
  updateClient,
  updateCommerceIntent,
  updateOffer,
  updateOrderStatus,
  updateProduct,
  updateStaffProfile,
  updateSubscription,
} from '@/lib/server/repository';
import type { IntentStatus, RequestStatus, StaffRole } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET(request: Request, context: { params: Promise<{ resource: string; id: string }> }) {
  try {
    const limited = await rateLimit(request, 'crm-read', 180, 15 * 60_000);
    if (limited) return limited;
    const { resource, id } = await context.params;
    if (resource !== 'clients') return badRequest('Recurso CRM no válido.');
    await requireStaff(['owner', 'manager', 'dispatcher']);
    const data = await getClientDetail(id);
    return NextResponse.json(data, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ resource: string; id: string }> }) {
  try {
    requireSameOrigin(request);
    const limited = await rateLimit(request, 'crm-write', 60, 15 * 60_000);
    if (limited) return limited;
    const { resource, id } = await context.params;
    const body = await request.json();

    if (resource === 'appointments') {
      const identity = await requireStaff(['owner', 'manager', 'dispatcher']);
      const parsed = z.object({
        teamId: z.string().uuid(),
        startsAt: z.string().datetime(),
        endsAt: z.string().datetime(),
        notes: z.string().max(2000).optional(),
      }).refine((value) => new Date(value.endsAt) > new Date(value.startsAt)).safeParse(body);
      if (!parsed.success) return badRequest('Reprogramación inválida.');
      return runIdempotentJson(
        request,
        'crm:appointments:reschedule',
        identity.id,
        JSON.stringify(parsed.data),
        () => rescheduleAppointment(id, parsed.data),
      );
    }

    if (resource === 'clients') {
      await requireStaff(['owner', 'manager', 'dispatcher']);
      const payload = sanitizeCrmPayload('clients', body);
      const validation = validateCrmPayload('clients', payload, 'update');
      if (validation) return badRequest(validation);
      return NextResponse.json(await updateClient(id, payload));
    }
    if (resource === 'subscriptions') {
      await requireStaff(['owner', 'manager']);
      const payload = sanitizeCrmPayload('subscriptions', body);
      const validation = validateCrmPayload('subscriptions', payload, 'update');
      if (validation) return badRequest(validation);
      return NextResponse.json(await updateSubscription(id, payload));
    }
    if (resource === 'offers') {
      await requireStaff(['owner', 'manager']);
      const payload = sanitizeCrmPayload('offers', body);
      const validation = validateCrmPayload('offers', payload, 'update');
      if (validation) return badRequest(validation);
      return NextResponse.json(await updateOffer(id, payload));
    }
    if (resource === 'products') {
      await requireStaff(['owner', 'manager']);
      const payload = sanitizeCrmPayload('products', body);
      const validation = validateCrmPayload('products', payload, 'update');
      if (validation) return badRequest(validation);
      return NextResponse.json(await updateProduct(id, payload));
    }
    if (resource === 'orders') {
      await requireStaff(['owner', 'manager', 'dispatcher']);
      const parsed = z.enum(['confirmed', 'fulfilled', 'cancelled', 'refunded']).safeParse(body.status);
      if (!parsed.success) return badRequest('Estado de orden inválido.');
      return NextResponse.json(await updateOrderStatus(id, parsed.data));
    }
    if (resource === 'service-requests') {
      await requireStaff(['owner', 'manager', 'dispatcher', 'crew']);
      const parsed = z.enum(['reviewing', 'quoted', 'approved', 'scheduled', 'in_progress', 'completed', 'cancelled']).safeParse(body.status);
      if (!parsed.success) return badRequest('Estado de solicitud inválido.');
      return NextResponse.json(await transitionServiceRequest(id, parsed.data as RequestStatus, typeof body.note === 'string' ? body.note : undefined));
    }
    if (resource === 'intents') {
      const parsed = z.object({
        status: z.enum(['new', 'contacted', 'converted', 'lost']).optional(),
        affiliate_reference: z.string().trim().max(200).nullable().optional(),
        commission_cents: z.number().int().nonnegative().nullable().optional(),
      }).refine((value) => Object.keys(value).length > 0).safeParse(body);
      if (!parsed.success) return badRequest('Actualización comercial inválida.');
      if (parsed.data.affiliate_reference !== undefined || parsed.data.commission_cents !== undefined) {
        await requireStaff(['owner', 'manager']);
      } else {
        await requireStaff(['owner', 'manager', 'dispatcher']);
      }
      return NextResponse.json(await updateCommerceIntent(id, parsed.data as {
        status?: IntentStatus;
        affiliate_reference?: string | null;
        commission_cents?: number | null;
      }));
    }
    if (resource === 'staff') {
      await requireStaff(['owner'], { requireMfa: true });
      const parsed = z.object({
        role: z.enum(['owner', 'manager', 'dispatcher', 'crew']).optional(),
        is_active: z.boolean().optional(),
        display_name: z.string().trim().min(1).max(120).optional(),
      }).safeParse(body);
      if (!parsed.success) return badRequest('Perfil inválido.');
      return NextResponse.json(await updateStaffProfile(id, parsed.data as { role?: StaffRole; is_active?: boolean; display_name?: string }));
    }
    return badRequest('Recurso CRM no válido.');
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ resource: string; id: string }> }) {
  try {
    requireSameOrigin(request);
    const limited = await rateLimit(request, 'crm-write', 30, 15 * 60_000);
    if (limited) return limited;
    const { resource, id } = await context.params;
    await requireStaff(['owner', 'manager']);
    if (resource === 'clients') await archiveClient(id);
    else if (resource === 'products') await archiveProduct(id);
    else if (resource === 'offers') await archiveOffer(id);
    else return badRequest('Este recurso no se puede archivar.');
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return errorResponse(error);
  }
}
