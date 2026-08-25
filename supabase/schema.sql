-- ==============================================================================
-- FATHER SATURNINO URIOS UNIVERSITY (FSUU) - CRIMINAL JUSTICE EDUCATION PROGRAM
-- CDI 409: CYBERCRIME FORENSICS & ENVIRONMENTAL LAW LEARNING MANAGEMENT SYSTEM
-- PostgreSQL Database Schema with Row-Level Security (RLS)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Roles Enum
CREATE TYPE user_role AS ENUM ('student', 'instructor', 'superadmin');

-- 3. Profiles Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    student_or_faculty_id TEXT UNIQUE NOT NULL,
    role user_role DEFAULT 'student'::user_role NOT NULL,
    section TEXT DEFAULT 'Section Alpha',
    program TEXT DEFAULT 'Bachelor of Science in Criminology',
    year_level TEXT DEFAULT '4th Year',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL, -- e.g. 'CDI 409'
    title TEXT NOT NULL,
    description TEXT,
    academic_term TEXT DEFAULT '1st Semester AY 2026-2027',
    institution TEXT DEFAULT 'Father Saturnino Urios University',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Syllabus Modules Table (5Es Units)
CREATE TABLE IF NOT EXISTS modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
    unit_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    period TEXT NOT NULL, -- 'Prelims', 'Midterms', 'Semi-Finals', 'Finals'
    duration TEXT DEFAULT '4 Hours',
    description TEXT,
    po_mapping TEXT[] DEFAULT ARRAY['POc', 'POd'],
    topics JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Forensic Labs Table
CREATE TABLE IF NOT EXISTS labs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    lab_type TEXT NOT NULL, -- 'hardware-disassembly', 'triage-simulator', 'artifact-analysis', 'warrant-builder'
    instructions TEXT NOT NULL,
    config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Cadet Lab Submissions Table
CREATE TABLE IF NOT EXISTS lab_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    lab_id UUID REFERENCES labs(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'Needs Review' NOT NULL, -- 'Needs Review', 'Graded', 'Revision'
    score NUMERIC(5,2) DEFAULT 0,
    evidence_payload JSONB DEFAULT '{}'::jsonb,
    compliance_note TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    graded_at TIMESTAMP WITH TIME ZONE,
    graded_by UUID REFERENCES profiles(id)
);

-- 8. Quizzes & Formative Assessments
CREATE TABLE IF NOT EXISTS quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    questions JSONB NOT NULL, -- Array of {question, options, correctIndex, explanation}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Cadet Quiz Attempts Table
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
    score NUMERIC(5,2) NOT NULL,
    answers JSONB NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Grading Records Table (Matches Syllabus Section VIII Formula)
CREATE TABLE IF NOT EXISTS grading_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
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
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    actor_name TEXT,
    action TEXT NOT NULL,
    ip_address TEXT,
    severity TEXT DEFAULT 'Standard',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE labs ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE grading_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
CREATE POLICY "Public profiles are readable by authenticated users" 
ON profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- 2. Curriculum & Modules Policies (Read-only for all, write for instructors/superadmins)
CREATE POLICY "Courses and Modules are viewable by all authenticated users" 
ON courses FOR SELECT TO authenticated USING (true);

CREATE POLICY "Modules viewable by authenticated users" 
ON modules FOR SELECT TO authenticated USING (true);

CREATE POLICY "Labs viewable by authenticated users" 
ON labs FOR SELECT TO authenticated USING (true);

CREATE POLICY "Quizzes viewable by authenticated users" 
ON quizzes FOR SELECT TO authenticated USING (true);

-- 3. Lab Submissions Policies
CREATE POLICY "Cadets can view their own lab submissions" 
ON lab_submissions FOR SELECT TO authenticated 
USING (
    auth.uid() = student_id 
    OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('instructor', 'superadmin')
    )
);

CREATE POLICY "Cadets can insert their own lab submissions" 
ON lab_submissions FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Instructors can update/grade lab submissions" 
ON lab_submissions FOR UPDATE TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('instructor', 'superadmin')
    )
);

-- 4. Grading Records Policies
CREATE POLICY "Cadets can view their own grades; Faculty can view all" 
ON grading_records FOR SELECT TO authenticated 
USING (
    auth.uid() = student_id 
    OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('instructor', 'superadmin')
    )
);

CREATE POLICY "Instructors can update grades" 
ON grading_records FOR ALL TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('instructor', 'superadmin')
    )
);

-- 5. Audit Logs Policies
CREATE POLICY "Audit logs readable by superadmins only" 
ON audit_logs FOR SELECT TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin'
    )
);
