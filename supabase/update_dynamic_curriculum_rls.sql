-- Update Row Level Security for Dynamic Curriculum
-- Requirements: "now i want them dynamic all users except the superadmin will add later"
-- Excludes the superadmin role from selecting/modifying the dynamic curriculum for now.

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Modules viewable by authenticated users" ON public.modules;
DROP POLICY IF EXISTS "Modules viewable by users except superadmin" ON public.modules;

CREATE POLICY "Modules viewable by users except superadmin" 
ON public.modules FOR SELECT TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE public.profiles.id = auth.uid() 
        AND public.profiles.role != 'superadmin'
    )
);

DROP POLICY IF EXISTS "Modules modifiable by instructors" ON public.modules;

CREATE POLICY "Modules modifiable by instructors" 
ON public.modules FOR ALL TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE public.profiles.id = auth.uid() 
        AND public.profiles.role = 'instructor'
    )
);
