-- =========================================================================
-- Supabase Schema: Dynamic Forensic Cases & CTF Mission Challenges
-- For CDI 409 Cybercrime Investigation & Environmental Laws
-- Note: User roles in system: ('student', 'instructor', 'superadmin')
--       where 'instructor' represents the Faculty / Admin role.
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.forensic_cases (
    id TEXT PRIMARY KEY,
    case_code TEXT NOT NULL,
    title TEXT NOT NULL,
    unit TEXT,
    sans_ref TEXT,
    sans_url TEXT,
    statute TEXT,
    difficulty TEXT DEFAULT 'Intermediate',
    xp_reward INTEGER DEFAULT 200,
    badge_name TEXT,
    scenario TEXT,
    tasks JSONB DEFAULT '[]'::jsonb,
    hint_commands JSONB DEFAULT '[]'::jsonb,
    flag_solution TEXT,
    flag_hint TEXT,
    simulated_output TEXT,
    is_prebuilt BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.forensic_cases ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Forensic cases viewable by authenticated users" ON public.forensic_cases;
DROP POLICY IF EXISTS "Forensic cases manageable by faculty and admins" ON public.forensic_cases;
DROP POLICY IF EXISTS "Public read access for client simulations" ON public.forensic_cases;
DROP POLICY IF EXISTS "Allow select forensic_cases" ON public.forensic_cases;
DROP POLICY IF EXISTS "Allow insert forensic_cases" ON public.forensic_cases;
DROP POLICY IF EXISTS "Allow update forensic_cases" ON public.forensic_cases;
DROP POLICY IF EXISTS "Allow delete forensic_cases" ON public.forensic_cases;
DROP POLICY IF EXISTS "Allow all forensic_cases" ON public.forensic_cases;

-- Permissive policies for LMS simulations & multi-role authoring (matching audit_logs and curriculum)
CREATE POLICY "Allow select forensic_cases"
ON public.forensic_cases FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow insert forensic_cases"
ON public.forensic_cases FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow update forensic_cases"
ON public.forensic_cases FOR UPDATE
TO public
USING (true);

CREATE POLICY "Allow delete forensic_cases"
ON public.forensic_cases FOR DELETE
TO public
USING (true);

-- Grant table permissions to standard Supabase roles
GRANT ALL ON TABLE public.forensic_cases TO postgres, anon, authenticated, service_role;

-- =========================================================================
-- Pre-Seed: 6 Standard Curriculum Case Dockets (Safe Upsert)
-- =========================================================================
INSERT INTO public.forensic_cases (
    id, case_code, title, unit, sans_ref, sans_url, statute, difficulty, xp_reward, badge_name, scenario, tasks, hint_commands, flag_solution, flag_hint, simulated_output, is_prebuilt
) VALUES
(
    'case-usb-01',
    'CDI409-USB-01',
    'Operation SILENT EXFIL (USB & Artifacts)',
    'Unit 6: Forensic Artifacts',
    'SANS Hunt Evil Cheat Sheet',
    'https://www.sans.org/posters/hunt-evil/',
    'RA 10175 Sec. 4(a)(1) Illegal Access & Sec. 4(a)(3) Data Interference',
    'Intermediate',
    250,
    'Artifact Investigator',
    'A senior researcher at a Butuan City laboratory is suspected of connecting an unauthorized USB flash drive at 23:14 UTC to exfiltrate 4.2 GB of confidential criminal justice dossiers. The suspect denies ever inserting a USB drive. Use Registry and Prefetch commands to extract the device serial number and prove application execution.',
    $$[{"id":"t1","label":"Query HKLM\\SYSTEM\\CurrentControlSet\\Enum\\USBSTOR for device serial #","completed":false},{"id":"t2","label":"Inspect C:\\Windows\\Prefetch\\WINRAR.EXE-*.pf for execution run count","completed":false},{"id":"t3","label":"Compare $STANDARD_INFORMATION vs $FILE_NAME timestamps to spot timestomping","completed":false}]$$::jsonb,
    $$["reg-query HKLM\\SYSTEM\\CurrentControlSet\\Enum\\USBSTOR","prefetch-dump C:\\Windows\\Prefetch\\WINRAR.EXE-A92B3C11.pf","mft-compare dossier_archive.rar","sha256sum /evidence/usb_image.dd"]$$::jsonb,
    'FLAG{USB_4C530001230415112041_WINRAR_RUN14}',
    'Format: FLAG{USB_<serial>_WINRAR_RUN<count>}',
    $$HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Enum\USBSTOR
Subkey: Disk&Ven_SanDisk&Prod_Ultra_USB_3.0
Hardware Serial: 4C530001230415112041
FirstInstallDate: 2026-10-12 23:14:02 UTC
PREFETCH: WINRAR.EXE Run Count = 14
FLAG: FLAG{USB_4C530001230415112041_WINRAR_RUN14}$$,
    true
),
(
    'case-ram-02',
    'CDI409-RAM-02',
    'Operation VOLATILE HARVEST (Memory Forensics)',
    'Unit 4: Live Incident Response & RAM',
    'SANS Memory Forensics (Volatility) Cheat Sheet',
    'https://www.sans.org/posters/memory-forensics-cheat-sheet/',
    'Budapest Convention Art. 16 Expedited Preservation & RA 10175 Sec. 4(a)(4)',
    'Advanced',
    300,
    'Memory Hunter',
    'A live workstation displaying an active ransomware extortion note was seized before shutdown. An uncompressed physical memory dump (memdump.raw) was acquired. Run Volatility commands to identify the malicious loader PID, active command-and-control (C2) network socket, and carved BitLocker volume recovery key.',
    $$[{"id":"t1","label":"Run volatility pslist to identify the suspicious spawned process PID","completed":false},{"id":"t2","label":"Run volatility netscan to discover the remote C2 IP address and port","completed":false},{"id":"t3","label":"Carve memory strings to extract the plaintext BitLocker recovery key","completed":false}]$$::jsonb,
    $$["volatility -f memdump.raw windows.pslist","volatility -f memdump.raw windows.netscan","volatility -f memdump.raw windows.malfind","strings memdump.raw | grep -i BitLocker-Key"]$$::jsonb,
    'FLAG{PID_3824_C2_192.168.10.144_PORT_8443}',
    'Format: FLAG{PID_<pid>_C2_<ip>_PORT_<port>}',
    $$VOLATILITY 3 PROCESS LIST:
3824  3200  beacon.exe  2026-10-12 23:42:01 UTC
NETWORK SCAN:
TCP 192.168.10.45:49712 -> 192.168.10.144:8443 (PID 3824)
FLAG: FLAG{PID_3824_C2_192.168.10.144_PORT_8443}$$,
    true
),
(
    'case-pcap-03',
    'CDI409-NET-03',
    'Operation WIRE SNIFFER (Network Interception)',
    'Unit 1 & 4: Threat Intelligence & PCAP',
    'SANS Wireshark Packet Analysis Cheat Sheet',
    'https://www.sans.org/posters/packet-analysis-with-wireshark/',
    'RA 10175 Sec. 4(a)(2) Illegal Interception & Sec. 4(b)(1) Computer Forgery',
    'Beginner',
    200,
    'Packet Analyst',
    'A rogue Wi-Fi pineapple tap was detected capturing intranet traffic at a regional government office. Examine suspect_traffic.pcap using tshark filters to isolate intercepted HTTP POST login credentials and identify the adversary domain.',
    $$[{"id":"t1","label":"Inspect PCAP summary and frame count using pcap-info","completed":false},{"id":"t2","label":"Filter HTTP POST authorization streams using tshark","completed":false},{"id":"t3","label":"Recover intercepted plaintext credentials and spoofed domain","completed":false}]$$::jsonb,
    $$["pcap-info suspect_traffic.pcap","tshark -r suspect_traffic.pcap -Y \"http.request.method == POST\"","tshark -r suspect_traffic.pcap -z follow,tcp,ascii,2","sha256sum suspect_traffic.pcap"]$$::jsonb,
    'FLAG{USER_admin_PASS_AlphaCriminology2026}',
    'Format: FLAG{USER_<username>_PASS_<password>}',
    $$TSHARK HTTP POST CAPTURE:
POST /api/v1/auth/login HTTP/1.1
Host: portal-internal.fsuu-edu.ph
Payload: username=admin&password=AlphaCriminology2026
FLAG: FLAG{USER_admin_PASS_AlphaCriminology2026}$$,
    true
),
(
    'case-green-04',
    'CDI409-GEO-04',
    'Operation GREEN CANOPY (Wildlife & Timber Telemetry)',
    'Unit 8: Green Forensics & Environmental Laws',
    'SANS Drone & Mobile Forensics Whitepaper',
    'https://www.sans.org/white-papers/39105/',
    'PD 705 (Revised Forestry Code) & RA 9147 (Wildlife Resources Act)',
    'Intermediate',
    250,
    'Green Forensics Ranger',
    'A contraband timber consignment was intercepted near Nasipit Seaport, Caraga. A seized commercial drone was used by the timber syndicate for aerial reconnaissance. Extract GPS waypoint flight records and examine sawdust stereomicroscopy analysis to verify White Lauan (Shorea contorta) logging inside a protected watershed.',
    $$[{"id":"t1","label":"Extract EXIF GPS coordinate flight records from drone_telemetry.log","completed":false},{"id":"t2","label":"Parse timber microscopic sawdust cross-section report","completed":false},{"id":"t3","label":"Confirm CITES / Philippine Red List violation status","completed":false}]$$::jsonb,
    $$["cat /evidence/drone_telemetry.log","parse-sawdust /evidence/sawdust_specimen_batch04.dat","statute-check PD705 Shorea_contorta","sha256sum /evidence/drone_flight.bin"]$$::jsonb,
    'FLAG{GPS_8.9842N_125.3401E_SHOREA_CONTORTA}',
    'Format: FLAG{GPS_<lat>_<lon>_<species>}',
    $$DRONE TELEMETRY WAYPOINT AUDIT:
Takeoff: 8.9842N, 125.3401E (Mt. Mayapay Watershed Protected Area)
Species: Shorea contorta (White Lauan, IUCN Critically Endangered)
Violation: PD 705 Section 68 Unauthorized Cutting of Timber
FLAG: FLAG{GPS_8.9842N_125.3401E_SHOREA_CONTORTA}$$,
    true
),
(
    'case-phish-05',
    'CDI409-BEC-05',
    'Operation DEEP PHISH (CEO BEC & Wire Fraud)',
    'Unit 3: Cybercrime Offenses & Digital Forgery',
    'SANS Email Forensics Cheat Sheet',
    'https://www.sans.org/posters/email-incident-handling/',
    'RA 10175 Sec. 4(b)(1) Computer Forgery & Sec. 4(b)(2) Computer Fraud',
    'Intermediate',
    260,
    'BEC Fraud Investigator',
    'An executive assistant at a regional shipping firm wired PHP 3,850,000 following an urgent email allegedly from the CEO authorizing emergency bunker fuel acquisition. The email was a Business Email Compromise (BEC) clone. Inspect executive_urgent.eml headers to trace the forged Return-Path, DKIM verification status, and adversary banking destination.',
    $$[{"id":"t1","label":"Audit executive_urgent.eml header for SPF/DKIM authentication failures","completed":false},{"id":"t2","label":"Identify originating mail transfer agent (MTA) IP address and country","completed":false},{"id":"t3","label":"Extract the forged payment beneficiary routing number","completed":false}]$$::jsonb,
    $$["cat /evidence/executive_urgent.eml | grep -i Authentication-Results","head -n 25 /evidence/executive_urgent.eml","parse-eml /evidence/executive_urgent.eml","sha256sum /evidence/executive_urgent.eml"]$$::jsonb,
    'FLAG{DKIM_FAIL_IP_185.220.101.5_ACC_982410294}',
    'Format: FLAG{DKIM_<status>_IP_<ip>_ACC_<account>}',
    $$EMAIL HEADER FORENSICS: executive_urgent.eml
From: "Atty. Roberto Dela Cruz (CEO)" <ceo@shipping-fsuu.com>
Return-Path: <spoofed@anon-bulletproof-mta.ru>
Authentication-Results: dkim=fail (signature verification failed); spf=softfail
Originating IP: 185.220.101.5 (Tor Exit Node / Rotterdam)
Target Beneficiary Account: 982410294 (Mule Account, Offshore Route)
FLAG: FLAG{DKIM_FAIL_IP_185.220.101.5_ACC_982410294}$$,
    true
),
(
    'case-mule-06',
    'CDI409-FIN-06',
    'Operation GCASH MULE (Anti-Financial Account Scamming)',
    'Unit 5: Financial Cybercrimes & Money Laundering',
    'SANS Mobile & Cloud Evidence Triage',
    'https://www.sans.org/posters/sans-digital-forensics-pocket-guide/',
    'RA 12010 (Anti-Financial Account Scamming Act / AFASA) & RA 11934 (SIM Registration)',
    'Advanced',
    280,
    'FinCrime Analyst',
    'A syndicate recruited university freshmen as registered GCash money mules, paying PHP 2,000 for verified accounts used to siphon phishing loot. Digital examiners seized a burner phone. Extract the SQLite SMS database messages and match illicit OTP transfers against subscriber identity records.',
    $$[{"id":"t1","label":"Dump SMS OTP receipts from telephony.db using sqlite3","completed":false},{"id":"t2","label":"Correlate mobile MSISDN with fake SIM registration affidavits","completed":false},{"id":"t3","label":"Flag transactions violating RA 12010 Section 4 Money Mule offenses","completed":false}]$$::jsonb,
    $$["sqlite3 /evidence/telephony.db \"SELECT * FROM messages WHERE body LIKE '%GCash%' LIMIT 5;\"","cat /evidence/gcash_audit_trail.csv","statute-check RA12010 money_muling","sha256sum /evidence/telephony.db"]$$::jsonb,
    'FLAG{MULE_09174829104_TRAN_882910482_AFASA}',
    'Format: FLAG{MULE_<msisdn>_TRAN_<id>_AFASA}',
    $$TELEPHONY FORENSICS: telephony.db
Table: messages
[SMS 1048] 2026-10-13 14:22:01 UTC
Sender: GCash
Body: You sent PHP 50,000.00 to 09174829104. Ref No. 882910482.
AFASA Section 4 Violation Confirmed: Aggravated Financial Account Muling.
FLAG: FLAG{MULE_09174829104_TRAN_882910482_AFASA}$$,
    true
)
ON CONFLICT (id) DO NOTHING;
