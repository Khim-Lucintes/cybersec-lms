"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Users,
  GraduationCap,
  FileCheck,
  BarChart3,
  BookOpen,
  Scale,
  Cpu,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  PlusCircle,
  Award,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Home,
  Layers,
  Settings,
  MoreVertical,
  Check,
  X,
  FileText,
  UserCheck,
  Eye
} from "lucide-react";
import { COURSE_INFO, SYLLABUS_MODULES } from "@/lib/curriculum";
import { MOCK_ADMIN_DATA } from "@/lib/adminData";

// Shadcn UI Components
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("overview"); // 'overview', 'cadets', 'curriculum-mgmt', 'grading-matrix', 'outcomes'
  const [submissionSearch, setSubmissionSearch] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [submissionsList, setSubmissionsList] = useState(MOCK_ADMIN_DATA.cadetSubmissions);

  // Grade action state
  const [evaluatingSubmission, setEvaluatingSubmission] = useState(null);
  const [gradeInput, setGradeInput] = useState(90);

  const handleApproveGrade = () => {
    if (!evaluatingSubmission) return;

    setSubmissionsList((prev) =>
      prev.map((sub) =>
        sub.id === evaluatingSubmission.id
          ? { ...sub, status: "Graded", grade: Number(gradeInput), score: `${gradeInput}%` }
          : sub
      )
    );
    setEvaluatingSubmission(null);
  };

  const filteredSubmissions = submissionsList.filter(
    (s) =>
      s.studentName.toLowerCase().includes(submissionSearch.toLowerCase()) ||
      s.unit.toLowerCase().includes(submissionSearch.toLowerCase()) ||
      s.section.toLowerCase().includes(submissionSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1E293B] flex font-sans selection:bg-[#C5A059] selection:text-white">
      {/* 1. Admin Deep Navy Sidebar (#001F44) */}
      <aside className="w-64 border-r border-[#001F44]/30 bg-[#001F44] text-white flex flex-col justify-between shrink-0 h-screen sticky top-0 z-50 shadow-xl">
        <div className="flex flex-col h-full">
          {/* Brand Header */}
          <div className="p-5 border-b border-white/10 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#002D62] border border-[#C5A059]/40 text-[#C5A059] shadow-md">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-white text-sm tracking-tight truncate font-serif">
                FACULTY PORTAL
              </div>
              <div className="text-[11px] text-[#C5A059] font-mono truncate font-semibold">
                CDI 409 Admin Suite
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="p-3 space-y-1.5 overflow-y-auto flex-1">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Course Management
            </div>

            <button
              onClick={() => setActiveSection("overview")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeSection === "overview"
                  ? "bg-[#002D62] text-white shadow-md border-l-4 border-[#C5A059]"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <BarChart3 className="h-4 w-4 text-[#C5A059]" />
              <span>Command Analytics</span>
            </button>

            <button
              onClick={() => setActiveSection("cadets")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeSection === "cadets"
                  ? "bg-[#002D62] text-white shadow-md border-l-4 border-[#C5A059]"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Users className="h-4 w-4 text-[#C5A059]" />
              <span>Cadet Submissions ({submissionsList.filter((s) => s.status === "Needs Review").length})</span>
            </button>

            <button
              onClick={() => setActiveSection("curriculum-mgmt")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeSection === "curriculum-mgmt"
                  ? "bg-[#002D62] text-white shadow-md border-l-4 border-[#C5A059]"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Layers className="h-4 w-4 text-[#C5A059]" />
              <span>Curriculum & 5Es Units</span>
            </button>

            <button
              onClick={() => setActiveSection("grading-matrix")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeSection === "grading-matrix"
                  ? "bg-[#002D62] text-white shadow-md border-l-4 border-[#C5A059]"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Award className="h-4 w-4 text-[#C5A059]" />
              <span>Syllabus Grading Formula</span>
            </button>

            <button
              onClick={() => setActiveSection("outcomes")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeSection === "outcomes"
                  ? "bg-[#002D62] text-white shadow-md border-l-4 border-[#C5A059]"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <GraduationCap className="h-4 w-4 text-[#C5A059]" />
              <span>CHED Program Outcomes</span>
            </button>
          </div>

          {/* Instructor Profile in Sidebar */}
          <div className="p-3 border-t border-white/10 bg-black/20">
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10">
              <div className="h-8 w-8 rounded-lg bg-[#C5A059] flex items-center justify-center font-bold text-[#001F44] text-xs shadow-sm">
                CT
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate font-serif">{MOCK_ADMIN_DATA.instructor.name}</div>
                <div className="text-[10px] text-[#C5A059] font-mono truncate">Dean • CJEP Faculty</div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. Main Administration Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-[#E2E8F0] bg-white/95 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="font-bold text-[#002D62] text-sm sm:text-base font-serif">
              CDI 409 Faculty Administration & Analytics Engine
            </span>
            <Badge className="bg-[#002D62]/10 text-[#002D62] border-[#002D62]/20 text-[10px] font-mono hidden md:inline-flex">
              Instructor Mode
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard/student">
              <Button variant="outline" size="sm" className="text-xs border-[#E2E8F0] text-[#002D62] hover:bg-[#F8F9FA]">
                Switch to Cadet View
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

        {/* Dynamic Section Rendering */}
        <div className="p-6 max-w-7xl mx-auto w-full flex-1 space-y-6">
          {/* SECTION 1: COMMAND ANALYTICS OVERVIEW */}
          {activeSection === "overview" && (
            <div className="space-y-6">
              {/* Stat Cards Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-5 bg-white border-[#E2E8F0] shadow-sm rounded-2xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#4A4A4A] font-mono">Enrolled Cadets</span>
                    <div className="p-2 rounded-xl bg-[#002D62]/5 text-[#002D62]">
                      <Users className="h-4 w-4 text-[#C5A059]" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-[#002D62] font-serif mt-2">
                    {MOCK_ADMIN_DATA.stats.totalEnrolledCadets}
                  </div>
                  <div className="text-[11px] text-emerald-600 font-mono mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>2 Sections (Alpha & Bravo)</span>
                  </div>
                </Card>

                <Card className="p-5 bg-white border-[#E2E8F0] shadow-sm rounded-2xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#4A4A4A] font-mono">Pending Reviews</span>
                    <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                      <Clock className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-[#002D62] font-serif mt-2">
                    {submissionsList.filter((s) => s.status === "Needs Review").length}
                  </div>
                  <div className="text-[11px] text-[#4A4A4A] font-mono mt-1">
                    Practicum Labs & Case Studies
                  </div>
                </Card>

                <Card className="p-5 bg-white border-[#E2E8F0] shadow-sm rounded-2xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#4A4A4A] font-mono">Class Standing Mean</span>
                    <div className="p-2 rounded-xl bg-[#002D62]/5 text-[#002D62]">
                      <Award className="h-4 w-4 text-[#C5A059]" />
                    </div>
                  </div>
                  
                  {/* Header with Title and PDF Export Action */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h1 className="text-2xl font-bold text-[#002D62] tracking-tight font-serif">
                        CDI 409 Faculty Evaluation & Class Standing Desk
                      </h1>
                      <p className="text-xs text-[#4A4A4A] mt-1 font-mono">
                        AY 2026-2027 • 1st Semester • Section Alpha (4th Year Criminology)
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button
                        onClick={async () => {
                          const { generateCadetGradePDF } = await import("@/lib/pdfGenerator");
                          generateCadetGradePDF({
                            id: "SEC-ALPHA-2026",
                            name: "Section Alpha Cadet Cohort",
                            program: "Bachelor of Science in Criminology",
                            section: "Section Alpha",
                            yearLevel: "4th Year",
                          }, {});
                        }}
                        className="bg-[#002D62] hover:bg-[#001F44] text-white font-semibold text-xs rounded-xl shadow-md gap-2 h-10 px-4"
                      >
                        <FileText className="h-4 w-4 text-[#C5A059]" />
                        Export Section Grade Roster (PDF)
                      </Button>
                    </div>
                  </div>
                </Card>

                <Card className="p-5 bg-white border-[#E2E8F0] shadow-sm rounded-2xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#4A4A4A] font-mono">OBE Passing Rate</span>
                    <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-emerald-700 font-mono mt-2">
                    {MOCK_ADMIN_DATA.stats.passingRate}
                  </div>
                  <div className="text-[11px] text-[#4A4A4A] font-mono mt-1">
                    Based on 60% Summative + 40% Classwork
                  </div>
                </Card>
              </div>

              {/* Section Comparison & Recent Submissions Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Cohort Performance by Section (5 Columns) */}
                <div className="lg:col-span-5 space-y-4">
                  <Card className="bg-white border-[#E2E8F0] shadow-sm rounded-2xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-bold text-[#002D62] font-serif">
                        Cohort Performance by Section
                      </CardTitle>
                      <CardDescription className="text-xs text-[#4A4A4A]">
                        Academic performance across enrolled Criminology classes
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {MOCK_ADMIN_DATA.sections.map((sec) => (
                        <div key={sec.id} className="p-4 rounded-xl bg-[#F8F9FA] border border-[#E2E8F0] space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#002D62] font-serif">{sec.name}</span>
                            <span className="text-xs font-bold font-mono text-[#002D62]">{sec.averageGrade}% Average</span>
                          </div>
                          <Progress value={sec.averageGrade} className="h-2 bg-slate-200 [&>div]:bg-[#002D62]" />
                          <div className="flex items-center justify-between text-[10px] text-[#4A4A4A] font-mono">
                            <span>{sec.count} Cadets</span>
                            <span>Rating: 1.50</span>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Program Outcome Mastery Summary */}
                  <Card className="bg-white border-[#E2E8F0] shadow-sm rounded-2xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-bold text-[#002D62] font-serif">
                        Program Outcome (PO) Compliance
                      </CardTitle>
                      <CardDescription className="text-xs text-[#4A4A4A]">
                        CHED Criminology standard outcome attainment
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {MOCK_ADMIN_DATA.outcomesPerformance.map((po) => (
                        <div key={po.code} className="flex items-center justify-between p-3 rounded-xl bg-[#F8F9FA] border border-[#E2E8F0] text-xs">
                          <div className="flex items-center gap-2.5">
                            <Badge className="bg-[#002D62] text-white font-mono text-[10px]">{po.code}</Badge>
                            <span className="font-medium text-[#1E293B]">{po.name}</span>
                          </div>
                          <span className="font-bold text-[#002D62] font-mono">{po.mastery}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Live Practicum Submissions Feed (7 Columns) */}
                <div className="lg:col-span-7 space-y-4">
                  <Card className="bg-white border-[#E2E8F0] shadow-sm rounded-2xl">
                    <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                      <div>
                        <CardTitle className="text-base font-bold text-[#002D62] font-serif">
                          Recent Cadet Lab Submissions
                        </CardTitle>
                        <CardDescription className="text-xs text-[#4A4A4A]">
                          Live digital forensics & legal case practicum submissions
                        </CardDescription>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setActiveSection("cadets")}
                        className="text-xs border-[#E2E8F0] text-[#002D62]"
                      >
                        View All
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {submissionsList.slice(0, 4).map((sub) => (
                        <div
                          key={sub.id}
                          className="p-4 rounded-xl bg-[#F8F9FA] border border-[#E2E8F0] space-y-2 hover:border-[#002D62]/40 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[#002D62] font-serif">{sub.studentName}</span>
                              <Badge variant="outline" className="text-[10px] font-mono border-[#E2E8F0] text-[#4A4A4A]">
                                {sub.section}
                              </Badge>
                            </div>
                            <Badge
                              className={`text-[10px] font-mono ${
                                sub.status === "Graded"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              {sub.status}
                            </Badge>
                          </div>

                          <div className="text-xs text-[#1E293B] font-medium">{sub.task}</div>
                          <div className="text-[11px] text-[#4A4A4A]">{sub.complianceNote}</div>

                          <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0] text-[10px] text-[#4A4A4A] font-mono">
                            <span>Time: {sub.submissionTime}</span>
                            <div className="flex items-center gap-2">
                              {sub.status === "Needs Review" ? (
                                <Button
                                  size="sm"
                                  onClick={() => setEvaluatingSubmission(sub)}
                                  className="h-7 text-xs bg-[#002D62] hover:bg-[#001F44] text-white px-2.5 rounded-lg"
                                >
                                  Grade Practicum
                                </Button>
                              ) : (
                                <span className="font-bold text-[#002D62] text-xs">Score: {sub.score}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: CADET SUBMISSIONS & GRADING DESK */}
          {activeSection === "cadets" && (
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <Badge className="bg-[#002D62] text-white text-xs font-mono mb-1">
                    Cadet Practicum Evaluator
                  </Badge>
                  <h2 className="text-2xl font-bold text-[#002D62] font-serif">Student Submissions & Forensics Logs</h2>
                  <p className="text-xs text-[#4A4A4A]">
                    Evaluate laboratory evidence extractions, RAM capture reports, and RA 10175 legal briefs.
                  </p>
                </div>

                {/* Filter Search */}
                <div className="relative w-full sm:w-72">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#4A4A4A]" />
                  <input
                    type="text"
                    value={submissionSearch}
                    onChange={(e) => setSubmissionSearch(e.target.value)}
                    placeholder="Search cadet or task..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#F8F9FA] border border-[#E2E8F0] text-xs text-[#1E293B] placeholder:text-[#4A4A4A] focus:outline-none focus:border-[#002D62] transition-colors shadow-sm"
                  />
                </div>
              </div>

              {/* Submissions Table / Cards */}
              <div className="grid grid-cols-1 gap-3">
                {filteredSubmissions.map((sub) => (
                  <Card key={sub.id} className="p-5 bg-white border-[#E2E8F0] shadow-sm rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm font-bold text-[#002D62] font-serif">{sub.studentName}</span>
                        <Badge variant="outline" className="text-[10px] font-mono border-[#E2E8F0]">
                          {sub.studentId}
                        </Badge>
                        <Badge className="bg-[#002D62]/10 text-[#002D62] border-[#002D62]/20 text-[10px] font-mono">
                          {sub.section}
                        </Badge>
                      </div>

                      <div className="text-xs font-semibold text-[#1E293B]">{sub.unit} • {sub.task}</div>
                      <p className="text-xs text-[#4A4A4A]">{sub.complianceNote}</p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <div className="text-xs font-bold font-mono text-[#002D62]">{sub.score}</div>
                        <div className="text-[10px] text-[#4A4A4A] font-mono">{sub.submissionTime}</div>
                      </div>

                      {sub.status === "Needs Review" ? (
                        <Button
                          size="sm"
                          onClick={() => setEvaluatingSubmission(sub)}
                          className="bg-[#002D62] hover:bg-[#001F44] text-white font-semibold text-xs rounded-xl shadow-sm"
                        >
                          Grade Now
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEvaluatingSubmission(sub)}
                          className="text-xs border-[#E2E8F0] text-[#002D62] rounded-xl hover:bg-[#F8F9FA]"
                        >
                          Update Score
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 3: CURRICULUM & 5Es MANAGEMENT */}
          {activeSection === "curriculum-mgmt" && (
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-2">
                <Badge className="bg-[#C5A059] text-white text-xs font-mono">
                  Syllabus Architect
                </Badge>
                <h2 className="text-2xl font-bold text-[#002D62] font-serif">Course Content & 5Es Units (CDI 409)</h2>
                <p className="text-xs text-[#4A4A4A] max-w-2xl">
                  Father Saturnino Urios University Criminal Justice Education Program curriculum units and allocated lecture/lab hours.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SYLLABUS_MODULES.map((mod) => (
                  <Card key={mod.id} className="p-5 bg-white border-[#E2E8F0] shadow-sm rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-[#002D62] text-white font-mono text-xs">Unit {mod.lessonNumber}</Badge>
                      <span className="text-[10px] text-[#4A4A4A] font-mono">{mod.period} • {mod.duration}</span>
                    </div>

                    <h3 className="text-base font-bold text-[#002D62] font-serif">{mod.title}</h3>
                    <p className="text-xs text-[#4A4A4A]">{mod.description}</p>

                    <div className="space-y-1.5 pt-2 border-t border-[#E2E8F0]">
                      <div className="text-[11px] font-bold text-[#002D62] font-serif">5Es Topics:</div>
                      {mod.topics.map((t, idx) => (
                        <div key={idx} className="text-[11px] text-[#4A4A4A] flex items-center gap-1.5">
                          <div className="h-1.5 w-1.5 rounded-full bg-[#C5A059]" />
                          <span className="truncate">{t}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 4: SYLLABUS GRADING FORMULA */}
          {activeSection === "grading-matrix" && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-2">
                <Badge className="bg-[#002D62] text-white text-xs font-mono">
                  Syllabus Section VIII
                </Badge>
                <h2 className="text-2xl font-bold text-[#002D62] font-serif">Institutional Grading Formula Engine</h2>
                <p className="text-xs text-[#4A4A4A] max-w-2xl">
                  Enforces the exact mathematical weights mandated in the Father Saturnino Urios University syllabus.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 bg-white border-[#E2E8F0] shadow-sm rounded-2xl space-y-4">
                  <h3 className="text-base font-bold text-[#002D62] font-serif">1. Summative Tests (60%)</h3>
                  <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#E2E8F0] text-xs space-y-2 text-[#4A4A4A]">
                    <div className="font-semibold text-[#002D62]">Midterm Calculation:</div>
                    <p>• Prelims (50%) + Midterms (50%) = Total / 2</p>
                    <p>• Multiplied by 60% share during the first half of the term.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#E2E8F0] text-xs space-y-2 text-[#4A4A4A]">
                    <div className="font-semibold text-[#002D62]">Finals Calculation:</div>
                    <p>• Semi-finals (50%) + Finals (50%) = Total / 2</p>
                    <p>• Multiplied by 60% share during the second half of the term.</p>
                  </div>
                </Card>

                <Card className="p-6 bg-white border-[#E2E8F0] shadow-sm rounded-2xl space-y-4">
                  <h3 className="text-base font-bold text-[#002D62] font-serif">2. Class Work (40%)</h3>
                  <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#E2E8F0] text-xs space-y-2 text-[#4A4A4A]">
                    <div className="font-semibold text-[#002D62]">Continuous Assessment Sub-components:</div>
                    <p>• Forensic Laboratory Practicum Submissions</p>
                    <p>• Formative Unit Quizzes</p>
                    <p>• Case Analysis Briefings (RA 10175)</p>
                    <p>• Oral Recitations and Reactionnaires</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#002D62]/5 border border-[#002D62]/10 text-xs text-[#002D62] font-bold font-mono">
                    Real Final Grade = (Midterm + 2 x Tentative Final) / 3
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* SECTION 5: CHED PROGRAM OUTCOMES */}
          {activeSection === "outcomes" && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-2">
                <Badge className="bg-[#002D62] text-white text-xs font-mono">
                  Curriculum Accreditation
                </Badge>
                <h2 className="text-2xl font-bold text-[#002D62] font-serif">Program & Graduate Attributes (OBE)</h2>
                <p className="text-xs text-[#4A4A4A] max-w-2xl">
                  Mapping student competencies to the Father Saturnino Urios University Institutional Outcomes and Criminology Standards.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {COURSE_INFO.programOutcomes.map((po) => (
                  <Card key={po.id} className="p-5 bg-white border-[#E2E8F0] shadow-sm rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-[#002D62] text-white font-mono">{po.id}</Badge>
                      <span className="text-[10px] text-[#4A4A4A] font-mono">CHED Standard</span>
                    </div>
                    <h3 className="text-base font-bold text-[#002D62] font-serif">{po.title}</h3>
                    <p className="text-xs text-[#4A4A4A] leading-relaxed">{po.description}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Practicum Grading Evaluation Modal */}
      {evaluatingSubmission && (
        <Dialog open={!!evaluatingSubmission} onOpenChange={() => setEvaluatingSubmission(null)}>
          <DialogContent className="sm:max-w-md bg-white text-[#1E293B] border-[#E2E8F0] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-[#002D62] font-serif">
                Grade Practicum Submission
              </DialogTitle>
              <DialogDescription className="text-xs text-[#4A4A4A]">
                Review evidence compliance and record official classwork marks.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <div className="p-3 rounded-xl bg-[#F8F9FA] border border-[#E2E8F0] space-y-1">
                <div className="font-bold text-[#002D62]">{evaluatingSubmission.studentName} ({evaluatingSubmission.studentId})</div>
                <div className="text-[11px] text-[#4A4A4A]">{evaluatingSubmission.unit} • {evaluatingSubmission.task}</div>
                <p className="text-[11px] text-[#1E293B] mt-1 italic">"{evaluatingSubmission.complianceNote}"</p>
              </div>

              <div>
                <label className="text-xs font-bold text-[#002D62] block mb-1">
                  Practicum Score (0 - 100%):
                </label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={gradeInput}
                  onChange={(e) => setGradeInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E2E8F0] font-mono text-sm font-bold text-[#002D62] focus:outline-none focus:border-[#002D62]"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEvaluatingSubmission(null)}
                className="text-xs border-[#E2E8F0]"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleApproveGrade}
                className="bg-[#002D62] hover:bg-[#001F44] text-white text-xs font-semibold rounded-xl"
              >
                Submit Official Grade
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
