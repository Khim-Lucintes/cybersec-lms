-- Migration: Create tables for dynamic courses (Intro to Cybercrimes)

-- 1. Create course_sections table
CREATE TABLE IF NOT EXISTS public.course_sections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 2. Create course_lessons table
CREATE TABLE IF NOT EXISTS public.course_lessons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    section_id UUID REFERENCES public.course_sections(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    duration TEXT,
    description TEXT,
    notes TEXT,
    lesson_ref TEXT, -- References the lesson ID in LESSON_DETAILS
    video_url TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS
ALTER TABLE public.course_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for students)
CREATE POLICY "Allow public read access for course_sections"
    ON public.course_sections FOR SELECT
    USING (true);

CREATE POLICY "Allow public read access for course_lessons"
    ON public.course_lessons FOR SELECT
    USING (true);

-- Allow public full access for demonstration (Bypasses auth fallback mode)
CREATE POLICY "Allow public full access to course_sections"
    ON public.course_sections FOR ALL
    USING (true);

CREATE POLICY "Allow public full access to course_lessons"
    ON public.course_lessons FOR ALL
    USING (true);

-- 3. Seed Initial Data (Matching current INTRO_COURSE_DATA)
DO $$
DECLARE
    sec1_id UUID := uuid_generate_v4();
    sec2_id UUID := uuid_generate_v4();
    sec3_id UUID := uuid_generate_v4();
    sec4_id UUID := uuid_generate_v4();
BEGIN
    -- Insert Sections
    INSERT INTO public.course_sections (id, title, sort_order) VALUES
    (sec1_id, 'Unit 1: Cyberspace & Cyber Threats', 1),
    (sec2_id, 'Unit 2: Computer Subsystems & Volatility', 2),
    (sec3_id, 'Unit 3: Cybercrime Law & Data Privacy', 3),
    (sec4_id, 'Unit 4 & 7: Warrants & Memory Acquisition', 4);

    -- Insert Lessons for Section 1
    INSERT INTO public.course_lessons (section_id, title, duration, description, notes, lesson_ref, sort_order) VALUES
    (sec1_id, '1. Understanding Cyberspace & Architecture', '10:15', 'Define cyberspace architecture and differentiate cybercrimes from traditional crimes.', '• Cyberspace transcends territorial jurisdictions.\n• Global telecommunications networks.', 'lesson-1', 1),
    (sec1_id, '2. Taxonomy of Cyber Threats', '14:20', 'Analyze the taxonomy of malicious cyber threat actors and transnational syndicates.', '• Cyber-dependent vs. Cyber-enabled crimes.\n• APTs and hacktivists.', 'lesson-1', 2);

    -- Insert Lessons for Section 2
    INSERT INTO public.course_lessons (section_id, title, duration, description, notes, lesson_ref, sort_order) VALUES
    (sec2_id, '3. The 4 Main Computer Subsystems', '18:05', 'Identify the 4 primary hardware components and their critical forensic values.', '• Input, CPU, RAM, and Non-Volatile Storage (HDD/SSD).', 'lesson-2', 1),
    (sec2_id, '4. RFC 3227 Forensic Order of Volatility', '12:45', 'Master the Forensic Order of Volatility under RFC 3227 standards.', '• Capture RAM before hard drives.\n• CPU Cache -> RAM -> HDD -> Network Logs.', 'lesson-2', 2);

    -- Insert Lessons for Section 3
    INSERT INTO public.course_lessons (section_id, title, duration, description, notes, lesson_ref, sort_order) VALUES
    (sec3_id, '5. Cybercrime Legislation (RA 10175)', '21:30', 'Master the statutory elements of offenses under RA 10175.', '• RA 10175 penalizes illegal access, data interference, cyber-squatting.', 'lesson-3', 1),
    (sec3_id, '6. Data Privacy Act (RA 10173)', '18:45', 'Analyze RA 10173 principles, NPC mandates, and law enforcement exceptions.', '• Protects sensitive personal information.\n• Law enforcement exemption applies under warrants.', 'lesson-3', 2);

    -- Insert Lessons for Section 4
    INSERT INTO public.course_lessons (section_id, title, duration, description, notes, lesson_ref, sort_order) VALUES
    (sec4_id, '7. Cybercrime Warrants (A.M. No. 17-11-03-SC)', '25:10', 'Differentiate the four specialized Cybercrime Warrants.', '• WDCD, WICT, WSCD, WECD.\n• Warrants valid for 10 days.', 'lesson-7', 1),
    (sec4_id, '8. Live Memory Acquisition & International Protocols', '19:20', 'Live Response, RAM acquisition, and Budapest Convention preservation.', '• Execute memory dumps prior to shutdown.\n• G7 24/7 Network expedited preservation.', 'lesson-4', 2);
END $$;
