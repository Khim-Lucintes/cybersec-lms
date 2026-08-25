# CDI 409 Cybersecurity LMS — Project Checkpoint & Architecture Documentation

**Institution**: Father Saturnino Urios University (FSUU)  
**Program**: Criminal Justice Education Program (BS Criminology)  
**Course Code**: CDI 409: Intro to Cybercrime and Environmental Laws and Protection  
**Document Version**: v3.0 (Comprehensive Feature Suite & Minimal UI Complete)  
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
- [x] **Faculty Admin Portal (`/dashboard/admin`)**:
  - Command analytics and live student submission feed.
  - Practicum evaluation desk with modal scoring.
  - 5Es syllabus architect and cohort rankings.
- [x] **SuperAdmin Governance Portal (`/dashboard/superadmin`)**:
  - Cloud node topology and Level III accreditation status.
  - Faculty user provisioning modal.
  - Supabase Row-Level Security (RLS) matrix and immutable audit trail.

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
| **`/dashboard/admin`** | Faculty Grading Desk, Analytics & Curriculum Management | Faculty Instructor |
| **`/dashboard/superadmin`** | Enterprise Infrastructure & IAM Governance HQ | SuperAdmin |

---

## 5. Future Roadmap & Thesis Defense Enhancements

### Phase 4: Thesis Defense Readiness & Instructor Assessment Suite
1. **Interactive Thesis Defense Presentation Slide Deck (`/presentation`)**:
   - Built-in slide presentation mode showcasing the problem statement, curriculum alignment, OBE formula, and live system demonstration for panel members.
2. **Faculty Batch Assessment & Grade Curve Engine**:
   - Advanced grading tools allowing faculty to apply grade adjustments, view section distributions, and batch-publish final grades.
3. **Automated Evidence Chain-of-Custody (CoC) Form Generator**:
   - Printable official PNP/NBI standard chain-of-custody forms auto-filled with lab specimen serial numbers and hashes.

### Phase 5: Advanced Forensic Labs & Production Deployment
1. **Live Network Packet & Wireshark PCAP Analyzer (Unit 4/5)**:
   - Visual web-based PCAP inspector to extract unencrypted HTTP credentials and DNS queries from suspect network captures.
2. **Environmental Geospatial Map & Hotspot Tracker (Unit 8)**:
   - Interactive GIS map for Caraga and Agusan River basin protected zones (NIPAS Act protected areas and logging hotspots).
3. **Cloud Production Deployment (Vercel & Supabase Live)**:
   - Production build optimization, automated SSL configuration, and live URL staging.
