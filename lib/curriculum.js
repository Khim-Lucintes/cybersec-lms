import { supabase } from "./supabaseClient";

export const COURSE_INFO = {
  code: "CDI 409",
  title: "Intro to Cybercrime and Environmental Laws and Protection",
  institution: "Father Saturnino Urios University",
  department: "Criminal Justice Education Program",
  city: "Butuan City",
  description:
    "This course covers an overview of cybercrime, including basic understanding of computer technology, history of cybercrimes, nature and types of cybercrimes, incident response, collection, and preservation; a digital investigative plan, and the applicable legal provision (RA 10175, Rule on Cybercrime Warrants). This also covers environmental laws, ecosystem/biodiversity protection, wildlife trafficking, and environmental jurisprudence.",
  gradingSystem: {
    summativeWeight: 0.60, // Prelims (50%) + Midterm (50%) in first half; Semi-finals (50%) + Finals (50%) in second half
    classworkWeight: 0.40, // Quizzes, Reports, Practicum Labs, Reactionnaires, Oral Assessments
    passingGrade: 75.0,
  },
  programOutcomes: [
    {
      id: "POb",
      title: "Human Rights & Victim Welfare",
      description: "Internalize concepts of human rights and victim welfare in cybercrime investigation."
    },
    {
      id: "POc",
      title: "Law Enforcement & Criminal Justice",
      description: "Demonstrate competence and broad understanding in law enforcement administration, digital forensics, and jurisprudence."
    },
    {
      id: "POd",
      title: "Forensic Science & Detection",
      description: "Utilize criminalistics and forensic science tools in the search, collection, and preservation of digital & environmental evidence."
    },
    {
      id: "POe",
      title: "Legal Principles & Environmental Protection",
      description: "Apply principles of criminal law, warrants, and special environmental rules of procedure."
    }
  ]
};

export const SYLLABUS_MODULES = [
  {
    id: "lesson-1",
    lessonNumber: 1,
    title: "Overview of Cybercrime & Cyberspace",
    period: "Prelims",
    duration: "4 Hours",
    poMapping: ["POb"],
    description: "General concepts of cyberspace, nature of cybercrime, cybercriminals, networks, and victim rights.",
    topics: [
      "Introduction to Cyberspace & Digital Architecture",
      "Nature & Taxonomy of Cybercrimes",
      "Historical Background of Cyberattacks",
      "Cybercriminals & Transnational Syndicates",
      "Preventive Countermeasures & Victim Rights"
    ],
    lab: {
      id: "lab-1",
      title: "Cyber Threat Intelligence & Vector Identification",
      type: "interactive-scenario",
      badge: "Scenario Lab"
    }
  },
  {
    id: "lesson-2",
    lessonNumber: 2,
    title: "Computer Hardware & Forensic Component Disassembly",
    period: "Prelims",
    duration: "4 Hours",
    poMapping: ["POc", "POd"],
    description: "The 4 main computer components, primary/secondary storage, and proper hardware disassembly for digital evidence recovery.",
    topics: [
      "4 Main Components (Input, Output, Storage, Processing)",
      "Primary (RAM) vs Secondary Storage (HDD/SSD)",
      "Hardware Preservation & Anti-Static Handling",
      "Physical Component Identification for LEAs",
      "Disassembly Sequence for Digital Data Retrieval"
    ],
    lab: {
      id: "lab-2",
      title: "Virtual Computer Disassembly & Evidence Extraction Lab",
      type: "hardware-disassembly",
      badge: "Hands-on Lab"
    }
  },
  {
    id: "lesson-3",
    lessonNumber: 3,
    title: "Cybercrime Offenses (RA 10175) & Data Privacy Act (RA 10173)",
    period: "Prelims Examination",
    duration: "4 Hours",
    poMapping: ["POc", "POe"],
    description: "Comprehensive statutory study of Republic Act 10175 (Cybercrime Prevention Act) and Republic Act 10173 (Data Privacy Act of 2012) in Law Enforcement Administration.",
    topics: [
      "RA 10175 Sec 4(a): Offenses Against Confidentiality, Integrity & Availability (Illegal Access, Interception, Interference, Cybersquatting)",
      "RA 10175 Sec 4(b): Computer-Related Forgery & Identity Theft",
      "RA 10175 Sec 4(c): Content-Related Offenses (Cybersex, Child Sexual Abuse Material)",
      "RA 10173 (Data Privacy Act): General Principles (Transparency, Legitimate Purpose, Proportionality) & NPC Mandates",
      "RA 10173 Sec 25-32: Unauthorized Processing of Sensitive Personal Information & Criminal Liability",
      "Law Enforcement Exemption: Lawful Processing for Criminal Investigation & Cybercrime Warrant Execution"
    ],
    lab: {
      id: "lab-3",
      title: "RA 10175 Cybercrime & RA 10173 Privacy Legal Classification Simulator",
      type: "legal-scenario",
      badge: "Legal Practicum"
    }
  },
  {
    id: "lesson-4",
    lessonNumber: 4,
    title: "Incident Response, Preservation & Collection",
    period: "Midterms",
    duration: "4 Hours",
    poMapping: ["POd"],
    description: "International preservation protocols (Budapest Convention, G7 24/7 Network), 3rd-party preservation, and first responder triage.",
    topics: [
      "Budapest Convention on Cybercrime (Convention 185)",
      "G7 24/7 High-Tech Crime Network Data Preservation",
      "Law Enforcement Request Portals (Meta, Google, Apple)",
      "Live Response: Visual Assessment of Powered-On Systems",
      "Order of Volatility & RAM Preservation Principles"
    ],
    lab: {
      id: "lab-4",
      title: "First Responder Triage & Volatile RAM Imaging Simulator",
      type: "triage-simulator",
      badge: "Live Triage Lab"
    }
  },
  {
    id: "lesson-5",
    lessonNumber: 5,
    title: "Digital Investigative Plan & Storage Analysis",
    period: "Midterm Examination",
    duration: "4 Hours",
    poMapping: ["POc", "POd"],
    description: "Electromagnetic vs Solid State storage, file persistence, cloud/mobile forensics, and counter-forensic activity detection.",
    topics: [
      "Electromagnetic vs SSD Storage Forensics (TRIM/Wear Leveling)",
      "File Deletion Mechanics & Data Remanence",
      "Physical vs Logical Evidence Extraction",
      "MACB Timestamps & Timeline Reconstruction",
      "Counter-Forensic Detection (Event Log Clearing, Anti-Forensic Tools)"
    ],
    lab: {
      id: "lab-5",
      title: "Digital Investigative Action Plan & Chain of Custody Builder",
      type: "investigative-plan",
      badge: "Forensics Plan Lab"
    }
  },
  {
    id: "lesson-6",
    lessonNumber: 6,
    title: "Initial Examination of Digital Evidence (Artifacts)",
    period: "Semi-Finals",
    duration: "4 Hours",
    poMapping: ["POc", "POd"],
    description: "Forensic artifact analysis: Program execution (Shimcache, Prefetch), USB connection history, and location/communication traces.",
    topics: [
      "File Knowledge & Shellbags Artifacts",
      "Application Execution Activity (Prefetch, UserAssist, LNK files)",
      "USB Registry Analysis (Device Identification & Insertion Timestamps)",
      "Geolocation & Wi-Fi Triangulation Artifacts",
      "Time Manipulation & Timestomping Analysis"
    ],
    lab: {
      id: "lab-6",
      title: "Forensic Artifact Registry & USB History Inspector",
      type: "artifact-analysis",
      badge: "Artifact Lab"
    }
  },
  {
    id: "lesson-7",
    lessonNumber: 7,
    title: "Cybercrime Warrants & Judicial Issuances (A.M. No. 17-11-03-SC)",
    period: "Semi-Final Examination",
    duration: "4 Hours",
    poMapping: ["POc", "POe"],
    description: "Philippine Supreme Court Rule on Cybercrime Warrants: WDCD, WSCD, WICT, WECD, and WDCD (Destroy).",
    topics: [
      "Warrant to Disclose Computer Data (WDCD)",
      "Warrant to Intercept Computer Data (WICT)",
      "Warrant to Search, Seize and Examine Computer Data (WSCD)",
      "Warrant to Examine Computer Data (WECD)",
      "Warrant to Destroy Computer Data (WDCD) & Custody Rules"
    ],
    lab: {
      id: "lab-7",
      title: "Cybercrime Warrant Application Drafting & Assessment",
      type: "warrant-builder",
      badge: "Court Practicum"
    }
  },
  {
    id: "lesson-8",
    lessonNumber: 8,
    title: "Environmental Laws & Wildlife Protection (Green Forensics)",
    period: "Finals Examination",
    duration: "4 Hours",
    poMapping: ["POc", "POd", "POe"],
    description: "NIPAS Act, Wildlife Trafficking, CITES/IUCN Red List identification, sawdust morphology, and Rules of Procedure for Environmental Cases.",
    topics: [
      "Environmental Jurisprudence & NIPAS Act",
      "Wildlife Trafficking Detection & CITES / IUCN / Philippine Red List",
      "Forensic Wildlife Identification & Sawdust Morphology Techniques",
      "Required Permits & Transport Documentation Verification",
      "Special Rules of Procedure for Environmental Cases (Writ of Kalikasan)"
    ],
    lab: {
      id: "lab-8",
      title: "Wildlife Crime & Illegal Logging Forensic Lab",
      type: "environmental-lab",
      badge: "Green Forensics Lab"
    }
  }
];

export const MOCK_STUDENT_PROFILE = {
  id: "STU-2026-4091",
  name: "Student Juan Dela Cruz",
  program: "Bachelor of Science in Criminology (BS Crim)",
  yearLevel: "4th Year",
  section: "Section Alpha",
  institution: "Father Saturnino Urios University",
  currentGpa: "1.45 (91.2%)",
  completedLessons: 3,
  totalLessons: 8,
  grades: {
    prelims: 90,
    midterms: 88,
    semiFinals: 90,
    tentativeFinal: 92.5,
    classwork: 89.5,
    finalGrade: 90.28, // Equivalent to 1.5 in Philippine Grading Scale
  }
};

export const CURRICULUM_STORAGE_KEY = "cdi409_curriculum_modules";

export function getSavedModules() {
  if (typeof window === "undefined") return SYLLABUS_MODULES;
  try {
    const raw = localStorage.getItem(CURRICULUM_STORAGE_KEY);
    if (!raw) return SYLLABUS_MODULES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SYLLABUS_MODULES;
  } catch (err) {
    console.warn("Error reading stored curriculum modules:", err);
    return SYLLABUS_MODULES;
  }
}

export function saveModules(modules) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CURRICULUM_STORAGE_KEY, JSON.stringify(modules));
    window.dispatchEvent(new CustomEvent("cdi409_curriculum_updated", { detail: modules }));
  } catch (err) {
    console.error("Error saving curriculum modules:", err);
  }
}

export async function fetchDynamicModules() {
  try {
    // Attempt to fetch from Supabase
    const { data: modulesData, error: modulesError } = await supabase
      .from('modules')
      .select('*, labs(*)')
      .order('unit_number', { ascending: true });

    if (modulesError) throw modulesError;

    if (modulesData && modulesData.length > 0) {
      const dynamicModules = modulesData.map(mod => {
        const lab = mod.labs && mod.labs.length > 0 ? mod.labs[0] : null;
        return {
          db_id: mod.id,
          id: `lesson-${mod.unit_number}`,
          lessonNumber: mod.unit_number,
          title: mod.title,
          period: mod.period,
          duration: mod.duration,
          poMapping: mod.po_mapping || [],
          description: mod.description || "",
          topics: mod.topics || [],
          lab: lab ? {
            db_id: lab.id,
            id: `lab-${mod.unit_number}`,
            title: lab.title,
            type: lab.lab_type,
            badge: lab.config?.badge || "Hands-on Lab"
          } : {
            id: `lab-${mod.unit_number}`,
            title: "Custom Lab",
            type: "interactive-scenario",
            badge: "Hands-on Lab"
          }
        };
      });
      // Sync to local cache
      saveModules(dynamicModules);
      return dynamicModules;
    }
  } catch (err) {
    console.warn("Error fetching dynamic curriculum, falling back to local:", err);
  }
  return getSavedModules();
}

export async function saveModulesDynamic(modules) {
  saveModules(modules); // instant UI update
  
  try {
    // Get the course ID first
    const { data: courseData } = await supabase.from('courses').select('id').limit(1).single();
    const courseId = courseData?.id;

    for (const mod of modules) {
      if (mod.db_id) {
        await supabase.from('modules').update({
          unit_number: mod.lessonNumber,
          title: mod.title,
          period: mod.period,
          duration: mod.duration,
          po_mapping: mod.poMapping,
          description: mod.description,
          topics: mod.topics
        }).eq('id', mod.db_id);
        
        if (mod.lab && mod.lab.db_id) {
          await supabase.from('labs').update({
            title: mod.lab.title,
            lab_type: mod.lab.type
          }).eq('id', mod.lab.db_id);
        }
      } else if (courseId) {
        // Insert new module
        const { data: insertedMod } = await supabase.from('modules').insert({
          course_id: courseId,
          unit_number: mod.lessonNumber,
          title: mod.title,
          period: mod.period,
          duration: mod.duration,
          po_mapping: mod.poMapping,
          description: mod.description,
          topics: mod.topics
        }).select().single();
        
        if (insertedMod && mod.lab) {
          await supabase.from('labs').insert({
            module_id: insertedMod.id,
            title: mod.lab.title,
            lab_type: mod.lab.type,
            instructions: "Dynamic lab instructions",
            config: { badge: mod.lab.badge }
          });
        }
      }
    }
  } catch (err) {
    console.warn("Error saving dynamic curriculum to Supabase:", err);
  }
}

export function resetModules() {
  if (typeof window === "undefined") return SYLLABUS_MODULES;
  try {
    localStorage.removeItem(CURRICULUM_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("cdi409_curriculum_updated", { detail: SYLLABUS_MODULES }));
    return SYLLABUS_MODULES;
  } catch (err) {
    console.error("Error resetting curriculum modules:", err);
    return SYLLABUS_MODULES;
  }
}
