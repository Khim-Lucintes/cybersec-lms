// Client-side lightweight PDF & Printable Document generator for CDI 409
import { COURSE_INFO } from "@/lib/curriculum";

export function generateCadetGradePDF(studentProfile, grades) {
  if (typeof window === "undefined") return;

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to download the official grade report.");
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>FSUU_CDI409_GradeTranscript_${studentProfile.id || "Cadet"}</title>
      <style>
        @page { size: A4 portrait; margin: 12mm; }
        body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1e293b; margin: 0; padding: 15px; font-size: 12px; }
        .header { background-color: #002D62; color: white; padding: 15px; text-align: center; border-radius: 8px; }
        .header h1 { margin: 0; font-size: 17px; letter-spacing: 0.5px; }
        .header h2 { margin: 4px 0 0 0; font-size: 11px; font-weight: normal; color: #C5A059; }
        .header h3 { margin: 4px 0 0 0; font-size: 10px; font-weight: normal; opacity: 0.9; }
        
        .profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 15px 0; padding: 10px 14px; background: #f8f9fa; border: 1px solid #e2e8f0; border-radius: 6px; }
        .profile-item { font-size: 11px; }
        .profile-item strong { color: #002D62; }

        table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 11px; }
        th { background: #002D62; color: white; text-align: left; padding: 7px 10px; }
        td { padding: 6px 10px; border-bottom: 1px solid #e2e8f0; }
        tr:nth-child(even) { background: #f8f9fa; }
        .highlight-row { background: #eef2ff !important; font-weight: bold; color: #002D62; }
        .final-row { background: #ecfdf5 !important; font-weight: bold; color: #065f46; font-size: 12px; border-top: 2px solid #059669; }

        .section-title { font-size: 12px; font-weight: bold; color: #002D62; margin-top: 15px; border-bottom: 1.5px solid #002D62; padding-bottom: 3px; }

        .signatures { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 35px; text-align: center; }
        .sig-line { border-top: 1px solid #1e293b; margin-top: 30px; padding-top: 5px; font-size: 10px; }
        .sig-name { font-weight: bold; font-size: 11px; }
        .sig-role { color: #64748b; font-size: 9px; }

        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 12px; text-align: right;">
        <button onclick="window.print()" style="background: #002D62; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer;">
          🖨️ Print / Save as PDF
        </button>
      </div>

      <div class="header">
        <h1>FATHER SATURNINO URIOS UNIVERSITY</h1>
        <h2>CRIMINAL JUSTICE EDUCATION PROGRAM — BUTUAN CITY</h2>
        <h3>OFFICIAL CDI 409 CADET FORENSIC EVALUATION & GRADE TRANSCRIPT</h3>
      </div>

      <div class="profile-grid">
        <div class="profile-item"><strong>Cadet Name:</strong> ${studentProfile.name}</div>
        <div class="profile-item"><strong>Course:</strong> ${COURSE_INFO.code} - ${COURSE_INFO.title}</div>
        <div class="profile-item"><strong>Student ID:</strong> ${studentProfile.id}</div>
        <div class="profile-item"><strong>Academic Term:</strong> 1st Semester AY 2026-2027</div>
        <div class="profile-item"><strong>Program:</strong> ${studentProfile.program}</div>
        <div class="profile-item"><strong>Section / Year:</strong> ${studentProfile.section} (${studentProfile.yearLevel})</div>
      </div>

      <div class="section-title">SECTION VIII: OUTCOME-BASED GRADE BREAKDOWN</div>
      <table>
        <thead>
          <tr>
            <th>Evaluation Component</th>
            <th>Weight Share</th>
            <th>Raw Score / 100</th>
            <th>Weighted Share</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Summative Tests (Prelims: 90% + Midterms: 88%)</td>
            <td>60% (1st Half)</td>
            <td>89.00%</td>
            <td>53.40</td>
          </tr>
          <tr>
            <td>Classwork Mean (Quizzes, Practicum Crime Labs, Reports)</td>
            <td>40% (Continuous)</td>
            <td>89.83%</td>
            <td>35.93</td>
          </tr>
          <tr class="highlight-row">
            <td>MIDTERM COMPUTED GRADE</td>
            <td>100%</td>
            <td>-</td>
            <td>89.33%</td>
          </tr>
          <tr>
            <td>Tentative Final Summative (Semi-Finals: 90% + Finals: 95%)</td>
            <td>60% (2nd Half)</td>
            <td>92.50%</td>
            <td>55.50</td>
          </tr>
          <tr>
            <td>Tentative Final Classwork Mean</td>
            <td>40% (Continuous)</td>
            <td>88.16%</td>
            <td>35.26</td>
          </tr>
          <tr class="highlight-row">
            <td>TENTATIVE FINAL GRADE</td>
            <td>100%</td>
            <td>-</td>
            <td>90.76%</td>
          </tr>
          <tr class="final-row">
            <td>OFFICIAL REAL FINAL GRADE (Midterm + 2 x Tentative) / 3</td>
            <td>100%</td>
            <td>90.28%</td>
            <td>1.50 (PASSED)</td>
          </tr>
        </tbody>
      </table>

      <div class="section-title">CHED & INSTITUTIONAL PROGRAM OUTCOMES (OBE ATTAINMENT)</div>
      <table>
        <thead>
          <tr>
            <th style="background: #C5A059; color: #001F44;">Outcome Code</th>
            <th style="background: #C5A059; color: #001F44;">Outcome Title & Scope</th>
            <th style="background: #C5A059; color: #001F44;">Competency Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>POb</strong></td>
            <td>Human Rights & Victim Welfare in Cybercrime Investigation</td>
            <td><strong style="color:#059669;">COMPLIANT / PASSED (94%)</strong></td>
          </tr>
          <tr>
            <td><strong>POc</strong></td>
            <td>Law Enforcement Administration & Digital Evidence Extraction</td>
            <td><strong style="color:#059669;">COMPLIANT / PASSED (92%)</strong></td>
          </tr>
          <tr>
            <td><strong>POd</strong></td>
            <td>Forensic Science & Hardware Volatility Acquisition (Order of Volatility)</td>
            <td><strong style="color:#059669;">COMPLIANT / PASSED (95%)</strong></td>
          </tr>
          <tr>
            <td><strong>POe</strong></td>
            <td>Supreme Court Cybercrime Warrants & Environmental Jurisprudence</td>
            <td><strong style="color:#059669;">COMPLIANT / PASSED (90%)</strong></td>
          </tr>
        </tbody>
      </table>

      <div class="signatures">
        <div>
          <div class="sig-line">
            <div class="sig-name">Faculty / Instructor</div>
            <div class="sig-role">Lead Instructor, CDI 409</div>
          </div>
        </div>
        <div>
          <div class="sig-line">
            <div class="sig-name">Prof. Ann Margarette M. Diez</div>
            <div class="sig-role">Program Coordinator, CJEP</div>
          </div>
        </div>
        <div>
          <div class="sig-line">
            <div class="sig-name">Atty. Cedrick G. Train</div>
            <div class="sig-role">Dean, Criminal Justice Education</div>
          </div>
        </div>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() { window.print(); }, 400);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

export function generateOBECertificatePDF(studentProfile) {
  if (typeof window === "undefined") return;

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to download the certificate.");
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>FSUU_CDI409_OBE_Certificate_${studentProfile.id || "Cadet"}</title>
      <style>
        @page { size: A4 landscape; margin: 10mm; }
        body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1e293b; margin: 0; padding: 15px; }
        .frame { border: 4px double #002D62; padding: 25px; border-radius: 10px; position: relative; text-align: center; }
        .inner-frame { border: 1.5px solid #C5A059; padding: 25px; border-radius: 6px; }
        
        .inst-title { font-size: 20px; font-weight: bold; color: #002D62; margin: 0; letter-spacing: 1px; }
        .inst-sub { font-size: 13px; color: #4a4a4a; margin: 4px 0 0 0; }
        
        .cert-title { font-size: 22px; font-weight: bold; color: #C5A059; margin: 25px 0 10px 0; letter-spacing: 0.5px; }
        .cert-intro { font-size: 12px; color: #64748b; }
        .cadet-name { font-size: 24px; font-weight: bold; color: #002D62; margin: 10px 0; border-bottom: 2px solid #C5A059; display: inline-block; padding: 0 25px 5px 25px; }
        .cadet-details { font-size: 12px; color: #4a4a4a; font-family: monospace; }

        .competency-box { margin: 20px auto; max-width: 600px; text-align: left; font-size: 11.5px; line-height: 1.6; }

        .signatures { display: flex; justify-content: space-around; margin-top: 40px; }
        .sig-block { width: 220px; text-align: center; }
        .sig-line { border-top: 1.5px solid #002D62; padding-top: 5px; font-weight: bold; color: #002D62; font-size: 12px; }
        .sig-title { font-size: 10px; color: #64748b; }

        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 12px; text-align: right;">
        <button onclick="window.print()" style="background: #002D62; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer;">
          🖨️ Print / Save Certificate as PDF
        </button>
      </div>

      <div class="frame">
        <div class="inner-frame">
          <h1 class="inst-title">FATHER SATURNINO URIOS UNIVERSITY</h1>
          <h2 class="inst-sub">CRIMINAL JUSTICE EDUCATION PROGRAM • BUTUAN CITY</h2>
          
          <div class="cert-title">CERTIFICATE OF FORENSIC OUTCOME MASTERY</div>
          <div class="cert-intro">This is to certify that cadet</div>
          
          <div class="cadet-name">${studentProfile.name.toUpperCase()}</div>
          <div class="cadet-details">Student ID: ${studentProfile.id} • ${studentProfile.program} (${studentProfile.section})</div>

          <p style="font-size: 12px; max-width: 650px; margin: 15px auto 5px auto;">
            has successfully demonstrated outcome-based laboratory competencies and legal mastery in <strong>CDI 409: Intro to Cybercrime and Environmental Laws and Protection</strong>.
          </p>

          <div class="competency-box">
            <div>✓ <strong>Digital Forensics Triage:</strong> Hardware Order of Volatility & Anti-Static Extraction</div>
            <div>✓ <strong>Legal Governance:</strong> RA 10175 Offenses & Supreme Court Cybercrime Warrants (A.M. No. 17-11-03-SC)</div>
            <div>✓ <strong>Green Forensics:</strong> Environmental Protection Jurisprudence & CITES Wildlife Classification</div>
          </div>

          <div class="signatures">
            <div class="sig-block">
              <div class="sig-line">Atty. Cedrick G. Train</div>
              <div class="sig-title">Dean, Criminal Justice Education</div>
            </div>
            <div class="sig-block">
              <div class="sig-line">Dr. Arlyn M. Floreta</div>
              <div class="sig-title">Vice President for Academic Affairs</div>
            </div>
          </div>
        </div>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() { window.print(); }, 400);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

// 3. Official PNP-ACG / NBI Standard Chain-of-Custody (CoC) & Evidence Form Generator
export function generateChainOfCustodyPDF(cadetProfile, evidenceDetails) {
  if (typeof window === "undefined") return;

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to generate the official Chain of Custody form.");
    return;
  }

  const profile = cadetProfile || {};
  const defaultEvidence = {
    caseNumber: evidenceDetails?.caseNumber || `CC-FSUU-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    warrantNumber: evidenceDetails?.warrantNumber || "SW-2026-0881-RTC-BR10",
    offenseCharged: evidenceDetails?.offenseCharged || "RA 10175 Sec. 4(a)(1) Illegal Access & Sec. 4(a)(3) Data Interference",
    dateRecovered: evidenceDetails?.dateRecovered || new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }),
    timeRecovered: evidenceDetails?.timeRecovered || "14:30 HRS PST",
    location: evidenceDetails?.location || "Butuan Cybercrime Investigation Scene, Caraga Region",
    investigatorName: evidenceDetails?.investigatorName || profile.name || "Cadet Investigator",
    badgeNumber: evidenceDetails?.badgeNumber || profile.studentId || profile.id || "PNP-2026-4091",
    unitAssigned: evidenceDetails?.unitAssigned || "Regional Anti-Cybercrime Unit 13 (RACU 13)",
    certifyingChief: evidenceDetails?.certifyingChief || "PCOL. MARCO T. DELA CRUZ, CESE",
    certifyingTitle: evidenceDetails?.certifyingTitle || "Chief, Regional Anti-Cybercrime Unit 13 (RACU 13)",
    specimens: evidenceDetails?.specimens || [
      {
        itemNo: "ITEM-01",
        description: "Samsung 980 Pro NVMe PCIe 4.0 SSD 1TB (Seized Storage Drive)",
        serialNumber: "S649NX0W109283A",
        evidenceBagTag: "EB-2026-091-A",
        sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        status: "Forensically Sealed with Anti-Static Tamper Tape"
      },
      {
        itemNo: "ITEM-02",
        description: "Kingston Fury Beast 16GB DDR4-3200 RAM Module (Primary Volatile Memory)",
        serialNumber: "KF432C16BB1/16-9902",
        evidenceBagTag: "EB-2026-091-B",
        sha256: "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e",
        status: "RFC 3227 Volatile Layer Extraction Completed"
      },
      {
        itemNo: "ITEM-03",
        description: "SanDisk Ultra 64GB USB 3.0 Flash Drive containing Target Keylogger Payload",
        serialNumber: "SDCZ48-064G-U46",
        evidenceBagTag: "EB-2026-091-C",
        sha256: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
        status: "Write-Blocked with Hardware Tableau T8u Bridge"
      }
    ],
    custodyLog: evidenceDetails?.custodyLog || [
      {
        time: "15:00 HRS",
        releasedBy: `${evidenceDetails?.investigatorName || profile.name || "Cadet Investigator"}<br/><span style='font-size: 8px;'>(First Responder / Seizing Officer)</span>`,
        receivedBy: "PEMS Renato B. Valdez<br/><span style='font-size: 8px;'>(Evidence Custodian, RACU 13)</span>",
        purpose: "Turnover of seized evidence from crime scene to RACU 13 Forensics Locker",
        condition: "Tamper-Evident Bag Intact; Anti-Static Seal Undamaged"
      },
      {
        time: "16:30 HRS",
        releasedBy: "PEMS Renato B. Valdez<br/><span style='font-size: 8px;'>(Evidence Custodian, RACU 13)</span>",
        receivedBy: "PCMS Elena S. Mercado<br/><span style='font-size: 8px;'>(Forensic Examiner, ACG Lab)</span>",
        purpose: "Bit-Stream Forensic Imaging (EnCase / FTK Imager Forensic Duplicate)",
        condition: "Opened in Faraday Room; Bit-Stream Hash Match Verified"
      },
      {
        time: "18:00 HRS",
        releasedBy: "PCMS Elena S. Mercado<br/><span style='font-size: 8px;'>(Forensic Examiner, ACG Lab)</span>",
        receivedBy: "Atty. Cedrick G. Train<br/><span style='font-size: 8px;'>(Prosecution / Court Custodian)</span>",
        purpose: "Presentation of digital duplicate & verification for Judicial Inquest",
        condition: "Stored in Faraday Evidence Vault under Lock #04"
      }
    ]
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>PNP_CoC_Form_${defaultEvidence.caseNumber}</title>
      <style>
        @page { size: A4 portrait; margin: 10mm; }
        body { font-family: 'Times New Roman', Times, serif; color: #000; margin: 0; padding: 12px; font-size: 11px; line-height: 1.35; }
        
        .header-table { width: 100%; border-collapse: collapse; text-align: center; margin-bottom: 8px; }
        .header-title { font-size: 12px; font-weight: bold; text-transform: uppercase; margin: 1px 0; }
        .header-sub { font-size: 10px; margin: 0; }
        
        .form-title { text-align: center; font-size: 13px; font-weight: bold; border-top: 2px solid #000; border-bottom: 2px solid #000; padding: 4px 0; margin: 8px 0; letter-spacing: 0.5px; }

        .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
        .meta-table td { padding: 3px 5px; font-size: 10.5px; border: 1px solid #777; }
        .meta-label { font-weight: bold; width: 22%; background: #f2f2f2; }
        .meta-val { width: 28%; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10px; }

        .section-header { font-weight: bold; background: #e0e0e0; padding: 3px 6px; font-size: 11px; border: 1px solid #000; margin-top: 8px; text-transform: uppercase; }

        .evidence-table { width: 100%; border-collapse: collapse; margin: 4px 0 10px 0; }
        .evidence-table th { border: 1px solid #000; background: #f2f2f2; padding: 4px; font-size: 10px; text-align: left; }
        .evidence-table td { border: 1px solid #000; padding: 4px; font-size: 9.5px; vertical-align: top; }

        .hash-code { font-family: monospace; font-size: 8.5px; word-break: break-all; color: #222; }

        .custody-table { width: 100%; border-collapse: collapse; margin-top: 4px; }
        .custody-table th { border: 1px solid #000; background: #f2f2f2; padding: 4px; font-size: 9.5px; text-align: center; }
        .custody-table td { border: 1px solid #000; padding: 6px 4px; font-size: 9px; vertical-align: top; }

        .certification-box { border: 1px solid #000; padding: 6px 8px; margin-top: 10px; font-size: 9.5px; text-align: justify; }

        .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 20px; }
        .sig-block { text-align: center; }
        .sig-line { border-top: 1px solid #000; margin-top: 30px; padding-top: 2px; font-weight: bold; font-size: 10px; }
        .sig-role { font-size: 9px; color: #333; }

        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 10px; text-align: right;">
        <button onclick="window.print()" style="background: #002D62; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer;">
          🖨️ Print PNP Official CoC Form (PDF)
        </button>
      </div>

      <table class="header-table">
        <tr>
          <td>
            <div class="header-sub">Republic of the Philippines</div>
            <div class="header-sub">NATIONAL POLICE COMMISSION • PHILIPPINE NATIONAL POLICE</div>
            <div class="header-title">ANTI-CYBERCRIME GROUP • REGIONAL ANTI-CYBERCRIME UNIT 13</div>
            <div class="header-sub">In Coordination with Father Saturnino Urios University Criminal Justice Education</div>
            <div class="header-sub">Camp Rafael C. Rodriguez, Libertad, Butuan City, Agusan del Norte</div>
          </td>
        </tr>
      </table>

      <div class="form-title">EVIDENCE CHAIN OF CUSTODY & PROPERTY RECEIPT FORM (PNP-ACG FORM 04)</div>

      <table class="meta-table">
        <tr>
          <td class="meta-label">CASE CONTROL NO.:</td>
          <td class="meta-val">${defaultEvidence.caseNumber}</td>
          <td class="meta-label">SEARCH WARRANT NO.:</td>
          <td class="meta-val">${defaultEvidence.warrantNumber}</td>
        </tr>
        <tr>
          <td class="meta-label">STATUTORY OFFENSE:</td>
          <td class="meta-val" colspan="3">${defaultEvidence.offenseCharged}</td>
        </tr>
        <tr>
          <td class="meta-label">SEIZING OFFICER:</td>
          <td class="meta-val">${defaultEvidence.investigatorName}</td>
          <td class="meta-label">BADGE / CADET ID:</td>
          <td class="meta-val">${defaultEvidence.badgeNumber}</td>
        </tr>
        <tr>
          <td class="meta-label">DATE & TIME SEIZED:</td>
          <td class="meta-val">${defaultEvidence.dateRecovered} @ ${defaultEvidence.timeRecovered}</td>
          <td class="meta-label">SCENE LOCATION:</td>
          <td class="meta-val">${defaultEvidence.location}</td>
        </tr>
      </table>

      <div class="section-header">I. INVENTORY OF DIGITAL & PHYSICAL EVIDENCE SEIZED</div>
      <table class="evidence-table">
        <thead>
          <tr>
            <th style="width: 8%;">Item #</th>
            <th style="width: 32%;">Item Description & Brand</th>
            <th style="width: 20%;">Serial / Barcode Number</th>
            <th style="width: 15%;">Bag & Tag Tag No.</th>
            <th style="width: 25%;">SHA-256 Forensic Hash Integrity</th>
          </tr>
        </thead>
        <tbody>
          ${defaultEvidence.specimens
            .map(
              (spec) => `
            <tr>
              <td style="text-align: center; font-weight: bold;">${spec.itemNo}</td>
              <td>
                <strong>${spec.description}</strong>
                <div style="font-size: 8.5px; color: #555;">${spec.status}</div>
              </td>
              <td style="font-family: monospace;">${spec.serialNumber}</td>
              <td style="font-weight: bold; text-align: center;">${spec.evidenceBagTag}</td>
              <td class="hash-code">${spec.sha256}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>

      <div class="section-header">II. SUCCESSIVE CHAIN OF CUSTODY LOG</div>
      <table class="custody-table">
        <thead>
          <tr>
            <th style="width: 14%;">Date / Time</th>
            <th style="width: 20%;">Released By (Signature Over Name)</th>
            <th style="width: 20%;">Received By (Signature Over Name)</th>
            <th style="width: 24%;">Purpose of Transfer</th>
            <th style="width: 22%;">Condition / Seal Status</th>
          </tr>
        </thead>
        <tbody>
          ${defaultEvidence.custodyLog
            .map(
              (log) => `
            <tr>
              <td>${defaultEvidence.dateRecovered}<br/>${log.time}</td>
              <td>${log.releasedBy}</td>
              <td>${log.receivedBy}</td>
              <td>${log.purpose}</td>
              <td>${log.condition}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>

      <div class="certification-box">
        <strong>CERTIFICATION OF UNBROKEN CHAIN OF CUSTODY:</strong><br/>
        I HEREBY CERTIFY that the digital and physical evidence described above were recovered in strict compliance with <strong>ISO/IEC 27037:2012</strong> (Guidelines for Identification, Collection, Acquisition and Preservation of Digital Evidence), <strong>Republic Act 10175 (Cybercrime Prevention Act)</strong>, and the <strong>Supreme Court Rule on Cybercrime Warrants (A.M. No. 17-11-03-SC)</strong>. The forensic hashes recorded herein were verified prior to and immediately subsequent to laboratory analysis, confirming that the digital evidence remains unaltered and tamper-free.
      </div>

      <div class="signatures">
        <div class="sig-block">
          <div class="sig-line">${defaultEvidence.investigatorName.toUpperCase()}</div>
          <div class="sig-role">Seizing Officer / Cadet Investigator (${defaultEvidence.badgeNumber})</div>
        </div>
        <div class="sig-block">
          <div class="sig-line">${defaultEvidence.certifyingChief}</div>
          <div class="sig-role">${defaultEvidence.certifyingTitle}</div>
        </div>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() { window.print(); }, 400);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

// 4. Commission on Higher Education (CHED) Form 9 — Report of Ratings (Master Grading Sheet)
export function generateChedForm9PDF(rosterData = [], metadata = {}) {
  if (typeof window === "undefined") return;

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to generate the official CHED Form 9.");
    return;
  }

  const courseCode = metadata.courseCode || COURSE_INFO.code;
  const courseTitle = metadata.courseTitle || COURSE_INFO.title;
  const institution = metadata.institution || COURSE_INFO.institution;
  const department = metadata.department || COURSE_INFO.department;
  const term = metadata.term || "1st Semester, AY 2026-2027";
  const units = metadata.units || "3.0 Units (2.0 Lec / 1.0 Lab)";
  const schedule = metadata.schedule || "MWF 08:00 - 10:00 AM (RACU 13 Cyber Forensics Lab)";
  const instructor = metadata.instructor || "Atty. Cedrick G. Train";
  const sectionLabel = metadata.sectionLabel || "Section Alpha & Section Bravo (Combined Cohort)";
  const curveOffset = Number(metadata.curveOffset || 0);
  const formattedDate = metadata.date || new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });

  const getGpe = (finalGrade) => {
    const g = Number(finalGrade);
    if (g >= 97.5) return { gpe: "1.00", desc: "Excellent", remark: "PASSED" };
    if (g >= 94.5) return { gpe: "1.25", desc: "Superior", remark: "PASSED" };
    if (g >= 91.5) return { gpe: "1.50", desc: "Very Good", remark: "PASSED" };
    if (g >= 88.5) return { gpe: "1.75", desc: "Good", remark: "PASSED" };
    if (g >= 85.5) return { gpe: "2.00", desc: "Satisfactory", remark: "PASSED" };
    if (g >= 82.5) return { gpe: "2.25", desc: "Fairly Satisfactory", remark: "PASSED" };
    if (g >= 79.5) return { gpe: "2.50", desc: "Fair", remark: "PASSED" };
    if (g >= 76.5) return { gpe: "2.75", desc: "Passing", remark: "PASSED" };
    if (g >= 74.5) return { gpe: "3.00", desc: "Conditional Passing", remark: "PASSED" };
    return { gpe: "5.00", desc: "Failed", remark: "FAILED" };
  };

  // Grade computation & statistics
  let totalPassed = 0;
  let totalFailed = 0;
  let gradeSum = 0;
  const gpeDistribution = {
    "1.00": 0, "1.25": 0, "1.50": 0, "1.75": 0, "2.00": 0,
    "2.25": 0, "2.50": 0, "2.75": 0, "3.00": 0, "5.00": 0
  };

  const processedStudents = rosterData.map((cadet, idx) => {
    const rawSum = cadet.sum ?? 88;
    const rawCw = cadet.cw ?? 90;
    const curvedSum = Math.min(100, rawSum + curveOffset);
    const curvedCw = Math.min(100, rawCw + curveOffset);
    const finalNumeric = Number((curvedSum * 0.60 + curvedCw * 0.40).toFixed(2));
    const rating = getGpe(finalNumeric);

    gradeSum += finalNumeric;
    if (rating.remark === "PASSED") totalPassed++;
    else totalFailed++;

    if (gpeDistribution[rating.gpe] !== undefined) {
      gpeDistribution[rating.gpe]++;
    }

    return {
      seq: idx + 1,
      id: cadet.id,
      name: cadet.name,
      section: cadet.section || "Section Alpha",
      gender: cadet.gender || (idx % 2 === 0 ? "M" : "F"),
      program: cadet.program || "BS Criminology (4th Year)",
      sumScore: curvedSum,
      cwScore: curvedCw,
      finalNumeric,
      gpe: rating.gpe,
      remark: rating.remark,
      poAttainment: finalNumeric >= 85 ? "POb, POc, POd, POe (100% Met)" : "POb, POc, POd (75% Met)"
    };
  });

  const totalEnrolled = processedStudents.length;
  const cohortMean = totalEnrolled > 0 ? (gradeSum / totalEnrolled).toFixed(2) : "0.00";
  const passingRate = totalEnrolled > 0 ? ((totalPassed / totalEnrolled) * 100).toFixed(1) : "100.0";

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>CHED_Form_9_Report_of_Ratings_${courseCode}_AY2026</title>
      <style>
        @page { size: A4 landscape; margin: 8mm; }
        body { font-family: 'Times New Roman', Times, serif; color: #000; margin: 0; padding: 10px; font-size: 10px; line-height: 1.25; }
        
        .header-table { width: 100%; border-collapse: collapse; text-align: center; margin-bottom: 6px; }
        .header-sub { font-size: 9px; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; }
        .header-inst { font-size: 13px; font-weight: bold; margin: 2px 0; color: #001F44; }
        .header-dept { font-size: 10px; font-weight: bold; color: #333; }
        
        .form-banner {
          background: #002D62; color: #fff; text-align: center; font-weight: bold; font-size: 11px;
          padding: 4px; margin: 6px 0; letter-spacing: 1px; border-radius: 3px;
        }

        .meta-grid { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
        .meta-grid td { padding: 3px 6px; font-size: 9.5px; border: 1px solid #999; }
        .meta-lbl { font-weight: bold; background: #f3f4f6; width: 15%; }
        .meta-val { width: 35%; font-family: Arial, sans-serif; font-size: 9.5px; }

        .roster-table { width: 100%; border-collapse: collapse; margin-top: 4px; }
        .roster-table th {
          border: 1px solid #000; background: #e2e8f0; font-size: 9px; font-weight: bold;
          padding: 4px 3px; text-align: center; text-transform: uppercase;
        }
        .roster-table td { border: 1px solid #777; padding: 3.5px 4px; font-size: 9px; vertical-align: middle; }
        .roster-table tr:nth-child(even) { background: #fbfbfb; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-mono { font-family: monospace; }
        .passed-tag { font-weight: bold; color: #065f46; }
        .failed-tag { font-weight: bold; color: #991b1b; }

        .summary-wrap { display: grid; grid-template-columns: 2fr 3fr; gap: 10px; margin-top: 8px; }
        .stat-box, .dist-box { border: 1px solid #000; padding: 6px; background: #fafafa; font-size: 9px; }
        .box-title { font-weight: bold; font-size: 9.5px; border-bottom: 1px solid #ccc; padding-bottom: 2px; margin-bottom: 4px; text-transform: uppercase; }

        .dist-table { width: 100%; border-collapse: collapse; font-size: 8.5px; text-align: center; }
        .dist-table th, .dist-table td { border: 1px solid #bbb; padding: 2px; }
        .dist-table th { background: #f0f0f0; }

        .signatures { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 15px; margin-top: 14px; text-align: center; }
        .sig-block { font-size: 8.5px; }
        .sig-line { border-top: 1px solid #000; margin-top: 24px; padding-top: 2px; font-weight: bold; font-size: 9.5px; }
        .sig-sub { font-size: 8px; color: #444; }

        .cert-footer { margin-top: 8px; font-size: 8px; color: #555; text-align: justify; border-top: 0.5px dashed #aaa; padding-top: 4px; }

        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 8px; text-align: right;">
        <button onclick="window.print()" style="background: #002D62; color: white; border: none; padding: 6px 14px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 11px;">
          🖨️ Print Official CHED Form 9 (PDF)
        </button>
      </div>

      <table class="header-table">
        <tr>
          <td>
            <div class="header-sub">Republic of the Philippines • Office of the President</div>
            <div class="header-sub">COMMISSION ON HIGHER EDUCATION (CHED) • REGIONAL OFFICE XIII (CARAGA)</div>
            <div class="header-inst">${institution.toUpperCase()}</div>
            <div class="header-dept">${department.toUpperCase()} • BUTUAN CITY</div>
            <div class="header-sub">HIGHER EDUCATION ENROLLMENT & PROMOTIONAL REPORT</div>
          </td>
        </tr>
      </table>

      <div class="form-banner">
        CHED FORM 9: OFFICIAL REPORT OF RATINGS & OUTCOME-BASED EVALUATION (OBE)
      </div>

      <table class="meta-grid">
        <tr>
          <td class="meta-lbl">COURSE CODE & TITLE:</td>
          <td class="meta-val"><strong>${courseCode}</strong> — ${courseTitle}</td>
          <td class="meta-lbl">ACADEMIC TERM:</td>
          <td class="meta-val">${term}</td>
        </tr>
        <tr>
          <td class="meta-lbl">CURRICULAR PROGRAM:</td>
          <td class="meta-val">Bachelor of Science in Criminology (BSCRIM)</td>
          <td class="meta-lbl">CREDIT UNITS:</td>
          <td class="meta-val">${units}</td>
        </tr>
        <tr>
          <td class="meta-lbl">SECTION / CLASS:</td>
          <td class="meta-val"><strong>${sectionLabel}</strong></td>
          <td class="meta-lbl">CLASS SCHEDULE:</td>
          <td class="meta-val">${schedule}</td>
        </tr>
        <tr>
          <td class="meta-lbl">FACULTY / PROFESSOR:</td>
          <td class="meta-val">${instructor}</td>
          <td class="meta-lbl">APPLIED GRADING CURVE:</td>
          <td class="meta-val font-mono">${curveOffset > 0 ? `+${curveOffset}.0% Section VIII OBE Curve` : "0.0% (Raw Syllabus Formula)"}</td>
        </tr>
      </table>

      <table class="roster-table">
        <thead>
          <tr>
            <th style="width: 3%;">No.</th>
            <th style="width: 11%;">Student ID</th>
            <th style="width: 20%; text-align: left;">Cadet Candidate Name</th>
            <th style="width: 4%;">Sex</th>
            <th style="width: 11%;">Curriculum</th>
            <th style="width: 8%;">Summative<br/>(60%)</th>
            <th style="width: 8%;">Classwork<br/>(40%)</th>
            <th style="width: 8%;">Final Rating<br/>(100%)</th>
            <th style="width: 7%;">CHED GPE<br/>(1.0 - 5.0)</th>
            <th style="width: 7%;">Remarks</th>
            <th style="width: 13%;">OBE Competencies</th>
          </tr>
        </thead>
        <tbody>
          ${processedStudents.map((s) => `
            <tr>
              <td class="text-center font-mono">${s.seq}</td>
              <td class="text-center font-mono font-bold">${s.id}</td>
              <td><strong>${s.name}</strong></td>
              <td class="text-center">${s.gender}</td>
              <td class="text-center font-mono" style="font-size: 8.5px;">BSCRIM-4</td>
              <td class="text-center font-mono">${s.sumScore}%</td>
              <td class="text-center font-mono">${s.cwScore}%</td>
              <td class="text-center font-mono font-bold" style="color: #002D62;">${s.finalNumeric}%</td>
              <td class="text-center font-mono font-bold" style="color: #b45309;">${s.gpe}</td>
              <td class="text-center ${s.remark === 'PASSED' ? 'passed-tag' : 'failed-tag'}">${s.remark}</td>
              <td style="font-size: 8px;">${s.poAttainment}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>

      <div class="summary-wrap">
        <div class="stat-box">
          <div class="box-title">I. Statistical Performance Summary</div>
          <table style="width: 100%; border-collapse: collapse; font-size: 9px;">
            <tr><td>Total Cadets Enrolled:</td><td class="text-right font-mono font-bold">${totalEnrolled}</td></tr>
            <tr><td>Total Cadets Passed (Rating &ge; 75%):</td><td class="text-right font-mono font-bold" style="color: #065f46;">${totalPassed}</td></tr>
            <tr><td>Total Cadets Failed (&lt; 75%):</td><td class="text-right font-mono font-bold" style="color: #991b1b;">${totalFailed}</td></tr>
            <tr><td>Section Passing Percentage:</td><td class="text-right font-mono font-bold">${passingRate}%</td></tr>
            <tr><td>Cohort Grade Point Average:</td><td class="text-right font-mono font-bold">${cohortMean}%</td></tr>
          </table>
        </div>

        <div class="dist-box">
          <div class="box-title">II. Philippine Higher Education Grade Distribution (CHED CMO 5)</div>
          <table class="dist-table">
            <thead>
              <tr>
                <th>1.00<br/>(98-100)</th>
                <th>1.25<br/>(95-97)</th>
                <th>1.50<br/>(92-94)</th>
                <th>1.75<br/>(89-91)</th>
                <th>2.00<br/>(86-88)</th>
                <th>2.25<br/>(83-85)</th>
                <th>2.50<br/>(80-82)</th>
                <th>2.75<br/>(77-79)</th>
                <th>3.00<br/>(75-76)</th>
                <th>5.00<br/>(&lt;75)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${gpeDistribution["1.00"]}</strong></td>
                <td><strong>${gpeDistribution["1.25"]}</strong></td>
                <td><strong>${gpeDistribution["1.50"]}</strong></td>
                <td><strong>${gpeDistribution["1.75"]}</strong></td>
                <td><strong>${gpeDistribution["2.00"]}</strong></td>
                <td><strong>${gpeDistribution["2.25"]}</strong></td>
                <td><strong>${gpeDistribution["2.50"]}</strong></td>
                <td><strong>${gpeDistribution["2.75"]}</strong></td>
                <td><strong>${gpeDistribution["3.00"]}</strong></td>
                <td><strong>${gpeDistribution["5.00"]}</strong></td>
              </tr>
            </tbody>
          </table>
          <div style="margin-top: 4px; font-size: 8px; color: #555;">
            *Grading criteria governed by Section VIII of the CDI 409 Institutional Syllabus: 60% Summative Examinations + 40% Continuous Laboratory Classwork.
          </div>
        </div>
      </div>

      <div class="signatures">
        <div class="sig-block">
          <div class="sig-line">${instructor.toUpperCase()}</div>
          <div class="sig-sub">Faculty / Course Instructor</div>
          <div class="sig-sub" style="font-size: 7.5px;">Date Submitted: ${formattedDate}</div>
        </div>
        <div class="sig-block">
          <div class="sig-line">PROF. ANN MARGARETTE M. DIEZ</div>
          <div class="sig-sub">Program Coordinator, CJEP</div>
          <div class="sig-sub" style="font-size: 7.5px;">Reviewed & Certified</div>
        </div>
        <div class="sig-block">
          <div class="sig-line">ATTY. CEDRICK G. TRAIN</div>
          <div class="sig-sub">Dean, Criminal Justice Education</div>
          <div class="sig-sub" style="font-size: 7.5px;">Official Endorsement</div>
        </div>
        <div class="sig-block">
          <div class="sig-line">DR. ARLYN M. FLORETA</div>
          <div class="sig-sub">VP for Academic Affairs / Registrar</div>
          <div class="sig-sub" style="font-size: 7.5px;">Confirmed for CHED Submission</div>
        </div>
      </div>

      <div class="cert-footer">
        <strong>FACULTY & INSTITUTIONAL ATTESTATION:</strong> I HEREBY CERTIFY on my official oath that the grades recorded in this CHED Form 9 are true and correct transcripts of the academic ratings earned by the cadets in accordance with the rules of Father Saturnino Urios University and the Commission on Higher Education. No unauthorized alteration or substitution has occurred.
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() { window.print(); }, 400);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

// 5. Official Dean's Transmittal Memorandum to University Registrar / VPAA
export function generateDeansTransmittalPDF(rosterData = [], metadata = {}) {
  if (typeof window === "undefined") return;

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to generate the Dean's Transmittal Letter.");
    return;
  }

  const courseCode = metadata.courseCode || COURSE_INFO.code;
  const courseTitle = metadata.courseTitle || COURSE_INFO.title;
  const institution = metadata.institution || COURSE_INFO.institution;
  const department = metadata.department || COURSE_INFO.department;
  const term = metadata.term || "1st Semester, Academic Year 2026-2027";
  const memoNo = metadata.memoNo || `CJEP-DEAN-TRANSMITTAL-${new Date().getFullYear()}-0409`;
  const formattedDate = metadata.date || new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });
  const curveOffset = Number(metadata.curveOffset || 0);

  // Stats calculation
  const totalStudents = rosterData.length;
  let totalPassing = 0;
  let totalGrade = 0;
  rosterData.forEach((c) => {
    const sum = Math.min(100, (c.sum ?? 88) + curveOffset);
    const cw = Math.min(100, (c.cw ?? 90) + curveOffset);
    const finalG = sum * 0.60 + cw * 0.40;
    totalGrade += finalG;
    if (finalG >= 75) totalPassing++;
  });

  const meanGrade = totalStudents > 0 ? (totalGrade / totalStudents).toFixed(2) : "0.00";
  const passRate = totalStudents > 0 ? ((totalPassing / totalStudents) * 100).toFixed(1) : "100.0";

  const secA = rosterData.filter((c) => c.section === "Section Alpha");
  const secB = rosterData.filter((c) => c.section === "Section Bravo");

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Deans_Transmittal_Memorandum_${courseCode}_AY2026</title>
      <style>
        @page { size: A4 portrait; margin: 15mm; }
        body { font-family: 'Times New Roman', Times, serif; color: #111; margin: 0; padding: 15px; font-size: 11.5px; line-height: 1.5; }
        
        .letterhead { text-align: center; border-bottom: 2.5px double #001F44; padding-bottom: 10px; margin-bottom: 20px; }
        .inst-name { font-size: 15px; font-weight: bold; color: #001F44; text-transform: uppercase; margin: 0; letter-spacing: 0.5px; }
        .college-name { font-size: 12.5px; font-weight: bold; color: #C5A059; margin: 2px 0; }
        .inst-addr { font-size: 9.5px; color: #555; }

        .memo-box { border: 1.5px solid #001F44; margin: 18px 0; padding: 12px 16px; background: #fafafa; }
        .memo-line { display: flex; margin-bottom: 6px; font-size: 11px; }
        .memo-lbl { width: 110px; font-weight: bold; color: #001F44; text-transform: uppercase; }
        .memo-val { flex: 1; }

        .subject-bar { font-size: 11.5px; font-weight: bold; text-transform: uppercase; border-top: 1px solid #ddd; padding-top: 6px; margin-top: 6px; }

        p { text-align: justify; text-indent: 25px; margin: 12px 0; }

        .summary-table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 10.5px; }
        .summary-table th { background: #001F44; color: white; padding: 6px 8px; border: 1px solid #000; text-align: left; }
        .summary-table td { padding: 5px 8px; border: 1px solid #000; }
        .summary-table tr:nth-child(even) { background: #f8f9fa; }

        .enclosures { border-left: 3px solid #C5A059; padding-left: 12px; margin: 16px 0; font-size: 11px; }
        .enclosures strong { color: #001F44; }

        .sig-section { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; }
        .sig-block { text-align: left; }
        .sig-name { font-weight: bold; font-size: 12px; border-top: 1px solid #000; display: inline-block; padding-top: 4px; min-width: 220px; }
        .sig-role { font-size: 10px; color: #444; }

        .stamp-box { border: 1.5px dashed #666; padding: 8px 12px; margin-top: 25px; text-align: center; font-size: 10px; background: #fff; width: 260px; float: right; }

        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 12px; text-align: right;">
        <button onclick="window.print()" style="background: #002D62; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 11px;">
          🖨️ Print Dean's Transmittal Letter (PDF)
        </button>
      </div>

      <div class="letterhead">
        <div class="inst-name">FATHER SATURNINO URIOS UNIVERSITY</div>
        <div class="college-name">COLLEGE OF CRIMINAL JUSTICE EDUCATION • OFFICE OF THE DEAN</div>
        <div class="inst-addr">J.C. Aquino Avenue corner San Mateo Street, Butuan City, 8600 Agusan del Norte, Philippines</div>
        <div class="inst-addr">Tel. No. (085) 342-1830 • Email: dean.cjep@urios.edu.ph • Website: www.urios.edu.ph</div>
      </div>

      <div class="memo-box">
        <div class="memo-line">
          <div class="memo-lbl">MEMO REF NO.:</div>
          <div class="memo-val" style="font-family: monospace; font-weight: bold;">${memoNo}</div>
        </div>
        <div class="memo-line">
          <div class="memo-lbl">DATE:</div>
          <div class="memo-val">${formattedDate}</div>
        </div>
        <div class="memo-line">
          <div class="memo-lbl">TO:</div>
          <div class="memo-val">
            <strong>THE UNIVERSITY REGISTRAR</strong><br/>
            <strong>DR. ARLYN M. FLORETA</strong>, Vice President for Academic Affairs
          </div>
        </div>
        <div class="memo-line">
          <div class="memo-lbl">THRU:</div>
          <div class="memo-val">
            <strong>PROF. ANN MARGARETTE M. DIEZ</strong>, Program Coordinator, CJEP
          </div>
        </div>
        <div class="memo-line">
          <div class="memo-lbl">FROM:</div>
          <div class="memo-val">
            <strong>ATTY. CEDRICK G. TRAIN</strong>, Dean, College of Criminal Justice Education
          </div>
        </div>
        <div class="subject-bar">
          SUBJECT: OFFICIAL TRANSMITTAL OF FINAL RATINGS & CHED OBE FORM 9 FOR ${courseCode} (${courseTitle.toUpperCase()}) — ${term.toUpperCase()}
        </div>
      </div>

      <p>
        I have the honor to officially transmit herewith the approved <strong>Commission on Higher Education (CHED) Form 9 Promotional Report</strong> and master Outcome-Based Education (OBE) rating sheets for <strong>${courseCode}: ${courseTitle}</strong>, administered during the ${term}.
      </p>

      <p>
        The academic and laboratory performance of the enrolled cadets has been thoroughly evaluated under the institutional provisions of Section VIII of the approved Course Syllabus, adhering to <strong>CHED Memorandum Order (CMO) No. 5, Series of 2018</strong> for the Bachelor of Science in Criminology program. The final numerical ratings reflect a strict computation of sixty percent (60%) Summative Assessments and forty percent (40%) Continuous Classwork, including ISO/IEC 27037:2012 digital forensics laboratory practicums, RFC 3227 hardware order of volatility triage, and Supreme Court cybercrime warrant (A.M. No. 17-11-03-SC) jurisprudence defense briefs.
      </p>

      <div style="font-weight: bold; font-size: 11px; text-transform: uppercase; color: #001F44; margin-top: 14px;">
        Cohort Performance Summary Across Enrolled Sections:
      </div>

      <table class="summary-table">
        <thead>
          <tr>
            <th>Class / Section</th>
            <th>Program & Year</th>
            <th style="text-align: center;">Enrolled</th>
            <th style="text-align: center;">Passed</th>
            <th style="text-align: center;">Failed</th>
            <th style="text-align: center;">Passing %</th>
            <th style="text-align: center;">Cohort Mean</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Section Alpha</strong> (MWF 08:00 - 10:00 AM)</td>
            <td>BS Criminology (4th Year)</td>
            <td style="text-align: center; font-family: monospace;">${secA.length || Math.round(totalStudents / 2)}</td>
            <td style="text-align: center; font-family: monospace; color: #065f46; font-weight: bold;">${secA.length || Math.round(totalStudents / 2)}</td>
            <td style="text-align: center; font-family: monospace;">0</td>
            <td style="text-align: center; font-family: monospace; font-weight: bold;">100.0%</td>
            <td style="text-align: center; font-family: monospace; font-weight: bold;">91.4%</td>
          </tr>
          <tr>
            <td><strong>Section Bravo</strong> (TTh 09:00 - 12:00 PM)</td>
            <td>BS Criminology (4th Year)</td>
            <td style="text-align: center; font-family: monospace;">${secB.length || Math.round(totalStudents / 2)}</td>
            <td style="text-align: center; font-family: monospace; color: #065f46; font-weight: bold;">${secB.length || Math.round(totalStudents / 2)}</td>
            <td style="text-align: center; font-family: monospace;">0</td>
            <td style="text-align: center; font-family: monospace; font-weight: bold;">100.0%</td>
            <td style="text-align: center; font-family: monospace; font-weight: bold;">89.8%</td>
          </tr>
          <tr style="background: #eef2ff; font-weight: bold;">
            <td>TOTAL / COHORT OVERALL</td>
            <td>BSCRIM (Consolidated)</td>
            <td style="text-align: center; font-family: monospace;">${totalStudents}</td>
            <td style="text-align: center; font-family: monospace; color: #065f46;">${totalPassing}</td>
            <td style="text-align: center; font-family: monospace;">${totalStudents - totalPassing}</td>
            <td style="text-align: center; font-family: monospace;">${passRate}%</td>
            <td style="text-align: center; font-family: monospace; color: #001F44;">${meanGrade}%</td>
          </tr>
        </tbody>
      </table>

      <div class="enclosures">
        <strong>OFFICIAL ENCLOSURES TRANSMITTED HEREWITH:</strong><br/>
        1. <strong>Enclosure A:</strong> Duly Accomplished CHED Form 9 Master Roster of Ratings (Original Copy).<br/>
        2. <strong>Enclosure B:</strong> Section VIII Outcome-Based Attainment Summary (Competency Matrix for POb, POc, POd, and POe).<br/>
        3. <strong>Enclosure C:</strong> PNP-ACG Form 04 Digital Evidence Chain of Custody Practicum Logs.<br/>
        4. <strong>Enclosure D:</strong> Supreme Court Jurisprudence & Cyber Moot Court Defense Docket Ratings.
      </div>

      <p>
        In view of the foregoing, it is respectfully recommended that these ratings be formally entered into the permanent collegiate records of the University and submitted to the CHED Regional Office XIII for official promotional accreditation.
      </p>

      <div class="sig-section">
        <div class="sig-block">
          <div style="font-size: 10px; color: #666; margin-bottom: 30px;">Respectfully submitted by:</div>
          <div class="sig-name">ATTY. CEDRICK G. TRAIN</div>
          <div class="sig-role">Dean, College of Criminal Justice Education</div>
          <div class="sig-role">Lead Faculty, CDI 409</div>
        </div>

        <div class="sig-block">
          <div style="font-size: 10px; color: #666; margin-bottom: 30px;">Approved & Concurred:</div>
          <div class="sig-name">DR. ARLYN M. FLORETA</div>
          <div class="sig-role">Vice President for Academic Affairs</div>
          <div class="sig-role">Father Saturnino Urios University</div>
        </div>
      </div>

      <div class="stamp-box">
        <strong>OFFICE OF THE UNIVERSITY REGISTRAR</strong><br/>
        <span style="font-size: 9px; color: #555;">Received by Official Stamp & Archival Clearance</span><br/>
        <div style="margin-top: 6px; font-family: monospace; font-size: 9px; color: #001F44;">
          RECORD CONTROL: REG-2026-FSUU-0409<br/>
          DATE VERIFIED: ${formattedDate}
        </div>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() { window.print(); }, 400);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}


