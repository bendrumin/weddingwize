-- Script to find and clean up duplicate venues
-- Run this before adding the unique constraint

-- 1. Find all duplicate venues
WITH duplicates AS (
  SELECT 
    name, 
    category, 
    COUNT(*) as count,
    ARRAY_AGG(id ORDER BY created_at DESC) as ids
  FROM vendors 
  WHERE category = 'venue'
  GROUP BY name, category 
  HAVING COUNT(*) > 1
)
SELECT 
  name,
  category,
  count,
  ids
FROM duplicates
ORDER BY count DESC;

-- 2. Keep the most recent version of each duplicate
-- (This will delete older duplicates, keeping the newest one)
WITH duplicates AS (
  SELECT 
    id,
    name,
    category,
    ROW_NUMBER() OVER (
      PARTITION BY name, category 
      ORDER BY created_at DESC, last_scraped DESC
    ) as rn
  FROM vendors 
  WHERE category = 'venue'
)
DELETE FROM vendors 
WHERE id IN (
  SELECT id 
  FROM duplicates 
  WHERE rn > 1
);

-- 3. Verify no duplicates remain
SELECT 
  name, 
  category, 
  COUNT(*) as count
FROM vendors 
WHERE category = 'venue'
GROUP BY name, category 
HAVING COUNT(*) > 1;
