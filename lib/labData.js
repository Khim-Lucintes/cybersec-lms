// Comprehensive laboratory dataset for ALL 8 UNITS of CDI 409

export const LAB_DATA = {
  // UNIT 1: Cyber Threat Intelligence & Vector Identification
  "lab-1": {
    title: "Cyber Threat Intelligence & Vector Triage Simulator",
    instructions: "Analyze suspicious network traffic logs, phishing headers, and vector payloads to classify the cyberattack under Criminology threat categories.",
    scenarios: [
      {
        id: "scn-1",
        title: "Spear-Phishing Credential Harvester",
        logSnippet: "POST /auth/login HTTP/1.1 -> Host: secure-urios-edu-ph.serveo.net [Spoofed Domain]",
        threatVector: "Social Engineering / Phishing",
        remediation: "Block spoofed external FQDN, revoke compromised credentials, and report domain to CICC.",
        legalBasis: "RA 10175 Sec. 4(b)(1) Computer-Related Forgery"
      },
      {
        id: "scn-2",
        title: "Distributed Denial of Service (DDoS) SYN Flood",
        logSnippet: "TCP SYN Flood: 45,000 pps targeting Port 443 from 1,200 botnet source IPs.",
        threatVector: "System Interference / Availability Attack",
        remediation: "Enable upstream BGP Anycast scrubbing, activate rate-limiting SYN cookies.",
        legalBasis: "RA 10175 Sec. 4(a)(3) System Interference"
      },
      {
        id: "scn-3",
        title: "Ransomware Exfiltration Beacon",
        logSnippet: "Outbound TLS tunnel to 185.220.101.5:443 with high entropy payload (.lockbit header detected).",
        threatVector: "Extortion / Data Interference",
        remediation: "Sever network egress immediately; preserve live memory image before power down.",
        legalBasis: "RA 10175 Sec. 4(a)(2) Illegal Interception & Sec. 4(a)(4) Data Interference"
      }
    ]
  },

  // UNIT 2: Hardware Disassembly & Order of Volatility
  "lab-2": {
    title: "Computer Hardware & Evidence Preservation Lab",
    instructions: "As a Criminology First Responder, recover storage and volatile components in strict adherence to the Forensic Order of Volatility and Anti-Static protocols.",
    components: [
      { id: "ram", name: "RAM (Random Access Memory)", category: "Volatile Memory", correctOrder: 1, forensicValue: "Active memory state, running malware, cleartext passwords, BitLocker keys." },
      { id: "nvme", name: "NVMe M.2 SSD", category: "Primary Solid-State Storage", correctOrder: 2, forensicValue: "Fast non-volatile OS drive, hibernation files (hiberfil.sys), pagefile." },
      { id: "sata-ssd", name: "2.5\" SATA SSD", category: "Secondary Storage", correctOrder: 3, forensicValue: "Encrypted file partitions, chat databases, shadow copies." },
      { id: "hdd", name: "3.5\" Magnetic HDD", category: "Bulk Magnetic Storage", correctOrder: 4, forensicValue: "Unallocated clusters, deleted evidence remanence, backup archives." },
      { id: "cmos", name: "CMOS Battery", category: "System Clock Power", correctOrder: 5, forensicValue: "Hardware clock time preservation; remove last to prevent clock desync." }
    ]
  },

  // UNIT 3: RA 10175 Cybercrime & RA 10173 Data Privacy Statutory Offense Simulator
  "lab-3": {
    title: "RA 10175 Cybercrime & RA 10173 Data Privacy Statutory Charge Builder",
    instructions: "Review real-world digital crime evidence and formulate the appropriate criminal charges under the Cybercrime Prevention Act (RA 10175) and Data Privacy Act (RA 10173).",
    cases: [
      {
        id: "charge-1",
        evidence: "Suspect installed keylogger software on bank terminal and recorded customer ATM PINs.",
        correctSection: "RA 10175 Sec. 4(a)(1) Illegal Access & Sec. 4(a)(2) Illegal Interception",
        rationale: "Accessing systems without authority and intercepting non-public transmissions via technical means constitutes both illegal access and interception."
      },
      {
        id: "charge-2",
        evidence: "Suspect created clone social media accounts soliciting money while impersonating the City Mayor.",
        correctSection: "RA 10175 Sec. 4(b)(2) Computer-Related Identity Theft",
        rationale: "Intentional acquisition, use, and transfer of identifying data belonging to another without right violates identity theft provisions."
      },
      {
        id: "charge-3",
        evidence: "Disgruntled employee exported 10,000 patient HIV/medical records from a hospital EHR server and posted them to an open Telegram channel.",
        correctSection: "RA 10173 Sec. 25 (Unauthorized Processing) & Sec. 29 (Malicious Disclosure of Sensitive Personal Info)",
        rationale: "Processing sensitive health information without consent and disclosing it unlawfully carries imprisonment up to 5 years and PHP 1,000,000+ fines under the Data Privacy Act."
      },
      {
        id: "charge-4",
        evidence: "Suspect deployed ransomware encrypting municipal hospital electronic health records, demanding Bitcoin.",
        correctSection: "RA 10175 Sec. 4(a)(4) Data Interference & Sec. 4(a)(3) System Interference (Critical Infrastructure)",
        rationale: "Damaging, deleting, or altering computer data without right, particularly against critical infrastructure, attracts maximum penalty."
      }
    ]
  },

  // UNIT 4: Live Memory Forensics & RAM Hex / String Extraction Lab
  "lab-4": {
    title: "Volatile Memory (RAM) Hex & String Forensics Lab",
    instructions: "Analyze an acquired physical memory dump (memdump.raw) from a suspect machine involved in a corporate extortion incident. Search for plaintext credentials, IP sockets, and BitLocker recovery keys.",
    targetStrings: [
      { id: "pwd", keyword: "password=", hexOffset: "0x0041F820", foundContent: "password=AlphaCriminology2026!#", evidenceType: "Plaintext User Credential" },
      { id: "key", keyword: "BitLocker-Key", hexOffset: "0x0089C110", foundContent: "BitLocker-Key: 419201-582910-192837-991823", evidenceType: "Volume Encryption Recovery Key" },
      { id: "ip", keyword: "C2_SERVER", hexOffset: "0x00D12E40", foundContent: "C2_SERVER=192.168.10.144:8443 [ESTABLISHED]", evidenceType: "Active Command & Control Socket" },
      { id: "cmd", keyword: "cmd.exe /c", hexOffset: "0x00F3A050", foundContent: "cmd.exe /c powershell -enc SABlAGwAbABv...", evidenceType: "Obfuscated PowerShell Execution" }
    ],
    rawHexSample: [
      "00000000  4d 5a 90 00 03 00 00 00  04 00 00 00 ff ff 00 00  |MZ..............|",
      "00000010  b8 00 00 00 00 00 00 00  40 00 00 00 00 00 00 00  |........@.......|",
      "0041F820  70 61 73 73 77 6f 72 64  3d 41 6c 70 68 61 43 72  |password=AlphaCr|",
      "0041F830  69 6d 69 6e 6f 6c 6f 67  79 32 30 32 36 21 23 00  |iminology2026!#.|",
      "0089C110  42 69 74 4c 6f 63 6b 65  72 2d 4b 65 79 3a 20 34  |BitLocker-Key: 4|",
      "0089C120  31 39 32 30 31 2d 35 38  32 39 31 30 2d 31 39 32  |19201-582910-192|",
      "00D12E40  43 32 5f 53 45 52 56 45  52 3d 31 39 32 2e 31 36  |C2_SERVER=192.16|",
      "00D12E50  38 2e 31 30 2e 31 34 34  3a 38 34 34 33 00 00 00  |8.10.144:8443...|"
    ]
  },

  // UNIT 5: Digital Investigative Action Plan & Forensic Checklist
  "lab-5": {
    title: "Digital Investigative Plan & Seizure Checklist Builder",
    instructions: "Formulate a systematic 5-step Digital Forensics Investigation Plan in compliance with ISO/IEC 27037 standards.",
    stages: [
      { step: 1, title: "Identification & Crime Scene Securing", action: "Identify all digital storage devices, isolate the physical perimeter, and photograph active screen displays." },
      { step: 2, title: "Volatile Live Triage", action: "Capture physical RAM dump and active network sockets prior to power shutdown." },
      { step: 3, title: "Hardware Isolation & Faraday Packaging", action: "Disconnect network adapters, place mobile devices in RF shielding Faraday bags, and label serial numbers." },
      { step: 4, title: "Bit-Stream Forensic Imaging", action: "Create raw (.dd/.E01) duplicate forensic images using hardware write-blockers with SHA-256 hash verification." },
      { step: 5, title: "Chain of Custody Documentation", action: "Complete evidence receipts, logging transferring officers, receiving examiners, and evidence vault timestamps." }
    ]
  },

  // UNIT 6: Forensic Artifact & Registry USB Timeline Analyzer
  "lab-6": {
    title: "USBSTOR Registry & Prefetch Artifact Timeline Analyzer",
    instructions: "Inspect Windows Registry keys (USBSTOR) and Prefetch files to determine if unauthorized data exfiltration occurred prior to law enforcement seizure.",
    artifacts: [
      { id: "art-1", artifact: "SYSTEM\\CurrentControlSet\\Enum\\USBSTOR", description: "SanDisk Ultra USB 3.0 (Serial: 4C530001230415112041) mounted on 2026-08-14 23:14:02 UTC.", category: "USB History" },
      { id: "art-2", artifact: "C:\\Windows\\Prefetch\\WINRAR.EXE-A92B3C11.pf", description: "Execution timestamp matching USB insertion time; compressed 4.2 GB of corporate dossiers.", category: "Program Execution" },
      { id: "art-3", artifact: "NTUSER.DAT\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\RecentDocs", description: "Last opened file: 'confidential_payroll_export.xlsx'.", category: "File Knowledge" },
      { id: "art-4", artifact: "$LogFile & $MFT USN Journal", description: "Timestomping detected: Created timestamp modified to simulate 2019 creation.", category: "Anti-Forensics" }
    ]
  },

  // UNIT 7: Supreme Court Rule on Cybercrime Warrants
  "lab-7": {
    title: "Cybercrime Warrants & Judicial Issuance Evaluator",
    instructions: "Evaluate investigative scenarios and match them with the appropriate Supreme Court cybercrime warrant under A.M. No. 17-11-03-SC.",
    warrantTypes: [
      { code: "WDCD", name: "Warrant to Disclose Computer Data", scope: "Orders ISPs or custodians to reveal subscriber details, billing records, traffic data, and access logs within 72 hours." },
      { code: "WSCD", name: "Warrant to Search, Seize and Examine", scope: "Authorizes LEAs to search places, seize computer devices, and extract on-site digital evidence." },
      { code: "WICT", name: "Warrant to Intercept Computer Data", scope: "Permits real-time listening, recording, or surveillance of content communications pursuant to legal authorization." },
      { code: "WECD", name: "Warrant to Examine Computer Data", scope: "Granted after initial off-site seizure allowing forensic examiners to access, copy, and decrypt seized digital devices in the laboratory." }
    ]
  },

  // UNIT 8: Green Forensics & Environmental Law Enforcement Lab
  "lab-8": {
    title: "Green Forensics: Wildlife Trafficking & Sawdust Morphology Lab",
    instructions: "Apply forensic botany, sawdust morphology, and CITES/IUCN classification to identify seized illegal wildlife and contraband timber in Butuan / Caraga Region.",
    contrabandCases: [
      {
        id: "case-1",
        evidenceName: "Seized Reptilian Scales (Carton Batch #409)",
        analysisMethod: "Keratin Morphology & Stereomicroscopy",
        findings: "Identified as Philippine Pangolin (Manis culionensis) scales.",
        legalViolation: "RA 9147 (Wildlife Resources Conservation & Protection Act) - Critically Endangered Category (CITES Appendix I).",
        penalty: "Imprisonment of 6 to 12 years and fine up to PHP 1,000,000."
      },
      {
        id: "case-2",
        evidenceName: "Lumber Shipment Sawdust Residue (Port of Nasipit)",
        analysisMethod: "Microscopic Tracheid & Vessel Element Cross-sectioning",
        findings: "Identified as Shorea contorta (White Lauan - Premium Native Dipterocarp).",
        legalViolation: "PD 705 (Revised Forestry Code of the Philippines) - Illegal Logging in Watershed Reserve.",
        penalty: "Confiscation of conveyance, criminal conviction under Art. 309/310 Revised Penal Code."
      },
      {
        id: "case-3",
        evidenceName: "Marine Life Shipment Containers (Seaport Seizure)",
        analysisMethod: "Morphological Inspection of Operculum & Shell Geometry",
        findings: "Tridacna gigas (Giant Clams) fossilized meat and shell segments.",
        legalViolation: "RA 10654 (Philippine Fisheries Code) Sec. 102 - Poaching of Protected Marine Species.",
        penalty: "Administrative fine up to PHP 5,000,000 and mandatory cancellation of fishing permit."
      }
    ]
  }
};
