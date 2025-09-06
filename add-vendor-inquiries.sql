-- Add vendor inquiries table to track customer inquiries
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS public.vendor_inquiries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id uuid NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  wedding_date date,
  guest_count integer,
  budget integer,
  message text NOT NULL,
  inquiry_type text DEFAULT 'general' CHECK (inquiry_type IN ('general', 'pricing', 'availability', 'booking')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'quoted', 'booked', 'declined')),
  vendor_response text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_vendor_inquiries_vendor_id ON public.vendor_inquiries (vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_inquiries_status ON public.vendor_inquiries (status);
CREATE INDEX IF NOT EXISTS idx_vendor_inquiries_created_at ON public.vendor_inquiries (created_at DESC);

-- Add RLS policy
ALTER TABLE public.vendor_inquiries ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage inquiries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'vendor_inquiries' 
    AND policyname = 'Service role can manage inquiries'
  ) THEN
    CREATE POLICY "Service role can manage inquiries" ON public.vendor_inquiries
      FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;

-- Allow vendors to view their own inquiries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'vendor_inquiries' 
    AND policyname = 'Vendors can view their inquiries'
  ) THEN
    CREATE POLICY "Vendors can view their inquiries" ON public.vendor_inquiries
      FOR SELECT USING (
        vendor_id IN (
          SELECT id FROM public.vendors 
          WHERE id = vendor_id
        )
      );
  END IF;
END $$;
