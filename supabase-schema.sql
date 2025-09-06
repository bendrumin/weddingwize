-- WeddingWise AI Database Schema
-- This file contains the complete database schema for the WeddingWise AI platform

-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- Wedding profiles (extends Supabase auth)
create table public.wedding_profiles (
  id uuid references auth.users on delete cascade primary key,
  bride_name text,
  groom_name text,
  wedding_date date not null,
  total_budget integer not null,
  guest_count integer not null,
  location jsonb not null, -- {city, state, zipcode, coordinates}
  wedding_style text[] default '{}', -- [modern, rustic, elegant, outdoor, etc]
  priorities jsonb, -- {venue: 5, photography: 4, catering: 3, etc}
  planning_stage text default 'just_started',
  subscription_tier text default 'free',
  subscription_status text default 'active',
  onboarding_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Vendors (scraped data + manual curation)
create table public.vendors (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category text not null, -- venue, photography, catering, flowers, music, planning
  business_type text, -- individual, company, corporation
  location jsonb not null,
  pricing jsonb not null, -- {min, max, currency, per_unit, notes}
  contact jsonb not null, -- {phone, email, website, social}
  portfolio_images text[] default '{}', -- URLs to scraped images
  description text,
  specialties text[] default '{}',
  availability_calendar jsonb, -- scraped availability data
  rating numeric(3,2),
  review_count integer default 0,
  reviews_summary jsonb, -- sentiment analysis of scraped reviews
  last_scraped timestamptz,
  verified boolean default false,
  featured boolean default false,
  lead_fee_percentage integer default 5, -- commission for successful leads
  created_at timestamptz default now()
);

-- Create indexes for fast vendor queries
create index idx_vendors_category_location on vendors using gin(category, location);
create index idx_vendors_pricing on vendors using gin(pricing);
create index idx_vendors_rating on vendors (rating desc nulls last);
create index idx_vendors_featured on vendors (featured desc, rating desc nulls last);
create index idx_vendors_category on vendors (category);

-- User budget allocations (AI-optimized)
create table public.budget_allocations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references wedding_profiles(id) on delete cascade,
  category text not null,
  allocated_amount integer not null,
  spent_amount integer default 0,
  ai_recommended_amount integer, -- what our AI suggests
  user_priority_score integer, -- 1-5 how important this is to user
  market_percentage numeric(5,2), -- what % others spend in this area
  is_ai_optimized boolean default false,
  created_at timestamptz default now()
);

-- Vendor matches and interactions
create table public.vendor_matches (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references wedding_profiles(id) on delete cascade,
  vendor_id uuid references vendors(id) on delete cascade,
  compatibility_score numeric(5,2) not null, -- AI-calculated match score
  match_reasons text[] default '{}', -- why this vendor was matched
  user_action text, -- viewed, contacted, bookmarked, rejected
  contacted_at timestamptz,
  booking_status text, -- inquired, quoted, booked, rejected
  lead_fee_earned numeric(10,2), -- commission if booked
  created_at timestamptz default now()
);

-- Intelligent timeline with dependencies
create table public.timeline_tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references wedding_profiles(id) on delete cascade,
  title text not null,
  description text,
  category text not null,
  due_date date not null,
  completed_at timestamptz,
  status text default 'pending', -- pending, in_progress, completed, overdue
  priority text default 'medium', -- low, medium, high, critical
  estimated_hours numeric(4,1),
  depends_on uuid[] default '{}', -- array of task IDs this depends on
  auto_generated boolean default true, -- AI created vs user created
  vendor_related uuid references vendors(id), -- if task involves specific vendor
  created_at timestamptz default now()
);

-- Guest management with intelligent features
create table public.guests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references wedding_profiles(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  relationship text, -- family, friend, coworker, etc
  dietary_restrictions text[] default '{}',
  accessibility_needs text[] default '{}',
  rsvp_status text default 'pending',
  plus_one_allowed boolean default false,
  plus_one_name text,
  table_assignment integer,
  meal_choice text,
  gift_received boolean default false,
  invitation_sent_at timestamptz,
  rsvp_received_at timestamptz,
  created_at timestamptz default now()
);

-- Vendor scraping jobs and status
create table public.scraping_jobs (
  id uuid default gen_random_uuid() primary key,
  job_type text not null, -- venues, photographers, etc
  target_location jsonb not null,
  status text default 'pending', -- pending, running, completed, failed
  vendors_found integer default 0,
  vendors_updated integer default 0,
  errors_encountered text[] default '{}',
  started_at timestamptz,
  completed_at timestamptz,
  next_run_at timestamptz,
  created_at timestamptz default now()
);

-- User analytics and behavior tracking
create table public.user_analytics (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references wedding_profiles(id) on delete cascade,
  event_type text not null, -- page_view, vendor_view, budget_update, etc
  event_data jsonb,
  session_id text,
  created_at timestamptz default now()
);

-- Create indexes for performance
create index idx_budget_allocations_user_id on budget_allocations (user_id);
create index idx_vendor_matches_user_id on vendor_matches (user_id);
create index idx_vendor_matches_vendor_id on vendor_matches (vendor_id);
create index idx_vendor_matches_compatibility on vendor_matches (compatibility_score desc);
create index idx_timeline_tasks_user_id on timeline_tasks (user_id);
create index idx_timeline_tasks_due_date on timeline_tasks (due_date);
create index idx_timeline_tasks_status on timeline_tasks (status);
create index idx_guests_user_id on guests (user_id);
create index idx_guests_rsvp_status on guests (rsvp_status);
create index idx_user_analytics_user_id on user_analytics (user_id);
create index idx_user_analytics_event_type on user_analytics (event_type);
create index idx_user_analytics_created_at on user_analytics (created_at);

-- Enable RLS on all user tables
alter table wedding_profiles enable row level security;
alter table budget_allocations enable row level security;
alter table vendor_matches enable row level security;
alter table timeline_tasks enable row level security;
alter table guests enable row level security;
alter table user_analytics enable row level security;

-- RLS Policies
create policy "Users can manage own wedding profile" on wedding_profiles 
  using (auth.uid() = id);

create policy "Users can manage own budget" on budget_allocations 
  using (auth.uid() = user_id);

create policy "Users can manage own vendor matches" on vendor_matches 
  using (auth.uid() = user_id);

create policy "Users can manage own timeline" on timeline_tasks 
  using (auth.uid() = user_id);

create policy "Users can manage own guests" on guests 
  using (auth.uid() = user_id);

create policy "Users can manage own analytics" on user_analytics 
  using (auth.uid() = user_id);

-- Vendors table is public (no RLS) for marketplace functionality
-- Scraping jobs table is public for admin access

-- Functions for automatic timestamp updates
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Add triggers for updated_at
create trigger update_wedding_profiles_updated_at
  before update on wedding_profiles
  for each row execute function update_updated_at_column();

-- Functions for AI-powered features
create or replace function calculate_budget_optimization(
  p_user_id uuid,
  p_total_budget integer,
  p_priorities jsonb
)
returns jsonb as $$
declare
  result jsonb;
begin
  -- This function will be called by the AI service
  -- For now, return a placeholder structure
  result := jsonb_build_object(
    'allocations', jsonb_build_object(),
    'confidence', 0.0,
    'recommendations', jsonb_build_array()
  );
  return result;
end;
$$ language plpgsql;

-- Function to get vendor compatibility score
create or replace function calculate_vendor_compatibility(
  p_vendor_id uuid,
  p_user_id uuid
)
returns numeric as $$
declare
  score numeric;
begin
  -- This function will be called by the AI service
  -- For now, return a random score between 0.5 and 1.0
  score := 0.5 + random() * 0.5;
  return score;
end;
$$ language plpgsql;

-- Views for common queries
create view vendor_summary as
select 
  v.id,
  v.name,
  v.category,
  v.location,
  v.pricing,
  v.rating,
  v.review_count,
  v.verified,
  v.featured,
  count(vm.id) as match_count,
  avg(vm.compatibility_score) as avg_compatibility
from vendors v
left join vendor_matches vm on v.id = vm.vendor_id
group by v.id, v.name, v.category, v.location, v.pricing, v.rating, v.review_count, v.verified, v.featured;

create view user_dashboard_stats as
select 
  wp.id as user_id,
  wp.wedding_date,
  wp.total_budget,
  wp.guest_count,
  count(distinct ba.id) as budget_categories,
  count(distinct vm.id) as vendor_matches,
  count(distinct tt.id) as timeline_tasks,
  count(distinct g.id) as guests,
  sum(ba.spent_amount) as total_spent
from wedding_profiles wp
left join budget_allocations ba on wp.id = ba.user_id
left join vendor_matches vm on wp.id = vm.user_id
left join timeline_tasks tt on wp.id = tt.user_id
left join guests g on wp.id = g.user_id
group by wp.id, wp.wedding_date, wp.total_budget, wp.guest_count;

-- Sample data for development (optional)
-- Insert some sample vendors for testing
insert into vendors (name, category, location, pricing, contact, description, specialties, rating, review_count, verified) values
('The Grand Ballroom', 'venue', '{"city": "San Francisco", "state": "CA", "zipcode": "94102"}', '{"min": 5000, "max": 15000, "currency": "USD", "per_unit": "flat_rate"}', '{"phone": "+1-555-0123", "email": "info@grandballroom.com", "website": "https://grandballroom.com"}', 'Elegant ballroom in downtown San Francisco with stunning city views.', '{"elegant", "downtown", "city_views"}', 4.8, 127, true),
('Golden Gate Photography', 'photography', '{"city": "San Francisco", "state": "CA", "zipcode": "94103"}', '{"min": 2500, "max": 5000, "currency": "USD", "per_unit": "flat_rate"}', '{"phone": "+1-555-0456", "email": "hello@goldengatephoto.com", "website": "https://goldengatephoto.com"}', 'Award-winning wedding photography with a focus on candid moments.', '{"candid", "award_winning", "natural_light"}', 4.9, 89, true),
('Garden Fresh Catering', 'catering', '{"city": "San Francisco", "state": "CA", "zipcode": "94104"}', '{"min": 75, "max": 150, "currency": "USD", "per_unit": "per_person"}', '{"phone": "+1-555-0789", "email": "events@gardenfresh.com", "website": "https://gardenfresh.com"}', 'Farm-to-table catering with locally sourced ingredients.', '{"farm_to_table", "local_ingredients", "organic"}', 4.7, 156, true);
