-- ==============================================================================
-- FATHER SATURNINO URIOS UNIVERSITY (FSUU) - SUPABASE AUTH HOOK REPAIR
-- Run this in Supabase SQL Editor to remove broken triggers from auth.users
-- ==============================================================================

-- 1. Remove broken triggers on internal auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Ensure public schema permissions are wide open for Supabase auth roles
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role, supabase_auth_admin;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role, supabase_auth_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role, supabase_auth_admin;

-- 3. Create or clean public.profiles table (NOT strictly tied to foreign key constraint during initial auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    full_name TEXT NOT NULL,
    student_or_faculty_id TEXT NOT NULL,
    role TEXT DEFAULT 'student' NOT NULL,
    section TEXT DEFAULT 'Section Alpha',
    program TEXT DEFAULT 'Bachelor of Science in Criminology',
    year_level TEXT DEFAULT '4th Year',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable RLS with Permissive Public/Authenticated Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read profiles" ON public.profiles;
CREATE POLICY "Allow read profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert profiles" ON public.profiles;
CREATE POLICY "Allow insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update profiles" ON public.profiles;
CREATE POLICY "Allow update profiles" ON public.profiles FOR UPDATE USING (true);
