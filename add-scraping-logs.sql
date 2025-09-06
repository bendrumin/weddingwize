-- Add scraping logs table to track automated scraping activities
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS public.scraping_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp timestamptz DEFAULT now(),
  total_venues integer DEFAULT 0,
  successful_locations integer DEFAULT 0,
  failed_locations integer DEFAULT 0,
  locations_scraped integer DEFAULT 0,
  results jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create index for fast queries
CREATE INDEX IF NOT EXISTS idx_scraping_logs_timestamp ON public.scraping_logs (timestamp DESC);

-- Add RLS policy (if needed)
ALTER TABLE public.scraping_logs ENABLE ROW LEVEL SECURITY;

-- Allow service role to insert logs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'scraping_logs' 
    AND policyname = 'Service role can manage scraping logs'
  ) THEN
    CREATE POLICY "Service role can manage scraping logs" ON public.scraping_logs
      FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;
