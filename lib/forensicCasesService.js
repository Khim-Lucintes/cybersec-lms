import { supabase } from "./supabaseClient";

export const DEFAULT_FORENSIC_CASES = [
  {
    id: "case-usb-01",
    caseCode: "CDI409-USB-01",
    title: "Operation SILENT EXFIL (USB & Artifacts)",
    unit: "Unit 6: Forensic Artifacts",
    sansRef: "SANS Hunt Evil Cheat Sheet",
    sansUrl: "https://www.sans.org/posters/hunt-evil/",
    statute: "RA 10175 Sec. 4(a)(1) Illegal Access & Sec. 4(a)(3) Data Interference",
    difficulty: "Intermediate",
    xpReward: 250,
    badgeName: "Artifact Investigator",
    scenario:
      "A senior researcher at a Butuan City laboratory is suspected of connecting an unauthorized USB flash drive at 23:14 UTC to exfiltrate 4.2 GB of confidential criminal justice dossiers. The suspect denies ever inserting a USB drive. Use Registry and Prefetch commands to extract the device serial number and prove application execution.",
    tasks: [
      { id: "t1", label: "Query HKLM\\SYSTEM\\CurrentControlSet\\Enum\\USBSTOR for device serial #", completed: false },
      { id: "t2", label: "Inspect C:\\Windows\\Prefetch\\WINRAR.EXE-*.pf for execution run count", completed: false },
      { id: "t3", label: "Compare $STANDARD_INFORMATION vs $FILE_NAME timestamps to spot timestomping", completed: false }
    ],
    hintCommands: [
      "reg-query HKLM\\SYSTEM\\CurrentControlSet\\Enum\\USBSTOR",
      "prefetch-dump C:\\Windows\\Prefetch\\WINRAR.EXE-A92B3C11.pf",
      "mft-compare dossier_archive.rar",
      "sha256sum /evidence/usb_image.dd"
    ],
    flagSolution: "FLAG{USB_4C530001230415112041_WINRAR_RUN14}",
    flagHint: "Format: FLAG{USB_<serial>_WINRAR_RUN<count>}",
    simulatedOutput: `HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Enum\\USBSTOR
Subkey: Disk&Ven_SanDisk&Prod_Ultra_USB_3.0
  Hardware Serial: 4C530001230415112041
  FirstInstallDate: 2026-10-12 23:14:02 UTC
PREFETCH: WINRAR.EXE Run Count = 14
FLAG: FLAG{USB_4C530001230415112041_WINRAR_RUN14}`
  },
  {
    id: "case-ram-02",
    caseCode: "CDI409-RAM-02",
    title: "Operation VOLATILE HARVEST (Memory Forensics)",
    unit: "Unit 4: Live Incident Response & RAM",
    sansRef: "SANS Memory Forensics (Volatility) Cheat Sheet",
    sansUrl: "https://www.sans.org/posters/memory-forensics-cheat-sheet/",
    statute: "Budapest Convention Art. 16 Expedited Preservation & RA 10175 Sec. 4(a)(4)",
    difficulty: "Advanced",
    xpReward: 300,
    badgeName: "Memory Hunter",
    scenario:
      "A live workstation displaying an active ransomware extortion note was seized before shutdown. An uncompressed physical memory dump (memdump.raw) was acquired. Run Volatility commands to identify the malicious beacon process PID, active command-and-control (C2) network socket, and carved BitLocker volume recovery key.",
    tasks: [
      { id: "t1", label: "Run volatility pslist to identify the suspicious spawned process PID", completed: false },
      { id: "t2", label: "Run volatility netscan to discover the remote C2 IP address and port", completed: false },
      { id: "t3", label: "Carve memory strings to extract the plaintext BitLocker recovery key", completed: false }
    ],
    hintCommands: [
      "volatility -f memdump.raw windows.pslist",
      "volatility -f memdump.raw windows.netscan",
      "volatility -f memdump.raw windows.malfind",
      "strings memdump.raw | grep -i BitLocker-Key"
    ],
    flagSolution: "FLAG{PID_3824_C2_192.168.10.144_PORT_8443}",
    flagHint: "Format: FLAG{PID_<pid>_C2_<ip>_PORT_<port>}",
    simulatedOutput: `VOLATILITY 3 PROCESS LIST:
3824  3200  beacon.exe  2026-10-12 23:42:01 UTC
NETWORK SCAN:
TCP 192.168.10.45:49712 -> 192.168.10.144:8443 (PID 3824)
FLAG: FLAG{PID_3824_C2_192.168.10.144_PORT_8443}`
  },
  {
    id: "case-pcap-03",
    caseCode: "CDI409-NET-03",
    title: "Operation WIRE SNIFFER (Network Interception)",
    unit: "Unit 1 & 4: Threat Intelligence & PCAP",
    sansRef: "SANS Wireshark Packet Analysis Cheat Sheet",
    sansUrl: "https://www.sans.org/posters/packet-analysis-with-wireshark/",
    statute: "RA 10175 Sec. 4(a)(2) Illegal Interception & Sec. 4(b)(1) Computer Forgery",
    difficulty: "Beginner",
    xpReward: 200,
    badgeName: "Packet Analyst",
    scenario:
      "A rogue Wi-Fi pineapple tap was detected capturing intranet traffic at a regional government office. Examine suspect_traffic.pcap using tshark filters to isolate intercepted HTTP POST login credentials and identify the adversary domain.",
    tasks: [
      { id: "t1", label: "Inspect PCAP summary and frame count using pcap-info", completed: false },
      { id: "t2", label: "Filter HTTP POST authorization streams using tshark", completed: false },
      { id: "t3", label: "Recover intercepted plaintext credentials and spoofed domain", completed: false }
    ],
    hintCommands: [
      "pcap-info suspect_traffic.pcap",
      "tshark -r suspect_traffic.pcap -Y \"http.request.method == POST\"",
      "tshark -r suspect_traffic.pcap -z follow,tcp,ascii,2",
      "sha256sum suspect_traffic.pcap"
    ],
    flagSolution: "FLAG{USER_admin_PASS_AlphaCriminology2026}",
    flagHint: "Format: FLAG{USER_<username>_PASS_<password>}",
    simulatedOutput: `TSHARK HTTP POST CAPTURE:
POST /api/v1/auth/login HTTP/1.1
Host: portal-internal.fsuu-edu.ph
Payload: username=admin&password=AlphaCriminology2026
FLAG: FLAG{USER_admin_PASS_AlphaCriminology2026}`
  },
  {
    id: "case-green-04",
    caseCode: "CDI409-GEO-04",
    title: "Operation GREEN CANOPY (Wildlife & Timber Telemetry)",
    unit: "Unit 8: Green Forensics & Environmental Laws",
    sansRef: "SANS Drone & Mobile Forensics Whitepaper",
    sansUrl: "https://www.sans.org/white-papers/39105/",
    statute: "PD 705 (Revised Forestry Code) & RA 9147 (Wildlife Resources Act)",
    difficulty: "Intermediate",
    xpReward: 250,
    badgeName: "Green Forensics Ranger",
    scenario:
      "A contraband timber consignment was intercepted near Nasipit Seaport, Caraga. A seized commercial drone was used by the timber syndicate for aerial reconnaissance. Extract GPS waypoint flight records and examine sawdust stereomicroscopy analysis to verify White Lauan (Shorea contorta) logging inside a protected watershed.",
    tasks: [
      { id: "t1", label: "Extract EXIF GPS coordinate flight records from drone_telemetry.log", completed: false },
      { id: "t2", label: "Parse timber microscopic sawdust cross-section report", completed: false },
      { id: "t3", label: "Confirm CITES / Philippine Red List violation status", completed: false }
    ],
    hintCommands: [
      "cat /evidence/drone_telemetry.log",
      "parse-sawdust /evidence/sawdust_specimen_batch04.dat",
      "statute-check PD705 Shorea_contorta",
      "sha256sum /evidence/drone_flight.bin"
    ],
    flagSolution: "FLAG{GPS_8.9842N_125.3401E_SHOREA_CONTORTA}",
    flagHint: "Format: FLAG{GPS_<lat>_<lon>_<species>}",
    simulatedOutput: `DRONE TELEMETRY WAYPOINT AUDIT:
Takeoff: 8.9842N, 125.3401E (Mt. Mayapay Watershed Protected Area)
Species: Shorea contorta (White Lauan, IUCN Critically Endangered)
Violation: PD 705 Section 68 Unauthorized Cutting of Timber
FLAG: FLAG{GPS_8.9842N_125.3401E_SHOREA_CONTORTA}`
  },
  {
    id: "case-phish-05",
    caseCode: "CDI409-BEC-05",
    title: "Operation DEEP PHISH (CEO BEC & Wire Fraud)",
    unit: "Unit 3: Cybercrime Offenses & Digital Forgery",
    sansRef: "SANS Email Forensics Cheat Sheet",
    sansUrl: "https://www.sans.org/posters/email-incident-handling/",
    statute: "RA 10175 Sec. 4(b)(1) Computer Forgery & Sec. 4(b)(2) Computer Fraud",
    difficulty: "Intermediate",
    xpReward: 260,
    badgeName: "BEC Fraud Investigator",
    scenario:
      "An executive assistant at a regional shipping firm wired PHP 3,850,000 following an urgent email allegedly from the CEO authorizing emergency bunker fuel acquisition. The email was a Business Email Compromise (BEC) clone. Inspect executive_urgent.eml headers to trace the forged Return-Path, DKIM verification status, and adversary banking destination.",
    tasks: [
      { id: "t1", label: "Audit executive_urgent.eml header for SPF/DKIM authentication failures", completed: false },
      { id: "t2", label: "Identify originating mail transfer agent (MTA) IP address and country", completed: false },
      { id: "t3", label: "Extract the forged payment beneficiary routing number", completed: false }
    ],
    hintCommands: [
      "cat /evidence/executive_urgent.eml | grep -i Authentication-Results",
      "head -n 25 /evidence/executive_urgent.eml",
      "parse-eml /evidence/executive_urgent.eml",
      "sha256sum /evidence/executive_urgent.eml"
    ],
    flagSolution: "FLAG{DKIM_FAIL_IP_185.220.101.5_ACC_982410294}",
    flagHint: "Format: FLAG{DKIM_<status>_IP_<ip>_ACC_<account>}",
    simulatedOutput: `EMAIL HEADER FORENSICS: executive_urgent.eml
From: "Atty. Roberto Dela Cruz (CEO)" <ceo@shipping-fsuu.com>
Return-Path: <spoofed@anon-bulletproof-mta.ru>
Authentication-Results: dkim=fail (signature verification failed); spf=softfail
Originating IP: 185.220.101.5 (Tor Exit Node / Rotterdam)
Target Beneficiary Account: 982410294 (Mule Account, Offshore Route)
FLAG: FLAG{DKIM_FAIL_IP_185.220.101.5_ACC_982410294}`
  },
  {
    id: "case-mule-06",
    caseCode: "CDI409-FIN-06",
    title: "Operation GCASH MULE (Anti-Financial Account Scamming)",
    unit: "Unit 5: Financial Cybercrimes & Money Laundering",
    sansRef: "SANS Mobile & Cloud Evidence Triage",
    sansUrl: "https://www.sans.org/posters/sans-digital-forensics-pocket-guide/",
    statute: "RA 12010 (Anti-Financial Account Scamming Act / AFASA) & RA 11934 (SIM Registration)",
    difficulty: "Advanced",
    xpReward: 280,
    badgeName: "FinCrime Analyst",
    scenario:
      "A syndicate recruited university freshmen as registered GCash money mules, paying PHP 2,000 for verified accounts used to siphon phishing loot. Digital examiners seized a burner phone. Extract the SQLite SMS database messages and match illicit OTP transfers against subscriber identity records.",
    tasks: [
      { id: "t1", label: "Dump SMS OTP receipts from telephony.db using sqlite3", completed: false },
      { id: "t2", label: "Correlate mobile MSISDN with fake SIM registration affidavits", completed: false },
      { id: "t3", label: "Flag transactions violating RA 12010 Section 4 Money Mule offenses", completed: false }
    ],
    hintCommands: [
      "sqlite3 /evidence/telephony.db \"SELECT * FROM messages WHERE body LIKE '%GCash%' LIMIT 5;\"",
      "cat /evidence/gcash_audit_trail.csv",
      "statute-check RA12010 money_muling",
      "sha256sum /evidence/telephony.db"
    ],
    flagSolution: "FLAG{MULE_09174829104_TRAN_882910482_AFASA}",
    flagHint: "Format: FLAG{MULE_<msisdn>_TRAN_<id>_AFASA}",
    simulatedOutput: `TELEPHONY FORENSICS: telephony.db
Table: messages
[SMS 1048] 2026-10-13 14:22:01 UTC
Sender: GCash
Body: You sent PHP 50,000.00 to 09174829104. Ref No. 882910482.
AFASA Section 4 Violation Confirmed: Aggravated Financial Account Muling.
FLAG: FLAG{MULE_09174829104_TRAN_882910482_AFASA}`
  }
];

export const PREBUILT_CASE_IDS = new Set([
  "case-usb-01",
  "case-ram-02",
  "case-pcap-03",
  "case-green-04",
  "case-phish-05",
  "case-mule-06"
]);

/**
 * Helper to determine whether a case is an official pre-built curriculum docket
 */
export function isPrebuiltCase(c) {
  if (!c) return false;
  return Boolean(c.isPrebuilt || (c.id && PREBUILT_CASE_IDS.has(c.id)));
}

const LOCAL_STORAGE_KEY = "cdi409_forensic_cases";

/**
 * Get cases from localStorage or fallback to default
 */
export function getStoredForensicCases() {
  if (typeof window === "undefined") {
    return DEFAULT_FORENSIC_CASES;
  }
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Failed to parse stored forensic cases:", err);
  }
  return DEFAULT_FORENSIC_CASES;
}

/**
 * Fetch cases from Supabase if table exists, otherwise return local/default
 */
export async function fetchForensicCases() {
  const localCases = getStoredForensicCases();

  try {
    const { data, error } = await supabase
      .from("forensic_cases")
      .select("*")
      .order("created_at", { ascending: true });

    if (!error && Array.isArray(data) && data.length > 0) {
      // Map database snake_case to frontend camelCase
      const formatted = data.map((d) => ({
        id: d.id,
        caseCode: d.case_code || d.caseCode,
        title: d.title,
        unit: d.unit,
        sansRef: d.sans_ref || d.sansRef,
        sansUrl: d.sans_url || d.sansUrl,
        statute: d.statute,
        difficulty: d.difficulty || "Intermediate",
        xpReward: Number(d.xp_reward || d.xpReward || 200),
        badgeName: d.badge_name || d.badgeName,
        scenario: d.scenario,
        tasks: Array.isArray(d.tasks) ? d.tasks : JSON.parse(d.tasks || "[]"),
        hintCommands: Array.isArray(d.hint_commands)
          ? d.hint_commands
          : Array.isArray(d.hintCommands)
          ? d.hintCommands
          : JSON.parse(d.hint_commands || "[]"),
        flagSolution: d.flag_solution || d.flagSolution,
        flagHint: d.flag_hint || d.flagHint,
        simulatedOutput: d.simulated_output || d.simulatedOutput || "",
        isPrebuilt: Boolean(d.is_prebuilt ?? isPrebuiltCase(d))
      }));

      // Merge: Keep all Supabase cases, and preserve any local custom cases that haven't synced yet
      const dbIds = new Set(formatted.map((d) => d.id));
      const localCustom = localCases.filter((c) => !dbIds.has(c.id));
      const merged = [...formatted, ...localCustom];

      if (typeof window !== "undefined") {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
      }
      return merged;
    }
  } catch (err) {
    console.warn("Supabase forensic_cases query failed, using local/default:", err.message);
  }

  return localCases;
}

/**
 * Save (create or update) a case mission
 */
export async function saveForensicCase(caseData) {
  const currentCases = getStoredForensicCases();
  const id = caseData.id || `case-${Date.now()}`;
  const preparedCase = {
    ...caseData,
    id,
    xpReward: Number(caseData.xpReward || 200),
    tasks: caseData.tasks || [],
    hintCommands: caseData.hintCommands || []
  };

  const existingIndex = currentCases.findIndex((c) => c.id === id);
  let updatedCases = [];
  if (existingIndex >= 0) {
    updatedCases = [...currentCases];
    updatedCases[existingIndex] = preparedCase;
  } else {
    updatedCases = [...currentCases, preparedCase];
  }

  // 1. Save to LocalStorage immediately
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedCases));
    window.dispatchEvent(new CustomEvent("forensic-cases-updated", { detail: updatedCases }));
  }

  // 2. Try persisting to Supabase
  try {
    const dbPayload = {
      id: preparedCase.id,
      case_code: preparedCase.caseCode,
      title: preparedCase.title,
      unit: preparedCase.unit,
      sans_ref: preparedCase.sansRef,
      sans_url: preparedCase.sansUrl,
      statute: preparedCase.statute,
      difficulty: preparedCase.difficulty,
      xp_reward: preparedCase.xpReward,
      badge_name: preparedCase.badgeName,
      scenario: preparedCase.scenario,
      tasks: preparedCase.tasks,
      hint_commands: preparedCase.hintCommands,
      flag_solution: preparedCase.flagSolution,
      flag_hint: preparedCase.flagHint,
      simulated_output: preparedCase.simulatedOutput,
      is_prebuilt: Boolean(preparedCase.isPrebuilt || false),
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from("forensic_cases").upsert([dbPayload]);
    if (error) {
      console.warn("Supabase upsert warning (working in local cache):", error.message);
    }
  } catch (err) {
    console.warn("Supabase network error during case save:", err.message);
  }

  return { success: true, case: preparedCase, cases: updatedCases };
}

/**
 * Delete a case mission
 */
export async function deleteForensicCase(caseId) {
  const currentCases = getStoredForensicCases();
  const updatedCases = currentCases.filter((c) => c.id !== caseId);

  // 1. LocalStorage update
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedCases));
    window.dispatchEvent(new CustomEvent("forensic-cases-updated", { detail: updatedCases }));
  }

  // 2. Supabase deletion
  try {
    const { error } = await supabase.from("forensic_cases").delete().eq("id", caseId);
    if (error) {
      console.warn("Supabase deletion warning:", error.message);
    }
  } catch (err) {
    console.warn("Supabase network error during case delete:", err.message);
  }

  return { success: true, cases: updatedCases };
}

/**
 * Reset all cases back to defaults
 */
export async function resetForensicCasesToDefault() {
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_FORENSIC_CASES));
    window.dispatchEvent(new CustomEvent("forensic-cases-updated", { detail: DEFAULT_FORENSIC_CASES }));
  }
  return DEFAULT_FORENSIC_CASES;
}

/**
 * Subscribe to case updates in browser (handles both same-tab and cross-tab storage events)
 */
export function subscribeToForensicCases(callback) {
  if (typeof window === "undefined") return () => {};

  const handler = (e) => {
    callback(e.detail || getStoredForensicCases());
  };

  const storageHandler = (e) => {
    if (e.key === LOCAL_STORAGE_KEY) {
      try {
        const parsed = JSON.parse(e.newValue || "[]");
        if (Array.isArray(parsed) && parsed.length > 0) {
          callback(parsed);
        } else {
          callback(getStoredForensicCases());
        }
      } catch (err) {
        callback(getStoredForensicCases());
      }
    }
  };

  window.addEventListener("forensic-cases-updated", handler);
  window.addEventListener("storage", storageHandler);
  return () => {
    window.removeEventListener("forensic-cases-updated", handler);
    window.removeEventListener("storage", storageHandler);
  };
}
