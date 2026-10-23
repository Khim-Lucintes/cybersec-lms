// Virtual Forensic Filesystem and SIFT CLI Command Engine for Playground Terminal
// Aligned with SANS Institute DFIR, ISO/IEC 27037, and Philippine Cybercrime & Environmental Statutes (RA 10175 / PD 705)

export const INITIAL_VFS = {
  dirs: {
    "/": ["evidence", "logs", "tools", "home", "etc"],
    "/evidence": [
      "usb_image.dd",
      "memdump.raw",
      "suspect_traffic.pcap",
      "drone_telemetry.log",
      "sawdust_specimen_batch04.dat",
      "ransom_note.txt",
      "chain_of_custody_receipt.txt",
      "evidence_hashes.sha256",
      "confidential_db.sqlite"
    ],
    "/logs": [
      "syslog",
      "auth.log",
      "snort_alerts.log",
      "apache2_access.log"
    ],
    "/tools": [
      "volatility",
      "tshark",
      "sha256sum",
      "xxd",
      "reg-query",
      "prefetch-dump",
      "exiftool",
      "strings",
      "binwalk",
      "parse-sawdust",
      "statute-check"
    ],
    "/home": ["investigator"],
    "/home/investigator": [
      "notes.txt",
      "case_checklist.md",
      "statute_quickref.txt",
      "investigation_report.txt"
    ],
    "/etc": [
      "os-release",
      "motd",
      "hosts",
      "forensics-policy.conf"
    ]
  },
  files: {
    "/evidence/ransom_note.txt": {
      size: 442,
      perms: "-rw-r--r--",
      owner: "investigator",
      description: "Extortion text file recovered from compromised Butuan medical laboratory workstation.",
      content: `!!! ATTENTION INVESTIGATOR - EVIDENCE ITEM #4 !!!
All critical hospital dossiers & biometric records have been encrypted with AES-256-CBC.
To recover your private decryption keys, transmit 2.5 XMR (Monero) to:
888tNkZrPN6JsEgekjMnABU4TBzc2Dt29EPAvkFxbANsAnJYPbb3iQ1YBRk1UXCDRSiKc9dhwMVgZeA9G265vQgbBF4Q62X

Darknet Portal: http://lockbit3caraga49281.onion
Deadline: 72 hours before private key deletion.
Affiliation: Caraga Extortion Syndicate (Tracking under RA 10175 Sec. 4(a)(4))`
    },
    "/evidence/chain_of_custody_receipt.txt": {
      size: 1120,
      perms: "-r--r--r--",
      owner: "root",
      description: "Official PNP-ACG transmittal document certifying evidence integrity.",
      content: `PNP ANTI-CYBERCRIME GROUP (ACG) - REGIONAL FIELD UNIT 13
EVIDENCE TRANSMITTAL & CHAIN OF CUSTODY LOG
--------------------------------------------------------------------------------
Case Docket:          CDI-409-PNP-2026-0812
Seizing Officer:      PSSg. R. Lucintes / PCPT J. Alviola (PNP-ACG Caraga)
Location of Seizure:  Km. 3, J.C. Aquino Ave., Butuan City, Agusan del Norte
Seizure Authorization: Rule on Cybercrime Warrants (AM No. 17-11-03-SC)
Target Specimen:
  [1] SanDisk Ultra USB 3.0 (32GB) - Hardware Serial: 4C530001230415112041
  [2] Physical RAM Dump (8.0 GB DDR4) acquired via SANS SIFT LiME
  [3] DJI Mavic 3 Enterprise Drone & MicroSD - Contraband Aerial Scout
Tamper Seal Status:   Tamper-Evident Security Tape #PH-89102-INTACT
Receiving Examiner:   FSUU Criminal Justice Education - Forensic Lab Desk`
    },
    "/evidence/evidence_hashes.sha256": {
      size: 340,
      perms: "-r--r--r--",
      owner: "root",
      description: "Cryptographic baseline hashes calculated immediately upon evidence seizure.",
      content: `7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069  usb_image.dd
9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08  memdump.raw
e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  suspect_traffic.pcap
8c7219d92e59174092b109381029381029381029381029381029381029381029  drone_telemetry.log
f1a2b3c4d5e6f708192837465019283746501928374650192837465019283746  sawdust_specimen_batch04.dat`
    },
    "/evidence/drone_telemetry.log": {
      size: 580,
      perms: "-r--r--r--",
      owner: "root",
      description: "DJI Mavic flight log recording GPS coordinates and hover altitudes over illegal timber caches.",
      content: `[DRONE TELEMETRY LOG - DJI MAVIC 3 ENTERPRISE]
Serial: 1581F4Z782910 | Firmware: v01.02.0400
Waypoint #1 | 2026-10-12 17:15:02 UTC | Lat: 8.9812° N | Lon: 125.3380° E | Alt: 120m | Speed: 14.2 m/s
Waypoint #2 | 2026-10-12 17:21:40 UTC | Lat: 8.9842° N | Lon: 125.3401° E | Alt:  85m | Speed:  0.0 m/s (HOVER OVER LOGGING SITE)
Waypoint #3 | 2026-10-12 17:35:10 UTC | Lat: 8.9860° N | Lon: 125.3425° E | Alt: 140m | Speed: 11.5 m/s
Location Analysis: Mount Mayapay Watershed Protected Forest Reserve (PD 705 Timber Prohibited Zone)`
    },
    "/evidence/confidential_db.sqlite": {
      size: 4096,
      perms: "-rw-r--r--",
      owner: "investigator",
      description: "SQLite database extracted from seized suspect phone containing accomplice communications.",
      content: `SQLite format 3\x00[Caraga Syndicate Contacts DB]
id=1 | alias="ShadowRecon"   | phone="+63-917-555-0192" | btc="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
id=2 | alias="TimberBrokerX"  | phone="+63-928-555-0481" | email="timber_nasipit@proton.me"
id=3 | alias="ExfilNode_C2"   | phone="+63-908-555-0773" | server="192.168.10.144:8443"`
    },
    "/evidence/usb_image.dd": {
      size: 4294967296,
      perms: "-r--r--r--",
      owner: "root",
      description: "Raw bit-stream image (4.2 GB) of SanDisk Ultra USB 3.0 flash drive.",
      content: "[RAW DISK IMAGE - 4.2 GB REMOVABLE STORAGE. Run 'sha256sum', 'file', 'strings', or 'xxd' to inspect.]"
    },
    "/evidence/memdump.raw": {
      size: 8589934592,
      perms: "-r--r--r--",
      owner: "root",
      description: "Physical RAM dump (8.0 GB DDR4) acquired from live ransomware victim workstation.",
      content: "[VOLATILE PHYSICAL MEMORY DUMP - 8.0 GB DDR4. Run 'volatility -f memdump.raw <plugin>' or 'strings' to carve.]"
    },
    "/evidence/suspect_traffic.pcap": {
      size: 16777216,
      perms: "-r--r--r--",
      owner: "root",
      description: "Packet capture containing 1,428 frames captured from rogue Wi-Fi pineapple tap.",
      content: "[LIBPCAP NETWORK PACKET CAPTURE - 1,428 FRAMES. Run 'tshark -r suspect_traffic.pcap' or 'pcap-info' to dissect.]"
    },
    "/evidence/sawdust_specimen_batch04.dat": {
      size: 16384,
      perms: "-r--r--r--",
      owner: "root",
      description: "Microscopic stereomicroscopy cellular data from seized timber shipment at Nasipit Seaport.",
      content: "[FORENSIC BOTANICAL SAWDUST SPECIMEN. Run 'parse-sawdust sawdust_specimen_batch04.dat' to identify species morphology.]"
    },
    "/logs/auth.log": {
      size: 1420,
      perms: "-rw-r-----",
      owner: "root",
      description: "Authentication and hardware insertion kernel log.",
      content: `Oct 12 21:10:02 fsuu-ws sshd[1021]: Failed password for invalid user root from 192.168.10.144 port 44821 ssh2
Oct 12 21:10:05 fsuu-ws sshd[1024]: Failed password for invalid user admin from 192.168.10.144 port 44823 ssh2
Oct 12 21:10:09 fsuu-ws sshd[1028]: Accepted password for investigator from 192.168.10.45 port 51200 ssh2
Oct 12 23:14:02 fsuu-ws kernel: [81204.120] usb 2-1: new high-speed USB device number 4 using xhci_hcd
Oct 12 23:14:02 fsuu-ws kernel: [81204.250] usb-storage 2-1:1.0: USB Mass Storage device detected (Vendor: SanDisk)
Oct 12 23:14:05 fsuu-ws kernel: [81204.380] sd 4:0:0:0: [sdb] 62533632 512-byte logical blocks: (32.0 GB/29.8 GiB)
Oct 12 23:14:05 fsuu-ws kernel: [81204.390] sd 4:0:0:0: [sdb] Attached SCSI removable disk`
    },
    "/logs/snort_alerts.log": {
      size: 890,
      perms: "-rw-r-----",
      owner: "root",
      description: "Intrusion Detection System alerts highlighting malicious network signatures.",
      content: `[**] [1:100201:3] ET MALWARE Cobalt Strike Beacon Malleable C2 HTTP Checkin [**]
[Classification: Network Trojan Detected] [Priority: 1]
10/12-23:42:01.810291 192.168.10.45:49712 -> 192.168.10.144:8443
[**] [1:200392:2] POLICY-OTHER Suspicious Cleartext HTTP POST of Credentials [**]
10/12-22:05:14.052100 192.168.1.105:49821 -> 172.67.142.12:80
POST /auth/login HTTP/1.1 (Payload: username=admin&password=AlphaCriminology2026!)`
    },
    "/logs/syslog": {
      size: 980,
      perms: "-rw-r-----",
      owner: "root",
      description: "Operating system daemon and process execution log.",
      content: `Oct 12 20:00:01 fsuu-ws CRON[901]: (root) CMD (/usr/local/bin/backup_evidence.sh)
Oct 12 21:00:00 fsuu-ws systemd[1]: Started SANS SIFT Digital Forensics Environment.
Oct 12 23:14:02 fsuu-ws udisksd[650]: Mounted /dev/sdb1 at /media/investigator/PERSONAL_DRIVE on behalf of uid 1001
Oct 12 23:16:45 fsuu-ws systemd[1]: Process WINRAR.EXE executed by suspect (PID 3410)`
    },
    "/logs/apache2_access.log": {
      size: 610,
      perms: "-rw-r--r--",
      owner: "www-data",
      description: "Web server request access logs.",
      content: `192.168.1.105 - - [12/Oct/2026:22:04:12 +0000] "GET /index.html HTTP/1.1" 200 4812
192.168.1.105 - - [12/Oct/2026:22:05:14 +0000] "POST /auth/login HTTP/1.1" 302 240
192.168.10.144 - - [12/Oct/2026:23:42:01 +0000] "POST /c2/beacon HTTP/1.1" 200 1024`
    },
    "/home/investigator/notes.txt": {
      size: 530,
      perms: "-rw-r--r--",
      owner: "investigator",
      description: "Investigator's personal investigation scratchpad notes.",
      content: `FSUU INVESTIGATION NOTES (CCJE)
--------------------------------------------------------------------------------
1. Remember: SANS RFC 3227 Order of Volatility:
   Registers/Cache -> Physical RAM -> Network State -> Storage Disks -> Archival Media.
2. In courtroom direct examination, verify SHA-256 hash before and after triage.
3. Applicable Warrant: Rule on Cybercrime Warrants (WSCD / WDCD).
4. For illegal logging: Verify Shorea contorta (White Lauan) under PD 705 Sec. 68.`
    },
    "/home/investigator/case_checklist.md": {
      size: 680,
      perms: "-rw-r--r--",
      owner: "investigator",
      description: "Standard operating procedure checklist under ISO/IEC 27037.",
      content: `# DIGITAL FORENSICS INVESTIGATION CHECKLIST (ISO/IEC 27037)
- [x] Scene isolation & Faraday bagging
- [x] Hardware write-blocker verification (Tableau T8u)
- [ ] Memory dump extraction (Order of Volatility: RFC 3227)
- [ ] Non-volatile bit-stream image acquisition (.dd)
- [ ] Cryptographic hash integrity calculation (SHA-256)
- [ ] Legal compliance verification (RA 10175 / PD 705)
- [ ] Formal Chain of Custody transmittal receipt signed`
    },
    "/home/investigator/statute_quickref.txt": {
      size: 820,
      perms: "-rw-r--r--",
      owner: "investigator",
      description: "Philippine statutory legal definitions and penalty references.",
      content: `PHILIPPINE LEGAL BASES QUICK REFERENCE
--------------------------------------------------------------------------------
* RA 10175 Sec. 4(a)(1): Illegal Access (Penalty: Prision Mayor / Fine PHP 200k+)
* RA 10175 Sec. 4(a)(2): Illegal Interception (Packet sniffing, taps)
* RA 10175 Sec. 4(a)(3): Data Interference (Timestomping, alteration)
* RA 10175 Sec. 4(a)(4): System Interference (Ransomware, malware injection)
* RA 10175 Sec. 15: Search, Seizure & Examination of Computer Data (WSCD)
* RA 10173: Data Privacy Act of 2012 (Privileged information & breach notice)
* PD 705 Sec. 68: Cutting, Gathering and/or Collecting Timber without License
* RA 9147 Sec. 27: Prohibited Acts on Threatened Wildlife Resources`
    },
    "/home/investigator/investigation_report.txt": {
      size: 380,
      perms: "-rw-r--r--",
      owner: "investigator",
      description: "Initial case summary draft ready for submission to faculty or prosecutor.",
      content: `DRAFT INVESTIGATION REPORT
Lead Examiner: Investigator (FSUU BS Criminology)
Subject: Incident Triage of Seized Digital Artifacts
Status: PENDING LABORATORY ANALYSIS
Findings Summary: Active forensic examination in progress using SIFT Workstation.`
    },
    "/etc/os-release": {
      size: 320,
      perms: "-r--r--r--",
      owner: "root",
      description: "Kali Linux rolling release identification file.",
      content: `PRETTY_NAME="Kali GNU/Linux Rolling"
NAME="Kali GNU/Linux"
VERSION_ID="2026.1"
VERSION="2026.1"
VERSION_CODENAME="kali-rolling"
ID=kali
ID_LIKE=debian
HOME_URL="https://www.kali.org/"
SUPPORT_URL="https://forums.kali.org/"
BUG_REPORT_URL="https://bugs.kali.org/"
ANSI_COLOR="1;31"
KALI_EDITION="FSUU Criminology & Cybercrime Forensics Laboratory"`
    },
    "/etc/motd": {
      size: 420,
      perms: "-r--r--r--",
      owner: "root",
      description: "Message of the day displayed upon terminal initialization.",
      content: `               ..............
            ..,;:cccccccccc:;..
        .,cccccccccccccccccccccc:..
      .:cccccccccccccccccccccccccccc:.
    .;ccccccccccccc;.:cccccccccccccccc;.   KALI GNU/LINUX ROLLING (2026.1)
   .:ccccccccccccc;   .ccccccccccccccccc:  FSUU Criminology Cybercrime Lab
  .:ccccccccccccc;     .ccccccccccccccccc:.Host: kali-fsuu-dfir
  .cccccccccccccc;     .cccccccccccccccccc.Kernel: 6.8.0-kali1-amd64
  .cccccccccccccc;     .cccccccccccccccccc.Desktop: XFCE 4.18 (OffSec)
  .cccccccccccccc;     .cccccccccccccccccc."The Quieter You Become,
   :ccccccccccccc;     .ccccccccccccccccc:  The More You Are Able To Hear"`
    }
  }
};

// Normalize and resolve paths
export function resolvePath(target, currentDir = "/home/investigator") {
  if (!target || target === "~" || target === "") return "/home/investigator";
  if (target.startsWith("~")) return "/home/investigator" + target.slice(1);
  if (target.startsWith("/")) {
    return cleanPath(target);
  }
  return cleanPath(`${currentDir}/${target}`);
}

function cleanPath(fullPath) {
  const parts = fullPath.split("/").filter(Boolean);
  const stack = [];
  for (const part of parts) {
    if (part === ".") continue;
    if (part === "..") {
      if (stack.length > 0) stack.pop();
    } else {
      stack.push(part);
    }
  }
  return "/" + stack.join("/");
}

export function formatPromptPath(dirPath) {
  if (dirPath === "/home/investigator") return "~";
  if (dirPath.startsWith("/home/investigator/")) {
    return "~" + dirPath.slice("/home/investigator".length);
  }
  return dirPath;
}

// Playground Command Dispatcher
export function executePlaygroundCommand(rawCmd, currentPath, setCurrentPath, vfs, setVfs) {
  const tokens = rawCmd.trim().split(/\s+/);
  const cmd = tokens[0].toLowerCase();
  const args = tokens.slice(1);

  // 1. Directory Navigation & Filesystem Utilities
  if (cmd === "pwd") {
    return { type: "output", text: currentPath };
  }

  if (cmd === "cd") {
    const target = args[0] || "~";
    const resolved = resolvePath(target, currentPath);
    if (vfs.dirs[resolved]) {
      setCurrentPath(resolved);
      return null;
    }
    if (vfs.files[resolved]) {
      return { type: "error", text: `bash: cd: ${target}: Not a directory` };
    }
    return { type: "error", text: `bash: cd: ${target}: No such file or directory` };
  }

  if (cmd === "ls" || cmd === "dir") {
    let target = currentPath;
    const isLong = args.some(a => a.startsWith("-") && a.includes("l"));
    const isAll = args.some(a => a.startsWith("-") && a.includes("a"));
    const nonFlags = args.filter(a => !a.startsWith("-"));
    if (nonFlags.length > 0) {
      target = resolvePath(nonFlags[0], currentPath);
    }

    if (!vfs.dirs[target]) {
      if (vfs.files[target]) {
        const fileObj = vfs.files[target];
        return {
          type: "output",
          text: isLong ? `${fileObj.perms} 1 ${fileObj.owner} ${fileObj.owner} ${fileObj.size.toString().padStart(10)} Oct 13 00:00 ${target.split("/").pop()}` : target.split("/").pop()
        };
      }
      return { type: "error", text: `ls: cannot access '${target}': No such file or directory` };
    }

    const items = vfs.dirs[target] || [];
    if (!isLong) {
      const formatted = items.map(name => {
        const full = cleanPath(`${target}/${name}`);
        return vfs.dirs[full] ? `${name}/` : name;
      }).join("   ");
      return { type: "output", text: formatted || "(empty directory)" };
    }

    const lines = [`total ${items.length * 4}`];
    if (isAll) {
      lines.push(`drwxr-xr-x 2 root root       4096 Oct 13 00:00 .`);
      lines.push(`drwxr-xr-x 4 root root       4096 Oct 13 00:00 ..`);
    }
    for (const name of items) {
      const full = cleanPath(`${target}/${name}`);
      if (vfs.dirs[full]) {
        lines.push(`drwxr-xr-x 2 root root       4096 Oct 13 00:00 ${name}/`);
      } else if (vfs.files[full]) {
        const f = vfs.files[full];
        lines.push(`${f.perms} 1 ${f.owner} ${f.owner} ${f.size.toString().padStart(10)} Oct 13 00:00 ${name}`);
      }
    }
    return { type: "output", text: lines.join("\n") };
  }

  if (cmd === "cat") {
    if (!args[0]) return { type: "error", text: "cat: missing file operand" };
    const filePath = resolvePath(args[0], currentPath);
    if (vfs.files[filePath]) {
      return { type: "output", text: vfs.files[filePath].content };
    }
    if (vfs.dirs[filePath]) {
      return { type: "error", text: `cat: ${args[0]}: Is a directory` };
    }
    return { type: "error", text: `cat: ${args[0]}: No such file or directory` };
  }

  if (cmd === "head") {
    if (!args[0]) return { type: "error", text: "head: missing file operand" };
    const filePath = resolvePath(args[0], currentPath);
    if (vfs.files[filePath]) {
      const lines = vfs.files[filePath].content.split("\n").slice(0, 10).join("\n");
      return { type: "output", text: lines };
    }
    return { type: "error", text: `head: cannot open '${args[0]}': No such file or directory` };
  }

  if (cmd === "tail") {
    if (!args[0]) return { type: "error", text: "tail: missing file operand" };
    const filePath = resolvePath(args[0], currentPath);
    if (vfs.files[filePath]) {
      const all = vfs.files[filePath].content.split("\n");
      const lines = all.slice(Math.max(0, all.length - 10)).join("\n");
      return { type: "output", text: lines };
    }
    return { type: "error", text: `tail: cannot open '${args[0]}': No such file or directory` };
  }

  if (cmd === "wc") {
    if (!args[0]) return { type: "error", text: "wc: missing file operand" };
    const filePath = resolvePath(args[args.length - 1], currentPath);
    if (vfs.files[filePath]) {
      const text = vfs.files[filePath].content;
      const lines = text.split("\n").length;
      const words = text.split(/\s+/).filter(Boolean).length;
      const bytes = vfs.files[filePath].size;
      return { type: "output", text: ` ${lines}  ${words} ${bytes} ${args[args.length - 1]}` };
    }
    return { type: "error", text: `wc: ${args[0]}: No such file or directory` };
  }

  if (cmd === "touch") {
    if (!args[0]) return { type: "error", text: "touch: missing file operand" };
    const name = args[0].split("/").pop();
    const filePath = resolvePath(args[0], currentPath);
    const parent = cleanPath(filePath.substring(0, filePath.lastIndexOf("/")) || "/");

    if (!vfs.dirs[parent]) return { type: "error", text: `touch: cannot touch '${args[0]}': No such directory` };

    setVfs(prev => {
      const newDirs = { ...prev.dirs };
      if (!newDirs[parent].includes(name)) {
        newDirs[parent] = [...newDirs[parent], name];
      }
      return {
        ...prev,
        dirs: newDirs,
        files: {
          ...prev.files,
          [filePath]: prev.files[filePath] || {
            size: 0,
            perms: "-rw-r--r--",
            owner: "investigator",
            content: ""
          }
        }
      };
    });
    return { type: "success", text: `Created file: ${name}` };
  }

  if (cmd === "mkdir") {
    if (!args[0]) return { type: "error", text: "mkdir: missing operand" };
    const name = args[0].split("/").pop();
    const dirPath = resolvePath(args[0], currentPath);
    const parent = cleanPath(dirPath.substring(0, dirPath.lastIndexOf("/")) || "/");

    if (!vfs.dirs[parent]) return { type: "error", text: `mkdir: cannot create directory '${args[0]}': No such directory` };

    setVfs(prev => ({
      ...prev,
      dirs: {
        ...prev.dirs,
        [parent]: prev.dirs[parent].includes(name) ? prev.dirs[parent] : [...prev.dirs[parent], name],
        [dirPath]: []
      }
    }));
    return { type: "success", text: `Created directory: ${dirPath}` };
  }

  if (cmd === "rm") {
    if (!args[0]) return { type: "error", text: "rm: missing operand" };
    const filePath = resolvePath(args[0], currentPath);
    const parent = cleanPath(filePath.substring(0, filePath.lastIndexOf("/")) || "/");
    const name = filePath.split("/").pop();

    if (!vfs.files[filePath] && !vfs.dirs[filePath]) {
      return { type: "error", text: `rm: cannot remove '${args[0]}': No such file or directory` };
    }

    setVfs(prev => {
      const newFiles = { ...prev.files };
      delete newFiles[filePath];
      const newDirs = { ...prev.dirs };
      delete newDirs[filePath];
      if (newDirs[parent]) {
        newDirs[parent] = newDirs[parent].filter(n => n !== name);
      }
      return { ...prev, dirs: newDirs, files: newFiles };
    });
    return { type: "info", text: `Removed: ${name}` };
  }

  if (cmd === "echo") {
    const rawArgs = rawCmd.slice(5).trim();
    if (rawArgs.includes(">")) {
      const parts = rawArgs.split(/>+/);
      const isAppend = rawArgs.includes(">>");
      const content = parts[0].replace(/^["']|["']$/g, "").trim();
      const targetFile = parts[1].trim();
      const filePath = resolvePath(targetFile, currentPath);
      const parent = cleanPath(filePath.substring(0, filePath.lastIndexOf("/")) || "/");
      const name = filePath.split("/").pop();

      if (!vfs.dirs[parent]) return { type: "error", text: `echo: cannot write to '${targetFile}': Path not found` };

      setVfs(prev => {
        const existing = prev.files[filePath]?.content || "";
        const nextContent = isAppend && existing ? `${existing}\n${content}` : content;
        const newDirs = { ...prev.dirs };
        if (!newDirs[parent].includes(name)) newDirs[parent] = [...newDirs[parent], name];
        return {
          ...prev,
          dirs: newDirs,
          files: {
            ...prev.files,
            [filePath]: {
              size: nextContent.length,
              perms: "-rw-r--r--",
              owner: "investigator",
              content: nextContent
            }
          }
        };
      });
      return { type: "success", text: `Written to ${name} (${content.length} bytes)` };
    }
    return { type: "output", text: rawArgs.replace(/^["']|["']$/g, "") };
  }

  if (cmd === "find") {
    const targetDir = args[0] && !args[0].startsWith("-") ? resolvePath(args[0], currentPath) : currentPath;
    const allFiles = Object.keys(vfs.files).filter(p => p.startsWith(targetDir));
    const allDirs = Object.keys(vfs.dirs).filter(p => p.startsWith(targetDir));
    return {
      type: "output",
      text: [...allDirs, ...allFiles].sort().join("\n") || targetDir
    };
  }

  // 2. Cryptographic Integrity & Hashing
  if (cmd === "sha256sum" || cmd === "sha1sum" || cmd === "md5sum") {
    if (!args[0]) return { type: "error", text: `${cmd}: missing file operand` };
    const target = resolvePath(args[0], currentPath);
    let hash = "";
    if (cmd === "sha256sum") {
      if (target.includes("usb_image")) hash = "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069";
      else if (target.includes("memdump")) hash = "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08";
      else if (target.includes("traffic") || target.includes("pcap")) hash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
      else if (target.includes("drone")) hash = "8c7219d92e59174092b109381029381029381029381029381029381029381029";
      else hash = "a4b2c3d1e0f98271a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2";
    } else if (cmd === "md5sum") {
      hash = "d41d8cd98f00b204e9800998ecf8427e";
    } else {
      hash = "da39a3ee5e6b4b0d3255bfef95601890afd80709";
    }
    return {
      type: "success",
      text: `${hash}  ${args[0]} [VERIFIED COURT HASH - EVIDENCE UNALTERED]`
    };
  }

  if (cmd === "file") {
    if (!args[0]) return { type: "error", text: "file: missing operand" };
    const target = resolvePath(args[0], currentPath);
    if (target.includes("memdump.raw")) return { type: "output", text: `${args[0]}: Windows 64-bit physical memory dump, 8388608 pages, Little-Endian` };
    if (target.includes("usb_image.dd")) return { type: "output", text: `${args[0]}: DOS/MBR boot sector; partition 1: ID=0x7, start-sector 2048, 62531584 sectors, NTFS` };
    if (target.includes("pcap")) return { type: "output", text: `${args[0]}: tcpdump capture file (little-endian) - version 2.4 (Ethernet, capture length 262144)` };
    if (target.includes("sqlite")) return { type: "output", text: `${args[0]}: SQLite 3.x database, last written using SQLite 3.39.2` };
    if (target.includes(".log") || target.includes(".txt") || target.includes(".md")) return { type: "output", text: `${args[0]}: UTF-8 Unicode text, with CRLF line terminators` };
    return { type: "output", text: `${args[0]}: data` };
  }

  if (cmd === "strings") {
    if (rawCmd.includes("grep")) {
      return {
        type: "output",
        text: `CARVED PLAINTEXT MEMORY STRINGS:
Offset 0x0041F820: password=AlphaCriminology2026!#
Offset 0x0089C110: BitLocker-Key: 419201-582910-192837-991823
Offset 0x00D12E40: C2_SERVER=192.168.10.144:8443 [ESTABLISHED]
Offset 0x01198A20: API_SECRET=caraga_syndicate_token_99182`
      };
    }
    return {
      type: "output",
      text: `Carved strings sample (first 8 matches):
00000000: MZ...............@......................................
00000040: This program cannot be run in DOS mode.
00000210: HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Services\\EventLog
00000450: C2_BEACON=192.168.10.144:8443
00000520: WINRAR.EXE-A92B3C11.pf
00000780: BitLocker-Key: 419201-582910-192837-991823
00000910: Shorea contorta specimen Nasipit batch #04
00001020: [TIP: Pipe through grep: 'strings memdump.raw | grep -i key']`
    };
  }

  if (cmd === "xxd" || cmd === "hexdump") {
    return {
      type: "output",
      text: `00000000: 4d5a 9000 0300 0000 0400 0000 ffff 0000  MZ..............
00000010: b800 0000 0000 0000 4000 0000 0000 0000  ........@.......
00000020: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000030: 0000 0000 0000 0000 0000 0000 f000 0000  ................
00000040: 0e1f ba0e 00b4 09cd 21b8 014c cd21 5468  ........!..L.!Th
00000050: 6973 2070 726f 6772 616d 2063 616e 6e6f  is program canno
00000060: 7420 6265 2072 756e 2069 6e20 444f 5320  t be run in DOS 
00000070: 6d6f 6465 2e0d 0d0a 2400 0000 0000 0000  mode....$.......`
    };
  }

  if (cmd === "exiftool") {
    return {
      type: "output",
      text: `ExifTool Version Number         : 12.65
File Name                       : drone_telemetry.log
File Size                       : 580 bytes
Camera Model Name               : DJI Mavic 3 Enterprise (Hasselblad L2D-20c)
GPS Latitude                    : 8 deg 59' 2.76" N
GPS Longitude                   : 125 deg 20' 24.36" E
GPS Altitude                    : 85.4 m Above Sea Level
GPS Position                    : 8.9841 N, 125.3401 E (Mt. Mayapay Watershed)
Create Date                     : 2026:10:12 17:21:40 UTC`
    };
  }

  if (cmd === "binwalk") {
    return {
      type: "output",
      text: `DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
0             0x0             Microsoft executable, portable (PE)
512           0x200           Zip archive data, at least v2.0 to extract
1048576       0x100000        OpenPGP Secret Key - RSA 4096 bits
4194304       0x400000        SQLite 3.x database`
    };
  }

  // 3. Volatility Framework (Memory Forensics)
  if (cmd === "volatility" || cmd === "vol") {
    if (rawCmd.includes("windows.pslist") || rawCmd.includes("pslist")) {
      return {
        type: "output",
        text: `VOLATILITY 3 FRAMEWORK (Windows Memory Profile: x64_19041)
PID      PPID     ImageFileName        Offset(V)          Threads  Handles  CreateTime (UTC)
----------------------------------------------------------------------------------------------------
4        0        System               0xfa800102e040     142      0        2026-10-12 21:00:02
480      4        smss.exe             0xfa8001421040     3        32       2026-10-12 21:00:04
640      612      csrss.exe            0xfa8001650040     11       480      2026-10-12 21:00:06
720      612      wininit.exe          0xfa8001712040     4        82       2026-10-12 21:00:06
1024     720      services.exe         0xfa8001850040     9        280      2026-10-12 21:00:08
1420     720      lsass.exe            0xfa8001920040     8        940      2026-10-12 21:00:09
2810     1024     explorer.exe         0xfa8002140040     34       1280     2026-10-12 21:02:14
3200     2810     winword.exe          0xfa8002950040     18       412      2026-10-12 23:40:11
3824     3200     beacon.exe           0xfa8003180040     4        110      2026-10-12 23:42:01 <-- ANOMALOUS SPAWN

[SUSPICIOUS PROCESS DETECTED]:
PID 3824 (beacon.exe) spawned by winword.exe (PID 3200) via weaponized Office macro execution.`
      };
    }

    if (rawCmd.includes("windows.netscan") || rawCmd.includes("netscan")) {
      return {
        type: "output",
        text: `VOLATILITY 3 NETWORK SCANNER (Active Network Sockets)
Offset(P)          Proto    LocalAddr:Port         ForeignAddr:Port       State        PID    Owner
----------------------------------------------------------------------------------------------------
0xd12e40           TCPv4    192.168.10.45:49712    192.168.10.144:8443    ESTABLISHED  3824   beacon.exe
0xd15a20           TCPv4    0.0.0.0:135            0.0.0.0:0              LISTENING    1024   services.exe
0xd18f10           UDPv4    127.0.0.1:5353         *:*                                 1420   lsass.exe

[C2 TUNNEL IDENTIFIED]:
PID 3824 (beacon.exe) has active outbound TLS connection to 192.168.10.144 on port 8443!`
      };
    }

    if (rawCmd.includes("windows.malfind") || rawCmd.includes("malfind")) {
      return {
        type: "output",
        text: `VOLATILITY 3 MALFIND (Injected Executable Memory Pages)
Process: beacon.exe Pid: 3824 Address: 0x00d10000 Vad Tag: VadS Permissions: PAGE_EXECUTE_READWRITE
0x00d10000  4d 5a 90 00 03 00 00 00 04 00 00 00 ff ff 00 00  MZ..............
0x00d10010  b8 00 00 00 00 00 00 00 40 00 00 00 00 00 00 00  ........@.......
Disassembly:
0x00d10040  55                      PUSH RBP
0x00d10041  48 89 E5                MOV RBP, RSP
0x00d10044  48 83 EC 20             SUB RSP, 0x20
0x00d10048  E8 00 00 00 00          CALL 0x00d1004D`
      };
    }

    if (rawCmd.includes("windows.cmdline") || rawCmd.includes("cmdline")) {
      return {
        type: "output",
        text: `VOLATILITY 3 CMDLINE PARSER:
PID 4: System
PID 3200: "C:\\Program Files\\Microsoft Office\\root\\Office16\\WINWORD.EXE" /n "E:\\CONFIDENTIAL_INVESTIGATION_DOSSIER.docm"
PID 3824: "C:\\Users\\Victim\\AppData\\Local\\Temp\\beacon.exe" -s 192.168.10.144 -p 8443 -k caraga2026`
      };
    }

    if (rawCmd.includes("windows.hashdump") || rawCmd.includes("hashdump")) {
      return {
        type: "output",
        text: `VOLATILITY 3 SAM HASH EXTRACTION:
Administrator:500:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
investigator:1001:aad3b435b51404eeaad3b435b51404ee:8846f7eaee8fb117ad06bdd830b7586c:::`
      };
    }

    return {
      type: "output",
      text: `Volatility 3 usage:
  volatility -f <memdump.raw> windows.pslist
  volatility -f <memdump.raw> windows.netscan
  volatility -f <memdump.raw> windows.malfind
  volatility -f <memdump.raw> windows.cmdline
  volatility -f <memdump.raw> windows.hashdump`
    };
  }

  // 4. Network Forensics (tshark, tcpdump, nmap)
  if (cmd === "pcap-info") {
    return {
      type: "output",
      text: `PCAP HEADER ANALYSIS: suspect_traffic.pcap
--------------------------------------------------------------------------------
Capture Format:         Wireshark / Libpcap (Little-Endian)
Total Packets Captured: 1,428 frames
Capture Window:         2026-10-12 22:04:12 UTC - 2026-10-12 22:09:44 UTC
Protocols Present:      Ethernet II, IPv4, TCP (88%), HTTP (12%), DNS (2%)
Source IP:              192.168.1.105 (Victim Terminal)
Destination IP:         192.168.1.1 (Gateway) -> 172.67.142.12 (Spoofed Portal)`
    };
  }

  if (cmd === "tshark" || cmd === "tcpdump") {
    if (rawCmd.includes("POST") || rawCmd.includes("follow") || rawCmd.includes("http")) {
      return {
        type: "output",
        text: `================================================================================
RECONSTRUCTED TCP STREAM #2 (UNENCRYPTED HTTP POST TRANSMISSION)
===============================================================================
POST /auth/login HTTP/1.1
Host: secure-urios-edu-ph.serveo.net
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)
Content-Type: application/x-www-form-urlencoded
Content-Length: 58

username=admin&password=AlphaCriminology2026!&client_token=9281

HTTP/1.1 302 Found
Location: /portal/dashboard.php?session=compromised`
      };
    }
    return {
      type: "output",
      text: `tshark frame capture sample:
1   0.000000 192.168.1.105 -> 1.1.1.1      DNS Standard query 0x12a4 A secure-urios-edu-ph.serveo.net
2   0.021040 1.1.1.1       -> 192.168.1.105 DNS Standard query response 0x12a4 A 172.67.142.12
3   0.034010 192.168.1.105 -> 172.67.142.12 TCP 49821 -> 80 [SYN] Seq=0
4   0.052020 172.67.142.12 -> 192.168.1.105 TCP 80 -> 49821 [SYN, ACK] Seq=0 Ack=1
5   0.052100 192.168.1.105 -> 172.67.142.12 HTTP POST /auth/login HTTP/1.1 (application/x-www-form-urlencoded)
6   0.089410 172.67.142.12 -> 192.168.1.105 HTTP/1.1 302 Found (text/html)`
    };
  }

  if (cmd === "nmap") {
    const target = args[args.length - 1] || "192.168.10.144";
    return {
      type: "output",
      text: `Starting Nmap 7.94 ( https://nmap.org ) at 2026-10-13 00:00 UTC
Nmap scan report for ${target}
Host is up (0.0012s latency).
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 8.9p1 Ubuntu
80/tcp   open  http    nginx 1.18.0 (Phishing Portal)
8443/tcp open  ssl/c2  Cobalt Strike Malleable C2 Beacon Listener
MAC Address: 08:00:27:1A:BC:44 (Oracle VirtualBox NIC)`
    };
  }

  if (cmd === "ping") {
    const target = args[0] || "192.168.10.144";
    return {
      type: "output",
      text: `PING ${target} (${target}) 56(84) bytes of data.
64 bytes from ${target}: icmp_seq=1 ttl=64 time=0.412 ms
64 bytes from ${target}: icmp_seq=2 ttl=64 time=0.380 ms
64 bytes from ${target}: icmp_seq=3 ttl=64 time=0.395 ms
--- ${target} ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2004ms`
    };
  }

  if (cmd === "curl") {
    return {
      type: "output",
      text: `HTTP/1.1 302 Found
Server: nginx/1.18.0
Date: Tue, 13 Oct 2026 00:00:01 GMT
Content-Type: text/html; charset=UTF-8
Location: /portal/dashboard.php?session=compromised
Set-Cookie: PHPSESSID=9a8b7c6d5e4f3a2b1c; path=/`
    };
  }

  // 5. Windows Artifact & Registry Forensics
  if (cmd === "reg-query" || cmd === "reg") {
    return {
      type: "output",
      text: `HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Enum\\USBSTOR
--------------------------------------------------------------------------------
Key: Disk&Ven_SanDisk&Prod_Ultra_USB_3.0&Rev_1.00
  Subkey (Hardware Serial Number): 4C530001230415112041
  DeviceDesc:       @disk.inf,%disk_devdesc%;Disk drive
  FriendlyName:     SanDisk Ultra USB 3.0 Device
  ContainerID:      {4a83910c-5128-48f1-9128-892182019283}
  FirstInstallDate: 2026-10-12 23:14:02 UTC
  LastArrivalDate:  2026-10-12 23:14:05 UTC

MountedDevices Correlation:
  Drive Letter:     E:\\ (Volume GUID: {a1b2c3d4-e5f6-7890-1234-56789abcdef0})
  Volume Label:     PERSONAL_DRIVE

[INVESTIGATIVE FINDING]:
Removable flash drive (Serial: 4C530001230415112041) was physically connected at 23:14:02 UTC.`
    };
  }

  if (cmd === "prefetch-dump" || rawCmd.includes("WINRAR.EXE")) {
    return {
      type: "output",
      text: `WINDOWS PREFETCH PARSER (SANS Hunt Evil - SCCA Format)
File: C:\\Windows\\Prefetch\\WINRAR.EXE-A92B3C11.pf
--------------------------------------------------------------------------------
Header Signature:      SCCA (Windows 10/11)
Executable:            WINRAR.EXE
Run Count:             14
First Run Time:        2026-09-15 08:30:12 UTC
Last Run Timestamp:    2026-10-12 23:16:45 UTC
Previous Run Times:    2026-10-12 23:14:50 UTC, 2026-10-11 14:10:00 UTC
Execution Path:        \\DEVICE\\HARDDISKVOLUME3\\PROGRAM FILES\\WINRAR\\WINRAR.EXE

Referenced Files:
  [1] \\DEVICE\\HARDDISKVOLUME3\\USERS\\SUSPECT\\DOCUMENTS\\PATENT_DOSSIERS_2026\\
  [2] \\DEVICE\\HARDDISKVOLUME4\\TARGET_EXPORT\\dossier_archive.rar -> MOUNTED ON DRIVE E:\\`
    };
  }

  if (cmd === "mft-compare") {
    return {
      type: "output",
      text: `NTFS $MFT ATTRIBUTE CONTRAST (Anti-Forensics Timestomp Audit)
Target File: E:\\dossier_archive.rar
--------------------------------------------------------------------------------
Attribute                      Created (UTC)         Modified (UTC)        MFT Altered (UTC)
$STANDARD_INFORMATION (SIA):   2019-01-15 10:00:00   2019-01-15 10:00:00   2026-10-12 23:20:15
$FILE_NAME (FNA):              2026-10-12 23:19:30   2026-10-12 23:19:30   2026-10-12 23:19:30

ANALYSIS FINDING:
DIVERGENCE DETECTED. $STANDARD_INFORMATION was deliberately backdated to 2019 using timestomping,
while immutable $FILE_NAME retains true creation timestamp of 2026-10-12 23:19:30 UTC.`
    };
  }

  if (cmd === "mft-dump") {
    return {
      type: "output",
      text: `NTFS $MFT RECORD PARSER:
Record #14021:
  Filename: dossier_archive.rar
  Parent Directory: #14018 (\\TARGET_EXPORT\\)
  Flags: In-Use | Archive
  Data Streams: $DATA (Non-resident, 4,210,480 bytes, 1,028 clusters allocated)`
    };
  }

  if (cmd === "evtx-dump") {
    return {
      type: "output",
      text: `WINDOWS SECURITY EVENT LOG PARSER:
Event ID 4624 (Successful Logon):
  TargetUserName: suspect | LogonType: 2 (Interactive) | Time: 2026-10-12 21:05:00 UTC
Event ID 7045 (New Service Installed):
  ServiceName: CobaltBeacon | ImagePath: C:\\Windows\\Temp\\beacon.exe | Time: 2026-10-12 23:42:01 UTC`
    };
  }

  // 6. Green Forensics & Environmental Law Utilities
  if (cmd === "parse-sawdust") {
    return {
      type: "output",
      text: `GREEN FORENSICS BOTANY REPORT (Stereomicroscopic Morphology)
Specimen: Nasipit Seaport Carton Batch #04 Sawdust Residue
--------------------------------------------------------------------------------
Anatomical Features:
  - Vessel Elements: Solitary & radial multiples of 2-3 pores (Pore diameter: 220 µm)
  - Axial Resin Canals: Concentric tangential bands observed
  - Ray Geometry: Multiseriate rays (3-5 cells wide), Heterocellular

BOTANICAL ATTRIBUTION:
  Scientific Name:   Shorea contorta (White Lauan)
  Family:            Dipterocarpaceae (Native Philippine Hardwood)
  Conservation Code: CRITICALLY ENDANGERED (IUCN Red List / Philippine Red List)
  Harvest Ban:       PD 705 Section 68 & Executive Order 23 (Total Logging Ban)`
    };
  }

  if (cmd === "drone-gps") {
    return {
      type: "output",
      text: `DRONE FLIGHT LOG RECORDER (DJI Mavic 3 Enterprise Triage)
Waypoint #1:  Lat 8.9812° N, Lon 125.3380° E | Alt: 120m | Time: 2026-10-12 17:15:02
Waypoint #2:  Lat 8.9842° N, Lon 125.3401° E | Alt:  85m | Time: 2026-10-12 17:21:40 <-- HOVER (LOGGING SITE)
Waypoint #3:  Lat 8.9860° N, Lon 125.3425° E | Alt: 140m | Time: 2026-10-12 17:35:10
GIS Location: Mount Mayapay Watershed Reserve, Butuan City boundary (PD 705 Protected Area)`
    };
  }

  if (cmd === "statute-check" || cmd === "denr-lookup") {
    return {
      type: "output",
      text: `PHILIPPINE ENVIRONMENTAL LAW COMPLIANCE CHECK:
Species: Shorea contorta (White Lauan)
Status:  CRITICALLY ENDANGERED (DENR Administrative Order DAO 2017-11)
Statute: Presidential Decree No. 705 (Revised Forestry Code of the Philippines) Section 68
Violation: Cutting, gathering and/or collecting timber or other forest products without license.
Penalty: Penalized under Articles 309 and 310 of the Revised Penal Code (Qualified Theft).`
    };
  }

  // 7. Statutory & Legal Queries
  if (cmd === "statute") {
    const law = (args[0] || "").toLowerCase();
    if (law.includes("10175") || law.includes("cyber")) {
      return {
        type: "output",
        text: `REPUBLIC ACT NO. 10175 (Cybercrime Prevention Act of 2012):
Section 4(a)(1): Illegal Access - Accessing a computer system without right.
Section 4(a)(2): Illegal Interception - Interception by technical means of non-public transmissions.
Section 4(a)(3): Data Interference - Intentional alteration, damaging, deletion or deterioration.
Section 4(a)(4): System Interference - Intentional hindering of computer systems (e.g. ransomware).
Section 15: Search, Seizure and Examination of Computer Data under Warrant (WSCD / WDCD).`
      };
    }
    if (law.includes("10173") || law.includes("privacy")) {
      return {
        type: "output",
        text: `REPUBLIC ACT NO. 10173 (Data Privacy Act of 2012):
Section 20: Security of Personal Information (Integrity & confidentiality obligations).
Section 21: Principle of Accountability.
Section 25: Unauthorized Processing of Personal Information and Sensitive Personal Information.`
      };
    }
    if (law.includes("705") || law.includes("forest")) {
      return {
        type: "output",
        text: `PRESIDENTIAL DECREE NO. 705 (Revised Forestry Code):
Section 68: Cutting, Gathering and/or Collecting Timber without Authority.
Confiscation of timber contraband, conveying machinery, and tools utilized in forest reserves.`
      };
    }
    return {
      type: "output",
      text: `Available statutes:
  statute ra10175    (Cybercrime Prevention Act)
  statute ra10173    (Data Privacy Act)
  statute pd705      (Revised Forestry Code)
  statute ra9147     (Wildlife Resources Conservation and Protection Act)`
    };
  }

  if (cmd === "warrant-check") {
    return {
      type: "output",
      text: `SUPREME COURT RULE ON CYBERCRIME WARRANTS (A.M. No. 17-11-03-SC):
Warrant Type: WSCD (Warrant to Search, Seize and Examine Computer Data)
Issuing Court: Regional Trial Court (Cybercrime Special Court - Butuan City)
Chain of Custody Rule: Requires hash generation (SHA-256) immediately upon seizure.`
    };
  }

  if (cmd === "chain-of-custody") {
    return {
      type: "success",
      text: `EVIDENCE CHAIN OF CUSTODY VERIFICATION:
- Primary Bag Seal: #PH-89102 [VERIFIED INTACT]
- Image SHA-256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069 [MATCH]
- Acquired Under: ISO/IEC 27037 Standard Practice for Digital Evidence Handling`
    };
  }

  // 8. Kali Linux Offensive & Defensive Tool Suite
  if (cmd === "kali" || cmd === "dragon") {
    return {
      type: "output",
      text: `
..............
            ..,;:cccccccccc:;..
        .,cccccccccccccccccccccc:..
      .:cccccccccccccccccccccccccccc:.
    .;ccccccccccccc;.:cccccccccccccccc;.
   .:ccccccccccccc;   .ccccccccccccccccc:   KALI LINUX 2026.1 (ROLLING)
  .:ccccccccccccc;     .ccccccccccccccccc:. FSUU Criminal Justice Education
  .cccccccccccccc;     .cccccccccccccccccc. FSUU Cybercrime & DFIR Lab
  .cccccccccccccc;     .cccccccccccccccccc.
  .cccccccccccccc;     .cccccccccccccccccc. "The Quieter You Become,
   :ccccccccccccc;     .ccccccccccccccccc:   The More You Are Able To Hear"
    ;cccccccccccc;     .cccccccccccccccc;
     :cccccccccccc:.   .cccccccccccccccc:   Type 'help' to view all Kali tools.
      .ccccccccccccc:;.:cccccccccccccccc.
        .:cccccccccccccccccccccccccccc:.
          ..,;:cccccccccccccccccccc:;..`
    };
  }

  if (cmd === "neofetch") {
    return {
      type: "output",
      text: `       ..............                  student@fsuu-forensics
            ..,;:cccccccccc:;..        --------------------
        .,cccccccccccccccccccccc:..    OS: Kali GNU/Linux Rolling x86_64
      .:cccccccccccccccccccccccccccc:. Host: FSUU Forensic Cyber Lab
    .;ccccccccccccc;.:cccccccccccccccc;.Kernel: 6.8.0-kali1-amd64
   .:ccccccccccccc;   .ccccccccccccccccc:Uptime: 2 hours, 48 mins
  .:ccccccccccccc;     .ccccccccccccccccc:.Packages: 2,914 (dpkg)
  .cccccccccccccc;     .cccccccccccccccccc.Shell: zsh 5.9
  .cccccccccccccc;     .cccccccccccccccccc.Resolution: 1920x1080
  .cccccccccccccc;     .cccccccccccccccccc.DE: XFCE 4.18 (OffSec Edition)
   :ccccccccccccc;     .ccccccccccccccccc:WM: Xfwm4
    ;cccccccccccc;     .cccccccccccccccc; Theme: Kali-Dark [GTK2/3]
     :cccccccccccc:.   .cccccccccccccccc: Icons: Flat-Remix-Blue-Dark
      .ccccccccccccc:;.:cccccccccccccccc. Terminal: qterminal / zsh
        .:cccccccccccccccccccccccccccc:. CPU: AMD EPYC 7763 64-Core (8) @ 2.45GHz
          ..,;:cccccccccccccccccccc:;.. GPU: VMware SVGA II Adapter
                                       Memory: 3840MiB / 16384MiB (DDR4)`
    };
  }

  if (cmd === "msfconsole" || cmd === "msf" || cmd === "metasploit") {
    return {
      type: "output",
      text: `
  + -- --=[ Metasploit Framework 6.4.12-dev (Kali Linux)               ]=-- +
  + -- --=[ 2,410 exploits - 1,248 auxiliary - 428 post               ]=-- +
  + -- --=[ 1,465 payloads - 46 encoders - 13 nops                    ]=-- +
  + -- --=[ Free Software Foundation • Rapid7 LLC                      ]=-- +

       =[ metamodule  : forensic-triage/criminology-cdi409            ]
       =[ target      : 192.168.10.144 (Caraga Syndicate C2 Server)   ]
       =[ status      : Active forensic triage listener ready         ]

msf6 > [*] Loaded forensic correlation rules under RA 10175 Sec. 4(a)(1)
msf6 > type 'help' or examine artifacts in Thunar / Autopsy.`
    };
  }

  if (cmd === "john" || cmd === "johntheripper") {
    const target = args[args.length - 1] || "hash.txt";
    return {
      type: "output",
      text: `Loaded 1 password hash (sha512crypt, crypt(3) $6$ [SHA512 256/256 AVX2 4x])
Cost 1 (iteration count) is 5000 for all loaded hashes
Will run 8 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
AlphaCriminology2026!# (investigator)     
1g 0:00:00:00 DONE (2026-10-13 00:00) 14.28g/s 2410p/s 2410c/s 2410C/s Alpha2026..AlphaCriminology2026!#
Use the "--show" option to display all of the cracked passwords reliably
Session completed.`
    };
  }

  if (cmd === "hashcat") {
    return {
      type: "output",
      text: `hashcat (v6.2.6) starting in benchmark / forensic cracking mode...

OpenCL API (OpenCL 3.0 PoCL 3.0+git) - Platform #1 [The pocl project]
================================================================================
* Device #1: pthread-AMD EPYC 7763, 4096/16384 MB (1024 MB allocatable), 8MCU

Hash.Mode........: 1000 (NTLM)
Speed.#1.........:  1,428.4 MH/s (34.12ms) @ Accel:1024 Loops:1024 Thr:1 Vec:8
Status...........: Cracked
Hash.Target......: 31d6cfe0d16ae931b73c59d7e0c089c0
Hash.Cracked.....: AlphaCriminology2026!#
Recovered........: 1/1 (100.00%) Digests`
    };
  }

  if (cmd === "aircrack-ng") {
    return {
      type: "output",
      text: `Aircrack-ng 1.7 (WPA/WPA2 Handshake Cracker - Kali Linux)

                               [00:00:04] 1420/2840 keys tested (352.1 k/s)

                               Time left: 0 seconds              50.00%

                         KEY FOUND! [ cybersec2026 ]

      Master Key     : B4 A1 90 28 17 CD 98 12 EF 44 91 82 73 64 55 10
      Transient Key  : 7F 83 B1 65 7F F1 FC 53 B9 2D C1 81 48 A1 D6 5D
      EAPOL HMAC     : 24 10 98 12 EF 77 12 34 AC BD 12 99 81 23 45 67`
    };
  }

  if (cmd === "sqlmap") {
    return {
      type: "output",
      text: `        ___
       __H__
 ___ ___[.]_____ ___ ___  {1.7.11#stable}
|_ -| . ["]     | .'| . |
|___|_  ["]_|_|_|__,|  _|
      |_|V...       |_|   https://sqlmap.org

[*] starting @ 00:00:01 /2026-10-13/
[INFO] testing connection to the target URL
[INFO] checking if the target is protected by some WAF/IPS
[INFO] testing if the parameter 'id' is dynamic
[INFO] confirming that parameter 'id' is dynamic
[+] Parameter 'id' is vulnerable!
Type: boolean-based blind
Title: AND boolean-based blind - WHERE or HAVING clause
Payload: id=1 AND 8912=8912
[INFO] back-end DBMS: SQLite 3.x
[INFO] fetching tables for database: 'confidential_db'
[+] Database: main
Table: contacts (4 entries)
Table: c2_transactions (12 entries)`
    };
  }

  if (cmd === "hydra") {
    return {
      type: "output",
      text: `Hydra v9.5 (c) 2026 by van Hauser / THC & David Maciejak - Please do not use in military or secret service organizations!
Hydra (https://github.com/vanhauser-thc/thc-hydra) starting at 2026-10-13 00:00:01
[DATA] max 16 tasks per 1 server, overall 16 tasks, 14 login tries (l:1/p:14), ~1 try per task
[DATA] attacking ssh://192.168.10.144:22/
[22][ssh] host: 192.168.10.144   login: investigator   password: AlphaCriminology2026!#
1 of 1 target successfully completed, 1 valid password found`
    };
  }

  if (cmd === "nikto") {
    return {
      type: "output",
      text: `- Nikto v2.5.0
---------------------------------------------------------------------------
+ Target IP:          192.168.10.144
+ Target Hostname:    c2-beacon.phishing.lab
+ Target Port:        80
---------------------------------------------------------------------------
+ Server: nginx/1.18.0 (Ubuntu)
+ /auth/login.php: HTTP POST form transmits credentials in cleartext.
+ /portal/admin: Default administrative interface exposed without MFA.
+ OSVDB-3092: /etc/shadow or confidential backups discovered in /.git/ directory.
+ 7524 requests: 0 error(s) and 3 item(s) reported on remote host`
    };
  }

  if (cmd === "ifconfig" || cmd === "ip") {
    return {
      type: "output",
      text: `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.10.45  netmask 255.255.255.0  broadcast 192.168.10.255
        inet6 fe80::a00:27ff:fe1a:bc44  prefixlen 64  scopeid 0x20<link>
        ether 08:00:27:1a:bc:44  txqueuelen 1000  (Ethernet)
        RX packets 24819  bytes 18491204 (17.6 MiB)
        TX packets 19402  bytes 4810294 (4.5 MiB)

wlan0mon: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        unspec 00-C0-CA-98-12-34-00-00-00-00-00-00-00-00-00-00  txqueuelen 1000
        (IEEE 802.11 Monitor Mode - Alfa AWUS036ACH - Channel 6)

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        inet6 ::1  prefixlen 128  scopeid 0x10<host>`
    };
  }

  if (cmd === "netstat" || cmd === "ss") {
    return {
      type: "output",
      text: `Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name    
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      842/sshd            
tcp        0      0 127.0.0.1:8080          0.0.0.0:*               LISTEN      1420/burpsuite      
tcp        0      0 192.168.10.45:49821     172.67.142.12:80        ESTABLISHED 3120/wireshark      
tcp        0      0 192.168.10.45:49712     192.168.10.144:8443     ESTABLISHED 3410/c2_beacon`
    };
  }

  if (cmd === "sudo" || cmd === "su") {
    if (args.includes("su") || cmd === "su") {
      return {
        type: "success",
        text: `Switched session to root@kali-fsuu [UID 0]. Prompt elevated to '#'!`
      };
    }
    return {
      type: "info",
      text: `[sudo] password for kali: [OK] Permission granted.`
    };
  }

  if (cmd === "whoami") {
    return { type: "output", text: "kali" };
  }

  if (cmd === "id") {
    return { type: "output", text: "uid=1000(kali) gid=1000(kali) groups=1000(kali),4(adm),24(cdrom),27(sudo),30(dip),46(plugdev),108(wireshark),123(kaboxer)" };
  }

  if (cmd === "uname") {
    if (rawCmd.includes("-a") || rawCmd.includes("-r")) {
      return { type: "output", text: "Linux kali-fsuu 6.8.0-kali1-amd64 #1 SMP PREEMPT_DYNAMIC Kali 6.8.0-1kali1 (2026-03-01) x86_64 GNU/Linux" };
    }
    return { type: "output", text: "Linux" };
  }

  if (cmd === "date") {
    return { type: "output", text: new Date().toUTCString() };
  }

  if (cmd === "uptime") {
    return { type: "output", text: " 00:00:00 up 4:12,  1 user,  load average: 0.14, 0.08, 0.02" };
  }

  if (cmd === "df") {
    return {
      type: "output",
      text: `Filesystem     1K-blocks     Used Available Use% Mounted on
/dev/sda1       51474432  8192412  40645620  17% /
/dev/sdb1        4194304  4194304         0 100% /evidence (ro,nodev,noexec)
tmpfs            8192000    12040   8179960   1% /tmp`
    };
  }

  if (cmd === "free") {
    return {
      type: "output",
      text: `               total        used        free      shared  buff/cache   available
Mem:        16384000     3420000    10240000       45000     2724000    12514000
Swap:        4194304           0     4194304`
    };
  }

  if (cmd === "ps") {
    return {
      type: "output",
      text: `  PID TTY          TIME CMD
 1001 pts/0    00:00:00 bash
 1402 pts/0    00:00:00 ps`
    };
  }

  if (cmd === "top") {
    return {
      type: "output",
      text: `top - 00:00:01 up 4:12,  1 user,  load average: 0.12, 0.08, 0.02
Tasks: 182 total,   1 running, 181 sleeping,   0 stopped,   0 zombie
%Cpu(s):  1.2 us,  0.4 sy,  0.0 ni, 98.4 id,  0.0 wa,  0.0 hi,  0.0 si
MiB Mem :  16000.0 total,  10000.0 free,   3340.0 used,   2660.0 buff/cache`
    };
  }

  if (cmd === "env") {
    return {
      type: "output",
      text: `SHELL=/usr/bin/zsh
USER=kali
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/tools:/usr/share/kali-menu
PWD=${currentPath}
HOME=/home/kali
LANG=en_US.UTF-8
TERM=xterm-256color
KALI_RELEASE=2026.1-rolling
XDG_CURRENT_DESKTOP=XFCE
DESKTOP_SESSION=xfce`
    };
  }

  if (cmd === "clear") {
    return { type: "clear", text: "" };
  }

  if (cmd === "help" || cmd === "man") {
    return {
      type: "output",
      text: `KALI LINUX 2026.1 ROLLING • PENETRATION & FORENSIC SUITE:
================================================================================
🐉 KALI SIGNATURE ARSENAL:
  kali / dragon                 Display authentic Kali Dragon ASCII banner
  neofetch                      Display full Kali system specs & OS artwork
  msfconsole / msf              Launch Metasploit Framework 6 console
  john <hash_file>              John the Ripper password recovery
  hashcat                       High-performance rule-based hash cracker
  aircrack-ng                   WPA/WPA2 wireless handshake key cracker
  sqlmap -u <target>            Automated SQL injection audit
  hydra -l user -P list <ip>    High-speed network login bruteforce
  nikto -h <target>             Web server vulnerability assessment
  ifconfig / ip a               Network interfaces (eth0, wlan0mon, lo)
  netstat -tuln / ss            Active listening services & sockets
  sudo su / su -                Elevate to root UID 0

FILESYSTEM UTILITIES:
  pwd                           Print current working directory
  cd <dir>                      Change directory (e.g. 'cd /evidence', 'cd /logs', 'cd ~')
  ls [-la] [dir]                List files and directories with sizes & permissions
  cat <file>                    Display file contents (e.g. 'cat /etc/os-release')
  head / tail <file>            Display top or bottom lines
  touch <file>                  Create a new file
  mkdir <dir>                   Create a new directory
  rm <file>                     Delete file
  echo "text" > <file>          Write or append (>>) text to file
  find [dir]                    Search for files recursively
  wc -l <file>                  Count lines

EVIDENCE INTEGRITY & TRIAGE:
  sha256sum / md5sum <file>     Compute court-admissible forensic hashes
  file <file>                   Determine file MIME type and magic bytes
  strings <file> | grep <term>  Extract readable strings (passwords, C2 endpoints)
  xxd <file>                    Display authentic hexadecimal dump
  exiftool <file>               Extract metadata and GPS tags
  binwalk <file>                Scan for embedded signatures & firmware

MEMORY FORENSICS (Volatility 3):
  volatility -f memdump.raw windows.pslist     Enumerate processes & PIDs
  volatility -f memdump.raw windows.netscan    Active sockets & C2 IP addresses
  volatility -f memdump.raw windows.malfind    Detect injected code pages
  volatility -f memdump.raw windows.cmdline    Process command lines
  volatility -f memdump.raw windows.hashdump   Carve SAM password hashes

NETWORK DISSECTION (Tshark & Wireshark):
  pcap-info <file.pcap>                        Summary of captured frames
  tshark -r <file.pcap>                        Frame summary stream
  tshark -r <file.pcap> -Y <filter>            Apply Wireshark display filter
  nmap -sV <target>                            Scan open ports & service banners
  ping <ip> / curl <url>                       Network connectivity probes

WINDOWS ARTIFACT ANALYSIS:
  reg-query <hive_or_key>                      Query USBSTOR / Registry hives
  prefetch-dump <file.pf>                      Inspect execution run counts
  mft-compare <file>                           Detect timestomping divergences
  evtx-dump <file.evtx>                        Windows security event logs

PHILIPPINE STATUTORY REFERENCES:
  statute ra10175                              Cybercrime Prevention Act
  statute ra10173                              Data Privacy Act
  statute pd705                                Revised Forestry Code
  chain-of-custody verify                      Verify tamper seals and hash

SYSTEM COMMANDS:
  whoami, id, uname -a, df, free, ps, date, uptime, clear`
    };
  }

  return {
    type: "error",
    text: `zsh: command not found: ${cmd}. Type 'help' to view available Kali forensic utilities.`
  };
}
