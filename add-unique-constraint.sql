-- Add unique constraint to prevent duplicate venues
-- This ensures that the same venue name + category combination can't exist twice

-- First, let's check if there are any existing duplicates
SELECT name, category, COUNT(*) as count
FROM vendors 
WHERE category = 'venue'
GROUP BY name, category 
HAVING COUNT(*) > 1;

-- If there are duplicates, we need to clean them up first
-- (This would need to be run manually if duplicates exist)

-- Add unique constraint on name + category
-- This will prevent duplicate venues from being inserted
ALTER TABLE vendors 
ADD CONSTRAINT unique_venue_name_category 
UNIQUE (name, category);

-- Add index for better performance on lookups
CREATE INDEX IF NOT EXISTS idx_vendors_name_category 
ON vendors (name, category);

-- Add index for location filtering performance
CREATE INDEX IF NOT EXISTS idx_vendors_location_gin 
ON vendors USING GIN (location);

-- Add index for category filtering
CREATE INDEX IF NOT EXISTS idx_vendors_category 
ON vendors (category);

-- Add index for rating sorting
CREATE INDEX IF NOT EXISTS idx_vendors_rating 
ON vendors (rating DESC);
