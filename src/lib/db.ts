import { insforge } from './insforge';

// --- Types ---

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
  status: 'Active' | 'Pending' | 'Paused' | 'Cancelled';
  mrr: number;
  next_billing_date: string | null;
  started_at: string;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  // Joins
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
  cost_price: number | null;
  sale_type: 'own_stock' | 'amazon_affiliate' | 'whatsapp_concierge';
  amazon_affiliate_url: string | null;
  amazon_asin: string | null;
  stock_quantity: number;
  low_stock_threshold: number;
  category: string | null;
  benefit_label: string | null;
  accent_gradient: string | null;
  specs: { label: string; value: string }[];
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface KPISnapshot {
  id: string;
  metric_name: string;
  metric_value: number;
  previous_value: number | null;
  snapshot_date: string;
  created_at: string;
}

// --- Database Operations ---

export const db = {
  // Clients
  clients: {
    async getAll() {
      const { data, error } = await insforge.database
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(300);
      return { data: data as Client[], error };
    },
    async create(client: Partial<Client>) {
      const { data, error } = await insforge.database
        .from('clients')
        .insert([client])
        .select().maybeSingle();
      return { data: data as Client, error };
    },
    async update(id: string, updates: Partial<Client>) {
      const { data, error } = await insforge.database
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select().maybeSingle();
      return { data: data as Client, error };
    },
    async delete(id: string) {
      const { error } = await insforge.database
        .from('clients')
        .delete()
        .eq('id', id);
      return { error };
    }
  },

  // Subscriptions
  subscriptions: {
    async getAll() {
      const { data, error } = await insforge.database
        .from('subscriptions')
        .select('*, client:clients(*), tier:subscription_tiers(*)')
        .order('created_at', { ascending: false })
        .limit(300);
      return { data: data as Subscription[], error };
    },
    async create(subscription: Partial<Subscription>) {
      const { data, error } = await insforge.database
        .from('subscriptions')
        .insert([subscription])
        .select().maybeSingle();
      return { data: data as Subscription, error };
    },
    async update(id: string, updates: Partial<Subscription>) {
      const { data, error } = await insforge.database
        .from('subscriptions')
        .update(updates)
        .eq('id', id)
        .select().maybeSingle();
      return { data: data as Subscription, error };
    }
  },

  // Offers
  offers: {
    async getAll() {
      const { data, error } = await insforge.database
        .from('offers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(300);
      return { data: data as Offer[], error };
    },
    async create(offer: Partial<Offer>) {
      const { data, error } = await insforge.database
        .from('offers')
        .insert([offer])
        .select().maybeSingle();
      return { data: data as Offer, error };
    },
    async update(id: string, updates: Partial<Offer>) {
      const { data, error } = await insforge.database
        .from('offers')
        .update(updates)
        .eq('id', id)
        .select().maybeSingle();
      return { data: data as Offer, error };
    },
    async delete(id: string) {
      const { error } = await insforge.database
        .from('offers')
        .delete()
        .eq('id', id);
      return { error };
    }
  },

  // Products
  products: {
    async getAll() {
      const { data, error } = await insforge.database
        .from('products')
        .select('*')
        .order('sort_order', { ascending: true })
        .limit(300);
      return { data: data as Product[], error };
    },
    async getBySlug(slug: string) {
      const { data, error } = await insforge.database
        .from('products')
        .select('*')
        .eq('slug', slug)
        .single();
      return { data: data as Product, error };
    },
    async create(product: Partial<Product>) {
      const { data, error } = await insforge.database
        .from('products')
        .insert([product])
        .select().maybeSingle();
      return { data: data as Product, error };
    },
    async update(id: string, updates: Partial<Product>) {
      const { data, error } = await insforge.database
        .from('products')
        .update(updates)
        .eq('id', id)
        .select().maybeSingle();
      return { data: data as Product, error };
    },
    async delete(id: string) {
      const { error } = await insforge.database
        .from('products')
        .delete()
        .eq('id', id);
      return { error };
    },
    async getFeatured() {
      const { data, error } = await insforge.database
        .from('products')
        .select('*')
        .eq('is_featured', true)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .limit(4);
      return { data: data as Product[], error };
    },
    async getRelated(categoryId: string | null, currentId: string) {
      let query = insforge.database
        .from('products')
        .select('*')
        .eq('is_active', true)
        .neq('id', currentId);
        
      if (categoryId) {
        query = query.eq('category', categoryId);
      }
      
      const { data, error } = await query.limit(3);
      return { data: data as Product[], error };
    },
    async toggleFeatured(id: string, is_featured: boolean) {
      const { data, error } = await insforge.database
        .from('products')
        .update({ is_featured })
        .eq('id', id)
        .select().maybeSingle();
      return { data: data as Product, error };
    },
    async addImage(product_id: string, image_url: string) {
      const { data, error } = await insforge.database
        .from('product_images')
        .insert([{ product_id, image_url, is_primary: true }])
        .select();
      return { data: data?.[0], error };
    }
  },

  // Orders
  orders: {
    async getAll() {
      const { data, error } = await insforge.database
        .from('orders')
        .select('*, client:clients(*)')
        .order('created_at', { ascending: false })
        .limit(300);
      return { data: data as unknown[], error };
    },
    async create(order: Record<string, unknown>, items: Record<string, unknown>[]) {
      // Create order first
      const { data: orderData, error: orderError } = await insforge.database
        .from('orders')
        .insert([order])
        .select();
      
      const typedOrderData = orderData as Array<{ id: string }> | null;
      if (orderError || !typedOrderData?.[0]?.id) return { error: orderError };

      // Create items with the new order ID
      const orderId = typedOrderData[0].id;
      const itemsWithId = items.map(item => ({ ...item, order_id: orderId }));
      const { error: itemsError } = await insforge.database
        .from('order_items')
        .insert(itemsWithId);

      return { data: typedOrderData[0], error: itemsError };
    },
    async updateStatus(id: string, status: string) {
      const { data, error } = await insforge.database
        .from('orders')
        .update({ status })
        .eq('id', id)
        .select();
      return { data, error };
    }
  },

  // Dashboard / KPIs
  dashboard: {
    async getLatestKPIs() {
      const { data, error } = await insforge.database
        .from('kpi_snapshots')
        .select('*')
        .order('snapshot_date', { ascending: false })
        .limit(10); // Get latest snapshots
      return { data: data as KPISnapshot[], error };
    },
    async getRecentActivity() {
      // Combine recent subscriptions and orders (simulated activity feed)
      const { data: subs } = await insforge.database
        .from('subscriptions')
        .select('*, client:clients(name)')
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: orders } = await insforge.database
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      return {
        subscriptions: subs || [],
        orders: orders || []
      };
    }
  }
};
