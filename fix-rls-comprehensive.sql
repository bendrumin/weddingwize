-- Comprehensive RLS Fix for Wedding Profiles
-- This addresses the signup flow issue completely

-- First, let's check what policies currently exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'wedding_profiles';

-- Drop ALL existing policies on wedding_profiles
DROP POLICY IF EXISTS "Users can manage own wedding profile" ON public.wedding_profiles;
DROP POLICY IF EXISTS "Users can view own wedding profile" ON public.wedding_profiles;
DROP POLICY IF EXISTS "Users can insert own wedding profile" ON public.wedding_profiles;
DROP POLICY IF EXISTS "Users can update own wedding profile" ON public.wedding_profiles;

-- Create comprehensive policies that handle all operations
CREATE POLICY "Users can view own wedding profile" ON public.wedding_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own wedding profile" ON public.wedding_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own wedding profile" ON public.wedding_profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own wedding profile" ON public.wedding_profiles
  FOR DELETE USING (auth.uid() = id);

-- Alternative: If the above doesn't work, try this more permissive approach
-- (Only use this if the above policies still don't work)
-- DROP POLICY IF EXISTS "Users can view own wedding profile" ON public.wedding_profiles;
-- DROP POLICY IF EXISTS "Users can insert own wedding profile" ON public.wedding_profiles;
-- DROP POLICY IF EXISTS "Users can update own wedding profile" ON public.wedding_profiles;
-- DROP POLICY IF EXISTS "Users can delete own wedding profile" ON public.wedding_profiles;
-- 
-- CREATE POLICY "Enable all operations for authenticated users" ON public.wedding_profiles
--   FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Verify the new policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'wedding_profiles'
ORDER BY policyname;
