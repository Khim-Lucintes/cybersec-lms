-- CyberSec LMS: Add Email to Profiles Table
-- Run this script in your Supabase SQL Editor

-- 1. Add the email column to the profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Populate the email column for all existing profiles based on auth.users
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

-- 3. Update the handle_new_user trigger to include email upon sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, student_or_faculty_id, role, section, program, year_level, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'student_id', '2210000' || LPAD(FLOOR(RANDOM() * 10000)::text, 4, '0')),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student'::user_role),
    'Section Alpha',
    'Bachelor of Science in Criminology',
    '4th Year',
    NEW.email -- NEW.email comes directly from auth.users
  );
  RETURN NEW;
END;
$$;
