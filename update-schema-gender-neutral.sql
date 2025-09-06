-- Update WeddingWise AI Schema to be Gender-Neutral
-- Run this script to update existing tables to use inclusive language

-- Update wedding_profiles table to use gender-neutral column names
ALTER TABLE public.wedding_profiles 
RENAME COLUMN bride_name TO partner1_name;

ALTER TABLE public.wedding_profiles 
RENAME COLUMN groom_name TO partner2_name;

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'wedding_profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;
