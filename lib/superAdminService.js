import { supabase } from "./supabaseClient";

/**
 * Fetch all profiles (students, instructors, superadmins)
 */
export async function getAllProfiles() {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Error fetching profiles:", err);
    return [];
  }
}

/**
 * Update a user's role
 */
export async function updateUserRole(userId, newRole) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    
    // Log the action automatically
    await logAuditAction(
      null, // Optional: if we had the superadmin's ID we could pass it here
      "System Administrator",
      `Changed role of user ${data.full_name} to ${newRole}`,
      "High"
    );

    return data;
  } catch (err) {
    console.error("Error updating user role:", err);
    return null;
  }
}

/**
 * Update full profile details
 */
export async function updateUserProfile(userId, profileData) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .update({
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;

    await logAuditAction(
      userId,
      "System Administrator",
      `Updated user profile: ${data.full_name} (${data.role})`,
      "Standard"
    );

    return { success: true, profile: data };
  } catch (err) {
    console.error("Error updating user profile:", err);
    return { success: false, error: err.message || "Failed to update profile" };
  }
}

/**
 * Provision / create a new user profile via Auth & profiles
 */
export async function createUserProfile(userData) {
  try {
    const { email, password, fullName, studentOrFacultyId, role, section, program, yearLevel } = userData;

    // 1. Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: password || "Ur10s2026!",
      options: {
        data: {
          full_name: fullName,
          student_id: studentOrFacultyId,
          role: role || "student"
        }
      }
    });

    if (authError) throw authError;

    const newUserId = authData?.user?.id;
    if (!newUserId) {
      throw new Error("User creation failed in Auth engine.");
    }

    // 2. Upsert profile with full details
    const profilePayload = {
      id: newUserId,
      full_name: fullName,
      email: email,
      student_or_faculty_id: studentOrFacultyId || (role === "instructor" ? `FAC-${Date.now().toString().slice(-4)}` : `2210000${Math.floor(1000 + Math.random() * 9000)}`),
      role: role || "student",
      section: section || "Section Alpha",
      program: program || "Bachelor of Science in Criminology",
      year_level: yearLevel || "4th Year",
      updated_at: new Date().toISOString()
    };

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .upsert(profilePayload)
      .select()
      .single();

    if (profileError) throw profileError;

    // 3. Log audit action
    await logAuditAction(
      newUserId,
      "System Administrator",
      `Provisioned new user: ${fullName} (${role}) with email ${email}`,
      "High"
    );

    return { success: true, profile: profileData };
  } catch (err) {
    console.error("Error creating user profile:", err);
    return { success: false, error: err.message || "Failed to create user" };
  }
}

/**
 * Delete a user profile from database
 */
export async function deleteUserProfile(userId, userName) {
  try {
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (error) throw error;

    await logAuditAction(
      userId,
      "System Administrator",
      `Deleted user account & profile: ${userName || userId}`,
      "High"
    );

    return { success: true };
  } catch (err) {
    console.error("Error deleting user profile:", err);
    return { success: false, error: err.message || "Failed to delete user profile" };
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordReset(email) {
  try {
    const redirectUrl = typeof window !== "undefined" ? `${window.location.origin}/reset-password` : undefined;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl
    });

    if (error) throw error;

    await logAuditAction(
      null,
      "System Administrator",
      `Dispatched password recovery email to ${email}`,
      "Standard"
    );

    return { success: true };
  } catch (err) {
    console.error("Error sending password reset:", err);
    return { success: false, error: err.message || "Failed to send reset link" };
  }
}

/**
 * Fetch the latest audit logs
 */
export async function getAuditLogs() {
  try {
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Error fetching audit logs:", err);
    return [];
  }
}

/**
 * Log a new audit action safely without blocking core user operations
 */
export async function logAuditAction(actorId, actorName, action, severity = "Standard") {
  try {
    const { error } = await supabase.from("audit_logs").insert({
      actor_id: actorId,
      actor_name: actorName,
      action: action,
      ip_address: "127.0.0.1",
      severity: severity,
    });

    if (error) {
      // Non-blocking warning so it doesn't trigger Next.js runtime error overlay
      console.warn("Audit logging notice (Supabase audit_logs RLS):", error.message || error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("Audit log notice:", err?.message || err);
    return false;
  }
}

/**
 * Get aggregate system stats dynamically
 */
export async function getSystemStats() {
  try {
    // We can run count queries
    const { count: totalUsers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    const { count: facultyCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "instructor");

    const { count: studentCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "student");

    const { count: labSessions } = await supabase
      .from("lab_submissions")
      .select("*", { count: "exact", head: true });

    return {
      totalUsers: totalUsers || 0,
      facultyCount: facultyCount || 0,
      studentCount: studentCount || 0,
      labSessions: labSessions || 0,
    };
  } catch (err) {
    console.error("Error fetching system stats:", err);
    return {
      totalUsers: 0,
      facultyCount: 0,
      studentCount: 0,
      labSessions: 0,
    };
  }
}
