import { getSansResourcesForLesson } from "./sansResources";

// Detailed, syllabus-grounded lesson lecture notes for all 8 units of CDI 409

export const LESSON_DETAILS = {
  "lesson-1": {
    sansResources: getSansResourcesForLesson("lesson-1"),
    readTime: "12 min read",
    learningObjectives: [
      "Define cyberspace architecture and differentiate cybercrimes from traditional computer-assisted crimes.",
      "Analyze the taxonomy of malicious cyber threat actors, including transnational cyber syndicates.",
      "Understand victims' constitutional rights and reporting mechanisms under the Cybercrime Investigation and Coordinating Center (CICC)."
    ],
    lectureBody: [
      {
        heading: "1. Understanding Cyberspace & Digital Architecture",
        content: `Cyberspace is the complex, interdependent global environment of information technology infrastructures, telecommunication networks, and computer processing systems. Unlike physical crime scenes with clear boundaries, cyberspace crimes transcend territorial jurisdictions, allowing threat actors to exploit victims in Butuan City or Manila from any terminal globally.`
      },
      {
        heading: "2. Taxonomy of Cyber Threats & Cybercriminals",
        content: `Modern cybercrime is categorized into:
- **Cyber-dependent crimes**: Offenses that can only be committed using computers and networks (e.g., ransomware, DDoS, malware propagation).
- **Cyber-enabled crimes**: Traditional crimes scaled exponentially by computer systems (e.g., computer-related fraud, online scams, identity theft, cyber libel).

Cybercriminals range from opportunistic script kiddies and hacktivists to highly organized transnational syndicates (Advanced Persistent Threats or APTs) operating with specialized financial and data laundering funnels.`
      },
      {
        heading: "3. First Responder Protective Directives & Victim Welfare",
        content: `Under Philippine Law Enforcement protocols, victim welfare is prioritized alongside digital evidence preservation. First responders must prevent revictimization, protect vulnerable victim identities in content-related offenses, and immediately coordinate with the PNP-Anti-Cybercrime Group (PNP-ACG) or NBI-Cybercrime Division (NBI-CCD).`
      }
    ],
    statutoryReferences: ["RA 10175 Section 2 (Declaration of Policy)", "Budapest Convention on Cybercrime Articles 2-10", "CICC Administrative Order No. 01"]
  },

  "lesson-2": {
    sansResources: getSansResourcesForLesson("lesson-2"),
    readTime: "15 min read",
    learningObjectives: [
      "Identify the 4 primary hardware components and their critical forensic values.",
      "Master the Forensic Order of Volatility under RFC 3227 standards.",
      "Execute anti-static and write-blocked physical disassembly procedures during digital seizures."
    ],
    lectureBody: [
      {
        heading: "1. The 4 Main Computer Subsystems in Digital Forensics",
        content: `Forensic investigators evaluate computers through 4 core subsystems:
1. **Input Units** (Keyboards, mouse, external scanners): Often retain physical fingerprints and physical keylogger attachments.
2. **Processing Units (CPU/SoC)**: Manages active registers and cache lines holding decrypted cryptographic instructions.
3. **Primary Volatile Storage (RAM)**: Holds volatile process tables, live network connections, unsaved document buffers, and BitLocker volume encryption keys.
4. **Secondary Non-Volatile Storage (NVMe, SSD, HDD)**: Houses permanent file systems, Master File Tables ($MFT), partition tables, and unallocated clusters containing deleted artifact remnants.`
      },
      {
        heading: "2. RFC 3227 Forensic Order of Volatility",
        content: `When seizing a running computer, digital evidence degrades at varying rates. Investigators MUST follow this exact sequence:
1. **CPU Registers, Cache** (Nanoseconds)
2. **Routing Tables, ARP Cache, Process Table, Kernel Memory / RAM** (Milliseconds to hours)
3. **Temporary File Systems / Swap Space**
4. **Solid-State Drives (NVMe / SATA) & Magnetic Hard Disks**
5. **Remote Logging Data & Network Topology**
6. **Physical Media Backups & Archival Tapes**`
      },
      {
        heading: "3. Static Electricity & Hardware Preservation Rules",
        content: `ESD (Electrostatic Discharge) can permanently destroy NAND flash cells or magnetic platters. Forensic examiners must wear grounded anti-static wrist straps, transport drives in Faraday/anti-static shielded bags, and strictly avoid connecting suspect media directly to lab workstations without hardware write-blockers (Tableau/FastBloc).`
      }
    ],
    statutoryReferences: ["IETF RFC 3227 Guidelines for Evidence Collection", "ISO/IEC 27037:2012 Digital Evidence Handling", "PNP Criminal Investigation Manual (Digital Forensics Section)"]
  },

  "lesson-3": {
    sansResources: getSansResourcesForLesson("lesson-3"),
    readTime: "18 min read",
    learningObjectives: [
      "Master the statutory elements of offenses under Republic Act 10175 (Cybercrime Prevention Act of 2012).",
      "Analyze Republic Act 10173 (Data Privacy Act of 2012) principles, NPC mandates, and penalties for unauthorized processing.",
      "Apply the Law Enforcement Exemption when processing sensitive digital evidence during criminal inquiries."
    ],
    lectureBody: [
      {
        heading: "1. RA 10175: Offenses Against Confidentiality, Integrity, and Availability",
        content: `Section 4(a) penalizes:
- **Sec. 4(a)(1) Illegal Access**: Accessing a computer system or network without right or in excess of authority.
- **Sec. 4(a)(2) Illegal Interception**: Interception of non-public computer data transmissions by technical means without right.
- **Sec. 4(a)(3) Data Interference**: Intentional alteration, damaging, deletion, or deterioration of computer data without right.
- **Sec. 4(a)(4) System Interference**: Intentional hindering or impairing the functioning of a computer or network (e.g., DDoS attacks).`
      },
      {
        heading: "2. Computer-Related Fraud, Forgery & Identity Theft",
        content: `Section 4(b) governs:
- **Computer-Related Forgery (Sec. 4(b)(1))**: Input, alteration, or deletion of computer data resulting in inauthentic data with intent to mislead.
- **Computer-Related Identity Theft (Sec. 4(b)(2))**: Intentional acquisition, use, or misuse of identifying data (passwords, government IDs, biometric data) belonging to another without right.`
      },
      {
        heading: "3. Republic Act 10173: Data Privacy Act of 2012 in Law Enforcement",
        content: `RA 10173 protects individuals' fundamental human right to privacy while ensuring free flow of information.
- **Core Principles**: Transparency, Legitimate Purpose, and Proportionality.
- **Sensitive Personal Information (Sec. 3(l))**: Race, ethnic origin, marital status, health, genetic data, court records, and government ID numbers (SSS, GSIS, TIN).
- **Penalties (Sec. 25-32)**: Unauthorized processing or malicious disclosure of sensitive data carries imprisonment of 3 to 6 years and fines up to PHP 4,000,000.
- **Law Enforcement Exception (Sec. 4)**: The DPA does not prohibit the lawful collection, processing, and retention of personal data when necessary for criminal investigations and carried out under lawful judicial warrants.`
      }
    ],
    statutoryReferences: ["Republic Act No. 10175", "Republic Act No. 10173", "Supreme Court Ruling G.R. No. 203335 (Disini vs SOJ)"]
  },

  "lesson-4": {
    sansResources: getSansResourcesForLesson("lesson-4"),
    readTime: "14 min read",
    learningObjectives: [
      "Differentiate international preservation standards under the Budapest Convention and G7 24/7 Network.",
      "Execute Live Memory (RAM) acquisition using dump tools prior to system shutdown.",
      "Submit formal preservation requests to third-party tech service providers (Meta, Google, Apple)."
    ],
    lectureBody: [
      {
        heading: "1. International Evidence Preservation Protocols",
        content: `Digital evidence stored on overseas cloud infrastructure (Google Drive, Telegram, AWS) can be deleted in seconds. Under the Budapest Convention (Convention 185) Article 16 and the G7 24/7 Network, law enforcement points of contact can issue expedited preservation orders requiring custodians to freeze suspect data for a minimum of 90 to 180 days while formal Letters Rogatory or Mutual Legal Assistance Treaties (MLAT) are processed.`
      },
      {
        heading: "2. Live Response & Physical Memory (RAM) Acquisition",
        content: `When approaching a live computer at a crime scene:
1. **Take 360-degree photographs** of the display screen, cable topology, and connected peripherals.
2. **Insert a forensically sanitized external USB** containing standalone memory acquisition utilities (e.g., FTK Imager Lite, Belkasoft RAM Capturer, LiME for Linux).
3. **Execute raw memory acquisition** to generate an uncompressed \`memdump.raw\` image.
4. **Compute cryptographic hash (SHA-256)** immediately to seal the memory image.`
      },
      {
        heading: "3. When to Pull the Plug vs. Normal Shutdown",
        content: `Pulling the physical power cable instantly destroys all RAM data. However, if active wiping malware or full-disk encryption destruction routines are observed on screen, pulling the plug immediately may preserve non-volatile drive contents before unrecoverable overwrite.`
      }
    ],
    statutoryReferences: ["Budapest Convention on Cybercrime (Convention 185)", "DOJ Office of Cybercrime (DOJ-OOC) Preservation Guidelines", "NIST SP 800-86 Guide to Integrating Forensic Techniques into Incident Response"]
  },

  "lesson-5": {
    sansResources: getSansResourcesForLesson("lesson-5"),
    readTime: "16 min read",
    learningObjectives: [
      "Understand solid-state drive (SSD) wear-leveling and TRIM challenges in digital forensics.",
      "Construct an ISO/IEC 27037-compliant Digital Forensics Action Plan.",
      "Document uncompromised Chain of Custody forms with cryptographic SHA-256 verification."
    ],
    lectureBody: [
      {
        heading: "1. Storage Physics: HDD Magnetic Remanence vs. SSD TRIM Garbage Collection",
        content: `Traditional magnetic HDDs leave deleted data in unallocated clusters until overwritten. In contrast, modern Solid-State Drives (NVMe/SATA SSDs) use background TRIM commands and wear-leveling algorithms that automatically wipe unallocated blocks during idle cycles. Consequently, powering on an SSD-equipped suspect machine without a hardware write-blocker can cause active data destruction within minutes.`
      },
      {
        heading: "2. Constructing the Digital Investigative Action Plan",
        content: `A formal digital investigation follows 5 standardized phases:
1. **Identification**: Mapping suspect endpoints, mobile hardware, cloud accounts, and local network topologies.
2. **Preservation**: Immediate RF isolation (Faraday cages) and anti-static packaging.
3. **Acquisition**: Bit-stream disk cloning (\`.dd\`, \`.E01\`) with hardware write protection.
4. **Analysis**: Keyword filtering, timeline reconstruction, registry extraction, and steganography detection.
5. **Presentation**: Expert witness sworn testimony accompanied by verified chain-of-custody documentation.`
      },
      {
        heading: "3. Chain of Custody Legal Significance",
        content: `Under Philippine Rules of Electronic Evidence (A.M. No. 01-7-01-SC), digital evidence is inadmissible unless its integrity is proven beyond reasonable doubt. Any undocumented gap in the physical possession of evidence from crime scene to evidence vault creates fatal reasonable doubt during court trials.`
      }
    ],
    statutoryReferences: ["ISO/IEC 27037:2012", "Rules on Electronic Evidence (A.M. No. 01-7-01-SC)", "Philippine PNP Chain of Custody Standard Operating Procedures"]
  },

  "lesson-6": {
    sansResources: getSansResourcesForLesson("lesson-6"),
    readTime: "15 min read",
    learningObjectives: [
      "Inspect Windows Registry hives for USBSTOR device connection records.",
      "Analyze Windows Prefetch and Shimcache files to prove application execution.",
      "Detect counter-forensic techniques including timestomping and event log deletion."
    ],
    lectureBody: [
      {
        heading: "1. Windows Registry Hive Artifacts",
        content: `The Windows Registry is a forensic goldmine:
- **\`SYSTEM\\CurrentControlSet\\Enum\\USBSTOR\`**: Logs the exact make, model, and serial number of every USB flash drive ever inserted into the suspect host.
- **\`SYSTEM\\MountedDevices\`**: Maps drive letters (e.g., E:, F:) to unique USB volume serial numbers.
- **\`NTUSER.DAT\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\RecentDocs\`**: Lists recently opened confidential documents.`
      },
      {
        heading: "2. Program Execution Evidence: Prefetch & Shimcache",
        content: `Even if a suspect deletes a hacking utility (e.g., Mimikatz, Wireshark, BitLocker brute-forcer), the OS records execution traces:
- **Prefetch Files (\`C:\\Windows\\Prefetch\\*.pf\`)**: Confirms application execution count, first execution date, and last 8 execution timestamps.
- **Shimcache / Amcache**: Confirms full path execution and SHA-1 hash of binary files, proving malicious software was actively launched.`
      },
      {
        heading: "3. Detecting Anti-Forensic Timestomping",
        content: `Cybercriminals frequently alter file creation timestamps (timestomping) to blend malware with old 2015 system files. Forensic investigators contrast the **\`$STANDARD_INFORMATION\`** file attribute against the raw **\`$FILE_NAME\`** attribute in the NTFS Master File Table ($MFT); disparities prove intentional time manipulation.`
      }
    ],
    statutoryReferences: ["SANS Digital Forensics & Incident Response (DFIR) Artifact Reference", "A.M. No. 01-7-01-SC Rule 5 (Authentication of Electronic Evidence)"]
  },

  "lesson-7": {
    sansResources: getSansResourcesForLesson("lesson-7"),
    readTime: "17 min read",
    learningObjectives: [
      "Differentiate the four specialized Cybercrime Warrants under Supreme Court A.M. No. 17-11-03-SC.",
      "Prepare a legally sufficient application for Search, Seizure, and Examination of Computer Data.",
      "Understand the strict 10-day execution window and chain-of-custody return of warrants."
    ],
    lectureBody: [
      {
        heading: "1. The 4 Specialized Cybercrime Warrants (A.M. No. 17-11-03-SC)",
        content: `Under Supreme Court Administrative Matter No. 17-11-03-SC (Rule on Cybercrime Warrants), designated Special Cybercrime Courts issue 4 distinct judicial warrants:
1. **Warrant to Disclose Computer Data (WDCD)**: Compels ISPs, social media platforms, or telecom custodians to disclose traffic data, subscriber identification, and communication logs within 72 hours.
2. **Warrant to Intercept Computer Data (WICT)**: Authorizes real-time listening, surveillance, or recording of content communications upon establishing probable cause.
3. **Warrant to Search, Seize, and Examine Computer Data (WSCD)**: Authorizes law enforcement to enter physical premises, search digital hardware, and seize storage systems.
4. **Warrant to Examine Computer Data (WECD)**: Granted when digital devices were seized off-site or under lawful warrantless arrest, permitting laboratory digital examination and password cracking.`
      },
      {
        heading: "2. Territorial Jurisdiction & Warrant Execution Window",
        content: `Unlike regular search warrants limited to judicial regions, Cybercrime Warrants issued by designated Cybercrime Courts may be executed nationwide when the cyber offense involves systems across multiple judicial branches. Warrants remain valid for a maximum of **ten (10) days** from issuance.`
      },
      {
        heading: "3. Destruction of Computer Data (WDCD-Destroy)",
        content: `Upon final conviction or dismissal of charges, the court may issue an order directing law enforcement to permanently overwrite or physically destroy seized computer data to prevent unauthorized citizen privacy leaks.`
      }
    ],
    statutoryReferences: ["Supreme Court A.M. No. 17-11-03-SC (Rule on Cybercrime Warrants)", "Constitution of the Philippines Art. III Sec. 2 (Bill of Rights)", "Cybercrime Prevention Act of 2012 Section 12-15"]
  },

  "lesson-8": {
    sansResources: getSansResourcesForLesson("lesson-8"),
    readTime: "16 min read",
    learningObjectives: [
      "Understand environmental jurisprudence and protective remedies under the Writ of Kalikasan.",
      "Apply stereomicroscopy and sawdust morphology to identify contraband Philippine Dipterocarp timber.",
      "Identify illegal wildlife trafficking specimens under CITES Appendix I & RA 9147."
    ],
    lectureBody: [
      {
        heading: "1. Philippine Environmental Law Framework & Green Forensics",
        content: `Green Forensics applies scientific criminology methods to detect environmental offenses:
- **PD 705 (Revised Forestry Code)**: Prohibits unauthorized cutting, gathering, or possession of timber from public forests or watershed reserves.
- **RA 9147 (Wildlife Resources Conservation and Protection Act)**: Penalizes possession, killing, and trafficking of critically endangered Philippine wildlife.
- **Rules of Procedure for Environmental Cases (A.M. No. 09-6-8-SC)**: Provides extraordinary legal remedies including the **Writ of Kalikasan** and **Temporary Environmental Protection Orders (TEPO)**.`
      },
      {
        heading: "2. Forensic Wood Anatomy & Sawdust Morphology",
        content: `When timber smugglers transport lumber disguised as legitimate plantation wood (e.g., Falcata or Gmelina), forensic criminologists inspect sawdust residue under stereomicroscopes. Premium native dipterocarps (such as White Lauan - *Shorea contorta* or Yakal) exhibit distinct vessel element pore distributions, multiseriate rays, and scalariform perforation plates that scientifically prove illegal logging.`
      },
      {
        heading: "3. Wildlife Forensics & Contraband Chain of Custody",
        content: `Wildlife enforcement requires morphological and DNA barcoding validation:
- **Philippine Pangolin (*Manis culionensis*)**: Keratin scale morphology and fluorescence patterns distinguish genuine pangolin contraband from domestic animal keratin.
- **Giant Clams (*Tridacna gigas*)**: Protected under RA 10654 (Fisheries Code); microscopic hinge geometry and growth layer banding establish legal violation.`
      }
    ],
    statutoryReferences: ["Presidential Decree No. 705 (Revised Forestry Code)", "Republic Act No. 9147 (Wildlife Act)", "Republic Act No. 10654 (Fisheries Code)", "Supreme Court A.M. No. 09-6-8-SC (Writ of Kalikasan)"]
  }
};
