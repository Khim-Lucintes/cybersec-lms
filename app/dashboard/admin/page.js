"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  ChevronLeft,
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
  Eye,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  Download,
  Sliders,
  FileSpreadsheet,
  RefreshCw,
  Trash2,
  Plus,
  Printer,
  QrCode,
  ShieldCheck,
  Loader2,
  Gavel,
  MessageSquare,
  Send,
  Pencil,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  LayoutDashboard,
  Bell,
  Key,
  ClipboardList,
  Terminal,
  LogOut
} from "lucide-react";
import {
  COURSE_INFO,
  SYLLABUS_MODULES,
  getSavedModules,
  saveModulesDynamic,
  fetchDynamicModules,
  resetModules
} from "@/lib/curriculum";
import { MOCK_COC_TEMPLATES } from "@/lib/adminData";
import {
  getPracticumSubmissions,
  gradePracticumSubmission,
  subscribeToPracticumUpdates
} from "@/lib/practicumService";
import { getCohortRoster } from "@/lib/rosterService";
import { getAuditLogs } from "@/lib/superAdminService";
import { supabase } from "@/lib/supabaseClient";
import VideoCoursesCMS from "@/components/VideoCoursesCMS";
import CaseMissionsManager from "@/components/CaseMissionsManager";
import { subscribeToMaintenanceStatus } from "@/lib/maintenanceService";

// Shadcn UI Components
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function AdminDashboard() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("overview"); // 'overview', 'students', 'chain-of-custody', 'grade-curve', 'curriculum-mgmt', 'grading-matrix', 'outcomes'
  const [submissionSearch, setSubmissionSearch] = useState("");
  const [selectedSectionFilter, setSelectedSectionFilter] = useState("All"); // 'All', 'Section Alpha', 'Section Bravo'
  const [submissionsList, setSubmissionsList] = useState([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(true);
  const [isSubmittingGrade, setIsSubmittingGrade] = useState(false);
  const [liveSubmissionNotice, setLiveSubmissionNotice] = useState(null);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Role-Based Access Control (RBAC) Guard
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    async function verifyFacultyClearance() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        let role = null;
        let email = session?.user?.email?.toLowerCase() || "";

        // 1. Check Supabase profiles table for role
        if (session?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single();
          if (profile?.role) {
            role = profile.role.toLowerCase();
          }
        }

        // 2. Check localStorage fallback
        if (!role && typeof window !== "undefined") {
          const stored = localStorage.getItem("student_profile");
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              if (parsed.role) role = parsed.role.toLowerCase();
              if (!email && parsed.email) email = parsed.email.toLowerCase();
            } catch (e) {}
          }
          if (!role) {
            role = localStorage.getItem("user_role")?.toLowerCase() || null;
          }
        }

        // 3. Fallback to email keyword inference
        if (!role && email) {
          if (email.includes("superadmin") || email.includes("root")) role = "superadmin";
          else if (email.includes("dean") || email.includes("faculty") || email.includes("prof") || email.includes("instructor") || email.includes("atty")) role = "faculty";
          else role = "student";
        }

        // If completely unauthenticated, redirect to landing
        if (!session && !localStorage.getItem("student_profile") && !role) {
          router.replace("/");
          return;
        }

        // Strict role check: Prohibit students from accessing admin dashboard
        if (role === "student") {
          console.warn("Faculty RBAC: Access Denied. Students are restricted to the Student Dashboard.");
          router.replace("/dashboard/student");
          return;
        }

        // Allow faculty, instructor, admin, or superadmin
        if (role === "faculty" || role === "admin" || role === "instructor" || role === "superadmin") {
          setIsAuthorized(true);

          // Check local profile cache first
          if (typeof window !== "undefined") {
            const storedProfile = localStorage.getItem("student_profile");
            if (storedProfile) {
              try {
                const parsed = JSON.parse(storedProfile);
                if (parsed?.name) {
                  setFacultyProfile((prev) => ({
                    ...prev,
                    name: parsed.name.trim(),
                    email: parsed.email || prev.email,
                    facultyId: parsed.studentId || prev.facultyId,
                  }));
                }
              } catch (e) {}
            }
          }

          // Fetch live profile from Supabase profiles table
          try {
            const { data: dbProf } = await supabase
              .from("profiles")
              .select("*")
              .or("role.eq.instructor,email.eq.faculty@urios.edu.ph")
              .limit(1)
              .single();

            if (dbProf?.full_name) {
              const cleanName = dbProf.full_name.trim().replace(/^Mr\.(?=[A-Za-z])/, "Mr. ");
              setFacultyProfile({
                name: cleanName,
                title: dbProf.year_level || "Dean / Lead Instructor",
                institution: "Father Saturnino Urios University",
                email: dbProf.email || "faculty@urios.edu.ph",
                facultyId: dbProf.student_or_faculty_id || "FAC-2026-001"
              });
            }
          } catch (profErr) {
            console.warn("Faculty profile load notice:", profErr);
          }
        } else {
          router.replace("/dashboard/student");
          return;
        }
      } catch (err) {
        console.error("Authorization check error:", err);
        const storedRole = localStorage.getItem("user_role")?.toLowerCase();
        if (storedRole === "student") {
          router.replace("/dashboard/student");
          return;
        }
        setIsAuthorized(true);
      } finally {
        setIsCheckingAuth(false);
      }
    }

    verifyFacultyClearance();
  }, [router]);

  const [facultyProfile, setFacultyProfile] = useState({
    name: "Mr. Orlando Ritchie R. Natonton",
    title: "Dean / Lead Instructor",
    institution: "Father Saturnino Urios University",
    email: "faculty@urios.edu.ph",
    facultyId: "FAC-2026-001"
  });

  const handleLogout = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("student_profile");
      localStorage.removeItem("user_role");
    }
    await supabase.auth.signOut();
    router.push("/");
  };

  // System Maintenance Status
  const [maintenanceInfo, setMaintenanceInfo] = useState({ active: false });

  useEffect(() => {
    const unsub = subscribeToMaintenanceStatus((status) => {
      setMaintenanceInfo(status || { active: false });
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (activeSection === "audit-logs") {
      fetchAuditLogsData();
    }
  }, [activeSection]);

  // Custom Alert & Confirm Modals
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: "", message: "", action: null, isDestructive: false });
  const [alertDialog, setAlertDialog] = useState({ open: false, title: "", message: "", isSuccess: true });

  const [showMessages, setShowMessages] = useState(false);
  
  // Messages State
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [msgSubject, setMsgSubject] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const adminId = "22222222-2222-2222-2222-222222222222";

  const fetchMessagesAndNotifs = async () => {
    // Messages
    try {
      const { data, error } = await supabase
        .from('direct_messages')
        .select('*')
        .or(`sender_id.eq.${adminId},receiver_id.eq.${adminId},receiver_id.eq.BROADCAST`)
        .order('created_at', { ascending: true });
      if (!error && data) setMessages(data);
    } catch (e) {
      const stored = localStorage.getItem('all_msgs');
      if (stored) {
        const parsed = JSON.parse(stored);
        setMessages(parsed);
      }
    }

    // Notifications
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .or(`user_id.eq.${adminId},user_id.eq.BROADCAST`)
        .order('created_at', { ascending: false });
      if (!error && data) setNotifications(data);
    } catch (e) {
      const stored = localStorage.getItem(`notifs_${adminId}`);
      if (stored) setNotifications(JSON.parse(stored));
      else {
        setNotifications([{
          id: 1, user_id: adminId, title: "New Practicum Submission", message: "Lucintes submitted Unit 4 lab.", time: "10 mins ago", is_read: false
        }]);
      }
    }
  };

  useEffect(() => {
    fetchMessagesAndNotifs();
  }, [showMessages, showNotifications]);

  const unreadMessagesCount = messages.filter(m => !m.is_read && m.sender_id !== adminId).length;
  const unreadNotifsCount = notifications.filter(n => !n.is_read).length;

  const handleMarkMessagesRead = async () => {
    const updated = messages.map(m => (m.sender_id !== adminId ? { ...m, is_read: true } : m));
    setMessages(updated);
    try {
      await supabase.from('direct_messages').update({ is_read: true }).eq('receiver_id', adminId).eq('is_read', false);
    } catch (e) {}
    localStorage.setItem(`all_msgs`, JSON.stringify(updated));
  };

  const handleMarkNotifsRead = async () => {
    const updated = notifications.map(n => ({ ...n, is_read: true }));
    setNotifications(updated);
    try {
      await supabase.from('notifications').update({ is_read: true }).eq('user_id', adminId).eq('is_read', false);
    } catch (e) {}
    localStorage.setItem(`notifs_${adminId}`, JSON.stringify(updated));
  };

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;
    setIsSendingMessage(true);
    const adminId = "22222222-2222-2222-2222-222222222222";
    try {
      // Admin broadcasts by setting receiver to a broadcast ID or we can just mock it
      const newMsg = {
        sender_id: adminId,
        sender_name: "Admin (Instructor)",
        receiver_id: "BROADCAST",
        content: text,
      };

      const { error } = await supabase.from('direct_messages').insert([newMsg]);
      
      if (error) {
        // Fallback to local storage
        const allMsgs = JSON.parse(localStorage.getItem('all_msgs') || '[]');
        const updatedMsgs = [...allMsgs, { ...newMsg, created_at: new Date().toISOString() }];
        setMessages(updatedMsgs);
        localStorage.setItem('all_msgs', JSON.stringify(updatedMsgs));
        
        // Let's also sync to a specific student if we were replying directly, but for now we broadcast
      } else {
        fetchMessagesAndNotifs();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSendingMessage(false);
    }
  };
  // Live System Audit Logs State
  const [auditLogsList, setAuditLogsList] = useState([]);
  const [isLoadingAuditLogs, setIsLoadingAuditLogs] = useState(false);

  const fetchAuditLogsData = async () => {
    setIsLoadingAuditLogs(true);
    try {
      const logs = await getAuditLogs();
      setAuditLogsList(logs || []);
    } catch (err) {
      console.error("Error loading audit logs:", err);
    } finally {
      setIsLoadingAuditLogs(false);
    }
  };

  // Sidebar Collapse state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Dynamic Grade Curve State
  const [gradeCurveOffset, setGradeCurveOffset] = useState(0);

  // Dynamic Student Cohort Roster State
  const [cohortRoster, setCohortRoster] = useState([]);
  const [isLoadingRoster, setIsLoadingRoster] = useState(true);

  // Edit Grades State
  const [editingStudentGrades, setEditingStudentGrades] = useState(null);
  const [isSubmittingStudentGrades, setIsSubmittingStudentGrades] = useState(false);
  const [editGradesForm, setEditGradesForm] = useState({
    prelims: 0,
    midterms: 0,
    semiFinals: 0,
    finals: 0,
  });

  // Student Management Modals State
  const [viewingStudent, setViewingStudent] = useState(null);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [newStudentData, setNewStudentData] = useState({ 
    name: "", 
    studentId: "", 
    section: "Section Alpha",
    email: "@urios.edu.ph",
    role: "student",
    program: "BS Criminology",
    yearLevel: "4th Year",
    password: ""
  });

  const handleSaveStudentGrades = async () => {
    if (!editingStudentGrades || !editingStudentGrades.grades?.id) return;
    setIsSubmittingStudentGrades(true);
    try {
      await supabase.from('grading_records').update({
        prelim_exam: editGradesForm.prelims,
        midterm_exam: editGradesForm.midterms,
        semi_final_exam: editGradesForm.semiFinals,
        final_exam: editGradesForm.finals
      }).eq('id', editingStudentGrades.grades.id);
      
      // Refresh roster
      const roster = await getCohortRoster();
      setCohortRoster(roster);
      setEditingStudentGrades(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingStudentGrades(false);
    }
  };

  const handleAddStudent = (e) => {
    e.preventDefault();
    if (!newStudentData.name || !newStudentData.studentId) return;

    // Note: To properly create a user in Supabase with auth, it requires calling auth.admin.createUser 
    // from a secure server route (backend). For this dashboard, we simulate the addition in the UI.
    const newStudent = {
      id: `temp-${Date.now()}`,
      uuid: `uuid-${Date.now()}`,
      name: newStudentData.name,
      section: newStudentData.section,
      studentId: newStudentData.studentId,
      program: newStudentData.program,
      yearLevel: newStudentData.yearLevel,
      role: newStudentData.role,
      gender: "U",
      email: newStudentData.email || `${newStudentData.name.toLowerCase().replace(/\s+/g, '.')}@urios.edu.ph`,
      sum: 90,
      cw: 90,
      grades: {}
    };

    setCohortRoster((prev) => [...prev, newStudent]);
    setIsAddStudentOpen(false);
    setNewStudentData({ 
      name: "", studentId: "", section: "Section Alpha", email: "@urios.edu.ph", 
      role: "student", program: "BS Criminology", yearLevel: "4th Year", password: "" 
    });
  };

  const handleDeleteStudent = (id) => {
    setConfirmDialog({
      open: true,
      title: "Confirm Deletion",
      message: "Are you sure you want to delete this user? This action cannot be undone.",
      isDestructive: true,
      action: () => {
        setCohortRoster((prev) => prev.filter((s) => s.id !== id));
        if (viewingStudent?.id === id) setViewingStudent(null);
        setConfirmDialog((prev) => ({ ...prev, open: false }));
        setAlertDialog({ open: true, title: "User Deleted", message: "User successfully deleted from the roster.", isSuccess: true });
      }
    });
  };

  const handleBulkDelete = () => {
    if (selectedUserIds.length === 0) return;
    setConfirmDialog({
      open: true,
      title: "Confirm Bulk Deletion",
      message: `Are you sure you want to delete ${selectedUserIds.length} user(s)? This action cannot be undone.`,
      isDestructive: true,
      action: () => {
        setCohortRoster((prev) => prev.filter((s) => !selectedUserIds.includes(s.id)));
        setSelectedUserIds([]);
        setConfirmDialog((prev) => ({ ...prev, open: false }));
        setAlertDialog({ open: true, title: "Bulk Delete Success", message: `${selectedUserIds.length} user(s) successfully deleted.`, isSuccess: true });
      }
    });
  };

  const handleResetPassword = async (email) => {
    if (!email) {
      setAlertDialog({ open: true, title: "Error", message: "User does not have an email on record.", isSuccess: false });
      return;
    }
    
    setConfirmDialog({
      open: true,
      title: "Reset Password",
      message: `Are you sure you want to send a password reset link to ${email}?`,
      isDestructive: false,
      action: async () => {
        setConfirmDialog((prev) => ({ ...prev, open: false }));
        try {
          const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : undefined;
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: redirectUrl,
          });
          if (error) {
            setAlertDialog({ open: true, title: "Error", message: "Error sending reset link: " + error.message, isSuccess: false });
          } else {
            setAlertDialog({ open: true, title: "Success", message: "Password reset link sent to " + email, isSuccess: true });
          }
        } catch (err) {
          setAlertDialog({ open: true, title: "Error", message: "Error: " + err.message, isSuccess: false });
        }
      }
    });
  };

  // CHED Form 9 & Dean's Transmittal State
  const [chedSectionFilter, setChedSectionFilter] = useState("All");
  const [chedActiveTab, setChedActiveTab] = useState("form9"); // 'form9', 'transmittal', 'distribution'
  const [chedSearchQuery, setChedSearchQuery] = useState("");
  const [transmittalMemoNo, setTransmittalMemoNo] = useState("CJEP-DEAN-TRANSMITTAL-2026-0409");

  // Dynamic Curriculum & Syllabus Management State
  const [curriculumModules, setCurriculumModules] = useState(SYLLABUS_MODULES);
  const [editingModule, setEditingModule] = useState(null);
  const [newTopicInput, setNewTopicInput] = useState("");
  const [isAddUnitModalOpen, setIsAddUnitModalOpen] = useState(false);
  const [curriculumSearch, setCurriculumSearch] = useState("");
  const [curriculumPeriodFilter, setCurriculumPeriodFilter] = useState("All");
  const [curriculumNotice, setCurriculumNotice] = useState(null);
  const [newUnitForm, setNewUnitForm] = useState({
    lessonNumber: 9,
    title: "",
    period: "Finals Examination",
    duration: "4 Hours",
    poMapping: ["POc", "POd"],
    description: "",
    topics: [],
    lab: {
      id: "lab-custom",
      title: "",
      type: "interactive-scenario",
      badge: "Hands-on Lab"
    }
  });

  // Grade action state
  const [evaluatingSubmission, setEvaluatingSubmission] = useState(null);
  const [gradeInput, setGradeInput] = useState(90);
  const [facultyFeedback, setFacultyFeedback] = useState("");

  // Chain of Custody (CoC) Workbench State
  const [selectedCocTemplateId, setSelectedCocTemplateId] = useState("ransomware");
  const [cocCaseData, setCocCaseData] = useState(MOCK_COC_TEMPLATES[0]);
  const [hashVerified, setHashVerified] = useState(false);
  const [newSpecimenModalOpen, setNewSpecimenModalOpen] = useState(false);
  const [newSpecimen, setNewSpecimen] = useState({
    itemNo: "",
    description: "",
    serialNumber: "",
    evidenceBagTag: "",
    sha256: "",
    status: ""
  });

  const handleSelectCocTemplate = (tplId) => {
    setSelectedCocTemplateId(tplId);
    setHashVerified(false);
    if (tplId === "custom") {
      setCocCaseData({
        id: "custom",
        badgeLabel: "Custom Lab Case",
        title: "Custom Law Enforcement Evidence Docket",
        caseNumber: `CC-FSUU-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        warrantNumber: "SW-2026-XXXX-RTC-BR10",
        offenseCharged: "RA 10175 (Cybercrime Prevention Act of 2012)",
        investigatorName: facultyProfile.name || "Evidence Custodian (FSUU CCJE)",
        badgeNumber: facultyProfile.facultyId || "FSUU-CCJE-DFIR",
        unitAssigned: "Regional Anti-Cybercrime Unit 13 (RACU 13)",
        dateRecovered: "September 18, 2026",
        timeRecovered: "14:00 HRS PST",
        location: "Evidence Recovery Location, Butuan City",
        certifyingChief: "PCOL. MARCO T. DELA CRUZ, CESE",
        certifyingTitle: "Chief, Regional Anti-Cybercrime Unit 13 (RACU 13)",
        specimens: [
          {
            itemNo: "ITEM-01",
            description: "Seized Target Storage Device (Hard Drive / Memory)",
            serialNumber: "SN-DEMO-001A",
            evidenceBagTag: "EB-2026-CUST-01",
            sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            status: "Write-Blocked & Sealed in Anti-Static Bag"
          }
        ],
        custodyLog: [
          {
            time: "14:30 HRS",
            releasedBy: `${facultyProfile.name || "Evidence Custodian"}<br/><span style="font-size: 8px;">(First Responder)</span>`,
            receivedBy: "PEMS Renato B. Valdez<br/><span style=\"font-size: 8px;\">(Evidence Custodian, RACU 13)</span>",
            purpose: "Initial evidence receipt from crime scene",
            condition: "Anti-Static Bag Intact"
          }
        ]
      });
    } else {
      const found = MOCK_COC_TEMPLATES.find((t) => t.id === tplId);
      if (found) {
        setCocCaseData(JSON.parse(JSON.stringify(found)));
      }
    }
  };

  const handleOpenCocForSubmission = (sub) => {
    let tpl = MOCK_COC_TEMPLATES[0]; // default ransomware
    if (sub.unit.toLowerCase().includes("warrant") || sub.unit.toLowerCase().includes("interception")) {
      tpl = MOCK_COC_TEMPLATES[1];
    } else if (sub.unit.toLowerCase().includes("environmental") || sub.unit.toLowerCase().includes("green")) {
      tpl = MOCK_COC_TEMPLATES[2];
    }
    const cloned = JSON.parse(JSON.stringify(tpl));
    cloned.investigatorName = sub.studentName;
    cloned.badgeNumber = sub.studentId;
    setCocCaseData(cloned);
    setSelectedCocTemplateId(cloned.id);
    setActiveSection("chain-of-custody");
  };

  const handlePrintCoc = async () => {
    const { generateChainOfCustodyPDF } = await import("@/lib/pdfGenerator");
    generateChainOfCustodyPDF(null, cocCaseData);
  };

  const handlePrintChedForm9 = async (selectedSec = chedSectionFilter) => {
    const { generateChedForm9PDF } = await import("@/lib/pdfGenerator");
    const filtered = selectedSec === "All"
      ? cohortRoster
      : cohortRoster.filter((c) => c.section === selectedSec);

    generateChedForm9PDF(filtered, {
      courseCode: COURSE_INFO.code,
      courseTitle: COURSE_INFO.title,
      institution: COURSE_INFO.institution,
      department: COURSE_INFO.department,
      term: "1st Semester, AY 2026-2027",
      units: "3.0 Units (2.0 Lec / 1.0 Lab)",
      schedule: selectedSec === "Section Bravo" ? "TTh 09:00 - 12:00 PM" : "MWF 08:00 - 10:00 AM",
      instructor: facultyProfile.name,
      sectionLabel: selectedSec === "All" ? "Section Alpha & Section Bravo (Combined Cohort)" : selectedSec,
      curveOffset: gradeCurveOffset,
      date: new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })
    });
  };

  const handlePrintDeansTransmittal = async () => {
    const { generateDeansTransmittalPDF } = await import("@/lib/pdfGenerator");
    generateDeansTransmittalPDF(cohortRoster, {
      courseCode: COURSE_INFO.code,
      courseTitle: COURSE_INFO.title,
      institution: COURSE_INFO.institution,
      department: COURSE_INFO.department,
      term: "1st Semester, Academic Year 2026-2027",
      memoNo: transmittalMemoNo,
      curveOffset: gradeCurveOffset,
      date: new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })
    });
  };

  // Dynamic Curriculum Editor Handlers
  const handleOpenEditModule = (mod) => {
    setEditingModule(JSON.parse(JSON.stringify(mod)));
    setNewTopicInput("");
  };

  const handleSaveEditedModule = () => {
    if (!editingModule) return;
    const updated = curriculumModules.map((m) =>
      m.id === editingModule.id ? editingModule : m
    );
    setCurriculumModules(updated);
    saveModulesDynamic(updated);
    setEditingModule(null);
    setCurriculumNotice(`Unit ${editingModule.lessonNumber} syllabus specifications updated & synchronized!`);
    setTimeout(() => setCurriculumNotice(null), 4000);
  };

  const handleToggleEditingPo = (poId) => {
    if (!editingModule) return;
    const cur = editingModule.poMapping || [];
    const next = cur.includes(poId) ? cur.filter((p) => p !== poId) : [...cur, poId];
    setEditingModule({ ...editingModule, poMapping: next });
  };

  const handleAddTopicToEditing = (e) => {
    e?.preventDefault?.();
    if (!newTopicInput.trim() || !editingModule) return;
    setEditingModule({
      ...editingModule,
      topics: [...(editingModule.topics || []), newTopicInput.trim()]
    });
    setNewTopicInput("");
  };

  const handleRemoveTopicFromEditing = (topicIdx) => {
    if (!editingModule) return;
    setEditingModule({
      ...editingModule,
      topics: editingModule.topics.filter((_, idx) => idx !== topicIdx)
    });
  };

  const handleDeleteModule = (modId) => {
    const target = curriculumModules.find((m) => m.id === modId);
    if (!confirm(`Are you sure you want to remove "${target?.title || "this unit"}" from the course syllabus?`)) return;
    const updated = curriculumModules
      .filter((m) => m.id !== modId)
      .map((m, idx) => ({ ...m, lessonNumber: idx + 1 }));
    setCurriculumModules(updated);
    saveModulesDynamic(updated);
    setCurriculumNotice("Unit removed from syllabus and numbers re-indexed.");
    setTimeout(() => setCurriculumNotice(null), 4000);
  };

  const handleMoveModule = (index, direction) => {
    const newIdx = index + direction;
    if (newIdx < 0 || newIdx >= curriculumModules.length) return;
    const copy = [...curriculumModules];
    const temp = copy[index];
    copy[index] = copy[newIdx];
    copy[newIdx] = temp;
    const reindexed = copy.map((m, idx) => ({ ...m, lessonNumber: idx + 1 }));
    setCurriculumModules(reindexed);
    saveModulesDynamic(reindexed);
    setCurriculumNotice("Curriculum sequence reordered & synchronized.");
    setTimeout(() => setCurriculumNotice(null), 3000);
  };

  const handleCreateNewUnit = (e) => {
    e?.preventDefault?.();
    if (!newUnitForm.title.trim()) return;

    const newModule = {
      id: `lesson-${Date.now()}`,
      lessonNumber: curriculumModules.length + 1,
      title: newUnitForm.title.trim(),
      period: newUnitForm.period,
      duration: newUnitForm.duration || "4 Hours",
      poMapping: newUnitForm.poMapping.length > 0 ? newUnitForm.poMapping : ["POc", "POd"],
      description: newUnitForm.description.trim() || "Advanced forensic science and digital evidence unit.",
      topics: newUnitForm.topics.length > 0 ? newUnitForm.topics : [
        "Core Concepts & Statutory Definitions",
        "Laboratory Acquisition & Forensic Procedures",
        "Judicial Defense & Chain of Custody Documentation"
      ],
      lab: {
        id: `lab-${Date.now()}`,
        title: newUnitForm.lab.title.trim() || `${newUnitForm.title.trim()} Practicum Lab`,
        type: newUnitForm.lab.type || "interactive-scenario",
        badge: newUnitForm.lab.badge || "Hands-on Lab"
      }
    };

    const updated = [...curriculumModules, newModule];
    setCurriculumModules(updated);
    saveModulesDynamic(updated);
    setIsAddUnitModalOpen(false);
    setNewUnitForm({
      lessonNumber: updated.length + 1,
      title: "",
      period: "Finals Examination",
      duration: "4 Hours",
      poMapping: ["POc", "POd"],
      description: "",
      topics: [],
      lab: {
        id: "lab-custom",
        title: "",
        type: "interactive-scenario",
        badge: "Hands-on Lab"
      }
    });
    setCurriculumNotice(`Unit ${newModule.lessonNumber}: ${newModule.title} created & added to syllabus!`);
    setTimeout(() => setCurriculumNotice(null), 4000);
  };

  const handleResetSyllabus = () => {
    if (!confirm("Reset syllabus back to standard institutional CHED baseline? All custom edits will be restored to defaults.")) return;
    const restored = resetModules();
    setCurriculumModules(restored);
    setCurriculumNotice("Syllabus reset to default CHED curriculum baseline.");
    setTimeout(() => setCurriculumNotice(null), 4000);
  };


  const handleVerifyHashes = () => {
    setHashVerified(true);
  };

  const handleDeleteSpecimen = (idx) => {
    setCocCaseData((prev) => ({
      ...prev,
      specimens: prev.specimens.filter((_, i) => i !== idx)
    }));
  };

  const handleAddSpecimen = () => {
    if (!newSpecimen.description) return;
    setCocCaseData((prev) => ({
      ...prev,
      specimens: [...(prev.specimens || []), newSpecimen]
    }));
    setNewSpecimenModalOpen(false);
  };

  // 1. Live Sync Engine: Load Submissions & Real-Time Subscription
  const loadSubmissions = async (showLoading = false) => {
    if (showLoading) setIsLoadingSubmissions(true);
    try {
      const data = await getPracticumSubmissions();
      setSubmissionsList(data);
    } catch (err) {
      console.warn("Notice loading submissions:", err);
    } finally {
      if (showLoading) setIsLoadingSubmissions(false);
    }
  };

  useEffect(() => {
    loadSubmissions(true);

    fetchDynamicModules().then((initialCurriculum) => {
      setCurriculumModules(initialCurriculum);
    });

    // Fetch dynamic cohort roster
    setIsLoadingRoster(true);
    getCohortRoster().then((roster) => {
      setCohortRoster(roster);
      setIsLoadingRoster(false);
    });

    const unsubscribe = subscribeToPracticumUpdates((event) => {
      if (event?.type === "created" && event.submission) {
        setLiveSubmissionNotice(`New practicum submission from ${event.submission.studentName}!`);
        setTimeout(() => setLiveSubmissionNotice(null), 5000);
      }
      loadSubmissions(false);
    });

    const handleTopicsUpdate = (e) => {
      if (e.detail) {
        setCaseTopics(e.detail);
      }
    };

    const handleCurriculumUpdate = (e) => {
      if (e.detail && Array.isArray(e.detail)) {
        setCurriculumModules(e.detail);
      }
    };

    window.addEventListener("cdi409_case_topics_updated", handleTopicsUpdate);
    window.addEventListener("cdi409_curriculum_updated", handleCurriculumUpdate);

    return () => {
      unsubscribe();
      window.removeEventListener("cdi409_case_topics_updated", handleTopicsUpdate);
      window.removeEventListener("cdi409_curriculum_updated", handleCurriculumUpdate);
    };
  }, []);



  // 2. Asynchronous Grade Evaluation with Database & Cohort Sync
  const handleApproveGrade = async () => {
    if (!evaluatingSubmission) return;

    setIsSubmittingGrade(true);
    const numGrade = Number(gradeInput);

    try {
      await gradePracticumSubmission({
        submissionId: evaluatingSubmission.id,
        grade: numGrade,
        feedback: facultyFeedback,
        graderId: "FAC-2026-001",
        graderName: facultyProfile.name
      });

      // Update state immediately
      setSubmissionsList((prev) =>
        prev.map((sub) =>
          sub.id === evaluatingSubmission.id
            ? {
                ...sub,
                status: "Graded",
                grade: numGrade,
                score: `${numGrade}%`,
                complianceNote: facultyFeedback || sub.complianceNote
              }
            : sub
        )
      );

      // Re-adjust cohort student score if student is part of enrolled roster
      setCohortRoster((prev) =>
        prev.map((student) => {
          if (student.id === evaluatingSubmission.studentId || student.name === evaluatingSubmission.studentName) {
            return {
              ...student,
              cw: Math.min(100, Math.round((student.cw + numGrade) / 2))
            };
          }
          return student;
        })
      );

      setEvaluatingSubmission(null);
      setFacultyFeedback("");
    } catch (err) {
      console.error("Grading execution notice:", err);
    } finally {
      setIsSubmittingGrade(false);
    }
  };

  // Dynamic calculations for cohort metrics
  const computedMetrics = useMemo(() => {
    const totalStudents = cohortRoster.length;
    let totalGradeSum = 0;
    let passingCount = 0;

    cohortRoster.forEach((c) => {
      const curSum = Math.min(100, c.sum + gradeCurveOffset);
      const curCw = Math.min(100, c.cw + gradeCurveOffset);
      const finalG = curSum * 0.60 + curCw * 0.40;
      totalGradeSum += finalG;
      if (finalG >= 75) passingCount++;
    });

    const averageGrade = totalStudents > 0 ? (totalGradeSum / totalStudents).toFixed(1) : 0;
    const passingRate = totalStudents > 0 ? ((passingCount / totalStudents) * 100).toFixed(1) : 100;
    const pendingReviews = submissionsList.filter((s) => s.status === "Needs Review").length;

    return {
      averageGrade,
      passingRate: `${passingRate}%`,
      pendingReviews,
      totalStudents: totalStudents
    };
  }, [cohortRoster, gradeCurveOffset, submissionsList]);

  const cohortMetrics = computedMetrics;

  // Dynamic sections stats for the dashboard
  const sectionsStats = useMemo(() => {
    const stats = {};
    cohortRoster.forEach((c) => {
      const sec = c.section || "Unassigned";
      if (!stats[sec]) {
        stats[sec] = { totalStudents: 0, totalGradeSum: 0 };
      }
      stats[sec].totalStudents += 1;
      const curSum = Math.min(100, c.sum + gradeCurveOffset);
      const curCw = Math.min(100, c.cw + gradeCurveOffset);
      const finalG = curSum * 0.60 + curCw * 0.40;
      stats[sec].totalGradeSum += finalG;
    });
    return stats;
  }, [cohortRoster, gradeCurveOffset]);

  // Filtered submissions based on search and section
  const filteredSubmissions = useMemo(() => {
    return submissionsList.filter((s) => {
      const matchesSearch =
        s.studentName.toLowerCase().includes(submissionSearch.toLowerCase()) ||
        s.unit.toLowerCase().includes(submissionSearch.toLowerCase()) ||
        s.studentId.toLowerCase().includes(submissionSearch.toLowerCase());
      const matchesSection = selectedSectionFilter === "All" || s.section === selectedSectionFilter;
      return matchesSearch && matchesSection;
    });
  }, [submissionsList, submissionSearch, selectedSectionFilter]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-6 text-center">
        <div className="relative h-12 w-12 rounded-full p-0.5 bg-gradient-to-tr from-[#C5A059] to-[#002D62] shadow-sm overflow-hidden mb-4 animate-pulse">
          <img src="/fsuu_seal.jpg" alt="FSUU CCJE Seal" className="h-full w-full object-cover rounded-full" />
        </div>
        <Loader2 className="h-6 w-6 text-[#002D62] animate-spin mb-2" />
        <p className="text-sm font-semibold text-[#002D62] font-serif">Verifying Faculty Clearance...</p>
        <p className="text-xs text-slate-500 font-mono mt-0.5">Institutional Access Control</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1E293B] flex flex-col md:flex-row font-sans selection:bg-[#002D62] selection:text-white">
      {/* 1. Deep Navy Collapsible Sidebar */}
      <aside
        className={`${
          sidebarCollapsed ? "md:w-20" : "md:w-64"
        } w-full bg-[#001F44] text-white flex flex-col justify-between shrink-0 md:h-screen md:sticky md:top-0 z-30 transition-all duration-300 ease-in-out shadow-lg relative`}
      >
        {/* Floating Center-Edge Sidebar Toggle Button (Same as Student Dashboard) */}
        <button
          type="button"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          className="hidden md:flex absolute top-1/2 -right-3 -translate-y-1/2 z-40 h-6 w-6 rounded-full bg-white border border-[#E2E8F0] shadow-xs hover:shadow-md hover:border-[#002D62] text-slate-500 hover:text-[#002D62] hover:bg-[#F8F9FA] items-center justify-center transition-all cursor-pointer group"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 text-[#002D62]" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5 text-slate-500 group-hover:text-[#002D62]" />
          )}
        </button>

        <div>
          {/* Logo Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <Link href="/dashboard/admin" className={`flex items-center gap-2.5 ${sidebarCollapsed ? "justify-center w-full" : ""}`}>
              <div className="relative h-8 w-8 rounded-full p-0.5 bg-gradient-to-tr from-[#C5A059] to-[#002D62] shadow-sm shrink-0 overflow-hidden">
                <img src="/fsuu_seal.jpg" alt="FSUU CCJE Seal" className="h-full w-full object-cover rounded-full" />
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0">
                  <div className="font-bold text-white text-xs tracking-tight font-serif truncate">
                    Urios CyberLearn
                  </div>
                  <div className="text-[10px] text-[#C5A059] font-mono truncate">FSUU CCJE Criminology</div>
                </div>
              )}
            </Link>
          </div>

          {/* Quick Metrics Bar in Sidebar */}
          {!sidebarCollapsed && (
            <div className="p-3.5 mx-3 my-3 bg-white/5 rounded-xl border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-300">Cohort Average</span>
                <span className="font-mono text-[10px] text-[#C5A059] font-bold">
                  {computedMetrics.averageGrade}%
                </span>
              </div>
              <Progress value={Number(computedMetrics.averageGrade)} className="h-1.5 bg-white/10 [&>div]:bg-[#C5A059]" />
              <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[10px] text-slate-400 font-mono">
                <span>{computedMetrics.totalStudents} Students</span>
                <span className="text-emerald-400">{computedMetrics.passingRate} Pass</span>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="p-2.5 space-y-3">
            {[
              {
                group: "COMMAND & GRADING",
                items: [
                  { id: "overview", label: "Admin Overview", icon: LayoutDashboard },
                  { 
                    id: "students", 
                    label: "User Management & Grading", 
                    icon: Users, 
                    badge: submissionsList.filter(s => s.status === "Needs Review" || s.status === "Pending").length > 0 
                      ? `${submissionsList.filter(s => s.status === "Needs Review" || s.status === "Pending").length}` 
                      : null 
                  },
                  { id: "case-missions", label: "Case Missions & CTF", icon: Terminal },
                ]
              },
              {
                group: "COURSEWARE & CMS",
                items: [
                  { id: "courses-cms", label: "Video Lessons CMS", icon: BookOpen },
                  { id: "curriculum-mgmt", label: "Curriculum & Units", icon: Layers },
                  { id: "grading-matrix", label: "Syllabus Formula", icon: Award },
                ]
              },
              {
                group: "ACCREDITATION & AUDIT",
                items: [
                  { id: "outcomes", label: "CHED Outcomes & Transmittal", icon: GraduationCap },
                  { id: "audit-logs", label: "Institutional Audit Logs", icon: ClipboardList },
                  { id: "profile-settings", label: "Profile Settings", icon: Settings }
                ]
              }
            ].map((section, sIdx) => (
              <div key={sIdx} className="space-y-0.5">
                {!sidebarCollapsed && (
                  <div className="text-[9.5px] font-mono font-bold text-slate-400/80 uppercase tracking-wider px-3 py-1">
                    {section.group}
                  </div>
                )}
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      title={sidebarCollapsed ? item.label : undefined}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                        sidebarCollapsed ? "justify-center" : ""
                      } ${
                        isActive
                          ? "bg-gradient-to-r from-[#002D62] to-[#00387A] text-white font-semibold shadow-sm border-l-3 border-[#C5A059]"
                          : "text-slate-300 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-[#C5A059]" : "text-slate-400"}`} />
                        {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                      </div>
                      {!sidebarCollapsed && item.badge && (
                        <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded-full font-bold">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Instructor Profile & Logout Footer */}
        <div className="p-3 border-t border-white/10 bg-black/20">
          <div className={`flex items-center justify-between p-1 rounded-lg hover:bg-white/5 transition-colors ${sidebarCollapsed ? "flex-col gap-2 justify-center" : ""}`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-lg bg-[#C5A059] flex items-center justify-center font-bold text-[#001F44] text-xs shrink-0 shadow-sm font-mono">
                {facultyProfile.name.split(" ").filter(Boolean).map(n => n.replace(/[^A-Za-z]/g, "")[0]).filter(Boolean).slice(-2).join("").toUpperCase() || "RN"}
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0 flex-1 truncate">
                  <div className="text-xs font-bold text-white truncate font-serif">{facultyProfile.name}</div>
                  <div className="text-[10px] text-[#C5A059] font-mono truncate">{facultyProfile.title || "Dean / Lead Instructor"}</div>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-md text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Main Administration Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Minimal Header Bar */}
        <header className="h-14 bg-white border-b border-[#EAEAEA] px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3 text-xs">
            <span className="font-bold text-[#002D62] font-serif tracking-tight text-xs sm:text-sm">
              FATHER SATURNINO URIOS UNIVERSITY
            </span>
            <Badge className="bg-[#002D62] text-white text-[10px] font-mono hidden sm:inline-flex">
              Faculty Admin
            </Badge>
          </div>

          <div className="flex items-center gap-2 relative">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => { setShowMessages(!showMessages); setShowNotifications(false); }}
              className="h-8 w-8 text-[#555] hover:text-[#002D62] hover:bg-[#F8F9FA] relative"
            >
              <MessageSquare className="h-4 w-4" />
              {unreadMessagesCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#C5A059] rounded-full border border-white"></span>
              )}
            </Button>

            {showMessages && (
              <div className="absolute top-12 right-40 w-80 bg-white border border-[#EAEAEA] rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 flex flex-col">
                <div className="p-3 border-b border-[#EAEAEA] flex items-center justify-between bg-[#F8F9FA]">
                  <h3 className="text-xs font-bold text-[#002D62] font-serif">Student Inquiries</h3>
                  {unreadMessagesCount > 0 && (
                    <button onClick={handleMarkMessagesRead} className="text-[10px] text-[#666] hover:text-[#002D62] flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Mark all read
                    </button>
                  )}
                </div>
                <div className="p-0 flex-1 overflow-y-auto max-h-72">
                  {messages.length === 0 ? (
                    <div className="text-center text-[11px] text-[#888] flex flex-col items-center gap-2 py-8">
                      <MessageSquare className="h-6 w-6 text-[#E5E5E5]" />
                      No direct messages from students.
                    </div>
                  ) : (
                    (() => {
                      const adminId = "22222222-2222-2222-2222-222222222222";
                      const inboxThreads = [];
                      const threadMap = {};
                      // Loop backwards to get the latest message per user
                      [...messages].reverse().forEach(msg => {
                        const otherId = msg.sender_id === adminId ? msg.receiver_id : msg.sender_id;
                        if (otherId === 'BROADCAST') return;
                        if (!threadMap[otherId]) {
                          threadMap[otherId] = true;
                          inboxThreads.push({
                            id: otherId,
                            name: msg.sender_id === adminId ? "Student" : (msg.sender_name || "Student"),
                            latestMessage: msg.content,
                            time: msg.created_at,
                            is_read: msg.sender_id === adminId ? true : msg.is_read
                          });
                        }
                      });

                      if (inboxThreads.length === 0) {
                        return (
                          <div className="text-center text-[11px] text-[#888] flex flex-col items-center gap-2 py-8">
                            <MessageSquare className="h-6 w-6 text-[#E5E5E5]" />
                            No direct messages from students.
                          </div>
                        );
                      }

                      return inboxThreads.map((thread, i) => (
                        <div key={i} className={`p-3 cursor-pointer border-b border-[#EAEAEA] flex gap-3 ${!thread.is_read ? 'bg-sky-50/30' : 'hover:bg-[#F8F9FA]'}`} onClick={() => router.push('/dashboard/admin/messages')}>
                          <div className="h-8 w-8 rounded-full bg-[#002D62] text-white flex items-center justify-center shrink-0 text-xs font-bold">
                            {thread.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-[11px] truncate leading-tight ${!thread.is_read ? 'font-bold text-[#002D62]' : 'font-semibold text-[#1E293B]'}`}>{thread.name}</p>
                            <p className="text-[10px] text-[#666] mt-0.5 truncate">{thread.latestMessage}</p>
                            <p className="text-[9px] text-[#999] mt-1 font-mono">
                              {new Date(thread.time || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric' })},{' '}
                              {new Date(thread.time || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          {thread.is_read && (
                            <div className="flex items-center justify-center">
                              <CheckCircle2 className="h-3.5 w-3.5 text-[#AAA]" />
                            </div>
                          )}
                        </div>
                      ));
                    })()
                  )}
                </div>
                <div className="p-2 bg-white border-t border-[#EAEAEA] flex justify-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-[#002D62] text-[11px] font-semibold hover:bg-[#F8F9FA] flex-1 flex items-center justify-center gap-1.5"
                    onClick={() => { setShowMessages(false); setShowNewMessageModal(true); }}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    New Message
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-[#002D62] text-[11px] font-semibold hover:bg-[#F8F9FA] flex-1 flex items-center justify-center gap-1.5"
                    onClick={() => router.push('/dashboard/admin/messages')}
                  >
                    View All
                  </Button>
                </div>
              </div>
            )}

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => { setShowNotifications(!showNotifications); setShowMessages(false); }}
              className="h-8 w-8 text-[#555] hover:text-[#002D62] hover:bg-[#F8F9FA] relative"
            >
              <Bell className="h-4 w-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span>
              )}
            </Button>

            {showNotifications && (
              <div className="absolute top-12 right-28 w-80 bg-white border border-[#EAEAEA] rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="p-3 border-b border-[#EAEAEA] flex items-center justify-between bg-[#F8F9FA]">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-[#002D62] font-serif">System Alerts</h3>
                    {unreadNotifsCount > 0 && (
                      <Badge className="bg-red-500 text-white text-[9px] px-1.5 py-0 h-4">{unreadNotifsCount} New</Badge>
                    )}
                  </div>
                  {unreadNotifsCount > 0 && (
                    <button onClick={handleMarkNotifsRead} className="text-[10px] text-[#666] hover:text-[#002D62] flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Mark all read
                    </button>
                  )}
                </div>
                <div className="p-0 max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="text-center text-[11px] text-[#888] py-6">
                      No new alerts.
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div key={notif.id} className={`p-3 cursor-pointer border-b border-[#EAEAEA] flex gap-3 ${!notif.is_read ? 'bg-sky-50/30' : 'hover:bg-[#F8F9FA]'}`}>
                        <div className="h-8 w-8 rounded-full bg-[#002D62]/10 flex items-center justify-center shrink-0">
                          <ShieldCheck className="h-4 w-4 text-[#002D62]" />
                        </div>
                        <div className="flex-1">
                          <p className={`text-[11px] leading-tight ${!notif.is_read ? 'font-bold text-[#002D62]' : 'font-semibold text-[#1E293B]'}`}>{notif.title}</p>
                          <p className="text-[10px] text-[#666] mt-0.5">{notif.message}</p>
                          <p className="text-[9px] text-[#999] mt-1 font-mono">{notif.time || "Just now"}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="p-2 text-center bg-[#F8F9FA] border-t border-[#EAEAEA]">
                    <button className="text-[10px] font-semibold text-[#002D62] hover:underline">View All Alerts</button>
                  </div>
                )}
              </div>
            )}

            <div className="w-px h-4 bg-[#EAEAEA] mx-1"></div>

            {/* Quick Profile Chip (Matches Student Dashboard) */}
            <div
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full bg-slate-100 border border-slate-200"
              title={facultyProfile.title || "Dean / Lead Instructor"}
            >
              <div className="h-6 w-6 rounded-full bg-[#002D62] text-[#DFCA95] flex items-center justify-center font-bold text-[10px] font-mono shrink-0">
                {facultyProfile.name?.split(" ").filter(Boolean).map(n => n.replace(/[^A-Za-z]/g, "")[0]).filter(Boolean).slice(-2).join("").toUpperCase() || "RN"}
              </div>
              <span className="text-xs font-semibold text-[#002D62] hidden md:inline truncate max-w-[160px]">
                {facultyProfile.name}
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic Section Workspace */}
        <div className="p-4 md:p-6 max-w-6xl mx-auto w-full flex-1 space-y-5">
          {/* Institutional Maintenance Banner for Instructors */}
          {maintenanceInfo?.active && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in shadow-xs">
              <div className="flex items-start sm:items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-200/60 text-amber-900 shrink-0">
                  <ShieldAlert className="h-5 w-5 text-amber-700 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-amber-950">System Maintenance Mode Active (SuperAdmin Protocol)</span>
                    <Badge className="bg-amber-500 text-white text-[9.5px] font-mono">LOCKOUT ACTIVE</Badge>
                  </div>
                  <p className="text-[11px] text-amber-800/90 mt-0.5">
                    Student logins, live forensic terminal commands, and exam submissions are currently suspended. Faculty curriculum editing and grading remain operational.
                  </p>
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                <Link href="/dashboard/superadmin">
                  <Button size="sm" variant="outline" className="h-7 text-[11px] font-semibold border-amber-300 bg-white hover:bg-amber-100 text-amber-900 rounded-lg">
                    SuperAdmin SOC &rarr;
                  </Button>
                </Link>
              </div>
            </div>
          )}
          {/* SECTION 1: ADMIN OVERVIEW */}
          {activeSection === "overview" && (
            <div className="space-y-6">
              {/* Executive Welcome Card */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#001F44] via-[#002D62] to-[#0A3D78] p-6 text-white shadow-lg border border-white/10">
                {/* Watermark Crest */}
                <div className="absolute right-0 top-0 -mt-6 -mr-6 h-64 w-64 opacity-10 pointer-events-none rounded-full overflow-hidden">
                  <img src="/fsuu_seal.jpg" alt="" className="h-full w-full object-cover" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="bg-[#C5A059] text-[#001F44] font-bold text-[10px] font-mono tracking-wider px-2.5 py-0.5 shadow-xs">
                        DEAN / LEAD INSTRUCTOR • CCJE
                      </Badge>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-white">
                      Welcome, {facultyProfile.name}
                    </h1>
                    <div className="text-xs font-mono font-bold text-[#C5A059] tracking-wide flex items-center gap-2">
                      <span>{facultyProfile.title || "Dean / Lead Instructor"}</span>
                      <span className="text-white/40">•</span>
                      <span className="text-slate-300 font-normal">College of Criminal Justice Education</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                      The official interactive learning system of Father Saturnino Urios University College of Criminal Justice Education. Master simulated Linux command-line artifact recovery, volatile memory analysis, and statutory case investigation under <strong className="text-amber-300 font-semibold">Republic Act 10175 (Cybercrime Prevention Act)</strong> and <strong className="text-amber-300 font-semibold">Republic Act 10173 (Data Privacy Act)</strong>.
                    </p>
                  </div>

                  {/* Fast Action Desk Shortcuts */}
                  <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
                    <Button
                      onClick={() => setActiveSection("students")}
                      className="bg-[#C5A059] hover:bg-[#d4b068] text-[#001F44] font-bold text-xs h-9 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Users className="h-4 w-4" />
                      User Management
                    </Button>
                    <div className="flex items-center gap-2">
                      <Link href="/dashboard/student" className="w-full">
                        <Button
                          variant="outline"
                          className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs h-8 rounded-xl font-medium flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Eye className="h-3.5 w-3.5 text-[#C5A059]" />
                          Student View
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4 Executive Stat Cards Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-5 bg-white border-[#E2E8F0] shadow-sm rounded-2xl space-y-2 hover:-translate-y-0.5 hover:shadow-md transition-all relative overflow-hidden group">
                  <div className="flex items-center justify-between text-[#555]">
                    <span className="text-[11px] font-bold font-mono tracking-wider text-slate-500">ENROLLED STUDENTS</span>
                    <div className="h-8 w-8 rounded-xl bg-[#002D62]/10 flex items-center justify-center text-[#002D62]">
                      <Users className="h-4 w-4 text-[#002D62]" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-[#002D62] font-mono tracking-tight">
                    {computedMetrics.totalStudents}
                  </div>
                  <div className="flex items-center justify-between text-[10.5px]">
                    <span className="text-slate-500 font-medium">Sec Alpha & Bravo</span>
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded font-mono">100% Retained</span>
                  </div>
                </Card>

                <Card className="p-5 bg-white border-[#E2E8F0] shadow-sm rounded-2xl space-y-2 hover:-translate-y-0.5 hover:shadow-md transition-all relative overflow-hidden group">
                  <div className="flex items-center justify-between text-[#555]">
                    <span className="text-[11px] font-bold font-mono tracking-wider text-slate-500">GRADING QUEUE</span>
                    <div className="h-8 w-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-700">
                      <Clock className="h-4 w-4 text-amber-600" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-[#002D62] font-mono tracking-tight">
                    {submissionsList.filter(s => s.status === "Needs Review" || s.status === "Pending").length}
                  </div>
                  <div className="flex items-center justify-between text-[10.5px]">
                    <span className="text-slate-500 font-medium">{submissionsList.filter(s => s.status === "Graded").length} Graded</span>
                    <span className="text-amber-800 font-bold bg-amber-50 px-1.5 py-0.5 rounded font-mono">
                      {submissionsList.filter(s => s.status === "Needs Review" || s.status === "Pending").length > 0 ? "Needs Review" : "Up-to-Date"}
                    </span>
                  </div>
                </Card>

                <Card className="p-5 bg-white border-[#E2E8F0] shadow-sm rounded-2xl space-y-2 hover:-translate-y-0.5 hover:shadow-md transition-all relative overflow-hidden group">
                  <div className="flex items-center justify-between text-[#555]">
                    <span className="text-[11px] font-bold font-mono tracking-wider text-slate-500">COHORT MEAN</span>
                    <div className="h-8 w-8 rounded-xl bg-[#C5A059]/15 flex items-center justify-center text-[#C5A059]">
                      <Award className="h-4 w-4 text-[#C5A059]" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-[#002D62] font-mono tracking-tight">
                    {computedMetrics.averageGrade}%
                  </div>
                  <div className="flex items-center justify-between text-[10.5px]">
                    <span className="text-slate-500 font-medium">GPA: {computedMetrics.averageGrade >= 90 ? "1.50 Superior" : "2.00 Very Good"}</span>
                    <span className="text-[#002D62] font-bold bg-[#002D62]/10 px-1.5 py-0.5 rounded font-mono">
                      {gradeCurveOffset > 0 ? `+${gradeCurveOffset}% Curved` : "Base 60/40"}
                    </span>
                  </div>
                </Card>

                <Card className="p-5 bg-white border-[#E2E8F0] shadow-sm rounded-2xl space-y-2 hover:-translate-y-0.5 hover:shadow-md transition-all relative overflow-hidden group">
                  <div className="flex items-center justify-between text-[#555]">
                    <span className="text-[11px] font-bold font-mono tracking-wider text-slate-500">OBE PASS RATE</span>
                    <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-700">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-[#002D62] font-mono tracking-tight">
                    {computedMetrics.passingRate}
                  </div>
                  <div className="flex items-center justify-between text-[10.5px]">
                    <span className="text-slate-500 font-medium">CMO No. 5 Standard</span>
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded font-mono">CHED Compliant</span>
                  </div>
                </Card>
              </div>

              {/* Pending Submissions Triage Queue Card */}
              {submissionsList.filter(s => s.status === "Needs Review" || s.status === "Pending").length > 0 && (
                <Card className="bg-white border-[#E2E8F0] shadow-sm rounded-2xl overflow-hidden">
                  <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50/40 border-b border-amber-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-ping" />
                      <div>
                        <h3 className="text-xs font-bold text-[#002D62] font-serif uppercase tracking-wider">
                          Submissions Awaiting Evaluation
                        </h3>
                        <p className="text-[11px] text-slate-600">
                          Student forensic lab turn-ins and case briefs ready for your scoring and feedback
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setActiveSection("students")}
                      className="bg-[#002D62] hover:bg-[#001F44] text-white text-xs h-7 px-3 rounded-lg font-medium cursor-pointer"
                    >
                      View All in Grading Desk &rarr;
                    </Button>
                  </div>
                  <div className="divide-y divide-[#E2E8F0]">
                    {submissionsList
                      .filter(s => s.status === "Needs Review" || s.status === "Pending")
                      .slice(0, 3)
                      .map((sub) => (
                        <div key={sub.id} className="p-3.5 hover:bg-[#F8FAFC] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="h-8 w-8 rounded-lg bg-[#002D62]/10 text-[#002D62] flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                              {sub.studentName?.charAt(0) || "S"}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[#1E293B] truncate">{sub.studentName}</span>
                                <Badge className="bg-slate-100 text-slate-700 text-[9.5px] font-mono">{sub.section}</Badge>
                                <Badge className="bg-amber-100 text-amber-800 text-[9.5px] font-mono">Needs Review</Badge>
                              </div>
                              <div className="text-[11px] text-slate-600 truncate mt-0.5">
                                <span className="font-semibold text-[#002D62]">{sub.unit}:</span> {sub.task}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 shrink-0">
                            <span className="text-[10px] text-slate-500 font-mono">{sub.submissionTime}</span>
                            <Button
                              size="sm"
                              onClick={() => {
                                setEvaluatingSubmission(sub);
                                setGradeInput(90);
                                setFacultyFeedback(sub.complianceNote || "Good application of forensic standards.");
                              }}
                              className="bg-[#C5A059] hover:bg-[#d4b068] text-[#001F44] font-bold text-xs h-7 px-3 rounded-lg shadow-2xs cursor-pointer"
                            >
                              Evaluate & Grade
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </Card>
              )}

              {/* Section Comparison & Outcomes Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Cohort Performance by Section */}
                <Card className="bg-white border-[#E2E8F0] shadow-sm rounded-2xl overflow-hidden flex flex-col">
                  <CardHeader className="p-5 border-b border-[#F0F0F0] bg-[#F8F9FA]">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm font-bold text-[#002D62] font-serif">
                          Cohort Performance by Section
                        </CardTitle>
                        <CardDescription className="text-[11px] text-[#666]">
                          Academic standing across enrolled Criminology classes
                        </CardDescription>
                      </div>
                      <Badge className="bg-[#002D62] text-white text-[10px] font-mono">2 Active Sections</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 space-y-4 flex-1">
                    {Object.keys(sectionsStats).length === 0 ? (
                      <div className="text-xs text-[#666]">No students to compute sections.</div>
                    ) : (
                      Object.keys(sectionsStats).map((secName) => {
                        const sec = sectionsStats[secName];
                        const secAvg = sec.totalStudents > 0 ? (sec.totalGradeSum / sec.totalStudents) : 0;
                        return (
                          <div key={secName} className="p-4 rounded-xl bg-white border border-[#EAEAEA] shadow-2xs space-y-2 hover:border-[#002D62]/40 transition-colors">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-[#002D62] font-serif">{secName}</span>
                              <span className="text-sm font-bold font-mono text-[#002D62]">
                                {secAvg.toFixed(1)}% Average
                              </span>
                            </div>
                            <Progress
                              value={secAvg}
                              className="h-2 bg-[#E2E8F0] [&>div]:bg-[#002D62]"
                            />
                            <div className="flex items-center justify-between text-[11px] text-[#666] font-mono font-medium">
                              <span>{sec.totalStudents} Enrolled Students</span>
                              <span className="text-[#002D62] font-bold">GPA Equiv: {secAvg >= 90 ? "1.50 Superior" : secAvg >= 85 ? "2.00 Very Good" : secAvg >= 80 ? "2.50 Good" : secAvg >= 75 ? "3.00 Passing" : "5.00 Failing"}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </CardContent>
                </Card>

                {/* Program Outcome Mastery Summary */}
                <Card className="bg-white border-[#E2E8F0] shadow-sm rounded-2xl overflow-hidden flex flex-col">
                  <CardHeader className="p-5 border-b border-[#F0F0F0] bg-[#F8F9FA]">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm font-bold text-[#002D62] font-serif">
                          Program Outcome (PO) Compliance
                        </CardTitle>
                        <CardDescription className="text-[11px] text-[#666]">
                          CHED CMO No. 5 s. 2018 BS Criminology Competency Matrix
                        </CardDescription>
                      </div>
                      <Badge className={`text-[10px] font-mono ${cohortMetrics.totalStudents > 0 ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                        {cohortMetrics.totalStudents > 0 ? `${cohortMetrics.totalStudents} Active Students` : "Awaiting Data"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 space-y-3 flex-1">
                    {COURSE_INFO.programOutcomes.map((po) => {
                      const dynamicMastery = cohortMetrics.totalStudents > 0 && Number(cohortMetrics.averageGrade) > 0
                        ? `${cohortMetrics.averageGrade}%`
                        : "Awaiting Grades";
                      return (
                        <div key={po.id} className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#EAEAEA] shadow-2xs text-xs group hover:border-[#002D62]/30 transition-all">
                          <div className="flex items-center gap-3">
                            <Badge className="bg-[#002D62] text-white font-mono text-[10px] px-2 py-0.5">{po.id}</Badge>
                            <span className="font-semibold text-[#1E293B] text-xs">{po.title}</span>
                          </div>
                          <span className="font-bold text-[#C5A059] font-mono text-xs bg-[#C5A059]/10 px-2.5 py-1 rounded-md">{dynamicMastery}</span>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>

              {/* Statutory & Forensic Standards Strip */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-[#002D62]/10 flex items-center justify-center text-[#002D62] shrink-0 font-serif font-bold text-xs">
                    §
                  </div>
                  <div>
                    <div className="font-bold text-xs text-[#002D62] font-serif">Republic Act 10175</div>
                    <div className="text-[10.5px] text-slate-500">Cybercrime Prevention Act of 2012 Offenses</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-[#C5A059]/15 flex items-center justify-center text-[#C5A059] shrink-0 font-serif font-bold text-xs">
                    ⚖
                  </div>
                  <div>
                    <div className="font-bold text-xs text-[#002D62] font-serif">A.M. No. 17-11-03-SC</div>
                    <div className="text-[10.5px] text-slate-500">Supreme Court Rule on Cybercrime Warrants</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0 font-serif font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <div className="font-bold text-xs text-[#002D62] font-serif">ISO/IEC 27037:2012</div>
                    <div className="text-[10.5px] text-slate-500">Digital Evidence Handling & Chain of Custody</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: STUDENT SUBMISSIONS & GRADING DESK */}
          {activeSection === "students" && (
            <div className="space-y-4">
              {liveSubmissionNotice && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="font-semibold">{liveSubmissionNotice}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setLiveSubmissionNotice(null)}
                    className="h-6 px-2 text-[11px] text-emerald-700 hover:bg-emerald-100"
                  >
                    Dismiss
                  </Button>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAEAEA] pb-3">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-lg font-bold text-[#002D62] font-serif flex items-center gap-2">
                        <Users className="h-5 w-5 text-[#C5A059]" />
                        User Management
                      </h2>
                    </div>
                    <p className="text-xs text-[#666] mt-0.5">
                      Manage enrolled users and view their progress across your dynamic lessons.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 text-xs border-[#E5E5E5] text-[#002D62] font-semibold hover:bg-[#F8F9FA] flex items-center gap-1.5"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Export CSV</span>
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setIsAddStudentOpen(true)}
                      className="h-8 px-3 text-xs bg-[#002D62] hover:bg-[#001F44] text-white rounded-lg font-semibold flex items-center gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Add User</span>
                    </Button>
                    {selectedUserIds.length > 0 && (
                      <Button
                        size="sm"
                        onClick={handleBulkDelete}
                        className="h-8 px-3 text-xs bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold flex items-center gap-1.5"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Delete Selected ({selectedUserIds.length})</span>
                      </Button>
                    )}

                    <select
                      value={selectedSectionFilter}
                      onChange={(e) => setSelectedSectionFilter(e.target.value)}
                      className="h-8 px-2.5 rounded-lg border border-[#E5E5E5] bg-white text-xs text-[#002D62] font-medium focus:outline-none"
                    >
                      <option value="All">All Sections</option>
                      <option value="Section Alpha">Section Alpha</option>
                      <option value="Section Bravo">Section Bravo</option>
                    </select>

                    <div className="relative w-44 sm:w-56">
                      <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#777]" />
                      <input
                        type="text"
                        value={submissionSearch}
                        onChange={(e) => setSubmissionSearch(e.target.value)}
                        placeholder="Search user name or ID..."
                        className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white border border-[#E5E5E5] text-xs text-[#1E293B] placeholder:text-[#888] focus:outline-none focus:border-[#002D62]"
                      />
                    </div>
                  </div>
                </div>

                <Card className="bg-white border-[#E5E5E5] shadow-sm rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#EAEAEA] bg-[#F8F9FA] text-[10px] text-[#002D62] font-bold uppercase tracking-wider">
                          <th className="py-3 px-4 w-10 text-center">
                            <input 
                              type="checkbox" 
                              className="rounded border-slate-300"
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedUserIds(cohortRoster.map(s => s.id));
                                } else {
                                  setSelectedUserIds([]);
                                }
                              }}
                              checked={selectedUserIds.length === cohortRoster.length && cohortRoster.length > 0}
                            />
                          </th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">UUID</th>
                          <th className="py-3 px-4">Full Name</th>
                          <th className="py-3 px-4">Email Address</th>
                          <th className="py-3 px-4">Role</th>
                          <th className="py-3 px-4">Program</th>
                          <th className="py-3 px-4">Year</th>
                          <th className="py-3 px-4">Section</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-[12px] text-[#333]">
                        {cohortRoster
                          .filter((s) => {
                            const safeSearch = (submissionSearch || "").toLowerCase();
                            const safeName = (s.name || "").toLowerCase();
                            const safeId = (s.id || "").toLowerCase();
                            const matchesSearch = safeName.includes(safeSearch) || safeId.includes(safeSearch);
                            const matchesSection = selectedSectionFilter === "All" || s.section === selectedSectionFilter;
                            return matchesSearch && matchesSection;
                          })
                          .map((student, idx) => {
                            const studentEmail = student.email || "No email on record";
                            return (
                              <tr key={student.id} className="border-b border-[#F0F0F0] hover:bg-[#F8F9FA] transition-colors">
                                <td className="py-3 px-4 text-center">
                                  <input 
                                    type="checkbox" 
                                    className="rounded border-slate-300"
                                    checked={selectedUserIds.includes(student.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedUserIds(prev => [...prev, student.id]);
                                      } else {
                                        setSelectedUserIds(prev => prev.filter(id => id !== student.id));
                                      }
                                    }}
                                  />
                                </td>
                                <td className="py-3 px-4">
                                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold tracking-wide">Active</span>
                                </td>
                                <td className="py-3 px-4 font-mono text-[10px] text-slate-400" title={student.uuid || student.id}>
                                  {(student.uuid || student.id)?.substring(0, 8)}...
                                </td>
                                <td className="py-3 px-4 font-serif font-bold text-[#1E293B]">
                                  <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full bg-[#E2E8F0] flex items-center justify-center text-[10px] font-bold text-[#002D62]">
                                      {student.name.charAt(0)}
                                    </div>
                                    <span className="whitespace-nowrap">{student.name}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-[11px] font-medium text-[#002D62]">{studentEmail}</td>
                                <td className="py-3 px-4 text-[11px] font-medium text-slate-600">Student</td>
                                <td className="py-3 px-4 text-[11px] text-slate-600 whitespace-nowrap">{student.program || "BS Criminology"}</td>
                                <td className="py-3 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">{student.yearLevel || "4th Year"}</td>
                                <td className="py-3 px-4 font-mono text-[11px] text-[#666] whitespace-nowrap">{student.section}</td>
                                <td className="py-3 px-4 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => setViewingStudent(student)}
                                      className="h-7 w-7 text-slate-500 hover:text-[#002D62] hover:bg-slate-100"
                                      title="Edit User"
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleResetPassword(studentEmail)}
                                      className="h-7 w-7 text-slate-500 hover:text-amber-600 hover:bg-amber-50"
                                      title="Send Password Reset"
                                    >
                                      <Key className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDeleteStudent(student.id)}
                                      className="h-7 w-7 text-slate-500 hover:text-red-600 hover:bg-red-50"
                                      title="Delete User"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                  <div className="border-t border-[#EAEAEA] bg-[#F8F9FA] px-4 py-3 flex items-center justify-between">
                    <div className="text-[11px] text-[#666] font-medium">
                      Showing 1 to {cohortRoster.length} of {cohortRoster.length} entries
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="sm" disabled className="h-7 px-2 text-[11px] border-[#EAEAEA]">Previous</Button>
                      <Button variant="outline" size="sm" className="h-7 w-7 text-[11px] border-[#002D62] bg-[#002D62] text-white">1</Button>
                      <Button variant="outline" size="sm" disabled className="h-7 px-2 text-[11px] border-[#EAEAEA]">Next</Button>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Add User Modal */}
              {isAddStudentOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                  <Card className="w-full max-w-md bg-white border-none shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                    <CardHeader className="bg-[#F8F9FA] border-b border-[#EAEAEA] p-4 flex flex-row items-center justify-between">
                      <div className="text-sm font-bold text-[#002D62] font-serif">Enlist New User</div>
                      <Button variant="ghost" size="icon" onClick={() => setIsAddStudentOpen(false)} className="h-6 w-6 text-slate-500 rounded-full hover:bg-slate-200">
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </CardHeader>
                    <CardContent className="p-5">
                      <form onSubmit={handleAddStudent} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-[#1E293B]">Full Name</label>
                          <input
                            required
                            type="text"
                            placeholder="Juan Dela Cruz"
                            className="w-full p-2 text-xs border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#002D62]"
                            value={newStudentData.name}
                            onChange={(e) => setNewStudentData({ ...newStudentData, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-[#1E293B]">User ID (Badge Number)</label>
                          <input
                            required
                            type="text"
                            placeholder="STU-2026-XXXX"
                            className="w-full p-2 text-xs border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#002D62]"
                            value={newStudentData.studentId}
                            onChange={(e) => setNewStudentData({ ...newStudentData, studentId: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-[#1E293B]">Cohort Section</label>
                          <select
                            className="w-full p-2 text-xs border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#002D62]"
                            value={newStudentData.section}
                            onChange={(e) => setNewStudentData({ ...newStudentData, section: e.target.value })}
                          >
                            <option value="Section Alpha">Section Alpha</option>
                            <option value="Section Bravo">Section Bravo</option>
                          </select>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#1E293B]">Email Address</label>
                            <input
                              type="email"
                              placeholder="juan@urios.edu.ph"
                              className="w-full p-2 text-xs border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#002D62]"
                              value={newStudentData.email}
                              onChange={(e) => setNewStudentData({ ...newStudentData, email: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#1E293B]">Password</label>
                            <input
                              type="password"
                              placeholder="Set initial password"
                              className="w-full p-2 text-xs border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#002D62]"
                              value={newStudentData.password}
                              onChange={(e) => setNewStudentData({ ...newStudentData, password: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#1E293B]">Role</label>
                            <select
                              className="w-full p-2 text-xs border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#002D62]"
                              value={newStudentData.role}
                              onChange={(e) => setNewStudentData({ ...newStudentData, role: e.target.value })}
                            >
                              <option value="student">Student</option>
                              <option value="instructor">Instructor</option>
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#1E293B]">Program</label>
                            <input
                              type="text"
                              className="w-full p-2 text-xs border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#002D62]"
                              value={newStudentData.program}
                              onChange={(e) => setNewStudentData({ ...newStudentData, program: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#1E293B]">Year Level</label>
                            <input
                              type="text"
                              className="w-full p-2 text-xs border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#002D62]"
                              value={newStudentData.yearLevel}
                              onChange={(e) => setNewStudentData({ ...newStudentData, yearLevel: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="pt-2">
                          <Button type="submit" className="w-full bg-[#002D62] hover:bg-[#001F44] text-white text-xs h-9 rounded-lg font-bold">
                            Enlist User
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* View Progress Modal */}
              {viewingStudent && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                  <Card className="w-full max-w-lg bg-white border-none shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="bg-[#002D62] text-white p-5 flex flex-row items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">
                          {viewingStudent.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-base font-bold font-serif">{viewingStudent.name}</div>
                          <div className="text-xs text-white/70 font-mono">
                            {viewingStudent.studentId} • {viewingStudent.section}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setViewingStudent(null)} className="h-8 w-8 text-white/70 rounded-full hover:bg-white/20 hover:text-white">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardContent className="p-6 space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-[#F8F9FA] border border-[#EAEAEA] rounded-xl flex flex-col items-center justify-center gap-1 text-center">
                          <div className="text-[10px] text-[#666] font-semibold tracking-wider font-mono">CLASS STANDING</div>
                          <div className="text-2xl font-bold text-[#002D62] font-mono">{Math.min(100, (viewingStudent.sum * 0.6) + (viewingStudent.cw * 0.4) + gradeCurveOffset).toFixed(1)}%</div>
                        </div>
                        <div className="p-3 bg-[#F8F9FA] border border-[#EAEAEA] rounded-xl flex flex-col items-center justify-center gap-1 text-center">
                          <div className="text-[10px] text-[#666] font-semibold tracking-wider font-mono">PROGRAM OUTCOMES</div>
                          <div className="text-2xl font-bold text-emerald-600 font-mono">Met</div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="text-xs font-bold text-[#1E293B] font-serif border-b border-[#EAEAEA] pb-1">Academic Breakdown</div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-[#555]">Summative Assessments (Exams)</span>
                            <span className="font-bold text-[#002D62]">{viewingStudent.sum.toFixed(1)}%</span>
                          </div>
                          <Progress value={viewingStudent.sum} className="h-1.5 bg-[#E2E8F0] [&>div]:bg-[#C5A059]" />
                        </div>
                        
                        <div className="space-y-2 pt-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-[#555]">Formative Assessments (Classwork)</span>
                            <span className="font-bold text-[#002D62]">{viewingStudent.cw.toFixed(1)}%</span>
                          </div>
                          <Progress value={viewingStudent.cw} className="h-1.5 bg-[#E2E8F0] [&>div]:bg-[#C5A059]" />
                        </div>
                      </div>

                      <div className="pt-2 flex justify-end gap-2 border-t border-[#EAEAEA] pt-4">
                        <Button
                          variant="outline"
                          className="h-8 text-xs text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 gap-1.5"
                          onClick={() => handleDeleteStudent(viewingStudent.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Remove User
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}



          {/* SECTION: EVIDENCE CHAIN OF CUSTODY (CoC) WORKBENCH */}
          {activeSection === "chain-of-custody" && (
            <div className="space-y-4">
              {/* Header & Main Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAEAEA] pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-[#002D62] font-serif flex items-center gap-2">
                      <FileText className="h-5 w-5 text-[#C5A059]" />
                      Evidence Chain of Custody (CoC) Workbench
                    </h2>
                    <Badge className="bg-[#002D62] text-white text-[9.5px] font-mono">
                      PNP-ACG FORM 04
                    </Badge>
                  </div>
                  <p className="text-xs text-[#666] mt-0.5">
                    Official evidence handling under <strong>ISO/IEC 27037:2012</strong> and the <strong>Supreme Court Rule on Cybercrime Warrants (A.M. No. 17-11-03-SC)</strong>.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleVerifyHashes}
                    className={`text-xs h-8 px-3 rounded-lg border font-semibold flex items-center gap-1.5 transition-all ${
                      hashVerified
                        ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                        : "border-[#CBD5E1] text-[#002D62] hover:bg-[#F1F5F9]"
                    }`}
                  >
                    <ShieldCheck className={`h-4 w-4 ${hashVerified ? "text-emerald-600" : "text-[#C5A059]"}`} />
                    <span>{hashVerified ? "Hashes Verified (Tamper-Free)" : "Verify Hashes"}</span>
                  </Button>

                  <Button
                    size="sm"
                    onClick={handlePrintCoc}
                    className="bg-[#002D62] hover:bg-[#001F44] text-white text-xs h-8 px-4 rounded-lg font-semibold shadow-xs flex items-center gap-1.5"
                  >
                    <Printer className="h-3.5 w-3.5 text-[#C5A059]" />
                    <span>Print Official CoC Form (PDF)</span>
                  </Button>
                </div>
              </div>

              {/* Template Selector Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white rounded-xl border border-[#E5E5E5] shadow-xs">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#002D62]">
                  <Sliders className="h-4 w-4 text-[#C5A059]" />
                  <span>Case Presets & Scenarios:</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {MOCK_COC_TEMPLATES.map((tpl) => (
                    <Button
                      key={tpl.id}
                      size="sm"
                      variant="outline"
                      onClick={() => handleSelectCocTemplate(tpl.id)}
                      className={`text-xs h-7 px-3 rounded-lg font-medium transition-all ${
                        selectedCocTemplateId === tpl.id
                          ? "bg-[#002D62] text-white border-[#002D62] shadow-xs font-semibold"
                          : "border-[#E5E5E5] text-[#555] hover:text-[#002D62] hover:bg-[#F8F9FA]"
                      }`}
                    >
                      {tpl.badgeLabel}
                    </Button>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSelectCocTemplate("custom")}
                    className={`text-xs h-7 px-3 rounded-lg font-medium transition-all ${
                      selectedCocTemplateId === "custom"
                        ? "bg-[#002D62] text-white border-[#002D62] shadow-xs font-semibold"
                        : "border-dashed border-[#CBD5E1] text-[#64748B] hover:text-[#002D62] hover:bg-[#F8F9FA]"
                    }`}
                  >
                    Custom Docket
                  </Button>
                </div>
              </div>

              {/* Case Metadata Grid */}
              <Card className="p-4 bg-white border-[#E5E5E5] shadow-xs rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#002D62] font-serif uppercase tracking-wider">
                      Legal Authority & Case Metadata
                    </span>
                    <Badge variant="outline" className="text-[9px] font-mono text-[#002D62] border-[#002D62]/30">
                      {cocCaseData.caseNumber}
                    </Badge>
                  </div>
                  <span className="text-[10.5px] text-[#777] font-mono">
                    RACU 13 Forensics Division
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10.5px] font-semibold text-[#666]">Case Control Number</label>
                    <input
                      type="text"
                      value={cocCaseData.caseNumber}
                      onChange={(e) => setCocCaseData({ ...cocCaseData, caseNumber: e.target.value })}
                      className="w-full p-2 rounded-lg border border-[#CBD5E1] text-xs font-mono font-bold text-[#002D62] focus:outline-none focus:border-[#002D62]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10.5px] font-semibold text-[#666]">Search Warrant / Subpoena No.</label>
                    <input
                      type="text"
                      value={cocCaseData.warrantNumber}
                      onChange={(e) => setCocCaseData({ ...cocCaseData, warrantNumber: e.target.value })}
                      className="w-full p-2 rounded-lg border border-[#CBD5E1] text-xs font-mono text-[#002D62] focus:outline-none focus:border-[#002D62]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10.5px] font-semibold text-[#666]">Seizing Officer / Student</label>
                    <input
                      type="text"
                      value={cocCaseData.investigatorName}
                      onChange={(e) => setCocCaseData({ ...cocCaseData, investigatorName: e.target.value })}
                      className="w-full p-2 rounded-lg border border-[#CBD5E1] text-xs font-semibold text-[#002D62] focus:outline-none focus:border-[#002D62]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10.5px] font-semibold text-[#666]">Badge / Student ID</label>
                    <input
                      type="text"
                      value={cocCaseData.badgeNumber}
                      onChange={(e) => setCocCaseData({ ...cocCaseData, badgeNumber: e.target.value })}
                      className="w-full p-2 rounded-lg border border-[#CBD5E1] text-xs font-mono text-[#002D62] focus:outline-none focus:border-[#002D62]"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10.5px] font-semibold text-[#666]">Statutory Offense Charged</label>
                    <input
                      type="text"
                      value={cocCaseData.offenseCharged}
                      onChange={(e) => setCocCaseData({ ...cocCaseData, offenseCharged: e.target.value })}
                      className="w-full p-2 rounded-lg border border-[#CBD5E1] text-xs font-medium text-[#1E293B] focus:outline-none focus:border-[#002D62]"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10.5px] font-semibold text-[#666]">Crime Scene Recovery Location</label>
                    <input
                      type="text"
                      value={cocCaseData.location}
                      onChange={(e) => setCocCaseData({ ...cocCaseData, location: e.target.value })}
                      className="w-full p-2 rounded-lg border border-[#CBD5E1] text-xs text-[#1E293B] focus:outline-none focus:border-[#002D62]"
                    />
                  </div>
                </div>
              </Card>

              {/* Evidence Inventory Table */}
              <Card className="bg-white border-[#E5E5E5] shadow-xs rounded-xl overflow-hidden">
                <div className="p-4 border-b border-[#EAEAEA] flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold text-[#002D62] font-serif">
                      Section I. Inventory of Digital & Physical Evidence Seized
                    </CardTitle>
                    <CardDescription className="text-xs text-[#666]">
                      Hardware specifications, evidence tags, and SHA-256 cryptographic bit-stream hashes
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setNewSpecimen({
                        itemNo: `ITEM-0${(cocCaseData.specimens?.length || 0) + 1}`,
                        description: "",
                        serialNumber: "",
                        evidenceBagTag: `EB-2026-09${(cocCaseData.specimens?.length || 0) + 1}`,
                        sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                        status: "Forensically Sealed with Anti-Static Tamper Tape"
                      });
                      setNewSpecimenModalOpen(true);
                    }}
                    className="h-7 text-xs bg-[#002D62] hover:bg-[#001F44] text-white rounded-lg flex items-center gap-1 font-semibold"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Specimen</span>
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#F8F9FA] text-[#666] font-semibold border-b border-[#EAEAEA]">
                      <tr>
                        <th className="p-3 w-14 text-center">Item #</th>
                        <th className="p-3">Description & Component</th>
                        <th className="p-3 w-36">Serial / Barcode</th>
                        <th className="p-3 w-28 text-center">Bag & Tag</th>
                        <th className="p-3">SHA-256 Hash Digest</th>
                        <th className="p-3 w-40">Forensic Status</th>
                        <th className="p-3 w-12 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAEAEA]">
                      {cocCaseData.specimens?.map((spec, idx) => (
                        <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors">
                          <td className="p-3 text-center font-bold text-[#002D62] font-mono">{spec.itemNo}</td>
                          <td className="p-3">
                            <div className="font-semibold text-[#1E293B]">{spec.description}</div>
                          </td>
                          <td className="p-3 font-mono text-[11px] text-[#475569]">{spec.serialNumber}</td>
                          <td className="p-3 text-center">
                            <Badge variant="outline" className="text-[10px] font-mono border-[#CBD5E1] text-[#002D62] font-bold">
                              {spec.evidenceBagTag}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1.5 font-mono text-[10.5px] text-[#334155] bg-[#F1F5F9] px-2 py-1 rounded-md border border-[#E2E8F0] break-all">
                              <ShieldCheck className={`h-3.5 w-3.5 shrink-0 ${hashVerified ? "text-emerald-600" : "text-slate-400"}`} />
                              <span className="truncate max-w-[220px]">{spec.sha256}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="text-[11px] text-[#555] block leading-tight">{spec.status}</span>
                          </td>
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteSpecimen(idx)}
                              title="Delete specimen"
                              className="p-1 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Successive Chain of Custody Timeline */}
              <Card className="p-4 bg-white border-[#E5E5E5] shadow-xs rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-2">
                  <div>
                    <CardTitle className="text-sm font-bold text-[#002D62] font-serif">
                      Section II. Successive Chain of Custody Log
                    </CardTitle>
                    <CardDescription className="text-xs text-[#666]">
                      Chronological handover timeline from crime scene seizure to courtroom presentation
                    </CardDescription>
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9.5px] font-mono">
                    Chain Unbroken
                  </Badge>
                </div>

                <div className="space-y-2.5">
                  {cocCaseData.custodyLog?.map((log, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#F8F9FA] border border-[#EAEAEA] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-7 w-7 rounded-lg bg-[#002D62] text-white flex items-center justify-center font-mono font-bold text-xs shrink-0">
                          {idx + 1}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10.5px] font-bold text-[#002D62]">{log.time}</span>
                            <span className="text-slate-400">•</span>
                            <span className="text-[11px] text-[#666] font-medium">{log.purpose}</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                            <div>
                              <span className="text-[#888] text-[10px] block">RELEASED BY:</span>
                              <div
                                className="font-semibold text-[#1E293B]"
                                dangerouslySetInnerHTML={{ __html: log.releasedBy }}
                              />
                            </div>
                            <div>
                              <span className="text-[#888] text-[10px] block">RECEIVED BY:</span>
                              <div
                                className="font-semibold text-[#1E293B]"
                                dangerouslySetInnerHTML={{ __html: log.receivedBy }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 text-right md:max-w-xs">
                        <span className="text-[9.5px] font-mono text-[#888] block">CONTAINER & SEAL STATUS:</span>
                        <span className="text-[10.5px] text-emerald-700 font-medium">{log.condition}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Compliance & Standards Bar */}
              <div className="p-3.5 rounded-xl bg-[#002D62]/5 border border-[#002D62]/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#002D62]">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-[#C5A059] shrink-0" />
                  <span className="font-medium text-[11.5px]">
                    Standard Chain of Custody meets <strong>Rule on Cybercrime Warrants (A.M. No. 17-11-03-SC)</strong> evidentiary threshold for judicial inquest.
                  </span>
                </div>
                <Button
                  size="sm"
                  onClick={handlePrintCoc}
                  className="h-7 text-xs bg-[#002D62] hover:bg-[#001F44] text-white font-semibold rounded-lg px-3 shrink-0"
                >
                  Generate Official CoC PDF
                </Button>
              </div>
            </div>
          )}

          {/* SECTION 1.5: BATCH GRADEBOOK & GRADE CURVE ENGINE */}
          {activeSection === "grade-curve" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAEAEA] pb-3">
                <div>
                  <h2 className="text-lg font-bold text-[#002D62] font-serif flex items-center gap-2">
                    <Sliders className="h-5 w-5 text-[#C5A059]" />
                    Section Batch Gradebook & Grade Curve Engine
                  </h2>
                  <p className="text-xs text-[#666]">
                    Apply section-wide OBE grade curves, inspect standing distribution, and export official grade rosters.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => handlePrintChedForm9("All")}
                    className="bg-[#002D62] hover:bg-[#001F44] text-white text-xs h-8 px-3 rounded-lg shadow-xs font-semibold flex items-center gap-1.5"
                  >
                    <Printer className="h-3.5 w-3.5 text-[#C5A059]" />
                    <span>CHED Form 9 (PDF)</span>
                  </Button>

                  <Button
                    size="sm"
                    onClick={handlePrintDeansTransmittal}
                    variant="outline"
                    className="border-[#CBD5E1] text-[#002D62] hover:bg-[#F8F9FA] text-xs h-8 px-3 rounded-lg font-semibold flex items-center gap-1.5"
                  >
                    <FileText className="h-3.5 w-3.5 text-[#002D62]" />
                    <span>Dean&apos;s Transmittal</span>
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => setActiveSection("ched-transmittal")}
                    variant="ghost"
                    className="text-xs h-8 px-2.5 text-[#002D62] hover:bg-[#002D62]/10 font-medium"
                  >
                    <span>Transmittal Console &rarr;</span>
                  </Button>
                </div>
              </div>

              {/* Curve Adjuster Control Box */}
              <Card className="p-4 bg-white border-[#E5E5E5] rounded-xl space-y-3 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-[#002D62] font-serif">
                      Dynamic Section Curve Offset: {gradeCurveOffset > 0 ? `+${gradeCurveOffset}%` : "0% (Raw Syllabus Weights)"}
                    </span>
                    <p className="text-[11px] text-[#777]">
                      Adjusts raw classwork and summative marks uniformly across all enrolled students.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {[0, 2, 3, 5].map((offset) => (
                      <Button
                        key={offset}
                        size="sm"
                        variant={gradeCurveOffset === offset ? "default" : "outline"}
                        onClick={() => setGradeCurveOffset(offset)}
                        className={`text-xs h-7 px-3 rounded-lg font-mono ${
                          gradeCurveOffset === offset
                            ? "bg-[#002D62] text-white font-bold"
                            : "border-[#E5E5E5] text-[#555]"
                        }`}
                      >
                        {offset === 0 ? "Raw (0%)" : `+${offset}% Curve`}
                      </Button>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Student Cohort Grade Matrix Table */}
              <Card className="bg-white border-[#E5E5E5] rounded-xl overflow-hidden shadow-xs">
                <div className="p-3 bg-[#002D62] text-white flex items-center justify-between">
                  <span className="text-xs font-bold font-serif">Enrolled Student OBE Grade Roster</span>
                  <Badge className="bg-[#C5A059] text-[#001F44] font-mono text-[10px] font-bold">
                    Section VIII 60% Summative + 40% Classwork
                  </Badge>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#E5E5E5] bg-[#F8F9FA] text-[#002D62] font-mono text-[11px]">
                        <th className="p-3">Student ID</th>
                        <th className="p-3">Full Name</th>
                        <th className="p-3">Section</th>
                        <th className="p-3 text-center">Summative (60%)</th>
                        <th className="p-3 text-center">Classwork (40%)</th>
                        <th className="p-3 text-center">Computed Final</th>
                        <th className="p-3 text-center">GPA Equiv</th>
                        <th className="p-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFEFEF]">
                      {cohortRoster.map((student) => {
                        const finalSum = Math.min(100, student.sum + gradeCurveOffset);
                        const finalCw = Math.min(100, student.cw + gradeCurveOffset);
                        const finalGrade = (finalSum * 0.60 + finalCw * 0.40).toFixed(2);
                        const gpa = finalGrade >= 94 ? "1.25" : finalGrade >= 90 ? "1.50" : finalGrade >= 85 ? "1.75" : "2.00";

                        return (
                          <tr key={student.id} className="hover:bg-[#F8F9FA]/60 transition-colors">
                            <td className="p-3 font-mono text-[#002D62] font-semibold">{student.id}</td>
                            <td className="p-3 font-serif font-bold text-[#1E293B]">{student.name}</td>
                            <td className="p-3 font-mono text-[11px] text-[#555]">{student.section}</td>
                            <td className="p-3 text-center font-mono text-[#555]">{finalSum}%</td>
                            <td className="p-3 text-center font-mono text-[#555]">{finalCw}%</td>
                            <td className="p-3 text-center font-mono font-bold text-[#002D62]">{finalGrade}%</td>
                            <td className="p-3 text-center font-mono font-bold text-[#C5A059]">{gpa}</td>
                            <td className="p-3 text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingStudentGrades(student);
                                  setEditGradesForm({
                                    prelims: student.grades?.prelims || 0,
                                    midterms: student.grades?.midterms || 0,
                                    semiFinals: student.grades?.semiFinals || 0,
                                    finals: student.grades?.finals || 0,
                                  });
                                }}
                                className="text-[10px] h-6 px-2 border-[#CBD5E1] text-[#002D62] hover:bg-[#F1F5F9]"
                              >
                                Edit Exams
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* SECTION 1.7: OFFICIAL CHED OBE FORM 9 & DEAN'S TRANSMITTAL CONSOLE */}
          {activeSection === "ched-transmittal" && (
            <div className="space-y-4">
              {/* Header Banner & Quick Export Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAEAEA] pb-3">
                <div>
                  <h2 className="text-lg font-bold text-[#002D62] font-serif flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-[#C5A059]" />
                    CHED OBE Form 9 & Dean&apos;s Transmittal Exporter
                  </h2>
                  <p className="text-xs text-[#666]">
                    Higher education promotional reports, CMO No. 5 (s. 2018) rating sheets, and official Dean&apos;s transmittal memoranda for the University Registrar & VPAA.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => handlePrintChedForm9(chedSectionFilter)}
                    className="bg-[#002D62] hover:bg-[#001F44] text-white text-xs h-8 px-3 rounded-lg shadow-xs font-semibold flex items-center gap-1.5"
                  >
                    <Printer className="h-3.5 w-3.5 text-[#C5A059]" />
                    <span>Print CHED Form 9 (PDF)</span>
                  </Button>

                  <Button
                    size="sm"
                    onClick={handlePrintDeansTransmittal}
                    className="bg-[#C5A059] hover:bg-[#b58f48] text-[#001F44] text-xs h-8 px-3 rounded-lg shadow-xs font-bold flex items-center gap-1.5"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>Print Dean&apos;s Memo (PDF)</span>
                  </Button>
                </div>
              </div>

              {/* Control Toolbar: Section Filter, Active Curve & Search */}
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-3 bg-white rounded-xl border border-[#E5E5E5] shadow-xs">
                {/* Section Filter Pills */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#002D62] whitespace-nowrap">Filter Class:</span>
                  <div className="flex items-center gap-1">
                    {["All", "Section Alpha", "Section Bravo"].map((sec) => (
                      <Button
                        key={sec}
                        size="sm"
                        variant={chedSectionFilter === sec ? "default" : "outline"}
                        onClick={() => setChedSectionFilter(sec)}
                        className={`text-xs h-7 px-3 rounded-lg font-medium transition-all ${
                          chedSectionFilter === sec
                            ? "bg-[#002D62] text-white font-semibold shadow-xs"
                            : "border-[#E5E5E5] text-[#555] hover:text-[#002D62] hover:bg-[#F8F9FA]"
                        }`}
                      >
                        {sec === "All" ? "Combined Cohort" : sec}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Live Curve Quick Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-[#666] whitespace-nowrap">Active Curve:</span>
                  <div className="flex items-center gap-1">
                    {[0, 2, 3, 5].map((offset) => (
                      <Button
                        key={offset}
                        size="sm"
                        variant={gradeCurveOffset === offset ? "default" : "ghost"}
                        onClick={() => setGradeCurveOffset(offset)}
                        className={`text-[11px] h-6 px-2 rounded-md font-mono ${
                          gradeCurveOffset === offset
                            ? "bg-[#C5A059] text-[#001F44] font-bold"
                            : "text-[#666] hover:bg-[#F8F9FA]"
                        }`}
                      >
                        {offset === 0 ? "Raw" : `+${offset}%`}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Student Search */}
                <div className="relative min-w-[200px]">
                  <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={chedSearchQuery}
                    onChange={(e) => setChedSearchQuery(e.target.value)}
                    placeholder="Search student or ID..."
                    className="w-full pl-8 pr-3 py-1 text-xs border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#002D62] font-sans"
                  />
                </div>
              </div>

              {/* View Mode Tabs */}
              <div className="flex items-center border-b border-[#E2E8F0] gap-2 pt-1">
                {[
                  { id: "form9", label: "CHED Form 9 Master Grading Sheet", icon: FileSpreadsheet },
                  { id: "transmittal", label: "Dean's Transmittal Memorandum", icon: FileText },
                  { id: "distribution", label: "CHED CMO 5 Statistics & Scale", icon: BarChart3 }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = chedActiveTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setChedActiveTab(tab.id)}
                      className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all ${
                        isActive
                          ? "border-[#002D62] text-[#002D62]"
                          : "border-transparent text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? "text-[#C5A059]" : "text-slate-400"}`} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* TAB 1: CHED FORM 9 MASTER ROSTER PREVIEW */}
              {chedActiveTab === "form9" && (
                <div className="space-y-3">
                  <Card className="bg-white border-[#CBD5E1] shadow-xs rounded-xl overflow-hidden p-5 space-y-4">
                    {/* Official Document Banner Header */}
                    <div className="text-center border-b border-[#CBD5E1] pb-3 space-y-0.5">
                      <div className="text-[10px] tracking-widest text-[#555] uppercase font-mono">
                        Republic of the Philippines • Office of the President
                      </div>
                      <div className="text-[11px] font-bold tracking-wide text-[#001F44] uppercase">
                        Commission on Higher Education (CHED) • Regional Office XIII (Caraga)
                      </div>
                      <div className="text-sm font-bold text-[#002D62] font-serif uppercase tracking-wider">
                        FATHER SATURNINO URIOS UNIVERSITY • BUTUAN CITY
                      </div>
                      <div className="text-[10.5px] text-[#444] font-medium">
                        Criminal Justice Education Program • Bachelor of Science in Criminology (BSCRIM)
                      </div>
                      <div className="inline-block mt-1 px-3 py-1 bg-[#001F44] text-[#C5A059] text-[11px] font-bold tracking-wider rounded font-serif">
                        CHED FORM 9: OFFICIAL REPORT OF RATINGS & OUTCOME-BASED EVALUATION (OBE)
                      </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs font-sans">
                      <div>
                        <span className="text-[10px] text-slate-500 block">COURSE:</span>
                        <strong className="text-[#002D62]">{COURSE_INFO.code} - {COURSE_INFO.title}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">ACADEMIC TERM:</span>
                        <strong className="text-[#002D62]">1st Semester, AY 2026-2027</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">CLASS / SECTION:</span>
                        <strong className="text-[#002D62]">
                          {chedSectionFilter === "All" ? "Section Alpha & Section Bravo" : chedSectionFilter}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">APPLIED CURVE:</span>
                        <strong className="text-[#b45309] font-mono">
                          {gradeCurveOffset > 0 ? `+${gradeCurveOffset}.0% Section VIII Curve` : "Raw (0% Offset)"}
                        </strong>
                      </div>
                    </div>

                    {/* Roster Table */}
                    <div className="overflow-x-auto border border-[#E2E8F0] rounded-lg">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="bg-[#002D62] text-white font-mono text-[10.5px]">
                            <th className="p-2.5 text-center w-10">No.</th>
                            <th className="p-2.5">Student ID</th>
                            <th className="p-2.5">Student Candidate</th>
                            <th className="p-2.5 text-center">Sex</th>
                            <th className="p-2.5">Section</th>
                            <th className="p-2.5 text-center">Summative (60%)</th>
                            <th className="p-2.5 text-center">Classwork (40%)</th>
                            <th className="p-2.5 text-center">Final Rating</th>
                            <th className="p-2.5 text-center">CHED GPE</th>
                            <th className="p-2.5 text-center">Remarks</th>
                            <th className="p-2.5">OBE Attainment</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8F0]">
                          {cohortRoster
                            .filter((c) => {
                              const matchesSec = chedSectionFilter === "All" || c.section === chedSectionFilter;
                              const matchesQ =
                                !chedSearchQuery ||
                                c.name.toLowerCase().includes(chedSearchQuery.toLowerCase()) ||
                                c.id.toLowerCase().includes(chedSearchQuery.toLowerCase());
                              return matchesSec && matchesQ;
                            })
                            .map((student, idx) => {
                              const sumScore = Math.min(100, (student.sum ?? 88) + gradeCurveOffset);
                              const cwScore = Math.min(100, (student.cw ?? 90) + gradeCurveOffset);
                              const finalNumeric = Number((sumScore * 0.60 + cwScore * 0.40).toFixed(2));
                              
                              let gpe = "2.00";
                              if (finalNumeric >= 97.5) gpe = "1.00";
                              else if (finalNumeric >= 94.5) gpe = "1.25";
                              else if (finalNumeric >= 91.5) gpe = "1.50";
                              else if (finalNumeric >= 88.5) gpe = "1.75";
                              else if (finalNumeric >= 85.5) gpe = "2.00";
                              else if (finalNumeric >= 82.5) gpe = "2.25";
                              else if (finalNumeric >= 79.5) gpe = "2.50";
                              else if (finalNumeric >= 76.5) gpe = "2.75";
                              else if (finalNumeric >= 74.5) gpe = "3.00";
                              else gpe = "5.00";

                              return (
                                <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                                  <td className="p-2 text-center font-mono text-slate-500">{idx + 1}</td>
                                  <td className="p-2 font-mono font-bold text-[#002D62]">{student.id}</td>
                                  <td className="p-2 font-serif font-bold text-[#1E293B]">{student.name}</td>
                                  <td className="p-2 text-center font-mono text-slate-600">{student.gender || (idx % 2 === 0 ? "M" : "F")}</td>
                                  <td className="p-2 font-mono text-[11px] text-slate-600">{student.section}</td>
                                  <td className="p-2 text-center font-mono text-slate-700">{sumScore}%</td>
                                  <td className="p-2 text-center font-mono text-slate-700">{cwScore}%</td>
                                  <td className="p-2 text-center font-mono font-bold text-[#002D62]">{finalNumeric}%</td>
                                  <td className="p-2 text-center font-mono font-bold text-[#b45309]">{gpe}</td>
                                  <td className="p-2 text-center">
                                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                      PASSED
                                    </span>
                                  </td>
                                  <td className="p-2 text-[10.5px] text-slate-600 font-mono">
                                    POb, POc, POd, POe
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>

                    {/* Official Signatures Bar */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-[#E2E8F0] text-center text-xs">
                      <div className="space-y-1">
                        <div className="border-b border-black pb-1 font-bold text-[#002D62] uppercase">
                          {facultyProfile.name}
                        </div>
                        <div className="text-[10px] text-slate-500">Course Lead Faculty</div>
                      </div>
                      <div className="space-y-1">
                        <div className="border-b border-black pb-1 font-bold text-[#002D62] uppercase">
                          Prof. Ann Margarette M. Diez
                        </div>
                        <div className="text-[10px] text-slate-500">Program Coordinator, CJEP</div>
                      </div>
                      <div className="space-y-1">
                        <div className="border-b border-black pb-1 font-bold text-[#002D62] uppercase">
                          {facultyProfile.name}
                        </div>
                        <div className="text-[10px] text-slate-500">Dean, Criminal Justice Education</div>
                      </div>
                      <div className="space-y-1">
                        <div className="border-b border-black pb-1 font-bold text-[#002D62] uppercase">
                          Dr. Arlyn M. Floreta
                        </div>
                        <div className="text-[10px] text-slate-500">VP for Academic Affairs / Registrar</div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* TAB 2: DEAN'S TRANSMITTAL MEMORANDUM PREVIEW */}
              {chedActiveTab === "transmittal" && (
                <div className="space-y-3">
                  <Card className="bg-white border-[#CBD5E1] shadow-xs rounded-xl p-6 space-y-5">
                    {/* Letterhead */}
                    <div className="text-center border-b-2 border-[#001F44] pb-4 space-y-0.5">
                      <div className="text-base font-bold text-[#001F44] uppercase tracking-wide font-serif">
                        FATHER SATURNINO URIOS UNIVERSITY
                      </div>
                      <div className="text-xs font-bold text-[#C5A059] uppercase tracking-wider font-serif">
                        COLLEGE OF CRIMINAL JUSTICE EDUCATION • OFFICE OF THE DEAN
                      </div>
                      <div className="text-[10px] text-slate-500">
                        J.C. Aquino Avenue corner San Mateo Street, Butuan City, 8600 Agusan del Norte, Philippines
                      </div>
                    </div>

                    {/* Memorandum Box */}
                    <div className="p-4 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg space-y-2 text-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#002D62] uppercase text-[11px]">MEMO CONTROL NO.:</span>
                          <input
                            type="text"
                            value={transmittalMemoNo}
                            onChange={(e) => setTransmittalMemoNo(e.target.value)}
                            className="font-mono text-xs font-bold text-[#002D62] bg-white border border-[#CBD5E1] rounded px-2 py-0.5"
                          />
                        </div>
                        <span className="text-slate-500 font-mono text-[11px]">
                          DATE: {new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-500 font-bold block text-[10px]">TO:</span>
                          <span className="font-semibold text-slate-800">
                            THE UNIVERSITY REGISTRAR<br/>DR. ARLYN M. FLORETA, VP for Academic Affairs
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-bold block text-[10px]">FROM:</span>
                          <span className="font-semibold text-slate-800">
                            {facultyProfile.name.toUpperCase()}<br/>Dean, College of Criminal Justice Education
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#E2E8F0]">
                        <span className="text-slate-500 font-bold block text-[10px]">SUBJECT:</span>
                        <strong className="text-[#002D62] text-[11px]">
                          OFFICIAL TRANSMITTAL OF FINAL RATINGS & CHED OBE FORM 9 FOR {COURSE_INFO.code} ({COURSE_INFO.title.toUpperCase()}) — 1ST SEMESTER AY 2026-2027
                        </strong>
                      </div>
                    </div>

                    {/* Memorandum Narrative */}
                    <div className="text-xs text-slate-700 leading-relaxed space-y-3 font-serif">
                      <p>
                        I have the honor to officially transmit herewith the approved <strong>Commission on Higher Education (CHED) Form 9 Promotional Report</strong> and master Outcome-Based Education (OBE) rating sheets for <strong>{COURSE_INFO.code}: {COURSE_INFO.title}</strong>, administered during the 1st Semester, Academic Year 2026-2027.
                      </p>
                      <p>
                        The academic and laboratory performance of the enrolled students has been thoroughly evaluated under the institutional provisions of Section VIII of the approved Course Syllabus, adhering to <strong>CHED Memorandum Order (CMO) No. 5, Series of 2018</strong> for the Bachelor of Science in Criminology program. The final numerical ratings reflect a strict computation of sixty percent (60%) Summative Assessments and forty percent (40%) Continuous Classwork, including ISO/IEC 27037:2012 digital forensics laboratory practicums, RFC 3227 hardware order of volatility triage, and Supreme Court cybercrime warrant (A.M. No. 17-11-03-SC) jurisprudence defense briefs.
                      </p>
                    </div>

                    {/* Section Summary Matrix */}
                    <div className="border border-[#CBD5E1] rounded-lg overflow-hidden">
                      <div className="p-2 bg-[#002D62] text-white text-xs font-bold font-serif">
                        Enrolled Cohort Section Performance Summary
                      </div>
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-100 font-mono text-[10.5px] border-b border-[#E2E8F0]">
                            <th className="p-2">Section</th>
                            <th className="p-2">Program & Year</th>
                            <th className="p-2 text-center">Enrolled</th>
                            <th className="p-2 text-center">Passed</th>
                            <th className="p-2 text-center">Passing %</th>
                            <th className="p-2 text-center">Cohort Mean</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8F0]">
                          <tr>
                            <td className="p-2 font-semibold text-[#002D62]">Section Alpha</td>
                            <td className="p-2 text-slate-600">BS Criminology (4th Year)</td>
                            <td className="p-2 text-center font-mono">4</td>
                            <td className="p-2 text-center font-mono text-emerald-700 font-bold">4</td>
                            <td className="p-2 text-center font-mono font-bold text-emerald-700">100.0%</td>
                            <td className="p-2 text-center font-mono font-bold text-[#002D62]">91.4%</td>
                          </tr>
                          <tr>
                            <td className="p-2 font-semibold text-[#002D62]">Section Bravo</td>
                            <td className="p-2 text-slate-600">BS Criminology (4th Year)</td>
                            <td className="p-2 text-center font-mono">4</td>
                            <td className="p-2 text-center font-mono text-emerald-700 font-bold">4</td>
                            <td className="p-2 text-center font-mono font-bold text-emerald-700">100.0%</td>
                            <td className="p-2 text-center font-mono font-bold text-[#002D62]">89.8%</td>
                          </tr>
                          <tr className="bg-[#EEF2FF] font-bold">
                            <td className="p-2 text-[#002D62]">TOTAL / CONSOLIDATED</td>
                            <td className="p-2 text-slate-700">BSCRIM (All Sections)</td>
                            <td className="p-2 text-center font-mono">{cohortRoster.length}</td>
                            <td className="p-2 text-center font-mono text-emerald-700">{cohortRoster.length}</td>
                            <td className="p-2 text-center font-mono text-emerald-700">100.0%</td>
                            <td className="p-2 text-center font-mono text-[#002D62]">{computedMetrics.averageGrade}%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Enclosures & Archival Block */}
                    <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-lg text-xs space-y-1">
                      <strong className="text-[#002D62] text-[11px] block">TRANSMITTED ENCLOSURES:</strong>
                      <div className="text-[11px] text-slate-700 space-y-0.5">
                        <div>1. Duly accomplished CHED Form 9 Master Roster of Ratings (Original Copy).</div>
                        <div>2. Section VIII Outcome-Based Attainment Summary (POb, POc, POd, POe).</div>
                        <div>3. PNP-ACG Form 04 Digital Evidence Chain of Custody Practicum Logs.</div>
                        <div>4. Supreme Court Cyber Moot Court Defense Docket Ratings.</div>
                      </div>
                    </div>

                    {/* Signatures & Stamp */}
                    <div className="flex flex-col sm:flex-row items-end justify-between gap-4 pt-4 border-t border-[#E2E8F0]">
                      <div className="space-y-1">
                        <div className="font-serif font-bold text-[#002D62] text-xs">
                          {facultyProfile.name.toUpperCase()}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Dean, College of Criminal Justice Education • Lead Faculty
                        </div>
                      </div>

                      <div className="p-3 border border-dashed border-slate-400 rounded-lg text-center font-mono text-[10px] text-slate-600 bg-slate-50">
                        <div className="font-bold text-[#002D62]">OFFICE OF THE UNIVERSITY REGISTRAR</div>
                        <div>Control: REG-2026-FSUU-0409</div>
                        <div>Archival & Accreditation Verified</div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* TAB 3: CHED CMO 5 STATISTICS & GRADE SCALE */}
              {chedActiveTab === "distribution" && (
                <div className="space-y-4">
                  {/* KPI Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Card className="p-3.5 bg-white border-[#E5E5E5] shadow-xs rounded-xl">
                      <span className="text-[10.5px] text-slate-500 block font-mono">Enrolled Candidates</span>
                      <div className="text-xl font-bold text-[#002D62] font-mono">{cohortRoster.length} Students</div>
                      <span className="text-[10px] text-emerald-700 font-mono">100% Retained</span>
                    </Card>

                    <Card className="p-3.5 bg-white border-[#E5E5E5] shadow-xs rounded-xl">
                      <span className="text-[10.5px] text-slate-500 block font-mono">OBE Passing Rate</span>
                      <div className="text-xl font-bold text-emerald-700 font-mono">100.0%</div>
                      <span className="text-[10px] text-slate-500 font-mono">&ge; 75.0% Rating</span>
                    </Card>

                    <Card className="p-3.5 bg-white border-[#E5E5E5] shadow-xs rounded-xl">
                      <span className="text-[10.5px] text-slate-500 block font-mono">Cohort Final Mean</span>
                      <div className="text-xl font-bold text-[#002D62] font-mono">{computedMetrics.averageGrade}%</div>
                      <span className="text-[10px] text-amber-700 font-mono">Curved: +{gradeCurveOffset}%</span>
                    </Card>

                    <Card className="p-3.5 bg-white border-[#E5E5E5] shadow-xs rounded-xl">
                      <span className="text-[10.5px] text-slate-500 block font-mono">Average Rating GPE</span>
                      <div className="text-xl font-bold text-[#b45309] font-mono">1.50</div>
                      <span className="text-[10px] text-slate-500 font-mono">Very Good (CHED)</span>
                    </Card>
                  </div>

                  {/* Philippine Higher Education Grading Scale Breakdown */}
                  <Card className="p-4 bg-white border-[#E5E5E5] shadow-xs rounded-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-2">
                      <div>
                        <CardTitle className="text-sm font-bold text-[#002D62] font-serif">
                          CHED CMO No. 5 (Series of 2018) Grading Equivalence Matrix
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-500">
                          Official conversion scale applied to computed numerical ratings in Section VIII
                        </CardDescription>
                      </div>
                      <Badge className="bg-[#002D62] text-[#C5A059] font-mono text-[10px]">
                        Institutional Standard
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                      {[
                        { gpe: "1.00", range: "98 - 100%", desc: "Excellent", count: cohortRoster.filter(c => (c.sum + gradeCurveOffset)*0.6 + (c.cw + gradeCurveOffset)*0.4 >= 97.5).length },
                        { gpe: "1.25", range: "95 - 97%", desc: "Superior", count: cohortRoster.filter(c => { const g = (c.sum + gradeCurveOffset)*0.6 + (c.cw + gradeCurveOffset)*0.4; return g >= 94.5 && g < 97.5; }).length },
                        { gpe: "1.50", range: "92 - 94%", desc: "Very Good", count: cohortRoster.filter(c => { const g = (c.sum + gradeCurveOffset)*0.6 + (c.cw + gradeCurveOffset)*0.4; return g >= 91.5 && g < 94.5; }).length },
                        { gpe: "1.75", range: "89 - 91%", desc: "Good", count: cohortRoster.filter(c => { const g = (c.sum + gradeCurveOffset)*0.6 + (c.cw + gradeCurveOffset)*0.4; return g >= 88.5 && g < 91.5; }).length },
                        { gpe: "2.00", range: "86 - 88%", desc: "Satisfactory", count: cohortRoster.filter(c => { const g = (c.sum + gradeCurveOffset)*0.6 + (c.cw + gradeCurveOffset)*0.4; return g >= 85.5 && g < 88.5; }).length },
                        { gpe: "2.25", range: "83 - 85%", desc: "Fairly Satisfactory", count: 0 },
                        { gpe: "2.50", range: "80 - 82%", desc: "Fair", count: 0 },
                        { gpe: "2.75", range: "77 - 79%", desc: "Passing", count: 0 },
                        { gpe: "3.00", range: "75 - 76%", desc: "Conditional Passing", count: 0 },
                        { gpe: "5.00", range: "< 75%", desc: "Failed", count: 0 },
                      ].map((item) => (
                        <div key={item.gpe} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-sm text-[#002D62]">{item.gpe}</span>
                            <Badge variant="outline" className="text-[9.5px] font-mono bg-white">
                              {item.count} Students
                            </Badge>
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">{item.range}</div>
                          <div className="text-[10.5px] font-medium text-slate-700">{item.desc}</div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}
            </div>
          )}


          {/* SECTION: FORENSIC CASE MISSIONS & CTF BUILDER */}
          {activeSection === "case-missions" && (
            <CaseMissionsManager />
          )}

          {/* SECTION: VIDEO COURSES CMS (PHASE 8/9) */}
          {activeSection === "courses-cms" && (
            <VideoCoursesCMS />
          )}

          {/* SECTION 3: DYNAMIC SYLLABUS & UNIT EDITOR (PHASE 5) */}
          {activeSection === "curriculum-mgmt" && (
            <div className="space-y-4">
              {/* Live Toast Notice */}
              {curriculumNotice && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{curriculumNotice}</span>
                  </div>
                  <button onClick={() => setCurriculumNotice(null)} className="text-emerald-600 hover:text-emerald-900">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {/* Header Banner & Management Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAEAEA] pb-3">
                <div>
                  <h2 className="text-lg font-bold text-[#002D62] font-serif flex items-center gap-2">
                    <Layers className="h-5 w-5 text-[#C5A059]" />
                    Dynamic Syllabus & Unit Editor
                  </h2>
                  <p className="text-xs text-[#666]">
                    In-portal curriculum engineering: modify unit objectives, 5Es learning topics, lab configurations, and CHED PO mappings on the fly.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => setIsAddUnitModalOpen(true)}
                    className="bg-[#002D62] hover:bg-[#001F44] text-white text-xs h-8 px-3 rounded-lg shadow-xs font-semibold flex items-center gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5 text-[#C5A059]" />
                    <span>Add New Unit</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleResetSyllabus}
                    className="border-[#CBD5E1] text-[#555] hover:text-[#002D62] hover:bg-[#F8F9FA] text-xs h-8 px-3 rounded-lg font-semibold flex items-center gap-1.5"
                  >
                    <RotateCcw className="h-3.5 w-3.5 text-[#C5A059]" />
                    <span>Reset to Baseline</span>
                  </Button>
                </div>
              </div>

              {/* Control Toolbar: Period Filter & Search */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-white rounded-xl border border-[#E5E5E5] shadow-xs">
                {/* Period Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  <span className="text-xs font-semibold text-[#002D62] mr-1 whitespace-nowrap">Period:</span>
                  {["All", "Prelims", "Midterms", "Semi-Finals", "Finals"].map((p) => (
                    <Button
                      key={p}
                      size="sm"
                      variant={curriculumPeriodFilter === p ? "default" : "outline"}
                      onClick={() => setCurriculumPeriodFilter(p)}
                      className={`text-xs h-7 px-3 rounded-lg font-medium transition-all ${
                        curriculumPeriodFilter === p
                          ? "bg-[#002D62] text-white font-semibold shadow-xs"
                          : "border-[#E5E5E5] text-[#555] hover:text-[#002D62] hover:bg-[#F8F9FA]"
                      }`}
                    >
                      {p}
                    </Button>
                  ))}
                </div>

                {/* Search & Unit Count */}
                <div className="flex items-center gap-2">
                  <div className="relative min-w-[200px]">
                    <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={curriculumSearch}
                      onChange={(e) => setCurriculumSearch(e.target.value)}
                      placeholder="Search unit or topic..."
                      className="w-full pl-8 pr-3 py-1 text-xs border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#002D62]"
                    />
                  </div>
                  <Badge variant="outline" className="font-mono text-[10px] text-[#002D62] border-[#002D62]/30 whitespace-nowrap">
                    {curriculumModules.length} Units Active
                  </Badge>
                </div>
              </div>

              {/* Dynamic Units Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {curriculumModules
                  .filter((mod) => {
                    const matchesPeriod =
                      curriculumPeriodFilter === "All" ||
                      mod.period.toLowerCase().includes(curriculumPeriodFilter.toLowerCase());
                    const matchesSearch =
                      !curriculumSearch ||
                      mod.title.toLowerCase().includes(curriculumSearch.toLowerCase()) ||
                      mod.description.toLowerCase().includes(curriculumSearch.toLowerCase()) ||
                      mod.topics.some((t) => t.toLowerCase().includes(curriculumSearch.toLowerCase()));
                    return matchesPeriod && matchesSearch;
                  })
                  .map((mod, index) => (
                    <Card key={mod.id} className="bg-white border-[#E5E5E5] shadow-xs rounded-xl p-4 space-y-3 hover:border-[#002D62]/40 transition-all flex flex-col justify-between">
                      <div className="space-y-2.5">
                        {/* Unit Card Header & Actions */}
                        <div className="flex items-center justify-between border-b border-[#F0F0F0] pb-2">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-[#002D62] text-white font-mono text-[10px]">
                              Unit {mod.lessonNumber}
                            </Badge>
                            <span className="text-[10.5px] font-mono text-[#666]">{mod.period}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-[10.5px] font-mono text-[#666]">{mod.duration}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            {/* Move Up */}
                            <button
                              type="button"
                              onClick={() => handleMoveModule(index, -1)}
                              disabled={index === 0}
                              title="Move Unit Up"
                              className="p-1 rounded text-slate-400 hover:text-[#002D62] hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
                            >
                              <ArrowUp className="h-3.5 w-3.5" />
                            </button>
                            {/* Move Down */}
                            <button
                              type="button"
                              onClick={() => handleMoveModule(index, 1)}
                              disabled={index === curriculumModules.length - 1}
                              title="Move Unit Down"
                              className="p-1 rounded text-slate-400 hover:text-[#002D62] hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
                            >
                              <ArrowDown className="h-3.5 w-3.5" />
                            </button>
                            {/* Edit */}
                            <button
                              type="button"
                              onClick={() => handleOpenEditModule(mod)}
                              title="Edit Unit Specifications"
                              className="p-1 rounded text-slate-500 hover:text-[#002D62] hover:bg-[#002D62]/10"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => handleDeleteModule(mod.id)}
                              title="Delete Unit"
                              className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h3 className="text-xs font-bold text-[#002D62] font-serif">{mod.title}</h3>
                          <p className="text-[11px] text-[#555] mt-1 leading-relaxed">{mod.description}</p>
                        </div>

                        {/* Program Outcomes Tag Strip */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[10px] text-slate-400 font-mono">PO Mappings:</span>
                          {(mod.poMapping || []).map((po) => (
                            <Badge key={po} variant="outline" className="text-[9.5px] font-mono bg-amber-50/50 text-[#b45309] border-amber-200">
                              {po}
                            </Badge>
                          ))}
                        </div>

                        {/* Associated Crime Lab Spec */}
                        {mod.lab && (
                          <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono text-[#002D62] font-semibold uppercase">
                                Integrated Forensic Lab:
                              </span>
                              <Badge className="bg-[#002D62]/10 text-[#002D62] text-[9.5px] font-mono">
                                {mod.lab.badge || "Hands-on Lab"}
                              </Badge>
                            </div>
                            <div className="text-[11.5px] font-bold text-[#1E293B] font-serif truncate">
                              {mod.lab.title}
                            </div>
                            <div className="text-[10px] font-mono text-slate-500">
                              Type: {mod.lab.type}
                            </div>
                          </div>
                        )}

                        {/* 5Es Learning Topics */}
                        <div className="space-y-1 pt-2 border-t border-[#EAEAEA]">
                          <div className="text-[10.5px] font-bold text-[#002D62] font-serif">5Es Learning Topics:</div>
                          <div className="space-y-1">
                            {mod.topics.map((t, idx) => (
                              <div key={idx} className="text-[11px] text-[#555] flex items-center gap-1.5">
                                <div className="h-1 w-1 rounded-full bg-[#C5A059] shrink-0" />
                                <span className="truncate">{t}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Button */}
                      <div className="pt-3 border-t border-[#F0F0F0] flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-400">
                          {mod.topics.length} topics mapped
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenEditModule(mod)}
                          className="h-7 text-xs text-[#002D62] hover:bg-[#002D62]/10 font-semibold px-2"
                        >
                          Configure Unit &rarr;
                        </Button>
                      </div>
                    </Card>
                  ))}
              </div>

              {/* EDIT UNIT MODAL */}
              <Dialog open={!!editingModule} onOpenChange={() => setEditingModule(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-xl">
                  <DialogHeader>
                    <DialogTitle className="text-base font-bold text-[#002D62] font-serif flex items-center gap-2">
                      <Pencil className="h-4 w-4 text-[#C5A059]" />
                      Edit Unit Specifications (Unit {editingModule?.lessonNumber})
                    </DialogTitle>
                    <DialogDescription className="text-xs text-[#666]">
                      Update syllabus parameters, learning outcomes, 5Es topics, and associated hands-on crime labs.
                    </DialogDescription>
                  </DialogHeader>

                  {editingModule && (
                    <div className="space-y-4 py-2 text-xs">
                      {/* Unit Title */}
                      <div className="space-y-1">
                        <label className="font-semibold text-[#002D62] block">Unit Title</label>
                        <input
                          type="text"
                          value={editingModule.title}
                          onChange={(e) => setEditingModule({ ...editingModule, title: e.target.value })}
                          className="w-full p-2 border border-[#CBD5E1] rounded-lg text-xs font-semibold text-[#1E293B] focus:outline-none focus:border-[#002D62]"
                        />
                      </div>

                      {/* Period & Duration */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="font-semibold text-[#002D62] block">Grading Period</label>
                          <select
                            value={editingModule.period}
                            onChange={(e) => setEditingModule({ ...editingModule, period: e.target.value })}
                            className="w-full p-2 border border-[#CBD5E1] rounded-lg text-xs bg-white text-[#1E293B] focus:outline-none focus:border-[#002D62]"
                          >
                            <option value="Prelims">Prelims</option>
                            <option value="Prelims Examination">Prelims Examination</option>
                            <option value="Midterms">Midterms</option>
                            <option value="Midterm Examination">Midterm Examination</option>
                            <option value="Semi-Finals">Semi-Finals</option>
                            <option value="Semi-Final Examination">Semi-Final Examination</option>
                            <option value="Finals">Finals</option>
                            <option value="Finals Examination">Finals Examination</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="font-semibold text-[#002D62] block">Allocated Duration</label>
                          <input
                            type="text"
                            value={editingModule.duration}
                            onChange={(e) => setEditingModule({ ...editingModule, duration: e.target.value })}
                            placeholder="e.g. 4 Hours / 2 Weeks"
                            className="w-full p-2 border border-[#CBD5E1] rounded-lg text-xs text-[#1E293B] focus:outline-none focus:border-[#002D62]"
                          />
                        </div>
                      </div>

                      {/* Description / Intended Learning Outcomes */}
                      <div className="space-y-1">
                        <label className="font-semibold text-[#002D62] block">
                          Unit Description & Intended Learning Outcomes (ILOs)
                        </label>
                        <textarea
                          rows={3}
                          value={editingModule.description}
                          onChange={(e) => setEditingModule({ ...editingModule, description: e.target.value })}
                          className="w-full p-2 border border-[#CBD5E1] rounded-lg text-xs text-[#1E293B] focus:outline-none focus:border-[#002D62]"
                        />
                      </div>

                      {/* CHED Program Outcomes (PO) Checkboxes */}
                      <div className="space-y-1.5 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <label className="font-bold text-[#002D62] block text-[11px]">
                          CHED Program Outcomes (PO) Alignment:
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                          {COURSE_INFO.programOutcomes.map((po) => {
                            const isChecked = (editingModule.poMapping || []).includes(po.id);
                            return (
                              <label key={po.id} className="flex items-start gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleToggleEditingPo(po.id)}
                                  className="mt-0.5 rounded border-slate-300 text-[#002D62] focus:ring-[#002D62]"
                                />
                                <div>
                                  <span className="font-bold text-[#002D62]">{po.id}: </span>
                                  <span className="text-slate-600">{po.title}</span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* 5Es Learning Topics Manager */}
                      <div className="space-y-2 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                        <label className="font-bold text-[#002D62] block text-[11px]">
                          5Es Learning Topics List ({editingModule.topics?.length || 0} Topics):
                        </label>

                        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                          {(editingModule.topics || []).map((topic, tIdx) => (
                            <div key={tIdx} className="flex items-center justify-between p-1.5 bg-white border border-[#CBD5E1] rounded-lg text-xs">
                              <span className="truncate text-slate-800">{topic}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveTopicFromEditing(tIdx)}
                                className="text-red-500 hover:text-red-700 p-0.5 ml-2"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Add Topic Input */}
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="text"
                            value={newTopicInput}
                            onChange={(e) => setNewTopicInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") handleAddTopicToEditing(e); }}
                            placeholder="Add new 5Es topic..."
                            className="flex-1 p-1.5 border border-[#CBD5E1] rounded-lg text-xs bg-white focus:outline-none focus:border-[#002D62]"
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={handleAddTopicToEditing}
                            className="bg-[#002D62] hover:bg-[#001F44] text-white text-xs h-7 px-3"
                          >
                            <Plus className="h-3 w-3 mr-1" /> Add
                          </Button>
                        </div>
                      </div>

                      {/* Forensic Lab Configuration */}
                      <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <label className="font-bold text-[#002D62] block text-[11px]">
                          Associated Hands-On Forensic Lab Parameters:
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div className="sm:col-span-2 space-y-1">
                            <span className="text-[10px] text-slate-500 block">Lab Title</span>
                            <input
                              type="text"
                              value={editingModule.lab?.title || ""}
                              onChange={(e) =>
                                setEditingModule({
                                  ...editingModule,
                                  lab: { ...editingModule.lab, title: e.target.value }
                                })
                              }
                              className="w-full p-1.5 border border-[#CBD5E1] rounded-lg text-xs bg-white text-slate-800 focus:outline-none focus:border-[#002D62]"
                            />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-500 block">Badge Label</span>
                            <input
                              type="text"
                              value={editingModule.lab?.badge || ""}
                              onChange={(e) =>
                                setEditingModule({
                                  ...editingModule,
                                  lab: { ...editingModule.lab, badge: e.target.value }
                                })
                              }
                              className="w-full p-1.5 border border-[#CBD5E1] rounded-lg text-xs bg-white text-slate-800 focus:outline-none focus:border-[#002D62]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <DialogFooter className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setEditingModule(null)}
                      className="text-xs h-8"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveEditedModule}
                      className="bg-[#002D62] hover:bg-[#001F44] text-white text-xs h-8 px-4 font-bold"
                    >
                      <Check className="h-3.5 w-3.5 mr-1 text-[#C5A059]" />
                      Save & Sync Syllabus
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* ADD NEW UNIT MODAL */}
              <Dialog open={isAddUnitModalOpen} onOpenChange={setIsAddUnitModalOpen}>
                <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto bg-white rounded-xl">
                  <DialogHeader>
                    <DialogTitle className="text-base font-bold text-[#002D62] font-serif flex items-center gap-2">
                      <Plus className="h-4 w-4 text-[#C5A059]" />
                      Scaffold New Syllabus Unit
                    </DialogTitle>
                    <DialogDescription className="text-xs text-[#666]">
                      Create a new instructional module, specify syllabus timing, and link hands-on cybercrime labs.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-3 py-2 text-xs">
                    <div className="space-y-1">
                      <label className="font-semibold text-[#002D62] block">Unit Title</label>
                      <input
                        type="text"
                        value={newUnitForm.title}
                        onChange={(e) => setNewUnitForm({ ...newUnitForm, title: e.target.value })}
                        placeholder="e.g. Unit 9: Artificial Intelligence in Digital Forensics & Deepfake Detection"
                        className="w-full p-2 border border-[#CBD5E1] rounded-lg text-xs font-semibold text-[#1E293B] focus:outline-none focus:border-[#002D62]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-semibold text-[#002D62] block">Grading Period</label>
                        <select
                          value={newUnitForm.period}
                          onChange={(e) => setNewUnitForm({ ...newUnitForm, period: e.target.value })}
                          className="w-full p-2 border border-[#CBD5E1] rounded-lg text-xs bg-white text-[#1E293B] focus:outline-none focus:border-[#002D62]"
                        >
                          <option value="Prelims">Prelims</option>
                          <option value="Midterms">Midterms</option>
                          <option value="Semi-Finals">Semi-Finals</option>
                          <option value="Finals Examination">Finals Examination</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-[#002D62] block">Duration</label>
                        <input
                          type="text"
                          value={newUnitForm.duration}
                          onChange={(e) => setNewUnitForm({ ...newUnitForm, duration: e.target.value })}
                          placeholder="4 Hours"
                          className="w-full p-2 border border-[#CBD5E1] rounded-lg text-xs text-[#1E293B] focus:outline-none focus:border-[#002D62]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-[#002D62] block">Description & Learning Outcomes</label>
                      <textarea
                        rows={2}
                        value={newUnitForm.description}
                        onChange={(e) => setNewUnitForm({ ...newUnitForm, description: e.target.value })}
                        placeholder="Overview of emerging artificial intelligence threats, deepfake video forensics, and judicial standards..."
                        className="w-full p-2 border border-[#CBD5E1] rounded-lg text-xs text-[#1E293B] focus:outline-none focus:border-[#002D62]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-[#002D62] block">Associated Crime Lab Title</label>
                      <input
                        type="text"
                        value={newUnitForm.lab.title}
                        onChange={(e) =>
                          setNewUnitForm({
                            ...newUnitForm,
                            lab: { ...newUnitForm.lab, title: e.target.value }
                          })
                        }
                        placeholder="e.g. Deepfake Video Artifact Analysis & Facial Landmark Triage"
                        className="w-full p-2 border border-[#CBD5E1] rounded-lg text-xs text-[#1E293B] focus:outline-none focus:border-[#002D62]"
                      />
                    </div>
                  </div>

                  <DialogFooter className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setIsAddUnitModalOpen(false)}
                      className="text-xs h-8"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateNewUnit}
                      disabled={!newUnitForm.title.trim()}
                      className="bg-[#002D62] hover:bg-[#001F44] text-white text-xs h-8 px-4 font-bold disabled:opacity-50"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1 text-[#C5A059]" />
                      Add to Course Syllabus
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}


          {/* SECTION 4: SYLLABUS GRADING FORMULA */}
          {activeSection === "grading-matrix" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAEAEA] pb-3">
                <div>
                  <h2 className="text-lg font-bold text-[#002D62] font-serif flex items-center gap-2">
                    <Award className="h-5 w-5 text-[#C5A059]" />
                    Syllabus Section VIII: Institutional Grading Formula
                  </h2>
                  <p className="text-xs text-[#666]">
                    Enforces the exact mathematical weights mandated in the Father Saturnino Urios University syllabus.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4 bg-white border-[#E5E5E5] shadow-xs rounded-xl space-y-3">
                  <h3 className="text-xs font-bold text-[#002D62] font-serif uppercase tracking-wide">1. Summative Tests (60%)</h3>
                  <div className="p-3 rounded-lg bg-[#F8F9FA] border border-[#EAEAEA] text-xs space-y-1.5 text-[#555]">
                    <div className="font-semibold text-[#002D62]">Midterm Period Calculation:</div>
                    <p>• Prelims (50%) + Midterms (50%) = Total / 2</p>
                    <p>• Multiplied by 60% share during the first half of the term.</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#F8F9FA] border border-[#EAEAEA] text-xs space-y-1.5 text-[#555]">
                    <div className="font-semibold text-[#002D62]">Finals Period Calculation:</div>
                    <p>• Semi-finals (50%) + Finals (50%) = Total / 2</p>
                    <p>• Multiplied by 60% share during the second half of the term.</p>
                  </div>
                </Card>

                <Card className="p-4 bg-white border-[#E5E5E5] shadow-xs rounded-xl space-y-3">
                  <h3 className="text-xs font-bold text-[#002D62] font-serif uppercase tracking-wide">2. Class Work (40%)</h3>
                  <div className="p-3 rounded-lg bg-[#F8F9FA] border border-[#EAEAEA] text-xs space-y-1.5 text-[#555]">
                    <div className="font-semibold text-[#002D62]">Continuous Assessment Sub-components:</div>
                    <p>• Forensic Laboratory Practicum Submissions</p>
                    <p>• Formative Unit Quizzes & MOOT Court Arguments</p>
                    <p>• Case Analysis Briefings (RA 10175 / RA 10173)</p>
                    <p>• Oral Recitations and Reactionnaires</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#002D62]/5 border border-[#002D62]/10 text-xs text-[#002D62] font-bold font-mono">
                    Real Final Grade = (Midterm + 2 x Tentative Final) / 3
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* SECTION 5: CHED PROGRAM OUTCOMES & TRANSMITTAL */}
          {activeSection === "outcomes" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAEAEA] pb-3">
                <div>
                  <h2 className="text-lg font-bold text-[#002D62] font-serif flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-[#C5A059]" />
                    CHED Criminology Program & Graduate Attributes (OBE)
                  </h2>
                  <p className="text-xs text-[#666]">
                    Mapping student competencies to the Father Saturnino Urios University Institutional Outcomes and Criminology Standards.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => handlePrintChedForm9("All")}
                    className="bg-[#002D62] hover:bg-[#001F44] text-white text-xs h-8 px-3 rounded-lg shadow-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5 text-[#C5A059]" />
                    <span>Print CHED Form 9 (PDF)</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={handlePrintDeansTransmittal}
                    className="bg-[#C5A059] hover:bg-[#b58f48] text-[#001F44] text-xs h-8 px-3 rounded-lg shadow-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Dean&apos;s Transmittal</span>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {COURSE_INFO.programOutcomes.map((po) => {
                  const dynamicAttainment = cohortMetrics.totalStudents > 0 && Number(cohortMetrics.averageGrade) > 0
                    ? `${cohortMetrics.averageGrade}% Attainment`
                    : "Awaiting Evaluated Cohort Data";
                  return (
                    <Card key={po.id} className="p-4 bg-white border-[#E5E5E5] shadow-xs rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Badge className="bg-[#002D62] text-white font-mono text-[9.5px]">{po.id}</Badge>
                        <span className={`text-[10px] font-mono font-semibold ${cohortMetrics.totalStudents > 0 && Number(cohortMetrics.averageGrade) > 0 ? "text-emerald-700" : "text-slate-400"}`}>
                          {dynamicAttainment}
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-[#002D62] font-serif">{po.title}</h3>
                      <p className="text-xs text-[#555] leading-relaxed">{po.description}</p>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION: AUDIT LOGS */}
          {activeSection === "audit-logs" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAEAEA] pb-3">
                <div>
                  <h2 className="text-lg font-bold text-[#002D62] font-serif flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-[#C5A059]" />
                    System Audit Logs
                  </h2>
                  <p className="text-xs text-[#666] mt-1">
                    Live administrative actions, user enlistments, and security events logged directly from Supabase.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchAuditLogsData}
                    disabled={isLoadingAuditLogs}
                    className="h-8 text-xs bg-white border-[#E5E5E5] text-slate-700 cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 text-[#C5A059] ${isLoadingAuditLogs ? "animate-spin" : ""}`} />
                    <span>Refresh</span>
                  </Button>
                </div>
              </div>

              <Card className="bg-white border-[#E5E5E5] shadow-sm rounded-xl overflow-hidden">
                {isLoadingAuditLogs ? (
                  <div className="p-12 text-center space-y-2">
                    <Loader2 className="h-6 w-6 text-[#002D62] animate-spin mx-auto" />
                    <p className="text-xs text-slate-500 font-mono">Loading institutional audit trail...</p>
                  </div>
                ) : auditLogsList.length === 0 ? (
                  <div className="p-12 text-center space-y-3">
                    <div className="h-12 w-12 rounded-full bg-[#002D62]/10 text-[#002D62] flex items-center justify-center mx-auto">
                      <ClipboardList className="h-6 w-6 text-[#C5A059]" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-[#002D62] font-serif">No Audit Logs Recorded Yet</h3>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        Real-time events (user provisioning, grade adjustments, role assignments, and authentications) will automatically be tracked and logged here.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={fetchAuditLogsData}
                      className="text-xs h-8 border-[#002D62]/20 text-[#002D62] hover:bg-[#002D62]/5 cursor-pointer"
                    >
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5 text-[#C5A059]" />
                      Refresh Audit Trail
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#EAEAEA] bg-[#F8F9FA] text-[10px] text-[#002D62] font-bold uppercase tracking-wider">
                          <th className="py-3 px-4">Timestamp</th>
                          <th className="py-3 px-4">Severity</th>
                          <th className="py-3 px-4">Admin / User</th>
                          <th className="py-3 px-4">Action Description</th>
                          <th className="py-3 px-4 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="text-[11.5px] text-[#333] divide-y divide-[#EAEAEA]">
                        {auditLogsList.map((log) => (
                          <tr key={log.id} className="hover:bg-[#F8F9FA] transition-colors">
                            <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[10px]">
                              {log.created_at
                                ? new Date(log.created_at).toLocaleString("en-PH", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })
                                : "Just now"}
                            </td>
                            <td className="py-3 px-4 font-semibold text-[#002D62]">
                              {log.severity || "Standard"}
                            </td>
                            <td className="py-3 px-4 text-slate-600 font-medium">
                              {log.actor_name || "Admin"}
                            </td>
                            <td className="py-3 px-4 text-slate-700">
                              {log.action}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  log.severity === "High"
                                    ? "bg-amber-100 text-amber-800 border border-amber-300"
                                    : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                }`}
                              >
                                Recorded
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* SECTION 6: PROFILE SETTINGS */}
          {activeSection === "profile-settings" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAEAEA] pb-3">
                <div>
                  <h2 className="text-lg font-bold text-[#002D62] font-serif flex items-center gap-2">
                    <Settings className="h-5 w-5 text-[#C5A059]" />
                    Profile & Application Settings
                  </h2>
                  <p className="text-xs text-[#666] mt-1">
                    Manage your administrator profile, security credentials, and platform preferences.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Information */}
                <Card className="lg:col-span-2 p-6 bg-white border-[#E5E5E5] shadow-sm rounded-xl space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-[#002D62] font-serif mb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-[#1E293B]">First Name</label>
                        <input type="text" defaultValue="Admin" className="w-full p-2.5 text-xs border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#002D62] bg-[#F8F9FA]" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-[#1E293B]">Last Name</label>
                        <input type="text" defaultValue="User" className="w-full p-2.5 text-xs border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#002D62] bg-[#F8F9FA]" />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-[11px] font-bold text-[#1E293B]">Email Address</label>
                        <input type="email" defaultValue="admin@urios.edu.ph" className="w-full p-2.5 text-xs border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#002D62] bg-[#F8F9FA]" />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-[11px] font-bold text-[#1E293B]">Bio / Designation</label>
                        <textarea rows={3} defaultValue="Lead Instructor for Cyber Security and Forensics." className="w-full p-2.5 text-xs border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#002D62] bg-[#F8F9FA]" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#EAEAEA]">
                    <Button className="bg-[#002D62] hover:bg-[#001F44] text-white text-xs font-semibold px-6 py-2 h-auto rounded-lg">
                      Save Changes
                    </Button>
                  </div>
                </Card>

                {/* Account Security & Preferences */}
                <div className="space-y-6">
                  <Card className="p-6 bg-white border-[#E5E5E5] shadow-sm rounded-xl space-y-4">
                    <h3 className="text-sm font-bold text-[#002D62] font-serif">Account Security</h3>
                    
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-[#1E293B]">Current Password</label>
                        <input type="password" placeholder="••••••••" className="w-full p-2.5 text-xs border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#002D62]" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-[#1E293B]">New Password</label>
                        <input type="password" placeholder="••••••••" className="w-full p-2.5 text-xs border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#002D62]" />
                      </div>
                    </div>

                    <Button variant="outline" className="w-full text-xs font-semibold border-[#002D62] text-[#002D62] hover:bg-[#002D62] hover:text-white rounded-lg">
                      Update Password
                    </Button>
                  </Card>

                  <Card className="p-6 bg-white border-[#E5E5E5] shadow-sm rounded-xl space-y-4">
                    <h3 className="text-sm font-bold text-[#002D62] font-serif">Platform Preferences</h3>
                    
                    <div className="space-y-3 text-[11px] font-medium text-[#333]">
                      <label className="flex items-center justify-between cursor-pointer">
                        <span>Email Notifications</span>
                        <input type="checkbox" defaultChecked className="rounded border-slate-300 text-[#002D62] focus:ring-[#002D62]" />
                      </label>
                      <label className="flex items-center justify-between cursor-pointer">
                        <span>SMS Alerts</span>
                        <input type="checkbox" className="rounded border-slate-300 text-[#002D62] focus:ring-[#002D62]" />
                      </label>
                      <label className="flex items-center justify-between cursor-pointer">
                        <span>Dark Mode Preview</span>
                        <input type="checkbox" className="rounded border-slate-300 text-[#002D62] focus:ring-[#002D62]" />
                      </label>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Practicum Grading Evaluation Modal */}
      {evaluatingSubmission && (
        <Dialog open={!!evaluatingSubmission} onOpenChange={() => setEvaluatingSubmission(null)}>
          <DialogContent className="sm:max-w-md bg-white text-[#1E293B] border-[#E5E5E5] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-[#002D62] font-serif">
                Grade Practicum Submission
              </DialogTitle>
              <DialogDescription className="text-xs text-[#666]">
                Review evidence compliance and record official classwork marks.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <div className="p-3 rounded-xl bg-[#F8F9FA] border border-[#EAEAEA] space-y-1">
                <div className="font-bold text-[#002D62] font-serif">{evaluatingSubmission.studentName} ({evaluatingSubmission.studentId})</div>
                <div className="text-[11px] text-[#666]">{evaluatingSubmission.unit} • {evaluatingSubmission.task}</div>
                <p className="text-[11px] text-[#333] mt-1 italic">"{evaluatingSubmission.complianceNote}"</p>
              </div>

              {/* Technical Evidence Payload Breakdown (if available) */}
              {evaluatingSubmission.evidencePayload && Object.keys(evaluatingSubmission.evidencePayload).length > 0 && (
                <div className="p-2.5 rounded-xl bg-[#001F44]/5 border border-[#001F44]/10 space-y-1.5">
                  <div className="text-[10px] font-bold text-[#002D62] font-mono uppercase tracking-wider flex items-center gap-1.5">
                    <FileCheck className="h-3 w-3 text-[#C5A059]" />
                    Forensic Evidence Payload
                  </div>

                  {evaluatingSubmission.evidencePayload.extractedOrder && (
                    <div className="space-y-1">
                      <div className="text-[10px] text-[#555]">Disassembled Hardware Sequence:</div>
                      <div className="flex flex-wrap gap-1">
                        {evaluatingSubmission.evidencePayload.extractedOrder.map((comp, idx) => (
                          <span
                            key={idx}
                            className={`px-1.5 py-0.5 rounded text-[9.5px] font-mono border ${
                              comp.correct
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : "bg-red-50 text-red-800 border-red-200"
                            }`}
                          >
                            #{comp.order} {comp.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {evaluatingSubmission.evidencePayload.extractedStrings && (
                    <div className="space-y-1">
                      <div className="text-[10px] text-[#555]">Memory Strings Extracted:</div>
                      <div className="flex flex-wrap gap-1">
                        {evaluatingSubmission.evidencePayload.extractedStrings.map((str, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 rounded bg-white text-[#002D62] font-mono text-[9px] border border-[#CBD5E1]">
                            {str}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {evaluatingSubmission.evidencePayload.fullArgument && (
                    <div className="space-y-1">
                      <div className="text-[10px] text-[#555]">Moot Court Legal Argument:</div>
                      <div className="p-2 rounded bg-white border border-[#CBD5E1] text-[11px] text-[#1E293B] italic max-h-24 overflow-y-auto">
                        "{evaluatingSubmission.evidencePayload.fullArgument}"
                      </div>
                    </div>
                  )}
                </div>
              )}

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
                  className="w-full p-2.5 rounded-xl border border-[#E5E5E5] font-mono text-sm font-bold text-[#002D62] focus:outline-none focus:border-[#002D62]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#002D62] block mb-1">
                  Instructor Compliance Feedback:
                </label>
                <input
                  type="text"
                  value={facultyFeedback}
                  onChange={(e) => setFacultyFeedback(e.target.value)}
                  placeholder="e.g. Order of Volatility verified. Full marks assigned."
                  className="w-full p-2.5 rounded-xl border border-[#E5E5E5] text-xs text-[#1E293B] focus:outline-none focus:border-[#002D62]"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEvaluatingSubmission(null)}
                className="text-xs border-[#E5E5E5] rounded-xl"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={isSubmittingGrade}
                onClick={handleApproveGrade}
                className="bg-[#002D62] hover:bg-[#001F44] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5"
              >
                {isSubmittingGrade && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {isSubmittingGrade ? "Saving Grade..." : "Submit Official Grade"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add New Specimen Dialog */}
      <Dialog open={newSpecimenModalOpen} onOpenChange={setNewSpecimenModalOpen}>
        <DialogContent className="sm:max-w-md bg-white text-[#1E293B] border-[#E5E5E5] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#002D62] font-serif flex items-center gap-2">
              <Plus className="h-4 w-4 text-[#C5A059]" />
              Add Evidence Specimen
            </DialogTitle>
            <DialogDescription className="text-xs text-[#666]">
              Record new hardware, digital dump, or physical contraband item into the CoC inventory.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-[#002D62] block mb-1">Item Number</label>
                <input
                  type="text"
                  value={newSpecimen.itemNo}
                  onChange={(e) => setNewSpecimen({ ...newSpecimen, itemNo: e.target.value })}
                  placeholder="ITEM-04"
                  className="w-full p-2 rounded-lg border border-[#CBD5E1] text-xs font-mono focus:outline-none focus:border-[#002D62]"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#002D62] block mb-1">Bag & Tag No.</label>
                <input
                  type="text"
                  value={newSpecimen.evidenceBagTag}
                  onChange={(e) => setNewSpecimen({ ...newSpecimen, evidenceBagTag: e.target.value })}
                  placeholder="EB-2026-094"
                  className="w-full p-2 rounded-lg border border-[#CBD5E1] text-xs font-mono focus:outline-none focus:border-[#002D62]"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#002D62] block mb-1">Description & Brand / Model</label>
              <input
                type="text"
                value={newSpecimen.description}
                onChange={(e) => setNewSpecimen({ ...newSpecimen, description: e.target.value })}
                placeholder="Seagate Barracuda 2TB HDD or Volatile RAM"
                className="w-full p-2 rounded-lg border border-[#CBD5E1] text-xs focus:outline-none focus:border-[#002D62]"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#002D62] block mb-1">Serial / Barcode Number</label>
              <input
                type="text"
                value={newSpecimen.serialNumber}
                onChange={(e) => setNewSpecimen({ ...newSpecimen, serialNumber: e.target.value })}
                placeholder="SN-99824-W109"
                className="w-full p-2 rounded-lg border border-[#CBD5E1] text-xs font-mono focus:outline-none focus:border-[#002D62]"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#002D62] block mb-1">SHA-256 Bit-Stream Hash</label>
              <input
                type="text"
                value={newSpecimen.sha256}
                onChange={(e) => setNewSpecimen({ ...newSpecimen, sha256: e.target.value })}
                placeholder="64-character SHA-256 hex digest"
                className="w-full p-2 rounded-lg border border-[#CBD5E1] text-xs font-mono text-[11px] focus:outline-none focus:border-[#002D62]"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#002D62] block mb-1">Forensic Status & Seal Condition</label>
              <input
                type="text"
                value={newSpecimen.status}
                onChange={(e) => setNewSpecimen({ ...newSpecimen, status: e.target.value })}
                placeholder="Forensically Sealed with Anti-Static Tamper Tape"
                className="w-full p-2 rounded-lg border border-[#CBD5E1] text-xs focus:outline-none focus:border-[#002D62]"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setNewSpecimenModalOpen(false)}
              className="text-xs border-[#E5E5E5] rounded-xl"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAddSpecimen}
              disabled={!newSpecimen.description}
              className="bg-[#002D62] hover:bg-[#001F44] text-white text-xs font-semibold rounded-xl"
            >
              Add to Evidence Inventory
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>



      {/* Grade Editing Modal */}
      {editingStudentGrades && (
        <Dialog open={true} onOpenChange={(open) => { if (!open) setEditingStudentGrades(null); }}>
          <DialogContent className="max-w-md bg-white border-[#EAEAEA] rounded-2xl shadow-xl p-0 overflow-hidden">
            <DialogHeader className="p-4 border-b border-[#EAEAEA] bg-[#F8F9FA]">
              <DialogTitle className="text-sm font-bold text-[#002D62] font-serif flex items-center gap-2">
                <Pencil className="h-4 w-4 text-[#C5A059]" />
                Edit Summative Exams: {editingStudentGrades.name}
              </DialogTitle>
              <DialogDescription className="text-xs text-[#666]">
                Input raw scores for the 4 major term exams.
              </DialogDescription>
            </DialogHeader>

            <div className="p-4 space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#002D62] font-bold mb-1">Prelims</label>
                  <input
                    type="number"
                    value={editGradesForm.prelims}
                    onChange={(e) => setEditGradesForm({ ...editGradesForm, prelims: Number(e.target.value) })}
                    className="w-full p-2 border border-[#CBD5E1] rounded focus:outline-none focus:border-[#002D62]"
                  />
                </div>
                <div>
                  <label className="block text-[#002D62] font-bold mb-1">Midterms</label>
                  <input
                    type="number"
                    value={editGradesForm.midterms}
                    onChange={(e) => setEditGradesForm({ ...editGradesForm, midterms: Number(e.target.value) })}
                    className="w-full p-2 border border-[#CBD5E1] rounded focus:outline-none focus:border-[#002D62]"
                  />
                </div>
                <div>
                  <label className="block text-[#002D62] font-bold mb-1">Semi-Finals</label>
                  <input
                    type="number"
                    value={editGradesForm.semiFinals}
                    onChange={(e) => setEditGradesForm({ ...editGradesForm, semiFinals: Number(e.target.value) })}
                    className="w-full p-2 border border-[#CBD5E1] rounded focus:outline-none focus:border-[#002D62]"
                  />
                </div>
                <div>
                  <label className="block text-[#002D62] font-bold mb-1">Finals</label>
                  <input
                    type="number"
                    value={editGradesForm.finals}
                    onChange={(e) => setEditGradesForm({ ...editGradesForm, finals: Number(e.target.value) })}
                    className="w-full p-2 border border-[#CBD5E1] rounded focus:outline-none focus:border-[#002D62]"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="p-4 bg-[#F8F9FA] border-t border-[#EAEAEA] gap-2 sm:gap-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingStudentGrades(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveStudentGrades}
                disabled={isSubmittingStudentGrades}
                className="bg-[#002D62] hover:bg-[#001F44] text-white text-xs font-semibold"
              >
                {isSubmittingStudentGrades ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Exams"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* NEW MESSAGE MODAL */}
      {showNewMessageModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95">
            <div className="flex items-center justify-between p-4 border-b border-[#EAEAEA] bg-[#002D62] text-white">
              <h2 className="text-sm font-bold font-serif">Compose Broadcast</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowNewMessageModal(false)} className="h-6 w-6 text-white hover:bg-white/20 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-xs font-semibold text-[#555] w-14 text-right">To:</label>
                <select className="flex-1 px-3 py-2 bg-white border border-[#EAEAEA] rounded-lg text-xs text-[#1E293B] font-medium focus:outline-none focus:border-[#002D62] focus:ring-1 focus:ring-[#002D62]">
                  <option value="BROADCAST">All Students (Broadcast)</option>
                </select>
              </div>
              <div className="flex items-center gap-4">
                <label className="text-xs font-semibold text-[#555] w-14 text-right">Subject:</label>
                <input 
                  type="text" 
                  value={msgSubject}
                  onChange={(e) => setMsgSubject(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white border border-[#EAEAEA] rounded-lg text-xs focus:outline-none focus:border-[#002D62] focus:ring-1 focus:ring-[#002D62]"
                />
              </div>
              <div className="flex items-start gap-4">
                <label className="text-xs font-semibold text-[#555] w-14 text-right pt-2">Message:</label>
                <textarea 
                  rows={8}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white border border-[#EAEAEA] rounded-lg text-xs focus:outline-none focus:border-[#002D62] focus:ring-1 focus:ring-[#002D62] resize-none"
                />
              </div>
            </div>
            <div className="p-4 border-t border-[#EAEAEA] bg-[#F8F9FA] flex justify-end gap-3">
              <Button variant="ghost" size="sm" onClick={() => setShowNewMessageModal(false)} className="text-xs text-[#666] hover:bg-[#E5E5E5] px-4">
                Cancel
              </Button>
              <Button 
                size="sm" 
                disabled={isSendingMessage || !newMessage.trim()}
                onClick={() => {
                  handleSendMessage(msgSubject ? `[${msgSubject}] ${newMessage}` : newMessage);
                  setNewMessage("");
                  setMsgSubject("");
                  setShowNewMessageModal(false);
                }}
                className="bg-[#C5A059] hover:bg-[#A38243] text-white text-xs px-6 rounded-lg shadow-sm font-semibold"
              >
                {isSendingMessage ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : <Send className="h-3.5 w-3.5 mr-2" />}
                Send Message
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Global Modals for Admin Actions */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-md bg-white border-[#EAEAEA] rounded-2xl shadow-xl overflow-hidden p-0">
          <DialogHeader className="p-5 border-b border-[#EAEAEA] bg-slate-50">
            <DialogTitle className="text-base font-bold text-[#002D62] flex items-center gap-2">
              {confirmDialog.isDestructive ? <AlertCircle className="h-5 w-5 text-red-500" /> : <ShieldCheck className="h-5 w-5 text-[#C5A059]" />}
              {confirmDialog.title}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 font-medium">
              {confirmDialog.message}
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 py-4 bg-slate-50 border-t border-[#EAEAEA] flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))} className="text-xs bg-white">
              Cancel
            </Button>
            <Button 
              size="sm" 
              onClick={confirmDialog.action} 
              className={`text-xs text-white shadow-sm ${confirmDialog.isDestructive ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20' : 'bg-[#002D62] hover:bg-[#001F44] shadow-[#002D62]/20'}`}
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={alertDialog.open} onOpenChange={(open) => setAlertDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-sm bg-white border-[#EAEAEA] rounded-2xl shadow-xl overflow-hidden p-0 text-center">
          <div className="pt-6 pb-2 flex justify-center">
            {alertDialog.isSuccess ? (
              <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
            ) : (
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            )}
          </div>
          <DialogHeader className="px-6 pb-4">
            <DialogTitle className="text-lg font-bold text-slate-800 text-center">
              {alertDialog.title}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600 text-center">
              {alertDialog.message}
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 py-4 bg-slate-50 border-t border-[#EAEAEA] flex justify-center sm:justify-center">
            <Button 
              size="sm" 
              onClick={() => setAlertDialog(prev => ({ ...prev, open: false }))} 
              className={`text-xs w-full sm:w-auto min-w-[120px] text-white ${alertDialog.isSuccess ? 'bg-[#002D62] hover:bg-[#001F44]' : 'bg-slate-800 hover:bg-slate-900'}`}
            >
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

