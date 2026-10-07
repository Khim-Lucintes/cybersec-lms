import { supabase } from "./supabaseClient";
import { MOCK_ADMIN_DATA } from "./adminData";

const STORAGE_KEY = "cdi409_practicum_submissions";

/**
 * Helper to format timestamps nicely (e.g. "2026-10-07 10:30")
 */
function formatTimestamp(date = new Date()) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Retrieve local cached submissions
 */
function getLocalSubmissions() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn("Error reading local practicum submissions:", err);
    return [];
  }
}

/**
 * Persist local cached submissions
 */
function saveLocalSubmissions(subs) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subs));
  } catch (err) {
    console.warn("Error saving local practicum submissions:", err);
  }
}

/**
 * Fetch all practicum submissions:
 * Combines remote Supabase submissions + local client submissions + default baseline submissions
 */
export async function getPracticumSubmissions() {
  const localList = getLocalSubmissions();
  const baselineList = MOCK_ADMIN_DATA.cadetSubmissions || [];

  let remoteList = [];
  try {
    const { data, error } = await supabase
      .from("lab_submissions")
      .select("*, profiles(*)")
      .order("submitted_at", { ascending: false });

    if (!error && data && data.length > 0) {
      remoteList = data.map((row) => {
        const payload = row.evidence_payload || {};
        return {
          id: row.id,
          studentId: row.profiles?.student_or_faculty_id || payload.studentIdNumber || "STU-2026-4091",
          studentName: row.profiles?.full_name || payload.studentName || "Cadet Investigator",
          section: row.profiles?.section || payload.section || "Section Alpha",
          unit: payload.unit || "Forensic Lab Practicum",
          task: payload.task || "Crime Lab Execution",
          submissionTime: formatTimestamp(row.submitted_at),
          score: row.status === "Graded" ? `${row.score}%` : "Pending",
          status: row.status || "Needs Review",
          grade: row.score !== null ? Number(row.score) : null,
          complianceNote: row.compliance_note || payload.complianceNote || "Submitted for faculty evaluation.",
          evidencePayload: payload,
          isRemote: true
        };
      });
    }
  } catch (fetchErr) {
    console.warn("Supabase practicum fetch notice (using cached data):", fetchErr.message);
  }

  // Merge order: remote submissions take priority, then local modifications, then baseline
  const map = new Map();

  // 1. Add baseline
  baselineList.forEach((item) => map.set(item.id, { ...item, source: "baseline" }));

  // 2. Add local storage items
  localList.forEach((item) => map.set(item.id, { ...item, source: "local" }));

  // 3. Add remote Supabase records
  remoteList.forEach((item) => map.set(item.id, { ...item, source: "supabase" }));

  return Array.from(map.values()).sort((a, b) => {
    // Sort "Needs Review" first, then by date descending
    if (a.status === "Needs Review" && b.status !== "Needs Review") return -1;
    if (a.status !== "Needs Review" && b.status === "Needs Review") return 1;
    return (b.submissionTime || "").localeCompare(a.submissionTime || "");
  });
}

/**
 * Submit a new practicum lab submission (called from Student Portal)
 */
export async function submitPracticumLab({
  studentId,
  studentName = "Cadet Student",
  studentIdNumber = "STU-2026-4091",
  section = "Section Alpha",
  unit = "Unit 2: Hardware Volatility",
  task = "Crime Lab Execution",
  complianceNote = "Evidence extracted following standard protocol.",
  evidencePayload = {}
}) {
  const generatedId = `SUB-${Date.now().toString().slice(-6)}`;
  const nowStr = formatTimestamp();

  const newSubmission = {
    id: generatedId,
    studentId: studentIdNumber,
    studentName,
    section,
    unit,
    task,
    submissionTime: nowStr,
    score: "Pending",
    status: "Needs Review",
    grade: null,
    complianceNote,
    evidencePayload: {
      ...evidencePayload,
      studentName,
      studentIdNumber,
      section,
      unit,
      task
    }
  };

  // 1. Immediately store in local state so UI updates instantly
  const localList = getLocalSubmissions();
  saveLocalSubmissions([newSubmission, ...localList]);

  // Dispatch custom window event for instant same-browser cross-component update
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("cdi409_submission_created", { detail: newSubmission }));
  }

  // 2. Asynchronously attempt remote Supabase persistence
  try {
    // Use student profile UUID if available, else a deterministic fallback UUID
    const validStudentUuid =
      studentId && studentId.length === 36
        ? studentId
        : "11111111-1111-1111-1111-111111111111";

    const { data, error } = await supabase.from("lab_submissions").insert({
      student_id: validStudentUuid,
      lab_id: "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32", // Default registered CDI 409 lab UUID
      status: "Needs Review",
      score: 0,
      compliance_note: complianceNote,
      evidence_payload: newSubmission.evidencePayload
    });

    if (error) {
      console.warn("Notice syncing submission to Supabase:", error.message);
    }
  } catch (err) {
    console.warn("Network notice during submission sync:", err.message);
  }

  return newSubmission;
}

/**
 * Grade an existing practicum submission (called from Faculty Admin Desk)
 */
export async function gradePracticumSubmission({
  submissionId,
  grade,
  feedback,
  graderId = "FAC-2026-001",
  graderName = "Atty. Cedrick G. Train"
}) {
  const numGrade = Number(grade);
  const formattedScore = `${numGrade}%`;

  // 1. Update in local storage
  const localList = getLocalSubmissions();
  const existingIdx = localList.findIndex((s) => s.id === submissionId);

  let updatedRecord = null;
  if (existingIdx >= 0) {
    localList[existingIdx] = {
      ...localList[existingIdx],
      status: "Graded",
      grade: numGrade,
      score: formattedScore,
      complianceNote: feedback || localList[existingIdx].complianceNote,
      gradedAt: formatTimestamp(),
      graderName
    };
    updatedRecord = localList[existingIdx];
    saveLocalSubmissions(localList);
  } else {
    // If it was a baseline mock item, add it to local store as overridden
    const baseline = (MOCK_ADMIN_DATA.cadetSubmissions || []).find((s) => s.id === submissionId);
    if (baseline) {
      updatedRecord = {
        ...baseline,
        status: "Graded",
        grade: numGrade,
        score: formattedScore,
        complianceNote: feedback || baseline.complianceNote,
        gradedAt: formatTimestamp(),
        graderName
      };
      saveLocalSubmissions([updatedRecord, ...localList]);
    }
  }

  // Dispatch custom window event
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("cdi409_submission_graded", {
        detail: { submissionId, grade: numGrade, feedback, graderName }
      })
    );
  }

  // 2. Attempt Supabase update if it's a UUID or matches remote record
  try {
    const isUuid = submissionId && submissionId.length === 36;
    if (isUuid) {
      const { error } = await supabase
        .from("lab_submissions")
        .update({
          score: numGrade,
          status: "Graded",
          compliance_note: feedback,
          graded_at: new Date().toISOString()
        })
        .eq("id", submissionId);

      if (error) {
        console.warn("Notice updating grade in Supabase:", error.message);
      }
    }
  } catch (err) {
    console.warn("Network notice during grade sync:", err.message);
  }

  return updatedRecord;
}

/**
 * Real-time event listener hook / subscription for Submissions
 */
export function subscribeToPracticumUpdates(callback) {
  if (typeof window === "undefined") return () => {};

  const handleCreated = (e) => callback({ type: "created", submission: e.detail });
  const handleGraded = (e) => callback({ type: "graded", payload: e.detail });
  const handleStorage = (e) => {
    if (e.key === STORAGE_KEY) callback({ type: "storage_change" });
  };

  window.addEventListener("cdi409_submission_created", handleCreated);
  window.addEventListener("cdi409_submission_graded", handleGraded);
  window.addEventListener("storage", handleStorage);

  // Supabase Realtime channel subscription
  let channel = null;
  try {
    channel = supabase
      .channel("lab_submissions_feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "lab_submissions" },
        (payload) => {
          callback({ type: "remote_change", payload });
        }
      )
      .subscribe();
  } catch (err) {
    console.warn("Notice setting up Supabase realtime channel:", err);
  }

  // Cleanup function
  return () => {
    window.removeEventListener("cdi409_submission_created", handleCreated);
    window.removeEventListener("cdi409_submission_graded", handleGraded);
    window.removeEventListener("storage", handleStorage);
    if (channel) {
      supabase.removeChannel(channel);
    }
  };
}
