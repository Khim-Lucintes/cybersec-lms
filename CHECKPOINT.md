# CDI 409 Cybersecurity LMS — Project Checkpoint & Architecture Documentation

**Institution**: Father Saturnino Urios University (FSUU)  
**Program**: Criminal Justice Education Program (BS Criminology)  
**Course Code**: CDI 409: Intro to Cybercrime and Environmental Laws and Protection  
**Document Version**: v3.1 (Evidence Chain-of-Custody Generator Complete)  
**Academic Year**: AY 2026-2027  

---

## 1. Executive Summary & Thesis Architecture

This **Cybersecurity & Cybercrime Forensics Learning Management System (LMS)** is an outcome-based educational platform designed for BS Criminology undergraduates. It bridges legal jurisprudence (RA 10175, Supreme Court Rule on Cybercrime Warrants A.M. No. 17-11-03-SC, Environmental Laws) with practical forensic crime labs (Order of Volatility hardware extraction, live RAM dump inspection, registry timelines, and wildlife contraband classification).

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                          CDI 409 Enterprise Architecture                               │
├──────────────────────────┬───────────────────────────┬─────────────────────────────────┤
│     Cadet Portal         │     Faculty Desk          │     SuperAdmin HQ               │
│     (/dashboard/student) │     (/dashboard/admin)    │     (/dashboard/superadmin)     │
│   - 5Es Curriculum (8)   │   - Practicum Evaluation  │   - Cloud Node Topology         │
│   - 4 Crime Labs Suite   │   - Cohort Standings      │   - IAM & User Provisioning     │
│   - Case Defense Board   │   - 5Es Syllabus Manager  │   - Supabase RLS Matrix         │
│   - Jurisprudence DB     │   - Grade Formula Matrix  │   - System Audit Trail          │
│   - Badges & XP Hub      │   - Section PDF Roster    │                                 │
│   - Section VIII Grades  │                           │                                 │
│   - Audio Briefings      │                           │                                 │
├──────────────────────────┴───────────────────────────┴─────────────────────────────────┤
│                          Database & Persistence Layer                                  │
│  - Supabase PostgreSQL 16 with Row-Level Security (RLS) & Client-side Session Sync     │
│  - Native Client Document Engine for Official PDF Transcripts & OBE Certificates       │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Completed Milestones & Feature Checkpoint

### Milestone 1: Custom Agent Architecture Skill (`fullstack-architect`)
- [x] Defined layered full-stack architectural principles in `.agents/skills/fullstack-architect/`.
- [x] Created reference guides for Supabase database recipes, API routes, and Server Actions.

### Milestone 2: Enterprise Authentication & Real Database Verification
- [x] **Strict Supabase Database Authentication Verification**:
  - Enforced server-side validation against `auth.users` and `public.profiles`.
  - Non-existent accounts and invalid credentials are now strictly blocked with direct error alerts.
  - New cadets register via the **"Create Account"** tab, which automatically persists them to the PostgreSQL database with proper roles before prompting sign-in.
- [x] **Refined Minimal Auth Modal UI**:
  - Academic branding header with FSUU gold icon badge (`#C5A059`) and crisp typography.
  - Integrated icon indicators (`User`, `GraduationCap`, `Mail`, `KeyRound`) on form fields.
  - Added toggleable **Show / Hide Password** button (`Eye` / `EyeOff`) and animated spinner (`Loader2`) on submit.
- [x] **Load Optimizers & Route Progress Bar**:
  - Global `RouteLoadingBar` mounted at root layout displaying an animated Navy-to-Gold micro-progress bar on route transitions.
  - Shimmering `ForensicSkeletonLoader` during initial dashboard hydration and asynchronous profile resolution.
  - **Neutral**: Slate Dark (`#1E293B` / `#555555`)
- [x] Integrated Google Fonts: **Source Serif 4** (Headlines), **Inter** (UI Body), and **JetBrains Mono** (Codes, Metrics & Offsets).
- [x] Streamlined student interface with clean sidebar navigation, progress trackers, and distraction-free workspace tabs.

### Milestone 3: Statutory Cybercrime (RA 10175) & Data Privacy (RA 10173) Modules
- [x] **Comprehensive In-Depth Lesson Lecture Reader (All 8 Units)**:
  - Added dedicated **"Lecture Notes"** reader tab with full textbook-grade lessons, syllabus learning objectives, and formal legal citations.
  - Complete coverage across Cyberspace Architecture, Hardware Order of Volatility, RA 10175 vs. RA 10173, RAM Live Triage, ISO/IEC 27037 Plans, Windows Registry Forensics, Supreme Court Cybercrime Warrants, and Green/Wildlife Forensics.
- [x] **Republic Act 10175 (Cybercrime Prevention Act of 2012)**:
  - Confidentiality, Integrity & Availability offenses (Sec. 4a1 Illegal Access, Sec. 4a2 Interception, Sec. 4a3 System Interference, Sec. 4a4 Data Interference).
  - Computer-Related Forgery & Identity Theft (Sec. 4b), Content-Related Offenses (Cybersex, Sec. 4c).
- [x] **Republic Act 10173 (Data Privacy Act of 2012)**:
  - Unauthorized Processing & Malicious Disclosure of Sensitive Personal Info (Sec. 25-32).
  - Law enforcement exemptions, NPC circulars, and handling citizen personal data during warrant execution.
- [x] **Jurisprudence & Supreme Court Doctrines Library**:
  - *Disini vs. SOJ* (G.R. No. 203335) on RA 10175 constitutionality.
  - *NPC vs. Unauthorized Database Dumper* (NPC Case 17-001) on Sensitive Health & Biometric Data.
  - *Vivares vs. St. Theresa's College* (G.R. No. 202666) on social media privacy & DPA standards.

### Milestone 4: Multi-Role Dashboard Suite
- [x] **Cadet Portal (`/dashboard/student`)**:
  - **Live Dynamic Data Engine**:
    - Real-time **Section VIII OBE Grade Engine**: Dynamically calculates Summative (60%) and Classwork (40%) scores as the cadet completes labs, unlocks badges, and finishes unit quizzes.
    - Live GPA equivalent translation (`1.00`, `1.25`, `1.50`, `1.75`, `2.00`, `3.00`, `5.00`) updated on-the-fly.
    - Persistent progress syncing across `localStorage` and Supabase `profiles`.
  - **Comprehensive Cadet Overview Dashboard (`navSection === "overview"`)**:
    - Institutional welcome hero banner with quick-action links to resume learning or launch labs.
    - 4 real-time metric counter cards: *Curriculum Progress (% & N/8)*, *Accumulated XP*, *Forensic Badges Unlocked*, and *Standing Grade*.
    - Quick-launch crime lab workbench shortcuts (Unit 2 Volatility, Unit 4 RAM Hex Dump, Unit 7 Supreme Court Warrants).
    - Statutory & case defense digest cards highlighting **RA 10175** and **RA 10173**.
  - **Quick Unit Stepper**: Previous & Next unit stepping buttons (`<` and `>`) with indicator counter (`1 / 8`).
  - **Manual / Automatic "Mark as Done" Toggle**: Cadets can mark lessons completed to dynamically update course progress % and unlocks.
  - **Comprehensive 5-Tab Unit System**: `Topics`, `Lecture Notes`, `5Es Guide`, `Crime Lab`, and `Quiz`.
  - **Quiz Score Card & Retake Action**: Shows final score (e.g. `2 / 2 (100%)`), competency badge status, and one-click retake.
  - Minimal collapsible sidebar (`w-64` to `w-20` icon mode) maximizing lab workstation screen real estate.
  - Native Web Speech API audio briefing player for spoken unit summaries.
- [x] **Faculty Assessment & Command Desk (`/dashboard/admin`)**:
  - **Minimal Academic Design**: Matches the clean, modern styling of the cadet dashboard with institutional deep navy (`#001F44`), gold accents (`#C5A059`), and crisp monospace metrics.
  - **Collapsible Sidebar**: Smooth toggle between full view and icon mode with progress indicators.
  - **Batch Gradebook & Section Grade Curve Engine**:
    - Live grade curve adjusters (`Raw 0%`, `+2%`, `+3%`, `+5%`) that dynamically recompute the Section VIII OBE formula across enrolled cadets.
    - Cohort grade roster with GPA equivalents (`1.00`, `1.25`, `1.50`, `1.75`).
    - One-click official PDF Grade Roster export for registrar and dean submission.
  - **Practicum Review Modal**: Fast evaluator dialog for grading digital forensics extractions and case defense briefs.

### Milestone 5: Authentication & Database Persistence
- [x] **Unified Pop-Up Modal (`/`)**:
  - Clean, minimal dialog on the landing page for **Sign In** and **Register Cadet ("Create Account")**.
  - Smart automatic role detection based on institutional credentials.
- [x] **Database Schema & Permissions**:
  - PostgreSQL schema definitions in `supabase/schema.sql` and `supabase/setup_all.sql`.
  - Permission repair and auth stabilization script in `supabase/repair_auth.sql`.
  - Zero-trust Row-Level Security (RLS) across all tables (`profiles`, `courses`, `modules`, `labs`, `lab_submissions`, `grading_records`, `audit_logs`).

### Milestone 6: Automated PDF Export Engine (Native Client Document Printer)
- [x] **Official Grade Transcript Generator**:
  - Formatted with the FSUU Criminology institutional header, official signatures (Faculty, Program Coordinator, Dean), and exact Section VIII formula breakdown.
  - Generates downloadable `.pdf` documents (`FSUU_CDI409_GradeTranscript_*.pdf`).
- [x] **CHED Outcomes-Based Education (OBE) Certificate**:
  - Generates formal landscape certificate of forensic competency mastery with Dean and VP for Academic Affairs signature lines (`FSUU_CDI409_OBE_Certificate_*.pdf`).
- [x] **Faculty Grade Roster Export**:
  - One-click section grade roster generation in the Faculty Admin Portal.

### Milestone 7: Extended Forensic Crime Lab Suite (Digital & Green Forensics)
- [x] **Comprehensive 8-Unit Interactive Simulators (100% Complete)**:
  - **Unit 1**: Threat Vector Intelligence & Phishing Log Triage Simulator.
  - **Unit 2**: Hardware Disassembly & RFC 3227 Order of Volatility Interactive Tray.
  - **Unit 3**: RA 10175 Statutory Offense Classification & Charge Builder.
  - **Unit 4**: Volatile RAM Hex Dump (`memdump.raw`) & Forensic String Searcher.
  - **Unit 5**: ISO/IEC 27037 Digital Forensics Action Plan Checklist Builder.
  - **Unit 6**: Windows Registry & USBSTOR Timeline Artifact Inspector.
  - **Unit 7**: Supreme Court Judicial Cybercrime Warrant Evaluator (A.M. No. 17-11-03-SC).
  - **Unit 8**: Green Forensics Wildlife (Pangolin scales) & Native Timber Sawdust Morphology Lab.

### Milestone 8: Interactive Case Defense & Discussion Board
- [x] **Moot Investigation Defense Dockets**:
  - **Unit 3**: *State vs. Suspect 'X'* (Defending illegal access under RA 10175 Sec. 4(a)(1) vs accidental access defense, correlating Event ID 1102 log tampering).
  - **Unit 7**: *Warrant to Intercept Computer Data (WICT) vs Right to Privacy* (Justifying real-time electronic surveillance thresholds under A.M. No. 17-11-03-SC).
- [x] **Faculty Review & Peer Argument Feed**:
  - Live student argument submissions and faculty grading feedback.

### Milestone 9: Real-Time Forensic Badges & XP Mastery System
- [x] **5 Multi-Tier Competency Badges**:
  - 🥇 **Volatile Memory Specialist** (Unlocked upon RFC 3227 Order of Volatility 100% precision).
  - 💎 **RAM String & Hex Hunter** (Unlocked by scanning physical memory dumps for plaintext passwords and BitLocker keys).
  - 🥈 **Judicial Cyber Warrant Master** (Unlocked by reviewing Supreme Court warrant protocols).
  - 🌿 **Green Forensics Investigator** (Unlocked by classifying CITES Appendix I Pangolin scales & timber morphology).
  - ⚖️ **Cyber Moot Court Counsel** (Unlocked by filing verified legal arguments in the Case Defense Board).
- [x] **Real-Time Cadet XP Meter & Achievement Hub**:
  - Displays overall XP earned in the sidebar pill and provides an achievement showcase.

### Milestone 10: Philippine Cybercrime Jurisprudence & Supreme Court Rulings Library
- [x] **Supreme Court En Banc & Division Landmark Decisions**:
  - *Disini vs. Secretary of Justice* (G.R. No. 203335 - Constitutionality of RA 10175).
  - *Rule on Cybercrime Warrants* (A.M. No. 17-11-03-SC).
  - *ATM Skimming & Identity Theft Convictions* (G.R. No. 228912).
  - *Resident Marine Mammals vs. Reyes* (G.R. No. 180774 - Environmental Locus Standi & Writ of Kalikasan).
  - *Republic vs. Meralco* (Strict Liability in Environmental Discharge).
- [x] **Instant Category Filter & Keyword Search**:
  - Filter by category (*RA 10175*, *Judicial Warrants*, *Fraud*, *Environmental*) and search by legal doctrine.

### Milestone 11: Text-to-Speech Lesson Concept Audio Player
- [x] **Native Browser SpeechSynthesis Audio Briefings**:
  - Built `components/LessonAudioPlayer.jsx` to narrate unit summaries, legal concepts, and syllabus objectives with zero external network overhead.
  - Allows auditory learning for cadets on mobile or desktop devices.

### Milestone 12: Student Learning Enhancements & Formative Quizzes
- [x] **Collapsible Sidebar Toggle Switch**:
  - Added smooth desktop sidebar collapse / expand toggle (`PanelLeftClose` / `PanelLeftOpen`), enabling cadets to maximize workspace width for forensic lab inspections.
- [x] **Interactive Assessment Timer & Instant Explanations**:
  - Added real-time countdown timer ($60\text{s}$) to formative unit quizzes in [`lib/quizData.js`](file:///d:/AntiGravityProjects/cybersec-lms/lib/quizData.js).
  - Provides instant jurisprudence and forensic rationale breakdowns immediately upon clicking an answer option.
- [x] **On-Demand Forensic Lab Hints**:
  - Integrated a toggleable "Forensic Hint" tool on Crime Labs (e.g. reminding cadets of RFC 3227 volatile layer rules before disassembling evidence).

### Milestone 14: Live Network Packet & Wireshark PCAP Analyzer (Phase 5.1)
- [x] **ISO/OSI Layer 2-7 Packet Stream Inspector**:
  - Embedded an interactive **Wireshark PCAP Workbench** in the student portal (`navSection === "pcap-analyzer"`).
  - Displays real-world incident response capture: `suspect_c2_traffic.pcap`.
  - **Wireshark Display Filters**: Filter live by `All`, `http` (Cleartext Payloads), `dns` (Domain Resolutions), `tcp` (Handshakes), and `credentials` (Exfiltrated Credentials Only).
  - **Interactive Split-Pane Protocol Tree**: Clicking any frame dissects transport layers, sequence numbers, TTLs, and dynamic legal verdicts.
  - **Raw Hex & ASCII Stream Inspector**: Terminal-style raw byte stream viewer with offset parsing.
  - **Forensic Artifact Extraction Engine**: Unearths exfiltrated cleartext usernames, passwords (`P@ssw0rd2026!`), and remote Tor C2 servers (`darknet-c2-portal.xyz`) to support criminal complaints under **RA 10175 Section 4(a)(1)**.

### Milestone 15: Automated Evidence Chain-of-Custody (CoC) PDF Generator (Phase 4.3)
- [x] **Official PNP-ACG Form 04 & ISO/IEC 27037:2012 Generator**:
  - Integrated a dedicated **Chain of Custody (CoC) Workbench** in the Faculty Admin Portal (`/dashboard/admin`).
  - **Case Presets & Scenarios**: One-click selection across *Commercial Banking Ransomware (RA 10175)*, *Live Network Wiretap (A.M. No. 17-11-03-SC WICT)*, *Green Forensics Wildlife & Timber Contraband (RA 9147 / PD 705)*, and *Custom Law Enforcement Dockets*.
  - **Cryptographic Hash Verification**: Live SHA-256 bit-stream integrity checker ensuring forensic specimens remain tamper-free.
  - **Dynamic Specimen Inventory**: Add, view, and manage seized hardware, volatile RAM dumps, network traces, and environmental evidence tags.
  - **Successive Custody Timeline**: Step-by-step accountability ledger tracing evidence turnover from First Responder to RACU 13 Custodian, Forensics Examiner, and Court Prosecution.
  - **One-Click Practicum Integration**: Instructors can generate pre-filled CoC forms directly from cadet practicum submissions in the Practicum Desk.
  - **A4 Courtroom-Grade Document Engine**: Generates standard PNP Anti-Cybercrime Group (RACU 13) printable PDFs with unbroken custody certification and official signature lines.

### Milestone 16: Real-Time Practicum Submissions & Live Grading Desk (Phase 1)
- [x] **End-to-End Practicum Synchronization (`lib/practicumService.js`)**:
  - Centralized real-time service bridging Supabase `public.lab_submissions`, local storage persistence, and dynamic broadcast channels.
  - Seamless handling of remote Supabase records alongside baseline historical cohort submissions with zero cold-start latency.
- [x] **Automated Student Evidence Submission**:
  - Connected all 8 Crime Labs (Hardware Volatility Disassembly, RA 10175 Charges, RAM Hex Dumps, ISO 27037 Plans, USB Artifacts, Cyber Warrants, Green Contraband) and Case Defense briefs directly to the Faculty Desk.
  - Submissions automatically capture rich evidence payloads (extracted hardware sequences, target RAM strings, legal defenses).
  - Mounted a sleek, non-intrusive floating toast confirming evidence transmission to the Faculty Desk.
- [x] **Faculty Assessment Desk Real-Time Enhancements (`/dashboard/admin`)**:
  - Live pulse indicator (**"Live Sync Active"**) displaying real-time connectivity.
  - Instant arrival notification banner when new cadet practicums are logged.
  - Manual on-demand **Refresh** button with spinner state.
  - **Deep Evidence Inspector**: Evaluator modal renders the actual forensic artifacts submitted (e.g. Disassembled hardware items with order indicators, discovered memory passwords, and case defense arguments).
  - **Dynamic Gradebook Sync**: Submitting official faculty marks immediately updates the cadet's classwork standing and recalculates Section VIII OBE cohort averages.
- [x] **PostgreSQL RLS Alignment (`supabase/repair_auth.sql`)**:
  - Configured open and authenticated policies for `public.lab_submissions` to guarantee reliable multi-client data exchange.

### Milestone 17: Moot Case Defense & Legal Jurisprudence Evaluator Desk (Phase 2)
- [x] **Cross-Portal Legal Jurisprudence Pipeline (`lib/discussionData.js`)**:
  - Engineered centralized discussion topic storage (`cdi409_case_topics`) and real-time custom event broadcasting (`cdi409_case_topics_updated`) synchronizing student submissions and faculty bench actions.
  - Full support for the two landmark Philippine cyber jurisprudence dockets:
    - **Docket A (Unit 3)**: *People vs. Cadet Reyes* — RA 10175 Illegal Access & Event ID 1102 Audit Log Clearing.
    - **Docket B (Unit 7)**: *In re: Telco Metadata Subpoena* — A.M. No. 17-11-03-SC Rule on Cybercrime Warrants (WICT) vs. Constitutional Right to Privacy.
- [x] **Student Defense Brief Transmission (`/dashboard/student`)**:
  - Cadets author structured legal briefs with case defense citations, jurisprudence, and statutory arguments.
  - Submissions immediately dispatch real-time events to the Faculty Desk and auto-register a corresponding entry in the Practicum Lab assessment queue.
- [x] **Faculty Bench Ruling & Evaluation Console (`/dashboard/admin`)**:
  - Added dedicated **"Moot Case Defense"** workbench navigation with live badge displaying pending unevaluated briefs.
  - **Docket Inspection Split-Pane**: Review statutory issues, case facts, jurisprudence references, and cadet briefs per docket.
  - **Brief Search & Verification Filter**: Filter briefs by status (*All*, *Pending Bench Review*, *Ruling Issued*) and search by cadet name or defense excerpt.
  - **Faculty Directives Broadcaster**: Allows the instructor to issue binding bench instructions that pin immediately to the active docket thread.
  - **Formal Bench Ruling Modal**:
    - One-click legal jurisprudence preset chips (e.g. *Strict Chain of Custody Upheld*, *Fruit of Poisonous Tree Doctrine*, *Substantial Compliance Established*).
    - Custom judicial commentary and official score award (0-100 pts).
    - Optional award of the prestigious ⚖️ **"Cyber Moot Court Counsel"** badge with verified badge counter.
    - Instant automated gradebook sync updating the cadet's Section VIII classwork standing in real time.

### Milestone 18: Official CHED OBE Form 9 & Dean's Transmittal Exporter (Phase 4)
- [x] **Commission on Higher Education (CHED) Form 9 Report of Ratings Engine (`lib/pdfGenerator.js`)**:
  - Implemented client-side A4 landscape printable document generator (`generateChedForm9PDF`).
  - Strict compliance with CHED CMO No. 5 (Series of 2018) for Bachelor of Science in Criminology.
  - Formats student records with Student ID, Candidate Name, Sex, Curriculum (BSCRIM-4), Section VIII 60% Summative + 40% Classwork breakdown, computed numerical ratings, official Philippine Grade Point Equivalents (1.00 - 5.00), Remarks (*PASSED* / *FAILED*), and Program Outcomes (POb, POc, POd, POe) competency attainment.
  - Automatically aggregates cohort statistical summaries and a 10-tier CHED grade distribution frequency table (1.00 down to 5.00).
  - Quadruple official institutional signature blocks: Faculty/Instructor of Record, Program Coordinator Prof. Ann Margarette M. Diez, Dean Atty. Cedrick G. Train, and VPAA/Registrar Dr. Arlyn M. Floreta.
- [x] **Official Dean's Transmittal Memorandum to University Registrar / VPAA (`lib/pdfGenerator.js`)**:
  - Implemented formal institutional memorandum generator (`generateDeansTransmittalPDF`).
  - Standard FSUU letterhead with official seal styling, Memo Reference Number, and legal narrative articulating syllabus Section VIII compliance.
  - Cohort performance breakdown table cross-comparing Section Alpha, Section Bravo, and Consolidated Cohort totals.
  - Official certification of forensic laboratory outcome mastery (ISO/IEC 27037:2012, RAM volatility triage, cybercrime warrants, green forensics).
  - Formal listing of transmitted enclosures (Enclosures A through D) and Office of the University Registrar archival reception verification stamp.
- [x] **Faculty Admin Transmittal Console & Batch Gradebook Integration (`/dashboard/admin`)**:
  - Added dedicated **"CHED Form 9 & Transmittal"** navigation item in the admin sidebar.
  - Dynamic class filtering (*All / Combined Cohort*, *Section Alpha*, *Section Bravo*) and instant search across enrolled cadets.
  - Interactive tab switcher allowing live document preview of both the CHED Form 9 Master Roster and the Dean's Transmittal Memorandum before printing.
  - Interactive CHED CMO 5 Statistics tab detailing cohort KPI metrics and grade frequency distributions.
  - Embedded one-click quick print actions directly within the **Batch Gradebook & Curve** workbench.

### Milestone 19: Dynamic Syllabus & Unit Editor (Phase 5)
- [x] **Centralized Curriculum Persistence & Broadcast Engine (`lib/curriculum.js`)**:
  - Implemented client-side curriculum storage (`cdi409_curriculum_modules`) and real-time custom event broadcasting (`cdi409_curriculum_updated`).
  - Added `getSavedModules()`, `saveModules()`, and `resetModules()` ensuring seamless multi-client reactivity.
- [x] **Faculty Admin Curriculum Management Workbench (`/dashboard/admin`)**:
  - **Dynamic Unit Grid**: Filter units by grading period (*All*, *Prelims*, *Midterms*, *Semi-Finals*, *Finals*) and search by unit title, topics, or description.
  - **Unit Reordering Engine**: One-click move up / move down buttons that automatically re-index lesson sequences (`Unit 1`, `Unit 2`, etc.) and propagate changes across all portals.
  - **Unit Specification Editor Modal**:
    - Modify unit title, academic period, duration/hour allocations, and descriptive intended learning outcomes (ILOs).
    - Toggle Program Outcomes (PO) mapping checkmarks (`POb`, `POc`, `POd`, `POe`).
    - 5Es Learning Topics list manager: Add new topics on the fly, delete obsolete items, and re-order topics.
    - Integrated Hands-on Forensic Lab parameters: Configure lab title, lab type, and badge classification.
  - **Scaffold New Unit Dialog**: Instructors can author and inject new specialized cyber forensics or green jurisprudence units (e.g., *AI Deepfake Forensics*).
  - **Institutional Baseline Reset**: One-click restore button allowing instructors to revert custom edits back to the approved institutional CHED baseline.
- [x] **Reactive Cadet Learning Hub Integration (`/dashboard/student`)**:
  - Automatically listens to `cdi409_curriculum_updated` events and re-renders lesson cards, topic outlines, and audio briefing scripts in real time without page reload.
  - Progress percentage recalculates dynamically based on the active number of curriculum units.

### Milestone 20: Dynamic Supabase Curriculum with RLS Filtering
- [x] **Database Migration & RLS Constraints (`supabase/update_dynamic_curriculum_rls.sql`)**:
  - Upgraded syllabus units and hands-on labs to fetch dynamically from Supabase (`public.modules` and `public.labs`) instead of local static files.
  - Formulated precise Row Level Security (RLS) policies allowing access for students and instructors while actively locking out the "SuperAdmin" role for future isolated integration, directly matching user specifications.
- [x] **Seamless Faculty & Cadet Sync (`lib/curriculum.js`)**:
  - Converted the curriculum fetch/save cycle to asynchronous methods (`fetchDynamicModules` and `saveModulesDynamic`), instantly bridging Postgres state with immediate React local rendering to preserve a fast UI experience.

### Milestone 21: Enterprise SuperAdmin Governance & IAM (Phase 6)
- [x] **Dynamic IAM Role Provisioning (`/dashboard/superadmin`)**:
  - Replaced static SuperAdmin mock data with real-time `public.profiles` fetching via `lib/superAdminService.js`.
  - Allowed SuperAdmin to dynamically promote or demote users between `student` and `instructor` roles with a single click.
- [x] **Live Enterprise Audit Logging**:
  - Activated live reading of `public.audit_logs`. Role updates made by the SuperAdmin automatically log high-severity audit entries to Postgres for strict accountability.
- [x] **Live System Telemetry**:
  - SuperAdmin dashboard counters (Total Users, Cadet Count, Faculty Count, Lab Sessions) now run actual PostgreSQL count queries, replacing hardcoded statistics.
- [x] **SuperAdmin RLS Bypass Configuration (`supabase/phase6_superadmin_rls.sql`)**:
  - Expanded Row Level Security (RLS) policies. Permitted SuperAdmins to `UPDATE` any user profile (a privilege locked out for standard instructors/cadets).
  - Configured secure read-write access to the `audit_logs` table, restricting sensitive view access solely to the SuperAdmin.

---

## 3. Database Schema Overview

```sql
-- Database Entities & Relations:
public.profiles (id, full_name, student_or_faculty_id, role, section, program, year_level)
public.courses (id, code, title, academic_term, institution)
  └── public.modules (id, course_id, unit_number, title, period, duration, po_mapping, topics)
        ├── public.labs (id, module_id, title, lab_type, instructions, config)
        │     └── public.lab_submissions (id, student_id, lab_id, status, score, evidence_payload)
        └── public.quizzes (id, module_id, title, questions)
              └── public.quiz_attempts (id, student_id, quiz_id, score, answers)

public.grading_records (student_id, course_id, prelim_exam, midterm_exam, semi_final_exam, final_exam, classwork_mean)
  ├── midterm_grade: STORED = (((prelim + midterm) / 2) * 0.60) + (classwork * 0.40)
  ├── tentative_final: STORED = (((semi_final + final) / 2) * 0.60) + (classwork * 0.40)
  └── real_final_grade: (midterm_grade + 2 * tentative_final) / 3

public.audit_logs (id, actor_id, actor_name, action, ip_address, severity, created_at)
```

---

## 4. Key Route Directory

| Route Path | Description | Access Clearance |
| :--- | :--- | :--- |
| **`/`** | Minimal Landing Page with Unified Pop-Up Login & Cadet Registration | Public |
| **`/dashboard/student`** | Dynamic Cadet Learning Hub, Crime Labs Suite & Grade Tracker | Cadet / Student |
| **`/dashboard/admin`** | Faculty Grading Desk, Chain of Custody Generator & Curriculum Management | Faculty Instructor |
| **`/dashboard/superadmin`** | Enterprise Infrastructure & IAM Governance HQ | SuperAdmin |

---

## 5. Future Roadmap & Thesis Defense Enhancements

### Phase 4: Thesis Defense Readiness & Instructor Assessment Suite
1. **Automated Evidence Chain-of-Custody (CoC) Form Generator**:
   - [x] Completed in Milestone 15 with full PNP-ACG Form 04 and ISO/IEC 27037:2012 compliance.
2. **Faculty Batch Assessment & Grade Curve Engine**:
   - [x] Completed in Milestone 4 & 6 with live curves (`Raw`, `+2%`, `+3%`, `+5%`) and PDF grade roster exports.
3. **Thesis Defense Presentation Slide Deck**:
   - *Note: User authored directly in PowerPoint (`.pptx`) for oral defense.*

### Phase 5: Advanced Forensic Labs & Production Deployment
1. **Live Network Packet & Wireshark PCAP Analyzer (Unit 4/5)**:
   - [x] Completed in Milestone 14 (`suspect_c2_traffic.pcap`, filter engine, credential extraction).
2. **Environmental Geospatial Map & Hotspot Tracker (Unit 8)**:
   - Interactive GIS map for Caraga and Agusan River basin protected zones (NIPAS Act protected areas and logging hotspots).
3. **Cloud Production Deployment (Vercel & Supabase Live)**:
   - Production build optimization, automated SSL configuration, and live URL staging.
