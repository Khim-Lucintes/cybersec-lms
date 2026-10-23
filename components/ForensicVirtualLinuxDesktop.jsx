"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Terminal as TerminalIcon,
  Folder,
  FileText,
  Search,
  Scale,
  Cpu,
  Layers,
  Shield,
  Minimize2,
  Maximize2,
  X,
  Minus,
  Square,
  RotateCcw,
  Clock,
  Wifi,
  Volume2,
  Battery,
  Flame,
  CheckCircle2,
  Check,
  Award,
  Sparkles,
  ExternalLink,
  ChevronRight,
  HardDrive,
  Copy,
  Trash2,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  GraduationCap,
  Play,
  Monitor,
  Activity,
  Radio,
  Skull,
  Eye,
  Key,
  Database,
  Lock,
  Unlock,
  RefreshCw,
  Info,
  Sliders,
  Settings,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  INITIAL_VFS,
  resolvePath,
  formatPromptPath,
  executePlaygroundCommand
} from "@/lib/virtualForensicFs";
import { LINUX_CADET_LEVELS, FORENSIC_CASES, CORE_EVIDENCE_FILES } from "./ForensicTerminalSandbox";

// Authentic Kali Linux Dragon Emblem SVG
function KaliDragonEmblem({ className = "h-5 w-5", color = "#00e5ff" }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <radialGradient id="kaliEmblemGlow" cx="50" cy="50" r="50" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00e5ff" stopOpacity="0.7" />
          <stop offset="0.7" stopColor="#0284c7" stopOpacity="0.3" />
          <stop offset="1" stopColor="#0369a1" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="kaliDragonGrad" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor={color} />
          <stop offset="1" stopColor="#0284c7" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill="url(#kaliEmblemGlow)" />
      {/* Kali Dragon Silhouette */}
      <path
        d="M26 36C29 28 36 21 44 18C41 23 41 29 44 34C40 33 34 35 30 38C28 37 27 36 26 36Z"
        fill="url(#kaliDragonGrad)"
      />
      <path
        d="M48 16C58 13 70 16 78 23C73 25 68 29 65 34C68 31 73 29 78 30C83 31 87 35 89 40C83 40 78 43 75 48C79 46 84 46 88 49C90 51 91 55 90 58C84 57 78 60 76 66C80 64 85 65 88 68C85 75 79 81 72 84C66 87 59 87 53 85C60 81 65 74 65 66C65 58 59 52 52 50C43 48 35 53 32 61C30 66 31 72 34 77C27 72 23 63 23 54C23 44 29 35 37 30C36 34 38 38 41 41C37 38 34 32 35 27C36 22 41 18 48 16Z"
        fill="url(#kaliDragonGrad)"
      />
      <path
        d="M52 54C56 55 59 59 59 64C59 69 55 74 50 75C46 75 42 72 40 68C38 64 40 59 44 56C46 55 49 54 52 54Z"
        fill="#070c14"
      />
      <circle cx="68" cy="28" r="2.5" fill="#ffffff" />
    </svg>
  );
}

// Sample Wireshark Packets Dissected from Evidence
const SAMPLE_WIRESHARK_PACKETS = [
  {
    no: 1,
    time: "0.000000",
    src: "192.168.1.105",
    dst: "1.1.1.1",
    proto: "DNS",
    length: 74,
    info: "Standard query 0x12a4 A secure-urios-edu-ph.serveo.net",
    color: "bg-cyan-950/40 text-cyan-300 border-cyan-800/40",
    details: {
      frame: "Frame 1: 74 bytes on wire (592 bits), 74 bytes captured",
      eth: "Ethernet II, Src: Micro-Star_1a:bc:44, Dst: Router_3b:fa:10",
      ip: "Internet Protocol Version 4, Src: 192.168.1.105, Dst: 1.1.1.1",
      protoLayer: "User Datagram Protocol, Src Port: 53210, Dst Port: 53",
      payload: "Domain Name System (query): secure-urios-edu-ph.serveo.net: type A, class IN"
    },
    hexDump: "0000   00 c0 ca 98 12 34 08 00  27 1a bc 44 08 00 45 00   .....4..'..D..E.\n0010   00 3c 1a 42 00 00 40 11  92 a1 c0 a8 01 69 01 01   .<.B..@......i..\n0020   01 01 cf da 00 35 00 28  e2 10 12 a4 01 00 00 01   .....5.(........\n0030   00 00 00 00 00 00 11 73  65 63 75 72 65 2d 75 72   .......secure-ur"
  },
  {
    no: 2,
    time: "0.021040",
    src: "1.1.1.1",
    dst: "192.168.1.105",
    proto: "DNS",
    length: 90,
    info: "Standard query response 0x12a4 A secure-urios-edu-ph.serveo.net A 172.67.142.12",
    color: "bg-cyan-950/40 text-cyan-300 border-cyan-800/40",
    details: {
      frame: "Frame 2: 90 bytes on wire (720 bits), 90 bytes captured",
      eth: "Ethernet II, Src: Router_3b:fa:10, Dst: Micro-Star_1a:bc:44",
      ip: "Internet Protocol Version 4, Src: 1.1.1.1, Dst: 192.168.1.105",
      protoLayer: "User Datagram Protocol, Src Port: 53, Dst Port: 53210",
      payload: "Answers: secure-urios-edu-ph.serveo.net: type A, class IN, addr 172.67.142.12"
    },
    hexDump: "0000   08 00 27 1a bc 44 00 c0  ca 98 12 34 08 00 45 00   ..'..D.....4..E.\n0010   00 4c 00 00 40 00 38 11  bd a8 01 01 01 01 c0 a8   .L..@.8.........\n0020   01 69 00 35 cf da 00 38  12 90 12 a4 81 80 00 01   .i.5...8........\n0030   00 01 00 00 00 00 11 73  65 63 75 72 65 2d 75 72   .......secure-ur"
  },
  {
    no: 3,
    time: "0.034010",
    src: "192.168.1.105",
    dst: "172.67.142.12",
    proto: "TCP",
    length: 66,
    info: "49821 → 80 [SYN] Seq=0 Win=64240 Len=0 MSS=1460 WS=256",
    color: "bg-purple-950/40 text-purple-300 border-purple-800/40",
    details: {
      frame: "Frame 3: 66 bytes on wire (528 bits), 66 bytes captured",
      eth: "Ethernet II, Src: Micro-Star_1a:bc:44, Dst: Router_3b:fa:10",
      ip: "Internet Protocol Version 4, Src: 192.168.1.105, Dst: 172.67.142.12",
      protoLayer: "Transmission Control Protocol, Src Port: 49821, Dst Port: 80, Seq: 0, Flags: [SYN]",
      payload: "TCP Options: (MSS: 1460, NOP, WS: 256, SACK Permitted, Timestamps)"
    },
    hexDump: "0000   00 c0 ca 98 12 34 08 00  27 1a bc 44 08 00 45 00   .....4..'..D..E.\n0010   00 34 1a 43 40 00 40 06  51 da c0 a8 01 69 ac 43   .4.C@.@.Q....i.C\n0020   8e 0c c2 9d 00 50 a1 90  12 40 00 00 00 00 80 02   .....P...@......\n0030   fa f0 e2 42 00 00 02 04  05 b4 01 03 03 08 01 01   ...B............"
  },
  {
    no: 4,
    time: "0.052020",
    src: "172.67.142.12",
    dst: "192.168.1.105",
    proto: "TCP",
    length: 66,
    info: "80 → 49821 [SYN, ACK] Seq=0 Ack=1 Win=65535 Len=0 MSS=1460",
    color: "bg-purple-950/40 text-purple-300 border-purple-800/40",
    details: {
      frame: "Frame 4: 66 bytes on wire (528 bits), 66 bytes captured",
      eth: "Ethernet II, Src: Router_3b:fa:10, Dst: Micro-Star_1a:bc:44",
      ip: "Internet Protocol Version 4, Src: 172.67.142.12, Dst: 192.168.1.105",
      protoLayer: "Transmission Control Protocol, Src Port: 80, Dst Port: 49821, Flags: [SYN, ACK]",
      payload: "TCP Handshake Step 2: Connection acknowledged by remote spoofed portal"
    },
    hexDump: "0000   08 00 27 1a bc 44 00 c0  ca 98 12 34 08 00 45 00   ..'..D.....4..E.\n0010   00 34 89 12 40 00 38 06  e2 0b ac 43 8e 0c c0 a8   .4..@.8....C....\n0020   01 69 00 50 c2 9d e1 90  45 10 a1 90 12 41 80 12   .i.P....E....A..\n0030   ff ff 91 10 00 00 02 04  05 b4 01 01 04 02 01 03   ................"
  },
  {
    no: 5,
    time: "0.052100",
    src: "192.168.1.105",
    dst: "172.67.142.12",
    proto: "HTTP",
    length: 248,
    info: "POST /auth/login HTTP/1.1 (application/x-www-form-urlencoded) [CLEARTEXT CREDENTIALS!]",
    color: "bg-emerald-950/50 text-emerald-300 border-emerald-700/60 font-semibold",
    details: {
      frame: "Frame 5: 248 bytes on wire (1984 bits), 248 bytes captured",
      eth: "Ethernet II, Src: Micro-Star_1a:bc:44, Dst: Router_3b:fa:10",
      ip: "Internet Protocol Version 4, Src: 192.168.1.105, Dst: 172.67.142.12",
      protoLayer: "Transmission Control Protocol, Src Port: 49821, Dst Port: 80, Seq: 1, Ack: 1",
      payload: "Hypertext Transfer Protocol (POST /auth/login HTTP/1.1)\nUser-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)\nContent-Type: application/x-www-form-urlencoded\n\nEXFILTRATED FORM DATA:\nusername=admin\npassword=AlphaCriminology2026!#\nclient_token=9281"
    },
    hexDump: "0000   00 c0 ca 98 12 34 08 00  27 1a bc 44 08 00 45 00   .....4..'..D..E.\n0010   00 f8 1a 44 40 00 40 06  51 15 c0 a8 01 69 ac 43   ...D@.@.Q....i.C\n0020   8e 0c c2 9d 00 50 a1 90  12 41 e1 90 45 11 50 18   .....P...A..E.P.\n0030   01 f5 b4 10 00 00 50 4f  53 54 20 2f 61 75 74 68   ......POST /auth\n0040   2f 6c 6f 67 69 6e 20 48  54 54 50 2f 31 2e 31 0d   /login HTTP/1.1.\n0050   0a 48 6f 73 74 3a 20 73  65 63 75 72 65 2d 75 72   .Host: secure-ur\n0060   69 6f 73 2e 65 64 75 0d  0a 0d 0a 75 73 65 72 3d   ios.edu....user=\n0070   61 64 6d 69 6e 26 70 61  73 73 77 6f 72 64 3d 41   admin&password=A\n0080   6c 70 68 61 43 72 69 6d  69 6e 6f 6c 6f 67 79 21   lphaCriminology!"
  },
  {
    no: 6,
    time: "0.089410",
    src: "172.67.142.12",
    dst: "192.168.1.105",
    proto: "HTTP",
    length: 198,
    info: "HTTP/1.1 302 Found (text/html) -> Location: /portal/compromised.php",
    color: "bg-emerald-950/40 text-emerald-400 border-emerald-800/40",
    details: {
      frame: "Frame 6: 198 bytes on wire (1584 bits), 198 bytes captured",
      eth: "Ethernet II, Src: Router_3b:fa:10, Dst: Micro-Star_1a:bc:44",
      ip: "Internet Protocol Version 4, Src: 172.67.142.12, Dst: 192.168.1.105",
      protoLayer: "Transmission Control Protocol, Src Port: 80, Dst Port: 49821, Flags: [PSH, ACK]",
      payload: "HTTP/1.1 302 Found\nServer: nginx/1.18.0 (Spoofed)\nLocation: /portal/dashboard.php?session=compromised\nSet-Cookie: PHPSESSID=9a8b7c6d5e4f3a2b1c"
    },
    hexDump: "0000   08 00 27 1a bc 44 00 c0  ca 98 12 34 08 00 45 00   ..'..D.....4..E.\n0010   00 c6 89 13 40 00 38 06  e1 78 ac 43 8e 0c c0 a8   ....@.8..x.C....\n0020   01 69 00 50 c2 9d e1 90  45 11 a1 90 13 39 50 18   .i.P....E....9P.\n0030   01 f5 91 b2 00 00 48 54  54 50 2f 31 2e 31 20 33   ......HTTP/1.1 3\n0040   30 32 20 46 6f 75 6e 64  0d 0a 4c 6f 63 61 74 69   02 Found..Locati"
  },
  {
    no: 7,
    time: "1.412090",
    src: "192.168.10.45",
    dst: "192.168.10.144",
    proto: "TCP/C2",
    length: 512,
    info: "49712 → 8443 [PSH, ACK] Cobalt Strike Malleable C2 Beacon Heartbeat [ALERT: RA 10175 Violation]",
    color: "bg-red-950/60 text-red-300 border-red-700/60 font-semibold",
    details: {
      frame: "Frame 7: 512 bytes on wire (4096 bits), 512 bytes captured",
      eth: "Ethernet II, Src: Micro-Star_1a:bc:44, Dst: Oracle_1a:bc:44",
      ip: "Internet Protocol Version 4, Src: 192.168.10.45, Dst: 192.168.10.144",
      protoLayer: "Transmission Control Protocol, Src Port: 49712, Dst Port: 8443 (C2 Listener)",
      payload: "MALWARE BEACON DETECTED:\nProfile: Caraga-Syndicate-Malleable-C2\nPayload Hash: 7f83b1657ff1fc53b92dc18148a1d65d\nBeacon Interval: 30s Jitter: 15%"
    },
    hexDump: "0000   08 00 27 1a bc 44 00 c0  ca 98 12 34 08 00 45 00   ..'..D.....4..E.\n0010   02 00 1a 45 40 00 40 06  50 09 c0 a8 0a 2d c0 a8   ...E@.@.P....-..\n0020   0a 90 c2 30 20 fb a1 90  14 00 e1 90 48 20 50 18   ...0 .......H P.\n0030   02 00 89 a1 00 00 17 03  03 01 e8 00 00 00 00 00   ................"
  }
];

export default function ForensicVirtualLinuxDesktop({
  onAwardXP,
  onAwardBadge,
  initialApp = "terminal"
}) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [selectedMenuCategory, setSelectedMenuCategory] = useState("01");
  const [activeWorkspace, setActiveWorkspace] = useState(1);
  const [contextMenu, setContextMenu] = useState({ open: false, x: 0, y: 0 });
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [isRootUser, setIsRootUser] = useState(false);

  // Window Manager State - Kali Linux Desktop Apps
  const [activeWindowId, setActiveWindowId] = useState(initialApp);
  const [highestZ, setHighestZ] = useState(20);
  const [windows, setWindows] = useState({
    terminal: {
      id: "terminal",
      title: "kali@kali-fsuu: ~",
      icon: TerminalIcon,
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      zIndex: 15,
      x: 140,
      y: 20
    },
    files: {
      id: "files",
      title: "Thunar File Manager",
      icon: Folder,
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      zIndex: 14,
      x: 80,
      y: 40
    },
    wireshark: {
      id: "wireshark",
      title: "Wireshark · Network Packet Dissector",
      icon: Activity,
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      zIndex: 13,
      x: 100,
      y: 30
    },
    inspector: {
      id: "inspector",
      title: "Autopsy 4 Digital Forensics Platform",
      icon: Search,
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      zIndex: 12,
      x: 120,
      y: 50
    },
    metasploit: {
      id: "metasploit",
      title: "Metasploit Framework 6 (msfconsole)",
      icon: Skull,
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      zIndex: 11,
      x: 160,
      y: 35
    },
    notes: {
      id: "notes",
      title: "Mousepad - Contemporaneous Case Docket",
      icon: FileText,
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      zIndex: 10,
      x: 180,
      y: 60
    },
    statutes: {
      id: "statutes",
      title: "Philippine Cyber Statutes Compendium",
      icon: Scale,
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      zIndex: 9,
      x: 150,
      y: 45
    },
    monitor: {
      id: "monitor",
      title: "Task Manager (Htop Process Viewer)",
      icon: Cpu,
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      zIndex: 8,
      x: 200,
      y: 70
    }
  });

  // Desktop Virtual Filesystem & Thunar State
  const [vfs, setVfs] = useState(INITIAL_VFS);
  const [fileManagerPath, setFileManagerPath] = useState("/evidence");
  const [selectedFileItem, setSelectedFileItem] = useState(null);

  // Wireshark State
  const [wiresharkFilter, setWiresharkFilter] = useState("");
  const [selectedPacket, setSelectedPacket] = useState(SAMPLE_WIRESHARK_PACKETS[4]); // Default to credential POST

  // Autopsy Inspector State
  const [inspectorSelectedEvidence, setInspectorSelectedEvidence] = useState(CORE_EVIDENCE_FILES[0]);
  const [verifiedHashes, setVerifiedHashes] = useState({});

  // Metasploit Console State
  const [msfInput, setMsfInput] = useState("");
  const [msfHistory, setMsfHistory] = useState([
    {
      type: "system",
      text: `                _---------.
             .' #######   ;.'
  Metasploit   / _____  #     ;
             /  |     #       ;
            /   |__   #       ;
           /    |     #       ;
          /_____|     #       ;
                      #       ;
                      #       ;
                      #.......;

=[ metasploit v6.4.12-dev (Kali Linux 2026.1)                    ]
+ -- --=[ 2410 exploits - 1248 auxiliary - 428 post            ]
+ -- --=[ 1465 payloads - 46 encoders - 13 nops                ]
+ -- --=[ Free Software Foundation, Inc. / Rapid7 LLC           ]

msf6 > Session attached to target: 192.168.10.144 (Caraga Syndicate C2)
msf6 > Type 'help' or execute forensic triage modules.`
    }
  ]);

  // Mousepad Notes State
  const [caseNotesContent, setCaseNotesContent] = useState(
    `# FSUU BS CRIMINOLOGY - CONTEMPORANEOUS FORENSIC DOCKET
Case Code: CDI409-PNP-2026-0812
Investigator: kali@kali-fsuu (PNP Anti-Cybercrime Group / FSUU Lab)
Station: Kali GNU/Linux Rolling 2026.1 (Kernel 6.8.0-kali1-amd64)

[EXHIBIT CHAIN OF CUSTODY LOG]:
- Exhibit A: usb_image.dd (4.2 GB SanDisk Ultra USB 3.0)
- Exhibit B: memdump.raw (8.0 GB Physical RAM Dump)
- Exhibit C: suspect_traffic.pcap (Wi-Fi Pineapple Rogue Tap)
- Exhibit D: ransom_note.txt (AES-256 Extortion Demand Note)

[CONTEMPORANEOUS EXAMINATION FINDINGS]:
1. RFC 3227 Order of Volatility: RAM captured prior to storage acquisition.
2. A.M. No. 17-11-03-SC (Rule on Cybercrime Warrants) compliance verified.
3. Wireshark analysis confirmed plain-text HTTP credential leak at /auth/login.
4. SHA-256 Court Integrity Hash: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069.`
  );

  // Terminal Window Specific State
  const [terminalTab, setTerminalTab] = useState("cadet"); // 'cadet' | 'missions' | 'playground' | 'msf'
  const [cadetLevelIndex, setCadetLevelIndex] = useState(0);
  const [completedCadetLevels, setCompletedCadetLevels] = useState({});
  const [cadetHistory, setCadetHistory] = useState([]);
  const [cadetInput, setCadetInput] = useState("");
  const [cadetPath, setCadetPath] = useState("/home/investigator");
  const cadetViewportRef = useRef(null);
  const cadetInputRef = useRef(null);

  // Playground Terminal State
  const [playgroundCurrentPath, setPlaygroundCurrentPath] = useState("/home/investigator");
  const [playgroundInput, setPlaygroundInput] = useState("");
  const [playgroundHistory, setPlaygroundHistory] = useState([]);
  const playgroundViewportRef = useRef(null);
  const playgroundInputRef = useRef(null);

  // Case Missions State
  const [selectedCase, setSelectedCase] = useState(FORENSIC_CASES[0]);
  const [caseInput, setCaseInput] = useState("");
  const [caseHistory, setCaseHistory] = useState([]);
  const [caseFlagInput, setCaseFlagInput] = useState("");
  const [caseFlagFeedback, setCaseFlagFeedback] = useState(null);
  const [completedCases, setCompletedCases] = useState({});
  const caseViewportRef = useRef(null);
  const caseInputRef = useRef(null);

  // Live XFCE Panel Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }) +
          " " +
          now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Initialize Cadet and Terminal Session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCadet = localStorage.getItem("cdi409_cadet_completed_levels");
      if (savedCadet) {
        try {
          setCompletedCadetLevels(JSON.parse(savedCadet));
        } catch (e) {}
      }
      const savedNotes = localStorage.getItem("cdi409_case_docket_notes");
      if (savedNotes) {
        setCaseNotesContent(savedNotes);
      }
    }

    setCadetHistory([
      {
        type: "system",
        text: `┌──(kali㉿kali-fsuu)-[~]
└─$ KALI LINUX 2026.1 ROLLING (OFFSEC EDITION)
Host: kali-fsuu | Kernel: 6.8.0-kali1-amd64 | Desktop: XFCE 4.18
"The Quieter You Become, The More You Are Able To Hear"
================================================================================
🎓 STUDENT ACADEMY: Master the 8 Linux levels below or explore Kali GUI tools!`
      },
      {
        type: "info",
        text: "💡 Tip: Read the mission goal and type commands at the Kali prompt to practice."
      }
    ]);

    setPlaygroundHistory([
      {
        type: "system",
        text: `┌──(kali㉿kali-fsuu)-[~]
└─$ neofetch
       ..............                  kali@kali-fsuu
            ..,;:cccccccccc:;..        --------------
        .,cccccccccccccccccccccc:..    OS: Kali GNU/Linux Rolling x86_64
      .:cccccccccccccccccccccccccccc:. Host: FSUU Forensic Cyber Lab
    .;ccccccccccccc;.:cccccccccccccccc;.Kernel: 6.8.0-kali1-amd64
   .:ccccccccccccc;   .ccccccccccccccccc:Uptime: 2 hours, 48 mins
  .:ccccccccccccc;     .ccccccccccccccccc:.DE: XFCE 4.18 (OffSec Edition)
  .cccccccccccccc;     .cccccccccccccccccc.Shell: zsh 5.9 (Kali Theme)
  .cccccccccccccc;     .cccccccccccccccccc.Arsenal: Nmap, Wireshark, Volatility, John
================================================================================
Type 'help' for available Kali forensic utilities or launch apps from the panel.`
      }
    ]);

    initCaseMission(selectedCase);
  }, []);

  const initCaseMission = (c) => {
    setCaseHistory([
      {
        type: "system",
        text: `┌──(kali㉿kali-fsuu)-[~/cases/${c.caseCode}]
└─$ Case Docket: ${c.title}
Statute: ${c.statute}
Type 'tasks' to view objectives, or examine evidence in Thunar / Wireshark.`
      }
    ]);
  };

  // Scroll handler for active terminal mode
  useEffect(() => {
    if (terminalTab === "cadet" && cadetViewportRef.current) {
      cadetViewportRef.current.scrollTop = cadetViewportRef.current.scrollHeight;
    } else if (terminalTab === "playground" && playgroundViewportRef.current) {
      playgroundViewportRef.current.scrollTop = playgroundViewportRef.current.scrollHeight;
    } else if (terminalTab === "missions" && caseViewportRef.current) {
      caseViewportRef.current.scrollTop = caseViewportRef.current.scrollHeight;
    }
  }, [cadetHistory, playgroundHistory, caseHistory, terminalTab]);

  // Window Management Functions
  const focusWindow = (id) => {
    const nextZ = highestZ + 1;
    setHighestZ(nextZ);
    setActiveWindowId(id);
    setWindows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        isOpen: true,
        isMinimized: false,
        zIndex: nextZ
      }
    }));
  };

  const openApp = (id) => {
    setStartMenuOpen(false);
    setContextMenu({ open: false, x: 0, y: 0 });
    focusWindow(id);
  };

  const closeWindow = (id) => {
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], isOpen: false, isMinimized: false }
    }));
  };

  const minimizeWindow = (id) => {
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], isMinimized: true }
    }));
  };

  const toggleMaximizeWindow = (id) => {
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], isMaximized: !prev[id].isMaximized }
    }));
  };

  // Terminal Cadet Execution
  const runCadetCommand = (rawCmd) => {
    const userPrefix = isRootUser ? "root" : "kali";
    const promptChar = isRootUser ? "#" : "$";
    const promptText = `┌──(${userPrefix}㉿kali-fsuu)-[${formatPromptPath(cadetPath)}]\n└─${promptChar} ${rawCmd}`;
    const newOutput = [...cadetHistory, { type: "prompt", text: promptText }];

    const result = executePlaygroundCommand(rawCmd, cadetPath, setCadetPath, vfs, setVfs);
    if (result) {
      if (result.type === "clear") {
        setCadetHistory([{ type: "info", text: "Screen cleared." }]);
        setCadetInput("");
        return;
      }
      newOutput.push(result);
    }

    const currentLevel = LINUX_CADET_LEVELS[cadetLevelIndex];
    const isLevelMatch = currentLevel && currentLevel.acceptableCommands && (
      currentLevel.acceptableCommands.some((c) => rawCmd.toLowerCase().trim().startsWith(c.toLowerCase()) || rawCmd.toLowerCase().trim() === c.toLowerCase()) ||
      rawCmd.toLowerCase().trim() === (currentLevel.primaryCommand || "").toLowerCase()
    );
    if (isLevelMatch) {
      if (!completedCadetLevels[currentLevel.id]) {
        const updated = { ...completedCadetLevels, [currentLevel.id]: true };
        setCompletedCadetLevels(updated);
        if (typeof window !== "undefined") {
          localStorage.setItem("cdi409_cadet_completed_levels", JSON.stringify(updated));
        }
        if (onAwardXP) onAwardXP(currentLevel.xpReward);
        newOutput.push({
          type: "level-success",
          text: `🎉 LEVEL ${currentLevel.id} COMPLETE! Earned +${currentLevel.xpReward} XP: ${currentLevel.concept}`
        });

        if (currentLevel.id === 8 && onAwardBadge) {
          onAwardBadge("kali-student-master");
        }
      }

      if (cadetLevelIndex < LINUX_CADET_LEVELS.length - 1) {
        setCadetLevelIndex(cadetLevelIndex + 1);
      }
    }

    setCadetHistory(newOutput);
    setCadetInput("");
  };

  const handleCadetSubmit = (e) => {
    e.preventDefault();
    if (!cadetInput.trim()) return;
    runCadetCommand(cadetInput.trim());
  };

  // Playground Command Execution
  const runPlaygroundCommand = (rawCmd) => {
    const userPrefix = isRootUser ? "root" : "kali";
    const promptChar = isRootUser ? "#" : "$";
    const promptText = `┌──(${userPrefix}㉿kali-fsuu)-[${formatPromptPath(playgroundCurrentPath)}]\n└─${promptChar} ${rawCmd}`;
    const newOutput = [...playgroundHistory, { type: "prompt", text: promptText }];

    if (rawCmd === "sudo su" || rawCmd === "su" || rawCmd === "su -") {
      setIsRootUser(true);
      newOutput.push({
        type: "success",
        text: "Switched to root session. Elevated prompt '#' active. Full root privileges enabled."
      });
      setPlaygroundHistory(newOutput);
      setPlaygroundInput("");
      return;
    }

    if (rawCmd === "exit" && isRootUser) {
      setIsRootUser(false);
      newOutput.push({
        type: "info",
        text: "Exited root session. Returned to standard user 'kali'."
      });
      setPlaygroundHistory(newOutput);
      setPlaygroundInput("");
      return;
    }

    const result = executePlaygroundCommand(rawCmd, playgroundCurrentPath, setPlaygroundCurrentPath, vfs, setVfs);
    if (result) {
      if (result.type === "clear") {
        setPlaygroundHistory([{ type: "info", text: "Screen cleared." }]);
        setPlaygroundInput("");
        return;
      }
      newOutput.push(result);
    }

    setPlaygroundHistory(newOutput);
    setPlaygroundInput("");
  };

  const handlePlaygroundSubmit = (e) => {
    e.preventDefault();
    if (!playgroundInput.trim()) return;
    runPlaygroundCommand(playgroundInput.trim());
  };

  // Case Mission Execution
  const runCaseCommand = (rawCmd) => {
    const promptText = `┌──(kali㉿kali-fsuu)-[~/cases/${selectedCase.caseCode}]\n└─$ ${rawCmd}`;
    const newOutput = [...caseHistory, { type: "prompt", text: promptText }];

    if (rawCmd === "tasks") {
      newOutput.push({
        type: "output",
        text: `CASE OBJECTIVES [${selectedCase.caseCode}]:\n` +
          selectedCase.tasks.map((t, idx) => `  ${idx + 1}. ${t}`).join("\n")
      });
    } else {
      const result = executePlaygroundCommand(rawCmd, "/evidence", () => {}, vfs, setVfs);
      if (result) newOutput.push(result);
    }

    setCaseHistory(newOutput);
    setCaseInput("");
  };

  const handleCaseSubmit = (e) => {
    e.preventDefault();
    if (!caseInput.trim()) return;
    runCaseCommand(caseInput.trim());
  };

  // Metasploit Console Execution
  const handleMsfSubmit = (e) => {
    e.preventDefault();
    if (!msfInput.trim()) return;
    const cmd = msfInput.trim();
    const newHist = [...msfHistory, { type: "prompt", text: `msf6 > ${cmd}` }];

    if (cmd.startsWith("use ")) {
      newHist.push({
        type: "output",
        text: `[*] Using module: ${cmd.slice(4)}\nmsf6 ${cmd.slice(4)} >`
      });
    } else if (cmd === "show options") {
      newHist.push({
        type: "output",
        text: `Module options (${cmd}):\n  Name     Current Setting  Required  Description\n  ----     ---------------  --------  -----------\n  RHOSTS   192.168.10.144   yes       The target address\n  RPORT    8443             yes       The target port`
      });
    } else if (cmd === "run" || cmd === "exploit") {
      newHist.push({
        type: "success",
        text: `[*] Started reverse TCP handler on 192.168.10.45:4444\n[*] Transmitting forensic triage stage to 192.168.10.144...\n[+] Session 1 opened (192.168.10.45:4444 -> 192.168.10.144:49821)\n[+] Acquired target filesystem under RA 10175 WSCD Court Warrant.`
      });
    } else if (cmd === "help") {
      newHist.push({
        type: "output",
        text: `Core Commands:\n  use <module>        Select an exploit, scanner or auxiliary module\n  show options        Display active module options\n  set <key> <val>     Configure parameters (e.g. set RHOSTS 192.168.10.144)\n  run / exploit       Execute module\n  sessions -l         List active acquired forensic shells`
      });
    } else {
      newHist.push({
        type: "output",
        text: `[*] Executed '${cmd}'. Type 'help' for command syntax.`
      });
    }

    setMsfHistory(newHist);
    setMsfInput("");
  };

  // Case Flag Submission
  const handleFlagSubmit = (e) => {
    e.preventDefault();
    const clean = caseFlagInput.trim();
    if (!clean) return;

    if (clean === selectedCase.flag) {
      setCaseFlagFeedback({ success: true, text: `CORRECT HASH/KEY! ${selectedCase.rewardText}` });
      if (!completedCases[selectedCase.id]) {
        setCompletedCases((prev) => ({ ...prev, [selectedCase.id]: true }));
        if (onAwardXP) onAwardXP(selectedCase.xp);
      }
    } else {
      setCaseFlagFeedback({ success: false, text: "Flag mismatch. Re-examine artifacts in Wireshark or Autopsy." });
    }
  };

  // Desktop Right-Click Context Menu Handler
  const handleDesktopContextMenu = (e) => {
    e.preventDefault();
    setContextMenu({
      open: true,
      x: Math.min(e.clientX, window.innerWidth - 220),
      y: Math.min(e.clientY, window.innerHeight - 260)
    });
  };

  // Active Cadet Level
  const activeCadetLevel = LINUX_CADET_LEVELS[cadetLevelIndex] || LINUX_CADET_LEVELS[0];

  // Kali 12 Categories Definition for the Whisper Menu
  const KALI_CATEGORIES = [
    { id: "01", name: "01 - Info Gathering", icon: Search, apps: ["terminal", "wireshark"] },
    { id: "02", name: "02 - Vulnerability Analysis", icon: Eye, apps: ["terminal"] },
    { id: "03", name: "03 - Web Applications", icon: Radio, apps: ["terminal", "wireshark"] },
    { id: "04", name: "04 - Database Assessment", icon: Database, apps: ["terminal"] },
    { id: "05", name: "05 - Password Attacks", icon: Key, apps: ["terminal"] },
    { id: "06", name: "06 - Wireless Attacks", icon: Wifi, apps: ["terminal", "wireshark"] },
    { id: "07", name: "07 - Reverse Engineering", icon: Sliders, apps: ["terminal", "inspector"] },
    { id: "08", name: "08 - Exploitation Tools", icon: Skull, apps: ["metasploit", "terminal"] },
    { id: "09", name: "09 - Sniffing & Spoofing", icon: Activity, apps: ["wireshark", "terminal"] },
    { id: "10", name: "10 - Post Exploitation", icon: Lock, apps: ["metasploit", "terminal"] },
    { id: "11", name: "11 - Forensics", icon: Search, apps: ["inspector", "files", "terminal"] },
    { id: "12", name: "12 - Reporting Tools", icon: FileText, apps: ["notes", "statutes"] }
  ];

  return (
    <div
      id="kali-desktop-container"
      className={`w-full bg-[#0b0f19] text-slate-100 flex flex-col select-none overflow-hidden font-sans border border-slate-800 rounded-xl shadow-2xl transition-all ${
        isFullScreen ? "fixed inset-0 z-50 rounded-none h-screen" : "h-[860px]"
      }`}
      onContextMenu={handleDesktopContextMenu}
      onClick={() => {
        if (contextMenu.open) setContextMenu({ open: false, x: 0, y: 0 });
        if (startMenuOpen) setStartMenuOpen(false);
      }}
    >
      {/* =====================================================================
          1. KALI XFCE TOP PANEL / TASKBAR
         ===================================================================== */}
      <header className="h-9 bg-[#0e141f] border-b border-[#1f293d] px-2 flex items-center justify-between text-xs shrink-0 select-none z-40 shadow-md">
        {/* Left: Kali Dragon Start Menu, Launchers & Workspaces */}
        <div className="flex items-center gap-1.5">
          {/* Official Kali Dragon Start Menu Button */}
          <button
            id="btn-applications-menu"
            onClick={(e) => {
              e.stopPropagation();
              setStartMenuOpen(!startMenuOpen);
            }}
            className={`h-7 px-2.5 rounded flex items-center gap-2 font-bold transition-all border ${
              startMenuOpen
                ? "bg-[#1793d1] text-white border-[#00e5ff] shadow-sm shadow-[#00e5ff]/30"
                : "bg-[#141d2b] hover:bg-[#1a2638] text-slate-200 border-slate-800 hover:border-[#1793d1]/50"
            }`}
          >
            <KaliDragonEmblem className="h-4 w-4" color={startMenuOpen ? "#ffffff" : "#00e5ff"} />
            <span className="font-semibold tracking-wide text-[11px] text-[#00e5ff] hidden sm:inline">Applications</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {/* XFCE Quick Launcher Bar */}
          <div className="flex items-center gap-1 pl-1 border-l border-slate-800">
            <button
              id="ql-app-terminal"
              onClick={() => openApp("terminal")}
              title="Terminal Emulator (zsh)"
              className="p-1.5 rounded hover:bg-[#1a2638] text-slate-300 hover:text-[#00e5ff] transition-colors"
            >
              <TerminalIcon className="h-3.5 w-3.5" />
            </button>
            <button
              id="ql-app-files"
              onClick={() => openApp("files")}
              title="Thunar File Manager"
              className="p-1.5 rounded hover:bg-[#1a2638] text-slate-300 hover:text-blue-400 transition-colors"
            >
              <Folder className="h-3.5 w-3.5" />
            </button>
            <button
              id="ql-app-wireshark"
              onClick={() => openApp("wireshark")}
              title="Wireshark Network Packet Dissector"
              className="p-1.5 rounded hover:bg-[#1a2638] text-slate-300 hover:text-cyan-400 transition-colors"
            >
              <Activity className="h-3.5 w-3.5" />
            </button>
            <button
              id="ql-app-inspector"
              onClick={() => openApp("inspector")}
              title="Autopsy 4 Digital Forensics"
              className="p-1.5 rounded hover:bg-[#1a2638] text-slate-300 hover:text-purple-400 transition-colors"
            >
              <Search className="h-3.5 w-3.5" />
            </button>
            <button
              id="ql-app-msf"
              onClick={() => openApp("metasploit")}
              title="Metasploit Framework 6"
              className="p-1.5 rounded hover:bg-[#1a2638] text-slate-300 hover:text-red-400 transition-colors"
            >
              <Skull className="h-3.5 w-3.5" />
            </button>
            <button
              id="ql-app-notes"
              onClick={() => openApp("notes")}
              title="Mousepad Text Editor"
              className="p-1.5 rounded hover:bg-[#1a2638] text-slate-300 hover:text-amber-400 transition-colors"
            >
              <FileText className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Virtual Workspace Switcher (XFCE Style) */}
          <div className="hidden lg:flex items-center gap-0.5 px-1.5 py-0.5 bg-[#080d14] rounded border border-slate-800 ml-1">
            {[1, 2, 3, 4].map((ws) => (
              <button
                key={ws}
                onClick={() => setActiveWorkspace(ws)}
                className={`h-5 w-5 rounded text-[10px] font-mono font-bold transition-all ${
                  activeWorkspace === ws
                    ? "bg-[#1793d1] text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                {ws}
              </button>
            ))}
          </div>

          {/* Active Window Pills in Taskbar */}
          <div className="hidden md:flex items-center gap-1.5 pl-2 border-l border-slate-800">
            {Object.values(windows)
              .filter((w) => w.isOpen)
              .map((w) => {
                const Icon = w.icon;
                const isActive = activeWindowId === w.id && !w.isMinimized;
                return (
                  <button
                    key={w.id}
                    id={`taskbar-pill-${w.id}`}
                    onClick={() => {
                      if (w.isMinimized) {
                        focusWindow(w.id);
                      } else if (activeWindowId === w.id) {
                        minimizeWindow(w.id);
                      } else {
                        focusWindow(w.id);
                      }
                    }}
                    className={`h-6 px-2.5 rounded flex items-center gap-1.5 text-[11px] font-mono transition-all border relative ${
                      isActive
                        ? "bg-[#162338] text-white border-[#1793d1] shadow-xs"
                        : "bg-[#0b1018] text-slate-400 hover:text-slate-200 border-slate-800 hover:bg-[#111927]"
                    }`}
                  >
                    <Icon className="h-3 w-3 text-[#00e5ff]" />
                    <span className="truncate max-w-[90px]">{w.title.split(" ")[0]}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#00e5ff] rounded-full" />
                    )}
                  </button>
                );
              })}
          </div>
        </div>

        {/* Center: Kali OS Branding */}
        <div className="hidden 2xl:flex items-center gap-2 font-mono text-[11px] text-slate-400">
          <span className="text-[#00e5ff] font-bold">KALI GNU/LINUX</span>
          <span>•</span>
          <span className="text-slate-300">6.8.0-kali1-amd64</span>
          <span>•</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Online
          </span>
        </div>

        {/* Right: System Tray & Clock */}
        <div className="flex items-center gap-2.5 text-[11px] font-mono text-slate-300">
          <div className="flex items-center gap-1.5 text-slate-400 px-1.5 py-0.5 bg-[#080d14] rounded border border-slate-800">
            <Wifi className="h-3 w-3 text-[#00e5ff]" title="eth0: 192.168.10.45" />
            <Volume2 className="h-3 w-3" />
            <Battery className="h-3 w-3" />
          </div>

          <span className="text-slate-200 font-semibold text-[11px] hidden sm:inline">{currentTime}</span>

          <Badge
            onClick={() => setIsRootUser(!isRootUser)}
            className={`cursor-pointer font-mono text-[10px] px-2 py-0 border transition-all ${
              isRootUser
                ? "bg-red-950 text-red-300 border-red-700 hover:bg-red-900"
                : "bg-[#002845] text-[#00e5ff] border-[#00e5ff]/40 hover:bg-[#003860]"
            }`}
            title="Click to toggle root session"
          >
            {isRootUser ? "root" : "kali"}
          </Badge>

          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            title={isFullScreen ? "Exit Fullscreen" : "Fullscreen"}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            {isFullScreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </header>

      {/* =====================================================================
          2. KALI "WHISPER" APPLICATION START MENU
         ===================================================================== */}
      {startMenuOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-10 left-2 w-96 bg-[#0a0f18] border border-[#1f293d] rounded-xl shadow-2xl p-2 z-50 space-y-2 animate-in fade-in slide-in-from-top-1 text-xs font-sans"
        >
          {/* Header with Kali Dragon */}
          <div className="p-2.5 border-b border-slate-800 flex items-center gap-3 bg-gradient-to-r from-[#0e1624] to-[#080c14] rounded-lg">
            <KaliDragonEmblem className="h-7 w-7" color="#00e5ff" />
            <div className="flex-1">
              <div className="font-bold text-white text-sm tracking-wide">Kali Linux 2026.1</div>
              <div className="text-[10px] text-[#00e5ff] font-mono">FSUU Forensic Cybercrime Lab</div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setAboutModalOpen(true);
                setStartMenuOpen(false);
              }}
              className="h-6 text-[10px] text-slate-400 hover:text-white"
            >
              About
            </Button>
          </div>

          {/* Split Menu: Categories on Left, Tools on Right */}
          <div className="grid grid-cols-2 gap-2 h-72">
            {/* Left Column: 12 Official Kali Categories */}
            <div className="space-y-0.5 overflow-y-auto pr-1 border-r border-slate-800 text-[11px]">
              {KALI_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedMenuCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedMenuCategory(cat.id)}
                    className={`w-full text-left px-2 py-1.5 rounded flex items-center gap-2 transition-colors ${
                      isSelected
                        ? "bg-[#1793d1] text-white font-semibold"
                        : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0 text-[#00e5ff]" />
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Right Column: Tools in Selected Category */}
            <div className="space-y-1 overflow-y-auto p-1">
              <div className="text-[10px] font-mono text-slate-500 uppercase px-1 font-bold">
                Launchable Arsenal
              </div>
              <button
                id="menu-app-terminal"
                onClick={() => openApp("terminal")}
                className="w-full text-left p-2 rounded-lg bg-slate-900/60 hover:bg-[#162338] border border-slate-800 hover:border-[#1793d1] flex items-center gap-2 transition-all group"
              >
                <TerminalIcon className="h-4 w-4 text-[#00e5ff]" />
                <div>
                  <div className="font-semibold text-white group-hover:text-[#00e5ff]">Kali Terminal</div>
                  <div className="text-[10px] text-slate-400">Student & Volatility CLI</div>
                </div>
              </button>

              <button
                id="menu-app-wireshark"
                onClick={() => openApp("wireshark")}
                className="w-full text-left p-2 rounded-lg bg-slate-900/60 hover:bg-[#162338] border border-slate-800 hover:border-cyan-500 flex items-center gap-2 transition-all group"
              >
                <Activity className="h-4 w-4 text-cyan-400" />
                <div>
                  <div className="font-semibold text-white group-hover:text-cyan-400">Wireshark</div>
                  <div className="text-[10px] text-slate-400">Packet Sniffer & PCAP</div>
                </div>
              </button>

              <button
                id="menu-app-inspector"
                onClick={() => openApp("inspector")}
                className="w-full text-left p-2 rounded-lg bg-slate-900/60 hover:bg-[#162338] border border-slate-800 hover:border-purple-500 flex items-center gap-2 transition-all group"
              >
                <Search className="h-4 w-4 text-purple-400" />
                <div>
                  <div className="font-semibold text-white group-hover:text-purple-400">Autopsy Forensics</div>
                  <div className="text-[10px] text-slate-400">Hash & Disk Inspection</div>
                </div>
              </button>

              <button
                id="menu-app-msf"
                onClick={() => openApp("metasploit")}
                className="w-full text-left p-2 rounded-lg bg-slate-900/60 hover:bg-[#162338] border border-slate-800 hover:border-red-500 flex items-center gap-2 transition-all group"
              >
                <Skull className="h-4 w-4 text-red-400" />
                <div>
                  <div className="font-semibold text-white group-hover:text-red-400">Metasploit</div>
                  <div className="text-[10px] text-slate-400">Exploit Console</div>
                </div>
              </button>

              <button
                id="menu-app-files"
                onClick={() => openApp("files")}
                className="w-full text-left p-2 rounded-lg bg-slate-900/60 hover:bg-[#162338] border border-slate-800 hover:border-blue-500 flex items-center gap-2 transition-all group"
              >
                <Folder className="h-4 w-4 text-blue-400" />
                <div>
                  <div className="font-semibold text-white group-hover:text-blue-400">Thunar File Manager</div>
                  <div className="text-[10px] text-slate-400">Browse Evidence Vault</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          3. KALI DESKTOP CANVAS & AUTHENTIC WALLPAPER
         ===================================================================== */}
      <div
        id="kali-desktop-canvas"
        className="flex-1 relative overflow-hidden bg-[#070b12] p-4 select-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(2, 132, 199, 0.12) 0%, transparent 65%),
            linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px)
          `,
          backgroundSize: "100% 100%, 36px 36px, 36px 36px"
        }}
      >
        {/* Iconic Kali Dragon Center Watermark */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-20 select-none">
          <KaliDragonEmblem className="h-72 w-72" color="#00e5ff" />
          <div className="mt-4 text-center font-mono tracking-widest">
            <div className="text-2xl font-black text-[#00e5ff] tracking-[0.25em]">KALI LINUX</div>
            <div className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-sans font-semibold">
              The Quieter You Become, The More You Are Able To Hear
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              FSUU Criminal Justice Education • Cybercrime Lab
            </div>
          </div>
        </div>

        {/* Desktop Application Icons Grid (XFCE Style on the Left) */}
        <div className="grid grid-flow-col grid-rows-6 gap-3.5 w-fit relative z-0">
          {/* Icon 1: Terminal */}
          <div
            id="desktop-app-terminal"
            onDoubleClick={() => openApp("terminal")}
            onClick={() => openApp("terminal")}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/10 cursor-pointer w-24 text-center transition-all group"
          >
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#1793d1] to-[#080d14] border border-[#00e5ff]/50 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <TerminalIcon className="h-5 w-5 text-[#00e5ff]" />
            </div>
            <span className="text-[11px] font-medium text-slate-200 group-hover:text-[#00e5ff] drop-shadow leading-tight">
              Kali Terminal
            </span>
          </div>

          {/* Icon 2: Wireshark */}
          <div
            id="desktop-app-wireshark"
            onDoubleClick={() => openApp("wireshark")}
            onClick={() => openApp("wireshark")}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/10 cursor-pointer w-24 text-center transition-all group"
          >
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-cyan-700 to-[#080d14] border border-cyan-400/50 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Activity className="h-5 w-5 text-cyan-300" />
            </div>
            <span className="text-[11px] font-medium text-slate-200 group-hover:text-cyan-300 drop-shadow leading-tight">
              Wireshark
            </span>
          </div>

          {/* Icon 3: Thunar File Manager */}
          <div
            id="desktop-app-files"
            onDoubleClick={() => openApp("files")}
            onClick={() => openApp("files")}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/10 cursor-pointer w-24 text-center transition-all group"
          >
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-700 to-[#080d14] border border-blue-400/50 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Folder className="h-5 w-5 text-blue-300" />
            </div>
            <span className="text-[11px] font-medium text-slate-200 group-hover:text-blue-300 drop-shadow leading-tight">
              Thunar Files
            </span>
          </div>

          {/* Icon 4: Autopsy Forensics */}
          <div
            id="desktop-app-inspector"
            onDoubleClick={() => openApp("inspector")}
            onClick={() => openApp("inspector")}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/10 cursor-pointer w-24 text-center transition-all group"
          >
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-purple-800 to-[#080d14] border border-purple-400/50 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Search className="h-5 w-5 text-purple-300" />
            </div>
            <span className="text-[11px] font-medium text-slate-200 group-hover:text-purple-300 drop-shadow leading-tight">
              Autopsy 4
            </span>
          </div>

          {/* Icon 5: Metasploit */}
          <div
            id="desktop-app-msf"
            onDoubleClick={() => openApp("metasploit")}
            onClick={() => openApp("metasploit")}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/10 cursor-pointer w-24 text-center transition-all group"
          >
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-red-800 to-[#080d14] border border-red-500/50 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Skull className="h-5 w-5 text-red-300" />
            </div>
            <span className="text-[11px] font-medium text-slate-200 group-hover:text-red-300 drop-shadow leading-tight">
              Metasploit
            </span>
          </div>

          {/* Icon 6: Mousepad Notes */}
          <div
            id="desktop-app-notes"
            onDoubleClick={() => openApp("notes")}
            onClick={() => openApp("notes")}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/10 cursor-pointer w-24 text-center transition-all group"
          >
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-amber-700 to-[#080d14] border border-amber-400/50 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <FileText className="h-5 w-5 text-amber-300" />
            </div>
            <span className="text-[11px] font-medium text-slate-200 group-hover:text-amber-300 drop-shadow leading-tight">
              Mousepad
            </span>
          </div>

          {/* Icon 7: Statutes */}
          <div
            id="desktop-app-statutes"
            onDoubleClick={() => openApp("statutes")}
            onClick={() => openApp("statutes")}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/10 cursor-pointer w-24 text-center transition-all group"
          >
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-800 to-[#080d14] border border-emerald-400/50 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Scale className="h-5 w-5 text-emerald-300" />
            </div>
            <span className="text-[11px] font-medium text-slate-200 group-hover:text-emerald-300 drop-shadow leading-tight">
              Statutes
            </span>
          </div>

          {/* Icon 8: Htop Monitor */}
          <div
            id="desktop-app-monitor"
            onDoubleClick={() => openApp("monitor")}
            onClick={() => openApp("monitor")}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/10 cursor-pointer w-24 text-center transition-all group"
          >
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-teal-800 to-[#080d14] border border-teal-400/50 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Cpu className="h-5 w-5 text-teal-300" />
            </div>
            <span className="text-[11px] font-medium text-slate-200 group-hover:text-teal-300 drop-shadow leading-tight">
              Task Manager
            </span>
          </div>
        </div>

        {/* Right-Click Desktop Context Menu */}
        {contextMenu.open && (
          <div
            style={{ top: contextMenu.y, left: contextMenu.x }}
            className="fixed w-52 bg-[#0c121d] border border-slate-700/80 rounded-lg shadow-2xl p-1 z-50 text-xs font-sans animate-in fade-in zoom-in-95 space-y-0.5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => openApp("terminal")}
              className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#1793d1] hover:text-white flex items-center gap-2 text-slate-200"
            >
              <TerminalIcon className="h-3.5 w-3.5 text-[#00e5ff]" />
              Open Terminal Here
            </button>
            <button
              onClick={() => openApp("files")}
              className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#1793d1] hover:text-white flex items-center gap-2 text-slate-200"
            >
              <Folder className="h-3.5 w-3.5 text-blue-400" />
              Open File Manager (Thunar)
            </button>
            <button
              onClick={() => openApp("wireshark")}
              className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#1793d1] hover:text-white flex items-center gap-2 text-slate-200"
            >
              <Activity className="h-3.5 w-3.5 text-cyan-400" />
              Launch Wireshark Dissector
            </button>
            <button
              onClick={() => openApp("inspector")}
              className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#1793d1] hover:text-white flex items-center gap-2 text-slate-200"
            >
              <Search className="h-3.5 w-3.5 text-purple-400" />
              Launch Autopsy Forensics
            </button>
            <div className="h-[1px] bg-slate-800 my-1" />
            <button
              onClick={() => openApp("notes")}
              className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#1793d1] hover:text-white flex items-center gap-2 text-slate-200"
            >
              <FileText className="h-3.5 w-3.5 text-amber-400" />
              Open Case Docket
            </button>
            <button
              onClick={() => {
                setAboutModalOpen(true);
                setContextMenu({ open: false, x: 0, y: 0 });
              }}
              className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#1793d1] hover:text-white flex items-center gap-2 text-slate-200"
            >
              <KaliDragonEmblem className="h-3.5 w-3.5" color="#00e5ff" />
              About Kali Linux Rolling
            </button>
          </div>
        )}

        {/* =====================================================================
            4. WINDOW 1: KALI TERMINAL EMULATOR (ZSH PROMPT)
           ===================================================================== */}
        {windows.terminal.isOpen && !windows.terminal.isMinimized && (
          <div
            onMouseDown={() => focusWindow("terminal")}
            style={{ zIndex: windows.terminal.zIndex }}
            className={`absolute transition-all rounded-lg border border-[#1f293d] bg-[#070b12] shadow-2xl flex flex-col overflow-hidden ${
              windows.terminal.isMaximized
                ? "inset-2"
                : "top-3 left-28 right-3 bottom-3 md:right-6 md:bottom-4"
            }`}
          >
            {/* Window Title Bar */}
            <div className="h-8 bg-[#101726] border-b border-[#1f293d] px-3 flex items-center justify-between select-none cursor-move">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 mr-1">
                  <button
                    onClick={() => closeWindow("terminal")}
                    title="Close (✕)"
                    className="h-2.5 w-2.5 rounded-full bg-red-500 hover:brightness-110 inline-block border border-red-600/30 transition-transform active:scale-90 cursor-pointer"
                  />
                  <button
                    onClick={() => minimizeWindow("terminal")}
                    title="Minimize (_)"
                    className="h-2.5 w-2.5 rounded-full bg-amber-500 hover:brightness-110 inline-block border border-amber-600/30 transition-transform active:scale-90 cursor-pointer"
                  />
                  <button
                    onClick={() => toggleMaximizeWindow("terminal")}
                    title="Maximize (□)"
                    className="h-2.5 w-2.5 rounded-full bg-emerald-500 hover:brightness-110 inline-block border border-emerald-600/30 transition-transform active:scale-90 cursor-pointer"
                  />
                </div>
                <TerminalIcon className="h-3.5 w-3.5 text-[#00e5ff]" />
                <span className="text-xs font-mono font-bold text-slate-200">
                  {isRootUser ? "root@fsuu-forensics" : "student@fsuu-forensics"}: {terminalTab === "cadet" ? formatPromptPath(cadetPath) : formatPromptPath(playgroundCurrentPath)}
                </span>
              </div>

              {/* Terminal Mode Tabs */}
              <div className="hidden sm:flex items-center bg-[#070a10] p-0.5 rounded border border-slate-800 text-[10px] font-mono">
                <button
                  onClick={() => setTerminalTab("cadet")}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    terminalTab === "cadet" ? "bg-[#1793d1] text-white font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  🎓 Student (8 Levels)
                </button>
                <button
                  onClick={() => setTerminalTab("missions")}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    terminalTab === "missions" ? "bg-[#1793d1] text-white font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  🎯 Case Missions
                </button>
                <button
                  onClick={() => setTerminalTab("playground")}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    terminalTab === "playground" ? "bg-[#1793d1] text-white font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  ⚡ Kali Zsh CLI
                </button>
              </div>

              {/* Window Controls (XFCE Style: _ □ ✕) */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => minimizeWindow("terminal")}
                  className="h-5 w-5 rounded hover:bg-slate-700 flex items-center justify-center text-slate-300 text-xs"
                >
                  _
                </button>
                <button
                  onClick={() => toggleMaximizeWindow("terminal")}
                  className="h-5 w-5 rounded hover:bg-slate-700 flex items-center justify-center text-slate-300 text-xs"
                >
                  □
                </button>
                <button
                  onClick={() => closeWindow("terminal")}
                  className="h-5 w-5 rounded hover:bg-red-600 flex items-center justify-center text-slate-300 hover:text-white text-xs"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Mode 1: Linux Cadet Academy Header */}
            {terminalTab === "cadet" && (
              <div className="p-2.5 bg-[#0b111c] border-b border-slate-800 shrink-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase mr-1">Level:</span>
                    {LINUX_CADET_LEVELS.map((lvl, idx) => {
                      const isDone = completedCadetLevels[lvl.id];
                      const isCurrent = cadetLevelIndex === idx;
                      return (
                        <button
                          key={lvl.id}
                          onClick={() => setCadetLevelIndex(idx)}
                          className={`h-5 px-2 rounded text-[10px] font-mono flex items-center gap-1 transition-all ${
                            isCurrent
                              ? "bg-[#1793d1] text-white font-bold shadow-xs"
                              : isDone
                              ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                              : "bg-slate-900 text-slate-400 hover:bg-slate-800"
                          }`}
                        >
                          <span>L{lvl.id}</span>
                          {isDone && <Check className="h-2.5 w-2.5 text-emerald-400" />}
                        </button>
                      );
                    })}
                  </div>

                  <Badge className="bg-[#002845] text-[#00e5ff] border-none font-mono text-[10px]">
                    {Object.keys(completedCadetLevels).length}/8 Student Completed
                  </Badge>
                </div>

                {/* Level Mission Card */}
                <div className="mt-2 p-2 bg-[#060a12] rounded border border-slate-800/80 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="text-[10px] font-mono text-[#00e5ff] font-bold">
                      LEVEL {activeCadetLevel.id}: {(activeCadetLevel.concept || activeCadetLevel.title || "").toUpperCase()}
                    </div>
                    <div className="text-slate-300 text-[11px] mt-0.5">{activeCadetLevel.instructions || activeCadetLevel.description}</div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      onClick={() => {
                        setCadetInput(activeCadetLevel.primaryCommand || "whoami");
                        cadetInputRef.current?.focus();
                      }}
                      className="h-6 text-[10px] bg-slate-800 hover:bg-slate-700 text-white font-mono px-2"
                    >
                      <Copy className="h-2.5 w-2.5 mr-1" /> Copy: {activeCadetLevel.primaryCommand || "whoami"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Mode 2: Case Missions Header */}
            {terminalTab === "missions" && (
              <div className="p-2.5 bg-[#0b111c] border-b border-slate-800 shrink-0 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 overflow-x-auto">
                  {FORENSIC_CASES.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedCase(c);
                        initCaseMission(c);
                      }}
                      className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                        selectedCase.id === c.id
                          ? "bg-[#1793d1] text-white font-bold"
                          : "bg-slate-900 text-slate-400 hover:text-white"
                      }`}
                    >
                      {c.caseCode}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleFlagSubmit} className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={caseFlagInput}
                    onChange={(e) => setCaseFlagInput(e.target.value)}
                    placeholder="Enter discovered flag/hash..."
                    className="h-6 px-2 bg-black/60 border border-slate-800 rounded text-[11px] font-mono text-white focus:outline-none"
                  />
                  <Button type="submit" size="sm" className="h-6 px-2 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-mono">
                    Verify
                  </Button>
                </form>
              </div>
            )}

            {/* Terminal Body with Real Kali Zsh Prompt */}
            <div
              ref={terminalTab === "cadet" ? cadetViewportRef : terminalTab === "playground" ? playgroundViewportRef : caseViewportRef}
              className="flex-1 p-3 overflow-y-auto font-mono text-xs space-y-1.5 bg-[#05080e] min-h-0 select-text"
            >
              {(terminalTab === "cadet" ? cadetHistory : terminalTab === "playground" ? playgroundHistory : caseHistory).map((item, idx) => (
                <div key={idx} className="leading-relaxed">
                  {item.type === "prompt" ? (
                    <div className="text-slate-300 font-semibold whitespace-pre-wrap">{item.text}</div>
                  ) : item.type === "system" ? (
                    <div className="text-[#00e5ff] whitespace-pre-wrap">{item.text}</div>
                  ) : item.type === "output" ? (
                    <div className="text-slate-200 whitespace-pre-wrap">{item.text}</div>
                  ) : item.type === "error" ? (
                    <div className="text-red-400 font-semibold whitespace-pre-wrap">{item.text}</div>
                  ) : item.type === "level-success" || item.type === "success" ? (
                    <div className="text-emerald-400 font-bold whitespace-pre-wrap">{item.text}</div>
                  ) : (
                    <div className="text-sky-300 whitespace-pre-wrap">{item.text}</div>
                  )}
                </div>
              ))}
            </div>

            {/* Real 2-Line Kali Terminal Interactive Prompt */}
            <div className="p-2 bg-[#090d16] border-t border-[#1f293d] shrink-0 font-mono text-xs">
              <form
                onSubmit={terminalTab === "cadet" ? handleCadetSubmit : terminalTab === "playground" ? handlePlaygroundSubmit : handleCaseSubmit}
                className="space-y-0.5"
              >
                {/* Line 1: ┌──(cadet㉿fsuu-forensics)-[~/evidence] */}
                <div className="flex items-center gap-0.5 text-[11px]">
                  <span className="text-[#00e5ff] font-bold">┌──(</span>
                  <span className={isRootUser ? "text-red-400 font-bold" : "text-[#1793d1] font-bold"}>
                    {isRootUser ? "root" : "student"}㉿fsuu-forensics
                  </span>
                  <span className="text-[#00e5ff] font-bold">)-[</span>
                  <span className="text-slate-200 font-semibold">
                    {terminalTab === "cadet" ? formatPromptPath(cadetPath) : formatPromptPath(playgroundCurrentPath)}
                  </span>
                  <span className="text-[#00e5ff] font-bold">]</span>
                </div>

                {/* Line 2: └─$ [input] */}
                <div className="flex items-center gap-1.5 pl-0.5">
                  <span className="text-[#00e5ff] font-bold shrink-0">{isRootUser ? "└─#" : "└─$"}</span>
                  <input
                    ref={terminalTab === "cadet" ? cadetInputRef : terminalTab === "playground" ? playgroundInputRef : caseInputRef}
                    type="text"
                    value={terminalTab === "cadet" ? cadetInput : terminalTab === "playground" ? playgroundInput : caseInput}
                    onChange={(e) => {
                      if (terminalTab === "cadet") setCadetInput(e.target.value);
                      else if (terminalTab === "playground") setPlaygroundInput(e.target.value);
                      else setCaseInput(e.target.value);
                    }}
                    placeholder="Type command (e.g. ls, nmap, wireshark, msfconsole, whoami, neofetch)..."
                    className="flex-1 bg-transparent text-white focus:outline-none placeholder-slate-600 font-mono text-[11px]"
                  />
                  <Button type="submit" size="sm" className="h-5 px-2 bg-[#1793d1] text-white hover:bg-[#127bb0] font-mono text-[9px] font-bold">
                    ENTER ↵
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =====================================================================
            5. WINDOW 2: WIRESHARK PACKET DISSECTOR GUI
           ===================================================================== */}
        {windows.wireshark.isOpen && !windows.wireshark.isMinimized && (
          <div
            onMouseDown={() => focusWindow("wireshark")}
            style={{ zIndex: windows.wireshark.zIndex }}
            className={`absolute transition-all rounded-lg border border-[#1f293d] bg-[#0c121e] shadow-2xl flex flex-col overflow-hidden ${
              windows.wireshark.isMaximized ? "inset-2" : "top-6 left-12 right-12 bottom-8"
            }`}
          >
            {/* Window Header */}
            <div className="h-8 bg-[#101726] border-b border-[#1f293d] px-3 flex items-center justify-between select-none cursor-move">
              <div className="flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-cyan-400" />
                <span className="text-xs font-mono font-bold text-slate-200">
                  Wireshark · The World's Foremost Network Protocol Analyzer [suspect_traffic.pcap]
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => minimizeWindow("wireshark")} className="h-5 w-5 rounded hover:bg-slate-700 text-slate-300 text-xs">_</button>
                <button onClick={() => toggleMaximizeWindow("wireshark")} className="h-5 w-5 rounded hover:bg-slate-700 text-slate-300 text-xs">□</button>
                <button onClick={() => closeWindow("wireshark")} className="h-5 w-5 rounded hover:bg-red-600 text-slate-300 hover:text-white text-xs">✕</button>
              </div>
            </div>

            {/* Wireshark Filter Bar */}
            <div className="h-8 bg-[#080d14] border-b border-slate-800 px-3 flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-400 font-bold text-[10px]">Apply a display filter:</span>
              <div className="flex items-center gap-1 bg-[#101726] px-2 py-0.5 rounded border border-slate-700 flex-1">
                <input
                  type="text"
                  value={wiresharkFilter}
                  onChange={(e) => setWiresharkFilter(e.target.value)}
                  placeholder="e.g. http, tcp.port == 80, ip.addr == 192.168.1.105"
                  className="bg-transparent flex-1 text-white focus:outline-none text-[11px]"
                />
                {wiresharkFilter && (
                  <button onClick={() => setWiresharkFilter("")} className="text-slate-400 hover:text-white">✕</button>
                )}
              </div>
              <Badge className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px]">
                Capture: 1,428 Packets
              </Badge>
            </div>

            {/* 3-Pane Wireshark Layout */}
            <div className="flex-1 flex flex-col min-h-0 bg-[#070a10]">
              {/* Pane 1: Packet List */}
              <div className="h-44 border-b border-slate-800 overflow-y-auto">
                <table className="w-full text-left font-mono text-[11px]">
                  <thead className="bg-[#121927] text-slate-400 sticky top-0 border-b border-slate-800 text-[10px]">
                    <tr>
                      <th className="py-1 px-2 w-12">No.</th>
                      <th className="py-1 px-2 w-20">Time</th>
                      <th className="py-1 px-2 w-28">Source</th>
                      <th className="py-1 px-2 w-28">Destination</th>
                      <th className="py-1 px-2 w-16">Protocol</th>
                      <th className="py-1 px-2 w-16">Length</th>
                      <th className="py-1 px-2">Info</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SAMPLE_WIRESHARK_PACKETS
                      .filter((p) => !wiresharkFilter || p.proto.toLowerCase().includes(wiresharkFilter.toLowerCase()) || p.info.toLowerCase().includes(wiresharkFilter.toLowerCase()))
                      .map((p) => (
                        <tr
                          key={p.no}
                          onClick={() => setSelectedPacket(p)}
                          className={`cursor-pointer border-b transition-colors ${
                            selectedPacket.no === p.no
                              ? "bg-[#1793d1]/30 text-white font-semibold"
                              : `${p.color} hover:bg-slate-800/60`
                          }`}
                        >
                          <td className="py-0.5 px-2">{p.no}</td>
                          <td className="py-0.5 px-2">{p.time}</td>
                          <td className="py-0.5 px-2">{p.src}</td>
                          <td className="py-0.5 px-2">{p.dst}</td>
                          <td className="py-0.5 px-2 font-bold">{p.proto}</td>
                          <td className="py-0.5 px-2">{p.length}</td>
                          <td className="py-0.5 px-2 truncate max-w-xs">{p.info}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Panes 2 & 3: Packet Details & Hex Bytes */}
              <div className="flex-1 flex flex-col md:flex-row min-h-0">
                {/* Packet Details Tree */}
                <div className="flex-1 p-3 overflow-y-auto border-r border-slate-800 font-mono text-xs space-y-1.5 bg-[#090e17]">
                  <div className="text-[10px] text-[#00e5ff] font-bold uppercase">
                    Packet #{selectedPacket.no} Protocol Hierarchy
                  </div>
                  <div className="p-1.5 bg-[#0e1624] rounded border border-slate-800 text-[11px] text-slate-300">
                    ▶ {selectedPacket.details.frame}
                  </div>
                  <div className="p-1.5 bg-[#0e1624] rounded border border-slate-800 text-[11px] text-slate-300">
                    ▶ {selectedPacket.details.eth}
                  </div>
                  <div className="p-1.5 bg-[#0e1624] rounded border border-slate-800 text-[11px] text-slate-300">
                    ▶ {selectedPacket.details.ip}
                  </div>
                  <div className="p-1.5 bg-[#0e1624] rounded border border-slate-800 text-[11px] text-slate-300">
                    ▶ {selectedPacket.details.protoLayer}
                  </div>
                  <div className="p-2 bg-emerald-950/40 rounded border border-emerald-800 text-[11px] text-emerald-300 whitespace-pre-wrap font-semibold">
                    ▼ Application Layer Decryption:\n{selectedPacket.details.payload}
                  </div>
                </div>

                {/* Packet Hex Bytes View */}
                <div className="w-full md:w-80 p-3 bg-[#05080e] overflow-y-auto font-mono text-[11px] text-slate-400">
                  <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">
                    Frame Packet Bytes (Hex & ASCII)
                  </div>
                  <pre className="text-emerald-400 font-mono text-[10px] leading-tight select-text">
                    {selectedPacket.hexDump}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            6. WINDOW 3: THUNAR FILE MANAGER
           ===================================================================== */}
        {windows.files.isOpen && !windows.files.isMinimized && (
          <div
            onMouseDown={() => focusWindow("files")}
            style={{ zIndex: windows.files.zIndex }}
            className={`absolute transition-all rounded-lg border border-[#1f293d] bg-[#0c121e] shadow-2xl flex flex-col overflow-hidden ${
              windows.files.isMaximized ? "inset-2" : "top-8 left-16 right-16 bottom-12"
            }`}
          >
            {/* Header */}
            <div className="h-8 bg-[#101726] border-b border-[#1f293d] px-3 flex items-center justify-between select-none cursor-move">
              <div className="flex items-center gap-2">
                <Folder className="h-3.5 w-3.5 text-blue-400" />
                <span className="text-xs font-mono font-bold text-slate-200">
                  Thunar · {fileManagerPath}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => minimizeWindow("files")} className="h-5 w-5 rounded hover:bg-slate-700 text-slate-300 text-xs">_</button>
                <button onClick={() => toggleMaximizeWindow("files")} className="h-5 w-5 rounded hover:bg-slate-700 text-slate-300 text-xs">□</button>
                <button onClick={() => closeWindow("files")} className="h-5 w-5 rounded hover:bg-red-600 text-slate-300 hover:text-white text-xs">✕</button>
              </div>
            </div>

            {/* Address Bar */}
            <div className="h-8 bg-[#080d14] border-b border-slate-800 px-3 flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-400 font-bold text-[10px]">Path:</span>
              <div className="flex items-center gap-1 bg-[#101726] px-2 py-0.5 rounded border border-slate-700 flex-1">
                {fileManagerPath.split("/").map((part, i, arr) => (
                  <span key={i} className="text-slate-200">
                    {part || "/"} {i < arr.length - 1 && "/"}
                  </span>
                ))}
              </div>
            </div>

            {/* Split View */}
            <div className="flex-1 flex min-h-0 bg-[#070a10]">
              {/* Left Places Panel */}
              <div className="w-44 bg-[#0a0f18] border-r border-slate-800 p-2 space-y-1 text-xs font-mono shrink-0">
                <div className="text-[10px] text-slate-500 uppercase font-bold px-2 py-1">Places</div>
                {[
                  { label: "Evidence Vault", path: "/evidence", icon: HardDrive },
                  { label: "Home (kali)", path: "/home/investigator", icon: Folder },
                  { label: "System Logs", path: "/logs", icon: FileText },
                  { label: "Kali Tools", path: "/tools", icon: Cpu }
                ].map((place) => (
                  <button
                    key={place.path}
                    onClick={() => {
                      setFileManagerPath(place.path);
                      setSelectedFileItem(null);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded flex items-center gap-2 transition-colors ${
                      fileManagerPath === place.path
                        ? "bg-[#1793d1] text-white font-bold"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    }`}
                  >
                    <place.icon className="h-3.5 w-3.5 text-[#00e5ff]" />
                    <span className="truncate">{place.label}</span>
                  </button>
                ))}
              </div>

              {/* Items Grid */}
              <div className="flex-1 p-3 overflow-y-auto">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {(vfs.dirs[fileManagerPath] || []).map((item) => {
                    const fullItemPath = `${fileManagerPath === "/" ? "" : fileManagerPath}/${item}`;
                    const isDir = Boolean(vfs.dirs[fullItemPath]);
                    const fileObj = vfs.files[fullItemPath];
                    const isSelected = selectedFileItem === item;

                    return (
                      <div
                        key={item}
                        onClick={() => setSelectedFileItem(item)}
                        onDoubleClick={() => {
                          if (isDir) {
                            setFileManagerPath(fullItemPath);
                            setSelectedFileItem(null);
                          } else {
                            openApp("inspector");
                          }
                        }}
                        className={`p-2.5 rounded-lg border transition-all cursor-pointer flex flex-col items-center text-center gap-1.5 ${
                          isSelected
                            ? "bg-[#1793d1]/20 border-[#00e5ff] text-white shadow-xs"
                            : "bg-[#0c121e] border-slate-800 hover:border-slate-700 text-slate-300"
                        }`}
                      >
                        {isDir ? (
                          <Folder className="h-8 w-8 text-blue-400" />
                        ) : item.endsWith(".pcap") ? (
                          <Activity className="h-8 w-8 text-cyan-400" />
                        ) : item.endsWith(".raw") || item.endsWith(".dd") ? (
                          <HardDrive className="h-8 w-8 text-purple-400" />
                        ) : (
                          <FileText className="h-8 w-8 text-[#00e5ff]" />
                        )}
                        <span className="font-mono text-xs truncate max-w-full font-medium">{item}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {isDir ? "Folder" : fileObj ? `${fileObj.size} B` : "Executable"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            7. WINDOW 4: AUTOPSY 4 DIGITAL FORENSICS
           ===================================================================== */}
        {windows.inspector.isOpen && !windows.inspector.isMinimized && (
          <div
            onMouseDown={() => focusWindow("inspector")}
            style={{ zIndex: windows.inspector.zIndex }}
            className={`absolute transition-all rounded-lg border border-[#1f293d] bg-[#0c121e] shadow-2xl flex flex-col overflow-hidden ${
              windows.inspector.isMaximized ? "inset-2" : "top-10 left-20 right-20 bottom-10"
            }`}
          >
            {/* Header */}
            <div className="h-8 bg-[#101726] border-b border-[#1f293d] px-3 flex items-center justify-between select-none cursor-move">
              <div className="flex items-center gap-2">
                <Search className="h-3.5 w-3.5 text-purple-400" />
                <span className="text-xs font-mono font-bold text-slate-200">
                  Autopsy 4.20 · Digital Forensics Platform (ISO/IEC 27037)
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => minimizeWindow("inspector")} className="h-5 w-5 rounded hover:bg-slate-700 text-slate-300 text-xs">_</button>
                <button onClick={() => toggleMaximizeWindow("inspector")} className="h-5 w-5 rounded hover:bg-slate-700 text-slate-300 text-xs">□</button>
                <button onClick={() => closeWindow("inspector")} className="h-5 w-5 rounded hover:bg-red-600 text-slate-300 hover:text-white text-xs">✕</button>
              </div>
            </div>

            {/* Split Examination Workspace */}
            <div className="flex-1 flex flex-col md:flex-row min-h-0 bg-[#070a10] p-3 gap-3">
              {/* Evidence Tree / Selector */}
              <div className="w-full md:w-64 space-y-1.5 shrink-0 overflow-y-auto">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Seized Evidence Items</span>
                {CORE_EVIDENCE_FILES.map((file) => (
                  <button
                    key={file.path}
                    onClick={() => setInspectorSelectedEvidence(file)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs ${
                      inspectorSelectedEvidence.path === file.path
                        ? "bg-[#1793d1]/30 border-[#00e5ff] text-white shadow-xs"
                        : "bg-[#0b1018] border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <div className="font-bold font-mono text-white">{file.name}</div>
                    <div className="text-[10px] text-slate-300 mt-0.5">{file.desc}</div>
                    <div className="text-[9px] text-[#00e5ff] font-mono mt-1">{file.size} • {file.tag}</div>
                  </button>
                ))}
              </div>

              {/* Artifact Analysis Area */}
              <div className="flex-1 bg-[#0a0f18] border border-slate-800 rounded-lg p-4 overflow-y-auto space-y-3 text-xs">
                <div className="border-b border-slate-800 pb-2 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white font-mono">{inspectorSelectedEvidence.name}</h3>
                    <span className="text-[10px] text-slate-400 font-mono">{inspectorSelectedEvidence.path}</span>
                  </div>
                  <Badge className="bg-[#1793d1] text-white border-none font-mono text-[10px]">
                    {inspectorSelectedEvidence.tag}
                  </Badge>
                </div>

                {/* Hash Verification Card */}
                <div className="p-3 bg-black/60 rounded-lg border border-slate-800 space-y-2 font-mono">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">SHA-256 Court Verification:</span>
                    <Button
                      size="sm"
                      onClick={() => {
                        setVerifiedHashes((prev) => ({ ...prev, [inspectorSelectedEvidence.path]: true }));
                        if (onAwardXP) onAwardXP(25);
                      }}
                      className="h-6 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      Verify Court Hash (RFC 3227)
                    </Button>
                  </div>
                  <code className="text-[#00e5ff] block break-all text-[11px] bg-slate-950 p-2 rounded">
                    7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
                  </code>
                  {verifiedHashes[inspectorSelectedEvidence.path] && (
                    <div className="text-emerald-400 text-[11px] flex items-center gap-1 font-bold">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Hash matches police transmittal receipt! Zero tampering detected (+25 XP).
                    </div>
                  )}
                </div>

                {/* Extracted Artifact Extract */}
                <div className="space-y-1">
                  <span className="text-[11px] font-mono text-slate-400">Extracted Raw Text / Artifact Dump:</span>
                  <pre className="p-3 bg-black/60 rounded-lg border border-slate-800 text-emerald-400 font-mono text-[11px] whitespace-pre-wrap">
                    {inspectorSelectedEvidence.rawSample}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            8. WINDOW 5: METASPLOIT FRAMEWORK (MSFCONSOLE)
           ===================================================================== */}
        {windows.metasploit.isOpen && !windows.metasploit.isMinimized && (
          <div
            onMouseDown={() => focusWindow("metasploit")}
            style={{ zIndex: windows.metasploit.zIndex }}
            className={`absolute transition-all rounded-lg border border-[#1f293d] bg-[#070b12] shadow-2xl flex flex-col overflow-hidden ${
              windows.metasploit.isMaximized ? "inset-2" : "top-12 left-24 right-24 bottom-14"
            }`}
          >
            {/* Header */}
            <div className="h-8 bg-[#101726] border-b border-[#1f293d] px-3 flex items-center justify-between select-none cursor-move">
              <div className="flex items-center gap-2">
                <Skull className="h-3.5 w-3.5 text-red-400" />
                <span className="text-xs font-mono font-bold text-slate-200">
                  Metasploit Console 6.4.12-dev · Forensic Triage Listener
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => minimizeWindow("metasploit")} className="h-5 w-5 rounded hover:bg-slate-700 text-slate-300 text-xs">_</button>
                <button onClick={() => toggleMaximizeWindow("metasploit")} className="h-5 w-5 rounded hover:bg-slate-700 text-slate-300 text-xs">□</button>
                <button onClick={() => closeWindow("metasploit")} className="h-5 w-5 rounded hover:bg-red-600 text-slate-300 hover:text-white text-xs">✕</button>
              </div>
            </div>

            {/* MSF Console Body */}
            <div className="flex-1 p-3 overflow-y-auto font-mono text-xs space-y-1.5 bg-[#05080e] select-text">
              {msfHistory.map((item, idx) => (
                <div key={idx} className="leading-relaxed">
                  {item.type === "prompt" ? (
                    <div className="text-red-400 font-bold whitespace-pre-wrap">{item.text}</div>
                  ) : item.type === "success" ? (
                    <div className="text-emerald-400 font-bold whitespace-pre-wrap">{item.text}</div>
                  ) : (
                    <div className="text-slate-300 whitespace-pre-wrap">{item.text}</div>
                  )}
                </div>
              ))}
            </div>

            {/* MSF Prompt */}
            <form onSubmit={handleMsfSubmit} className="p-2 bg-[#090d16] border-t border-[#1f293d] flex items-center gap-2 font-mono text-xs">
              <span className="text-red-400 font-bold shrink-0">msf6 &gt;</span>
              <input
                type="text"
                value={msfInput}
                onChange={(e) => setMsfInput(e.target.value)}
                placeholder="Type 'show options', 'use exploit/multi/handler', or 'run'..."
                className="flex-1 bg-transparent text-white focus:outline-none placeholder-slate-600 text-[11px]"
              />
              <Button type="submit" size="sm" className="h-5 px-2 bg-red-700 text-white font-mono text-[9px] font-bold">
                EXEC
              </Button>
            </form>
          </div>
        )}

        {/* =====================================================================
            9. WINDOW 6: MOUSEPAD TEXT EDITOR (CASE DOCKET)
           ===================================================================== */}
        {windows.notes.isOpen && !windows.notes.isMinimized && (
          <div
            onMouseDown={() => focusWindow("notes")}
            style={{ zIndex: windows.notes.zIndex }}
            className={`absolute transition-all rounded-lg border border-[#1f293d] bg-[#0c121e] shadow-2xl flex flex-col overflow-hidden ${
              windows.notes.isMaximized ? "inset-2" : "top-14 left-28 right-28 bottom-16"
            }`}
          >
            <div className="h-8 bg-[#101726] border-b border-[#1f293d] px-3 flex items-center justify-between select-none cursor-move">
              <div className="flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-xs font-mono font-bold text-slate-200">
                  Mousepad · case_docket_notes.txt
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => minimizeWindow("notes")} className="h-5 w-5 rounded hover:bg-slate-700 text-slate-300 text-xs">_</button>
                <button onClick={() => toggleMaximizeWindow("notes")} className="h-5 w-5 rounded hover:bg-slate-700 text-slate-300 text-xs">□</button>
                <button onClick={() => closeWindow("notes")} className="h-5 w-5 rounded hover:bg-red-600 text-slate-300 hover:text-white text-xs">✕</button>
              </div>
            </div>

            <textarea
              value={caseNotesContent}
              onChange={(e) => {
                setCaseNotesContent(e.target.value);
                if (typeof window !== "undefined") {
                  localStorage.setItem("cdi409_case_docket_notes", e.target.value);
                }
              }}
              className="flex-1 p-3 bg-[#070a10] text-slate-200 font-mono text-xs focus:outline-none resize-none leading-relaxed"
            />
          </div>
        )}

        {/* =====================================================================
            10. WINDOW 7: PHILIPPINE STATUTES
           ===================================================================== */}
        {windows.statutes.isOpen && !windows.statutes.isMinimized && (
          <div
            onMouseDown={() => focusWindow("statutes")}
            style={{ zIndex: windows.statutes.zIndex }}
            className={`absolute transition-all rounded-lg border border-[#1f293d] bg-[#0c121e] shadow-2xl flex flex-col overflow-hidden ${
              windows.statutes.isMaximized ? "inset-2" : "top-16 left-32 right-32 bottom-20"
            }`}
          >
            <div className="h-8 bg-[#101726] border-b border-[#1f293d] px-3 flex items-center justify-between select-none cursor-move">
              <div className="flex items-center gap-2">
                <Scale className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-xs font-mono font-bold text-slate-200">
                  Philippine Legal Compendium (RA 10175, RA 10173, PD 705)
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => minimizeWindow("statutes")} className="h-5 w-5 rounded hover:bg-slate-700 text-slate-300 text-xs">_</button>
                <button onClick={() => toggleMaximizeWindow("statutes")} className="h-5 w-5 rounded hover:bg-slate-700 text-slate-300 text-xs">□</button>
                <button onClick={() => closeWindow("statutes")} className="h-5 w-5 rounded hover:bg-red-600 text-slate-300 hover:text-white text-xs">✕</button>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs bg-[#070a10]">
              <div className="p-3 bg-[#0b1018] rounded-lg border border-slate-800 space-y-1">
                <div className="font-bold text-[#00e5ff] font-mono">REPUBLIC ACT NO. 10175 - CYBERCRIME PREVENTION ACT</div>
                <p className="text-slate-300">
                  Section 4(a)(1) Illegal Access • Section 4(a)(2) Illegal Interception • Section 4(a)(4) System Interference (Ransomware).
                </p>
              </div>
              <div className="p-3 bg-[#0b1018] rounded-lg border border-slate-800 space-y-1">
                <div className="font-bold text-emerald-400 font-mono">PRESIDENTIAL DECREE NO. 705 - REVISED FORESTRY CODE</div>
                <p className="text-slate-300">
                  Section 68 Cutting and Gathering Timber without license • Aerial drone GPS telemetry analysis for illegal timber hauling.
                </p>
              </div>
              <div className="p-3 bg-[#0b1018] rounded-lg border border-slate-800 space-y-1">
                <div className="font-bold text-purple-400 font-mono">A.M. NO. 17-11-03-SC - RULE ON CYBERCRIME WARRANTS</div>
                <p className="text-slate-300">
                  Warrant to Search, Seize and Examine Computer Data (WSCD) • Mandatory SHA-256 hash preservation at the crime scene.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            11. WINDOW 8: TASK MANAGER (HTOP PROCESS VIEWER)
           ===================================================================== */}
        {windows.monitor.isOpen && !windows.monitor.isMinimized && (
          <div
            onMouseDown={() => focusWindow("monitor")}
            style={{ zIndex: windows.monitor.zIndex }}
            className={`absolute transition-all rounded-lg border border-[#1f293d] bg-[#070b12] shadow-2xl flex flex-col overflow-hidden ${
              windows.monitor.isMaximized ? "inset-2" : "top-20 left-36 right-36 bottom-24"
            }`}
          >
            <div className="h-8 bg-[#101726] border-b border-[#1f293d] px-3 flex items-center justify-between select-none cursor-move">
              <div className="flex items-center gap-2">
                <Cpu className="h-3.5 w-3.5 text-teal-400" />
                <span className="text-xs font-mono font-bold text-slate-200">
                  Htop · Kali Process Viewer & Resource Monitor
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => minimizeWindow("monitor")} className="h-5 w-5 rounded hover:bg-slate-700 text-slate-300 text-xs">_</button>
                <button onClick={() => toggleMaximizeWindow("monitor")} className="h-5 w-5 rounded hover:bg-slate-700 text-slate-300 text-xs">□</button>
                <button onClick={() => closeWindow("monitor")} className="h-5 w-5 rounded hover:bg-red-600 text-slate-300 hover:text-white text-xs">✕</button>
              </div>
            </div>

            <div className="flex-1 p-3 overflow-y-auto font-mono text-xs bg-[#05080e] space-y-2">
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 bg-[#090e17] rounded border border-slate-800">
                  <div className="text-teal-400 font-bold">CPU Usage: 4.8% [8 Cores]</div>
                  <div className="h-2 bg-slate-800 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-teal-400 w-[5%]" />
                  </div>
                </div>
                <div className="p-2 bg-[#090e17] rounded border border-slate-800">
                  <div className="text-[#00e5ff] font-bold">RAM Usage: 3,840 MB / 16,384 MB</div>
                  <div className="h-2 bg-slate-800 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-[#00e5ff] w-[23%]" />
                  </div>
                </div>
              </div>

              <table className="w-full text-left text-[11px] text-slate-300">
                <thead className="text-slate-500 border-b border-slate-800">
                  <tr>
                    <th className="py-1">PID</th>
                    <th>USER</th>
                    <th>CPU%</th>
                    <th>MEM%</th>
                    <th>COMMAND</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { pid: 1, user: "root", cpu: "0.0", mem: "0.1", cmd: "/sbin/init splash" },
                    { pid: 482, user: "kali", cpu: "1.2", mem: "2.4", cmd: "xfce4-session" },
                    { pid: 1042, user: "kali", cpu: "0.8", mem: "4.1", cmd: "qterminal --geometry 120x35" },
                    { pid: 1420, user: "kali", cpu: "2.1", mem: "8.5", cmd: "wireshark /evidence/suspect_traffic.pcap" },
                    { pid: 1890, user: "root", cpu: "0.4", mem: "3.2", cmd: "volatility3 -f memdump.raw" },
                    { pid: 2410, user: "kali", cpu: "0.2", mem: "1.8", cmd: "msfconsole" }
                  ].map((proc) => (
                    <tr key={proc.pid} className="border-b border-slate-800/40 hover:bg-slate-800/40">
                      <td className="py-0.5 text-[#00e5ff]">{proc.pid}</td>
                      <td>{proc.user}</td>
                      <td>{proc.cpu}</td>
                      <td>{proc.mem}</td>
                      <td className="text-slate-400 truncate max-w-xs">{proc.cmd}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* =====================================================================
          12. ABOUT KALI LINUX MODAL
         ===================================================================== */}
      {aboutModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#0b1018] border border-[#1f293d] rounded-xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setAboutModalOpen(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-white"
            >
              ✕
            </button>
            <div className="flex justify-center">
              <KaliDragonEmblem className="h-20 w-20" color="#00e5ff" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-wider">KALI GNU/LINUX ROLLING</h2>
              <div className="text-xs text-[#00e5ff] font-mono mt-0.5">Version 2026.1 (XFCE 4.18 OffSec Edition)</div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Equipped with SANS SIFT forensic modules and integrated specifically for{" "}
              <strong className="text-white">Father Saturnino Urios University (FSUU)</strong> Criminal Justice Education students in{" "}
              <strong className="text-white">Cybercrime Investigation & Environmental Laws</strong>.
            </p>
            <div className="p-3 bg-black/50 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-400">
              "The Quieter You Become, The More You Are Able To Hear"
            </div>
            <Button
              onClick={() => setAboutModalOpen(false)}
              className="w-full bg-[#1793d1] hover:bg-[#127bb0] text-white font-mono text-xs"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
