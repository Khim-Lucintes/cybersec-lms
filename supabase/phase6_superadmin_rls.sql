-- Phase 6: Enterprise SuperAdmin Governance & IAM
-- Enable SuperAdmin capabilities

-- 1. Profiles Updates
-- Allow SuperAdmin to update any profile (e.g., changing roles)
DROP POLICY IF EXISTS "SuperAdmins can update any profile" ON public.profiles;

CREATE POLICY "SuperAdmins can update any profile" 
ON public.profiles FOR UPDATE TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE public.profiles.id = auth.uid() 
        AND public.profiles.role = 'superadmin'
    )
);

-- 2. Audit Logs Policies
-- Drop existing policies on audit_logs if any
DROP POLICY IF EXISTS "Anyone can insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "SuperAdmin can view all audit logs" ON public.audit_logs;

-- Allow any authenticated user (or even anonymous if needed, but we'll stick to authenticated) to insert audit logs
CREATE POLICY "Anyone can insert audit logs" 
ON public.audit_logs FOR INSERT TO authenticated 
WITH CHECK (true);

-- Only SuperAdmin can select/view audit logs
CREATE POLICY "SuperAdmin can view all audit logs" 
ON public.audit_logs FOR SELECT TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE public.profiles.id = auth.uid() 
        AND public.profiles.role = 'superadmin'
    )
);

-- Ensure RLS is enabled on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 3. Seed initial SuperAdmin if not exists
INSERT INTO public.profiles (id, full_name, student_or_faculty_id, role, section, program, year_level)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'System Administrator',
  'SA-001',
  'superadmin',
  'HQ',
  'IT & Data Center',
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Seed an initial audit log
INSERT INTO public.audit_logs (actor_id, actor_name, action, ip_address, severity)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'System',
  'Enterprise System initialized with Phase 6 SuperAdmin Policies.',
  '127.0.0.1',
  'System'
);
