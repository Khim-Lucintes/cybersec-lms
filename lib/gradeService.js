import { supabase } from "./supabaseClient";

/**
 * Calculates a student's classwork mean based on their labs, quizzes, and moot court scores.
 * 
 * Classwork comprises:
 * - Lab submissions
 * - Quizzes
 * 
 * Returns the average classwork score (0-100).
 */
export async function calculateStudentClassworkMean(studentId) {
  try {
    let totalScore = 0;
    let count = 0;

    // 1. Fetch Graded Lab Submissions
    const { data: labs, error: labError } = await supabase
      .from('lab_submissions')
      .select('score')
      .eq('student_id', studentId)
      .eq('status', 'Graded');

    if (!labError && labs) {
      labs.forEach(lab => {
        totalScore += Number(lab.score || 0);
        count++;
      });
    }

    // 2. Fetch Quiz Attempts
    const { data: quizzes, error: quizError } = await supabase
      .from('quiz_attempts')
      .select('score')
      .eq('student_id', studentId);
      
    if (!quizError && quizzes) {
      quizzes.forEach(quiz => {
        totalScore += Number(quiz.score || 0);
        count++;
      });
    }

    // If no classwork is found, default to a base of 80 or 0
    if (count === 0) return 80;

    return Number((totalScore / count).toFixed(2));
  } catch (error) {
    console.error("Error calculating classwork mean:", error);
    return 80;
  }
}

/**
 * Syncs the computed classwork mean into the grading_records table for a given student.
 */
export async function syncStudentClasswork(studentId, courseId) {
  try {
    const classworkMean = await calculateStudentClassworkMean(studentId);
    
    // Check if grading record exists (handle multiple gracefully)
    const { data: existingRecords } = await supabase
      .from('grading_records')
      .select('id')
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .limit(1);
      
    const existingRecord = existingRecords && existingRecords.length > 0 ? existingRecords[0] : null;

    if (existingRecord) {
      await supabase
        .from('grading_records')
        .update({ classwork_mean: classworkMean, updated_at: new Date().toISOString() })
        .eq('id', existingRecord.id);
    } else {
      await supabase
        .from('grading_records')
        .insert({
          student_id: studentId,
          course_id: courseId,
          classwork_mean: classworkMean,
          prelim_exam: 0,
          midterm_exam: 0,
          semi_final_exam: 0,
          final_exam: 0
        });
    }
  } catch (err) {
    console.error("Error syncing student classwork:", err);
  }
}

/**
 * Fetches the grading record for a student. If none exists, creates a default one.
 */
export async function getStudentGrades(studentId) {
  try {
    // We assume only one course "CDI 409" for now
    const { data: courseData } = await supabase.from('courses').select('id').limit(1).single();
    if (!courseData) return null;

    // Ensure classwork is up to date
    await syncStudentClasswork(studentId, courseData.id);

    const { data: records, error } = await supabase
      .from('grading_records')
      .select('*')
      .eq('student_id', studentId)
      .eq('course_id', courseData.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.warn("Supabase warning fetching grades:", error.message || error);
    }

    const record = records && records.length > 0 ? records[0] : null;

    if (!record) {
      // If RLS prevents inserting, return a virtual calculated record
      const cw = await calculateStudentClassworkMean(studentId);
      const virtualGrade = Number((cw * 0.40).toFixed(2));
      return {
        prelims: 0, midterms: 0, semiFinals: 0, finals: 0, classwork: cw,
        midtermGrade: virtualGrade, tentativeFinal: virtualGrade, 
        finalGrade: virtualGrade, gpa: "5.00 (Failed)", isPassed: false,
        id: null
      };
    }

    // Compute the final Grade (since real_final_grade isn't auto-generated)
    const midtermG = Number(record.midterm_grade || 0);
    const tentativeFinalG = Number(record.tentative_final_grade || 0);
    const finalComputedGrade = Number(((midtermG + (2 * tentativeFinalG)) / 3).toFixed(2));

    let gpaEquivalent = "5.00 (Failed)";
    if (finalComputedGrade >= 97) gpaEquivalent = "1.00 (97-100%)";
    else if (finalComputedGrade >= 94) gpaEquivalent = "1.25 (94-96%)";
    else if (finalComputedGrade >= 91) gpaEquivalent = "1.50 (91-93%)";
    else if (finalComputedGrade >= 88) gpaEquivalent = "1.75 (88-90%)";
    else if (finalComputedGrade >= 85) gpaEquivalent = "2.00 (85-87%)";
    else if (finalComputedGrade >= 75) gpaEquivalent = "3.00 (75-84%)";

    return {
      prelims: Number(record.prelim_exam),
      midterms: Number(record.midterm_exam),
      semiFinals: Number(record.semi_final_exam),
      finals: Number(record.final_exam),
      classwork: Number(record.classwork_mean),
      midtermGrade: midtermG,
      tentativeFinal: tentativeFinalG,
      finalGrade: finalComputedGrade,
      gpa: gpaEquivalent,
      isPassed: finalComputedGrade >= 75.0,
      id: record.id
    };
  } catch (err) {
    console.error("Error fetching student grades:", err.message || err);
    // Fallback default
    return {
      prelims: 0, midterms: 0, semiFinals: 0, finals: 0, classwork: 80,
      midtermGrade: 0, tentativeFinal: 0, finalGrade: 0, gpa: "5.00 (Failed)", isPassed: false
    };
  }
}
