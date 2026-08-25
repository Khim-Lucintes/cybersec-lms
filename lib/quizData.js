// Enhanced quiz datasets for all 8 syllabus units with explanations & legal rationale

export const SYLLABUS_QUIZZES = {
  "lesson-1": [
    {
      id: "q1-1",
      question: "Which of the following best defines 'Cyberspace' under cybersecurity and criminology jurisprudence?",
      options: [
        "A physical room where computer servers are locked.",
        "The interdependent network of information technology infrastructures, including the Internet, telecommunications networks, and computer systems.",
        "Any private intranet disconnected from public routing.",
        "A proprietary software application created by law enforcement."
      ],
      correctIndex: 1,
      explanation: "Cyberspace encompasses the entire logical and physical domain of interconnected computer systems, telecommunications, and digital infrastructure."
    }
  ],
  "lesson-2": [
    {
      id: "q2-1",
      question: "Why must volatile RAM be captured before severing physical power to a suspect computer?",
      options: [
        "RAM contains active network sockets, running malware, cleartext passwords, and BitLocker keys that evaporate immediately on power loss.",
        "Mechanical hard disk drives will suffer physical head crashes if RAM is removed last.",
        "RAM holds the hardware serial numbers necessary for filing a criminal complaint.",
        "Supreme Court Rule on Cybercrime Warrants requires RAM to be stored in Faraday bags before seizure."
      ],
      correctIndex: 0,
      explanation: "Volatile memory (RAM) loses all uncommitted cryptographic keys, open connections, and ephemeral malware binaries as soon as electrical power is severed."
    },
    {
      id: "q2-2",
      question: "Under the Forensic Order of Volatility (RFC 3227), which sequence must an investigator follow?",
      options: [
        "Registers/Cache -> RAM/Routing Table -> Temporary Files -> Disk/Storage -> Remote Logs",
        "Magnetic Disk -> RAM -> Flash Drives -> CPU Registers -> Remote Backups",
        "Backup Tapes -> Optical Media -> Primary Solid State -> RAM",
        "CMOS Battery -> Mechanical HDD -> NVMe SSD -> RAM"
      ],
      correctIndex: 0,
      explanation: "RFC 3227 mandates acquiring the most volatile and rapidly degrading evidence first (Registers/Cache -> RAM -> Disk -> Remote Logging)."
    }
  ],
  "lesson-3": [
    {
      id: "q3-1",
      question: "Under Republic Act 10175 Section 4(a)(1), which act constitutes 'Illegal Access'?",
      options: [
        "Accessing a public web page without bookmarking it.",
        "The access to the whole or any part of a computer system without right.",
        "Purchasing computer components without NTC permits.",
        "Sending an unsolicited email newsletter to students."
      ],
      correctIndex: 1,
      explanation: "Section 4(a)(1) penalizes accessing the whole or any part of a computer system without right or in excess of lawful authority."
    },
    {
      id: "q3-2",
      question: "Under the Data Privacy Act (RA 10173), what is the legal standard required before law enforcement can process sensitive personal information from seized evidence?",
      options: [
        "Lawful authority pursuant to criminal investigation and judicial cybercrime warrant, maintaining proportionality and data protection safeguards.",
        "Posting the evidence to public social media for citizen crowdsourcing.",
        "Selling the data to recover police operational costs.",
        "Wiping the data immediately without judicial evaluation."
      ],
      correctIndex: 0,
      explanation: "RA 10173 recognizes law enforcement exemptions when processing is necessary for criminal investigations and carried out under lawful warrants, adhering to integrity, proportionality, and confidentiality."
    }
  ],
  "lesson-4": [
    {
      id: "q4-1",
      question: "What is the primary objective of 'Live Triage' during cyber incident response?",
      options: [
        "Wiping the suspect operating system to restore normal business operations.",
        "Collecting volatile evidence (RAM, running processes, open network sockets) before shutting down the machine.",
        "Formatting all secondary storage drives to verify bad sectors.",
        "Disclosing evidence to news media within 24 hours."
      ],
      correctIndex: 1,
      explanation: "Live triage preserves live memory states, open network connections, and volatile credentials before a system is powered off or modified."
    }
  ],
  "lesson-7": [
    {
      id: "q7-1",
      question: "Under Supreme Court A.M. No. 17-11-03-SC, which warrant is required to compel ISPs to produce subscriber records and traffic logs?",
      options: [
        "Warrant to Examine Computer Data (WECD)",
        "Warrant to Disclose Computer Data (WDCD)",
        "Warrant to Intercept Computer Data (WICT)",
        "Warrant to Destroy Computer Data"
      ],
      correctIndex: 1,
      explanation: "A Warrant to Disclose Computer Data (WDCD) directs service providers and custodians to disclose subscriber info and traffic logs within 72 hours."
    }
  ],
  "lesson-8": [
    {
      id: "q8-1",
      question: "Under Republic Act 9147, trafficking of CITES Appendix I species (e.g. Philippine Pangolin) carries what penalty category?",
      options: [
        "Community service for 30 days.",
        "Maximum imprisonment of 6 to 12 years and fines up to PHP 1,000,000.",
        "Administrative reprimand from the Barangay Chairman.",
        "Payment of market value tax to the municipal treasury."
      ],
      correctIndex: 1,
      explanation: "RA 9147 imposes severe criminal liability including multi-year imprisonment and high statutory fines for the illegal trade of critically endangered wildlife."
    }
  ]
};
