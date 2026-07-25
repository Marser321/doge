export type CrmResource = 'clients' | 'subscriptions' | 'offers' | 'products';

const fields: Record<CrmResource, readonly string[]> = {
  clients: ['name', 'company', 'email', 'phone', 'address', 'status', 'lifetime_value', 'notes'],
  subscriptions: ['client_id', 'property_id', 'tier_id', 'service_id', 'status', 'mrr', 'preferred_weekday', 'next_billing_date', 'started_at', 'cancelled_at'],
  offers: ['title', 'code', 'discount_percent', 'discount_type', 'discount_amount', 'target_audience', 'max_uses', 'status', 'expires_at', 'applies_to'],
  products: ['name', 'slug', 'brand', 'tagline', 'description', 'detailed_description', 'price', 'compare_at_price', 'cost_price', 'sale_type', 'amazon_affiliate_url', 'amazon_asin', 'stock_quantity', 'low_stock_threshold', 'category', 'benefit_label', 'accent_gradient', 'specs', 'is_active', 'is_featured', 'sort_order'],
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function sanitizeCrmPayload(resource: CrmResource, payload: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(payload).filter(([key]) => fields[resource].includes(key)));
}

export function validateCrmPayload(resource: CrmResource, payload: Record<string, unknown>, mode: 'create' | 'update') {
  if (Object.keys(payload).length === 0) return 'No hay campos permitidos para actualizar.';
  const text = (key: string) => typeof payload[key] === 'string' ? payload[key].trim() : '';
  const number = (key: string) => typeof payload[key] === 'number' && Number.isFinite(payload[key]);

  if (resource === 'clients') {
    if (mode === 'create' && !text('name')) return 'El nombre del cliente es obligatorio.';
    if (payload.email !== undefined && text('email') && !emailPattern.test(text('email'))) return 'El email del cliente no es válido.';
    if (payload.status !== undefined && !['VIP', 'Corporate', 'Standard'].includes(text('status'))) return 'El estado del cliente no es válido.';
  }
  if (resource === 'subscriptions') {
    if (mode === 'create' && (!text('client_id') || !text('property_id') || !text('tier_id') || !text('service_id'))) {
      return 'La suscripción requiere cliente, propiedad, plan y servicio.';
    }
    if (payload.mrr !== undefined && (!number('mrr') || (payload.mrr as number) < 0)) return 'El MRR debe ser un importe válido.';
    if (payload.preferred_weekday !== undefined && (!number('preferred_weekday') || !Number.isInteger(payload.preferred_weekday as number) || (payload.preferred_weekday as number) < 0 || (payload.preferred_weekday as number) > 6)) return 'El día preferido no es válido.';
    if (payload.status !== undefined && !['Active', 'Pending', 'Paused', 'Cancelled'].includes(text('status'))) return 'El estado de suscripción no es válido.';
  }
  if (resource === 'offers') {
    if (mode === 'create' && (!text('title') || !text('code'))) return 'La oferta requiere título y código.';
    if (text('discount_type') === 'percent' && (!number('discount_percent') || (payload.discount_percent as number) <= 0 || (payload.discount_percent as number) > 100)) return 'El descuento porcentual debe estar entre 0 y 100.';
    if (text('discount_type') === 'fixed_amount' && (!number('discount_amount') || (payload.discount_amount as number) <= 0)) return 'El descuento fijo debe ser un importe válido.';
  }
  if (resource === 'products') {
    if (mode === 'create' && (!text('name') || !/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/i.test(text('slug')))) return 'El producto requiere nombre y un slug válido.';
    if (payload.price !== undefined && (!number('price') || (payload.price as number) < 0)) return 'El precio debe ser válido.';
    if (payload.stock_quantity !== undefined && (!number('stock_quantity') || !Number.isInteger(payload.stock_quantity as number) || (payload.stock_quantity as number) < 0)) return 'El stock debe ser un entero positivo o cero.';
    if (payload.sale_type !== undefined && !['own_stock', 'amazon_affiliate', 'whatsapp_concierge'].includes(text('sale_type'))) return 'El tipo de venta no es válido.';
    if (text('sale_type') === 'amazon_affiliate' && !text('amazon_affiliate_url')) return 'El producto afiliado requiere una URL.';
    if (payload.specs !== undefined && !Array.isArray(payload.specs)) return 'Las especificaciones deben ser una lista.';
  }
  return null;
}
