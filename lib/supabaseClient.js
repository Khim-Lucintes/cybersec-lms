import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hodnqzwltvprungcpwax.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Helper Functions for Data Operations

// 1. Fetch Curriculum Modules
export async function getSyllabusModules() {
  const { data, error } = await supabase
    .from("modules")
    .select("*, labs(*), quizzes(*)")
    .order("unit_number", { ascending: true });

  if (error) {
    console.error("Error loading syllabus modules:", error.message);
    return null;
  }
  return data;
}

// 2. Submit Lab Practicum Execution
export async function submitLabEvidence({ studentId, labId, evidencePayload, complianceNote }) {
  const { data, error } = await supabase.from("lab_submissions").insert({
    student_id: studentId,
    lab_id: labId,
    status: "Needs Review",
    evidence_payload: evidencePayload,
    compliance_note: complianceNote,
  });

  if (error) {
    console.error("Error submitting lab evidence:", error.message);
    return { success: false, error: error.message };
  }
  return { success: true, data };
}

// 3. Faculty Grade Evaluation
export async function gradeLabSubmission({ submissionId, score, graderId }) {
  const { data, error } = await supabase
    .from("lab_submissions")
    .update({
      score,
      status: "Graded",
      graded_at: new Date().toISOString(),
      graded_by: graderId,
    })
    .eq("id", submissionId);

  if (error) {
    console.error("Error grading submission:", error.message);
    return { success: false, error: error.message };
  }
  return { success: true, data };
}

// 4. Fetch Student Grade Records
export async function getStudentGrades(studentId) {
  const { data, error } = await supabase
    .from("grading_records")
    .select("*")
    .eq("student_id", studentId)
    .single();

  if (error) {
    console.error("Error fetching grades:", error.message);
    return null;
  }
  return data;
}
