import { supabase } from "./supabaseClient";

/**
 * Helper to format timestamps nicely (e.g. "2026-10-07 10:30")
 */
function formatTimestamp(date = new Date()) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Fetch all practicum submissions entirely from Supabase
 */
export async function getPracticumSubmissions() {
  try {
    const { data, error } = await supabase
      .from("lab_submissions")
      .select("*, profiles!lab_submissions_student_id_fkey(*)")
      .order("submitted_at", { ascending: false });

    if (error) {
      console.error("Supabase practicum fetch error:", error.message);
      return [];
    }

    if (!data || data.length === 0) return [];

    return data.map((row) => {
      const payload = row.evidence_payload || {};
      return {
        id: row.id,
        studentId: row.profiles?.student_or_faculty_id || payload.studentIdNumber || "Unknown ID",
        studentName: row.profiles?.full_name || payload.studentName || "Unknown Student",
        section: row.profiles?.section || payload.section || "Unassigned",
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
    }).sort((a, b) => {
      if (a.status === "Needs Review" && b.status !== "Needs Review") return -1;
      if (a.status !== "Needs Review" && b.status === "Needs Review") return 1;
      return (b.submissionTime || "").localeCompare(a.submissionTime || "");
    });
  } catch (err) {
    console.error("Unexpected error in getPracticumSubmissions:", err.message);
    return [];
  }
}

/**
 * Submit a new practicum lab submission (called from Student Portal)
 */
export async function submitPracticumLab({
  studentId,
  studentName = "Unknown Student",
  studentIdNumber = "Unknown ID",
  section = "Unassigned",
  unit = "Unit 2: Hardware Volatility",
  task = "Crime Lab Execution",
  complianceNote = "Evidence extracted following standard protocol.",
  evidencePayload = {}
}) {
  try {
    // We MUST have a valid UUID to link to the profiles table
    if (!studentId || studentId.length !== 36) {
      throw new Error("Invalid student UUID");
    }

    const { data, error } = await supabase.from("lab_submissions").insert({
      student_id: studentId,
      // Since lab_id is required, we use a default if we don't have dynamic labs yet
      lab_id: "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32", 
      status: "Needs Review",
      score: 0,
      compliance_note: complianceNote,
      evidence_payload: {
        ...evidencePayload,
        studentName,
        studentIdNumber,
        section,
        unit,
        task
      }
    }).select().single();

    if (error) {
      console.error("Error submitting practicum lab:", error.message);
      return null;
    }

    // Dispatch custom window event for instant same-browser cross-component update
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cdi409_submission_created", { detail: data }));
    }

    return data;
  } catch (err) {
    console.error("Network error during submission:", err.message);
    return null;
  }
}

/**
 * Fetch units completed by a specific student
 */
export async function getStudentCompletedModules(studentId) {
  try {
    if (!studentId) return {};
    
    const { data, error } = await supabase
      .from("lab_submissions")
      .select("evidence_payload")
      .eq("student_id", studentId);
      
    if (error) return {};
    
    const completed = {};
    data.forEach(sub => {
      const payload = sub.evidence_payload;
      if (payload && payload.unit) {
        if (payload.unit.includes("Unit 2")) completed["lesson-2"] = true;
        if (payload.unit.includes("Unit 4")) completed["lesson-4"] = true;
        if (payload.unit.includes("Unit 6")) completed["lesson-6"] = true;
        if (payload.unit.includes("Unit 7")) completed["lesson-7"] = true;
        if (payload.unit.includes("Unit 8")) completed["lesson-8"] = true;
        if (payload.unit.includes("Case Defense") || payload.unit.includes("Moot Court")) completed["moot-counsel"] = true;
      }
    });
    return completed;
  } catch (err) {
    return {};
  }
}

/**
 * Grade an existing practicum submission (called from Faculty Admin Desk)
 */
export async function gradePracticumSubmission({
  submissionId,
  grade,
  feedback,
  graderId = "FAC-2026-001",
  graderName = "Mr. Orlando Ritchie R. Natonton"
}) {
  const numGrade = Number(grade);

  try {
    const { data, error } = await supabase
      .from("lab_submissions")
      .update({
        score: numGrade,
        status: "Graded",
        compliance_note: feedback,
        graded_at: new Date().toISOString()
      })
      .eq("id", submissionId)
      .select()
      .single();

    if (error) {
      console.error("Error updating grade in Supabase:", error.message);
      return null;
    }

    // Dispatch custom window event
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("cdi409_submission_graded", {
          detail: { submissionId, grade: numGrade, feedback, graderName }
        })
      );
    }

    return data;
  } catch (err) {
    console.error("Network error during grade sync:", err.message);
    return null;
  }
}

/**
 * Real-time event listener hook / subscription for Submissions
 */
export function subscribeToPracticumUpdates(callback) {
  if (typeof window === "undefined") return () => {};

  const handleCreated = (e) => callback({ type: "created", submission: e.detail });
  const handleGraded = (e) => callback({ type: "graded", payload: e.detail });

  window.addEventListener("cdi409_submission_created", handleCreated);
  window.addEventListener("cdi409_submission_graded", handleGraded);

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
    if (channel) {
      supabase.removeChannel(channel);
    }
  };
}
