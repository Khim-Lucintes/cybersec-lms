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
