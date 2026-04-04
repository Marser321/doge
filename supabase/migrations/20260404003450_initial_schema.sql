-- Enable PostGIS for geospatial queries if available, but for now we'll store lat/lng as numeric.
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Subscription Tiers
CREATE TABLE public.subscription_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  billing_frequency VARCHAR NOT NULL, -- e.g., 'monthly', 'biweekly', 'weekly'
  base_price NUMERIC(10, 2) NOT NULL,
  features JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initial subscription tiers
INSERT INTO public.subscription_tiers (name, billing_frequency, base_price, features)
VALUES 
  ('Bronce', 'monthly', 150.00, '{"price_lock": true, "cancel_fee_waived": true, "annual_deep_clean": true}'),
  ('Plata', 'biweekly', 250.00, '{"price_lock": true, "cancel_fee_waived": true, "annual_deep_clean": true, "free_window_clean": true, "priority_waitlist": true}'),
  ('Oro', 'weekly', 450.00, '{"price_lock": true, "cancel_fee_waived": true, "annual_deep_clean": true, "free_window_clean": true, "absolute_priority": true}');

-- 2. Clients
CREATE TABLE public.clients (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  phone VARCHAR,
  loyalty_points INTEGER DEFAULT 0,
  subscription_id UUID REFERENCES public.subscription_tiers(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Properties
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  property_type VARCHAR NOT NULL, -- 'house', 'apartment', 'commercial'
  size_sqm NUMERIC(10, 2) NOT NULL,
  rooms INTEGER NOT NULL DEFAULT 1,
  bathrooms INTEGER NOT NULL DEFAULT 1,
  lat NUMERIC(10, 7), -- Latitude for dispatch algorithm
  lng NUMERIC(10, 7), -- Longitude for dispatch algorithm
  access_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Services
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  category VARCHAR NOT NULL,
  pricing_model VARCHAR NOT NULL, -- 'hourly', 'flat_rate', 'sqm'
  base_rate NUMERIC(10, 2) NOT NULL,
  duration_estimated_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Jobs (Bookings)
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id),
  service_id UUID NOT NULL REFERENCES public.services(id),
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'pendente', -- 'pendente', 'asignado', 'en_proceso', 'finalizado'
  total_price NUMERIC(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Employees (CrewPulse)
CREATE TABLE public.employees (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR NOT NULL,
  phone VARCHAR,
  role VARCHAR NOT NULL DEFAULT 'operario', -- 'operario', 'supervisor', 'admin'
  status VARCHAR NOT NULL DEFAULT 'activo', -- 'activo', 'inactivo'
  skills JSONB DEFAULT '[]'::jsonb, -- e.g., ['windows', 'deep_clean', 'mold_removal']
  capacity_size INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Shifts
CREATE TABLE public.shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  shift_start TIMESTAMPTZ NOT NULL,
  shift_end TIMESTAMPTZ NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'agendado', -- 'agendado', 'en_curso', 'completado', 'ausencia'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Job Checklists (Proof of Service)
CREATE TABLE public.job_checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  task VARCHAR NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  photo_url VARCHAR, -- URL to Supabase Storage
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Affiliate Products
CREATE TABLE public.affiliate_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  amazon_url VARCHAR NOT NULL,
  category VARCHAR NOT NULL,
  image_url VARCHAR,
  commission_rate NUMERIC(5, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Click Tracking
CREATE TABLE public.click_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.affiliate_products(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  clicked_at TIMESTAMPTZ DEFAULT NOW(),
  context VARCHAR NOT NULL -- e.g., 'post_reserva', 'blog'
);

-- Add some basic Row Level Security (RLS) policies later.
-- For now, allow auth anon and authenticated to do everything for rapid MVP prototyping locally.
