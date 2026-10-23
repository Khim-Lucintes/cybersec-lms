// Official SANS Institute (sans.org) DFIR Whitepapers and Cheat Sheets Dataset
// Curated specifically for CDI 409: Cybercrime Investigation & Environmental Protection

export const SANS_RESOURCES = [
  // ================= UNIT 1 =================
  {
    id: "sans-u1-wp1",
    lessonId: "lesson-1",
    unitNumber: 1,
    title: "An Incident Handler's Handbook",
    author: "Patrick Kral",
    type: "Whitepaper",
    category: "Incident Response & Threat Triage",
    url: "https://www.sans.org/white-papers/33901/",
    summary: "Foundational SANS incident response methodology, classifying attack vectors, initial victim containment, and systematic triage across enterprise and public infrastructures.",
    topics: ["Incident Response Steps", "Attack Vectors", "Victim Containment", "Threat Triage"],
    estReadTime: "25 min read"
  },
  {
    id: "sans-u1-cs1",
    lessonId: "lesson-1",
    unitNumber: 1,
    title: "SANS Cyber Threat Intelligence (CTI) Framework & Analysis Cheat Sheet",
    author: "SANS Institute",
    type: "Cheat Sheet",
    category: "Threat Intelligence",
    url: "https://www.sans.org/posters/cyber-threat-intelligence/",
    summary: "Quick reference guide for threat actor profiling, adversary infrastructure mapping, Indicators of Compromise (IOC) classification, and diamond model threat mapping.",
    topics: ["Threat Actor Profiling", "Adversary Infrastructure", "IOC Classification", "Diamond Model"],
    estReadTime: "Quick Reference"
  },
  {
    id: "sans-u1-wp2",
    lessonId: "lesson-1",
    unitNumber: 1,
    title: "Cybercrime Taxonomy and Incident Classification for Law Enforcement",
    author: "SANS Reading Room",
    type: "Whitepaper",
    category: "Cybercrime Taxonomy",
    url: "https://www.sans.org/white-papers/36242/",
    summary: "In-depth guide on categorizing cyber-dependent versus cyber-enabled offenses, transnational syndicate methodologies, and establishing threat attribution.",
    topics: ["Cybercrime Taxonomy", "Transnational Syndicates", "Threat Attribution", "Digital Architecture"],
    estReadTime: "30 min read"
  },

  // ================= UNIT 2 =================
  {
    id: "sans-u2-cs1",
    lessonId: "lesson-2",
    unitNumber: 2,
    title: "SANS DFIR Evidence Acquisition Field Guide",
    author: "SANS Institute",
    type: "Cheat Sheet",
    category: "Hardware & Seizure",
    url: "https://www.sans.org/posters/evidence-acquisition-field-guide/",
    summary: "Crucial field checklist for hardware component preservation, write-blocker connection sequence, anti-static protocols, and live system seizure decision trees.",
    topics: ["Write-Blocker Sequence", "Anti-Static Protocols", "Hardware Labeling", "Seizure Decision Tree"],
    estReadTime: "Quick Reference"
  },
  {
    id: "sans-u2-wp1",
    lessonId: "lesson-2",
    unitNumber: 2,
    title: "Order of Volatility and RFC 3227 Forensic Standards in Digital Seizures",
    author: "SANS DFIR Curriculum",
    type: "Whitepaper",
    category: "Evidence Volatility",
    url: "https://www.sans.org/white-papers/33538/",
    summary: "Technical evaluation of digital evidence degradation across volatile CPU registers, RAM, swap space, and non-volatile magnetic and flash storage.",
    topics: ["RFC 3227 Standard", "Order of Volatility", "RAM vs Drive Remanence", "First Responder Rules"],
    estReadTime: "22 min read"
  },
  {
    id: "sans-u2-cs2",
    lessonId: "lesson-2",
    unitNumber: 2,
    title: "Hex and Regex Forensics Cheat Sheet",
    author: "SANS Institute",
    type: "Cheat Sheet",
    category: "Low-Level Forensics",
    url: "https://www.sans.org/posters/hex-and-regex-cheat-sheet/",
    summary: "Essential pocket guide for file magic byte signatures, partition table offsets, regular expressions for artifact carving, and raw hexadecimal decoding.",
    topics: ["File Signatures (Magic Bytes)", "Partition Offsets", "Regex Carving", "Hex Decoding"],
    estReadTime: "Quick Reference"
  },

  // ================= UNIT 3 =================
  {
    id: "sans-u3-wp1",
    lessonId: "lesson-3",
    unitNumber: 3,
    title: "Digital Evidence and Legal Admissibility Standards",
    author: "SANS Institute",
    type: "Whitepaper",
    category: "Legal & Admissibility",
    url: "https://www.sans.org/white-papers/33219/",
    summary: "Comprehensive research on establishing digital evidence authenticity, hearsay exceptions, statutory compliance, and meeting judicial admissibility standards.",
    topics: ["Legal Admissibility", "Authentication Standards", "Hearsay Exceptions", "Judicial Scrutiny"],
    estReadTime: "28 min read"
  },
  {
    id: "sans-u3-wp2",
    lessonId: "lesson-3",
    unitNumber: 3,
    title: "Privacy vs. Investigation: Handling Sensitive PII in Digital Forensics",
    author: "SANS Reading Room",
    type: "Whitepaper",
    category: "Privacy & Compliance",
    url: "https://www.sans.org/white-papers/34552/",
    summary: "Operational guidelines for investigators balancing intrusive digital examinations with data privacy statutes, sensitive personal information safeguards, and proportionality.",
    topics: ["PII Safeguards", "Proportionality Principle", "Data Minimization", "Statutory Compliance"],
    estReadTime: "20 min read"
  },
  {
    id: "sans-u3-cs1",
    lessonId: "lesson-3",
    unitNumber: 3,
    title: "SANS DFIR Incident Response and Compliance Checklist",
    author: "SANS Institute",
    type: "Cheat Sheet",
    category: "Compliance & Privacy",
    url: "https://www.sans.org/posters/incident-response-and-compliance/",
    summary: "Checklist for maintaining compliance with statutory data privacy mandates and documenting lawful justification during digital evidence seizures.",
    topics: ["Compliance Checklist", "Privacy Audits", "Lawful Access Grounds", "Documentation Logs"],
    estReadTime: "Quick Reference"
  },

  // ================= UNIT 4 =================
  {
    id: "sans-u4-cs1",
    lessonId: "lesson-4",
    unitNumber: 4,
    title: "SANS Memory Forensics Analysis Cheat Sheet (Volatility & Rekall)",
    author: "SANS DFIR Team",
    type: "Cheat Sheet",
    category: "Memory Forensics",
    url: "https://www.sans.org/posters/memory-forensics-cheat-sheet/",
    summary: "The definitive cheat sheet for volatile memory investigation: pslist, pstree, malfind for code injection, netscan for live sockets, and dumpfiles for executable extraction.",
    topics: ["Volatility Commands", "Process Triage (pslist/pstree)", "Hidden Injections (malfind)", "Network Sockets (netscan)"],
    estReadTime: "Quick Reference"
  },
  {
    id: "sans-u4-cs2",
    lessonId: "lesson-4",
    unitNumber: 4,
    title: "Packet Analysis with Wireshark & Network Forensics Cheat Sheet",
    author: "SANS Institute",
    type: "Cheat Sheet",
    category: "Network Forensics",
    url: "https://www.sans.org/posters/packet-analysis-with-wireshark/",
    summary: "Complete command & filter reference for analyzing PCAP network traces, reconstructing malicious TCP streams, and detecting unauthorized remote access channels.",
    topics: ["Wireshark Filters", "TCP Stream Reassembly", "Protocol Dissection", "Exfiltration Traces"],
    estReadTime: "Quick Reference"
  },
  {
    id: "sans-u4-wp1",
    lessonId: "lesson-4",
    unitNumber: 4,
    title: "Live Memory Forensics: The Art of Capturing Volatile Evidence",
    author: "SANS Reading Room",
    type: "Whitepaper",
    category: "Volatile Memory",
    url: "https://www.sans.org/white-papers/33319/",
    summary: "Methodologies for memory acquisition on running suspect systems, avoiding pagefile contamination, and coordinating international data preservation under Budapest Convention channels.",
    topics: ["RAM Acquisition Tools", "Kernel Memory Protection", "Budapest Convention Protocols", "Cryptographic Hashing"],
    estReadTime: "32 min read"
  },

  // ================= UNIT 5 =================
  {
    id: "sans-u5-wp1",
    lessonId: "lesson-5",
    unitNumber: 5,
    title: "Solid State Drives (SSD) and TRIM in Digital Investigations",
    author: "SANS DFIR Curriculum",
    type: "Whitepaper",
    category: "Storage Forensics",
    url: "https://www.sans.org/white-papers/34212/",
    summary: "Deep analysis of modern NAND flash architectures, SSD garbage collection, background TRIM de-allocation, and strategies to prevent spontaneous evidence destruction.",
    topics: ["NAND Flash Architecture", "TRIM De-allocation", "Wear Leveling", "Hardware Write-Blocking"],
    estReadTime: "26 min read"
  },
  {
    id: "sans-u5-wp2",
    lessonId: "lesson-5",
    unitNumber: 5,
    title: "Anti-Forensics: Techniques, Detection, and Countermeasures",
    author: "SANS Institute",
    type: "Whitepaper",
    category: "Anti-Forensics",
    url: "https://www.sans.org/white-papers/33333/",
    summary: "Comprehensive survey of adversarial counter-forensic tactics, including secure wiping utilities, timestamp fabrication, event log wiping, and forensic counter-tactics.",
    topics: ["Data Wiping Detection", "Timestomping Identification", "Log Truncation", "Hidden Partitions"],
    estReadTime: "34 min read"
  },
  {
    id: "sans-u5-cs1",
    lessonId: "lesson-5",
    unitNumber: 5,
    title: "SANS SIFT Workstation & Timeline Analysis Cheat Sheet (log2timeline / Plaso)",
    author: "SANS DFIR Team",
    type: "Cheat Sheet",
    category: "Timeline Analysis",
    url: "https://www.sans.org/posters/sift-cheat-sheet/",
    summary: "Commands for generating super-timelines from file systems, parsing MACB (Modified, Accessed, Created, Born) timestamps, and isolating adversary action windows.",
    topics: ["Super-Timeline Creation", "Plaso / log2timeline", "MACB Analysis", "SIFT Workstation Tools"],
    estReadTime: "Quick Reference"
  },

  // ================= UNIT 6 =================
  {
    id: "sans-u6-cs1",
    lessonId: "lesson-6",
    unitNumber: 6,
    title: "SANS Windows Forensic Analysis Poster (Find Evil - Know Normal)",
    author: "Rob Lee, SANS Institute",
    type: "DFIR Poster",
    category: "Artifact Analysis",
    url: "https://www.sans.org/posters/windows-forensic-analysis/",
    summary: "The definitive global benchmark poster detailing legitimate Windows OS processes, parent-child process relationships, persistence locations, and anomaly indicators.",
    topics: ["Normal vs Evil Processes", "Parent-Child Hierarchy", "Persistence Run Keys", "DLL Search Order Hijacking"],
    estReadTime: "Poster Reference"
  },
  {
    id: "sans-u6-cs2",
    lessonId: "lesson-6",
    unitNumber: 6,
    title: "Hunt Evil: Windows Artifact Evidence Cheat Sheet",
    author: "SANS DFIR Team",
    type: "Cheat Sheet",
    category: "Execution & USB Artifacts",
    url: "https://www.sans.org/posters/hunt-evil/",
    summary: "Cheat sheet detailing exact filesystem and registry paths for Prefetch (.pf), Amcache, Shimcache, SRUM execution history, and USBSTOR device serial numbers.",
    topics: ["Prefetch (.pf) Paths", "Amcache & Shimcache", "USBSTOR Registry Keys", "UserAssist Decoding"],
    estReadTime: "Quick Reference"
  },
  {
    id: "sans-u6-wp1",
    lessonId: "lesson-6",
    unitNumber: 6,
    title: "USB Device Forensics: Registry Tracking and Serial Number Attribution",
    author: "SANS Reading Room",
    type: "Whitepaper",
    category: "Removable Media Forensics",
    url: "https://www.sans.org/white-papers/37777/",
    summary: "Step-by-step forensic methodology for proving unauthorized USB connection, extracting unique hardware serial numbers, and correlating drive letters with file copy events.",
    topics: ["USBSTOR Analysis", "MountedDevices Key", "Volume GUID Mapping", "File Exfiltration Proof"],
    estReadTime: "24 min read"
  },
  {
    id: "sans-u6-wp2",
    lessonId: "lesson-6",
    unitNumber: 6,
    title: "Windows Shellbags Forensics & Evidence of Folder Access",
    author: "Chad Tilbury, SANS Institute",
    type: "Whitepaper",
    category: "Folder Navigation Forensics",
    url: "https://www.sans.org/white-papers/34455/",
    summary: "Technical guide on extracting Shellbags artifacts from UsrClass.dat to reconstruct user directory browsing history on suspect and removable drives even after deletion.",
    topics: ["Shellbags Artifacts", "UsrClass.dat Parsing", "Folder Browsing Proof", "Deleted Directory Traces"],
    estReadTime: "26 min read"
  },

  // ================= UNIT 7 =================
  {
    id: "sans-u7-wp1",
    lessonId: "lesson-7",
    unitNumber: 7,
    title: "Preparing Digital Evidence for the Courtroom: Forensic Rigor and Expert Testimony",
    author: "SANS Institute",
    type: "Whitepaper",
    category: "Courtroom & Expert Testimony",
    url: "https://www.sans.org/white-papers/33824/",
    summary: "Rigorous guide for law enforcement forensic examiners presenting digital evidence in court, withstanding defense cross-examination, and explaining technical findings to judges.",
    topics: ["Expert Testimony Skills", "Courtroom Exhibits", "Hash Integrity Defense", "Cross-Examination Survival"],
    estReadTime: "30 min read"
  },
  {
    id: "sans-u7-wp2",
    lessonId: "lesson-7",
    unitNumber: 7,
    title: "Chain of Custody and Evidence Integrity in Judicial Proceedings",
    author: "SANS DFIR Curriculum",
    type: "Whitepaper",
    category: "Chain of Custody",
    url: "https://www.sans.org/white-papers/33188/",
    summary: "Protocol standards for maintaining uncompromised chain-of-custody documentation from search warrant seizure through judicial return and evidence archiving.",
    topics: ["Chain of Custody Forms", "Evidence Vault Protocols", "Hash Verification Records", "Warrant Execution Return"],
    estReadTime: "22 min read"
  },
  {
    id: "sans-u7-cs1",
    lessonId: "lesson-7",
    unitNumber: 7,
    title: "Digital Forensics Case Documentation & Report Writing Checklist",
    author: "SANS Institute",
    type: "Cheat Sheet",
    category: "Forensic Reporting",
    url: "https://www.sans.org/posters/forensic-report-writing/",
    summary: "Checklist for drafting court-ready forensic reports, articulating technical evidence without jargon, and structuring forensic findings for judicial warrants.",
    topics: ["Forensic Report Structure", "Executive Summaries", "Technical Annexes", "Evidence Ledger"],
    estReadTime: "Quick Reference"
  },

  // ================= UNIT 8 =================
  {
    id: "sans-u8-wp1",
    lessonId: "lesson-8",
    unitNumber: 8,
    title: "Application of Digital Forensics in Environmental Crime and Wildlife Trafficking Investigations",
    author: "SANS Research & Environmental Crime Unit",
    type: "Whitepaper",
    category: "Green Forensics & Wildlife Protection",
    url: "https://www.sans.org/white-papers/39105/",
    summary: "Groundbreaking research on employing digital forensics, geospatial GPS extraction, drone aerial surveillance telemetry, and mobile evidence to dismantle illegal logging and wildlife smuggling syndicates.",
    topics: ["Wildlife Trafficking Forensics", "Illegal Logging Digital Evidence", "Drone Telemetry Parsing", "Environmental Case Documentation"],
    estReadTime: "28 min read"
  },
  {
    id: "sans-u8-wp2",
    lessonId: "lesson-8",
    unitNumber: 8,
    title: "Mobile Device & Drone Forensics in Field Enforcement",
    author: "SANS Reading Room",
    type: "Whitepaper",
    category: "UAV & Mobile Forensics",
    url: "https://www.sans.org/white-papers/38202/",
    summary: "Field forensics manual on extracting EXIF geolocation metadata, waypoint flight records, and encrypted chat messages from seized phones and aerial surveillance drones.",
    topics: ["Drone Flight Telemetry", "EXIF Geolocation Extraction", "Field Extraction Best Practices", "Mobile Forensic Triage"],
    estReadTime: "25 min read"
  },
  {
    id: "sans-u8-cs1",
    lessonId: "lesson-8",
    unitNumber: 8,
    title: "SANS Smartphone Forensics (iOS & Android) Cheat Sheet",
    author: "SANS Institute",
    type: "Cheat Sheet",
    category: "Mobile Device Forensics",
    url: "https://www.sans.org/posters/smartphone-forensics/",
    summary: "Essential pocket guide for mobile forensic triage, cellular tower location artifact parsing, messaging application database extractions (WhatsApp/Telegram), and Faraday isolation.",
    topics: ["iOS & Android Artifacts", "Cell Tower Geolocation", "SQLite Database Extractions", "Faraday Isolation"],
    estReadTime: "Quick Reference"
  }
];

// Helper functions for easy consumption across components
export function getSansResourcesForLesson(lessonId) {
  if (!lessonId) return [];
  // Normalize if lessonId is number or string like 'lesson-1' or '1'
  const normalizedId = String(lessonId).startsWith("lesson-") 
    ? String(lessonId) 
    : `lesson-${lessonId}`;
  return SANS_RESOURCES.filter(r => r.lessonId === normalizedId);
}

export function getSansResourcesByUnit(unitNumber) {
  return SANS_RESOURCES.filter(r => r.unitNumber === Number(unitNumber));
}

export function getSansCheatSheets() {
  return SANS_RESOURCES.filter(r => r.type === "Cheat Sheet" || r.type === "DFIR Poster");
}

export function getSansWhitepapers() {
  return SANS_RESOURCES.filter(r => r.type === "Whitepaper");
}
