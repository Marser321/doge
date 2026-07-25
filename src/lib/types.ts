export type StaffRole = 'owner' | 'manager' | 'dispatcher' | 'crew';
export type RequestStatus = 'new' | 'reviewing' | 'quoted' | 'approved' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'declined' | 'expired';
export type AppointmentStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type OrderStatus = 'draft' | 'confirmed' | 'fulfilled' | 'cancelled' | 'refunded';
export type IntentStatus = 'new' | 'contacted' | 'converted' | 'lost';

export interface Client {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  status: 'VIP' | 'Corporate' | 'Standard';
  lifetime_value: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  archived_at?: string | null;
}

export interface ClientDetail {
  client: Client;
  properties: Array<Record<string, unknown>>;
  requests: ServiceRequest[];
  orders: Array<Record<string, unknown>>;
  subscriptions: Subscription[];
  commerce_intents: CommerceIntent[];
}

export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  frequency: string;
  features: string[];
  is_active: boolean;
  created_at: string;
}

export interface Subscription {
  id: string;
  client_id: string | null;
  tier_id: string | null;
  property_id?: string | null;
  preferred_weekday?: number | null;
  status: 'Active' | 'Pending' | 'Paused' | 'Cancelled';
  mrr: number;
  next_billing_date: string | null;
  started_at: string;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  client?: Client;
  tier?: SubscriptionTier;
}

export interface Offer {
  id: string;
  title: string;
  code: string;
  discount_percent: number | null;
  discount_type: 'percent' | 'fixed_amount';
  discount_amount: number;
  target_audience: string;
  usage_count: number;
  max_uses: number | null;
  status: 'Active' | 'Inactive';
  expires_at: string | null;
  applies_to: 'services' | 'products' | 'both';
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  tagline: string | null;
  description: string | null;
  detailed_description: string | null;
  price: number;
  compare_at_price: number | null;
  cost_price?: number | null;
  sale_type: 'own_stock' | 'amazon_affiliate' | 'whatsapp_concierge';
  amazon_affiliate_url: string | null;
  amazon_asin?: string | null;
  stock_quantity: number;
  available: boolean;
  low_stock_threshold: number;
  category: string | null;
  benefit_label: string | null;
  accent_gradient: string | null;
  specs: { label: string; value: string }[];
  product_images?: Array<{ id?: string; image_url: string; alt_text?: string | null; is_primary?: boolean }>;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ServiceRequest {
  id: string;
  reference_code: string;
  service_name_snapshot: string;
  contact_name: string;
  contact_email: string | null;
  contact_phone: string | null;
  status: RequestStatus;
  source: 'website' | 'admin' | 'subscription' | 'commerce';
  preferred_date: string | null;
  notes: string | null;
  created_at: string;
  client?: Pick<Client, 'id' | 'name' | 'email' | 'phone'>;
  property?: {
    id: string;
    address: string;
    city: string;
    property_type: string;
  };
  appointments?: Appointment[];
  quotes?: Quote[];
}

export interface Quote {
  id: string;
  quote_number: string;
  service_request_id: string;
  status: QuoteStatus;
  subtotal_cents: number;
  discount_cents: number;
  tax_cents: number;
  total_cents: number;
  expires_at: string | null;
  sent_at: string | null;
  decided_at: string | null;
  created_at: string;
  quote_items?: QuoteItem[];
}

export interface QuoteItem {
  id?: string;
  description: string;
  quantity: number;
  unit_price_cents: number;
  total_cents?: number;
  service_id?: string | null;
}

export interface Appointment {
  id: string;
  service_request_id: string;
  team_id: string;
  starts_at: string;
  ends_at: string;
  status: AppointmentStatus;
  notes: string | null;
  incident_notes?: string | null;
  service_request?: ServiceRequest;
  team?: Team;
  property?: { address: string; city: string };
}

export interface Team {
  id: string;
  name: string;
  capacity_size: number;
  is_active: boolean;
}

export interface InventoryRow {
  product_id: string;
  on_hand: number;
  updated_at: string;
  product?: Pick<Product, 'id' | 'name' | 'slug' | 'low_stock_threshold'>;
}

export interface CommerceIntent {
  id: string;
  product_id: string;
  channel: 'whatsapp' | 'affiliate';
  status: IntentStatus;
  contact_name: string | null;
  contact_email: string | null;
  affiliate_reference?: string | null;
  commission_cents?: number | null;
  created_at: string;
  product?: Pick<Product, 'id' | 'name' | 'slug'>;
}

export interface StaffProfile {
  id: string;
  email: string;
  display_name: string | null;
  phone: string | null;
  role: StaffRole;
  locale: 'es' | 'en';
  is_active: boolean;
  created_at: string;
}

export interface KPISnapshot {
  id: string;
  metric_name: string;
  metric_value: number;
  previous_value: number | null;
  snapshot_date: string;
  created_at: string;
}

export interface DashboardSummary {
  open_requests: number;
  today_appointments: number;
  active_subscriptions: number;
  low_stock_products: number;
  pending_intents: number;
  confirmed_revenue_cents: number;
  recent_requests: ServiceRequest[];
}

export interface CurrentStaffUser {
  id: string;
  email: string | null;
  role: StaffRole;
  display_name: string | null;
  locale: 'es' | 'en';
  aal: 'aal1' | 'aal2';
  needs_mfa: boolean;
}
