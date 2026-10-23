"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Terminal as TerminalIcon,
  Shield,
  CheckCircle2,
  AlertCircle,
  Copy,
  RotateCcw,
  Maximize2,
  Minimize2,
  BookOpen,
  Award,
  Flame,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  Clock,
  Sparkles,
  Folder,
  FileText,
  Play,
  RefreshCw,
  Scale,
  Check,
  Laptop,
  Cpu,
  Layers,
  Search,
  GraduationCap,
  Lightbulb,
  ArrowRight,
  Minus,
  Square,
  X,
  UserCheck,
  FolderTree,
  FolderPlus,
  FileSearch,
  Hash,
  Database,
  HardDrive,
  Target,
  ShieldCheck,
  Columns,
  Rows
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  INITIAL_VFS,
  resolvePath,
  formatPromptPath,
  executePlaygroundCommand
} from "@/lib/virtualForensicFs";

import {
  DEFAULT_FORENSIC_CASES,
  fetchForensicCases,
  subscribeToForensicCases,
  isPrebuiltCase
} from "@/lib/forensicCasesService";

// Exported for backward-compatibility with other modules
export const FORENSIC_CASES = DEFAULT_FORENSIC_CASES;

// Helper to render professional icon for cadet levels
export const getCadetLevelIcon = (levelId, className = "h-3.5 w-3.5") => {
  switch (Number(levelId)) {
    case 1:
      return <UserCheck className={className} />;
    case 2:
      return <Search className={className} />;
    case 3:
      return <FolderTree className={className} />;
    case 4:
      return <FileText className={className} />;
    case 5:
      return <FolderPlus className={className} />;
    case 6:
      return <FileSearch className={className} />;
    case 7:
      return <Hash className={className} />;
    case 8:
      return <GraduationCap className={className} />;
    default:
      return <TerminalIcon className={className} />;
  }
};

// Helper to render professional icon for evidence files
export const getEvidenceFileIcon = (fileName, className = "h-3.5 w-3.5") => {
  if (fileName.endsWith(".txt")) return <FileText className={`${className} text-rose-500`} />;
  if (fileName.endsWith(".dd")) return <HardDrive className={`${className} text-blue-500`} />;
  if (fileName.endsWith(".raw")) return <Cpu className={`${className} text-purple-500`} />;
  if (fileName.endsWith(".pcap")) return <Layers className={`${className} text-emerald-500`} />;
  if (fileName.endsWith(".sql")) return <Database className={`${className} text-amber-500`} />;
  return <Folder className={`${className} text-slate-500`} />;
};

// Curated 5 Core Evidence Files for Minimalist Evidence Drawer
export const CORE_EVIDENCE_FILES = [
  {
    name: "ransom_note.txt",
    path: "/evidence/ransom_note.txt",
    size: "442 B",
    tag: "Extortion Note",
    tagColor: "bg-red-50 text-red-700 border-red-200",
    desc: "AES-256 ransomware note with Monero wallet address"
  },
  {
    name: "usb_image.dd",
    path: "/evidence/usb_image.dd",
    size: "4.2 GB",
    tag: "USB Storage",
    tagColor: "bg-blue-50 text-blue-700 border-blue-200",
    desc: "Raw bit-stream image of SanDisk Ultra flash drive"
  },
  {
    name: "memdump.raw",
    path: "/evidence/memdump.raw",
    size: "8.0 GB",
    tag: "RAM Dump",
    tagColor: "bg-purple-50 text-purple-700 border-purple-200",
    desc: "Physical memory dump containing volatile C2 sockets"
  },
  {
    name: "suspect_traffic.pcap",
    path: "/evidence/suspect_traffic.pcap",
    size: "16.0 MB",
    tag: "PCAP Capture",
    tagColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    desc: "Intranet traffic sniffing log with cleartext HTTP credentials"
  },
  {
    name: "sensitive_pii_dump.sql",
    path: "/evidence/sensitive_pii_dump.sql",
    size: "24.8 MB",
    tag: "RA 10173 DB Dump",
    tagColor: "bg-amber-50 text-amber-700 border-amber-200",
    desc: "Exfiltrated database dump containing SSS, TIN, and medical records"
  }
];

// Minimal Quick Tools by Category
const QUICK_TOOL_CATEGORIES = {
  memory: {
    label: "Memory (RAM)",
    tools: [
      { label: "pslist", cmd: "volatility -f /evidence/memdump.raw windows.pslist", hint: "Processes & PIDs" },
      { label: "netscan", cmd: "volatility -f /evidence/memdump.raw windows.netscan", hint: "Active C2 sockets" },
      { label: "malfind", cmd: "volatility -f /evidence/memdump.raw windows.malfind", hint: "Injected shellcode" },
      { label: "strings", cmd: "strings /evidence/memdump.raw | grep -i BitLocker", hint: "Carve recovery key" }
    ]
  },
  network: {
    label: "Network (PCAP)",
    tools: [
      { label: "pcap-info", cmd: "pcap-info /evidence/suspect_traffic.pcap", hint: "Capture overview" },
      { label: "HTTP POST", cmd: "tshark -r /evidence/suspect_traffic.pcap -Y \"http.request.method == POST\"", hint: "Carve passwords" },
      { label: "nmap", cmd: "nmap -sV 192.168.10.144", hint: "Scan adversary port" }
    ]
  },
  registry: {
    label: "Registry & USB",
    tools: [
      { label: "USBSTOR", cmd: "reg-query HKLM\\SYSTEM\\CurrentControlSet\\Enum\\USBSTOR", hint: "USB hardware serial" },
      { label: "Prefetch", cmd: "prefetch-dump C:\\Windows\\Prefetch\\WINRAR.EXE-A92B3C11.pf", hint: "Execution run count" },
      { label: "MFT Timestomp", cmd: "mft-compare dossier_archive.rar", hint: "Spot time divergence" }
    ]
  },
  laws: {
    label: "Statutory Law",
    tools: [
      { label: "RA 10175", cmd: "statute ra10175", hint: "Cybercrime Act Sec. 4 offenses" },
      { label: "RA 10173", cmd: "statute ra10173", hint: "Data Privacy Act & NPC mandates" },
      { label: "Warrants", cmd: "warrant-check WSCD", hint: "A.M. No. 17-11-03-SC cyber warrants" },
      { label: "NPC 72h Check", cmd: "npc-check /evidence/sensitive_pii_dump.sql", hint: "72-hr mandatory breach check" }
    ]
  }
};

// 1-Click Horizontal Quick Pills
const TOP_QUICK_PILLS = [
  { label: "ls /evidence", cmd: "ls -la /evidence" },
  { label: "cat ransom_note", cmd: "cat /evidence/ransom_note.txt" },
  { label: "sha256sum usb", cmd: "sha256sum /evidence/usb_image.dd" },
  { label: "volatility pslist", cmd: "volatility -f /evidence/memdump.raw windows.pslist" },
  { label: "tshark POST", cmd: "tshark -r /evidence/suspect_traffic.pcap -Y \"http.request.method == POST\"" },
  { label: "reg-query USB", cmd: "reg-query HKLM\\SYSTEM\\CurrentControlSet\\Enum\\USBSTOR" },
  { label: "statute ra10173", cmd: "statute ra10173" },
  { label: "statute ra10175", cmd: "statute ra10175" },
  { label: "neofetch", cmd: "neofetch" },
  { label: "clear", cmd: "clear" }
];

// 8 Progressive Levels for Gamified Linux Student Academy
export const LINUX_STUDENT_LEVELS = [
  {
    id: 1,
    levelNumber: 1,
    title: "Who Am I & Where Am I?",
    badgeName: "Identity Verified",
    badgeIcon: "🛡️",
    xpReward: 40,
    command: "whoami",
    acceptableCommands: ["whoami", "pwd", "id"],
    primaryCommand: "whoami",
    secondaryCommand: "pwd",
    concept: "System Identity & Location in Digital Forensics",
    description:
      "Welcome to the SIFT Forensic Linux terminal! In any criminal cyber investigation, examiners must first verify which user account is active and where in the filesystem they are working before touching evidence.",
    whyCriminology:
      "Under ISO/IEC 27037 and court admissibility standards, contemporaneous notes must prove the examiner's identity and operational path.",
    instructions: "Run 'whoami' to verify your investigator identity, or 'pwd' (Print Working Directory) to see your current path.",
    hint: "Try typing: whoami",
    sampleOutputSummary: "investigator / /home/investigator",
    keyLearning: "Linux is multi-user. 'whoami' prints your active username. 'pwd' prints your absolute directory path."
  },
  {
    id: 2,
    levelNumber: 2,
    title: "Looking Around & Finding Hidden Artifacts",
    badgeName: "Artifact Scout",
    badgeIcon: "🔍",
    xpReward: 45,
    command: "ls -la",
    acceptableCommands: ["ls", "ls -la", "ls -l", "ls -a", "dir"],
    primaryCommand: "ls",
    secondaryCommand: "ls -la",
    concept: "Directory Listing & Hidden Files",
    description:
      "When examining a suspect's environment or an evidence directory, you need to see what files exist. Regular 'ls' shows visible files, but 'ls -la' reveals hidden dotfiles, file permissions, owners, and file sizes.",
    whyCriminology:
      "Malicious threat actors frequently hide trojans, web shells, and exfiltrated databases by prefixing file names with a dot (e.g., .backdoor.sh).",
    instructions: "Run 'ls' to see normal files, then run 'ls -la' to reveal hidden files and forensic metadata.",
    hint: "Try typing: ls -la",
    sampleOutputSummary: "Lists permissions (drwxr-xr-x), file size, date, and names.",
    keyLearning: "-l flag = Long format with details; -a flag = All files including hidden dotfiles."
  },
  {
    id: 3,
    levelNumber: 3,
    title: "Navigating to the Evidence Vault",
    badgeName: "Evidence Navigator",
    badgeIcon: "📂",
    xpReward: 45,
    command: "cd /evidence",
    acceptableCommands: ["cd /evidence", "cd /evidence/", "cd evidence"],
    primaryCommand: "cd /evidence",
    secondaryCommand: "pwd",
    concept: "Filesystem Navigation (cd)",
    description:
      "Seized hard drives, USB images, and memory dumps are stored in the '/evidence' folder. Use the 'cd' (Change Directory) command to move into the evidence directory.",
    whyCriminology:
      "Forensic operating systems mount seized physical media as read-only directories (e.g., /evidence) to safeguard evidentiary chain of custody.",
    instructions: "Type 'cd /evidence' to enter the evidence vault. Then type 'ls' to see the seized forensic items.",
    hint: "Try typing: cd /evidence",
    sampleOutputSummary: "Changed path to /evidence. Prompt updates to investigator@fsuu-student:/evidence$",
    keyLearning: "'cd <path>' changes folder. 'cd ..' goes back up one folder. 'cd ~' returns to your home folder."
  },
  {
    id: 4,
    levelNumber: 4,
    title: "Reading Evidence Safely Without Modifying Metadata",
    badgeName: "Evidence Reader",
    badgeIcon: "📜",
    xpReward: 50,
    command: "cat ransom_note.txt",
    acceptableCommands: [
      "cat ransom_note.txt",
      "cat /evidence/ransom_note.txt",
      "head ransom_note.txt",
      "head /evidence/ransom_note.txt",
      "tail ransom_note.txt"
    ],
    primaryCommand: "cat ransom_note.txt",
    secondaryCommand: "head ransom_note.txt",
    concept: "Safe File Inspection (cat, head, tail)",
    description:
      "A ransomware extortion note was recovered from a victim hospital workstation. Never open evidence files in graphical editors like Word or Notepad, as they can alter 'Last Accessed' MAC timestamps!",
    whyCriminology:
      "Using 'cat' or 'head' outputs file contents straight to the terminal stream (stdout) without writing to the disk, preserving evidence integrity.",
    instructions: "Run 'cat ransom_note.txt' (or 'cat /evidence/ransom_note.txt') to read the extortion note.",
    hint: "Try typing: cat ransom_note.txt",
    sampleOutputSummary: "Outputs the extortion note text demanding 2.5 XMR (Monero).",
    keyLearning: "'cat' prints the full file. 'head -n 10' shows the top 10 lines. 'tail -n 10' shows the bottom 10 lines."
  },
  {
    id: 5,
    levelNumber: 5,
    title: "Creating Investigative Case Dockets",
    badgeName: "Docket Creator",
    badgeIcon: "✍️",
    xpReward: 50,
    command: "mkdir notes",
    acceptableCommands: [
      "mkdir notes",
      "mkdir cases",
      "touch notes/case_log.txt",
      "touch case_log.txt",
      "touch notes.txt",
      "mkdir logs"
    ],
    primaryCommand: "mkdir notes",
    secondaryCommand: "touch notes/case_log.txt",
    concept: "Creating Folders & Files (mkdir & touch)",
    description:
      "Investigators must maintain contemporaneous activity logs during an active lab examination. Use 'mkdir' to create a new folder for your case docket and 'touch' to create an empty log file.",
    whyCriminology:
      "Under Philippine National Police Anti-Cybercrime Group (PNP-ACG) SOPs, examiners must maintain contemporaneous case notes for each examined exhibit.",
    instructions: "Run 'mkdir notes' to create a case folder, then run 'touch notes/case_log.txt' to create your evidence log file.",
    hint: "Try typing: mkdir notes",
    sampleOutputSummary: "Created folder 'notes'.",
    keyLearning: "'mkdir <dir>' creates a new directory. 'touch <file>' creates an empty file or updates its timestamp."
  },
  {
    id: 6,
    levelNumber: 6,
    title: "Filtering Keywords with Grep",
    badgeName: "Keyword Detective",
    badgeIcon: "🎯",
    xpReward: 55,
    command: "grep RANSOM ransom_note.txt",
    acceptableCommands: [
      "grep RANSOM ransom_note.txt",
      'grep "RANSOM" ransom_note.txt',
      "grep -i ransom ransom_note.txt",
      "grep Monero ransom_note.txt",
      'grep -i "monero" ransom_note.txt',
      "grep -i bitcoin ransom_note.txt",
      'grep "EVIDENCE" ransom_note.txt',
      "grep -i key ransom_note.txt",
      'grep "RANSOM" /evidence/ransom_note.txt'
    ],
    primaryCommand: 'grep "RANSOM" ransom_note.txt',
    secondaryCommand: 'grep -i "monero" ransom_note.txt',
    concept: "Pattern Matching & Search (grep)",
    description:
      "Forensic disk and log dumps can contain millions of text lines. 'grep' (Global Regular Expression Print) searches files instantly for specific terms such as IP addresses, suspect emails, or ransom keywords.",
    whyCriminology:
      "Instead of manually reading 10,000 pages of logs, investigators use 'grep' to pinpoint suspect IP addresses, credit card numbers, or cryptocurrency wallets in seconds.",
    instructions: "Run 'grep \"RANSOM\" ransom_note.txt' to isolate lines discussing the ransomware extortion.",
    hint: 'Try typing: grep "RANSOM" ransom_note.txt',
    sampleOutputSummary: "Filters and displays only lines matching 'RANSOM'.",
    keyLearning: "'grep <keyword> <file>' searches for words. Adding '-i' makes it case-insensitive."
  },
  {
    id: 7,
    levelNumber: 7,
    title: "Cryptographic Hashing & Chain of Custody",
    badgeName: "Chain of Custody Verifier",
    badgeIcon: "🔐",
    xpReward: 60,
    command: "sha256sum ransom_note.txt",
    acceptableCommands: [
      "sha256sum ransom_note.txt",
      "sha256sum /evidence/ransom_note.txt",
      "sha256sum usb_image.dd",
      "sha256sum /evidence/usb_image.dd",
      "sha256sum memdump.raw",
      "sha256sum drone_telemetry.log"
    ],
    primaryCommand: "sha256sum ransom_note.txt",
    secondaryCommand: "sha256sum usb_image.dd",
    concept: "Cryptographic Integrity (sha256sum)",
    description:
      "Under Rule 11 of the Philippine Supreme Court Rule on Electronic Evidence (A.M. 01-7-01-SC), digital evidence is admissible in court ONLY if you can mathematically prove it has not been altered or tampered with since seizure.",
    whyCriminology:
      "A SHA-256 hash generates a unique 64-character hexadecimal fingerprint. If even a single byte of a 4 GB file changes, the entire hash changes completely (Avalanche effect).",
    instructions: "Run 'sha256sum ransom_note.txt' to calculate the cryptographic hash of the exhibit.",
    hint: "Try typing: sha256sum ransom_note.txt",
    sampleOutputSummary: "Outputs: <64-character-sha256-hash> ransom_note.txt [VERIFIED COURT HASH]",
    keyLearning: "'sha256sum' generates the cryptographic fingerprint. Defense lawyers will cross-examine you on this hash in court!"
  },
  {
    id: 8,
    levelNumber: 8,
    title: "Workstation Triage & Expert Environment",
    badgeName: "Certified Linux Investigator",
    badgeIcon: "🎓",
    xpReward: 75,
    command: "neofetch",
    acceptableCommands: ["neofetch", "uname -a", "uname", "uptime", "free", "df -h", "df"],
    primaryCommand: "neofetch",
    secondaryCommand: "uname -a",
    concept: "System Profiling & Live Triage",
    description:
      "Congratulations on reaching the final level! When testifying as an expert witness in a Cybercrime Court, you must declare the exact forensic operating system, kernel version, and hardware architecture used during your examination.",
    whyCriminology:
      "Court defense attorneys will ask: 'What operating system and forensic tools were used to extract this data?' You must provide exact kernel specifications in your sworn affidavit.",
    instructions: "Run 'neofetch' (or 'uname -a') to generate the complete forensic environment profile.",
    hint: "Try typing: neofetch",
    sampleOutputSummary: "Displays SIFT Forensic Workstation specs, Linux 6.8.0-dfir kernel, and memory stats in ASCII art.",
    keyLearning: "'neofetch' shows full system architecture; 'uname -a' displays kernel details. You are now ready for Case Missions!"
  }
];

export const LINUX_CADET_LEVELS = LINUX_STUDENT_LEVELS;

// Autocomplete command dictionary for DFIR terminal
export const DFIR_AUTOCOMPLETE_COMMANDS = [
  "whoami",
  "pwd",
  "ls",
  "ls -la",
  "ls /evidence",
  "ls /tools",
  "ls /logs",
  "clear",
  "help",
  "neofetch",
  "history",
  "reset",
  "cat /evidence/ransom_note.txt",
  "cat /evidence/chain_of_custody_receipt.txt",
  "cat /evidence/evidence_hashes.sha256",
  "cat /evidence/drone_telemetry.log",
  "cat /home/investigator/notes.txt",
  "cat /home/investigator/case_checklist.md",
  "cat /home/investigator/statute_quickref.txt",
  "sha256sum /evidence/usb_image.dd",
  "sha256sum /evidence/memdump.raw",
  "sha256sum /evidence/suspect_traffic.pcap",
  "volatility -f memdump.raw windows.pslist",
  "volatility -f memdump.raw windows.netscan",
  "volatility -f memdump.raw windows.malfind",
  "volatility -f memdump.raw windows.pstree",
  "tshark -r suspect_traffic.pcap -Y http",
  "tshark -r suspect_traffic.pcap -Y dns",
  "reg-query HKLM\\SYSTEM\\CurrentControlSet\\Enum\\USBSTOR",
  "prefetch-dump C:\\Windows\\Prefetch\\WINRAR.EXE-A92B3C11.pf",
  "mft-compare dossier_archive.rar",
  "parse-sawdust --specimen specimen_batch04.dat",
  "drone-gps --log /evidence/drone_telemetry.log",
  "statute-check --search 'RA 10175'",
  "statute-check --search 'PD 705'",
  "strings memdump.raw | grep -i BitLocker-Key",
  "strings /evidence/usb_image.dd",
  "cd /evidence",
  "cd /tools",
  "cd /logs",
  "cd /home/investigator",
  "cd ..",
  "file /evidence/usb_image.dd",
  "file /evidence/memdump.raw",
  "stat /evidence/ransom_note.txt"
];

// Helper to render authentic Kali Linux prompt and output history lines
export const renderKaliHistoryLine = (line, idx) => {
  if (line.type === "prompt") {
    const p = line.path || "~";
    const u = line.user || "student";
    const h = line.host || "fsuu-forensics";
    if (line.command !== undefined) {
      return (
        <div key={idx} className="font-mono text-xs sm:text-sm leading-snug select-text">
          <div className="text-[#00e5ff] font-bold select-none">
            <span>┌──(</span>
            <span className="text-[#1793d1]">{u}㉿{h}</span>
            <span>)-[</span>
            <span className="text-white">{p}</span>
            <span>]</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#00e5ff] font-bold select-none">└─$</span>
            <span className="text-white font-medium">{line.command}</span>
          </div>
        </div>
      );
    }
    if (typeof line.text === "string" && (line.text.includes("┌──") || line.text.includes("──("))) {
      return (
        <pre key={idx} className="font-mono text-xs sm:text-sm leading-tight text-[#1793d1] whitespace-pre-wrap select-text font-bold">
          {line.text}
        </pre>
      );
    }
    return (
      <div key={idx} className="font-mono text-xs sm:text-sm leading-tight text-[#1793d1] font-bold select-text">
        {line.text}
      </div>
    );
  }

  // Check for Flag discovery in text output
  if (typeof line.text === "string" && line.text.includes("FLAG{")) {
    return (
      <div
        key={idx}
        className="my-2 p-3 rounded-xl bg-amber-950/40 border border-amber-500/50 shadow-md ring-1 ring-amber-400/30"
      >
        <div className="text-amber-400 text-xs uppercase tracking-widest font-bold flex items-center gap-1.5 mb-1">
          <Award className="w-4 h-4 text-amber-400 animate-bounce" />
          <span>Forensic Evidence Flag Discovered</span>
          <span className="ml-auto px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono border border-amber-500/30">
            SOLVED
          </span>
        </div>
        <pre className="text-amber-200 font-mono text-xs sm:text-sm font-bold whitespace-pre-wrap select-all tracking-wide">
          {line.text}
        </pre>
      </div>
    );
  }

  if (line.type === "system") {
    return (
      <pre key={idx} className="text-cyan-300 whitespace-pre-wrap font-mono text-xs sm:text-sm leading-relaxed select-text font-medium">
        {line.text}
      </pre>
    );
  }
  if (line.type === "error") {
    return (
      <div key={idx} className="my-1.5 px-3 py-1.5 rounded-lg bg-rose-950/30 border border-rose-800/50 text-rose-300 font-mono text-xs sm:text-sm select-text whitespace-pre-wrap flex items-start gap-2 shadow-xs">
        <span className="text-rose-400 font-bold shrink-0">✖</span>
        <span className="flex-1">{line.text}</span>
      </div>
    );
  }
  if (line.type === "success") {
    return (
      <div key={idx} className="my-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/30 border border-emerald-800/50 text-emerald-300 font-mono text-xs sm:text-sm select-text whitespace-pre-wrap font-medium flex items-start gap-2 shadow-xs">
        <span className="text-emerald-400 font-bold shrink-0">✔</span>
        <span className="flex-1">{line.text}</span>
      </div>
    );
  }
  if (line.type === "info") {
    return (
      <div key={idx} className="my-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/30 border border-cyan-800/50 text-cyan-300 font-mono text-xs sm:text-sm select-text whitespace-pre-wrap flex items-start gap-2 shadow-xs">
        <span className="text-cyan-400 font-bold shrink-0">ℹ</span>
        <span className="flex-1">{line.text}</span>
      </div>
    );
  }
  return (
    <pre key={idx} className="text-slate-200 whitespace-pre-wrap font-mono text-xs sm:text-sm leading-relaxed select-text">
      {line.text}
    </pre>
  );
};

// Plain-language explanations of forensic commands for non-technical students
export function explainCommand(rawCmd = "") {
  const c = rawCmd.toLowerCase();
  if (c.includes("whoami")) return "Identifies which user account is active in this terminal session (verifying investigator identity).";
  if (c.startsWith("pwd")) return "Shows your exact current working folder path on the system.";
  if (c.startsWith("cd")) return "Moves into another folder (Change Directory) to inspect evidence files.";
  if (c.startsWith("mkdir")) return "Creates a new folder for your investigation case notes and evidence docket.";
  if (c.startsWith("touch")) return "Creates an empty evidence note file or updates its modification timestamp.";
  if (c.includes("neofetch") || c.startsWith("uname")) return "Displays operating system kernel version and workstation hardware specs for court affidavits.";
  if (c.startsWith("clear")) return "Clears the screen to keep your investigation workspace neat and readable.";
  if (c.startsWith("history")) return "Shows all commands previously executed in this investigation session.";
  if (c.includes("pslist")) return "Lists every program that was running in the computer's memory — like a snapshot of Task Manager.";
  if (c.includes("netscan")) return "Shows the computer's network connections — who it was secretly talking to over the internet.";
  if (c.includes("malfind")) return "Scans memory for hidden malicious code injected by hackers.";
  if (c.includes("reg-query") || c.includes("usbstor")) return "Reads the Windows Registry — the computer's settings diary that records every USB device ever plugged in.";
  if (c.includes("prefetch")) return "Checks Windows Prefetch records, which prove a program was opened and how many times.";
  if (c.includes("mft") || c.includes("timestomp")) return "Compares file timestamps to catch a suspect who faked a file's date (timestomping).";
  if (c.startsWith("sha256sum") || c.includes("md5sum")) return "Creates a digital fingerprint (hash) of the evidence to prove it was not altered — required in court.";
  if (c.includes("pcap-info")) return "Gives a quick summary of captured network traffic — how many packets and when.";
  if (c.includes("tshark") || c.includes("wireshark")) return "Reads intercepted network traffic, like opening letters that were sent over the internet.";
  if (c.includes("exiftool") || c.includes("exif")) return "Reads hidden photo details (metadata) such as camera model, date and GPS location.";
  if (c.includes("sqlite3")) return "Searches a phone database, for example the SMS text messages stored on a seized phone.";
  if (c.includes("parse-eml") || c.includes(".eml")) return "Opens an email file and reveals its hidden headers — where the email really came from.";
  if (c.includes("statute-check")) return "Looks up which Philippine law and section applies to the evidence you found.";
  if (c.includes("drone") || c.includes("telemetry")) return "Reads a drone's flight log to find exactly where it flew (GPS coordinates).";
  if (c.includes("sawdust")) return "Reads the lab report identifying the wood species in the seized sample.";
  if (c.startsWith("strings") || c.includes("grep")) return "Searches the evidence for readable text that matches a keyword.";
  if (c.startsWith("cat") || c.startsWith("head") || c.startsWith("tail")) return "Safely reads a file's content on screen without changing its file date or timestamps.";
  if (c.startsWith("ls") || c.startsWith("dir")) return "Lists all the evidence files in this case folder.";
  if (c.startsWith("tasks")) return "Shows your list of case objectives.";
  if (c.startsWith("help") || c.startsWith("man")) return "Shows every command and tool available in this case.";
  return "Runs a forensic tool on the evidence and shows what it finds.";
}

// Pull a FLAG{...} answer code out of any terminal text
export function extractFlag(text = "") {
  if (typeof text !== "string") return null;
  const m = text.match(/FLAG\{[^}\s]+\}/);
  return m ? m[0] : null;
}

const normalizeAnswer = (s = "") => s.replace(/\s+/g, "").toUpperCase();

// Authentic Kali Linux DFIR Terminal Window (Clean, Professional, Reverted)
export function KaliTerminalWindow({
  title = "student@fsuu-forensics: ~ (SIFT Forensic Lab)",
  path = "~",
  history = [],
  inputValue = "",
  onInputChange,
  onKeyDown,
  onSubmit,
  viewportRef,
  inputRef,
  minHeight = "540px",
  height = "600px",
  onClear,
  onReset,
  onCopyLogs,
  onRunCommand,
  isFullScreen,
  setIsFullScreen,
  sessionCode = "DFIR-RJRQ-HYB2"
}) {
  const [copied, setCopied] = useState(false);

  // Autocomplete matching
  const trimmed = inputValue.trim().toLowerCase();
  let suggestionSuffix = "";
  let matchedCommand = "";
  if (trimmed.length > 0) {
    const match = DFIR_AUTOCOMPLETE_COMMANDS.find((cmd) =>
      cmd.toLowerCase().startsWith(trimmed)
    );
    if (match && match.toLowerCase() !== trimmed) {
      suggestionSuffix = match.slice(inputValue.length);
      matchedCommand = match;
    }
  }

  const handleKeyDownInternal = (e) => {
    // Clear screen on Ctrl+L / Cmd+L
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "l") {
      e.preventDefault();
      onClear && onClear();
      return;
    }

    // Autocomplete on Tab
    if (e.key === "Tab") {
      e.preventDefault();
      if (matchedCommand) {
        onInputChange && onInputChange(matchedCommand);
      }
      return;
    }

    // Autocomplete on ArrowRight if cursor at end
    if (e.key === "ArrowRight" && matchedCommand) {
      const el = inputRef?.current;
      if (el && el.selectionStart === inputValue.length && el.selectionEnd === inputValue.length) {
        e.preventDefault();
        onInputChange && onInputChange(matchedCommand);
        return;
      }
    }

    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  const handleCopyLogsClick = () => {
    if (onCopyLogs) {
      onCopyLogs();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      style={
        isFullScreen
          ? { height: "100%", minHeight: "360px" }
          : { minHeight: minHeight || "600px", height: height || "620px" }
      }
      className="rounded-xl overflow-hidden border border-slate-800 bg-[#090d14] shadow-xl flex flex-col font-mono ring-1 ring-slate-800/80 transition-all h-full"
    >
      {/* 1. Authentic Kali Terminal Window Header Bar */}
      <div className="h-8 bg-[#0e141f] border-b border-slate-800/80 px-3 flex items-center justify-between select-none shrink-0">
        {/* Left: Window Dots, Kali Icon & Title */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-1">
            <button
              type="button"
              onClick={onClear}
              title="Close / Clear (✕)"
              className="h-2.5 w-2.5 rounded-full bg-red-500 hover:brightness-110 inline-block border border-red-600/30 transition-transform active:scale-90 cursor-pointer"
            />
            <button
              type="button"
              onClick={onReset}
              title="Minimize / Reset (_)"
              className="h-2.5 w-2.5 rounded-full bg-amber-500 hover:brightness-110 inline-block border border-amber-600/30 transition-transform active:scale-90 cursor-pointer"
            />
            <button
              type="button"
              onClick={() => setIsFullScreen && setIsFullScreen(!isFullScreen)}
              title="Maximize (□)"
              className="h-2.5 w-2.5 rounded-full bg-emerald-500 hover:brightness-110 inline-block border border-emerald-600/30 transition-transform active:scale-90 cursor-pointer"
            />
          </div>
          <TerminalIcon className="w-3.5 h-3.5 text-[#00e5ff]" />
          <span className="text-xs font-mono text-slate-300 font-semibold">{title}</span>
        </div>

        {/* Right: Window Controls (_ □ ✕) & Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyLogsClick}
            title={copied ? "Copied!" : "Copy Output"}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs flex items-center gap-1 cursor-pointer"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            type="button"
            onClick={onClear}
            title="Clear Screen (Ctrl+L)"
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsFullScreen && setIsFullScreen(!isFullScreen)}
            title={isFullScreen ? "Exit Fullscreen" : "Fullscreen"}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Classic Linux Window Controls */}
          <div className="flex items-center gap-1 pl-2 ml-1 border-l border-slate-800">
            <button
              type="button"
              onClick={onReset}
              title="Reset Session"
              className="w-5 h-5 rounded text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Minus className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => setIsFullScreen && setIsFullScreen(!isFullScreen)}
              title={isFullScreen ? "Restore Window" : "Maximize"}
              className="w-5 h-5 rounded text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Square className="w-2.5 h-2.5" />
            </button>
            <button
              type="button"
              onClick={onClear}
              title="Clear Terminal"
              className="w-5 h-5 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Pure Terminal Viewport (Clean, No menu bar, No background watermark) */}
      <div
        className="relative flex-1 min-h-0 flex flex-col bg-[#080c14] overflow-hidden"
        onClick={() => inputRef.current?.focus()}
      >

        <div
          ref={viewportRef}
          className="relative z-10 flex-1 p-4 sm:p-5 space-y-2 overflow-y-auto text-xs sm:text-sm leading-relaxed selection:bg-[#1793d1]/40 selection:text-white font-mono"
        >
          {history.map(renderKaliHistoryLine)}

          {/* Active Authentic Kali Linux Prompt Line */}
          <form
            onSubmit={onSubmit}
            className="pt-1 font-mono text-xs sm:text-sm select-text"
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.focus();
            }}
          >
            {/* Kali Line 1: User, Host, Path */}
            <div className="text-[#00e5ff] font-bold select-none leading-tight flex items-center gap-0.5">
              <span>┌──(</span>
              <span className="text-[#1793d1]">student㉿fsuu-forensics</span>
              <span>)-[</span>
              <span className="text-white">{path}</span>
              <span>]</span>
            </div>

            {/* Kali Line 2: Caret & Input Line */}
            <div className="flex items-center gap-2 mt-0.5 relative text-xs sm:text-sm">
              <span className="text-[#00e5ff] font-bold select-none text-sm shrink-0">
                └─$
              </span>
              <div className="relative flex-1 flex items-center min-w-0">
                {suggestionSuffix && (
                  <div className="absolute inset-0 flex items-center pointer-events-none font-mono text-xs sm:text-sm select-none overflow-hidden pr-2">
                    <span className="opacity-0 whitespace-pre">{inputValue}</span>
                    <span className="text-slate-500 italic whitespace-pre">{suggestionSuffix}</span>
                    <span className="ml-2 text-[9px] font-mono tracking-wider text-[#00e5ff] uppercase px-1 py-0.2 rounded border border-[#1793d1]/30 bg-[#1793d1]/10 shrink-0">
                      Tab
                    </span>
                  </div>
                )}
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => onInputChange && onInputChange(e.target.value)}
                  onKeyDown={handleKeyDownInternal}
                  className="w-full bg-transparent text-white font-mono focus:outline-none text-xs sm:text-sm caret-[#00e5ff] relative z-10"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  autoFocus
                />
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* 4. Bottom Keyboard Shortcut & Session Status Bar */}
      <div className="h-7 bg-[#06090f] border-t border-slate-800/80 px-3 flex items-center justify-between text-[11px] font-mono text-slate-400 select-none shrink-0">
        <div className="flex items-center gap-3 overflow-x-auto py-0.5 scrollbar-none">
          <div className="flex items-center gap-1">
            <kbd className="px-1 py-0.2 rounded bg-slate-800 border border-slate-700 text-[9px] text-[#00e5ff]">Tab</kbd>
            <span className="text-[10px] text-slate-400">Complete</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1 py-0.2 rounded bg-slate-800 border border-slate-700 text-[9px] text-[#00e5ff]">Ctrl+L</kbd>
            <span className="text-[10px] text-slate-400">Clear</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1 py-0.2 rounded bg-slate-800 border border-slate-700 text-[9px] text-[#00e5ff]">↑ ↓</kbd>
            <span className="text-[10px] text-slate-400">History</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 pl-2 shrink-0 text-[10px]">
          <span className="text-slate-500">Session:</span>
          <span className="font-semibold text-slate-300">
            {sessionCode || "DFIR-RJRQ-HYB2"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ForensicTerminalSandbox({
  onAwardXP,
  onAwardBadge,
  defaultTab = "cadet"
}) {
  const [sandboxMode, setSandboxMode] = useState(defaultTab);
  // Terminal and Content Position: "right" (Split: Content Left, CLI Right) | "left" (Split: CLI Left, Content Right) | "stacked" (Vertical)
  const [cliPosition, setCliPosition] = useState("right");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPos = localStorage.getItem("cdi409_terminal_cli_position");
      if (savedPos && ["right", "left", "stacked"].includes(savedPos)) {
        setCliPosition(savedPos);
      }
    }
  }, []);

  const handleSetCliPosition = (pos) => {
    setCliPosition(pos);
    if (typeof window !== "undefined") {
      localStorage.setItem("cdi409_terminal_cli_position", pos);
    }
  };

  // Linux Cadet (Gamified Tutorial) State
  const [cadetLevelIndex, setCadetLevelIndex] = useState(0);
  const [completedCadetLevels, setCompletedCadetLevels] = useState({});
  const [cadetHistory, setCadetHistory] = useState([]);
  const [cadetInput, setCadetInput] = useState("");
  const [cadetEnteredCommands, setCadetEnteredCommands] = useState([]);
  const [cadetHistoryPointer, setCadetHistoryPointer] = useState(-1);
  const [cadetLevelFeedback, setCadetLevelFeedback] = useState(null);
  const [cadetShowHint, setCadetShowHint] = useState(false);
  const [cadetPath, setCadetPath] = useState("/home/investigator");
  const cadetViewportRef = useRef(null);
  const cadetInputRef = useRef(null);

  // Case Missions State
  const [caseMissions, setCaseMissions] = useState(FORENSIC_CASES);
  const [selectedCase, setSelectedCase] = useState(FORENSIC_CASES[0]);
  const [showMissionsList, setShowMissionsList] = useState(true);
  const [commandInput, setCommandInput] = useState("");
  const [terminalHistory, setTerminalHistory] = useState([]);
  const [historyPointer, setHistoryPointer] = useState(-1);
  const [enteredCommands, setEnteredCommands] = useState([]);
  const [userFlagInput, setUserFlagInput] = useState("");
  const [flagFeedback, setFlagFeedback] = useState(null);
  const [completedCases, setCompletedCases] = useState({});
  // Per-case investigation steps completed: { [caseId]: { [stepIndex]: true } }
  const [caseSteps, setCaseSteps] = useState({});
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [sessionCode, setSessionCode] = useState("DFIR-RJRQ-HYB2");

  // Restore saved mission progress
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const savedSolved = localStorage.getItem("cdi409_completed_cases");
      if (savedSolved) setCompletedCases(JSON.parse(savedSolved));
      const savedSteps = localStorage.getItem("cdi409_case_steps");
      if (savedSteps) setCaseSteps(JSON.parse(savedSteps));
    } catch (e) {}
  }, []);

  const markStepDone = (caseId, stepIndex) => {
    setCaseSteps((prev) => {
      if (prev[caseId]?.[stepIndex]) return prev;
      const next = { ...prev, [caseId]: { ...(prev[caseId] || {}), [stepIndex]: true } };
      if (typeof window !== "undefined") localStorage.setItem("cdi409_case_steps", JSON.stringify(next));
      return next;
    });
  };

  // Load dynamic cases authored by instructors / admin
  useEffect(() => {
    let isMounted = true;
    fetchForensicCases().then((loaded) => {
      if (isMounted && Array.isArray(loaded) && loaded.length > 0) {
        setCaseMissions(loaded);
        setSelectedCase((prev) => {
          const match = loaded.find((c) => c.id === prev?.id);
          return match || loaded[0];
        });
      }
    });

    const unsubscribe = subscribeToForensicCases((updated) => {
      if (isMounted && Array.isArray(updated) && updated.length > 0) {
        setCaseMissions(updated);
        setSelectedCase((prev) => {
          const match = updated.find((c) => c.id === prev?.id);
          return match || updated[0];
        });
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Playground State
  const [vfs, setVfs] = useState(INITIAL_VFS);
  const [currentPath, setCurrentPath] = useState("/home/investigator");
  const [playgroundInput, setPlaygroundInput] = useState("");
  const [playgroundHistory, setPlaygroundHistory] = useState([]);
  const [playgroundEnteredCommands, setPlaygroundEnteredCommands] = useState([]);
  const [playgroundHistoryPointer, setPlaygroundHistoryPointer] = useState(-1);
  const [selectedEvidenceFile, setSelectedEvidenceFile] = useState(CORE_EVIDENCE_FILES[0]);
  const [activeToolTab, setActiveToolTab] = useState("memory");
  const [copiedLog, setCopiedLog] = useState(false);

  const terminalViewportRef = useRef(null);
  const inputRef = useRef(null);
  const playgroundViewportRef = useRef(null);
  const playgroundInputRef = useRef(null);

  useEffect(() => {
    initCaseTerminal(selectedCase);
    generateSessionCode();
    setUserFlagInput("");
    setFlagFeedback(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCase?.id]);

  useEffect(() => {
    initPlaygroundTerminal();
    initCadetTerminal();

    if (typeof window !== "undefined") {
      const savedCadet = localStorage.getItem("cdi409_cadet_completed_levels");
      if (savedCadet) {
        try {
          setCompletedCadetLevels(JSON.parse(savedCadet));
        } catch (e) {}
      }
    }
  }, []);

  useEffect(() => {
    if (defaultTab) {
      setSandboxMode(defaultTab);
    }
  }, [defaultTab]);

  // Keep internal terminal container scrolled to bottom without moving parent window
  useEffect(() => {
    if (sandboxMode === "missions") {
      if (terminalViewportRef.current) {
        terminalViewportRef.current.scrollTop = terminalViewportRef.current.scrollHeight;
      }
    } else if (sandboxMode === "playground") {
      if (playgroundViewportRef.current) {
        playgroundViewportRef.current.scrollTop = playgroundViewportRef.current.scrollHeight;
      }
    } else if (sandboxMode === "cadet") {
      if (cadetViewportRef.current) {
        cadetViewportRef.current.scrollTop = cadetViewportRef.current.scrollHeight;
      }
    }
  }, [terminalHistory, playgroundHistory, cadetHistory, sandboxMode]);

  // Escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isFullScreen) {
        setIsFullScreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullScreen]);

  const generateSessionCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "DFIR-";
    for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    code += "-";
    for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    setSessionCode(code);
  };

  const initCaseTerminal = (currentCase) => {
    setTerminalHistory([]);
  };

  const initPlaygroundTerminal = () => {
    setPlaygroundHistory([]);
  };

  // Does a typed command match a step's suggested command? (tolerant of small differences)
  const commandMatchesHint = (cmd, hint) => {
    if (!cmd || !hint) return false;
    const norm = (s) => s.toLowerCase().replace(/["']/g, "").trim();
    const c = norm(cmd);
    const h = norm(hint);
    if (c === h || c.includes(h)) return true;
    const hintTokens = h.split(/\s+/).filter((t) => t.length > 1);
    if (hintTokens.length === 0) return false;
    const hits = hintTokens.filter((t) => c.includes(t)).length;
    return c.split(/\s+/)[0] === hintTokens[0] && hits / hintTokens.length >= 0.6;
  };

  // Execute a command in the active case terminal (used by typing AND by "Run" buttons)
  const runCaseCommand = (rawInput) => {
    const rawCmd = (rawInput || "").trim();
    if (!rawCmd) return;

    if (rawCmd.toLowerCase() === "clear") {
      setTerminalHistory([]);
      setCommandInput("");
      return;
    }

    setEnteredCommands((prev) => [...prev, rawCmd]);
    setHistoryPointer(-1);

    const casePath = `/evidence/${selectedCase.id}`;
    const cmdTokens = rawCmd.split(/\s+/);
    const mainCmd = cmdTokens[0].toLowerCase();
    const subCmd = cmdTokens[1] ? cmdTokens[1].toLowerCase() : "";

    const result = parseCaseCommand(rawCmd, mainCmd, subCmd, selectedCase);
    if (result && result.type === "clear") {
      setTerminalHistory([]);
      setCommandInput("");
      return;
    }

    setTerminalHistory((prev) => [
      ...prev,
      {
        type: "prompt",
        user: "investigator",
        host: "kali",
        path: casePath,
        command: rawCmd,
        text: `──(investigator㉿kali)-[${casePath}]\n└─$ ${rawCmd}`
      },
      result
    ]);
    setCommandInput("");

    // Auto-tick investigation steps
    if (result && result.type !== "error") {
      const hints = selectedCase.hintCommands || [];
      const taskCount = (selectedCase.tasks || []).length;
      hints.forEach((h, i) => {
        if (i < taskCount && commandMatchesHint(rawCmd, h)) markStepDone(selectedCase.id, i);
      });
      // Steps with no matching suggested command complete once the evidence flag is revealed
      if (extractFlag(result.text)) {
        for (let i = hints.length; i < taskCount; i++) markStepDone(selectedCase.id, i);
      }
    }
    inputRef.current?.focus();
  };

  // Case Command Handler
  const handleCaseCommandSubmit = (e) => {
    e.preventDefault();
    runCaseCommand(commandInput);
  };

  // Playground Command Handler
  const handlePlaygroundSubmit = (e) => {
    e.preventDefault();
    const rawCmd = playgroundInput.trim();
    if (!rawCmd) return;

    setPlaygroundEnteredCommands((prev) => [...prev, rawCmd]);
    setPlaygroundHistoryPointer(-1);

    const formattedPath = formatPromptPath(currentPath);
    const newOutput = [
      ...playgroundHistory,
      {
        type: "prompt",
        user: "investigator",
        host: "kali",
        path: formattedPath,
        command: rawCmd,
        text: `──(investigator㉿kali)-[${formattedPath}]\n└─$ ${rawCmd}`
      }
    ];

    const result = executePlaygroundCommand(rawCmd, currentPath, setCurrentPath, vfs, setVfs);
    if (result) {
      if (result.type === "clear") {
        setPlaygroundHistory([]);
        setPlaygroundInput("");
        return;
      }
      newOutput.push(result);
    }

    setPlaygroundHistory(newOutput);
    setPlaygroundInput("");
  };

  // Run a command directly in Playground
  const runDirectPlaygroundCmd = (cmdStr) => {
    if (cmdStr.toLowerCase().trim() === "clear") {
      setPlaygroundHistory([]);
      return;
    }

    const formattedPath = formatPromptPath(currentPath);
    const newOutput = [
      ...playgroundHistory,
      {
        type: "prompt",
        user: "investigator",
        host: "kali",
        path: formattedPath,
        command: cmdStr,
        text: `──(investigator㉿kali)-[${formattedPath}]\n└─$ ${cmdStr}`
      }
    ];

    const result = executePlaygroundCommand(cmdStr, currentPath, setCurrentPath, vfs, setVfs);
    if (result) {
      if (result.type === "clear") {
        setPlaygroundHistory([]);
        return;
      }
      newOutput.push(result);
    }
    setPlaygroundHistory(newOutput);
    playgroundInputRef.current?.focus();
  };

  // Up/Down Arrows for Case
  const handleCaseKeyDown = (e) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (enteredCommands.length === 0) return;
      const nextPointer = historyPointer === -1 ? enteredCommands.length - 1 : Math.max(0, historyPointer - 1);
      setHistoryPointer(nextPointer);
      setCommandInput(enteredCommands[nextPointer] || "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyPointer === -1) return;
      const nextPointer = historyPointer + 1;
      if (nextPointer >= enteredCommands.length) {
        setHistoryPointer(-1);
        setCommandInput("");
      } else {
        setHistoryPointer(nextPointer);
        setCommandInput(enteredCommands[nextPointer] || "");
      }
    }
  };

  // Up/Down Arrows for Playground
  const handlePlaygroundKeyDown = (e) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (playgroundEnteredCommands.length === 0) return;
      const nextPointer =
        playgroundHistoryPointer === -1
          ? playgroundEnteredCommands.length - 1
          : Math.max(0, playgroundHistoryPointer - 1);
      setPlaygroundHistoryPointer(nextPointer);
      setPlaygroundInput(playgroundEnteredCommands[nextPointer] || "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (playgroundHistoryPointer === -1) return;
      const nextPointer = playgroundHistoryPointer + 1;
      if (nextPointer >= playgroundEnteredCommands.length) {
        setPlaygroundHistoryPointer(-1);
        setPlaygroundInput("");
      } else {
        setPlaygroundHistoryPointer(nextPointer);
        setPlaygroundInput(playgroundEnteredCommands[nextPointer] || "");
      }
    }
  };

  const initCadetTerminal = () => {
    setCadetHistory([]);
  };

  const handleCadetSubmit = (e) => {
    if (e) e.preventDefault();
    const rawCmd = cadetInput.trim();
    if (!rawCmd) return;

    setCadetEnteredCommands((prev) => [...prev, rawCmd]);
    setCadetHistoryPointer(-1);

    runCadetCommand(rawCmd);
    setCadetInput("");
  };

  const runCadetCommand = (rawCmd) => {
    const formattedPath = formatPromptPath(cadetPath);
    const newOutput = [
      ...cadetHistory,
      {
        type: "prompt",
        user: "investigator",
        host: "kali",
        path: formattedPath,
        command: rawCmd,
        text: `──(investigator㉿kali)-[${formattedPath}]\n└─$ ${rawCmd}`
      }
    ];

    const result = executePlaygroundCommand(rawCmd, cadetPath, setCadetPath, vfs, setVfs);
    if (result) {
      if (result.type === "clear") {
        setCadetHistory([]);
        setCadetInput("");
        return;
      }
      newOutput.push(result);
    }

    // Check level fulfillment
    const currentLvl = LINUX_CADET_LEVELS[cadetLevelIndex];
    const isLevelMatch = currentLvl.acceptableCommands.some(
      (c) =>
        rawCmd.toLowerCase().trim() === c.toLowerCase() ||
        rawCmd.toLowerCase().trim().startsWith(c.toLowerCase()) ||
        rawCmd.toLowerCase().trim().includes(c.toLowerCase())
    );

    if (isLevelMatch) {
      const alreadyDone = completedCadetLevels[currentLvl.id];
      if (!alreadyDone) {
        const nextCompleted = { ...completedCadetLevels, [currentLvl.id]: true };
        setCompletedCadetLevels(nextCompleted);
        if (typeof window !== "undefined") {
          localStorage.setItem("cdi409_cadet_completed_levels", JSON.stringify(nextCompleted));
        }
        if (onAwardXP) onAwardXP(currentLvl.xpReward);
        if (onAwardBadge) onAwardBadge(currentLvl.badgeName);

        newOutput.push({
          type: "success",
          text: `\n★ LEVEL ${currentLvl.levelNumber} ACCOMPLISHED! +${currentLvl.xpReward} XP Awarded!\nBadge Unlocked: ${currentLvl.badgeIcon} ${currentLvl.badgeName}\n`
        });

        setCadetLevelFeedback({
          success: true,
          message: `Mission Accomplished! You earned +${currentLvl.xpReward} XP and the '${currentLvl.badgeName}' badge!`
        });
      } else {
        setCadetLevelFeedback({
          success: true,
          message: `Command verified! (Level already completed previously)`
        });
      }
    } else {
      setCadetLevelFeedback(null);
    }

    setCadetHistory(newOutput);
    cadetInputRef.current?.focus();
  };

  const handleCadetKeyDown = (e) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (cadetEnteredCommands.length === 0) return;
      const nextPointer =
        cadetHistoryPointer === -1
          ? cadetEnteredCommands.length - 1
          : Math.max(0, cadetHistoryPointer - 1);
      setCadetHistoryPointer(nextPointer);
      setCadetInput(cadetEnteredCommands[nextPointer] || "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (cadetHistoryPointer === -1) return;
      const nextPointer = cadetHistoryPointer + 1;
      if (nextPointer >= cadetEnteredCommands.length) {
        setCadetHistoryPointer(-1);
        setCadetInput("");
      } else {
        setCadetHistoryPointer(nextPointer);
        setCadetInput(cadetEnteredCommands[nextPointer] || "");
      }
    }
  };

  const parseCaseCommand = (fullCmd, cmd, sub, currentCase) => {
    if (cmd === "clear") {
      setTerminalHistory([]);
      return { type: "clear", text: "" };
    }

    if (cmd === "help" || cmd === "man") {
      return {
        type: "output",
        text: `AVAILABLE COMMANDS FOR [${currentCase.caseCode}]:
  tasks                    Show active objectives
  ls [-la]                 List evidence files
  cat <file>               Inspect file
  sha256sum <file>         Calculate SHA-256 hash
  clear                    Reset screen
  submit <flag>            Submit discovered flag

CASE SUGGESTIONS:
${currentCase.hintCommands.map((c) => `  $ ${c}`).join("\n")}`
      };
    }

    if (cmd === "tasks") {
      return {
        type: "info",
        text: `ACTIVE CASE: [${currentCase.caseCode}] ${currentCase.title}
OBJECTIVES:
${currentCase.tasks.map((t, i) => `  [${i + 1}] ${t.label}`).join("\n")}`
      };
    }

    if (cmd === "ls" || cmd === "dir") {
      if (currentCase.id === "case-usb-01") {
        return {
          type: "output",
          text: `total 4194304
-r--r--r-- 1 root root 4294967296 Oct 12 23:25 usb_image.dd
-r--r--r-- 1 root root     262144 Oct 12 23:20 SYSTEM.hive
-r--r--r-- 1 root root      65536 Oct 12 23:17 WINRAR.EXE-A92B3C11.pf
-r--r--r-- 1 root root       1240 Oct 12 23:30 chain_of_custody_receipt.txt`
        };
      }
      if (currentCase.id === "case-ram-02") {
        return {
          type: "output",
          text: `total 8388608
-r--r--r-- 1 root root 8589934592 Oct 12 23:55 memdump.raw
-r--r--r-- 1 root root        512 Oct 12 23:58 memdump.raw.sha256`
        };
      }
      if (currentCase.id === "case-pcap-03") {
        return {
          type: "output",
          text: `total 16384
-r--r--r-- 1 root root 16777216 Oct 12 22:10 suspect_traffic.pcap`
        };
      }
      return {
        type: "output",
        text: `total 8192
-r--r--r-- 1 root root  4096 Oct 12 18:30 drone_telemetry.log
-r--r--r-- 1 root root 16384 Oct 12 18:45 sawdust_specimen_batch04.dat`
      };
    }

    if (cmd === "pwd") {
      return { type: "output", text: `/evidence/${currentCase.id}` };
    }

    if (cmd === "sha256sum") {
      const target = fullCmd.split(/\s+/)[1] || "evidence.dd";
      let hash = "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069";
      return {
        type: "success",
        text: `${hash}  ${target} [VERIFIED COURT HASH - EVIDENCE UNALTERED]`
      };
    }

    if (cmd.startsWith("reg-query") || cmd === "reg") {
      return {
        type: "output",
        text: `HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Enum\\USBSTOR
--------------------------------------------------------------------------------
Key: Disk&Ven_SanDisk&Prod_Ultra_USB_3.0&Rev_1.00
  Subkey (Hardware Serial Number): 4C530001230415112041
  FriendlyName:     SanDisk Ultra USB 3.0 Device
  FirstInstallDate: 2026-10-12 23:14:02 UTC

MountedDevices: Drive E:\\ (PERSONAL_DRIVE)
[FINDING]: SanDisk USB (Serial: 4C530001230415112041) inserted at 23:14:02 UTC.`
      };
    }

    if (cmd.startsWith("prefetch-dump") || fullCmd.includes("WINRAR.EXE")) {
      return {
        type: "output",
        text: `WINDOWS PREFETCH: C:\\Windows\\Prefetch\\WINRAR.EXE-A92B3C11.pf
Executable:            WINRAR.EXE
Run Count:             14
Last Run Timestamp:    2026-10-12 23:16:45 UTC
Target:                \\DEVICE\\HARDDISKVOLUME4\\TARGET_EXPORT\\dossier_archive.rar (DRIVE E:\\)
[FINDING]: WinRAR executed 45s after USB insertion (Run Count = 14) to archive dossiers.`
      };
    }

    if (cmd.startsWith("mft-compare") || cmd.includes("timestomp")) {
      return {
        type: "output",
        text: `NTFS $MFT TIMESTOMP AUDIT: E:\\dossier_archive.rar
$STANDARD_INFORMATION (SIA):   2019-01-15 10:00:00 UTC (Backdated)
$FILE_NAME (FNA):              2026-10-12 23:19:30 UTC (True Creation)

DIVERGENCE CONFIRMED. Timestomping detected on $STANDARD_INFORMATION.
FLAG UNLOCKED: FLAG{USB_4C530001230415112041_WINRAR_RUN14}`
      };
    }

    if (cmd === "volatility" || cmd === "vol") {
      if (fullCmd.includes("pslist")) {
        return {
          type: "output",
          text: `VOLATILITY 3 PROCESS LIST:
PID      PPID     ImageFileName        CreateTime (UTC)
3200     2810     winword.exe          2026-10-12 23:40:11
3824     3200     beacon.exe           2026-10-12 23:42:01 <-- SUSPICIOUS SPAWN
[SUSPICIOUS PROCESS]: PID 3824 (beacon.exe) spawned by winword.exe via macro.`
        };
      }
      if (fullCmd.includes("netscan")) {
        return {
          type: "output",
          text: `VOLATILITY 3 NETWORK SCAN:
Proto    LocalAddr:Port         ForeignAddr:Port       State        PID    Owner
TCPv4    192.168.10.45:49712    192.168.10.144:8443    ESTABLISHED  3824   beacon.exe
[C2 SOCKET ATTRIBUTED]: Outbound TLS tunnel to 192.168.10.144:8443!`
        };
      }
      if (fullCmd.includes("malfind")) {
        return {
          type: "output",
          text: `VOLATILITY 3 MALFIND:
Process: beacon.exe Pid: 3824 Address: 0x00d10000 Permissions: PAGE_EXECUTE_READWRITE
0x00d10000  4d 5a 90 00 03 00 00 00 (Injected Windows Executable PE Header)`
        };
      }
      return { type: "output", text: "volatility usage: volatility -f memdump.raw windows.pslist | windows.netscan" };
    }

    if (fullCmd.includes("strings") || fullCmd.includes("grep")) {
      return {
        type: "output",
        text: `CARVED RAM STRINGS:
Offset 0x0089C110: BitLocker-Key: 419201-582910-192837-991823
Offset 0x00D12E40: C2_SERVER=192.168.10.144:8443 [ESTABLISHED]

FLAG UNLOCKED: FLAG{PID_3824_C2_192.168.10.144_PORT_8443}`
      };
    }

    if (cmd.startsWith("pcap-info")) {
      return {
        type: "output",
        text: `PCAP INFO: suspect_traffic.pcap (1,428 frames)
Protocols: TCP (88%), HTTP (12%), DNS (2%)
Source: 192.168.1.105 -> Dest: 172.67.142.12 (Spoofed Portal)`
      };
    }

    if (cmd.startsWith("tshark")) {
      if (fullCmd.includes("POST") || fullCmd.includes("follow") || fullCmd.includes("http")) {
        return {
          type: "output",
          text: `RECONSTRUCTED TCP STREAM #2 (HTTP POST):
Host: secure-urios-edu-ph.serveo.net
Payload: username=admin&password=AlphaCriminology2026!

FLAG UNLOCKED: FLAG{USER_admin_PASS_AlphaCriminology2026}`
        };
      }
      return {
        type: "output",
        text: `1 192.168.1.105 -> 172.67.142.12 HTTP POST /auth/login HTTP/1.1`
      };
    }

    if (cmd.startsWith("parse-sawdust") || fullCmd.includes("sawdust")) {
      return {
        type: "output",
        text: `BOTANY REPORT: Nasipit Seaport Batch #04 Sawdust
Species: Shorea contorta (White Lauan - CRITICALLY ENDANGERED)
Harvest Ban: PD 705 Section 68 & Executive Order 23 (Total Logging Ban)`
      };
    }

    if (fullCmd.includes("drone_telemetry") || fullCmd.includes("drone")) {
      return {
        type: "output",
        text: `DRONE FLIGHT LOG: DJI Mavic 3 Enterprise
Waypoint #2: Lat 8.9842° N, Lon 125.3401° E | Alt: 85m | Mt. Mayapay Protected Watershed

FLAG UNLOCKED: FLAG{GPS_8.9842N_125.3401E_SHOREA_CONTORTA}`
      };
    }

    if (cmd === "submit") {
      const submitted = fullCmd.split(/\s+/).slice(1).join("");
      if (submitted && normalizeAnswer(submitted) === normalizeAnswer(currentCase.flagSolution)) {
        const already = completedCases[currentCase.id];
        handleSuccessFlag(currentCase);
        return {
          type: "success",
          text: already
            ? `Correct answer! (You already solved this case earlier.)`
            : `Case solved! +${currentCase.xpReward} XP awarded. Badge unlocked: '${currentCase.badgeName}'.`
        };
      }
      return {
        type: "error",
        text: `That answer is not correct yet. Look for a line that starts with FLAG{ in the results above, then try again.`
      };
    }

    // Support custom/instructor-authored case simulated outputs & hint commands
    if (currentCase.simulatedOutput) {
      const isHintMatch = currentCase.hintCommands?.some(
        (h) => fullCmd.toLowerCase().trim() === h.toLowerCase().trim() || fullCmd.toLowerCase().includes(h.toLowerCase())
      );
      if (isHintMatch || cmd === "cat" || cmd === "grep" || cmd === "sqlite3" || cmd === "parse-eml") {
        return {
          type: "output",
          text: currentCase.simulatedOutput
        };
      }
    }

    return {
      type: "error",
      text: `"${cmd}" is not a recognized command.\nTip: click a "Run" button in the Investigation Steps panel, or type  help  to see all commands for this case.`
    };
  };

  const handleFlagSubmitDirect = (e) => {
    e.preventDefault();
    if (!userFlagInput.trim()) return;

    if (normalizeAnswer(userFlagInput) === normalizeAnswer(selectedCase.flagSolution)) {
      const already = completedCases[selectedCase.id];
      handleSuccessFlag(selectedCase);
      setFlagFeedback({
        success: true,
        message: already
          ? "Correct! You already solved this case — no extra XP this time."
          : `Case solved! You earned +${selectedCase.xpReward} XP and the '${selectedCase.badgeName}' badge.`
      });
    } else {
      setFlagFeedback({
        success: false,
        message: "Not quite. Make sure you copied the whole code including FLAG{ and the closing }."
      });
    }
  };

  const handleSuccessFlag = (c) => {
    const alreadySolved = completedCases[c.id];
    setCompletedCases((prev) => {
      const next = { ...prev, [c.id]: true };
      if (typeof window !== "undefined") localStorage.setItem("cdi409_completed_cases", JSON.stringify(next));
      return next;
    });
    (c.tasks || []).forEach((_, i) => markStepDone(c.id, i));
    if (alreadySolved) return;
    if (onAwardXP) onAwardXP(c.xpReward);
    if (onAwardBadge) onAwardBadge(c.badgeName);
  };

  const handleCopyPlaygroundLogs = () => {
    const textToCopy = playgroundHistory.map((h) => h.text).join("\n");
    navigator.clipboard?.writeText(textToCopy);
    setCopiedLog(true);
    setTimeout(() => setCopiedLog(false), 2000);
  };

  return (
    <div
      className={`space-y-3 transition-all ${
        isFullScreen
          ? "fixed inset-0 z-50 bg-slate-100 p-3 sm:p-4 overflow-y-auto lg:overflow-hidden flex flex-col"
          : ""
      }`}
    >
      {/* 1. Clean Professional Forensic Terminal Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border bg-white border-slate-200 text-slate-800 shadow-2xs transition-all shrink-0">
        {/* Title & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl flex items-center justify-center font-bold shrink-0 bg-gradient-to-br from-[#002D62] to-[#001F44] text-[#C5A059] shadow-sm">
            <TerminalIcon className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-serif text-[#002D62]">Forensic Terminal</h2>
            <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
              <span>SANS SIFT</span>
              <span>•</span>
              <span>Client-Side Simulation</span>
            </div>
          </div>
        </div>

        {/* Clean Center Navigation Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 gap-1">
          <button
            id="forensic-tab-cadet"
            onClick={() => setSandboxMode("cadet")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              sandboxMode === "cadet"
                ? "bg-white text-[#002D62] font-bold shadow-xs ring-1 ring-slate-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5 text-[#002D62]" />
            <span>Terminal Guide</span>
          </button>
          <button
            id="forensic-tab-missions"
            onClick={() => setSandboxMode("missions")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              sandboxMode === "missions"
                ? "bg-white text-[#002D62] font-bold shadow-xs ring-1 ring-slate-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            <Shield className="h-3.5 w-3.5 text-red-500" />
            <span>Case Missions</span>
          </button>
          <button
            id="forensic-tab-playground"
            onClick={() => setSandboxMode("playground")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              sandboxMode === "playground"
                ? "bg-white text-[#002D62] font-bold shadow-xs ring-1 ring-slate-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            <Flame className="h-3.5 w-3.5 text-amber-500" />
            <span>Playground</span>
          </button>
        </div>

        {/* Right Screen Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Screen Layout Switcher */}
          <div className="hidden xl:flex items-center gap-1 px-1.5 py-1 rounded-lg border bg-slate-100 border-slate-200 text-xs font-mono text-slate-600">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-0.5">LAYOUT:</span>
            {[
              { id: "right", label: "Right", tip: "Instructions left, terminal right" },
              { id: "left", label: "Left", tip: "Terminal left, instructions right" },
              { id: "stacked", label: "Stacked", tip: "Instructions on top, terminal below" }
            ].map((l) => (
              <button
                key={l.id}
                onClick={() => handleSetCliPosition(l.id)}
                title={l.tip}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                  cliPosition === l.id
                    ? "bg-white text-[#002D62] shadow-2xs font-bold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-mono text-slate-600">
            <span className="text-slate-400 text-[11px]">Session:</span>
            <span className="font-semibold text-slate-700 text-[11px]">{sessionCode || "DFIR-RJRQ-HYB2"}</span>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="h-8 px-2.5 rounded-lg text-xs gap-1.5 border-slate-200 text-slate-600 hover:text-[#002D62] cursor-pointer"
            title={isFullScreen ? "Exit Fullscreen (Esc)" : "Fullscreen"}
          >
            {isFullScreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      {/* =========================================================================
          VIEW 0: GAMIFIED LINUX CADET ACADEMY (INTERACTIVE TUTORIAL)
         ========================================================================= */}
      {sandboxMode === "cadet" && (
        <div className={`space-y-3 ${isFullScreen ? "flex-1 min-h-0 flex flex-col overflow-hidden" : ""}`}>

          {/* Level Progress Map & Stats Bar */}
          <div className="p-2.5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-2.5 shrink-0 transition-all bg-white border-slate-200 shadow-2xs">
            {/* Level Selector Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <span className="text-xs font-bold font-serif shrink-0 mr-1 flex items-center gap-1 text-[#002D62]">
                <GraduationCap className="h-3.5 w-3.5 text-[#C5A059]" />
                Levels:
              </span>
              {LINUX_CADET_LEVELS.map((lvl, idx) => {
                const isSelected = cadetLevelIndex === idx;
                const isDone = completedCadetLevels[lvl.id];

                return (
                  <button
                    key={lvl.id}
                    onClick={() => {
                      setCadetLevelIndex(idx);
                      setCadetLevelFeedback(null);
                      setCadetShowHint(false);
                    }}
                    className={`h-7 px-2.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                      isSelected
                        ? "bg-[#002D62] text-white shadow-xs ring-2 ring-[#C5A059]/50"
                        : isDone
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                        : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span className="shrink-0">{getCadetLevelIcon(lvl.id, "h-3.5 w-3.5")}</span>
                    <span>L{lvl.levelNumber}</span>
                    {isDone && <Check className="h-3 w-3 text-emerald-400 stroke-[3]" />}
                  </button>
                );
              })}
            </div>

            {/* Overall Cadet Score & Rank */}
            <div className="flex items-center gap-2.5 shrink-0 text-xs">
              <div className="px-2.5 py-1 rounded-lg border font-mono text-[11px] flex items-center gap-1.5 bg-amber-50 border-amber-200 text-amber-900">
                <Flame className="h-3.5 w-3.5 text-amber-500" />
                <span>
                  <strong>{Object.keys(completedCadetLevels).length} / 8</strong> Done
                </span>
                <span className="text-amber-400">•</span>
                <span className="font-bold text-[#002D62]">
                  {Object.keys(completedCadetLevels).reduce((acc, id) => {
                    const l = LINUX_CADET_LEVELS.find((lvl) => lvl.id.toString() === id.toString());
                    return acc + (l ? l.xpReward : 0);
                  }, 0)}{" "}
                  XP
                </span>
              </div>
              <Badge className="border-none font-mono text-[10px] bg-[#002D62] text-[#C5A059] flex items-center gap-1.5 px-2.5 py-1">
                {Object.keys(completedCadetLevels).length === 8 ? (
                  <>
                    <Award className="h-3.5 w-3.5 text-[#C5A059]" />
                    <span>Certified Examiner</span>
                  </>
                ) : Object.keys(completedCadetLevels).length >= 4 ? (
                  <>
                    <Search className="h-3.5 w-3.5 text-[#C5A059]" />
                    <span>Terminal Scout</span>
                  </>
                ) : (
                  <>
                    <Shield className="h-3.5 w-3.5 text-[#C5A059]" />
                    <span>Student Recruit</span>
                  </>
                )}
              </Badge>
            </div>
          </div>

          {/* Side-by-Side or Stacked Student Workspace */}
          {(() => {
            const currentLvl = LINUX_STUDENT_LEVELS[cadetLevelIndex];
            const isLvlDone = completedCadetLevels[currentLvl.id];

            // 1. Content Panel (Quest Brief, Criminology Concept, Mission Goal, Hints)
            const questCard = (
              <Card className="p-4 rounded-xl space-y-3 flex flex-col justify-between transition-all bg-white border-slate-200 shadow-2xs">
                {/* Header */}
                <div className="space-y-2 border-b pb-2.5 border-slate-100">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-8 w-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 bg-[#002D62] text-[#C5A059]">
                        {getCadetLevelIcon(currentLvl.id, "h-4 w-4")}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-mono font-bold text-[#C5A059] uppercase tracking-wider block">
                          Level {currentLvl.levelNumber} of 8
                        </span>
                        <h3 className="text-sm font-bold font-serif leading-tight truncate text-[#002D62]">
                          {currentLvl.title}
                        </h3>
                      </div>
                    </div>
                    {isLvlDone ? (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] font-mono shrink-0">
                        ✓ DONE (+{currentLvl.xpReward} XP)
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-900 border-amber-200 text-[10px] font-mono shrink-0 animate-pulse">
                        ACTIVE (+{currentLvl.xpReward} XP)
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Concept & Forensic Criminology Context */}
                <div className="space-y-2 text-xs">
                  <p className="leading-relaxed font-sans text-[11.5px] text-slate-700">
                    {currentLvl.description}
                  </p>

                  <div className="p-2.5 rounded-lg text-[11px] flex items-start gap-2 leading-relaxed border bg-blue-50/70 border-blue-200/80 text-[#002D62]">
                    <Scale className="h-3.5 w-3.5 shrink-0 mt-0.5 text-cyan-400" />
                    <div>
                      <strong className="font-serif">Why Investigators Use This:</strong>{" "}
                      <span className="text-slate-700">
                        {currentLvl.whyCriminology}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mission Goal Box (Clean Institutional FSUU Styling) */}
                <div className="p-3.5 bg-gradient-to-br from-slate-50 via-white to-blue-50/40 rounded-xl border border-slate-200 space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#002D62] font-serif font-bold flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-[#C5A059]" /> Level Objective
                    </span>
                    <span className="text-slate-500 font-mono text-[10px] font-semibold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {currentLvl.concept}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-sans">
                    {currentLvl.instructions}
                  </p>

                  {/* Primary Command Execution Card */}
                  <div className="pt-2 border-t border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <code className="text-[#002D62] font-mono text-xs font-bold truncate bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 flex-1 flex items-center gap-1.5">
                        <span className="text-slate-400 font-normal select-none">$</span>
                        <span>{currentLvl.primaryCommand}</span>
                      </code>

                      <Button
                        size="sm"
                        type="button"
                        onClick={() => runCadetCommand(currentLvl.primaryCommand)}
                        className="h-8 px-3 rounded-lg text-xs font-bold gap-1.5 bg-[#002D62] hover:bg-[#001F44] text-[#C5A059] shadow-2xs cursor-pointer shrink-0 transition-transform active:scale-95"
                        title="Click to execute this command in the terminal"
                      >
                        <Play className="h-3 w-3 fill-current" />
                        <span>Run</span>
                      </Button>

                      <Button
                        size="sm"
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setCadetInput(currentLvl.primaryCommand);
                          cadetInputRef.current?.focus();
                        }}
                        className="h-8 px-2.5 rounded-lg text-xs border-slate-200 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 shrink-0"
                        title="Copy command to terminal prompt"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    {/* Secondary command if available */}
                    {currentLvl.secondaryCommand && (
                      <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-blue-50/50 border border-blue-100 text-[11px]">
                        <span className="text-slate-600 truncate">
                          Also explore: <code className="font-mono font-bold text-[#002D62]">{currentLvl.secondaryCommand}</code>
                        </span>
                        <button
                          type="button"
                          onClick={() => runCadetCommand(currentLvl.secondaryCommand)}
                          className="px-2 py-0.5 rounded text-[10px] font-bold font-mono text-[#002D62] hover:bg-blue-100 transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                        >
                          <Play className="h-2.5 w-2.5 fill-current" />
                          <span>Run</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Hint Toggle */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setCadetShowHint(!cadetShowHint)}
                      className="text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium transition-colors text-[11px] cursor-pointer"
                    >
                      <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                      <span>{cadetShowHint ? "Hide Explanation" : "Need help? View Tip"}</span>
                    </button>
                    {isLvlDone && (
                      <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                        <Check className="h-3 w-3 stroke-[3]" /> Completed
                      </span>
                    )}
                  </div>

                  {cadetShowHint && (
                    <div className="p-2.5 bg-amber-50/80 rounded-xl text-xs text-amber-950 border border-amber-200/80 space-y-1 animate-in fade-in leading-relaxed">
                      <div><strong className="font-serif text-[#002D62]">Hint:</strong> {currentLvl.hint}</div>
                      <div className="text-[11px] text-slate-600">{currentLvl.keyLearning}</div>
                    </div>
                  )}
                </div>

                {/* Level Complete Feedback & Next Action Banner */}
                {isLvlDone && (
                  <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500/15 via-emerald-500/10 to-teal-500/10 border border-emerald-300 text-emerald-950 text-xs space-y-2 animate-in fade-in">
                    <div className="flex items-center gap-2 font-bold text-emerald-800">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Level {currentLvl.levelNumber} Accomplished!</span>
                      <span className="ml-auto font-mono text-[10px] bg-emerald-100 px-2 py-0.5 rounded text-emerald-800 border border-emerald-200">
                        +{currentLvl.xpReward} XP
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-900 leading-snug flex items-center gap-1.5 flex-wrap">
                      <span>Badge Unlocked:</span>
                      <span className="font-semibold inline-flex items-center gap-1 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-300">
                        {getCadetLevelIcon(currentLvl.id, "h-3.5 w-3.5 text-emerald-800")}
                        <span>{currentLvl.badgeName}</span>
                      </span>
                    </p>

                    {cadetLevelIndex < LINUX_STUDENT_LEVELS.length - 1 ? (
                      <Button
                        size="sm"
                        onClick={() => {
                          setCadetLevelIndex((prev) => prev + 1);
                          setCadetLevelFeedback(null);
                          setCadetShowHint(false);
                        }}
                        className="w-full h-8 rounded-lg bg-[#002D62] hover:bg-[#001F44] text-[#C5A059] font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs mt-1 cursor-pointer"
                      >
                        <span>Continue to Level {cadetLevelIndex + 2}: {LINUX_STUDENT_LEVELS[cadetLevelIndex + 1]?.title.split("&")[0].trim()}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => setSandboxMode("missions")}
                        className="w-full h-8 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs mt-1 cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5">
                          Graduate to Case Missions
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-200" />
                        </span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                )}
              </Card>
            );

            // 2. Terminal CLI Panel (Clean Kali Linux Terminal)
            const terminalComponent = (
              <KaliTerminalWindow
                title={`investigator@kali: ${formatPromptPath(cadetPath)}`}
                path={formatPromptPath(cadetPath)}
                history={cadetHistory}
                inputValue={cadetInput}
                onInputChange={setCadetInput}
                onKeyDown={handleCadetKeyDown}
                onSubmit={handleCadetSubmit}
                viewportRef={cadetViewportRef}
                inputRef={cadetInputRef}
                minHeight="600px"
                height="620px"
                onClear={() => setCadetHistory([])}
                onReset={() => {
                  setCadetHistory([]);
                  setCadetPath("/home/investigator");
                  setCadetLevelFeedback(null);
                }}
                onCopyLogs={() => {
                  const text = cadetHistory.map((l) => l.text || l.command || "").join("\n");
                  navigator.clipboard?.writeText(text);
                }}
                onRunCommand={(cmd) => runCadetCommand(cmd)}
                isFullScreen={isFullScreen}
                setIsFullScreen={setIsFullScreen}
                sessionCode={sessionCode}
              />
            );

            // Responsive Layout Selection: Left | Right | Stacked
            if (cliPosition === "left") {
              return (
                <div
                  className={`grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch ${
                    isFullScreen ? "flex-1 min-h-0 overflow-hidden" : ""
                  }`}
                >
                  <div className="lg:col-span-8 h-full min-h-0">{terminalComponent}</div>
                  <div
                    className={`lg:col-span-4 h-full ${
                      isFullScreen ? "overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-300" : ""
                    }`}
                  >
                    {questCard}
                  </div>
                </div>
              );
            }

            if (cliPosition === "stacked" && !isFullScreen) {
              return (
                <div className="space-y-3">
                  {questCard}
                  {terminalComponent}
                </div>
              );
            }

            // Default: cliPosition === "right" or in fullscreen (Split view: Content Left, CLI Right)
            return (
              <div
                className={`grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch ${
                  isFullScreen ? "flex-1 min-h-0 overflow-hidden" : ""
                }`}
              >
                <div
                  className={`lg:col-span-4 h-full ${
                    isFullScreen ? "overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-300" : ""
                  }`}
                >
                  {questCard}
                </div>
                <div className="lg:col-span-8 h-full min-h-0">{terminalComponent}</div>
              </div>
            );
          })()}
        </div>
      )}

      {/* =========================================================================
          VIEW A: GUIDED CASE MISSIONS (CTF DOCKETS)
         ========================================================================= */}
      {sandboxMode === "missions" && (
        <div className={`space-y-3 ${isFullScreen ? "flex-1 min-h-0 flex flex-col overflow-hidden" : ""}`}>
          {/* Case Missions Header & Toggle Control Bar */}
          <div className="flex items-center justify-between gap-3 p-2.5 px-3 bg-white rounded-xl border border-slate-200 shadow-2xs shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-7 w-7 rounded-lg bg-[#002D62] text-[#C5A059] flex items-center justify-center shrink-0 shadow-2xs">
                <Shield className="h-3.5 w-3.5 text-[#C5A059]" />
              </div>
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <span className="text-xs font-bold font-serif text-[#002D62]">
                  Case Missions Roster
                </span>
                <Badge variant="outline" className="text-[10px] font-mono border-slate-200 text-slate-600">
                  {caseMissions.length} Cases
                </Badge>
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1 shrink-0">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  {Object.keys(completedCases).length} / {caseMissions.length} Solved
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Active Case Quick Summary when Collapsed */}
              {!showMissionsList && (
                <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                  <span className="text-slate-400 font-mono text-[10px]">Active:</span>
                  <span className="font-mono font-bold text-[#002D62] text-[11px]">{selectedCase.caseCode}</span>
                  <span className="text-slate-700 font-serif truncate max-w-[170px] font-medium">{selectedCase.title.split("(")[0]}</span>
                  <span className="text-[#C5A059] font-mono font-bold text-[10px]">+{selectedCase.xpReward} XP</span>
                </div>
              )}

              {/* Prev/Next Quick Switcher */}
              <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                <button
                  type="button"
                  onClick={() => {
                    const currIdx = caseMissions.findIndex((c) => c.id === selectedCase.id);
                    const prevIdx = (currIdx - 1 + caseMissions.length) % caseMissions.length;
                    setSelectedCase(caseMissions[prevIdx]);
                    setUserFlagInput("");
                    setFlagFeedback(null);
                  }}
                  title="Previous Case Mission"
                  className="h-6 w-6 flex items-center justify-center rounded text-slate-600 hover:text-[#002D62] hover:bg-white transition-colors cursor-pointer"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const currIdx = caseMissions.findIndex((c) => c.id === selectedCase.id);
                    const nextIdx = (currIdx + 1) % caseMissions.length;
                    setSelectedCase(caseMissions[nextIdx]);
                    setUserFlagInput("");
                    setFlagFeedback(null);
                  }}
                  title="Next Case Mission"
                  className="h-6 w-6 flex items-center justify-center rounded text-slate-600 hover:text-[#002D62] hover:bg-white transition-colors cursor-pointer"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Mission List Toggle Button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowMissionsList((prev) => !prev)}
                className={`h-7 px-2.5 text-xs font-bold gap-1.5 rounded-lg cursor-pointer transition-all ${
                  showMissionsList
                    ? "bg-slate-100 border-slate-300 text-[#002D62] hover:bg-slate-200"
                    : "bg-[#002D62] text-[#C5A059] hover:bg-[#001F44] border-transparent shadow-xs"
                }`}
                title={showMissionsList ? "Collapse missions list" : "Expand missions list"}
                aria-expanded={showMissionsList}
              >
                {showMissionsList ? (
                  <>
                    <ChevronUp className="h-3.5 w-3.5" />
                    <span>Hide Missions</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3.5 w-3.5" />
                    <span>Show Missions ({caseMissions.length})</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Responsive Case Selector Tabs (Collapsible) */}
          {showMissionsList && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 shrink-0 animate-in fade-in slide-in-from-top-1 duration-150">
              {caseMissions.map((c) => {
                const isSelected = selectedCase.id === c.id;
                const isSolved = completedCases[c.id];
                const isPrebuilt = isPrebuiltCase(c);

                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCase(c);
                      setUserFlagInput("");
                      setFlagFeedback(null);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-white border-[#002D62] shadow-xs ring-2 ring-[#002D62]"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono mb-0.5">
                      <span className="text-slate-500 font-semibold truncate max-w-[90px]">
                        {c.caseCode}
                      </span>
                      {isSolved ? (
                        <span className="text-emerald-500 font-bold flex items-center gap-0.5 text-[10px]">
                          <CheckCircle2 className="h-3 w-3" /> SOLVED
                        </span>
                      ) : (
                        <span className="text-[#C5A059] font-bold">+{c.xpReward} XP</span>
                      )}
                    </div>
                    <div
                      className={`text-xs font-bold font-serif truncate ${
                        isSelected ? "text-[#002D62]" : "text-slate-800"
                      }`}
                    >
                      {c.title.split("(")[0]}
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[9px] font-mono">
                      {isPrebuilt ? (
                        <span className="text-slate-400">Pre-built</span>
                      ) : (
                        <span className="text-amber-800 font-bold bg-amber-50 border border-amber-200 px-1 py-0.2 rounded flex items-center gap-0.5">
                          <Sparkles className="h-2.5 w-2.5 text-amber-600" /> Faculty
                        </span>
                      )}
                      <span className="text-slate-400 truncate ml-1">{c.difficulty}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Split-Screen Workspace: Case Dossier + Terminal */}
          {(() => {
            const stepsDone = caseSteps[selectedCase.id] || {};
            const isCaseSolved = Boolean(completedCases[selectedCase.id]);
            const taskList = selectedCase.tasks || [];
            const hintList = selectedCase.hintCommands || [];
            const completedCount = taskList.filter((_, idx) => stepsDone[idx] || isCaseSolved).length;
            const progressPercent = taskList.length > 0 ? Math.round((completedCount / taskList.length) * 100) : 0;

            // Search terminal history for any uncovered flag
            const discoveredFlag = terminalHistory
              .map((h) => extractFlag(h.text || ""))
              .filter(Boolean)
              .pop();

            const dossier = (
              <div className="space-y-3">
                <Card className="p-4 rounded-2xl space-y-4 bg-white border-slate-200 shadow-sm">
                  {/* Case Header */}
                  <div>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge className="text-[10px] font-mono bg-[#002D62] text-[#C5A059] px-2 py-0.5 font-bold">
                          {selectedCase.caseCode}
                        </Badge>
                        {!isPrebuiltCase(selectedCase) ? (
                          <Badge className="bg-amber-50 text-amber-900 border border-amber-300 text-[10px] font-bold flex items-center gap-1">
                            <Sparkles className="h-3 w-3 text-amber-600" />
                            <span>Faculty Custom</span>
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-slate-600 border-slate-200 text-[10px] font-mono flex items-center gap-1">
                            <GraduationCap className="h-3 w-3 text-[#002D62]" />
                            <span>Official Curriculum</span>
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-amber-700 bg-amber-50/60 border-amber-200 text-[10px] font-bold font-mono">
                          +{selectedCase.xpReward} XP
                        </Badge>
                      </div>

                      <span className="text-[11px] font-mono font-bold text-slate-500">
                        {selectedCase.difficulty}
                      </span>
                    </div>

                    <h3 className="text-base font-bold font-serif mt-2 text-[#002D62] leading-snug">
                      {selectedCase.title}
                    </h3>

                    {/* Law / Statute Pill */}
                    {selectedCase.statute && (
                      <div className="mt-2 p-2 rounded-lg bg-blue-50/70 border border-blue-200/60 flex items-start gap-2 text-[11px] text-blue-950">
                        <Scale className="h-3.5 w-3.5 text-[#002D62] shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-[#002D62] font-semibold">Philippine Legal Basis:</strong>{" "}
                          <span className="text-slate-700">{selectedCase.statute}</span>
                        </div>
                      </div>
                    )}

                    {/* Case Briefing Box */}
                    <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                      <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                        Incident Briefing
                      </div>
                      <p className="leading-relaxed text-slate-700">
                        {selectedCase.scenario}
                      </p>
                    </div>
                  </div>

                  {/* Investigation Checklist with 1-Click Run Buttons */}
                  <div className="space-y-2 border-t pt-3 border-slate-100">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-[#002D62] font-serif">Investigation Steps</span>
                        <span className="text-slate-400 ml-1 text-[11px]">
                          ({completedCount}/{taskList.length} done)
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-[#002D62]">
                        {progressPercent}%
                      </span>
                    </div>

                    {/* Mini Progress Bar */}
                    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    <div className="space-y-2 pt-1">
                      {taskList.map((task, idx) => {
                        const hintCmd = hintList[idx];
                        const isDone = Boolean(stepsDone[idx] || isCaseSolved);
                        const explanation = hintCmd ? explainCommand(hintCmd) : "";

                        return (
                          <div
                            key={task.id || idx}
                            className={`p-2.5 rounded-xl border transition-all text-xs space-y-2 ${
                              isDone
                                ? "bg-emerald-50/50 border-emerald-200/80"
                                : "bg-white border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <span
                                className={`h-5 w-5 rounded-full font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 ${
                                  isDone
                                    ? "bg-emerald-600 text-white"
                                    : "bg-slate-100 text-slate-700 border border-slate-200"
                                }`}
                              >
                                {isDone ? <Check className="h-3 w-3 stroke-[3]" /> : idx + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <span className={`leading-snug block ${isDone ? "text-emerald-950 font-medium" : "text-slate-800"}`}>
                                  {task.label}
                                </span>
                                {explanation && (
                                  <span className="flex items-start gap-1 text-[10.5px] text-slate-500 mt-1 leading-snug">
                                    <Lightbulb className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
                                    <span>
                                      <strong className="text-slate-700">Tool purpose:</strong> {explanation}
                                    </span>
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Action Row */}
                            {hintCmd && (
                              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                                <code className="font-mono text-[10.5px] text-slate-600 truncate bg-slate-50 px-2 py-0.5 rounded border border-slate-200 max-w-[180px] sm:max-w-[220px]" title={hintCmd}>
                                  $ {hintCmd}
                                </code>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  <Button
                                    size="sm"
                                    type="button"
                                    onClick={() => runCaseCommand(hintCmd)}
                                    className="h-7 px-2.5 rounded-lg text-xs font-bold gap-1 bg-[#002D62] hover:bg-[#001F44] text-[#C5A059] shadow-2xs cursor-pointer"
                                    title="Run this command in the terminal"
                                  >
                                    <Play className="h-3 w-3 fill-current" />
                                    <span>Run</span>
                                  </Button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCommandInput(hintCmd);
                                      inputRef.current?.focus();
                                    }}
                                    className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                    title="Copy command to input box"
                                  >
                                    <Copy className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Flag Verification Box */}
                  <div className="space-y-2 border-t pt-3 border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-serif text-[#002D62]">
                        Case Proof & Secret Key
                      </span>
                      {selectedCase.badgeName && (
                        <span className="text-[10px] font-mono text-slate-400">
                          Reward: {selectedCase.badgeName}
                        </span>
                      )}
                    </div>

                    {/* Solved celebration state */}
                    {isCaseSolved ? (
                      <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/15 via-emerald-500/10 to-teal-500/10 border border-emerald-300 text-emerald-950 text-xs space-y-2 animate-in fade-in">
                        <div className="flex items-center gap-2 font-bold text-emerald-800">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                          <span>Case Solved Successfully!</span>
                          <span className="ml-auto font-mono text-[10px] bg-emerald-100 px-2 py-0.5 rounded text-emerald-800 border border-emerald-200">
                            +{selectedCase.xpReward} XP
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-900 leading-relaxed">
                          You uncovered the evidence and earned <strong>+{selectedCase.xpReward} XP</strong> and the <strong>&apos;{selectedCase.badgeName}&apos;</strong> badge.
                        </p>
                        {(() => {
                          const currIdx = caseMissions.findIndex((c) => c.id === selectedCase.id);
                          const nextCase =
                            caseMissions.find((c, i) => i > currIdx && !completedCases[c.id]) ||
                            caseMissions.find((c) => !completedCases[c.id]) ||
                            caseMissions[(currIdx + 1) % caseMissions.length];
                          if (nextCase && nextCase.id !== selectedCase.id) {
                            return (
                              <Button
                                size="sm"
                                type="button"
                                onClick={() => {
                                  setSelectedCase(nextCase);
                                  setTerminalHistory([]);
                                  setFlagFeedback(null);
                                  setUserFlagInput("");
                                }}
                                className="w-full h-8 mt-1 rounded-lg bg-[#002D62] hover:bg-[#001F44] text-[#C5A059] font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                              >
                                <span>Continue to Next Case: {nextCase.caseCode} &mdash; {nextCase.title.split(":")[0]}</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                              </Button>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    ) : (
                      <>
                        {/* Auto-fill banner if flag was found in terminal output */}
                        {discoveredFlag && (
                          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-2 animate-in fade-in">
                            <div className="flex items-center justify-between gap-1.5 min-w-0">
                              <span className="flex items-center gap-1.5 font-bold text-amber-950 truncate">
                                <Sparkles className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                                <span>Evidence Key Found:</span>
                              </span>
                              <code className="font-mono text-[11px] font-bold text-[#002D62] bg-white px-2 py-0.5 rounded border border-amber-200 truncate max-w-[200px]">
                                {discoveredFlag}
                              </code>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => setUserFlagInput(discoveredFlag)}
                                variant="outline"
                                className="flex-1 h-7 text-[11px] font-semibold border-amber-300 bg-white hover:bg-amber-100 text-amber-900 rounded-lg cursor-pointer"
                              >
                                Auto-Fill Input
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => {
                                  setUserFlagInput(discoveredFlag);
                                  if (normalizeAnswer(discoveredFlag) === normalizeAnswer(selectedCase.flagSolution)) {
                                    const already = completedCases[selectedCase.id];
                                    handleSuccessFlag(selectedCase);
                                    setFlagFeedback({
                                      success: true,
                                      message: already
                                        ? "Correct! You already solved this case — no extra XP this time."
                                        : `Case solved! You earned +${selectedCase.xpReward} XP and unlocked '${selectedCase.badgeName}' badge.`
                                    });
                                  } else {
                                    setFlagFeedback({
                                      success: false,
                                      message: "The answer code doesn't match the required solution for this case yet. Check the terminal results and try again."
                                    });
                                  }
                                }}
                                className="flex-1 h-7 text-[11px] font-bold bg-[#002D62] hover:bg-[#001F44] text-[#C5A059] rounded-lg cursor-pointer shadow-2xs"
                              >
                                Submit Proof &rarr;
                              </Button>
                            </div>
                          </div>
                        )}

                        <form onSubmit={handleFlagSubmitDirect} className="space-y-1.5">
                          <input
                            type="text"
                            value={userFlagInput}
                            onChange={(e) => setUserFlagInput(e.target.value)}
                            placeholder={selectedCase.flagHint || "FLAG{...}"}
                            className="w-full text-xs font-mono p-2.5 rounded-xl border focus:outline-none bg-slate-50 border-slate-300 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#002D62]"
                          />
                          <Button
                            type="submit"
                            className="w-full h-8 text-xs font-bold rounded-xl shadow-2xs bg-[#002D62] hover:bg-[#001F44] text-[#C5A059] cursor-pointer"
                          >
                            Verify & Submit Proof &rarr;
                          </Button>
                        </form>
                      </>
                    )}

                    {flagFeedback && (
                      <div
                        className={`p-2.5 rounded-xl text-xs border animate-in fade-in ${
                          flagFeedback.success
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                            : "bg-red-50 border-red-200 text-red-800"
                        }`}
                      >
                        {flagFeedback.message}
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            );

            const terminal = (
              <KaliTerminalWindow
                title={`investigator@kali: /evidence/${selectedCase.id}`}
                path={`/evidence/${selectedCase.id}`}
                history={terminalHistory}
                inputValue={commandInput}
                onInputChange={setCommandInput}
                onKeyDown={handleCaseKeyDown}
                onSubmit={handleCaseCommandSubmit}
                viewportRef={terminalViewportRef}
                inputRef={inputRef}
                minHeight="600px"
                height="640px"
                onClear={() => setTerminalHistory([])}
                onReset={() => {
                  setTerminalHistory([]);
                  setFlagFeedback(null);
                }}
                onCopyLogs={() => {
                  const text = terminalHistory.map((l) => l.text || l.command || "").join("\n");
                  navigator.clipboard?.writeText(text);
                }}
                onRunCommand={(cmd) => {
                  setCommandInput(cmd);
                  inputRef.current?.focus();
                }}
                isFullScreen={isFullScreen}
                setIsFullScreen={setIsFullScreen}
                sessionCode={sessionCode}
              />
            );

            if (cliPosition === "left") {
              return (
                <div
                  className={`grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch ${
                    isFullScreen ? "flex-1 min-h-0 overflow-hidden" : ""
                  }`}
                >
                  <div className="lg:col-span-8 h-full min-h-0">{terminal}</div>
                  <div
                    className={`lg:col-span-4 h-full ${
                      isFullScreen ? "overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-300" : ""
                    }`}
                  >
                    {dossier}
                  </div>
                </div>
              );
            }

            if (cliPosition === "stacked" && !isFullScreen) {
              return (
                <div className="space-y-3">
                  {dossier}
                  {terminal}
                </div>
              );
            }

            // Default: cliPosition === "right" or in fullscreen (Dossier Left, Terminal Right)
            return (
              <div
                className={`grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch ${
                  isFullScreen ? "flex-1 min-h-0 overflow-hidden" : ""
                }`}
              >
                <div
                  className={`lg:col-span-4 h-full ${
                    isFullScreen ? "overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-300" : ""
                  }`}
                >
                  {dossier}
                </div>
                <div className="lg:col-span-8 h-full min-h-0">{terminal}</div>
              </div>
            );
          })()}
        </div>
      )}

      {/* =========================================================================
          VIEW B: OPEN FORENSIC PLAYGROUND TERMINAL (MINIMAL & EASY TO USE)
         ========================================================================= */}
      {sandboxMode === "playground" && (
        <div className={`space-y-2.5 ${isFullScreen ? "flex-1 min-h-0 flex flex-col overflow-hidden" : ""}`}>
          {/* Horizontal Quick-Click Command Pills */}
          <div className="p-2 rounded-xl border flex items-center gap-1.5 overflow-x-auto text-[11px] shrink-0 transition-all bg-white border-slate-200 shadow-2xs">
            <span className="font-mono text-[10px] shrink-0 font-bold ml-1 text-slate-400">
              Quick Run:
            </span>
            {TOP_QUICK_PILLS.map((pill, i) => (
              <button
                key={i}
                onClick={() => runDirectPlaygroundCmd(pill.cmd)}
                className="font-mono text-[10px] px-2.5 py-1 rounded-lg border transition-colors shrink-0 bg-slate-50 hover:bg-[#002D62] text-slate-700 hover:text-white border-slate-200"
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Main 2-Column Playground Layout */}
          {(() => {
            const evidencePanel = (
              <div className="space-y-2.5">
                {/* Evidence Drawer Card */}
                <Card className="p-3 rounded-xl space-y-2.5 transition-all bg-white border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between border-b pb-1.5 border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Folder className="h-3.5 w-3.5 text-[#C5A059]" />
                      <span className="text-xs font-bold font-serif text-[#002D62]">
                        Mounted Evidence
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-600 font-bold">/evidence</span>
                  </div>

                  {/* Clean List of 5 Files */}
                  <div className="space-y-1">
                    {CORE_EVIDENCE_FILES.map((file) => {
                      const isSelected = selectedEvidenceFile.path === file.path;
                      return (
                        <div
                          key={file.path}
                          onClick={() => setSelectedEvidenceFile(file)}
                          className={`p-2 rounded-lg border cursor-pointer transition-all ${
                            isSelected
                              ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                              : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold truncate flex items-center gap-1.5">
                              {getEvidenceFileIcon(file.name, "h-3.5 w-3.5 shrink-0")}
                              <span>{file.name}</span>
                            </span>
                            <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${file.tagColor}`}>
                              {file.size}
                            </span>
                          </div>
                          <p
                            className={`text-[10px] mt-0.5 leading-tight truncate ${
                              isSelected ? "text-slate-300" : "text-slate-500"
                            }`}
                          >
                            {file.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Instant Action Pills for Selected File */}
                  {selectedEvidenceFile && (
                    <div className="pt-1 border-t flex items-center gap-1.5 flex-wrap border-slate-100">
                      <span className="text-[10px] text-slate-400 font-mono">Run on file:</span>
                      <Button
                        size="sm"
                        onClick={() => runDirectPlaygroundCmd(`cat ${selectedEvidenceFile.path}`)}
                        className="h-6 text-[10px] px-2 py-0 font-mono bg-[#002D62] hover:bg-[#001F44] text-white"
                      >
                        cat
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => runDirectPlaygroundCmd(`sha256sum ${selectedEvidenceFile.path}`)}
                        className="h-6 text-[10px] px-2 py-0 font-mono bg-slate-800 hover:bg-black text-[#C5A059]"
                      >
                        sha256
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => runDirectPlaygroundCmd(`file ${selectedEvidenceFile.path}`)}
                        className="h-6 text-[10px] px-2 py-0 font-mono bg-slate-200 hover:bg-slate-300 text-slate-800"
                      >
                        file
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => runDirectPlaygroundCmd(`strings ${selectedEvidenceFile.path}`)}
                        className="h-6 text-[10px] px-2 py-0 font-mono bg-slate-200 hover:bg-slate-300 text-slate-800"
                      >
                        strings
                      </Button>
                    </div>
                  )}
                </Card>

                {/* Categorized Tools Card */}
                <Card className="p-3 rounded-xl space-y-2 transition-all bg-white border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between border-b pb-1.5 border-slate-100">
                    <span className="text-xs font-bold font-serif text-[#002D62]">
                      Quick Toolset
                    </span>
                    <span className="text-[10px] text-cyan-600 font-mono font-bold">1-Click</span>
                  </div>

                  {/* Category Selector Tabs */}
                  <div className="flex items-center gap-1 p-0.5 rounded-lg text-[10px] bg-slate-100 border border-slate-200">
                    {[
                      { key: "memory", label: "Memory", icon: Cpu },
                      { key: "network", label: "Network", icon: Layers },
                      { key: "registry", label: "Registry", icon: HardDrive },
                      { key: "laws", label: "Statutes", icon: Scale }
                    ].map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        onClick={() => setActiveToolTab(key)}
                        className={`flex-1 py-1 px-1.5 rounded flex items-center justify-center gap-1 text-center font-medium transition-colors ${
                          activeToolTab === key
                            ? "bg-white text-[#002D62] font-bold shadow-2xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        <Icon className={`h-3 w-3 shrink-0 ${activeToolTab === key ? "text-[#002D62]" : "text-slate-400"}`} />
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Tools in Active Category */}
                  <div className="space-y-1">
                    {QUICK_TOOL_CATEGORIES[activeToolTab]?.tools.map((tool, idx) => (
                      <button
                        key={idx}
                        onClick={() => runDirectPlaygroundCmd(tool.cmd)}
                        className="w-full text-left p-1.5 rounded-lg border flex items-center justify-between transition-colors group bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800"
                      >
                        <div>
                          <div className="text-[11px] font-bold font-mono group-hover:underline text-[#002D62]">
                            {tool.label}
                          </div>
                          <div className="text-[9px] text-slate-500">
                            {tool.hint}
                          </div>
                        </div>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded font-bold text-[#C5A059] bg-[#002D62]">
                          Run &crarr;
                        </span>
                      </button>
                    ))}
                  </div>
                </Card>
              </div>
            );

            const terminalPanel = (
              <KaliTerminalWindow
                title={`investigator@kali: ${formatPromptPath(currentPath)}`}
                path={formatPromptPath(currentPath)}
                history={playgroundHistory}
                inputValue={playgroundInput}
                onInputChange={setPlaygroundInput}
                onKeyDown={handlePlaygroundKeyDown}
                onSubmit={handlePlaygroundSubmit}
                viewportRef={playgroundViewportRef}
                inputRef={playgroundInputRef}
                minHeight="600px"
                height="640px"
                onClear={() => setPlaygroundHistory([])}
                onReset={() => {
                  setVfs(INITIAL_VFS);
                  setPlaygroundHistory([]);
                }}
                onCopyLogs={handleCopyPlaygroundLogs}
                onRunCommand={(cmd) => runDirectPlaygroundCmd(cmd)}
                isFullScreen={isFullScreen}
                setIsFullScreen={setIsFullScreen}
                sessionCode={sessionCode}
              />
            );

            if (cliPosition === "left") {
              return (
                <div
                  className={`grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch ${
                    isFullScreen ? "flex-1 min-h-0 overflow-hidden" : ""
                  }`}
                >
                  <div className="lg:col-span-8 h-full min-h-0">{terminalPanel}</div>
                  <div
                    className={`lg:col-span-4 h-full ${
                      isFullScreen ? "overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-300" : ""
                    }`}
                  >
                    {evidencePanel}
                  </div>
                </div>
              );
            }

            if (cliPosition === "stacked" && !isFullScreen) {
              return (
                <div className="space-y-3">
                  {evidencePanel}
                  {terminalPanel}
                </div>
              );
            }

            // Default: cliPosition === "right" or in fullscreen (Evidence Left, Terminal Right)
            return (
              <div
                className={`grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch ${
                  isFullScreen ? "flex-1 min-h-0 overflow-hidden" : ""
                }`}
              >
                <div
                  className={`lg:col-span-4 h-full ${
                    isFullScreen ? "overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-300" : ""
                  }`}
                >
                  {evidencePanel}
                </div>
                <div className="lg:col-span-8 h-full min-h-0">{terminalPanel}</div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
