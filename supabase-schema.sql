-- ==============================================================================
-- GALLANT LINE HAUL CORP — COMPLETE SUPABASE DATABASE & AUTHENTICATION SCHEMA
-- ==============================================================================
-- Run this script in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- It establishes all relational tables, Row Level Security (RLS) policies,
-- automatic user profile creation triggers, and indexes.
-- ==============================================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. USER PROFILES TABLE (Linked with Supabase Auth)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'client', 'driver')),
  full_name TEXT,
  company_name TEXT,
  phone TEXT,
  license_class TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. DRIVER ACCOUNTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.driver_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  license_class TEXT DEFAULT 'Class 1 / CDL-A',
  fast_card_number TEXT,
  medical_card_expiry DATE,
  assigned_truck TEXT DEFAULT 'Unit #GL-408',
  assigned_trailer TEXT DEFAULT '53R-912',
  current_dispatch TEXT,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'On Haul', 'Off Duty', 'Suspended')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. SHIPPER CLIENT ACCOUNTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.shipper_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  billing_address TEXT,
  payment_terms TEXT DEFAULT 'Net 30',
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Pending Approval', 'Inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. SHIPMENTS & LIVE DISPATCH TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.shipments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tracking_number TEXT NOT NULL UNIQUE,
  shipper_email TEXT NOT NULL,
  driver_email TEXT,
  origin_city TEXT NOT NULL,
  origin_state TEXT NOT NULL,
  destination_city TEXT NOT NULL,
  destination_state TEXT NOT NULL,
  equipment_type TEXT NOT NULL DEFAULT '53 Dry Van',
  commodity TEXT NOT NULL DEFAULT 'General Freight',
  weight_lbs INTEGER DEFAULT 42000,
  pallets INTEGER DEFAULT 24,
  -- Stage: 0 = Dispatched, 1 = In Transit, 2 = Customs / Border, 3 = Delivered
  stage INTEGER NOT NULL DEFAULT 0 CHECK (stage >= 0 AND stage <= 3),
  status TEXT NOT NULL DEFAULT 'Dispatched',
  eta TIMESTAMPTZ,
  bol_number TEXT,
  customs_entry_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. FREIGHT QUOTE SUBMISSIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quote_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ref_code TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  company TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  pickup TEXT NOT NULL,
  destination TEXT NOT NULL,
  equipment TEXT NOT NULL DEFAULT '53 Dry Van',
  shipping_date TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Quoted', 'Booked', 'Declined')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. PORTAL NOTIFICATIONS & BROADCASTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.portal_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'alert', 'success', 'dispatch')),
  target_role TEXT DEFAULT 'all' CHECK (target_role IN ('all', 'client', 'driver', 'admin')),
  recipient_email TEXT, -- Specific user email or NULL for broad audience
  read_by TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. PERFORMANCE INDEXES
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_shipments_shipper_email ON public.shipments(shipper_email);
CREATE INDEX IF NOT EXISTS idx_shipments_driver_email ON public.shipments(driver_email);
CREATE INDEX IF NOT EXISTS idx_shipments_tracking ON public.shipments(tracking_number);
CREATE INDEX IF NOT EXISTS idx_quotes_ref_code ON public.quote_submissions(ref_code);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.portal_notifications(recipient_email);

-- ------------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipper_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_notifications ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are readable by authenticated users" 
ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Driver Accounts Policies
CREATE POLICY "Drivers readable by authenticated users" 
ON public.driver_accounts FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins full management on drivers" 
ON public.driver_accounts FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Shipper Accounts Policies
CREATE POLICY "Shippers readable by authenticated users" 
ON public.shipper_accounts FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins full management on shippers" 
ON public.shipper_accounts FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Shipments Policies
CREATE POLICY "Users view shipments related to their email or if admin" 
ON public.shipments FOR SELECT TO authenticated 
USING (
  shipper_email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR
  driver_email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Drivers and Admins can update shipment status" 
ON public.shipments FOR UPDATE TO authenticated 
USING (
  driver_email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can insert and delete shipments" 
ON public.shipments FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Quotes Policies
CREATE POLICY "Anyone can insert quotes" 
ON public.quote_submissions FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can read quotes matching email or admin" 
ON public.quote_submissions FOR SELECT TO authenticated 
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Notifications Policies
CREATE POLICY "Users read global notifications or targeted to their email" 
ON public.portal_notifications FOR SELECT TO authenticated 
USING (
  recipient_email IS NULL OR
  recipient_email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users can update read_by status on notifications" 
ON public.portal_notifications FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Admins can create notifications" 
ON public.portal_notifications FOR INSERT TO authenticated 
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ------------------------------------------------------------------------------
-- 9. AUTOMATIC USER PROFILE TRIGGER
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, full_name, company_name)
  VALUES (
    NEW.id,
    NEW.email,
    CASE 
      WHEN NEW.email = 'info@gallant-corp.com' THEN 'admin'
      WHEN NEW.raw_user_meta_data->>'role' = 'driver' THEN 'driver'
      ELSE 'client'
    END,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'company_name'
  )
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 10. INITIAL SEED DATA (For Immediate Demonstration)
-- ------------------------------------------------------------------------------
INSERT INTO public.driver_accounts (full_name, email, phone, license_class, assigned_truck, assigned_trailer, status)
VALUES 
  ('Marcus Vance', 'marcus.vance@gallant-corp.com', '+1 (416) 555-0144', 'Class 1 / CDL-A', 'Unit #GL-408', '53R-912', 'Active'),
  ('Sarah Jenkins', 's.jenkins@gallant-corp.com', '+1 (905) 555-0182', 'Class 1 / CDL-A', 'Unit #GL-312', '53DV-401', 'On Haul')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.shipper_accounts (company_name, contact_name, email, phone, status)
VALUES 
  ('Apex Distribution LLC', 'Rachel Green', 'shipping@apexdist.com', '+1 (312) 555-8821', 'Active'),
  ('Nordic Cold Chain Solutions', 'Erik Lindqvist', 'logistics@nordiccold.ca', '+1 (514) 555-3920', 'Active')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.portal_notifications (title, message, type, target_role)
VALUES
  ('Cross-Border FAST Priority Cleared', 'All Great Lakes border crossings (Ambassador Bridge & Blue Water Bridge) are processing FAST-certified carriers under 12 minutes.', 'success', 'all'),
  ('Winter Weather Advisory: I-90 Corridor', 'Heavy lake-effect snow warning from Buffalo, NY to Erie, PA. Tire chains required for heavy commercial combination vehicles.', 'alert', 'driver')
ON CONFLICT DO NOTHING;
