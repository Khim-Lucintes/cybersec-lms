"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Server,
  Users,
  Database,
  Lock,
  Activity,
  UserCheck,
  ShieldCheck,
  Settings,
  HardDrive,
  FileCode,
  KeyRound,
  FileCheck,
  Sliders,
  CheckCircle2,
  RefreshCw,
  Search,
  Plus,
  Home,
  GraduationCap,
  Layers,
  BarChart3,
  Award,
  AlertTriangle,
  Building2,
  Clock,
  Terminal,
  Cpu
} from "lucide-react";
import { MOCK_SUPERADMIN_DATA } from "@/lib/superAdminData";
import { COURSE_INFO } from "@/lib/curriculum";
import { getAllProfiles, updateUserRole, getAuditLogs, getSystemStats } from "@/lib/superAdminService";

// Shadcn UI Components
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview"); // 'overview', 'users-roles', 'system-health', 'audit-logs', 'db-security'
  
  // Dynamic State
  const [profiles, setProfiles] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [sysStats, setSysStats] = useState({ totalUsers: 0, facultyCount: 0, studentCount: 0, labSessions: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const [userSearch, setUserSearch] = useState("");
  const [newFacultyModal, setNewFacultyModal] = useState(false);

  // New Faculty State (Provisioning logic would integrate with Auth later)
  const [newFacName, setNewFacName] = useState("");
  const [newFacRole, setNewFacRole] = useState("Instructor");
  const [newFacDept, setNewFacDept] = useState("Criminal Justice Education Program");

  React.useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const [fetchedProfiles, fetchedLogs, fetchedStats] = await Promise.all([
        getAllProfiles(),
        getAuditLogs(),
        getSystemStats()
      ]);
      setProfiles(fetchedProfiles);
      setAuditLogs(fetchedLogs);
      setSysStats(fetchedStats);
      setIsLoading(false);
    }
    loadData();
  }, []);

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === "instructor" ? "student" : "instructor";
    const updatedUser = await updateUserRole(userId, newRole);
    if (updatedUser) {
      setProfiles((prev) => prev.map((p) => (p.id === userId ? { ...p, role: updatedUser.role } : p)));
      // Refresh logs to show the role change
      const freshLogs = await getAuditLogs();
      setAuditLogs(freshLogs);
    }
  };

  const handleAddFaculty = (e) => {
    e.preventDefault();
    if (!newFacName) return;
    
    // In a real scenario, we would call a secure edge function to create a Supabase Auth user.
    alert("Integration with Supabase Auth required to create real users. This feature is locked.");
    setNewFacultyModal(false);
    setNewFacName("");
  };

  const filteredProfiles = profiles.filter(
    (p) =>
      p.full_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      p.role?.toLowerCase().includes(userSearch.toLowerCase()) ||
      p.student_or_faculty_id?.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1E293B] flex font-sans selection:bg-[#C5A059] selection:text-white">
      {/* 1. SuperAdmin Deep Navy Sidebar (#001F44) */}
      <aside className="w-64 border-r border-[#001F44]/30 bg-[#001F44] text-white flex flex-col justify-between shrink-0 h-screen sticky top-0 z-50 shadow-2xl">
        <div className="flex flex-col h-full">
          {/* Brand Header */}
          <div className="p-5 border-b border-white/10 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#002D62] border border-[#C5A059]/40 text-[#C5A059] shadow-md">
              <KeyRound className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-white text-sm tracking-tight truncate font-serif">
                SUPERADMIN HQ
              </div>
              <div className="text-[11px] text-[#C5A059] font-mono truncate font-semibold">
                Root System Control
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="p-3 space-y-1.5 overflow-y-auto flex-1">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Enterprise Governance
            </div>

            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "overview"
                  ? "bg-[#002D62] text-white shadow-md border-l-4 border-[#C5A059]"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Server className="h-4 w-4 text-[#C5A059]" />
              <span>System Infrastructure</span>
            </button>

            <button
              onClick={() => setActiveTab("users-roles")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "users-roles"
                  ? "bg-[#002D62] text-white shadow-md border-l-4 border-[#C5A059]"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Users className="h-4 w-4 text-[#C5A059]" />
              <span>User & Role Governance</span>
            </button>

            <button
              onClick={() => setActiveTab("db-security")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "db-security"
                  ? "bg-[#002D62] text-white shadow-md border-l-4 border-[#C5A059]"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Database className="h-4 w-4 text-[#C5A059]" />
              <span>Supabase / RLS Policies</span>
            </button>

            <button
              onClick={() => setActiveTab("audit-logs")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "audit-logs"
                  ? "bg-[#002D62] text-white shadow-md border-l-4 border-[#C5A059]"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Activity className="h-4 w-4 text-[#C5A059]" />
              <span>Institutional Audit Logs</span>
            </button>
          </div>

          {/* Superadmin User Footer */}
          <div className="p-3 border-t border-white/10 bg-black/20">
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10">
              <div className="h-8 w-8 rounded-lg bg-[#C5A059] flex items-center justify-center font-bold text-[#001F44] text-xs shadow-sm">
                SA
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate font-serif">System Administrator</div>
                <div className="text-[10px] text-[#C5A059] font-mono truncate">FSUU IT & Data Center</div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. Main SuperAdmin Control Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-[#E2E8F0] bg-white/95 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="font-bold text-[#002D62] text-sm sm:text-base font-serif">
              Father Saturnino Urios University • System Architecture HQ
            </span>
            <Badge className="bg-[#C5A059] text-white text-[10px] font-mono hidden md:inline-flex">
              SuperAdmin Clearance
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard/admin">
              <Button variant="outline" size="sm" className="text-xs border-[#E2E8F0] text-[#002D62] hover:bg-[#F8F9FA]">
                Faculty Desk
              </Button>
            </Link>
            <Link href="/dashboard/student">
              <Button variant="outline" size="sm" className="text-xs border-[#E2E8F0] text-[#002D62] hover:bg-[#F8F9FA]">
                Cadet View
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="sm" className="text-xs border-[#E2E8F0] text-[#1E293B] hover:bg-[#F8F9FA]">
                <Home className="h-3.5 w-3.5 mr-1 text-[#002D62]" />
                Home
              </Button>
            </Link>
          </div>
        </header>

        {/* Dynamic Section Container */}
        <div className="p-6 max-w-7xl mx-auto w-full flex-1 space-y-6">
          {/* TAB 1: SYSTEM INFRASTRUCTURE & STATS */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-5 bg-white border-[#E2E8F0] shadow-sm rounded-2xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#4A4A4A] font-mono">Total System Users</span>
                    <div className="p-2 rounded-xl bg-[#002D62]/5 text-[#002D62]">
                      <Users className="h-4 w-4 text-[#C5A059]" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-[#002D62] font-serif mt-2">
                    {sysStats.totalUsers}
                  </div>
                  <div className="text-[11px] text-emerald-600 font-mono mt-1">
                    {sysStats.studentCount} Cadets • {sysStats.facultyCount} Faculty
                  </div>
                </Card>

                <Card className="p-5 bg-white border-[#E2E8F0] shadow-sm rounded-2xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#4A4A4A] font-mono">System Uptime</span>
                    <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-emerald-700 font-mono mt-2">
                    {MOCK_SUPERADMIN_DATA.systemStats.systemHealth}
                  </div>
                  <div className="text-[11px] text-[#4A4A4A] font-mono mt-1">
                    Main Campus Cloud Node
                  </div>
                </Card>

                <Card className="p-5 bg-white border-[#E2E8F0] shadow-sm rounded-2xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#4A4A4A] font-mono">Forensic Lab Executions</span>
                    <div className="p-2 rounded-xl bg-[#002D62]/5 text-[#002D62]">
                      <Cpu className="h-4 w-4 text-[#C5A059]" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-[#002D62] font-mono mt-2">
                    {sysStats.labSessions}
                  </div>
                  <div className="text-[11px] text-indigo-600 font-mono mt-1">
                    Disassembly & RAM Images
                  </div>
                </Card>

                <Card className="p-5 bg-white border-[#E2E8F0] shadow-sm rounded-2xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#4A4A4A] font-mono">Database Volume</span>
                    <div className="p-2 rounded-xl bg-[#002D62]/5 text-[#002D62]">
                      <Database className="h-4 w-4 text-[#C5A059]" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-[#002D62] font-mono mt-2">
                    14.2 GB
                  </div>
                  <div className="text-[11px] text-[#4A4A4A] font-mono mt-1">
                    PostgreSQL 16 + RLS Active
                  </div>
                </Card>
              </div>

              {/* Infrastructure Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Cloud Nodes & Database (6 Columns) */}
                <div className="lg:col-span-6 space-y-4">
                  <Card className="p-6 bg-white border-[#E2E8F0] shadow-sm rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-[#002D62] font-serif">Cloud Node Topology</h3>
                      <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono">
                        Online
                      </Badge>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-[#F8F9FA] border border-[#E2E8F0] flex items-center justify-between">
                        <div>
                          <div className="font-bold text-[#002D62]">FSUU Butuan Main Data Center</div>
                          <div className="text-[10px] text-[#4A4A4A] font-mono">Region: Caraga / Philippines (ap-southeast-1)</div>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-mono text-emerald-600 border-emerald-200">
                          Primary
                        </Badge>
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#F8F9FA] border border-[#E2E8F0] flex items-center justify-between">
                        <div>
                          <div className="font-bold text-[#002D62]">Virtual Crime Lab Virtualization Engine</div>
                          <div className="text-[10px] text-[#4A4A4A] font-mono">Container Node: Next.js + Tailwind v4 + WebAssembly</div>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-mono text-cyan-600 border-cyan-200">
                          Active
                        </Badge>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Institutional Accreditation Card (6 Columns) */}
                <div className="lg:col-span-6 space-y-4">
                  <Card className="p-6 bg-white border-[#E2E8F0] shadow-sm rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-[#002D62] font-serif">Institutional Accreditation</h3>
                      <Badge className="bg-[#002D62] text-white text-[10px] font-mono">
                        Level III
                      </Badge>
                    </div>

                    <div className="p-4 rounded-xl bg-[#002D62]/5 border border-[#002D62]/10 space-y-2 text-xs">
                      <div className="font-bold text-[#002D62] font-serif">
                        {MOCK_SUPERADMIN_DATA.institution.name}
                      </div>
                      <div className="text-[11px] text-[#4A4A4A]">
                        {MOCK_SUPERADMIN_DATA.institution.accreditationStatus}
                      </div>
                      <div className="text-[11px] text-[#4A4A4A]">
                        Campus: {MOCK_SUPERADMIN_DATA.institution.totalCampuses} • {MOCK_SUPERADMIN_DATA.institution.academicYear}
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USER & ROLE GOVERNANCE */}
          {activeTab === "users-roles" && (
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <Badge className="bg-[#002D62] text-white text-xs font-mono mb-1">
                    Identity & Access Management (IAM)
                  </Badge>
                  <h2 className="text-2xl font-bold text-[#002D62] font-serif">Registered Faculty & Staff</h2>
                  <p className="text-xs text-[#4A4A4A]">
                    Provision instructor credentials, assign CJEP courses, and audit access permissions.
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative w-full sm:w-64">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#4A4A4A]" />
                    <input
                      type="text"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Search faculty..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#F8F9FA] border border-[#E2E8F0] text-xs text-[#1E293B] focus:outline-none focus:border-[#002D62] shadow-sm"
                    />
                  </div>

                  <Button
                    size="sm"
                    onClick={() => setNewFacultyModal(true)}
                    className="bg-[#002D62] hover:bg-[#001F44] text-white font-semibold text-xs rounded-xl gap-1 shrink-0"
                  >
                    <Plus className="h-3.5 w-3.5 text-[#C5A059]" />
                    Add Faculty
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {isLoading ? (
                  <div className="text-xs text-center p-5 text-[#4A4A4A]">Loading enterprise profiles...</div>
                ) : (
                  filteredProfiles.map((user) => (
                    <Card key={user.id} className="p-5 bg-white border-[#E2E8F0] shadow-sm rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2.5">
                          <span className="text-sm font-bold text-[#002D62] font-serif">{user.full_name}</span>
                          <Badge variant="outline" className="text-[10px] font-mono border-[#E2E8F0]">
                            {user.student_or_faculty_id || "No ID"}
                          </Badge>
                          <Badge className="bg-[#002D62]/10 text-[#002D62] border-[#002D62]/20 text-[10px] font-mono">
                            {user.role}
                          </Badge>
                        </div>
  
                        <div className="text-xs text-[#1E293B]">Section: {user.section || "N/A"} • Program: {user.program || "N/A"}</div>
                        <div className="text-[11px] text-[#4A4A4A] font-mono">UUID: {user.id}</div>
                      </div>
  
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right hidden sm:block">
                          <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono">
                            Active
                          </Badge>
                        </div>
  
                        <Button 
                          onClick={() => handleToggleRole(user.id, user.role)}
                          variant="outline" 
                          size="sm" 
                          disabled={user.role === "superadmin"}
                          className="text-xs border-[#E2E8F0] text-[#002D62] rounded-xl hover:bg-[#F8F9FA]"
                        >
                          {user.role === "instructor" ? "Demote to Student" : "Promote to Faculty"}
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: SUPABASE & RLS POLICIES */}
          {activeTab === "db-security" && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-2">
                <Badge className="bg-[#002D62] text-white text-xs font-mono">
                  Database Layer Architecture
                </Badge>
                <h2 className="text-2xl font-bold text-[#002D62] font-serif">Supabase Row-Level Security (RLS) Matrix</h2>
                <p className="text-xs text-[#4A4A4A] max-w-2xl">
                  Enforces multi-tenant zero-trust access control for student profiles, evidence submissions, and grading records.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-5 bg-white border-[#E2E8F0] shadow-sm rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#002D62] font-mono">user_profiles</span>
                    <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono">
                      RLS Enabled
                    </Badge>
                  </div>
                  <p className="text-xs text-[#4A4A4A]">Cadets can only view their own records; Faculty can view their enrolled section rosters.</p>
                </Card>

                <Card className="p-5 bg-white border-[#E2E8F0] shadow-sm rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#002D62] font-mono">lab_submissions</span>
                    <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono">
                      RLS Enabled
                    </Badge>
                  </div>
                  <p className="text-xs text-[#4A4A4A]">Insert allowed for authenticated cadets; Update/Grading restricted to verified Faculty.</p>
                </Card>

                <Card className="p-5 bg-white border-[#E2E8F0] shadow-sm rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#002D62] font-mono">grading_records</span>
                    <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono">
                      RLS Enabled
                    </Badge>
                  </div>
                  <p className="text-xs text-[#4A4A4A]">Formula computation runs on secure server actions; Cadets have read-only access to final marks.</p>
                </Card>
              </div>
            </div>
          )}

          {/* TAB 4: AUDIT LOGS */}
          {activeTab === "audit-logs" && (
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-2">
                <Badge className="bg-[#002D62] text-white text-xs font-mono">
                  Compliance & Traceability
                </Badge>
                <h2 className="text-2xl font-bold text-[#002D62] font-serif">Enterprise System Audit Trail</h2>
                <p className="text-xs text-[#4A4A4A] max-w-2xl">
                  Immutable forensic audit log recording all curriculum updates, syllabus approvals, and administrative actions.
                </p>
              </div>

              <div className="space-y-3">
                {isLoading ? (
                  <div className="text-xs text-center p-5 text-[#4A4A4A]">Loading enterprise logs...</div>
                ) : auditLogs.length === 0 ? (
                  <div className="text-xs text-center p-5 text-[#4A4A4A]">No audit logs recorded yet.</div>
                ) : (
                  auditLogs.map((log) => (
                    <Card key={log.id} className="p-4 bg-white border-[#E2E8F0] shadow-sm rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#002D62] font-serif">{log.actor_name || "System"}</span>
                          <Badge variant="outline" className="text-[10px] font-mono border-[#E2E8F0]">
                            {log.ip_address}
                          </Badge>
                        </div>
                        <p className="text-[#1E293B] font-medium">{log.action}</p>
                      </div>
  
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[10px] text-[#4A4A4A] font-mono">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                        <Badge className={log.severity === "High" ? "bg-amber-50 text-amber-800 border border-amber-300 font-mono text-[10px]" : "bg-slate-100 text-slate-700 font-mono text-[10px]"}>
                          {log.severity}
                        </Badge>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Provision New Faculty Modal */}
      {newFacultyModal && (
        <Dialog open={newFacultyModal} onOpenChange={setNewFacultyModal}>
          <DialogContent className="sm:max-w-md bg-white text-[#1E293B] border-[#E2E8F0] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-[#002D62] font-serif">
                Provision New Faculty Account
              </DialogTitle>
              <DialogDescription className="text-xs text-[#4A4A4A]">
                Register a new instructor or program coordinator for the Criminal Justice Education Program.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleAddFaculty} className="space-y-3 py-2 text-xs">
              <div>
                <label className="text-xs font-bold text-[#002D62] block mb-1">
                  Full Name with Title:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Atty. Juan Carlos, LLM"
                  value={newFacName}
                  onChange={(e) => setNewFacName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E2E8F0] text-xs focus:outline-none focus:border-[#002D62]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#002D62] block mb-1">
                  Assigned Academic Role:
                </label>
                <select
                  value={newFacRole}
                  onChange={(e) => setNewFacRole(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E2E8F0] text-xs focus:outline-none focus:border-[#002D62]"
                >
                  <option value="Instructor">Faculty Instructor</option>
                  <option value="Course Coordinator">Course Coordinator</option>
                  <option value="Digital Forensics Lab Specialist">Forensics Lab Specialist</option>
                  <option value="Department Chair">Department Chair</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#002D62] block mb-1">
                  Department / Program:
                </label>
                <input
                  type="text"
                  value={newFacDept}
                  onChange={(e) => setNewFacDept(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E2E8F0] text-xs focus:outline-none focus:border-[#002D62]"
                />
              </div>

              <DialogFooter className="gap-2 sm:gap-0 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setNewFacultyModal(false)}
                  className="text-xs border-[#E2E8F0]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-[#002D62] hover:bg-[#001F44] text-white text-xs font-semibold rounded-xl"
                >
                  Create Faculty Account
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
