export const MOCK_ADMIN_DATA = {
  instructor: {
    name: "Atty. Cedrick G. Train",
    title: "Dean / Lead Instructor, Criminal Justice Education Program",
    institution: "Father Saturnino Urios University",
    email: "dean.cjep@urios.edu.ph",
  },
  stats: {
    totalEnrolledCadets: 48,
    activeSubmissions: 36,
    averageClassStanding: "89.4% (1.50 GPA)",
    pendingEvaluations: 12,
    passingRate: "97.8%",
  },
  sections: [
    { id: "sec-a", name: "Section Alpha", count: 24, averageGrade: 90.4 },
    { id: "sec-b", name: "Section Bravo", count: 24, averageGrade: 88.5 },
  ],
  cadetSubmissions: [
    {
      id: "SUB-409-01",
      studentId: "STU-2026-4091",
      studentName: "Cadet Juan Dela Cruz",
      section: "Section Alpha",
      unit: "Unit 2: Computer Hardware & Volatility",
      task: "RAM & NVMe Hardware Disassembly Lab",
      submissionTime: "2026-08-24 19:45",
      score: "100%",
      status: "Graded",
      grade: 95,
      complianceNote: "Order of Volatility strictly followed. Static mat used.",
    },
    {
      id: "SUB-409-02",
      studentId: "STU-2026-4092",
      studentName: "Cadet Maria Santos",
      section: "Section Alpha",
      unit: "Unit 3: RA 10175 Offenses",
      task: "Hospital Ransomware Legal Classification",
      submissionTime: "2026-08-24 20:12",
      score: "92%",
      status: "Graded",
      grade: 92,
      complianceNote: "Sec 4(a)(3) correctly applied with Critical Infrastructure penalty context.",
    },
    {
      id: "SUB-409-03",
      studentId: "STU-2026-4093",
      studentName: "Cadet Paolo Reyes",
      section: "Section Bravo",
      unit: "Unit 6: Forensic Artifact Analysis",
      task: "USBSTOR & Event ID 1102 Timeline Report",
      submissionTime: "2026-08-24 21:30",
      score: "Pending",
      status: "Needs Review",
      grade: null,
      complianceNote: "Submitted mock FTK timeline CSV for evaluation.",
    },
    {
      id: "SUB-409-04",
      studentId: "STU-2026-4094",
      studentName: "Cadet Alyssa Gonzaga",
      section: "Section Bravo",
      unit: "Unit 7: Cybercrime Warrants",
      task: "Drafting Application for WSCD & WDCD",
      submissionTime: "2026-08-24 22:05",
      score: "Pending",
      status: "Needs Review",
      grade: null,
      complianceNote: "Drafted court affidavit matching Supreme Court circular A.M. No. 17-11-03-SC.",
    }
  ],
  outcomesPerformance: [
    { code: "POb", name: "Human Rights & Victim Welfare", mastery: "94%" },
    { code: "POc", name: "Law Enforcement & Digital Forensics", mastery: "89%" },
    { code: "POd", name: "Forensic Science & Evidence Recovery", mastery: "91%" },
    { code: "POe", name: "Legal Principles & Environmental Law", mastery: "87%" },
  ]
};

export const MOCK_COC_TEMPLATES = [
  {
    id: "ransomware",
    badgeLabel: "RA 10175 Cyber Heist",
    title: "Commercial Banking Ransomware & Hardware Volatility Seizure",
    caseNumber: "CC-FSUU-2026-1049",
    warrantNumber: "WSCD-2026-0881-RTC-BR10",
    offenseCharged: "RA 10175 Sec. 4(a)(1) Illegal Access, Sec. 4(a)(3) System Interference & Sec. 4(a)(4) Data Interference",
    investigatorName: "Cadet Juan Dela Cruz",
    badgeNumber: "STU-2026-4091",
    unitAssigned: "Regional Anti-Cybercrime Unit 13 (RACU 13)",
    dateRecovered: "September 18, 2026",
    timeRecovered: "14:30 HRS PST",
    location: "Commercial Banking Server Room, J.C. Aquino Ave, Butuan City",
    certifyingChief: "PCOL. MARCO T. DELA CRUZ, CESE",
    certifyingTitle: "Chief, Regional Anti-Cybercrime Unit 13 (RACU 13)",
    specimens: [
      {
        itemNo: "ITEM-01",
        description: "Samsung 980 Pro NVMe PCIe 4.0 SSD 1TB (Seized System Storage)",
        serialNumber: "S649NX0W109283A",
        evidenceBagTag: "EB-2026-091-A",
        sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        status: "Forensically Sealed with Anti-Static Tamper Tape"
      },
      {
        itemNo: "ITEM-02",
        description: "Kingston Fury Beast 16GB DDR4-3200 RAM (Physical Memory Dump Extraction)",
        serialNumber: "KF432C16BB1/16-9902",
        evidenceBagTag: "EB-2026-091-B",
        sha256: "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e",
        status: "RFC 3227 Volatile Layer Extraction Completed"
      },
      {
        itemNo: "ITEM-03",
        description: "SanDisk Ultra 64GB USB 3.0 Flash Drive (Trojan Drop Payload)",
        serialNumber: "SDCZ48-064G-U46",
        evidenceBagTag: "EB-2026-091-C",
        sha256: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
        status: "Write-Blocked with Hardware Tableau T8u Bridge"
      }
    ],
    custodyLog: [
      {
        time: "15:00 HRS",
        releasedBy: "Cadet Juan Dela Cruz<br/><span style=\"font-size: 8px;\">(First Responder / Seizing Officer)</span>",
        receivedBy: "PEMS Renato B. Valdez<br/><span style=\"font-size: 8px;\">(Evidence Custodian, RACU 13)</span>",
        purpose: "Turnover of seized evidence from crime scene to RACU 13 Forensics Locker",
        condition: "Tamper-Evident Bag Intact; Anti-Static Seal Undamaged"
      },
      {
        time: "16:30 HRS",
        releasedBy: "PEMS Renato B. Valdez<br/><span style=\"font-size: 8px;\">(Evidence Custodian, RACU 13)</span>",
        receivedBy: "PCMS Elena S. Mercado<br/><span style=\"font-size: 8px;\">(Forensic Examiner, ACG Lab)</span>",
        purpose: "Bit-Stream Forensic Imaging (EnCase / FTK Imager Forensic Duplicate)",
        condition: "Opened in Faraday Room; Bit-Stream Hash Match Verified"
      },
      {
        time: "18:00 HRS",
        releasedBy: "PCMS Elena S. Mercado<br/><span style=\"font-size: 8px;\">(Forensic Examiner, ACG Lab)</span>",
        receivedBy: "Atty. Cedrick G. Train<br/><span style=\"font-size: 8px;\">(Prosecution / Court Custodian)</span>",
        purpose: "Presentation of digital duplicate & verification for Judicial Inquest",
        condition: "Stored in Faraday Evidence Vault under Lock #04"
      }
    ]
  },
  {
    id: "pcap-wiretap",
    badgeLabel: "A.M. 17-11-03-SC WICT",
    title: "Live Network Wiretap & C2 Exfiltration PCAP Investigation",
    caseNumber: "CC-FSUU-2026-2184",
    warrantNumber: "WICT-2026-0412-RTC-BR05",
    offenseCharged: "RA 10175 Sec. 4(a)(1) Illegal Access & Sec. 4(a)(2) Illegal Interception (Warrant to Intercept Computer Data)",
    investigatorName: "Cadet Maria Santos",
    badgeNumber: "STU-2026-4092",
    unitAssigned: "Regional Anti-Cybercrime Unit 13 (RACU 13)",
    dateRecovered: "September 18, 2026",
    timeRecovered: "16:15 HRS PST",
    location: "ISP Core Gateway Switch Port Mirroring, Bancasi, Butuan City",
    certifyingChief: "PCOL. MARCO T. DELA CRUZ, CESE",
    certifyingTitle: "Chief, Regional Anti-Cybercrime Unit 13 (RACU 13)",
    specimens: [
      {
        itemNo: "ITEM-01",
        description: "Raw Packet Capture Stream (suspect_c2_traffic.pcap) with Cleartext Payloads",
        serialNumber: "PCAP-ETH0-LIVE-901",
        evidenceBagTag: "EB-2026-092-A",
        sha256: "9b2d8e4128f4bc1e28904716bce39a48912ef021873491295bcf01a2849e7123",
        status: "Captured via Promiscuous SPAN Port Mirroring"
      },
      {
        itemNo: "ITEM-02",
        description: "Cisco Catalyst 3850 48-Port Layer-3 Core Switch (Seized Hardware Tap)",
        serialNumber: "FOC2140U0AB-3850",
        evidenceBagTag: "EB-2026-092-B",
        sha256: "7d102e9bc4751f04491a056bbd0149021874bce3810294719283740128491823",
        status: "NVRAM Running Config & ARP Table Frozen"
      },
      {
        itemNo: "ITEM-03",
        description: "Kingston DataTraveler 32GB (Contains Extracted Tor C2 Endpoints & Passwords)",
        serialNumber: "DTX-32GB-88402",
        evidenceBagTag: "EB-2026-092-C",
        sha256: "3a9481b7e0129481bc9204712839401928471029384710293847102938471029",
        status: "Forensically Cloned Bit-Stream Exact Copy"
      }
    ],
    custodyLog: [
      {
        time: "17:00 HRS",
        releasedBy: "Cadet Maria Santos<br/><span style=\"font-size: 8px;\">(First Responder / Wiretap Analyst)</span>",
        receivedBy: "PEMS Renato B. Valdez<br/><span style=\"font-size: 8px;\">(Evidence Custodian, RACU 13)</span>",
        purpose: "Chain of custody log turnover of encrypted network tap dumps",
        condition: "Bit-Stream Hash Match Verified; Vault Sealed"
      },
      {
        time: "18:45 HRS",
        releasedBy: "PEMS Renato B. Valdez<br/><span style=\"font-size: 8px;\">(Evidence Custodian, RACU 13)</span>",
        receivedBy: "Atty. Cedrick G. Train<br/><span style=\"font-size: 8px;\">(Prosecution / Court Custodian)</span>",
        purpose: "Filing of return of warrant under A.M. No. 17-11-03-SC Rule on Cybercrime Warrants",
        condition: "Tamper-Evident Bag Intact; Evidence Admissible"
      }
    ]
  },
  {
    id: "green-forensics",
    badgeLabel: "RA 9147 / PD 705 Green Forensics",
    title: "Protected Wildlife Trafficking & Illegal Timber Seizure",
    caseNumber: "ENV-FSUU-2026-0811",
    warrantNumber: "WECD-2026-0199-RTC-BR02",
    offenseCharged: "RA 9147 (Wildlife Resources Conservation & Protection Act) & PD 705 (Revised Forestry Code)",
    investigatorName: "Cadet Kevin Mendoza",
    badgeNumber: "STU-2026-4095",
    unitAssigned: "Regional Anti-Cybercrime Unit 13 & DENR Caraga Taskforce",
    dateRecovered: "September 18, 2026",
    timeRecovered: "11:20 HRS PST",
    location: "Agusan River Basin Seaport Cargo Terminal, Libertad, Butuan City",
    certifyingChief: "PCOL. MARCO T. DELA CRUZ, CESE",
    certifyingTitle: "Chief, Regional Anti-Cybercrime Unit 13 (RACU 13)",
    specimens: [
      {
        itemNo: "ITEM-01",
        description: "Seized Palawan Pangolin (Manis culionensis) Keratin Scales (12.4 kg contraband)",
        serialNumber: "TAG-DENR-PG-0441",
        evidenceBagTag: "EB-2026-ENV-01",
        sha256: "d41d8cd98f00b204e9800998ecf8427e02938471029384710293847102938471",
        status: "Sealed in Hermetic Biological Evidence Container with Bio-Hazard Tag"
      },
      {
        itemNo: "ITEM-02",
        description: "Premium Narra (Pterocarpus indicus) Sawdust & Core Wood Morphology Samples",
        serialNumber: "TAG-FMB-NR-1082",
        evidenceBagTag: "EB-2026-ENV-02",
        sha256: "1827491029384710293847102938471029384710293847102938471029384710",
        status: "Microscopic Cellular Morphology Analyzed with FTIR Spectrometry"
      },
      {
        itemNo: "ITEM-03",
        description: "Garmin GPSMAP 66sr Handheld Navigator (Suspect Poaching Geofence Logs)",
        serialNumber: "66SR-9018442-PH",
        evidenceBagTag: "EB-2026-ENV-03",
        sha256: "9812739481029384710293847102938471029384710293847102938471029384",
        status: "GPX Track Points & Timber Coordinates Extracted via Write-Blocked USB"
      }
    ],
    custodyLog: [
      {
        time: "12:30 HRS",
        releasedBy: "Cadet Kevin Mendoza<br/><span style=\"font-size: 8px;\">(First Responder / Green Forensics Officer)</span>",
        receivedBy: "For. Danilo C. Alcantara<br/><span style=\"font-size: 8px;\">(DENR Caraga Wildlife Custodian)</span>",
        purpose: "Formal turnover of wildlife contraband to DENR Wildlife Rescue Center",
        condition: "Biological Seal Intact; Temperature Regulated"
      },
      {
        time: "14:15 HRS",
        releasedBy: "For. Danilo C. Alcantara<br/><span style=\"font-size: 8px;\">(DENR Caraga Wildlife Custodian)</span>",
        receivedBy: "Atty. Cedrick G. Train<br/><span style=\"font-size: 8px;\">(Prosecution / Court Custodian)</span>",
        purpose: "Turnover of GPS digital waypoint extracts & chain of custody records for preliminary investigation",
        condition: "Biological and Digital Containers Tamper-Evident Sealed"
      }
    ]
  }
];
