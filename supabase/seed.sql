-- ==============================================================================
-- FATHER SATURNINO URIOS UNIVERSITY (FSUU) - CDI 409 SEED DATA
-- Run this script in the Supabase SQL Editor after creating the schema.
-- ==============================================================================

-- 1. Insert CDI 409 Course
INSERT INTO courses (id, code, title, description, academic_term, institution)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'CDI 409',
    'Intro to Cybercrime and Environmental Laws and Protection',
    'This course covers an overview of cybercrime, including basic understanding of computer technology, history of cybercrimes, nature and types of cybercrimes, incident response, collection, and preservation; a digital investigative plan, and the applicable legal provision (RA 10175, Rule on Cybercrime Warrants). This also covers environmental laws, ecosystem/biodiversity protection, wildlife trafficking, and environmental jurisprudence.',
    '1st Semester AY 2026-2027',
    'Father Saturnino Urios University'
) ON CONFLICT (code) DO NOTHING;

-- 2. Insert Syllabus Units (5Es Modules)
INSERT INTO modules (id, course_id, unit_number, title, period, duration, description, po_mapping, topics)
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

-- 3. Insert Crime Labs
INSERT INTO labs (id, module_id, title, lab_type, instructions)
VALUES (
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32',
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'Virtual Computer Disassembly & Evidence Extraction Lab',
    'hardware-disassembly',
    'As a Criminology First Responder, you are tasked with recovering non-volatile and volatile storage components from a suspect desktop tower without damaging digital evidence. Select components in the forensic order of volatility and proper anti-static procedure.'
) ON CONFLICT DO NOTHING;
