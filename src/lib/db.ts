/**
 * Client-side compatibility facade. It deliberately uses our Next.js API
 * rather than a browser database client, so private data never reaches the
 * browser by direct database access.
 */
'use client';

import { apiRequest, resultOf } from './api-client';
import type { Appointment, Client, ClientDetail, CommerceIntent, DashboardSummary, InventoryRow, Offer, Product, ServiceRequest, StaffProfile, Subscription, Team } from './types';

export type { Client, Offer, Product, Subscription } from './types';

const admin = <T>(path: string, init?: Parameters<typeof apiRequest<T>>[1]) =>
  apiRequest<T>(path, { ...init, auth: 'required' });

export const db = {
  clients: {
    getAll: () => resultOf(() => admin<Client[]>('/api/crm/clients')),
    getById: (id: string) => resultOf(() => admin<ClientDetail>(`/api/crm/clients/${id}`)),
    create: (payload: Partial<Client>) => resultOf(() => admin<Client>('/api/crm/clients', { method: 'POST', body: payload })),
    update: (id: string, payload: Partial<Client>) => resultOf(() => admin<Client>(`/api/crm/clients/${id}`, { method: 'PATCH', body: payload })),
    delete: (id: string) => resultOf(() => admin<void>(`/api/crm/clients/${id}`, { method: 'DELETE' })),
  },
  subscriptions: {
    getAll: () => resultOf(() => admin<Subscription[]>('/api/crm/subscriptions')),
    create: (payload: Partial<Subscription> & Record<string, unknown>) => resultOf(() => admin<Subscription>('/api/crm/subscriptions', { method: 'POST', body: payload })),
    update: (id: string, payload: Partial<Subscription>) => resultOf(() => admin<Subscription>(`/api/crm/subscriptions/${id}`, { method: 'PATCH', body: payload })),
  },
  properties: {
    getAll: (clientId?: string) => resultOf(() => admin<Array<Record<string, unknown>>>(`/api/crm/properties${clientId ? `?clientId=${encodeURIComponent(clientId)}` : ''}`)),
    create: (payload: Record<string, unknown>) => resultOf(() => admin<Record<string, unknown>>('/api/crm/properties', { method: 'POST', body: payload })),
  },
  subscriptionPlans: {
    getAll: () => resultOf(() => admin<Array<Record<string, unknown>>>('/api/crm/subscription-plans')),
  },
  services: {
    getAll: () => resultOf(() => admin<Array<Record<string, unknown>>>('/api/crm/services')),
  },
  offers: {
    getAll: () => resultOf(() => admin<Offer[]>('/api/crm/offers')),
    create: (payload: Partial<Offer>) => resultOf(() => admin<Offer>('/api/crm/offers', { method: 'POST', body: payload })),
    update: (id: string, payload: Partial<Offer>) => resultOf(() => admin<Offer>(`/api/crm/offers/${id}`, { method: 'PATCH', body: payload })),
    delete: (id: string) => resultOf(() => admin<void>(`/api/crm/offers/${id}`, { method: 'DELETE' })),
  },
  products: {
    getAll: () => resultOf(() => admin<Product[]>('/api/crm/products')),
    getPublic: () => resultOf(() => apiRequest<Product[]>('/api/catalog/products')),
    getBySlug: (slug: string) => resultOf(() => apiRequest<Product>(`/api/catalog/products/${encodeURIComponent(slug)}`, { auth: 'optional' })),
    getFeatured: () => resultOf(() => apiRequest<Product[]>('/api/catalog/products?featured=true')),
    getRelated: (category: string | null, currentId: string) => resultOf(() => apiRequest<Product[]>(`/api/catalog/products?category=${encodeURIComponent(category ?? '')}&exclude=${encodeURIComponent(currentId)}`)),
    create: (payload: Partial<Product>) => resultOf(() => admin<Product>('/api/crm/products', { method: 'POST', body: payload })),
    update: (id: string, payload: Partial<Product>) => resultOf(() => admin<Product>(`/api/crm/products/${id}`, { method: 'PATCH', body: payload })),
    delete: (id: string) => resultOf(() => admin<void>(`/api/crm/products/${id}`, { method: 'DELETE' })),
    toggleFeatured: (id: string, is_featured: boolean) => resultOf(() => admin<Product>(`/api/crm/products/${id}`, { method: 'PATCH', body: { is_featured } })),
  },
  orders: {
    getAll: () => resultOf(() => admin<unknown[]>('/api/crm/orders')),
    create: (order: Record<string, unknown>, items: Record<string, unknown>[]) => resultOf(() => admin<Record<string, unknown>>('/api/crm/orders', { method: 'POST', body: { order, items } })),
    updateStatus: (id: string, status: string) => resultOf(() => admin<unknown>(`/api/crm/orders/${id}`, { method: 'PATCH', body: { status } })),
  },
  dashboard: {
    getSummary: () => resultOf(() => admin<DashboardSummary>('/api/crm/dashboard')),
  },
  requests: {
    getAll: () => resultOf(() => admin<ServiceRequest[]>('/api/crm/service-requests')),
    transition: (id: string, status: string, note?: string) => resultOf(() => admin<ServiceRequest>(`/api/crm/service-requests/${id}`, { method: 'PATCH', body: { status, note } })),
    quote: (payload: Record<string, unknown>) => resultOf(() => admin<{ quote: unknown; approval_url: string }>('/api/crm/service-requests', { method: 'POST', body: { ...payload, action: 'quote' } })),
  },
  appointments: {
    getAll: () => resultOf(() => admin<Appointment[]>('/api/crm/appointments')),
    create: (payload: Record<string, unknown>) => resultOf(() => admin<Appointment>('/api/crm/appointments', { method: 'POST', body: payload })),
    reschedule: (id: string, payload: Record<string, unknown>) => resultOf(() => admin<Appointment>(`/api/crm/appointments/${id}`, { method: 'PATCH', body: payload })),
  },
  teams: {
    getAll: () => resultOf(() => admin<Team[]>('/api/crm/teams')),
    create: (payload: Record<string, unknown>) => resultOf(() => admin<Team>('/api/crm/teams', { method: 'POST', body: payload })),
    assign: (payload: Record<string, unknown>) => resultOf(() => admin<Record<string, unknown>>('/api/crm/team-members', { method: 'POST', body: payload })),
  },
  shifts: {
    getAll: () => resultOf(() => admin<Array<Record<string, unknown>>>('/api/crm/shifts')),
    create: (payload: Record<string, unknown>) => resultOf(() => admin<Record<string, unknown>>('/api/crm/shifts', { method: 'POST', body: payload })),
  },
  inventory: {
    getAll: () => resultOf(() => admin<InventoryRow[]>('/api/crm/inventory')),
    adjust: (payload: Record<string, unknown>) => resultOf(() => admin<InventoryRow>('/api/crm/inventory', { method: 'POST', body: payload })),
  },
  intents: {
    getAll: () => resultOf(() => admin<CommerceIntent[]>('/api/crm/intents')),
    update: (id: string, payload: { status?: string; affiliate_reference?: string | null; commission_cents?: number | null }) => resultOf(() => admin<CommerceIntent>(`/api/crm/intents/${id}`, { method: 'PATCH', body: payload })),
  },
  staff: {
    getAll: () => resultOf(() => admin<StaffProfile[]>('/api/crm/staff')),
    invite: (payload: Record<string, unknown>) => resultOf(() => admin<StaffProfile>('/api/staff/invite', { method: 'POST', body: payload })),
    update: (id: string, payload: Record<string, unknown>) => resultOf(() => admin<StaffProfile>(`/api/crm/staff/${id}`, { method: 'PATCH', body: payload })),
  },
};
