-- ==============================================================================
-- FATHER SATURNINO URIOS UNIVERSITY (FSUU) - CDI 409
-- PERMISSIONS & PUBLIC SCHEMA FIX SCRIPT
-- Paste this script into Supabase SQL Editor and click "Run".
-- ==============================================================================

-- 1. Grant Schema Usage to standard Supabase Roles
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Set default permissions for future tables/sequences
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO postgres, anon, authenticated, service_role;

-- 2. User Roles Enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('student', 'instructor', 'superadmin');
    END IF;
END $$;

-- 3. Ensure profiles table exists
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    student_or_faculty_id TEXT NOT NULL,
    role user_role DEFAULT 'student'::user_role NOT NULL,
    section TEXT DEFAULT 'Section Alpha',
    program TEXT DEFAULT 'Bachelor of Science in Criminology',
    year_level TEXT DEFAULT '4th Year',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable RLS and add Open/Authenticated Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all authenticated users to read profiles" ON public.profiles;
CREATE POLICY "Allow all authenticated users to read profiles" 
ON public.profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow users to insert their profile" ON public.profiles;
CREATE POLICY "Allow users to insert their profile" 
ON public.profiles FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow users to update their profile" ON public.profiles;
CREATE POLICY "Allow users to update their profile" 
ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- 5. Auto-Profile Creation Trigger on auth.users Sign Up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, student_or_faculty_id, role, section, program, year_level)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'student_id', '2210000' || LPAD(FLOOR(RANDOM() * 10000)::text, 4, '0')),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student'::user_role),
    'Section Alpha',
    'Bachelor of Science in Criminology',
    '4th Year'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
