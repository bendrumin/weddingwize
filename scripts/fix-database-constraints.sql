-- Fix database constraints for scraper
-- Run this in your Supabase SQL editor

-- Add unique constraint to vendors table (using a simpler approach)
ALTER TABLE public.vendors 
ADD CONSTRAINT vendors_unique_name_category 
UNIQUE (name, category);

-- Add unique constraint to vendor_matches table  
ALTER TABLE public.vendor_matches 
ADD CONSTRAINT vendor_matches_unique_user_vendor 
UNIQUE (user_id, vendor_id);

-- Verify constraints were added
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.vendors'::regclass 
   OR conrelid = 'public.vendor_matches'::regclass
ORDER BY conname;
