-- ==============================================================================
-- FSUU CyberSec LMS: Fix Audit Logs RLS & Table Permissions
-- Run this in your Supabase SQL Editor
-- ==============================================================================

-- 1. Ensure table exists with correct columns
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    actor_name TEXT NOT NULL,
    action TEXT NOT NULL,
    ip_address TEXT DEFAULT '127.0.0.1',
    severity TEXT DEFAULT 'Standard',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row-Level Security
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 3. Allow inserts from both authenticated and anonymous clients
DROP POLICY IF EXISTS "Allow insert audit_logs" ON public.audit_logs;
CREATE POLICY "Allow insert audit_logs" 
ON public.audit_logs FOR INSERT 
TO public
WITH CHECK (true);

-- 4. Allow reading audit logs
DROP POLICY IF EXISTS "Allow select audit_logs" ON public.audit_logs;
CREATE POLICY "Allow select audit_logs" 
ON public.audit_logs FOR SELECT 
TO public
USING (true);

-- 5. Grant table permissions to standard roles
GRANT ALL ON TABLE public.audit_logs TO postgres, anon, authenticated, service_role;
