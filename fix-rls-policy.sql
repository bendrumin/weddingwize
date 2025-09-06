-- Fix RLS Policy for Wedding Profiles
-- This allows users to create their profile during signup

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can manage own wedding profile" ON public.wedding_profiles;

-- Create a new policy that allows inserts and updates
CREATE POLICY "Users can manage own wedding profile" ON public.wedding_profiles
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Alternative: Create separate policies for better control
-- DROP POLICY IF EXISTS "Users can manage own wedding profile" ON public.wedding_profiles;
-- 
-- CREATE POLICY "Users can view own wedding profile" ON public.wedding_profiles
--   FOR SELECT USING (auth.uid() = id);
-- 
-- CREATE POLICY "Users can insert own wedding profile" ON public.wedding_profiles
--   FOR INSERT WITH CHECK (auth.uid() = id);
-- 
-- CREATE POLICY "Users can update own wedding profile" ON public.wedding_profiles
--   FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Verify the policy was created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'wedding_profiles';
