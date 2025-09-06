-- Enhanced venue profile schema for comprehensive venue data
-- This script adds all the new fields from VenueProfileData interface

-- Add basic information fields
ALTER TABLE public.vendors
ADD COLUMN IF NOT EXISTS tagline TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS neighborhood TEXT,
ADD COLUMN IF NOT EXISTS languages JSONB DEFAULT '[]'::jsonb;

-- Add capacity information
ALTER TABLE public.vendors
ADD COLUMN IF NOT EXISTS guest_range TEXT,
ADD COLUMN IF NOT EXISTS max_capacity INTEGER,
ADD COLUMN IF NOT EXISTS capacity_description TEXT;

-- Add services information
ALTER TABLE public.vendors
ADD COLUMN IF NOT EXISTS ceremonies_and_receptions BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ceremony_types JSONB DEFAULT '[]'::jsonb;

-- Add contact & team information
ALTER TABLE public.vendors
ADD COLUMN IF NOT EXISTS team_name TEXT,
ADD COLUMN IF NOT EXISTS team_role TEXT,
ADD COLUMN IF NOT EXISTS response_time TEXT,
ADD COLUMN IF NOT EXISTS has_contact_form BOOLEAN DEFAULT false;

-- Add awards & recognition
ALTER TABLE public.vendors
ADD COLUMN IF NOT EXISTS award_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS award_type TEXT,
ADD COLUMN IF NOT EXISTS award_source TEXT;

-- Add enhanced pricing information
ALTER TABLE public.vendors
ADD COLUMN IF NOT EXISTS pricing_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS pricing_requires_contact BOOLEAN DEFAULT false;

-- Add amenities (boolean fields for each amenity)
ALTER TABLE public.vendors
ADD COLUMN IF NOT EXISTS ceremony_area BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS covered_outdoors_space BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS dressing_room BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS handicap_accessible BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS indoor_event_space BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS liability_insurance BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS outdoor_event_space BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS reception_area BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS wireless_internet BOOLEAN DEFAULT false;

-- Add venue settings & style
ALTER TABLE public.vendors
ADD COLUMN IF NOT EXISTS ballroom BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS garden BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS historic_venue BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS industrial_warehouse BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS trees BOOLEAN DEFAULT false;

-- Add service offerings
ALTER TABLE public.vendors
ADD COLUMN IF NOT EXISTS bar_and_drinks_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS bar_rental BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS cakes_and_desserts_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS cupcakes BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS other_desserts BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS food_and_catering_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS planning_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS se_habla_espanol BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS wedding_design BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS rentals_and_equipment_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS tents BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS service_staff_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS transportation_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS shuttle_service BOOLEAN DEFAULT false;

-- Add enhanced reviews information
ALTER TABLE public.vendors
ADD COLUMN IF NOT EXISTS rating_breakdown JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS ai_summary TEXT,
ADD COLUMN IF NOT EXISTS sort_options JSONB DEFAULT '[]'::jsonb;

-- Add individual reviews
ALTER TABLE public.vendors
ADD COLUMN IF NOT EXISTS individual_reviews JSONB DEFAULT '[]'::jsonb;

-- Add team information
ALTER TABLE public.vendors
ADD COLUMN IF NOT EXISTS team_description TEXT,
ADD COLUMN IF NOT EXISTS team_message TEXT;

-- Add media information
ALTER TABLE public.vendors
ADD COLUMN IF NOT EXISTS primary_image TEXT,
ADD COLUMN IF NOT EXISTS review_photos JSONB DEFAULT '[]'::jsonb;

-- Add metadata
ALTER TABLE public.vendors
ADD COLUMN IF NOT EXISTS source_url TEXT,
ADD COLUMN IF NOT EXISTS page_type TEXT DEFAULT 'venue_profile';

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_vendors_tagline ON public.vendors (tagline);
CREATE INDEX IF NOT EXISTS idx_vendors_address ON public.vendors (address);
CREATE INDEX IF NOT EXISTS idx_vendors_neighborhood ON public.vendors (neighborhood);
CREATE INDEX IF NOT EXISTS idx_vendors_max_capacity ON public.vendors (max_capacity);
CREATE INDEX IF NOT EXISTS idx_vendors_award_count ON public.vendors (award_count);
CREATE INDEX IF NOT EXISTS idx_vendors_amenities ON public.vendors (ceremony_area, outdoor_event_space, handicap_accessible);
CREATE INDEX IF NOT EXISTS idx_vendors_settings ON public.vendors (ballroom, garden, historic_venue);
CREATE INDEX IF NOT EXISTS idx_vendors_service_offerings ON public.vendors (bar_and_drinks_available, food_and_catering_available, planning_available);

-- Add comments for documentation
COMMENT ON COLUMN public.vendors.tagline IS 'Venue tagline or subtitle';
COMMENT ON COLUMN public.vendors.address IS 'Full venue address';
COMMENT ON COLUMN public.vendors.neighborhood IS 'Neighborhood or district';
COMMENT ON COLUMN public.vendors.languages IS 'Languages supported by venue';
COMMENT ON COLUMN public.vendors.guest_range IS 'Guest capacity range (e.g., "201 to 250 guests")';
COMMENT ON COLUMN public.vendors.max_capacity IS 'Maximum guest capacity';
COMMENT ON COLUMN public.vendors.capacity_description IS 'Capacity description text';
COMMENT ON COLUMN public.vendors.ceremonies_and_receptions IS 'Whether venue holds both ceremonies and receptions';
COMMENT ON COLUMN public.vendors.ceremony_types IS 'Types of ceremonies supported';
COMMENT ON COLUMN public.vendors.team_name IS 'Wedding team or coordinator name';
COMMENT ON COLUMN public.vendors.team_role IS 'Team member role';
COMMENT ON COLUMN public.vendors.response_time IS 'Typical response time';
COMMENT ON COLUMN public.vendors.has_contact_form IS 'Whether venue has contact form';
COMMENT ON COLUMN public.vendors.award_count IS 'Number of awards won';
COMMENT ON COLUMN public.vendors.award_type IS 'Type of awards (e.g., "AWARD WINNER (7X)")';
COMMENT ON COLUMN public.vendors.award_source IS 'Source of awards';
COMMENT ON COLUMN public.vendors.pricing_available IS 'Whether pricing details are available';
COMMENT ON COLUMN public.vendors.pricing_requires_contact IS 'Whether pricing requires contact';
COMMENT ON COLUMN public.vendors.rating_breakdown IS 'Rating breakdown by stars';
COMMENT ON COLUMN public.vendors.ai_summary IS 'AI-generated review summary';
COMMENT ON COLUMN public.vendors.sort_options IS 'Available review sort options';
COMMENT ON COLUMN public.vendors.individual_reviews IS 'Individual customer reviews';
COMMENT ON COLUMN public.vendors.team_description IS 'Team description';
COMMENT ON COLUMN public.vendors.team_message IS 'Team welcome message';
COMMENT ON COLUMN public.vendors.primary_image IS 'Primary venue image URL';
COMMENT ON COLUMN public.vendors.review_photos IS 'Photos from customer reviews';
COMMENT ON COLUMN public.vendors.source_url IS 'Original source URL';
COMMENT ON COLUMN public.vendors.page_type IS 'Type of page scraped';

-- Update existing records to have default values
UPDATE public.vendors SET 
  languages = '[]'::jsonb,
  ceremony_types = '[]'::jsonb,
  rating_breakdown = '{}'::jsonb,
  sort_options = '[]'::jsonb,
  individual_reviews = '[]'::jsonb,
  review_photos = '[]'::jsonb,
  page_type = 'venue_profile'
WHERE languages IS NULL 
   OR ceremony_types IS NULL 
   OR rating_breakdown IS NULL 
   OR sort_options IS NULL 
   OR individual_reviews IS NULL 
   OR review_photos IS NULL 
   OR page_type IS NULL;
