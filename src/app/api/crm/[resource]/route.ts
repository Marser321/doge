import { NextResponse } from 'next/server';
import { z } from 'zod';

import { requireStaff } from '@/lib/server/auth';
import { dispatchEmailOutbox } from '@/lib/server/email';
import { badRequest, errorResponse, rateLimit, requireSameOrigin, runIdempotentJson } from '@/lib/server/http';
import { sanitizeCrmPayload, validateCrmPayload, type CrmResource } from '@/lib/crm-validation';
import {
  adjustInventory,
  createClient,
  createShift,
  createTeam,
  createOffer,
  createOrder,
  createProduct,
  createQuote,
  createQuoteToken,
  createSubscription,
  dashboard,
  listAppointments,
  listAuditEvents,
  listClients,
  listCommerceIntents,
  listInventory,
  listOffers,
  listOrders,
  listProperties,
  listProducts,
  listServiceCatalog,
  listServiceRequests,
  listStaff,
  listSubscriptionPlans,
  listSubscriptions,
  listTeams,
  scheduleAppointment,
  createProperty,
  assignTeamMember,
  listShifts,
} from '@/lib/server/repository';

export const runtime = 'nodejs';

const roles = {
  clients: ['owner', 'manager', 'dispatcher'],
  subscriptions: ['owner', 'manager'],
  offers: ['owner', 'manager', 'dispatcher'],
  products: ['owner', 'manager', 'dispatcher'],
  orders: ['owner', 'manager', 'dispatcher'],
  'service-requests': ['owner', 'manager', 'dispatcher'],
  appointments: ['owner', 'manager', 'dispatcher'],
  teams: ['owner', 'manager', 'dispatcher', 'crew'],
  inventory: ['owner', 'manager', 'dispatcher'],
  intents: ['owner', 'manager', 'dispatcher'],
  staff: ['owner', 'manager'],
  audit: ['owner', 'manager'],
  dashboard: ['owner', 'manager', 'dispatcher'],
  properties: ['owner', 'manager', 'dispatcher'],
  'subscription-plans': ['owner', 'manager'],
  services: ['owner', 'manager', 'dispatcher'],
  shifts: ['owner', 'manager', 'dispatcher'],
  'team-members': ['owner', 'manager'],
} as const;

type Resource = keyof typeof roles;

function isResource(value: string): value is Resource {
  return value in roles;
}

const orderSchema = z.object({
  order: z.record(z.string(), z.unknown()),
  items: z.array(z.object({
    product_id: z.string().uuid(),
    quantity: z.number().int().positive(),
  })).min(1),
});

const appointmentSchema = z.object({
  requestId: z.string().uuid(),
  teamId: z.string().uuid(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  notes: z.string().max(2000).optional(),
});

const quoteSchema = z.object({
  requestId: z.string().uuid(),
  items: z.array(z.object({
    service_id: z.string().uuid().nullable().optional(),
    description: z.string().trim().min(1).max(240),
    quantity: z.number().positive(),
    unit_price_cents: z.number().int().nonnegative(),
    sort_order: z.number().int().optional(),
  })).min(1),
  discountCents: z.number().int().nonnegative().optional(),
  taxBasisPoints: z.number().int().min(0).max(10000).optional(),
  notes: z.string().max(2000).optional(),
});

export async function GET(request: Request, context: { params: Promise<{ resource: string }> }) {
  try {
    const limited = await rateLimit(request, 'crm-read', 180, 15 * 60_000);
    if (limited) return limited;
    const { resource } = await context.params;
    if (!isResource(resource)) return badRequest('Recurso CRM no válido.');
    await requireStaff([...roles[resource]]);

    const data = resource === 'dashboard' ? await dashboard()
      : resource === 'clients' ? await listClients()
        : resource === 'properties' ? await listProperties(new URL(request.url).searchParams.get('clientId') || undefined)
          : resource === 'subscription-plans' ? await listSubscriptionPlans()
            : resource === 'services' ? await listServiceCatalog()
              : resource === 'shifts' ? await listShifts()
        : resource === 'subscriptions' ? await listSubscriptions()
          : resource === 'offers' ? await listOffers()
            : resource === 'products' ? await listProducts({ staff: true })
              : resource === 'orders' ? await listOrders()
                : resource === 'service-requests' ? await listServiceRequests()
                  : resource === 'appointments' ? await listAppointments()
                    : resource === 'teams' ? await listTeams()
                      : resource === 'inventory' ? await listInventory()
                        : resource === 'intents' ? await listCommerceIntents()
                          : resource === 'staff' ? await listStaff()
                            : await listAuditEvents();
    return NextResponse.json(data, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request, context: { params: Promise<{ resource: string }> }) {
  try {
    requireSameOrigin(request);
    const limited = await rateLimit(request, 'crm-write', 60, 15 * 60_000);
    if (limited) return limited;
    const { resource } = await context.params;
    if (!isResource(resource)) return badRequest('Recurso CRM no válido.');
    const identity = await requireStaff([...roles[resource]]);
    const body = await request.json();
    const idempotent = <T>(scope: string, operation: () => Promise<T>, status = 201) =>
      runIdempotentJson(request, `crm:${scope}`, identity.id, JSON.stringify(body), operation, status);

    if (resource === 'clients') {
      const payload = sanitizeCrmPayload('clients', body);
      const validation = validateCrmPayload('clients', payload, 'create');
      if (validation) return badRequest(validation);
      return idempotent('clients:create', () => createClient(payload));
    }
    if (resource === 'properties') {
      const parsed = z.object({
        client_id: z.string().uuid(),
        label: z.string().max(120).optional(),
        address: z.string().trim().min(4).max(240),
        city: z.string().trim().min(2).max(120),
        region: z.string().trim().max(40).optional(),
        postal_code: z.string().trim().max(20).optional(),
        property_type: z.string().trim().min(2).max(80),
        square_feet: z.number().int().positive().optional(),
        bedrooms: z.number().int().nonnegative().optional(),
        bathrooms: z.number().nonnegative().optional(),
        access_notes: z.string().max(1000).optional(),
      }).safeParse(body);
      if (!parsed.success) return badRequest(parsed.error.issues[0]?.message || 'Propiedad inválida.');
      return idempotent('properties:create', () => createProperty(parsed.data));
    }
    if (resource === 'teams') {
      const parsed = z.object({ name: z.string().trim().min(2).max(120), capacity_size: z.number().int().positive().max(20) }).safeParse(body);
      if (!parsed.success) return badRequest('Equipo inválido.');
      await requireStaff(['owner', 'manager']);
      return idempotent('teams:create', () => createTeam(parsed.data));
    }
    if (resource === 'team-members') {
      const parsed = z.object({ team_id: z.string().uuid(), profile_id: z.string().uuid(), starts_on: z.string().date() }).safeParse(body);
      if (!parsed.success) return badRequest('Asignación inválida.');
      return idempotent('team-members:create', () => assignTeamMember(parsed.data));
    }
    if (resource === 'shifts') {
      const parsed = z.object({
        profile_id: z.string().uuid(),
        starts_at: z.string().datetime(),
        ends_at: z.string().datetime(),
        notes: z.string().max(500).optional(),
      }).refine((value) => new Date(value.ends_at) > new Date(value.starts_at)).safeParse(body);
      if (!parsed.success) return badRequest('Turno inválido.');
      return idempotent('shifts:create', () => createShift(parsed.data));
    }
    if (['subscriptions', 'offers', 'products'].includes(resource)) {
      const crmResource = resource as CrmResource;
      const payload = sanitizeCrmPayload(crmResource, body);
      const validation = validateCrmPayload(crmResource, payload, 'create');
      if (validation) return badRequest(validation);
      if (resource === 'subscriptions') return idempotent('subscriptions:create', () => createSubscription(payload));
      if (resource === 'offers') {
        await requireStaff(['owner', 'manager']);
        return idempotent('offers:create', () => createOffer(payload));
      }
      await requireStaff(['owner', 'manager']);
      return idempotent('products:create', () => createProduct(payload));
    }
    if (resource === 'orders') {
      const parsed = orderSchema.safeParse(body);
      if (!parsed.success) return badRequest(parsed.error.issues[0]?.message || 'Orden inválida.');
      return idempotent('orders:create', () => createOrder(parsed.data.order, parsed.data.items));
    }
    if (resource === 'appointments') {
      const parsed = appointmentSchema.safeParse(body);
      if (!parsed.success) return badRequest(parsed.error.issues[0]?.message || 'Cita inválida.');
      return idempotent('appointments:create', () => scheduleAppointment(parsed.data));
    }
    if (resource === 'service-requests' && body?.action === 'quote') {
      const parsed = quoteSchema.safeParse(body);
      if (!parsed.success) return badRequest(parsed.error.issues[0]?.message || 'Cotización inválida.');
      return idempotent('quotes:create', async () => {
        const { token, hash } = createQuoteToken();
        const approvalUrl = `${process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin}/quote/${token}`;
        const quote = await createQuote({ ...parsed.data, tokenHash: hash, approvalUrl });
        await dispatchEmailOutbox(1).catch(() => undefined);
        return { quote, approval_url: approvalUrl };
      });
    }
    if (resource === 'inventory') {
      const parsed = z.object({
        productId: z.string().uuid(),
        delta: z.number().int().refine((value) => value !== 0),
        movementType: z.enum(['receipt', 'adjustment', 'return']),
        note: z.string().trim().min(3).max(500),
      }).safeParse(body);
      if (!parsed.success) return badRequest(parsed.error.issues[0]?.message || 'Ajuste inválido.');
      await requireStaff(['owner', 'manager'], { requireMfa: true });
      return idempotent(
        'inventory:adjust',
        () => adjustInventory(parsed.data.productId, parsed.data.delta, parsed.data.movementType, parsed.data.note),
      );
    }
    return badRequest('Esta colección es de solo lectura.');
  } catch (error) {
    return errorResponse(error);
  }
}
