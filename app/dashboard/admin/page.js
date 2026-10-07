"use client";

import React, { useState, useMemo, useEffect } from "react";
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
  RotateCcw
} from "lucide-react";
import {
  COURSE_INFO,
  SYLLABUS_MODULES,
  getSavedModules,
  saveModulesDynamic,
  fetchDynamicModules,
  resetModules
} from "@/lib/curriculum";
import { MOCK_ADMIN_DATA, MOCK_COC_TEMPLATES } from "@/lib/adminData";
import {
  CASE_DEFENSE_TOPICS,
  getSavedCaseTopics,
  saveCaseTopics
} from "@/lib/discussionData";
import {
  getPracticumSubmissions,
  gradePracticumSubmission,
  subscribeToPracticumUpdates
} from "@/lib/practicumService";

// Shadcn UI Components
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("overview"); // 'overview', 'students', 'chain-of-custody', 'grade-curve', 'curriculum-mgmt', 'grading-matrix', 'outcomes'
  const [submissionSearch, setSubmissionSearch] = useState("");
  const [selectedSectionFilter, setSelectedSectionFilter] = useState("All"); // 'All', 'Section Alpha', 'Section Bravo'
  const [submissionsList, setSubmissionsList] = useState(MOCK_ADMIN_DATA.studentSubmissions);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [isSubmittingGrade, setIsSubmittingGrade] = useState(false);
  const [liveSubmissionNotice, setLiveSubmissionNotice] = useState(null);

  // Case Defense Bench & Moot Court Evaluator State
  const [caseTopics, setCaseTopics] = useState(CASE_DEFENSE_TOPICS);
  const [selectedDocketId, setSelectedDocketId] = useState("case-def-1");
  const [evaluatingPost, setEvaluatingPost] = useState(null);
  const [benchRulingText, setBenchRulingText] = useState("");
  const [benchPoints, setBenchPoints] = useState(95);
  const [awardCounselBadge, setAwardCounselBadge] = useState(true);
  const [newFacultyDirective, setNewFacultyDirective] = useState("");
  const [docketSearch, setDocketSearch] = useState("");
  const [docketFilter, setDocketFilter] = useState("all"); // 'all', 'pending', 'verified'

  // Sidebar Collapse state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Dynamic Grade Curve State
  const [gradeCurveOffset, setGradeCurveOffset] = useState(0);

  // Dynamic Student Cohort Roster State
  const [cohortRoster, setCohortRoster] = useState([
    { id: "STU-2026-4091", name: "Student Juan Dela Cruz", section: "Section Alpha", sum: 88, cw: 94, gender: "M", program: "BS Criminology", yearLevel: "4th Year" },
    { id: "STU-2026-4092", name: "Student Maria Santos", section: "Section Alpha", sum: 92, cw: 96, gender: "F", program: "BS Criminology", yearLevel: "4th Year" },
    { id: "STU-2026-4093", name: "Student Paolo Reyes", section: "Section Bravo", sum: 84, cw: 88, gender: "M", program: "BS Criminology", yearLevel: "4th Year" },
    { id: "STU-2026-4094", name: "Student Alyssa Gonzaga", section: "Section Bravo", sum: 90, cw: 92, gender: "F", program: "BS Criminology", yearLevel: "4th Year" },
    { id: "STU-2026-4095", name: "Student Kevin Mendoza", section: "Section Alpha", sum: 86, cw: 90, gender: "M", program: "BS Criminology", yearLevel: "4th Year" },
    { id: "STU-2026-4096", name: "Student Bianca Ramos", section: "Section Bravo", sum: 94, cw: 98, gender: "F", program: "BS Criminology", yearLevel: "4th Year" },
    { id: "STU-2026-4097", name: "Student Joshua Villanueva", section: "Section Alpha", sum: 89, cw: 91, gender: "M", program: "BS Criminology", yearLevel: "4th Year" },
    { id: "STU-2026-4098", name: "Student Catherine Lim", section: "Section Bravo", sum: 93, cw: 95, gender: "F", program: "BS Criminology", yearLevel: "4th Year" },
  ]);

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
        investigatorName: "Student Investigator",
        badgeNumber: "STU-2026-4091",
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
            releasedBy: "Student Investigator<br/><span style=\"font-size: 8px;\">(First Responder)</span>",
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
      instructor: MOCK_ADMIN_DATA.instructor.name,
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
    const savedTopics = getSavedCaseTopics();
    setCaseTopics(savedTopics);

    fetchDynamicModules().then((initialCurriculum) => {
      setCurriculumModules(initialCurriculum);
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

  // Bench Review count for sidebar & headers
  const pendingBenchReviews = useMemo(() => {
    let count = 0;
    caseTopics.forEach((t) => {
      t.initialPosts?.forEach((p) => {
        if (!p.instructorFeedback && !p.isFacultyDirective) count++;
      });
    });
    return count;
  }, [caseTopics]);

  // Case Defense Bench Ruling Actions
  const handleOpenBenchRuling = (post) => {
    setEvaluatingPost(post);
    setBenchRulingText(
      post.instructorFeedback ||
        "Accurate legal invocation of statutory elements and mens rea. Evidentiary threshold satisfied under RA 10175. +15 Practicum points."
    );
    setBenchPoints(95);
    setAwardCounselBadge(true);
  };

  const handleSaveBenchRuling = () => {
    if (!evaluatingPost) return;

    const numPoints = Number(benchPoints);
    const updatedTopics = caseTopics.map((topic) => {
      if (topic.id === selectedDocketId) {
        return {
          ...topic,
          initialPosts: topic.initialPosts.map((p) =>
            p.id === evaluatingPost.id
              ? {
                  ...p,
                  instructorFeedback: benchRulingText,
                  benchScore: numPoints,
                  awardedBadge: awardCounselBadge ? "Cyber Moot Court Counsel" : null,
                  ruledAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                }
              : p
          )
        };
      }
      return topic;
    });

    setCaseTopics(updatedTopics);
    saveCaseTopics(updatedTopics);

    // Update cohort roster classwork standing if student is enrolled
    setCohortRoster((prev) =>
      prev.map((c) =>
        evaluatingPost.authorName.includes(c.name) || c.name.includes(evaluatingPost.authorName)
          ? { ...c, cw: Math.min(100, Math.round((c.cw + numPoints) / 2)) }
          : c
      )
    );

    setEvaluatingPost(null);
    setBenchRulingText("");
  };

  const handlePostFacultyDirective = (e) => {
    e.preventDefault();
    if (!newFacultyDirective.trim()) return;

    const newDirectivePost = {
      id: `post-dir-${Date.now()}`,
      authorName: MOCK_ADMIN_DATA.instructor.name,
      authorRole: "Faculty Lead / Dean",
      timestamp: "Just now",
      content: newFacultyDirective,
      isFacultyDirective: true
    };

    const updatedTopics = caseTopics.map((topic) => {
      if (topic.id === selectedDocketId) {
        return {
          ...topic,
          initialPosts: [...topic.initialPosts, newDirectivePost]
        };
      }
      return topic;
    });

    setCaseTopics(updatedTopics);
    saveCaseTopics(updatedTopics);
    setNewFacultyDirective("");
  };

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
        graderName: "Atty. Cedrick G. Train"
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
      totalStudents: MOCK_ADMIN_DATA.stats.totalEnrolledStudents
    };
  }, [cohortRoster, gradeCurveOffset, submissionsList]);

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

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1E293B] flex flex-col md:flex-row font-sans selection:bg-[#002D62] selection:text-white">
      {/* 1. Deep Navy Collapsible Sidebar */}
      <aside
        className={`${
          sidebarCollapsed ? "md:w-20" : "md:w-64"
        } w-full bg-[#001F44] text-white flex flex-col justify-between shrink-0 md:h-screen md:sticky md:top-0 z-30 transition-all duration-300 ease-in-out shadow-lg`}
      >
        <div>
          {/* Logo Header & Collapse Toggle */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <Link href="/" className={`flex items-center gap-2.5 ${sidebarCollapsed ? "justify-center w-full" : ""}`}>
              <div className="h-8 w-8 rounded-lg bg-[#002D62] border border-[#C5A059]/40 text-[#C5A059] flex items-center justify-center shadow-sm shrink-0">
                <ShieldAlert className="h-4 w-4" />
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0">
                  <div className="font-bold text-white text-xs tracking-tight font-serif truncate">
                    FACULTY PORTAL
                  </div>
                  <div className="text-[10px] text-[#C5A059] font-mono truncate">CDI 409 Admin Suite</div>
                </div>
              )}
            </Link>

            {!sidebarCollapsed && (
              <button
                type="button"
                onClick={() => setSidebarCollapsed(true)}
                title="Collapse Sidebar"
                className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            )}
          </div>

          {sidebarCollapsed && (
            <div className="hidden md:flex justify-center p-2 border-b border-white/10">
              <button
                type="button"
                onClick={() => setSidebarCollapsed(false)}
                title="Expand Sidebar"
                className="p-1.5 rounded-lg text-[#C5A059] bg-white/5 hover:bg-white/10 transition-colors"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </button>
            </div>
          )}

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
          <nav className="p-2.5 space-y-1">
            {[
              { id: "overview", label: "Command Analytics", icon: BarChart3 },
              {
                id: "students",
                label: `Practicum Desk (${computedMetrics.pendingReviews})`,
                icon: Users
              },
              {
                id: "case-defense",
                label: `Moot Case Defense (${pendingBenchReviews})`,
                icon: Scale
              },
              { id: "chain-of-custody", label: "Chain of Custody (CoC)", icon: FileText },
              { id: "grade-curve", label: "Batch Gradebook & Curve", icon: Sliders },
              { id: "ched-transmittal", label: "CHED Form 9 & Transmittal", icon: FileSpreadsheet },
              { id: "curriculum-mgmt", label: "Curriculum & Units", icon: Layers },
              { id: "grading-matrix", label: "Syllabus Formula", icon: Award },
              { id: "outcomes", label: "CHED Outcomes", icon: GraduationCap }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    sidebarCollapsed ? "justify-center" : ""
                  } ${
                    isActive
                      ? "bg-[#002D62] text-white font-semibold shadow-xs border-l-2 border-[#C5A059]"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-[#C5A059]" : "text-slate-400"}`} />
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Instructor Profile Footer */}
        <div className="p-3 border-t border-white/10 bg-black/20">
          <div className={`flex items-center gap-2.5 ${sidebarCollapsed ? "justify-center" : ""}`}>
            <div className="h-8 w-8 rounded-lg bg-[#C5A059] flex items-center justify-center font-bold text-[#001F44] text-xs shrink-0 shadow-sm">
              CT
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate font-serif">{MOCK_ADMIN_DATA.instructor.name}</div>
                <div className="text-[10px] text-[#C5A059] font-mono truncate">Dean • Lead Faculty</div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* 2. Main Administration Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Minimal Header Bar */}
        <header className="h-14 border-b border-[#EAEAEA] bg-white px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="font-bold text-[#002D62] text-xs sm:text-sm font-serif">
              CDI 409 Faculty Administration & Grading Desk
            </span>
            <Badge className="bg-[#002D62]/10 text-[#002D62] border-[#002D62]/20 text-[10px] font-mono hidden md:inline-flex">
              Instructor Clearance
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/dashboard/student">
              <Button variant="outline" size="sm" className="text-xs h-8 border-[#E5E5E5] text-[#002D62] hover:bg-[#F8F9FA] rounded-lg">
                Student View
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-xs h-8 text-[#555] hover:text-[#002D62] rounded-lg">
                Home
              </Button>
            </Link>
          </div>
        </header>

        {/* Dynamic Section Workspace */}
        <div className="p-4 md:p-6 max-w-6xl mx-auto w-full flex-1 space-y-5">
          {/* SECTION 1: COMMAND ANALYTICS OVERVIEW */}
          {activeSection === "overview" && (
            <div className="space-y-5">
              {/* 4 Stat Cards Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                <Card className="p-4 bg-white border-[#E5E5E5] shadow-xs rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-[#777]">
                    <span className="text-[11px] font-medium font-mono">Enrolled Students</span>
                    <Users className="h-4 w-4 text-[#002D62]" />
                  </div>
                  <div className="text-xl font-bold text-[#002D62] font-mono">
                    {computedMetrics.totalStudents} <span className="text-xs text-[#888]">Students</span>
                  </div>
                  <div className="text-[10px] text-emerald-700 font-mono">2 Active Sections (A & B)</div>
                </Card>

                <Card className="p-4 bg-white border-[#E5E5E5] shadow-xs rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-[#777]">
                    <span className="text-[11px] font-medium font-mono">Pending Reviews</span>
                    <Clock className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="text-xl font-bold text-[#002D62] font-mono">
                    {computedMetrics.pendingReviews} <span className="text-xs text-[#888]">Submissions</span>
                  </div>
                  <div className="text-[10px] text-amber-700 font-mono">Needs Instructor Grading</div>
                </Card>

                <Card className="p-4 bg-white border-[#E5E5E5] shadow-xs rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-[#777]">
                    <span className="text-[11px] font-medium font-mono">Class Standing Mean</span>
                    <Award className="h-4 w-4 text-[#C5A059]" />
                  </div>
                  <div className="text-xl font-bold text-[#002D62] font-mono">
                    {computedMetrics.averageGrade}% <span className="text-xs text-[#888]">(1.50)</span>
                  </div>
                  <div className="text-[10px] text-emerald-700 font-mono">
                    Curved: {gradeCurveOffset > 0 ? `+${gradeCurveOffset}%` : "Standard"}
                  </div>
                </Card>

                <Card className="p-4 bg-white border-[#E5E5E5] shadow-xs rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-[#777]">
                    <span className="text-[11px] font-medium font-mono">OBE Passing Rate</span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="text-xl font-bold text-emerald-700 font-mono">
                    {computedMetrics.passingRate}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-mono">Section VIII Formula Met</div>
                </Card>
              </div>

              {/* Section Comparison & Recent Submissions Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Cohort Performance by Section (5 Columns) */}
                <div className="lg:col-span-5 space-y-4">
                  <Card className="bg-white border-[#E5E5E5] shadow-xs rounded-xl">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-bold text-[#002D62] font-serif">
                        Cohort Performance by Section
                      </CardTitle>
                      <CardDescription className="text-xs text-[#666]">
                        Academic performance across enrolled Criminology classes
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-2 space-y-3">
                      {MOCK_ADMIN_DATA.sections.map((sec) => (
                        <div key={sec.id} className="p-3 rounded-lg bg-[#F8F9FA] border border-[#EAEAEA] space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#002D62] font-serif">{sec.name}</span>
                            <span className="text-xs font-bold font-mono text-[#002D62]">
                              {(sec.averageGrade + gradeCurveOffset).toFixed(1)}% Average
                            </span>
                          </div>
                          <Progress
                            value={sec.averageGrade + gradeCurveOffset}
                            className="h-1.5 bg-[#E2E8F0] [&>div]:bg-[#002D62]"
                          />
                          <div className="flex items-center justify-between text-[10px] text-[#666] font-mono">
                            <span>{sec.count} Students</span>
                            <span>GPA Equiv: 1.50</span>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Program Outcome Mastery Summary */}
                  <Card className="bg-white border-[#E5E5E5] shadow-xs rounded-xl">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-bold text-[#002D62] font-serif">
                        Program Outcome (PO) Compliance
                      </CardTitle>
                      <CardDescription className="text-xs text-[#666]">
                        CHED Criminology standard outcome attainment
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-2 space-y-2">
                      {MOCK_ADMIN_DATA.outcomesPerformance.map((po) => (
                        <div key={po.code} className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8F9FA] border border-[#EAEAEA] text-xs">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-[#002D62] text-white font-mono text-[9px]">{po.code}</Badge>
                            <span className="font-medium text-[#1E293B] text-[11.5px]">{po.name}</span>
                          </div>
                          <span className="font-bold text-[#002D62] font-mono text-xs">{po.mastery}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Live Practicum Submissions Feed (7 Columns) */}
                <div className="lg:col-span-7 space-y-4">
                  <Card className="bg-white border-[#E5E5E5] shadow-xs rounded-xl">
                    <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                      <div>
                        <CardTitle className="text-sm font-bold text-[#002D62] font-serif">
                          Recent Student Lab Submissions
                        </CardTitle>
                        <CardDescription className="text-xs text-[#666]">
                          Live digital forensics & legal case practicum submissions
                        </CardDescription>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setActiveSection("students")}
                        className="text-xs h-7 border-[#E5E5E5] text-[#002D62] rounded-lg"
                      >
                        View All
                      </Button>
                    </CardHeader>
                    <CardContent className="p-4 pt-2 space-y-2.5">
                      {submissionsList.slice(0, 4).map((sub) => (
                        <div
                          key={sub.id}
                          className="p-3 rounded-lg bg-[#F8F9FA] border border-[#EAEAEA] space-y-1.5 hover:border-[#002D62]/40 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[#002D62] font-serif">{sub.studentName}</span>
                              <Badge variant="outline" className="text-[9px] font-mono border-[#E5E5E5] text-[#555]">
                                {sub.section}
                              </Badge>
                            </div>
                            <Badge
                              className={`text-[9.5px] font-mono ${
                                sub.status === "Graded"
                                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                  : "bg-amber-50 text-amber-800 border border-amber-200"
                              }`}
                            >
                              {sub.status}
                            </Badge>
                          </div>

                          <div className="text-xs text-[#1E293B] font-semibold">{sub.task}</div>
                          <div className="text-[11px] text-[#666] line-clamp-1">{sub.complianceNote}</div>

                          <div className="flex items-center justify-between pt-1.5 border-t border-[#EAEAEA] text-[10px] text-[#666] font-mono">
                            <span>{sub.submissionTime}</span>
                            <div className="flex items-center gap-2">
                              {sub.status === "Needs Review" ? (
                                <Button
                                  size="sm"
                                  onClick={() => setEvaluatingSubmission(sub)}
                                  className="h-6 text-[10.5px] bg-[#002D62] hover:bg-[#001F44] text-white px-2.5 rounded-md font-semibold"
                                >
                                  Grade Lab
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

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAEAEA] pb-3">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-lg font-bold text-[#002D62] font-serif flex items-center gap-2">
                      <Users className="h-5 w-5 text-[#C5A059]" />
                      Student Practicum Evaluator & Forensic Logs
                    </h2>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-[10px]">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live Sync Active
                    </span>
                  </div>
                  <p className="text-xs text-[#666] mt-0.5">
                    Evaluate laboratory evidence extractions, RAM capture reports, and RA 10175 legal briefs.
                  </p>
                </div>

                {/* Filters & Refresh */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => loadSubmissions(true)}
                    disabled={isLoadingSubmissions}
                    className="h-8 px-2.5 text-xs text-[#002D62] border-[#E5E5E5] rounded-lg hover:bg-[#F8F9FA] flex items-center gap-1.5 font-medium"
                    title="Refresh submissions from Supabase and cache"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 text-[#C5A059] ${isLoadingSubmissions ? "animate-spin" : ""}`} />
                    <span className="hidden sm:inline">Refresh</span>
                  </Button>

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
                      placeholder="Search student or task..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white border border-[#E5E5E5] text-xs text-[#1E293B] placeholder:text-[#888] focus:outline-none focus:border-[#002D62]"
                    />
                  </div>
                </div>
              </div>

              {/* Submissions Table / Cards */}
              <div className="grid grid-cols-1 gap-2.5">
                {filteredSubmissions.map((sub) => (
                  <Card key={sub.id} className="p-4 bg-white border-[#E5E5E5] shadow-xs rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#002D62] font-serif">{sub.studentName}</span>
                        <Badge variant="outline" className="text-[9px] font-mono border-[#E5E5E5]">
                          {sub.studentId}
                        </Badge>
                        <Badge className="bg-[#002D62]/10 text-[#002D62] border-[#002D62]/20 text-[9px] font-mono">
                          {sub.section}
                        </Badge>
                      </div>

                      <div className="text-xs font-semibold text-[#1E293B]">{sub.unit} • {sub.task}</div>
                      <p className="text-xs text-[#666]">{sub.complianceNote}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-xs font-bold font-mono text-[#002D62]">{sub.score}</div>
                        <div className="text-[9.5px] text-[#777] font-mono">{sub.submissionTime}</div>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenCocForSubmission(sub)}
                        className="text-xs h-7 px-2.5 rounded-lg border-[#CBD5E1] text-[#002D62] hover:bg-[#F1F5F9] flex items-center gap-1 font-semibold"
                        title="Generate Official Chain of Custody (CoC) form for this student"
                      >
                        <FileText className="h-3.5 w-3.5 text-[#C5A059]" />
                        <span>CoC Form</span>
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => {
                          setEvaluatingSubmission(sub);
                          setGradeInput(sub.grade || 90);
                          setFacultyFeedback(sub.complianceNote || "");
                        }}
                        className={`text-xs h-7 px-3 rounded-lg font-semibold ${
                          sub.status === "Needs Review"
                            ? "bg-[#002D62] hover:bg-[#001F44] text-white"
                            : "border border-[#E5E5E5] bg-white text-[#002D62] hover:bg-[#F8F9FA]"
                        }`}
                      >
                        {sub.status === "Needs Review" ? "Grade Lab" : "Update Mark"}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* SECTION: MOOT COURT CASE DEFENSE & JURISPRUDENCE EVALUATOR */}
          {activeSection === "case-defense" && (() => {
            const currentDocket = caseTopics.find((t) => t.id === selectedDocketId) || caseTopics[0];
            const docketPendingCount =
              currentDocket?.initialPosts?.filter((p) => !p.instructorFeedback && !p.isFacultyDirective).length || 0;
            const filteredDocketPosts = (currentDocket?.initialPosts || []).filter((p) => {
              const matchesSearch =
                !docketSearch.trim() ||
                p.authorName.toLowerCase().includes(docketSearch.toLowerCase()) ||
                p.content.toLowerCase().includes(docketSearch.toLowerCase());
              const matchesFilter =
                docketFilter === "all" ||
                (docketFilter === "pending" && !p.instructorFeedback && !p.isFacultyDirective) ||
                (docketFilter === "verified" && !!p.instructorFeedback);
              return matchesSearch && matchesFilter;
            });

            return (
              <div className="space-y-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAEAEA] pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-[#002D62] font-serif flex items-center gap-2">
                        <Scale className="h-5 w-5 text-[#C5A059]" />
                        Moot Case Defense & Legal Jurisprudence Evaluator
                      </h2>
                      <Badge className="bg-[#002D62] text-white text-[9.5px] font-mono">
                        OBE MILESTONE 8
                      </Badge>
                    </div>
                    <p className="text-xs text-[#666] mt-0.5">
                      Evaluate student statutory arguments, assess <em>mens rea</em> legal briefs under <strong>RA 10175</strong> and <strong>A.M. No. 17-11-03-SC</strong>, and issue binding faculty bench rulings.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-mono text-[11px] font-semibold">
                      <Gavel className="h-3.5 w-3.5 text-amber-600" />
                      {pendingBenchReviews} Pending Judicial Review
                    </span>
                  </div>
                </div>

                {/* 2-Column Docket Switcher */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {caseTopics.map((topic) => {
                    const isSelected = selectedDocketId === topic.id;
                    const pendingCount =
                      topic.initialPosts?.filter((p) => !p.instructorFeedback && !p.isFacultyDirective).length || 0;

                    return (
                      <Card
                        key={topic.id}
                        onClick={() => setSelectedDocketId(topic.id)}
                        className={`p-4 rounded-xl cursor-pointer transition-all border ${
                          isSelected
                            ? "bg-white border-[#002D62] ring-2 ring-[#002D62]/10 shadow-sm"
                            : "bg-[#F8F9FA] border-[#E5E5E5] hover:border-[#CBD5E1] hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <Badge
                            className={`text-[9.5px] font-mono ${
                              isSelected
                                ? "bg-[#002D62] text-white"
                                : "bg-[#002D62]/10 text-[#002D62] border-none"
                            }`}
                          >
                            Unit {topic.unitNumber} Moot Docket
                          </Badge>

                          {pendingCount > 0 ? (
                            <Badge className="bg-amber-100 text-amber-800 text-[9.5px] border-amber-200 font-mono">
                              {pendingCount} Awaiting Ruling
                            </Badge>
                          ) : (
                            <span className="text-[10px] text-emerald-700 font-mono font-semibold flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> All Ruled
                            </span>
                          )}
                        </div>

                        <h3 className="text-xs font-bold text-[#002D62] font-serif line-clamp-2 leading-snug">
                          {topic.title}
                        </h3>
                        <p className="text-[11px] text-[#666] mt-1.5 line-clamp-2 leading-relaxed">
                          {topic.synopsis}
                        </p>

                        <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-[#EAEAEA] text-[10.5px] text-[#777] font-mono">
                          <span>{topic.initialPosts?.length || 0} Filed Briefs</span>
                          <span className="text-[#002D62] font-semibold flex items-center gap-1">
                            {isSelected ? "Active Docket" : "Select Docket"} <ChevronRight className="h-3 w-3" />
                          </span>
                        </div>
                      </Card>
                    );
                  })}
                </div>

                {/* Selected Docket Legal Digest & Briefing Card */}
                <Card className="p-4 bg-white border-[#E5E5E5] rounded-xl shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#EAEAEA]">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-[#C5A059] uppercase tracking-wider block">
                        Landmark Case Docket Record • Unit {currentDocket.unitNumber}
                      </span>
                      <h3 className="text-sm font-bold text-[#002D62] font-serif">
                        {currentDocket.title}
                      </h3>
                    </div>
                    <Badge variant="outline" className="border-[#002D62]/20 text-[#002D62] font-mono text-[10px] self-start sm:self-auto">
                      {currentDocket.unitNumber === 3 ? "RA 10175 Sec. 4 & Sec. 5" : "SC A.M. No. 17-11-03-SC"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="md:col-span-2 space-y-2">
                      <div>
                        <span className="text-[10.5px] font-bold text-[#002D62] uppercase tracking-wider block font-mono">
                          Evidentiary Case Facts
                        </span>
                        <p className="text-xs text-[#444] leading-relaxed mt-0.5">
                          {currentDocket.synopsis}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-[#001F44]/5 border border-[#001F44]/10">
                        <span className="text-[10.5px] font-bold text-[#002D62] font-mono block">
                          Legal Moot Issue for Student Resolution:
                        </span>
                        <p className="text-[11.5px] text-[#333] italic mt-0.5">
                          "{currentDocket.prompt}"
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-[#F8F9FA] rounded-xl border border-[#EAEAEA] space-y-2 text-[11px]">
                      <span className="font-bold text-[#002D62] font-mono uppercase tracking-wider block text-[10px]">
                        Legal Doctrines in Issue
                      </span>
                      {currentDocket.unitNumber === 3 ? (
                        <ul className="space-y-1.5 text-[#555] list-disc pl-3.5">
                          <li><strong>Mens Rea vs Accidental Access</strong>: Event ID 1102 log clearing negates good faith.</li>
                          <li><strong>Sec. 4(a)(1) Illegal Access</strong>: Access without right / in excess of authority.</li>
                          <li><strong>Sec. 4(b)(1) Computer Forgery</strong>: Altering audit tables to induce legal reliance.</li>
                        </ul>
                      ) : (
                        <ul className="space-y-1.5 text-[#555] list-disc pl-3.5">
                          <li><strong>A.M. No. 17-11-03-SC Sec. 5.1</strong>: Probable cause for interception of live communications.</li>
                          <li><strong>Exhaustion Threshold</strong>: Standard search warrant is ineffective for volatile transient streams.</li>
                          <li><strong>Art. III Sec. 2 & 3</strong>: Warranted exceptions to privacy of communication.</li>
                        </ul>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#002D62] font-serif">Filed Student Briefs</span>
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {filteredDocketPosts.length} Shown
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center p-0.5 rounded-lg bg-[#F1F5F9] text-[11px]">
                      <button
                        onClick={() => setDocketFilter("all")}
                        className={`px-2.5 py-1 rounded-md transition-colors ${
                          docketFilter === "all"
                            ? "bg-white text-[#002D62] font-bold shadow-xs"
                            : "text-[#666] hover:text-[#002D62]"
                        }`}
                      >
                        All ({currentDocket.initialPosts?.length || 0})
                      </button>
                      <button
                        onClick={() => setDocketFilter("pending")}
                        className={`px-2.5 py-1 rounded-md transition-colors ${
                          docketFilter === "pending"
                            ? "bg-white text-amber-800 font-bold shadow-xs"
                            : "text-[#666] hover:text-[#002D62]"
                        }`}
                      >
                        Needs Ruling ({docketPendingCount})
                      </button>
                      <button
                        onClick={() => setDocketFilter("verified")}
                        className={`px-2.5 py-1 rounded-md transition-colors ${
                          docketFilter === "verified"
                            ? "bg-white text-emerald-800 font-bold shadow-xs"
                            : "text-[#666] hover:text-[#002D62]"
                        }`}
                      >
                        Bench Verified
                      </button>
                    </div>

                    <div className="relative w-44 sm:w-56">
                      <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#777]" />
                      <input
                        type="text"
                        value={docketSearch}
                        onChange={(e) => setDocketSearch(e.target.value)}
                        placeholder="Search student or brief..."
                        className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white border border-[#E5E5E5] text-xs text-[#1E293B] placeholder:text-[#888] focus:outline-none focus:border-[#002D62]"
                      />
                    </div>
                  </div>
                </div>

                {/* Student Legal Briefs Feed */}
                <div className="space-y-3">
                  {filteredDocketPosts.map((post) => {
                    const isFaculty = post.isFacultyDirective || post.authorRole?.includes("Faculty");
                    const hasRuling = !!post.instructorFeedback;

                    if (isFaculty) {
                      return (
                        <Card key={post.id} className="p-4 bg-[#001F44] text-white border-none rounded-xl shadow-xs space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-md bg-[#C5A059] text-[#001F44] font-bold flex items-center justify-center text-[10px]">
                                <Gavel className="h-3.5 w-3.5" />
                              </div>
                              <span className="font-bold font-serif text-[#C5A059]">{post.authorName}</span>
                              <Badge className="bg-white/10 text-white text-[9.5px] border-none font-mono">
                                Official Faculty Directive
                              </Badge>
                            </div>
                            <span className="text-[10px] text-slate-300 font-mono">{post.timestamp}</span>
                          </div>
                          <p className="text-xs text-slate-200 leading-relaxed italic pl-8">
                            "{post.content}"
                          </p>
                        </Card>
                      );
                    }

                    return (
                      <Card
                        key={post.id}
                        className={`p-4 bg-white rounded-xl shadow-xs transition-all border ${
                          hasRuling ? "border-[#E5E5E5]" : "border-amber-200/80 bg-amber-50/10"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-[#002D62] font-serif">
                                {post.authorName}
                              </span>
                              <Badge variant="outline" className="text-[9.5px] font-mono border-[#E5E5E5]">
                                {post.authorRole}
                              </Badge>

                              {hasRuling ? (
                                <Badge className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9.5px] font-mono flex items-center gap-1">
                                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                  Bench Verified ({post.benchScore || 95}%)
                                </Badge>
                              ) : (
                                <Badge className="bg-amber-50 text-amber-800 border border-amber-200 text-[9.5px] font-mono">
                                  Needs Judicial Review
                                </Badge>
                              )}
                            </div>

                            <p className="text-xs text-[#222] leading-relaxed pt-1">
                              {post.content}
                            </p>

                            {/* Official Faculty Bench Ruling Quote Box */}
                            {hasRuling && (
                              <div className="mt-3 p-3 rounded-lg bg-[#FAF8F5] border border-[#C5A059]/40 space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold text-[#002D62] font-mono uppercase tracking-wider flex items-center gap-1">
                                    <Gavel className="h-3 w-3 text-[#C5A059]" />
                                    Faculty Bench Assessment & Jurisprudence Ruling:
                                  </span>
                                  {post.ruledAt && (
                                    <span className="text-[9.5px] text-[#777] font-mono">Ruled {post.ruledAt}</span>
                                  )}
                                </div>
                                <p className="text-xs text-[#333] italic">
                                  "{post.instructorFeedback}"
                                </p>
                                <div className="flex items-center gap-2 pt-1">
                                  <Badge className="bg-[#002D62] text-white text-[9px] font-mono">
                                    ⚖️ Cyber Moot Court Counsel Badge Awarded
                                  </Badge>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-none border-[#EAEAEA]">
                            <span className="text-[10px] text-[#777] font-mono">{post.timestamp}</span>

                            <Button
                              size="sm"
                              onClick={() => handleOpenBenchRuling(post)}
                              className={`text-xs h-7 px-3 rounded-lg font-semibold flex items-center gap-1.5 ${
                                hasRuling
                                  ? "border border-[#E5E5E5] bg-white text-[#002D62] hover:bg-[#F8F9FA]"
                                  : "bg-[#002D62] hover:bg-[#001F44] text-white shadow-xs"
                              }`}
                            >
                              <Gavel className="h-3 w-3 text-[#C5A059]" />
                              <span>{hasRuling ? "Amend Ruling" : "Issue Bench Ruling"}</span>
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}

                  {filteredDocketPosts.length === 0 && (
                    <div className="p-8 text-center bg-white rounded-xl border border-[#E5E5E5] text-xs text-[#777]">
                      No student briefs match the selected filter or search term.
                    </div>
                  )}
                </div>

                {/* Faculty Directive Submission Box */}
                <Card className="p-4 bg-[#F8F9FA] border border-[#E5E5E5] rounded-xl space-y-2.5">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-[#002D62]" />
                    <span className="text-xs font-bold text-[#002D62] font-serif">
                      Broadcast Faculty Bench Directive to this Docket
                    </span>
                  </div>
                  <p className="text-[11px] text-[#666]">
                    Post binding legal instructions or guidance to all students defending in <em>{currentDocket.title}</em>.
                  </p>

                  <form onSubmit={handlePostFacultyDirective} className="space-y-2">
                    <textarea
                      rows={2}
                      value={newFacultyDirective}
                      onChange={(e) => setNewFacultyDirective(e.target.value)}
                      placeholder="e.g. Students are instructed to distinguish between Section 4(a)(1) illegal access and Section 4(b)(1) computer forgery regarding the bank database manipulation..."
                      className="w-full p-2.5 rounded-lg border border-[#CBD5E1] bg-white text-xs text-[#1E293B] focus:outline-none focus:border-[#002D62] leading-relaxed resize-none"
                    />
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        size="sm"
                        disabled={!newFacultyDirective.trim()}
                        className="bg-[#002D62] hover:bg-[#001F44] text-white text-xs h-8 px-4 rounded-lg font-semibold flex items-center gap-1.5"
                      >
                        <Send className="h-3.5 w-3.5 text-[#C5A059]" />
                        <span>Publish Bench Directive</span>
                      </Button>
                    </div>
                  </form>
                </Card>
              </div>
            );
          })()}

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
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200">
                                PASSED
                              </span>
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
                          {MOCK_ADMIN_DATA.instructor.name}
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
                          Atty. Cedrick G. Train
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
                            ATTY. CEDRICK G. TRAIN<br/>Dean, College of Criminal Justice Education
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
                          ATTY. CEDRICK G. TRAIN
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
                    Dynamic Syllabus & Unit Editor (CDI 409)
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

          {/* SECTION 5: CHED PROGRAM OUTCOMES */}
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {COURSE_INFO.programOutcomes.map((po) => (
                  <Card key={po.id} className="p-4 bg-white border-[#E5E5E5] shadow-xs rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-[#002D62] text-white font-mono text-[9.5px]">{po.id}</Badge>
                      <span className="text-[10px] text-emerald-700 font-mono font-semibold">92% Attainment</span>
                    </div>
                    <h3 className="text-xs font-bold text-[#002D62] font-serif">{po.title}</h3>
                    <p className="text-xs text-[#555] leading-relaxed">{po.description}</p>
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

      {/* Bench Ruling Evaluation Modal */}
      {evaluatingPost && (
        <Dialog open={!!evaluatingPost} onOpenChange={() => setEvaluatingPost(null)}>
          <DialogContent className="sm:max-w-lg bg-white text-[#1E293B] border-[#E5E5E5] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-[#002D62] font-serif flex items-center gap-2">
                <Scale className="h-4 w-4 text-[#C5A059]" />
                Issue Faculty Bench Ruling & Legal Evaluation
              </DialogTitle>
              <DialogDescription className="text-xs text-[#666]">
                Evaluate moot court statutory reasoning, record faculty comments, and award competency points.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              {/* Student Argument Preview */}
              <div className="p-3 rounded-xl bg-[#F8F9FA] border border-[#EAEAEA] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#002D62] font-serif">{evaluatingPost.authorName}</span>
                  <Badge variant="outline" className="text-[9.5px] font-mono border-[#CBD5E1]">
                    {evaluatingPost.authorRole}
                  </Badge>
                </div>
                <p className="text-[11.5px] text-[#333] leading-relaxed italic max-h-28 overflow-y-auto pt-1">
                  "{evaluatingPost.content}"
                </p>
              </div>

              {/* Quick Legal Rationale Suggestions */}
              <div>
                <label className="text-[10.5px] font-bold text-[#002D62] font-mono block mb-1">
                  Quick Legal Jurisprudence Templates:
                </label>
                <div className="flex flex-wrap gap-1">
                  {[
                    "Accurate invocation of mens rea and Event ID 1102 log wiping. +15 OBE points.",
                    "Proper application of A.M. No. 17-11-03-SC WICT probable cause threshold. +15 OBE points.",
                    "Sound distinction between accidental connectivity and malicious access under Sec. 4(a)(1).",
                    "Evidentiary chain of custody upheld. Exemplary jurisprudence brief."
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setBenchRulingText(preset)}
                      className="px-2 py-0.5 rounded text-[10px] bg-[#F1F5F9] hover:bg-[#002D62] hover:text-white text-[#475569] transition-colors border border-[#CBD5E1] text-left truncate max-w-full"
                    >
                      + {preset.slice(0, 42)}...
                    </button>
                  ))}
                </div>
              </div>

              {/* Bench Ruling Textarea */}
              <div>
                <label className="text-xs font-bold text-[#002D62] block mb-1">
                  Official Bench Ruling & Legal Critique:
                </label>
                <textarea
                  rows={3}
                  value={benchRulingText}
                  onChange={(e) => setBenchRulingText(e.target.value)}
                  placeholder="Enter judicial assessment and constructive feedback..."
                  className="w-full p-2.5 rounded-xl border border-[#CBD5E1] text-xs text-[#1E293B] focus:outline-none focus:border-[#002D62] leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs font-bold text-[#002D62] block mb-1">
                    OBE Practicum Score (0 - 100%):
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={benchPoints}
                    onChange={(e) => setBenchPoints(e.target.value)}
                    className="w-full p-2 rounded-xl border border-[#CBD5E1] font-mono text-sm font-bold text-[#002D62] focus:outline-none focus:border-[#002D62]"
                  />
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="awardBadge"
                    checked={awardCounselBadge}
                    onChange={(e) => setAwardCounselBadge(e.target.checked)}
                    className="h-4 w-4 rounded text-[#002D62] focus:ring-[#002D62]"
                  />
                  <label htmlFor="awardBadge" className="text-[11px] font-semibold text-[#002D62] cursor-pointer">
                    Award ⚖️ Cyber Moot Court Counsel Badge
                  </label>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEvaluatingPost(null)}
                className="text-xs border-[#E5E5E5] rounded-xl"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveBenchRuling}
                disabled={!benchRulingText.trim()}
                className="bg-[#002D62] hover:bg-[#001F44] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5"
              >
                <Gavel className="h-3.5 w-3.5 text-[#C5A059]" />
                <span>Record Official Bench Ruling</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

