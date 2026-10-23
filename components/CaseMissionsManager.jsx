"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Terminal,
  Plus,
  Trash2,
  Pencil,
  Copy,
  Search,
  Scale,
  Award,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  RotateCcw,
  BookOpen,
  Check,
  ChevronRight,
  ChevronLeft,
  Shield,
  FileCode2,
  Cpu,
  Layers,
  KeyRound,
  Download,
  ClipboardList,
  FileText,
  HelpCircle,
  ExternalLink,
  Laptop,
  AlertTriangle,
  Play,
  X,
  Smartphone,
  Lock,
  Usb,
  Trees,
  Mail,
  Sliders,
  CheckCheck,
  Info
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  fetchForensicCases,
  saveForensicCase,
  deleteForensicCase,
  resetForensicCasesToDefault,
  isPrebuiltCase
} from "@/lib/forensicCasesService";

// Non-Tech Friendly Crime Starter Cards
const CRIME_TOPIC_CARDS = [
  {
    id: "gcash-smish",
    title: "GCash / SMS Smishing Scam",
    tagline: "Fake bank / e-wallet text message lures victim into OTP phishing site.",
    icon: Smartphone,
    law: "RA 12010 (AFASA) & RA 11934",
    difficulty: "Intermediate",
    xpReward: 250,
    badgeName: "Smishing Analyst",
    defaultCase: {
      caseCode: "CDI409-SMISH",
      title: "Operation SMISH TAP (Bank OTP Hijacking)",
      unit: "Unit 3: Cybercrime Offenses & Digital Forgery",
      statute: "RA 12010 (Anti-Financial Account Scamming Act) & RA 11934 (SIM Reg)",
      difficulty: "Intermediate",
      xpReward: 250,
      badgeName: "Smishing Analyst",
      scenario:
        "Multiple citizens reported unauthorized funds depletion after receiving an SMS regarding 'SIM card deactivation warning'. The threat actor lured victims into a phishing portal. Examine the extracted telephony database to correlate originating shortcodes and adversary domains.",
      tasks: [
        { id: "t1", label: "Check telephony database for fraudulent SMS messages", completed: false },
        { id: "t2", label: "Identify the fake scammer website link", completed: false },
        { id: "t3", label: "Extract victim mobile number and stolen OTP code", completed: false }
      ],
      hintCommands: [
        "sqlite3 telephony.db \"SELECT * FROM messages WHERE body LIKE '%SIM%';\"",
        "grep -i 'http' telephony.db",
        "sha256sum telephony.db"
      ],
      flagSolution: "FLAG{DOMAIN_sim-verify-ph.org_OTP_829104}",
      flagHint: "Format: FLAG{DOMAIN_<domain>_OTP_<code>}",
      simulatedOutput: `SQLITE TELEPHONY AUDIT:\n[SMS 2041] Sender: GLOBE-NOTICE (Spoofed SenderID)\nBody: Your SIM card will be deactivated. Verify immediately at http://sim-verify-ph.org/login\nIntercepted OTP: 829104\nFLAG: FLAG{DOMAIN_sim-verify-ph.org_OTP_829104}`
    }
  },
  {
    id: "ransomware",
    title: "Hospital Ransomware Extortion",
    tagline: "Server encrypted and locked by hackers demanding payment.",
    icon: Lock,
    law: "RA 10175 Sec. 4(a)(4) & Sec. 4(c)(1)",
    difficulty: "Advanced",
    xpReward: 300,
    badgeName: "Extortion Investigator",
    defaultCase: {
      caseCode: "CDI409-RAM",
      title: "Operation CRYPTO VAULT (Hospital Ransomware Attack)",
      unit: "Unit 4: Live Incident Response & RAM",
      statute: "RA 10175 Sec. 4(a)(4) System Interference & Sec. 4(c)(1) Cyber Extortion",
      difficulty: "Advanced",
      xpReward: 300,
      badgeName: "Extortion Investigator",
      scenario:
        "A regional hospital database server in Butuan City was locked by a ransomware strain at 03:00 UTC. The IT administrator preserved a physical memory dump before shutting down the host. Analyze volatile RAM to identify the malicious loader PID and extract the decryptor key.",
      tasks: [
        { id: "t1", label: "Inspect the computer process list to find the ransomware", completed: false },
        { id: "t2", label: "Find the remote hacker IP address and port connection", completed: false },
        { id: "t3", label: "Recover the secret decryptor key from memory", completed: false }
      ],
      hintCommands: [
        "volatility -f memdump.raw windows.pslist",
        "volatility -f memdump.raw windows.netscan",
        "strings memdump.raw | grep -i RANSOM_SALT"
      ],
      flagSolution: "FLAG{PID_4192_IP_194.26.29.112_SALT_9A8B7C}",
      flagHint: "Format: FLAG{PID_<pid>_IP_<ip>_SALT_<hex>}",
      simulatedOutput: `VOLATILITY INCIDENT AUDIT:\nPID 4192 (cryptolocker.exe) spawned by powershell.exe (PID 2100)\nC2 Connection: 194.26.29.112:443 (ESTABLISHED)\nRECOVERED MEMORY STRING: RANSOM_SALT=9A8B7C2144F\nFLAG: FLAG{PID_4192_IP_194.26.29.112_SALT_9A8B7C}`
    }
  },
  {
    id: "usb-theft",
    title: "USB Stolen Data / Flash Drive",
    tagline: "Suspect plugged unauthorized flash drive at midnight to copy confidential files.",
    icon: Usb,
    law: "RA 10175 Sec. 4(a)(1) Illegal Access",
    difficulty: "Intermediate",
    xpReward: 250,
    badgeName: "Artifact Investigator",
    defaultCase: {
      caseCode: "CDI409-USB",
      title: "Operation SILENT EXFIL (USB & Artifacts)",
      unit: "Unit 6: Forensic Artifacts",
      statute: "RA 10175 Sec. 4(a)(1) Illegal Access & Sec. 4(a)(3) Data Interference",
      difficulty: "Intermediate",
      xpReward: 250,
      badgeName: "Artifact Investigator",
      scenario:
        "A senior researcher at a Butuan City laboratory is suspected of connecting an unauthorized USB flash drive at 23:14 UTC to exfiltrate 4.2 GB of confidential criminal justice dossiers. The suspect denies ever inserting a USB drive. Use Registry and Prefetch commands to extract the device serial number and prove application execution.",
      tasks: [
        { id: "t1", label: "Find the USB flash drive hardware serial number in registry", completed: false },
        { id: "t2", label: "Check how many times the file compressor (WinRAR) was executed", completed: false },
        { id: "t3", label: "Verify evidence hash to prove files were not tampered", completed: false }
      ],
      hintCommands: [
        "reg-query HKLM\\SYSTEM\\CurrentControlSet\\Enum\\USBSTOR",
        "prefetch-dump C:\\Windows\\Prefetch\\WINRAR.EXE-A92B3C11.pf",
        "sha256sum /evidence/usb_image.dd"
      ],
      flagSolution: "FLAG{USB_4C530001230415112041_WINRAR_RUN14}",
      flagHint: "Format: FLAG{USB_<serial>_WINRAR_RUN<count>}",
      simulatedOutput: `HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Enum\\USBSTOR\nSubkey: Disk&Ven_SanDisk&Prod_Ultra_USB_3.0\nHardware Serial: 4C530001230415112041\nFirstInstallDate: 2026-10-12 23:14:02 UTC\nPREFETCH: WINRAR.EXE Run Count = 14\nFLAG: FLAG{USB_4C530001230415112041_WINRAR_RUN14}`
    }
  },
  {
    id: "timber",
    title: "Illegal Timber Logging / Forestry",
    tagline: "Chainsaw logs and GPS seized near a protected watershed reserve.",
    icon: Trees,
    law: "PD 705 (Revised Forestry Code)",
    difficulty: "Intermediate",
    xpReward: 275,
    badgeName: "Forestry Cyber Ranger",
    defaultCase: {
      caseCode: "CDI409-TIMBER",
      title: "Operation RED CEDAR (Protected Watershed Logging)",
      unit: "Unit 8: Green Forensics & Environmental Laws",
      statute: "PD 705 (Revised Forestry Code of the Philippines)",
      difficulty: "Intermediate",
      xpReward: 275,
      badgeName: "Forestry Cyber Ranger",
      scenario:
        "A DENR patrol team seized a handheld GPS receiver and chainsaw logs near a protected watershed. Extract the Garmin GPX tracklogs and match the timestamps against satellite synthetic aperture radar (SAR) deforestation telemetry.",
      tasks: [
        { id: "t1", label: "Extract GPS coordinates from seized handheld receiver", completed: false },
        { id: "t2", label: "Confirm if coordinates fall inside the protected watershed reserve", completed: false },
        { id: "t3", label: "Calculate estimated volume of confiscated Shorea almon timber", completed: false }
      ],
      hintCommands: [
        "cat /evidence/garmin_tracklog.gpx | grep '<trkpt'",
        "parse-gpx /evidence/garmin_tracklog.gpx",
        "statute-check PD705 Shorea_almon"
      ],
      flagSolution: "FLAG{COORD_8.9211N_125.4019E_VOL_42CUM}",
      flagHint: "Format: FLAG{COORD_<lat>_<lon>_VOL_<vol>}",
      simulatedOutput: `GARMIN GPX WAYPOINT AUDIT:\nTrackpoint 14: 8.9211N, 125.4019E (Elevation: 412m)\nZone: Mt. Hilong-Hilong Protected Watershed Reserve\nSpecies: Shorea almon (Light Red Meranti) - 42.5 cu.m.\nViolation: PD 705 Sec. 68 Unauthorized Harvesting\nFLAG: FLAG{COORD_8.9211N_125.4019E_VOL_42CUM}`
    }
  },
  {
    id: "bec-email",
    title: "Fake Dean/President Email (Wire Fraud)",
    tagline: "Urgent email sent to accounting clerk spoofing the university president.",
    icon: Mail,
    law: "RA 10175 Sec. 4(b)(2) Computer Fraud",
    difficulty: "Intermediate",
    xpReward: 260,
    badgeName: "Wire Fraud Examiner",
    defaultCase: {
      caseCode: "CDI409-BEC",
      title: "Operation GHOST WIRE (CFO Payroll Interception)",
      unit: "Unit 3: Cybercrime Offenses & Digital Forgery",
      statute: "RA 10175 Sec. 4(b)(1) Computer Forgery & Sec. 4(b)(2) Computer Fraud",
      difficulty: "Intermediate",
      xpReward: 260,
      badgeName: "Wire Fraud Examiner",
      scenario:
        "An accounts payable accountant wired PHP 3,850,000 to an offshore account after receiving an urgent email purportedly signed by the University President. Inspect raw email RFC 822 headers to isolate spoofed Reply-To tags and SPF authentication failures.",
      tasks: [
        { id: "t1", label: "Inspect the email header to see if the sender was forged (SPF fail)", completed: false },
        { id: "t2", label: "Find the real scammer IP address and reply email", completed: false },
        { id: "t3", label: "Identify the fraudulent wire transfer bank account number", completed: false }
      ],
      hintCommands: [
        "parse-eml /evidence/urgent_wire_notice.eml",
        "cat /evidence/urgent_wire_notice.eml | grep -E 'From|Reply-To|Received:'",
        "whois 185.220.101.5"
      ],
      flagSolution: "FLAG{SPF_FAIL_IP_185.220.101.5_ACCT_99182301}",
      flagHint: "Format: FLAG{SPF_FAIL_IP_<ip>_ACCT_<acct>}",
      simulatedOutput: `EMAIL HEADER FORENSICS:\nReturn-Path: <spoofed-exec@univ-notice.tk>\nAuthentication-Results: spf=fail (sender IP 185.220.101.5)\nReply-To: wire-desk@offshore-clearing.su\nRemittance Account: 99182301 (First Global Offshore Trust)\nFLAG: FLAG{SPF_FAIL_IP_185.220.101.5_ACCT_99182301}`
    }
  },
  {
    id: "custom",
    title: "Blank / Custom Investigation",
    tagline: "Start with a clean blank canvas to write your own unique criminology scenario.",
    icon: Sparkles,
    law: "Custom Philippine Law",
    difficulty: "Beginner",
    xpReward: 200,
    badgeName: "Cyber Investigator",
    defaultCase: {
      caseCode: "CDI409-CUSTOM",
      title: "New Investigation Case Study",
      unit: "Unit 1: Fundamentals of Cybercrime Investigation",
      statute: "RA 10175 (Cybercrime Prevention Act of 2012)",
      difficulty: "Intermediate",
      xpReward: 250,
      badgeName: "Cyber Investigator",
      scenario: "Describe what happened in simple words. Who was the suspect and what evidence was seized?",
      tasks: [
        { id: "t1", label: "Examine seized evidence files in terminal", completed: false },
        { id: "t2", label: "Identify unauthorized activity and timestamp", completed: false },
        { id: "t3", label: "Recover secret proof code to confirm finding", completed: false }
      ],
      hintCommands: ["ls -la /evidence", "sha256sum /evidence/*"],
      flagSolution: "FLAG{CASE_SOLVED_2026}",
      flagHint: "Format: FLAG{...}",
      simulatedOutput: "Artifact inspection complete.\nFLAG: FLAG{CASE_SOLVED_2026}"
    }
  }
];

// Philippine Law Dropdown Options
const PHILIPPINE_LAWS = [
  { value: "RA 10175 Sec. 4(a)(1) Illegal Access", label: "RA 10175 Sec. 4(a)(1) - Illegal Access (Hacking / Unauthorized Entry)" },
  { value: "RA 10175 Sec. 4(a)(4) System Interference", label: "RA 10175 Sec. 4(a)(4) - System Interference (Ransomware / Denial of Service)" },
  { value: "RA 10175 Sec. 4(b)(1) Computer Forgery", label: "RA 10175 Sec. 4(b)(1) - Computer-Related Forgery (Email / Document Spoofing)" },
  { value: "RA 10175 Sec. 4(b)(2) Computer Fraud", label: "RA 10175 Sec. 4(b)(2) - Computer-Related Fraud (Phishing / Financial Scam)" },
  { value: "RA 12010 (Anti-Financial Account Scamming Act)", label: "RA 12010 (AFASA) - Money Muling & E-Wallet Phishing (GCash / Maya)" },
  { value: "RA 11934 (SIM Registration Act)", label: "RA 11934 - SIM Card Registration Act (Spoofed / Unregistered SIMs)" },
  { value: "PD 705 (Revised Forestry Code of the Philippines)", label: "PD 705 - Revised Forestry Code (Illegal Timber Logging & Cutting)" },
  { value: "RA 9147 (Wildlife Resources Conservation & Protection Act)", label: "RA 9147 - Wildlife Protection Act (Poaching & Online Animal Trafficking)" },
  { value: "RA 10173 (Data Privacy Act of 2012)", label: "RA 10173 - Data Privacy Act (Unauthorized Disclosure of Personal Data)" },
  { value: "Budapest Convention on Cybercrime", label: "Budapest Convention on Cybercrime (Art. 16 Expedited Preservation of Data)" }
];

export default function CaseMissionsManager() {
  const [cases, setCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [originFilter, setOriginFilter] = useState("All"); // 'All', 'Prebuilt', 'Custom'
  const [revealedFlags, setRevealedFlags] = useState({});

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCaseId, setEditingCaseId] = useState(null); // null = new, string = edit
  const [isWizardMode, setIsWizardMode] = useState(true); // true = Non-Tech Simple Wizard, false = Technical Expert Mode
  const [wizardStep, setWizardStep] = useState(1); // 1 = Pick Crime, 2 = Story & Law, 3 = Tasks & Answer, 4 = Review & Publish
  const [selectedTopicId, setSelectedTopicId] = useState("gcash-smish");
  const [activeModalTab, setActiveModalTab] = useState("docket"); // For Expert Mode

  // Form State
  const [formData, setFormData] = useState({
    caseCode: "",
    title: "",
    unit: "Unit 3: Cybercrime Offenses & Digital Forgery",
    statute: "RA 12010 (Anti-Financial Account Scamming Act)",
    difficulty: "Intermediate",
    xpReward: 250,
    badgeName: "Smishing Analyst",
    sansRef: "SANS Cheat Sheet Reference",
    sansUrl: "https://www.sans.org/posters/hunt-evil/",
    scenario: "",
    tasks: [{ id: "t1", label: "Examine exhibit artifacts", completed: false }],
    hintCommands: ["ls -la", "sha256sum /evidence/*"],
    flagSolution: "FLAG{EVIDENCE_SOLVED_2026}",
    flagHint: "Format: FLAG{...}",
    simulatedOutput: "Artifact inspection complete.\nFLAG: FLAG{EVIDENCE_SOLVED_2026}"
  });

  // Task & Hint Input buffers
  const [newTaskInput, setNewTaskInput] = useState("");
  const [newHintInput, setNewHintInput] = useState("");
  const [flagTestInput, setFlagTestInput] = useState("");

  // Confirmation & Notice modals
  const [notice, setNotice] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Load cases on mount
  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    setIsLoading(true);
    try {
      const fetched = await fetchForensicCases();
      setCases(fetched);
    } catch (err) {
      console.error("Failed to load cases:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Metrics summary
  const metrics = useMemo(() => {
    const totalCases = cases.length;
    const prebuiltCount = cases.filter((c) => isPrebuiltCase(c)).length;
    const customCount = totalCases - prebuiltCount;
    const totalXP = cases.reduce((acc, c) => acc + (Number(c.xpReward) || 0), 0);
    const statutesSet = new Set(cases.map((c) => c.statute?.split("(")[0]?.trim()).filter(Boolean));
    return {
      totalCases,
      prebuiltCount,
      customCount,
      totalXP,
      statutesCount: statutesSet.size
    };
  }, [cases]);

  // Filtered cases
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.title?.toLowerCase().includes(q) ||
        c.caseCode?.toLowerCase().includes(q) ||
        c.statute?.toLowerCase().includes(q) ||
        c.scenario?.toLowerCase().includes(q);

      const matchesDifficulty = difficultyFilter === "All" || c.difficulty === difficultyFilter;
      const matchesOrigin =
        originFilter === "All" ||
        (originFilter === "Prebuilt" && isPrebuiltCase(c)) ||
        (originFilter === "Custom" && !isPrebuiltCase(c));

      return matchesSearch && matchesDifficulty && matchesOrigin;
    });
  }, [cases, searchQuery, difficultyFilter, originFilter]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingCaseId(null);
    setIsWizardMode(true);
    setWizardStep(1);
    setSelectedTopicId("gcash-smish");

    // Load default from first card
    const firstCard = CRIME_TOPIC_CARDS[0];
    applyTopicToForm(firstCard, cases.length + 1);

    setNewTaskInput("");
    setNewHintInput("");
    setFlagTestInput("");
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (caseItem) => {
    setEditingCaseId(caseItem.id);
    setIsWizardMode(false); // Edit opens in detailed tabbed view by default so they see everything
    setActiveModalTab("docket");
    setFormData({
      caseCode: caseItem.caseCode || "",
      title: caseItem.title || "",
      unit: caseItem.unit || "Unit 6: Forensic Artifacts",
      statute: caseItem.statute || "",
      difficulty: caseItem.difficulty || "Intermediate",
      xpReward: caseItem.xpReward || 250,
      badgeName: caseItem.badgeName || "Forensic Analyst",
      sansRef: caseItem.sansRef || "",
      sansUrl: caseItem.sansUrl || "",
      scenario: caseItem.scenario || "",
      tasks: Array.isArray(caseItem.tasks) ? [...caseItem.tasks] : [],
      hintCommands: Array.isArray(caseItem.hintCommands) ? [...caseItem.hintCommands] : [],
      flagSolution: caseItem.flagSolution || "",
      flagHint: caseItem.flagHint || "Format: FLAG{...}",
      simulatedOutput: caseItem.simulatedOutput || ""
    });
    setNewTaskInput("");
    setNewHintInput("");
    setFlagTestInput("");
    setIsModalOpen(true);
  };

  // Apply a Crime Topic to form
  const applyTopicToForm = (topicCard, caseNum = cases.length + 1) => {
    setSelectedTopicId(topicCard.id);
    const def = topicCard.defaultCase;
    setFormData({
      caseCode: `${def.caseCode}-${String(caseNum).padStart(2, "0")}`,
      title: def.title,
      unit: def.unit,
      statute: def.statute,
      difficulty: def.difficulty,
      xpReward: def.xpReward,
      badgeName: def.badgeName,
      sansRef: "SANS DFIR Reference Sheet",
      sansUrl: "https://www.sans.org/posters/hunt-evil/",
      scenario: def.scenario,
      tasks: def.tasks ? [...def.tasks] : [],
      hintCommands: def.hintCommands ? [...def.hintCommands] : [],
      flagSolution: def.flagSolution,
      flagHint: def.flagHint,
      simulatedOutput: def.simulatedOutput
    });
  };

  // Generate a random clean answer code for non-tech users
  const handleGenerateAnswerKey = () => {
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    const newKey = `FLAG{CDI409_SOLVED_${randomHex}}`;
    setFormData((prev) => ({
      ...prev,
      flagSolution: newKey,
      flagHint: "Format: FLAG{CDI409_SOLVED_<CODE>}"
    }));
    setNotice({ type: "success", text: "Generated fresh secret answer key!" });
    setTimeout(() => setNotice(null), 2500);
  };

  // Form Submit
  const handleSaveCase = async () => {
    if (!formData.title.trim() || !formData.caseCode.trim()) {
      setNotice({ type: "error", text: "Please enter a Case Title and Case Code." });
      if (isWizardMode) setWizardStep(2);
      return;
    }
    if (!formData.flagSolution.trim()) {
      setNotice({ type: "error", text: "A secret answer code is required so students can complete the case." });
      if (isWizardMode) setWizardStep(3);
      return;
    }

    const payload = {
      ...formData,
      id: editingCaseId || `case-${Date.now()}`
    };

    const res = await saveForensicCase(payload);
    if (res.success) {
      setCases(res.cases);
      setIsModalOpen(false);
      setNotice({
        type: "success",
        text: editingCaseId
          ? `Updated case '${payload.title}' successfully.`
          : `Published new case '${payload.title}'! Students can now access it in their terminal.`
      });
      setTimeout(() => setNotice(null), 4000);
    }
  };

  // Delete Case
  const handleDeleteCase = async (id) => {
    const res = await deleteForensicCase(id);
    if (res.success) {
      setCases(res.cases);
      setDeleteConfirmId(null);
      setNotice({ type: "success", text: "Case mission deleted successfully." });
      setTimeout(() => setNotice(null), 3000);
    }
  };

  // Reset Defaults
  const handleResetDefaults = async () => {
    if (confirm("Reset all case missions to the original 6 SANS / Philippine Law cases? Any custom cases will be removed.")) {
      const res = await resetForensicCasesToDefault();
      setCases(res);
      setNotice({ type: "success", text: "Case missions reset to default curriculum set." });
      setTimeout(() => setNotice(null), 3000);
    }
  };

  // Add Task
  const handleAddTask = (textToAdd) => {
    const label = (textToAdd || newTaskInput).trim();
    if (!label) return;
    setFormData((prev) => ({
      ...prev,
      tasks: [...prev.tasks, { id: `t${prev.tasks.length + 1}`, label, completed: false }]
    }));
    if (!textToAdd) setNewTaskInput("");
  };

  // Remove Task
  const handleRemoveTask = (idx) => {
    setFormData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((_, i) => i !== idx)
    }));
  };

  const toggleFlagReveal = (id) => {
    setRevealedFlags((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-xl bg-[#002D62] text-[#C5A059] flex items-center justify-center font-bold shadow-sm shrink-0">
            <Terminal className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-serif text-[#002D62]">
                Forensic Case Missions & CTF Builder
              </h1>
              <Badge className="bg-[#002D62] text-[#C5A059] font-mono text-[10px] border-none">
                {cases.length} Dockets Active
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Create and manage criminal investigation cases, student checklists, and grading challenges for CDI 409.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetDefaults}
            className="text-slate-600 hover:text-slate-900 border-slate-200 text-xs gap-1.5 h-9"
            title="Reset cases to default set"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
            <span>Restore Defaults</span>
          </Button>

          <Button
            size="sm"
            onClick={handleOpenCreateModal}
            className="bg-[#002D62] hover:bg-[#001F44] text-[#C5A059] font-bold text-xs gap-1.5 h-9 shadow-sm px-4"
          >
            <Plus className="h-4 w-4" />
            <span>New Case Mission</span>
          </Button>
        </div>
      </div>

      {/* Notice Banner */}
      {notice && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2 border animate-in fade-in ${
            notice.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {notice.type === "success" ? <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> : <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />}
          <span className="font-medium">{notice.text}</span>
        </div>
      )}

      {/* 2. Key Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <Card className="bg-white border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Case Dockets</span>
            <div className="p-2 rounded-lg bg-blue-50 text-[#002D62]">
              <FileCode2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-[#002D62] mt-1">
            {metrics.totalCases} <span className="text-xs text-slate-400 font-normal">Dockets</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2 font-mono">
            <span className="text-blue-700 font-bold flex items-center gap-1">
              <Shield className="h-3 w-3" /> {metrics.prebuiltCount} Pre-built
            </span>
            <span>•</span>
            <span className="text-amber-700 font-bold flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> {metrics.customCount} Custom
            </span>
          </div>
        </Card>

        <Card className="bg-white border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Total XP Rewards Pool</span>
            <div className="p-2 rounded-lg bg-amber-50 text-[#C5A059]">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-[#002D62] mt-1">
            {metrics.totalXP} <span className="text-xs text-slate-400 font-normal">XP</span>
          </div>
          <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-medium">
            <span>CHED Practicum Lab Weight</span>
          </div>
        </Card>

        <Card className="bg-white border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Philippine Statutory Coverage</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
              <Scale className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-[#002D62] mt-1">
            {metrics.statutesCount} <span className="text-xs text-slate-400 font-normal">Laws Cited</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            RA 10175, RA 12010, PD 705, RA 9147
          </div>
        </Card>
      </div>

      {/* 3. Filter Bar & Search */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs flex flex-col lg:flex-row items-center justify-between gap-3">
        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search cases by name, statute, or facts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#002D62]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-between lg:justify-end">
          {/* Origin Filter (Pre-built vs Custom) */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {[
              { id: "All", label: `All (${metrics.totalCases})` },
              { id: "Prebuilt", label: `Pre-built (${metrics.prebuiltCount})`, icon: Shield },
              { id: "Custom", label: `Custom (${metrics.customCount})`, icon: Sparkles }
            ].map((opt) => {
              const Icon = opt.icon;
              const isSel = originFilter === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setOriginFilter(opt.id)}
                  className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
                    isSel
                      ? "bg-[#002D62] text-white shadow-2xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {Icon && <Icon className="h-3 w-3" />}
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-1">
            {["All", "Beginner", "Intermediate", "Advanced"].map((level) => (
              <button
                key={level}
                onClick={() => setDifficultyFilter(level)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  difficultyFilter === level
                    ? "bg-[#002D62] text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Case Missions Cards Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400 font-mono">
          Loading case dockets from database...
        </div>
      ) : filteredCases.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
          <Terminal className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <div className="text-sm font-bold text-slate-700">No Case Missions Found</div>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria or create a new mission.</p>
          <Button
            size="sm"
            onClick={handleOpenCreateModal}
            className="mt-3 bg-[#002D62] text-[#C5A059] font-bold text-xs"
          >
            Create New Mission
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCases.map((c) => {
            const isRevealed = !!revealedFlags[c.id];
            const isPrebuilt = isPrebuiltCase(c);

            return (
              <Card
                key={c.id}
                className="bg-white border-slate-200 rounded-xl overflow-hidden shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div className="p-5 space-y-3.5">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-white bg-[#002D62] px-2.5 py-0.5 rounded-md">
                        {c.caseCode}
                      </span>
                      {isPrebuilt ? (
                        <Badge className="bg-blue-50 text-[#002D62] border border-blue-200/80 text-[10px] font-mono font-bold flex items-center gap-1 shadow-2xs">
                          <Shield className="h-3 w-3 text-[#002D62]" /> Pre-built
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-50 text-amber-900 border border-amber-200/80 text-[10px] font-mono font-bold flex items-center gap-1 shadow-2xs">
                          <Sparkles className="h-3 w-3 text-[#C5A059]" /> Faculty Custom
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className={`text-[10px] uppercase font-bold tracking-wider ${
                          c.difficulty === "Advanced"
                            ? "border-red-300 text-red-700 bg-red-50/50"
                            : c.difficulty === "Intermediate"
                            ? "border-amber-300 text-amber-700 bg-amber-50/50"
                            : "border-emerald-300 text-emerald-700 bg-emerald-50/50"
                        }`}
                      >
                        {c.difficulty}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-[#C5A059]">
                        +{c.xpReward} XP
                      </span>
                      {c.badgeName && (
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                          {c.badgeName}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Unit */}
                  <div>
                    <h3 className="text-base font-bold font-serif text-[#002D62] leading-tight">
                      {c.title}
                    </h3>
                    <div className="text-[11px] text-slate-500 font-sans mt-0.5">
                      {c.unit}
                    </div>
                  </div>

                  {/* Statute Citation Pill */}
                  {c.statute && (
                    <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] text-slate-700">
                      <Scale className="h-3.5 w-3.5 text-[#002D62] shrink-0" />
                      <span className="font-medium truncate">
                        <strong className="text-[#002D62]">Law:</strong> {c.statute}
                      </span>
                    </div>
                  )}

                  {/* Scenario Narrative */}
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {c.scenario}
                  </p>

                  {/* Objectives Preview */}
                  {Array.isArray(c.tasks) && c.tasks.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                        Student Tasks ({c.tasks.length}):
                      </span>
                      <div className="space-y-1">
                        {c.tasks.slice(0, 3).map((t, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-1.5 text-[11px] text-slate-700 bg-slate-50/60 p-1 rounded border border-slate-100"
                          >
                            <span className="h-3 w-3 rounded font-mono font-bold text-[8.5px] flex items-center justify-center bg-slate-200 text-[#002D62] shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="truncate">{t.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CTF Flag Proof */}
                  <div className="p-2.5 rounded-lg bg-slate-900 text-white font-mono text-xs flex items-center justify-between gap-2 border border-slate-800">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <KeyRound className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      <span className="text-slate-400 text-[10px]">SECRET ANSWER:</span>
                      <code className="text-cyan-300 font-bold text-[11px] truncate">
                        {isRevealed ? c.flagSolution : "••••••••••••••••••••"}
                      </code>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleFlagReveal(c.id)}
                      className="text-slate-400 hover:text-white p-1 transition-colors"
                      title={isRevealed ? "Hide secret answer" : "Reveal secret answer"}
                    >
                      {isRevealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono text-slate-400">
                    ID: {c.caseCode}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenEditModal(c)}
                      className="h-7 text-xs px-2.5 gap-1 text-slate-700 hover:text-[#002D62] border-slate-200"
                    >
                      <Pencil className="h-3 w-3" />
                      <span>Edit</span>
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteConfirmId(c.id)}
                      className="h-7 text-xs px-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-slate-200"
                      title="Delete this mission"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          POP-UP MODAL: NON-TECH FRIENDLY GUIDED WIZARD + OPTIONAL EXPERT MODE
         ========================================================================= */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          showCloseButton={false}
          className="w-[96vw] sm:max-w-4xl lg:max-w-5xl max-h-[92vh] flex flex-col p-0 overflow-hidden bg-white rounded-3xl border border-slate-200 shadow-2xl"
        >
          {/* Header Banner */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-[#002D62] via-[#001F44] to-[#081b33] text-white shrink-0 border-b border-white/10 relative">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              title="Close window"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-8">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/10 border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059] shadow-sm shrink-0">
                  <Terminal className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold font-serif text-white tracking-wide">
                    {editingCaseId ? `Edit Case: ${formData.title || formData.caseCode}` : "Create Forensic Case Mission"}
                  </h2>
                  <p className="text-xs text-slate-300">
                    {isWizardMode
                      ? "Simple step-by-step assistant for criminology instructors."
                      : "Technical DFIR mode: raw bash commands and CTF flags."}
                  </p>
                </div>
              </div>

              {/* Mode Toggle Switch */}
              <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/10 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setIsWizardMode(true)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    isWizardMode
                      ? "bg-[#C5A059] text-[#001F44] font-bold shadow-xs"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Simple Mode</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsWizardMode(false)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    !isWizardMode
                      ? "bg-white/20 text-white font-bold shadow-xs"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  <Sliders className="h-3.5 w-3.5" />
                  <span>Expert Mode</span>
                </button>
              </div>
            </div>
          </div>

          {/* =====================================================================
              A. SIMPLE / NON-TECH WIZARD FLOW
             ===================================================================== */}
          {isWizardMode ? (
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/40">
              {/* Stepper Progress Bar */}
              <div className="bg-white px-6 py-3 border-b border-slate-200 shrink-0">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                  {[
                    { num: 1, label: "Choose Crime Topic" },
                    { num: 2, label: "Case Story & Law" },
                    { num: 3, label: "Student Checklist" },
                    { num: 4, label: "Review & Publish" }
                  ].map((st, i) => {
                    const isDone = wizardStep > st.num;
                    const isCurrent = wizardStep === st.num;
                    return (
                      <React.Fragment key={st.num}>
                        <button
                          type="button"
                          onClick={() => setWizardStep(st.num)}
                          className="flex items-center gap-2 group text-left cursor-pointer"
                        >
                          <div
                            className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                              isDone
                                ? "bg-emerald-600 text-white"
                                : isCurrent
                                ? "bg-[#002D62] text-white ring-4 ring-[#002D62]/10"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {isDone ? <Check className="h-3.5 w-3.5" /> : st.num}
                          </div>
                          <span
                            className={`text-xs font-medium hidden sm:inline ${
                              isCurrent ? "text-[#002D62] font-bold" : "text-slate-500"
                            }`}
                          >
                            {st.label}
                          </span>
                        </button>
                        {i < 3 && (
                          <div
                            className={`flex-1 h-0.5 mx-2 rounded ${
                              wizardStep > st.num ? "bg-emerald-500" : "bg-slate-200"
                            }`}
                          />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Wizard Content Body */}
              <div className="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto w-full space-y-5">
                {/* STEP 1: PICK A CRIME TOPIC */}
                {wizardStep === 1 && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div>
                      <h3 className="text-base font-bold font-serif text-[#002D62]">
                        Step 1: What kind of crime do you want students to investigate?
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Select a pre-configured crime topic below. The system will automatically set up the technical evidence and answer codes for you!
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                      {CRIME_TOPIC_CARDS.map((card) => {
                        const Icon = card.icon;
                        const isSelected = selectedTopicId === card.id;

                        return (
                          <div
                            key={card.id}
                            onClick={() => applyTopicToForm(card)}
                            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? "border-[#002D62] bg-blue-50/60 shadow-md ring-2 ring-[#002D62]/20"
                                : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs"
                            }`}
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div
                                  className={`h-9 w-9 rounded-xl flex items-center justify-center text-white ${
                                    isSelected ? "bg-[#002D62]" : "bg-slate-800"
                                  }`}
                                >
                                  <Icon className="h-5 w-5" />
                                </div>
                                {isSelected ? (
                                  <span className="h-5 w-5 rounded-full bg-[#002D62] text-white flex items-center justify-center">
                                    <Check className="h-3 w-3" />
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                                    {card.difficulty}
                                  </span>
                                )}
                              </div>

                              <div>
                                <h4 className="text-sm font-bold font-serif text-slate-900">
                                  {card.title}
                                </h4>
                                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                  {card.tagline}
                                </p>
                              </div>
                            </div>

                            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                              <span className="font-medium text-[#002D62] truncate">
                                ⚖️ {card.law}
                              </span>
                              <span className="font-mono font-bold text-[#C5A059] shrink-0">
                                +{card.xpReward} XP
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 2: CASE STORY & LAW */}
                {wizardStep === 2 && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div>
                      <h3 className="text-base font-bold font-serif text-[#002D62]">
                        Step 2: Tell the story and pick the Philippine law
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Customize the case title, what happened to the victim, and which legal statute applies.
                      </p>
                    </div>

                    {/* Case Title */}
                    <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1">
                      <label className="text-xs font-bold text-slate-800 uppercase block font-mono">
                        Case Title / Mission Name *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g., Operation SILENT EXFIL (USB Data Exfiltration)"
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#002D62] bg-slate-50/50 font-medium"
                      />
                      <span className="text-[11px] text-slate-400">
                        This is the title students will see when they select this case.
                      </span>
                    </div>

                    {/* Case Story Narrative */}
                    <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 uppercase block font-mono">
                        The Story (What Happened?) *
                      </label>
                      <textarea
                        rows={4}
                        value={formData.scenario}
                        onChange={(e) => setFormData({ ...formData, scenario: e.target.value })}
                        placeholder="Explain the crime in plain words. For example: A former employee inserted an unauthorized flash drive at midnight to copy confidential records. The suspect denies it..."
                        className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#002D62] bg-slate-50/50 leading-relaxed font-sans"
                      />
                      <span className="text-[11px] text-slate-400">
                        Provide the facts of the case so students know what they are investigating.
                      </span>
                    </div>

                    {/* Philippine Law Violated */}
                    <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 uppercase block font-mono flex items-center gap-1.5">
                        <Scale className="h-4 w-4 text-[#002D62]" />
                        Which Philippine Law was violated? *
                      </label>
                      <select
                        value={formData.statute}
                        onChange={(e) => setFormData({ ...formData, statute: e.target.value })}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#002D62] bg-white font-medium"
                      >
                        {PHILIPPINE_LAWS.map((law, idx) => (
                          <option key={idx} value={law.value}>
                            {law.label}
                          </option>
                        ))}
                      </select>
                      <span className="text-[11px] text-slate-400">
                        This will be displayed as the legal ground for evidence admissibility.
                      </span>
                    </div>

                    {/* Student Year Level & Points */}
                    <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                      <label className="text-xs font-bold text-slate-800 uppercase block font-mono">
                        Target Student Level & Difficulty
                      </label>

                      <div className="grid grid-cols-3 gap-2.5">
                        {[
                          { level: "Beginner", xp: 150, title: "Easy", desc: "1st & 2nd Year" },
                          { level: "Intermediate", xp: 250, title: "Medium", desc: "3rd Year Core" },
                          { level: "Advanced", xp: 350, title: "Challenging", desc: "Senior CTF" }
                        ].map((lvl) => {
                          const isSel = formData.difficulty === lvl.level;
                          return (
                            <button
                              key={lvl.level}
                              type="button"
                              onClick={() => setFormData({ ...formData, difficulty: lvl.level, xpReward: lvl.xp })}
                              className={`p-3 rounded-xl border-2 text-left transition-all ${
                                isSel
                                  ? "border-[#002D62] bg-blue-50/50 shadow-xs"
                                  : "border-slate-200 bg-slate-50 hover:bg-white"
                              }`}
                            >
                              <div className="font-bold text-xs text-[#002D62]">{lvl.title}</div>
                              <div className="text-[11px] text-slate-500 mt-0.5">{lvl.desc}</div>
                              <div className="text-[10px] font-mono font-bold text-[#C5A059] mt-1">
                                +{lvl.xp} XP
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: STUDENT TASKS & SECRET ANSWER */}
                {wizardStep === 3 && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div>
                      <h3 className="text-base font-bold font-serif text-[#002D62]">
                        Step 3: What should students do to solve this case?
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Review the student task checklist and confirm the secret answer code.
                      </p>
                    </div>

                    {/* Tasks Checklist */}
                    <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
                      <label className="text-xs font-bold text-slate-800 uppercase block font-mono flex items-center justify-between">
                        <span>Student Investigation Checklist ({formData.tasks.length} Tasks)</span>
                        <span className="text-[11px] text-slate-400 font-normal">Checklist shown in terminal</span>
                      </label>

                      <div className="space-y-2">
                        {formData.tasks.map((task, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                          >
                            <span className="h-5 w-5 rounded-md bg-[#002D62] text-white text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span className="flex-1 text-slate-800 font-medium">{task.label}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTask(idx)}
                              className="text-slate-400 hover:text-red-600 p-1"
                              title="Delete task"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add new task input */}
                      <div className="flex gap-2 pt-1">
                        <input
                          type="text"
                          placeholder="Type an extra task (e.g., Verify suspect's login time)..."
                          value={newTaskInput}
                          onChange={(e) => setNewTaskInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTask())}
                          className="flex-1 text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#002D62]"
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleAddTask()}
                          className="bg-[#002D62] text-[#C5A059] font-bold text-xs"
                        >
                          + Add Task
                        </Button>
                      </div>
                    </div>

                    {/* Secret Answer Key */}
                    <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-white space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <KeyRound className="h-4 w-4 text-amber-400" />
                          <span className="text-xs font-bold font-mono text-amber-400 uppercase">
                            Secret Answer Key (Student Solution Proof)
                          </span>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={handleGenerateAnswerKey}
                          className="text-[11px] h-7 bg-white/10 hover:bg-white/20 text-white border-white/20"
                        >
                          🎲 Generate New Key
                        </Button>
                      </div>

                      <p className="text-[11px] text-slate-300">
                        When students analyze the evidence and find this secret code, they submit it to earn their +{formData.xpReward} XP.
                      </p>

                      <input
                        type="text"
                        value={formData.flagSolution}
                        onChange={(e) => setFormData({ ...formData, flagSolution: e.target.value })}
                        placeholder="e.g., FLAG{CASE_EVIDENCE_KEY_123}"
                        className="w-full text-xs font-mono font-bold p-2.5 rounded-lg bg-black/60 border border-cyan-500/50 text-cyan-300 focus:outline-none"
                      />

                      <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                        <Check className="h-3.5 w-3.5" />
                        <span>Ready! Students can enter this answer to complete the challenge.</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: REVIEW & PUBLISH */}
                {wizardStep === 4 && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div>
                      <h3 className="text-base font-bold font-serif text-[#002D62]">
                        Step 4: Everything is ready! Review your case
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Verify the summary below. Once published, your students will see it in their Forensic Terminal.
                      </p>
                    </div>

                    {/* Summary Card */}
                    <div className="p-5 bg-white rounded-2xl border-2 border-slate-200 shadow-sm space-y-3.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-white bg-[#002D62] px-2.5 py-0.5 rounded">
                          {formData.caseCode || "CDI409-CUSTOM"}
                        </span>
                        <Badge className="bg-emerald-100 text-emerald-800 font-bold border-none text-[10px]">
                          {formData.difficulty} • +{formData.xpReward} XP
                        </Badge>
                      </div>

                      <div>
                        <h4 className="text-base font-bold font-serif text-[#002D62]">
                          {formData.title}
                        </h4>
                        <div className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
                          <Scale className="h-3.5 w-3.5 text-[#002D62] shrink-0" />
                          <span>
                            <strong>Law:</strong> {formData.statute}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                        {formData.scenario}
                      </p>

                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                          {formData.tasks.length} Student Tasks Prepared:
                        </span>
                        <div className="space-y-1">
                          {formData.tasks.map((t, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                              <span className="h-4 w-4 rounded-full bg-slate-200 text-[#002D62] font-mono text-[9px] font-bold flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <span>{t.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-900 text-white font-mono text-xs flex items-center justify-between">
                        <span className="text-slate-400 text-[10px]">SECRET ANSWER:</span>
                        <span className="text-cyan-300 font-bold">{formData.flagSolution}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Wizard Footer Navigation */}
              <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (wizardStep > 1) setWizardStep(wizardStep - 1);
                    else setIsModalOpen(false);
                  }}
                  className="text-xs gap-1 border-slate-300"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>{wizardStep === 1 ? "Cancel" : "Back"}</span>
                </Button>

                <div className="flex items-center gap-2">
                  {wizardStep < 4 ? (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setWizardStep(wizardStep + 1)}
                      className="bg-[#002D62] hover:bg-[#001F44] text-[#C5A059] font-bold text-xs gap-1.5 px-4 shadow-sm"
                    >
                      <span>Continue</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleSaveCase}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 px-5 shadow-sm"
                    >
                      <Check className="h-4 w-4" />
                      <span>{editingCaseId ? "Save Case Changes" : "🚀 Publish Case to Students Now"}</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* =====================================================================
                B. TECHNICAL / EXPERT MODE (For instructors who want raw bash & regex)
               ===================================================================== */
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/40">
              {/* Tab Bar */}
              <div className="bg-slate-50 px-5 border-b border-slate-200 flex items-center gap-1 overflow-x-auto py-1.5 shrink-0">
                {[
                  { id: "docket", label: "1. Docket & Legal Ground", icon: Scale },
                  { id: "scenario", label: "2. Facts & Objectives", icon: ClipboardList },
                  { id: "terminal", label: "3. Terminal Commands", icon: Terminal },
                  { id: "flag", label: "4. CTF Flag Proof", icon: KeyRound },
                  { id: "preview", label: "5. Live Student Preview", icon: Eye }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeModalTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveModalTab(tab.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? "bg-[#002D62] text-white font-bold shadow-xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Expert Content */}
              <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full space-y-4">
                {activeModalTab === "docket" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-mono font-bold text-slate-700 uppercase block mb-1">
                          Case Docket Code *
                        </label>
                        <input
                          type="text"
                          value={formData.caseCode}
                          onChange={(e) => setFormData({ ...formData, caseCode: e.target.value })}
                          className="w-full text-xs font-mono p-2 rounded border border-slate-300 font-bold text-[#002D62]"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-mono font-bold text-slate-700 uppercase block mb-1">
                          Case Title *
                        </label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="w-full text-xs p-2 rounded border border-slate-300 font-serif font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-mono font-bold text-slate-700 uppercase block mb-1">
                          Curriculum Unit
                        </label>
                        <input
                          type="text"
                          value={formData.unit}
                          onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                          className="w-full text-xs p-2 rounded border border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-mono font-bold text-slate-700 uppercase block mb-1">
                          Philippine Statute
                        </label>
                        <input
                          type="text"
                          value={formData.statute}
                          onChange={(e) => setFormData({ ...formData, statute: e.target.value })}
                          className="w-full text-xs p-2 rounded border border-slate-300"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-mono font-bold text-slate-700 uppercase block mb-1">
                          Difficulty
                        </label>
                        <select
                          value={formData.difficulty}
                          onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                          className="w-full text-xs p-2 rounded border border-slate-300 bg-white"
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-mono font-bold text-slate-700 uppercase block mb-1">
                          XP Reward
                        </label>
                        <input
                          type="number"
                          value={formData.xpReward}
                          onChange={(e) => setFormData({ ...formData, xpReward: Number(e.target.value) })}
                          className="w-full text-xs p-2 rounded border border-slate-300 font-mono font-bold text-[#C5A059]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-mono font-bold text-slate-700 uppercase block mb-1">
                          Badge Name
                        </label>
                        <input
                          type="text"
                          value={formData.badgeName}
                          onChange={(e) => setFormData({ ...formData, badgeName: e.target.value })}
                          className="w-full text-xs p-2 rounded border border-slate-300"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeModalTab === "scenario" && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-[11px] font-mono font-bold text-slate-700 uppercase block mb-1">
                        Factual Scenario & Investigation Brief
                      </label>
                      <textarea
                        rows={4}
                        value={formData.scenario}
                        onChange={(e) => setFormData({ ...formData, scenario: e.target.value })}
                        className="w-full text-xs p-2.5 rounded border border-slate-300 font-sans leading-relaxed"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-mono font-bold text-slate-700 uppercase block">
                        Objectives Checklist
                      </label>
                      {formData.tasks.map((t, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-1.5 bg-white rounded border text-xs">
                          <span className="h-4 w-4 bg-[#002D62] text-white text-[9px] font-mono rounded flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="flex-1">{t.label}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTask(idx)}
                            className="text-slate-400 hover:text-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Add new objective..."
                          value={newTaskInput}
                          onChange={(e) => setNewTaskInput(e.target.value)}
                          className="flex-1 text-xs p-2 rounded border border-slate-300"
                        />
                        <Button type="button" size="sm" onClick={() => handleAddTask()} className="text-xs">
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {activeModalTab === "terminal" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-mono font-bold text-slate-700 uppercase block">
                        Suggested Linux Commands
                      </label>
                      <div className="flex flex-wrap gap-1.5 p-2 bg-slate-900 rounded-lg">
                        {formData.hintCommands.map((cmd, idx) => (
                          <div
                            key={idx}
                            className="text-[11px] font-mono px-2 py-0.5 bg-black/60 text-emerald-400 rounded border border-emerald-500/30 flex items-center gap-1.5"
                          >
                            <span>$ {cmd}</span>
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  hintCommands: prev.hintCommands.filter((_, i) => i !== idx)
                                }))
                              }
                              className="text-slate-400 hover:text-red-400"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g., volatility -f memdump.raw windows.pslist"
                          value={newHintInput}
                          onChange={(e) => setNewHintInput(e.target.value)}
                          className="flex-1 text-xs font-mono p-2 rounded border border-slate-300"
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            if (newHintInput.trim()) {
                              setFormData((prev) => ({
                                ...prev,
                                hintCommands: [...prev.hintCommands, newHintInput.trim()]
                              }));
                              setNewHintInput("");
                            }
                          }}
                          className="text-xs"
                        >
                          Add Cmd
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-mono font-bold text-slate-700 uppercase block">
                        Simulated Evidence Findings Output
                      </label>
                      <textarea
                        rows={4}
                        value={formData.simulatedOutput}
                        onChange={(e) => setFormData({ ...formData, simulatedOutput: e.target.value })}
                        className="w-full text-xs font-mono p-2.5 rounded bg-slate-900 text-emerald-300 border border-slate-800"
                      />
                    </div>
                  </div>
                )}

                {activeModalTab === "flag" && (
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-900 rounded-xl text-white space-y-3">
                      <div>
                        <label className="text-[11px] font-mono font-bold text-amber-400 uppercase block mb-1">
                          Secret CTF Flag Proof (Exact Match)
                        </label>
                        <input
                          type="text"
                          value={formData.flagSolution}
                          onChange={(e) => setFormData({ ...formData, flagSolution: e.target.value })}
                          className="w-full text-xs font-mono p-2.5 rounded bg-black/60 border border-cyan-500 text-cyan-300"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-mono font-bold text-slate-300 uppercase block mb-1">
                          Flag Format Hint
                        </label>
                        <input
                          type="text"
                          value={formData.flagHint}
                          onChange={(e) => setFormData({ ...formData, flagHint: e.target.value })}
                          className="w-full text-xs font-mono p-2 rounded bg-black/60 border border-slate-700 text-slate-300"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeModalTab === "preview" && (
                  <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
                    <h4 className="text-sm font-bold font-serif text-[#002D62]">
                      Student Terminal Card Preview
                    </h4>
                    <div className="p-3 bg-slate-50 rounded-lg border text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-[#002D62]">{formData.caseCode}</span>
                        <span className="text-[#C5A059] font-bold">+{formData.xpReward} XP</span>
                      </div>
                      <div className="font-bold text-slate-900">{formData.title}</div>
                      <div className="text-slate-600">{formData.scenario}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Expert Footer */}
              <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveCase}
                  className="bg-[#002D62] hover:bg-[#001F44] text-[#C5A059] font-bold text-xs px-4"
                >
                  <Check className="h-4 w-4 mr-1" />
                  <span>Save Case Docket</span>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* =========================================================================
          CONFIRM DELETE DIALOG
         ========================================================================= */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="max-w-md p-5 bg-white rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold font-serif text-red-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              <span>Delete Case Mission Docket</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600">
              Are you sure you want to delete this case mission? Students will no longer see this challenge in their terminal.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-2">
            <Button size="sm" variant="outline" onClick={() => setDeleteConfirmId(null)} className="text-xs">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => handleDeleteCase(deleteConfirmId)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
            >
              Delete Case
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
