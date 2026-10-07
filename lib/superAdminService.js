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
 * Log a new audit action
 */
export async function logAuditAction(actorId, actorName, action, severity = "Standard") {
  try {
    const { error } = await supabase.from("audit_logs").insert({
      actor_id: actorId,
      actor_name: actorName,
      action: action,
      ip_address: "127.0.0.1", // Simplified
      severity: severity,
    });

    if (error) throw error;
  } catch (err) {
    console.error("Error logging audit action:", err);
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
