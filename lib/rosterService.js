import { supabase } from "@/lib/supabaseClient";
import { getStudentGrades } from "@/lib/gradeService";

/**
 * Fetches all student profiles from the database
 */
export async function getCohortRoster() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .order('full_name', { ascending: true });

    if (error) {
      console.error("Error fetching cohort roster:", error);
      return [];
    }

    // Map database profile to the format expected by the admin dashboard
    const profilesWithGrades = await Promise.all(data.map(async (profile) => {
      const grades = await getStudentGrades(profile.id);
      
      let sum = 0;
      let cw = 0;

      if (grades) {
        // We calculate a single 'sum' equivalent to the summative mean 
        // (average of all 4 exams if we want, or just reverse calculate from grades)
        sum = (((grades.prelims + grades.midterms) / 2) + ((grades.semiFinals + grades.finals) / 2)) / 2;
        cw = grades.classwork;
      }
      
      return {
        id: profile.student_or_faculty_id || profile.id, // Use display ID if available
        uuid: profile.id, // Keep raw UUID for actions
        name: profile.full_name || "Unknown Student",
        section: profile.section || "Unassigned",
        program: profile.program || "BS Criminology",
        yearLevel: profile.year_level || "4th Year",
        gender: "U", // Not tracked yet
        sum: sum,
        cw: cw, 
        email: profile.email, // Add email from db
        grades: grades || {} // include the raw grades object for future use
      };
    }));
    return profilesWithGrades;
  } catch (error) {
    console.error("Unexpected error in getCohortRoster:", error);
    return [];
  }
}
