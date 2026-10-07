// CDI 409: Realistic Incident Response PCAP & Network Packet Data for Units 4 & 5
export const PCAP_SAMPLE_PACKETS = [
  {
    frameNo: 1,
    time: "0.000000",
    source: "192.168.1.105",
    destination: "192.168.1.1",
    protocol: "DNS",
    length: 74,
    info: "Standard query 0x1a2b A darknet-c2-portal.xyz",
    layer: "Application Layer (DNS Query)",
    details: {
      srcPort: 53210,
      dstPort: 53,
      transId: "0x1a2b",
      flags: "0x0100 (Standard query)",
      queryName: "darknet-c2-portal.xyz",
      queryType: "A (Host Address)",
      verdict: "Suspicious Dynamic DNS Domain (Command & Control Beacon)"
    },
    rawHex: "00 0c 29 8a 44 12 00 50 56 c0 00 08 08 00 45 00 00 3c 1a 2b 00 00 40 11 7c a1 c0 a8 01 69 c0 a8 01 01 cf da 00 35 00 28 8f 4d 1a 2b 01 00 00 01 00 00 00 00 00 00 11 64 61 72 6b 6e 65 74 2d 63 32 2d 70 6f 72 74 61 6c 03 78 79 7a 00 00 01 00 01"
  },
  {
    frameNo: 2,
    time: "0.045120",
    source: "192.168.1.1",
    destination: "192.168.1.105",
    protocol: "DNS",
    length: 90,
    info: "Standard query response 0x1a2b A darknet-c2-portal.xyz A 185.220.101.45",
    layer: "Application Layer (DNS Response)",
    details: {
      srcPort: 53,
      dstPort: 53210,
      transId: "0x1a2b",
      resolvedIp: "185.220.101.45 (Tor Exit Node / Foreign Server)",
      ttl: "300 seconds",
      verdict: "Known Bulletproof Hosting Subnet (Caraga Cyber Investigation Trigger)"
    },
    rawHex: "00 50 56 c0 00 08 00 0c 29 8a 44 12 08 00 45 00 00 4c 1a 2c 00 00 40 11 7c 90 c0 a8 01 01 c0 a8 01 69 00 35 cf da 00 38 a1 2c 1a 2b 81 80 00 01 00 01 00 00 00 00 11 64 61 72 6b 6e 65 74 2d 63 32 2d 70 6f 72 74 61 6c 03 78 79 7a 00 00 01 00 01 c0 0c 00 01 00 01 00 00 01 2c 00 04 b9 dc 65 2d"
  },
  {
    frameNo: 3,
    time: "0.089410",
    source: "192.168.1.105",
    destination: "185.220.101.45",
    protocol: "TCP",
    length: 66,
    info: "54218 → 8080 [SYN] Seq=0 Win=64240 Len=0 MSS=1460 WS=256",
    layer: "Transport Layer (TCP 3-Way Handshake)",
    details: {
      srcPort: 54218,
      dstPort: 8080,
      seq: 0,
      flags: "0x002 (SYN)",
      windowSize: 64240,
      verdict: "Initial TCP connection initiation to remote adversary C2"
    },
    rawHex: "00 0c 29 8a 44 12 00 50 56 c0 00 08 08 00 45 00 00 34 a1 10 40 00 40 06 c2 4a c0 a8 01 69 b9 dc 65 2d d3 ca 1f 90 00 00 00 00 a0 02 fa f0 b1 20 00 00 02 04 05 b4 01 03 03 08 01 01 04 02"
  },
  {
    frameNo: 4,
    time: "0.134520",
    source: "185.220.101.45",
    destination: "192.168.1.105",
    protocol: "TCP",
    length: 66,
    info: "8080 → 54218 [SYN, ACK] Seq=0 Ack=1 Win=65535 Len=0",
    layer: "Transport Layer (TCP 3-Way Handshake)",
    details: {
      srcPort: 8080,
      dstPort: 54218,
      seq: 0,
      ack: 1,
      flags: "0x012 (SYN, ACK)",
      verdict: "Port 8080 active and accepting reverse shell connections"
    },
    rawHex: "00 50 56 c0 00 08 00 0c 29 8a 44 12 08 00 45 00 00 34 00 00 40 00 34 06 63 5b b9 dc 65 2d c0 a8 01 69 1f 90 d3 ca e8 a2 11 01 00 00 00 01 a0 12 ff ff 12 a0 00 00 02 04 05 b4 01 01 04 02"
  },
  {
    frameNo: 5,
    time: "0.180100",
    source: "192.168.1.105",
    destination: "185.220.101.45",
    protocol: "HTTP",
    length: 348,
    info: "POST /api/v1/auth/infiltrate HTTP/1.1 (application/x-www-form-urlencoded)",
    layer: "Application Layer (Unencrypted HTTP Payload)",
    details: {
      srcPort: 54218,
      dstPort: 8080,
      method: "POST",
      uri: "/api/v1/auth/infiltrate",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) PowerShell/7.2.1 Exfiltrator",
      payloadContent: "user=fsuu_finance_admin&pass=P@ssw0rd2026!&target_db=caraga_hospital_records.mdf",
      verdict: "CRITICAL EVIDENCE: Exfiltrated cleartext credentials & database identifier"
    },
    rawHex: "50 4f 53 54 20 2f 61 70 69 2f 76 31 2f 61 75 74 68 2f 69 6e 66 69 6c 74 72 61 74 65 20 48 54 54 50 2f 31 2e 31 0d 0a 48 6f 73 74 3a 20 64 61 72 6b 6e 65 74 2d 63 32 2d 70 6f 72 74 61 6c 2e 78 79 7a 0d 0a 55 73 65 72 2d 41 67 65 6e 74 3a 20 45 78 66 69 6c 74 72 61 74 6f 72 0d 0a 43 6f 6e 74 65 6e 74 2d 54 79 70 65 3a 20 61 70 70 6c 69 63 61 74 69 6f 6e 2f 78 2d 77 77 77 2d 66 6f 72 6d 2d 75 72 6c 65 6e 63 6f 64 65 64 0d 0a 0d 0a 75 73 65 72 3d 66 73 75 75 5f 66 69 6e 61 6e 63 65 5f 61 64 6d 69 6e 26 70 61 73 73 3d 50 40 73 73 77 30 72 64 32 30 32 36 21"
  },
  {
    frameNo: 6,
    time: "0.225900",
    source: "185.220.101.45",
    destination: "192.168.1.105",
    protocol: "HTTP",
    length: 154,
    info: "HTTP/1.1 200 OK (text/plain)",
    layer: "Application Layer (Server Response)",
    details: {
      srcPort: 8080,
      dstPort: 54218,
      status: "200 OK",
      server: "Adversary_C2_v4",
      payloadContent: "STATUS: CREDENTIAL_ACCEPTED | ACTION: INITIATE_RANSOMWARE_ENCRYPTION_ROUTINE",
      verdict: "Forensic proof of unauthorized data access under RA 10175 Section 4(a)(1)"
    },
    rawHex: "48 54 54 50 2f 31 2e 31 20 32 30 30 20 4f 4b 0d 0a 53 65 72 76 65 72 3a 20 41 64 76 65 72 73 61 72 79 5f 43 32 5f 76 34 0d 0a 43 6f 6e 74 65 6e 74 2d 4c 65 6e 67 74 68 3a 20 37 32 0d 0a 0d 0a 53 54 41 54 55 53 3a 20 43 52 45 44 45 4e 54 49 41 4c 5f 41 43 43 45 50 54 45 44"
  }
];

export const PCAP_FILTER_RULES = [
  { filter: "All", label: "All Frames (6 Frames)" },
  { filter: "http", label: "HTTP (Cleartext Payloads)" },
  { filter: "dns", label: "DNS (Domain Resolutions)" },
  { filter: "tcp", label: "TCP (Handshakes & Streams)" },
  { filter: "credentials", label: "🚨 Exfiltrated Credentials Only" }
];
