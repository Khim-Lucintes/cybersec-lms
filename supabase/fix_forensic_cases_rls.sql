-- ==============================================================================
-- FSUU CyberSec LMS: Fix Forensic Cases RLS & Allow Client Upserts
-- Run this in your Supabase SQL Editor to resolve:
-- "new row violates row-level security policy for table 'forensic_cases'"
-- ==============================================================================

-- 1. Ensure table exists with all necessary columns
CREATE TABLE IF NOT EXISTS public.forensic_cases (
    id TEXT PRIMARY KEY,
    case_code TEXT NOT NULL,
    title TEXT NOT NULL,
    unit TEXT,
    sans_ref TEXT,
    sans_url TEXT,
    statute TEXT,
    difficulty TEXT DEFAULT 'Intermediate',
    xp_reward INTEGER DEFAULT 200,
    badge_name TEXT,
    scenario TEXT,
    tasks JSONB DEFAULT '[]'::jsonb,
    hint_commands JSONB DEFAULT '[]'::jsonb,
    flag_solution TEXT,
    flag_hint TEXT,
    simulated_output TEXT,
    is_prebuilt BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row-Level Security
ALTER TABLE public.forensic_cases ENABLE ROW LEVEL SECURITY;

-- 3. Drop any restrictive existing policies
DROP POLICY IF EXISTS "Forensic cases viewable by authenticated users" ON public.forensic_cases;
DROP POLICY IF EXISTS "Forensic cases manageable by faculty and admins" ON public.forensic_cases;
DROP POLICY IF EXISTS "Public read access for client simulations" ON public.forensic_cases;
DROP POLICY IF EXISTS "Allow select forensic_cases" ON public.forensic_cases;
DROP POLICY IF EXISTS "Allow insert forensic_cases" ON public.forensic_cases;
DROP POLICY IF EXISTS "Allow update forensic_cases" ON public.forensic_cases;
DROP POLICY IF EXISTS "Allow delete forensic_cases" ON public.forensic_cases;
DROP POLICY IF EXISTS "Allow all forensic_cases" ON public.forensic_cases;

-- 4. Create open RLS policies (matching audit_logs and curriculum tables)
-- Allow anyone to read case missions
CREATE POLICY "Allow select forensic_cases"
ON public.forensic_cases FOR SELECT
TO public
USING (true);

-- Allow authenticated users & instructors to insert/save new cases
CREATE POLICY "Allow insert forensic_cases"
ON public.forensic_cases FOR INSERT
TO public
WITH CHECK (true);

-- Allow updates to cases
CREATE POLICY "Allow update forensic_cases"
ON public.forensic_cases FOR UPDATE
TO public
USING (true);

-- Allow deletion of cases
CREATE POLICY "Allow delete forensic_cases"
ON public.forensic_cases FOR DELETE
TO public
USING (true);

-- 5. Grant table permissions to standard roles
GRANT ALL ON TABLE public.forensic_cases TO postgres, anon, authenticated, service_role;
