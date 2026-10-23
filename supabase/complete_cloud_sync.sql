-- ==============================================================================
-- FATHER SATURNINO URIOS UNIVERSITY (FSUU) - CDI 409 CYBERCRIME LMS
-- COMPLETE CLOUD SYNC & DATABASE MIGRATION SCRIPT
-- Roles supported: 'student', 'instructor', 'superadmin' ('instructor' = faculty/admin)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Verify / Create User Roles Enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('student', 'instructor', 'superadmin');
    END IF;
END $$;

-- 3. Courses Table (CDI 409)
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    academic_term TEXT DEFAULT '1st Semester AY 2026-2027',
    institution TEXT DEFAULT 'Father Saturnino Urios University',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow select courses" ON public.courses;
CREATE POLICY "Allow select courses" ON public.courses FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow manage courses" ON public.courses;
CREATE POLICY "Allow manage courses" ON public.courses FOR ALL USING (true);

-- Seed CDI 409 Course if empty
INSERT INTO public.courses (id, code, title, description, academic_term, institution)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'CDI 409',
    'Intro to Cybercrime and Environmental Laws and Protection',
    'Curriculum mapped to CHED CMO No. 05, s. 2018 for BS Criminology. Covers RA 10175, Rule on Cybercrime Warrants, digital evidence acquisition, ISO/IEC 27037, and environmental laws (PD 705, RA 9147, Wildlife Act).',
    '1st Semester AY 2026-2027',
    'Father Saturnino Urios University'
) ON CONFLICT (code) DO NOTHING;

-- 4. Syllabus Modules Table (5Es Units)
CREATE TABLE IF NOT EXISTS public.modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    unit_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    period TEXT NOT NULL,
    duration TEXT DEFAULT '4 Hours',
    description TEXT,
    po_mapping TEXT[] DEFAULT ARRAY['POc', 'POd'],
    topics JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow select modules" ON public.modules;
CREATE POLICY "Allow select modules" ON public.modules FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow manage modules" ON public.modules;
CREATE POLICY "Allow manage modules" ON public.modules FOR ALL USING (true);

-- Seed 8 Core CDI 409 Modules if empty
INSERT INTO public.modules (id, course_id, unit_number, title, period, duration, description, po_mapping, topics)
VALUES 
(
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    1,
    'Overview of Cybercrime & Cyberspace',
    'Prelims',
    '4 Hours',
    'General concepts of cyberspace, nature of cybercrime, cybercriminals, networks, and victim rights.',
    ARRAY['POb'],
    '["Introduction to Cyberspace", "Nature & Taxonomy of Cybercrimes", "Historical Background of Cyberattacks", "Cybercriminals & Networks", "Victim Welfare"]'::jsonb
),
(
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    2,
    'Computer Hardware & Forensic Component Disassembly',
    'Prelims',
    '4 Hours',
    'The 4 main computer components, primary/secondary storage, and proper hardware disassembly for digital evidence recovery.',
    ARRAY['POc', 'POd'],
    '["4 Main Components", "Primary (RAM) vs Secondary Storage", "Hardware Preservation & Anti-Static Handling", "Disassembly Sequence for Digital Retrieval"]'::jsonb
),
(
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    3,
    'Cybercrime Offenses (RA 10175) & Duties of LEAs',
    'Prelims Examination',
    '4 Hours',
    'Comprehensive study of Republic Act 10175: Sec. 4, Sec. 5, Sec. 6, and Law Enforcement Agency duties (Sec. 11).',
    ARRAY['POc'],
    '["Sec 4(a): Offenses Against Confidentiality & Integrity", "Sec 4(b): Computer-Related Forgery & Identity Theft", "Sec 4(c): Content-Related Offenses", "Sec 5: Aiding & Abetting", "Sec 11: Duties of LEAs"]'::jsonb
),
(
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a24',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    4,
    'Incident Response, Preservation & Collection',
    'Midterms',
    '4 Hours',
    'International preservation protocols (Budapest Convention, G7 24/7 Network), 3rd-party preservation, and first responder triage.',
    ARRAY['POc', 'POd'],
    '["Budapest Convention Art. 16/17/29", "First Responder Order of Volatility (RFC 3227)", "3rd Party Data Preservation Order", "Packaging, Labeling & Faraday Isolation"]'::jsonb
),
(
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a25',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    5,
    'Chain of Custody & Forensic Action Plan',
    'Midterms',
    '4 Hours',
    'Evidentiary chain-of-custody protocols, tracking logs, ISO/IEC 27037 standards, and contemporary notes preparation.',
    ARRAY['POc', 'POe'],
    '["Chain of Custody Form Structure", "ISO/IEC 27037 Identification Guidelines", "Evidence Locker Protocols", "Contemporaneous Examiner Notes"]'::jsonb
),
(
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a26',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    6,
    'Forensic Artifacts: Registry, USB, & File Systems',
    'Semi-Finals',
    '4 Hours',
    'Windows Registry forensics, USBSTOR tracking, Shellbags, Prefetch analysis, and anti-forensics timestomp detection.',
    ARRAY['POc', 'POd'],
    '["Registry Structure (SAM, SYSTEM, SOFTWARE)", "USBSTOR Evidence of Device Insertion", "Windows Prefetch & Execution Traces", "MFT Timestomp Analysis"]'::jsonb
),
(
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a27',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    7,
    'Cybercrime Judicial Warrants & Moot Court Defense',
    'Semi-Finals Examination',
    '4 Hours',
    'Supreme Court A.M. No. 17-11-03-SC (Rule on Cybercrime Warrants: WDCD, WSCD, WECD, WOCD) and moot court defense testimony.',
    ARRAY['POb', 'POc', 'POe'],
    '["Warrant to Disclose Computer Data (WDCD)", "Warrant to Search, Seize & Examine (WSCD)", "Warrant to Examine (WECD)", "Warrant to Intercept (WOCD)", "Expert Testimony & Cross-Examination"]'::jsonb
),
(
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a28',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    8,
    'Green Forensics: Environmental Laws & Wildlife Protection',
    'Finals',
    '4 Hours',
    'Environmental jurisprudence, Presidential Decree No. 705 (Revised Forestry Code), RA 9147 (Wildlife Act), wood anatomy microscopy, and drone telemetry.',
    ARRAY['POa', 'POc', 'POd'],
    '["PD 705: Illegal Logging & Chain of Custody for Timber", "RA 9147: Wildlife Resources Conservation Act", "GIS Geospatial & Drone Flight Log Forensics", "Botanical Specimen Sawdust Morphology"]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 5. Forensic Cases Table
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

ALTER TABLE public.forensic_cases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow select forensic_cases" ON public.forensic_cases;
CREATE POLICY "Allow select forensic_cases" ON public.forensic_cases FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow insert forensic_cases" ON public.forensic_cases;
CREATE POLICY "Allow insert forensic_cases" ON public.forensic_cases FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow update forensic_cases" ON public.forensic_cases;
CREATE POLICY "Allow update forensic_cases" ON public.forensic_cases FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow delete forensic_cases" ON public.forensic_cases;
CREATE POLICY "Allow delete forensic_cases" ON public.forensic_cases FOR DELETE USING (true);

-- 6. Direct Messages Table
CREATE TABLE IF NOT EXISTS public.direct_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id TEXT NOT NULL, 
    receiver_id TEXT NOT NULL,
    sender_name TEXT,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow select direct_messages" ON public.direct_messages;
CREATE POLICY "Allow select direct_messages" ON public.direct_messages FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow insert direct_messages" ON public.direct_messages;
CREATE POLICY "Allow insert direct_messages" ON public.direct_messages FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow update direct_messages" ON public.direct_messages;
CREATE POLICY "Allow update direct_messages" ON public.direct_messages FOR UPDATE USING (true);

-- 7. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    time TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow select notifications" ON public.notifications;
CREATE POLICY "Allow select notifications" ON public.notifications FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow insert notifications" ON public.notifications;
CREATE POLICY "Allow insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow update notifications" ON public.notifications;
CREATE POLICY "Allow update notifications" ON public.notifications FOR UPDATE USING (true);

-- 8. Grant Table Permissions to standard Supabase roles
GRANT ALL ON TABLE public.courses TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE public.modules TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE public.forensic_cases TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE public.direct_messages TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE public.notifications TO postgres, anon, authenticated, service_role;

-- 9. Enable Realtime Publications (Enables live instant sync across student & instructor dashboards)
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.forensic_cases;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
END $$;

-- Verification output
SELECT 'Cloud sync completed successfully! All tables, RLS policies, and realtime publications are active.' as status;
