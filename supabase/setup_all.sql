-- ==============================================================================
-- FATHER SATURNINO URIOS UNIVERSITY (FSUU) - CDI 409
-- CLEAN STANDARD SUPABASE SCHEMA & SEED (NO DIRECT AUTH INSERTS)
-- Run this in your Supabase SQL Editor.
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Role Enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('student', 'instructor', 'superadmin');
    END IF;
END $$;

-- 3. Profiles Table (Linked to auth.users)
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

-- 4. Courses Table
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    academic_term TEXT DEFAULT '1st Semester AY 2026-2027',
    institution TEXT DEFAULT 'Father Saturnino Urios University',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Syllabus Modules Table (5Es Units)
CREATE TABLE IF NOT EXISTS public.modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    unit_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    period TEXT NOT NULL,
    duration TEXT DEFAULT '4 Hours',
    description TEXT,
    po_mapping TEXT[] DEFAULT ARRAY['POc', 'POd'],
    topics JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Forensic Labs Table
CREATE TABLE IF NOT EXISTS public.labs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    lab_type TEXT NOT NULL,
    instructions TEXT NOT NULL,
    config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Student Lab Submissions Table
CREATE TABLE IF NOT EXISTS public.lab_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    lab_id UUID REFERENCES public.labs(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'Needs Review' NOT NULL,
    score NUMERIC(5,2) DEFAULT 0,
    evidence_payload JSONB DEFAULT '{}'::jsonb,
    compliance_note TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    graded_at TIMESTAMP WITH TIME ZONE,
    graded_by UUID REFERENCES public.profiles(id)
);

-- 8. Quizzes Table
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    questions JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Student Quiz Attempts Table
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
    score NUMERIC(5,2) NOT NULL,
    answers JSONB NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Grading Records Table (Matches Section VIII Syllabus Formula)
CREATE TABLE IF NOT EXISTS public.grading_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    prelim_exam NUMERIC(5,2) DEFAULT 0,
    midterm_exam NUMERIC(5,2) DEFAULT 0,
    semi_final_exam NUMERIC(5,2) DEFAULT 0,
    final_exam NUMERIC(5,2) DEFAULT 0,
    classwork_mean NUMERIC(5,2) DEFAULT 0,
    midterm_grade NUMERIC(5,2) GENERATED ALWAYS AS (
        (((prelim_exam + midterm_exam) / 2.0) * 0.60) + (classwork_mean * 0.40)
    ) STORED,
    tentative_final_grade NUMERIC(5,2) GENERATED ALWAYS AS (
        (((semi_final_exam + final_exam) / 2.0) * 0.60) + (classwork_mean * 0.40)
    ) STORED,
    real_final_grade NUMERIC(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. System Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    actor_name TEXT,
    action TEXT NOT NULL,
    ip_address TEXT,
    severity TEXT DEFAULT 'Standard',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grading_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
DROP POLICY IF EXISTS "Public profiles are readable by authenticated users" ON public.profiles;
CREATE POLICY "Public profiles are readable by authenticated users" 
ON public.profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- 2. Courses and Modules Policies
DROP POLICY IF EXISTS "Courses and Modules are viewable by all authenticated users" ON public.courses;
CREATE POLICY "Courses and Modules are viewable by all authenticated users" 
ON public.courses FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Modules viewable by authenticated users" ON public.modules;
CREATE POLICY "Modules viewable by authenticated users" 
ON public.modules FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Labs viewable by authenticated users" ON public.labs;
CREATE POLICY "Labs viewable by authenticated users" 
ON public.labs FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Quizzes viewable by authenticated users" ON public.quizzes;
CREATE POLICY "Quizzes viewable by authenticated users" 
ON public.quizzes FOR SELECT TO authenticated USING (true);

-- 3. Lab Submissions Policies
DROP POLICY IF EXISTS "Students can view their own lab submissions" ON public.lab_submissions;
CREATE POLICY "Students can view their own lab submissions" 
ON public.lab_submissions FOR SELECT TO authenticated 
USING (
    auth.uid() = student_id 
    OR EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('instructor', 'superadmin')
    )
);

DROP POLICY IF EXISTS "Students can insert their own lab submissions" ON public.lab_submissions;
CREATE POLICY "Students can insert their own lab submissions" 
ON public.lab_submissions FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Instructors can update/grade lab submissions" ON public.lab_submissions;
CREATE POLICY "Instructors can update/grade lab submissions" 
ON public.lab_submissions FOR UPDATE TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('instructor', 'superadmin')
    )
);

-- 4. Grading Records Policies
DROP POLICY IF EXISTS "Students can view their own grades; Faculty can view all" ON public.grading_records;
CREATE POLICY "Students can view their own grades; Faculty can view all" 
ON public.grading_records FOR SELECT TO authenticated 
USING (
    auth.uid() = student_id 
    OR EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('instructor', 'superadmin')
    )
);

-- ==============================================================================
-- INSERT SEED COURSE & 8 SYLLABUS MODULES
-- ==============================================================================

INSERT INTO public.courses (id, code, title, description, academic_term, institution)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'CDI 409',
    'Intro to Cybercrime and Environmental Laws and Protection',
    'This course covers an overview of cybercrime, including basic understanding of computer technology, history of cybercrimes, nature and types of cybercrimes, incident response, collection, and preservation; a digital investigative plan, and the applicable legal provision (RA 10175, Rule on Cybercrime Warrants). This also covers environmental laws, ecosystem/biodiversity protection, wildlife trafficking, and environmental jurisprudence.',
    '1st Semester AY 2026-2027',
    'Father Saturnino Urios University'
) ON CONFLICT (code) DO NOTHING;

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
    ARRAY['POd'],
    '["Budapest Convention", "G7 24/7 Network", "3rd-Party Preservation", "Live Response & Triage", "Order of Volatility"]'::jsonb
),
(
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a25',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    5,
    'Digital Investigative Plan & Storage Analysis',
    'Midterm Examination',
    '4 Hours',
    'Electromagnetic vs Solid State storage, file persistence, cloud/mobile forensics, and counter-forensic activity detection.',
    ARRAY['POc', 'POd'],
    '["Electromagnetic vs SSD Forensics", "File Deletion & Remanence", "MACB Timestamps", "Counter-Forensic Detection"]'::jsonb
),
(
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a26',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    6,
    'Initial Examination of Digital Evidence (Artifacts)',
    'Semi-Finals',
    '4 Hours',
    'Forensic artifact analysis: Program execution (Shimcache, Prefetch), USB connection history, and location/communication traces.',
    ARRAY['POc', 'POd'],
    '["File Knowledge & Shellbags", "Prefetch & UserAssist Activity", "USBSTOR Registry Analysis", "Time Manipulation (Timestomping)"]'::jsonb
),
(
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a27',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    7,
    'Cybercrime Warrants & Judicial Issuances (A.M. No. 17-11-03-SC)',
    'Semi-Final Examination',
    '4 Hours',
    'Philippine Supreme Court Rule on Cybercrime Warrants: WDCD, WSCD, WICT, WECD, and WDCD (Destroy).',
    ARRAY['POc', 'POe'],
    '["Warrant to Disclose Computer Data (WDCD)", "Warrant to Intercept (WICT)", "Warrant to Search & Seize (WSCD)", "Warrant to Examine (WECD)", "Warrant to Destroy"]'::jsonb
),
(
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a28',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    8,
    'Environmental Laws & Wildlife Protection (Green Forensics)',
    'Finals Examination',
    '4 Hours',
    'NIPAS Act, Wildlife Trafficking, CITES/IUCN Red List identification, sawdust morphology, and Rules of Procedure for Environmental Cases.',
    ARRAY['POc', 'POd', 'POe'],
    '["Environmental Jurisprudence & NIPAS Act", "Wildlife Trafficking Detection (CITES/IUCN)", "Sawdust Morphology Forensics", "Writ of Kalikasan"]'::jsonb
) ON CONFLICT DO NOTHING;

INSERT INTO public.labs (id, module_id, title, lab_type, instructions)
VALUES (
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32',
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'Virtual Computer Disassembly & Evidence Extraction Lab',
    'hardware-disassembly',
    'As a Criminology First Responder, you are tasked with recovering non-volatile and volatile storage components from a suspect desktop tower without damaging digital evidence. Select components in the forensic order of volatility and proper anti-static procedure.'
) ON CONFLICT DO NOTHING;
