-- Add detailed venue fields for enhanced scraping data
-- Run this in your Supabase SQL editor

-- Add detailed description field
ALTER TABLE public.vendors 
ADD COLUMN IF NOT EXISTS detailed_description TEXT;

-- Add pricing details field
ALTER TABLE public.vendors 
ADD COLUMN IF NOT EXISTS pricing_details TEXT;

-- Add capacity details field
ALTER TABLE public.vendors 
ADD COLUMN IF NOT EXISTS capacity_details TEXT;

-- Add reviews field (JSON array)
ALTER TABLE public.vendors 
ADD COLUMN IF NOT EXISTS reviews JSONB DEFAULT '[]';

-- Add enhanced contact fields
ALTER TABLE public.vendors 
ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE public.vendors 
ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE public.vendors 
ADD COLUMN IF NOT EXISTS contact_website TEXT;

-- Create indexes for the new fields
CREATE INDEX IF NOT EXISTS idx_vendors_detailed_description ON public.vendors USING gin(to_tsvector('english', detailed_description));
CREATE INDEX IF NOT EXISTS idx_vendors_reviews ON public.vendors USING gin(reviews);

-- Update existing records to have default values
UPDATE public.vendors 
SET 
  detailed_description = description,
  reviews = '[]'
WHERE detailed_description IS NULL OR reviews IS NULL;
