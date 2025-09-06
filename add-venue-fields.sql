-- Add enhanced venue fields to the vendors table
-- Run this in your Supabase SQL editor

-- Add capacity fields
ALTER TABLE public.vendors 
ADD COLUMN IF NOT EXISTS capacity_min INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS capacity_max INTEGER DEFAULT 0;

-- Add amenities field (array of strings)
ALTER TABLE public.vendors 
ADD COLUMN IF NOT EXISTS amenities TEXT[] DEFAULT '{}';

-- Add venue type field
ALTER TABLE public.vendors 
ADD COLUMN IF NOT EXISTS venue_type TEXT DEFAULT 'venue';

-- Add pricing description field (e.g., "$$ – Affordable")
ALTER TABLE public.vendors 
ADD COLUMN IF NOT EXISTS pricing_description TEXT;

-- Add capacity description field (e.g., "Up to 250 Guests")
ALTER TABLE public.vendors 
ADD COLUMN IF NOT EXISTS capacity_description TEXT;

-- Create indexes for the new fields
CREATE INDEX IF NOT EXISTS idx_vendors_capacity_min ON public.vendors (capacity_min);
CREATE INDEX IF NOT EXISTS idx_vendors_capacity_max ON public.vendors (capacity_max);
CREATE INDEX IF NOT EXISTS idx_vendors_venue_type ON public.vendors (venue_type);
CREATE INDEX IF NOT EXISTS idx_vendors_amenities ON public.vendors USING gin(amenities);

-- Update existing records to have default values
UPDATE public.vendors 
SET 
  capacity_min = 0,
  capacity_max = 0,
  amenities = '{}',
  venue_type = 'venue'
WHERE capacity_min IS NULL OR capacity_max IS NULL OR amenities IS NULL OR venue_type IS NULL;
