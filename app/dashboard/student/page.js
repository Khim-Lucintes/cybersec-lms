"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  Layers,
  Terminal,
  Scale,
  BarChart3,
  GraduationCap,
  BookOpen,
  Cpu,
  Binary,
  TreePine,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Search,
  Laptop,
  Check,
  FileText,
  Clock,
  LogOut,
  Award,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  HelpCircle,
  FolderOpen,
  MessageSquare,
  Send,
  UserCheck,
  Medal,
  Lock,
  Gavel,
  BookMarked,
  Lightbulb,
  Timer,
  Info,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  LayoutDashboard,
  Flame,
  FileSpreadsheet,
  AlertTriangle,
  Network,
  Radio,
  Wifi,
  Filter as FilterIcon,
  MapPin,
  Compass,
  Globe
} from "lucide-react";
import { COURSE_INFO, SYLLABUS_MODULES, MOCK_STUDENT_PROFILE, getSavedModules, fetchDynamicModules } from "@/lib/curriculum";
import { LAB_DATA } from "@/lib/labData";
import { CASE_DEFENSE_TOPICS, getSavedCaseTopics, saveCaseTopics } from "@/lib/discussionData";
import { BADGES_DATA } from "@/lib/badgeData";
import { JURISPRUDENCE_CASES } from "@/lib/jurisprudenceData";
import { SYLLABUS_QUIZZES } from "@/lib/quizData";
import { LESSON_DETAILS } from "@/lib/lessonDetails";
import { PCAP_SAMPLE_PACKETS, PCAP_FILTER_RULES } from "@/lib/networkPcapData";
import { CARAGA_HOTSPOTS, GIS_REGIONAL_STATS } from "@/lib/greenGisData";
import { LessonAudioPlayer } from "@/components/LessonAudioPlayer";
import { ForensicSkeletonLoader } from "@/components/RouteLoadingBar";
import { supabase } from "@/lib/supabaseClient";
import { submitPracticumLab } from "@/lib/practicumService";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function StudentDashboard() {
  const router = useRouter();

  // Profile & Loading state
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(MOCK_STUDENT_PROFILE);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [practicumNotice, setPracticumNotice] = useState(null);

  // Sidebar Collapse / Toggle State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Navigation
  const [syllabusModules, setSyllabusModules] = useState(SYLLABUS_MODULES);
  const [navSection, setNavSection] = useState("overview");
  const [selectedModule, setSelectedModule] = useState(SYLLABUS_MODULES[1]);
  const [activeTab, setActiveTab] = useState("overview");
  const [moduleSearch, setModuleSearch] = useState("");

  // Lab Hints State
  const [showLabHint, setShowLabHint] = useState(false);

  // Jurisprudence Search & Category Filter
  const [jurisSearch, setJurisSearch] = useState("");
  const [selectedJurisCategory, setSelectedJurisCategory] = useState("All");

  // === Dynamic State for ALL 8 Crime Labs ===
  // Lab 1 (Threat Vectors)
  const [investigatedThreats, setInvestigatedThreats] = useState({});

  // Lab 2 (Hardware Disassembly)
  const [extractedComponents, setExtractedComponents] = useState([]);
  const [labFeedback, setLabFeedback] = useState(null);

  // Lab 3 (RA 10175 Charges)
  const [selectedCharges, setSelectedCharges] = useState({});
  const [chargeFeedbacks, setChargeFeedbacks] = useState({});

  // Lab 4 (RAM Hex / String Searcher)
  const [hexQuery, setHexQuery] = useState("");
  const [discoveredMemoryStrings, setDiscoveredMemoryStrings] = useState([]);
  const [ramLabFeedback, setRamLabFeedback] = useState(null);

  // Lab 5 (Investigative Action Plan Checklist)
  const [completedPlanSteps, setCompletedPlanSteps] = useState({});

  // Network PCAP & Wireshark Analyzer State
  const [selectedPcapFrame, setSelectedPcapFrame] = useState(PCAP_SAMPLE_PACKETS[4]); // Defaults to credential frame
  const [pcapFilter, setPcapFilter] = useState("All");
  const [extractedPcapArtifacts, setExtractedPcapArtifacts] = useState({});

  // Green Forensics GIS Hotspot Tracker State
  const [selectedGisHotspot, setSelectedGisHotspot] = useState(CARAGA_HOTSPOTS[0]);
  const [gisFilterProvince, setGisFilterProvince] = useState("All");

  // Lab 6 (USBSTOR Registry Artifacts)
  const [examinedArtifacts, setExaminedArtifacts] = useState({});

  // Lab 7 (Cybercrime Warrant Matching)
  const [warrantMatches, setWarrantMatches] = useState({});

  // Lab 8 (Green Forensics Contraband Analysis)
  const [analyzedGreenCases, setAnalyzedGreenCases] = useState({});

  // Case Defense State
  const [caseTopics, setCaseTopics] = useState(CASE_DEFENSE_TOPICS);
  const [selectedCaseDef, setSelectedCaseDef] = useState(CASE_DEFENSE_TOPICS[0]);
  const [newDefenseArgument, setNewDefenseArgument] = useState("");
  const [hasSubmittedDefense, setHasSubmittedDefense] = useState(false);

  // Quiz State & Timer
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState({});
  const [quizTimerSeconds, setQuizTimerSeconds] = useState(60);

  // Completed Modules Tracker
  const [completedModules, setCompletedModules] = useState({
    "lesson-1": false,
    "lesson-2": false,
    "lesson-3": false,
    "lesson-4": false,
    "lesson-5": false,
    "lesson-6": false,
    "lesson-7": false,
    "lesson-8": false,
  });

  // Quiz Timer Countdown Effect
  useEffect(() => {
    let interval = null;
    if (activeTab === "assessment" && quizTimerSeconds > 0) {
      interval = setInterval(() => {
        setQuizTimerSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTab, quizTimerSeconds]);

  // Dynamic Unlocked Badges Engine
  const isBadgeUnlocked = (badgeId) => {
    if (badgeId === "badge-volatility") return completedModules["lesson-2"] || extractedComponents.length === 5;
    if (badgeId === "badge-hex-hunter") return completedModules["lesson-4"] || discoveredMemoryStrings.length >= 3;
    if (badgeId === "badge-warrant-master") return completedModules["lesson-7"] || Object.keys(warrantMatches).length >= 4;
    if (badgeId === "badge-green-defender") return completedModules["lesson-8"] || Object.keys(analyzedGreenCases).length >= 2;
    if (badgeId === "badge-moot-defender") return hasSubmittedDefense;
    return false;
  };

  const unlockedBadgesCount = BADGES_DATA.filter((b) => isBadgeUnlocked(b.id)).length;
  const totalStudentPoints = BADGES_DATA.filter((b) => isBadgeUnlocked(b.id)).reduce((acc, b) => acc + b.points, 100);

  const completedCount = Object.values(completedModules).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / (syllabusModules.length || 1)) * 100);

  // Dynamic Grade Computation (Section VIII OBE Formula: 60% Summative + 40% Classwork)
  const dynamicGrades = React.useMemo(() => {
    // Classwork is computed dynamically from completed labs, quizzes, and moot court
    const baseClasswork = 80;
    const labBonus = Math.min(15, completedCount * 2.5);
    const badgeBonus = Math.min(5, unlockedBadgesCount * 1.0);
    const computedClasswork = Math.min(100, baseClasswork + labBonus + badgeBonus);

    const prelimExam = 90;
    const midtermExam = 88 + (completedModules["lesson-4"] ? 4 : 0);
    const semiFinalExam = 90 + (completedModules["lesson-6"] ? 3 : 0);
    const finalExam = 92 + (completedModules["lesson-8"] ? 3 : 0);

    const summativeMidtermMean = (prelimExam + midtermExam) / 2;
    const summativeFinalMean = (semiFinalExam + finalExam) / 2;

    const midtermGrade = (summativeMidtermMean * 0.60) + (computedClasswork * 0.40);
    const tentativeFinal = (summativeFinalMean * 0.60) + (computedClasswork * 0.40);
    const finalComputedGrade = Number(((midtermGrade + (2 * tentativeFinal)) / 3).toFixed(2));

    const gpaEquivalent =
      finalComputedGrade >= 97 ? "1.00 (97-100%)" :
      finalComputedGrade >= 94 ? "1.25 (94-96%)" :
      finalComputedGrade >= 91 ? "1.50 (91-93%)" :
      finalComputedGrade >= 88 ? "1.75 (88-90%)" :
      finalComputedGrade >= 85 ? "2.00 (85-87%)" :
      finalComputedGrade >= 75 ? "3.00 (75-84%)" : "5.00 (Failed)";

    return {
      prelims: prelimExam,
      midterms: midtermExam,
      semiFinals: semiFinalExam,
      finals: finalExam,
      classwork: Number(computedClasswork.toFixed(1)),
      midtermGrade: Number(midtermGrade.toFixed(2)),
      tentativeFinal: Number(tentativeFinal.toFixed(2)),
      finalGrade: finalComputedGrade,
      gpa: gpaEquivalent,
      isPassed: finalComputedGrade >= 75.0,
    };
  }, [completedCount, unlockedBadgesCount, completedModules]);

  // 1. Initial Session & Saved Progress Loader (Runs once on mount)
  useEffect(() => {
    async function loadUserSession() {
      try {
        if (typeof window !== "undefined") {
          const storedStudent = localStorage.getItem("student_profile");
          if (storedStudent) {
            const parsed = JSON.parse(storedStudent);
            setUserProfile((prev) => ({
              ...prev,
              name: parsed.name || prev.name,
              id: parsed.studentId || prev.id,
            }));
          }

          const savedCompleted = localStorage.getItem("student_completed_modules");
          if (savedCompleted) {
            try {
              setCompletedModules(JSON.parse(savedCompleted));
            } catch (e) {}
          }

          const savedTopics = getSavedCaseTopics();
          setCaseTopics(savedTopics);
          if (savedTopics.length > 0) {
            setSelectedCaseDef(savedTopics[0]);
          }
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setCurrentUser(session.user);
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (profile) {
            setUserProfile((prev) => ({
              ...prev,
              id: profile.student_or_faculty_id || prev.id,
              name: profile.full_name || prev.name,
              program: profile.program || prev.program,
              yearLevel: profile.year_level || prev.yearLevel,
              section: profile.section || prev.section,
              institution: "Father Saturnino Urios University",
            }));
          }
        }
      } catch (err) {
        console.warn("Session check notice:", err.message);
      } finally {
        setIsPageLoading(false);
      }
    }
    loadUserSession();

    // Fetch dynamic syllabus modules instead of static local ones
    fetchDynamicModules().then((initialModules) => {
      setSyllabusModules(initialModules);
      setSelectedModule((prev) => initialModules.find((m) => m.id === prev?.id) || initialModules[0]);
    });

    const handleTopicsUpdate = (e) => {
      if (e.detail) {
        setCaseTopics(e.detail);
        setSelectedCaseDef((prev) => e.detail.find((t) => t.id === prev?.id) || e.detail[0]);
      }
    };

    const handleCurriculumUpdate = (e) => {
      if (e.detail && Array.isArray(e.detail)) {
        setSyllabusModules(e.detail);
        setSelectedModule((prev) => e.detail.find((m) => m.id === prev?.id) || e.detail[0]);
      }
    };

    window.addEventListener("cdi409_case_topics_updated", handleTopicsUpdate);
    window.addEventListener("cdi409_curriculum_updated", handleCurriculumUpdate);
    return () => {
      window.removeEventListener("cdi409_case_topics_updated", handleTopicsUpdate);
      window.removeEventListener("cdi409_curriculum_updated", handleCurriculumUpdate);
    };
  }, []);

  // 2. Dynamic Profile Grade Sync (Updates when completed count changes without triggering network loops)
  useEffect(() => {
    setUserProfile((prev) => ({
      ...prev,
      completedLessons: completedCount,
      currentGpa: dynamicGrades.gpa,
      grades: dynamicGrades,
    }));
  }, [completedCount, dynamicGrades]);

  // 3. Persist completedModules to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("student_completed_modules", JSON.stringify(completedModules));
    }
  }, [completedModules]);

  const handleLogout = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("student_profile");
    }
    await supabase.auth.signOut();
    router.push("/");
  };

  // Lab 1: Threat Vector Investigation
  const handleInvestigateThreat = (scnId) => {
    const next = { ...investigatedThreats, [scnId]: true };
    setInvestigatedThreats(next);
    if (Object.keys(next).length >= 3) {
      setCompletedModules((prev) => ({ ...prev, "lesson-1": true }));
      submitPracticumLab({
        studentId: currentUser?.id,
        studentName: userProfile.name,
        studentIdNumber: userProfile.id,
        section: userProfile.section,
        unit: "Unit 1: Overview of Cybercrime",
        task: "Phishing Vector Triage & Log Analysis",
        complianceNote: "Identified and classified 3 critical cybercrime threat vectors.",
        evidencePayload: { verifiedThreats: Object.keys(next) }
      });
      setPracticumNotice("Unit 1 Practicum evidence submitted to Faculty Desk!");
      setTimeout(() => setPracticumNotice(null), 4000);
    }
  };

  // Lab 2: Disassembly Order
  const handleExtractComponent = (comp) => {
    if (extractedComponents.some((c) => c.id === comp.id)) return;
    const nextOrder = extractedComponents.length + 1;
    const isCorrectOrder = comp.correctOrder === nextOrder;
    const newExtracted = [...extractedComponents, { ...comp, extractedOrder: nextOrder, isCorrectOrder }];
    setExtractedComponents(newExtracted);

    if (newExtracted.length === 5) {
      const allCorrect = newExtracted.every((c) => c.isCorrectOrder);
      if (allCorrect) {
        setLabFeedback({
          success: true,
          message: "Order of Volatility strictly followed. 'Volatile Memory Specialist' Badge UNLOCKED!"
        });
        setCompletedModules((prev) => ({ ...prev, "lesson-2": true }));
        submitPracticumLab({
          studentId: currentUser?.id,
          studentName: userProfile.name,
          studentIdNumber: userProfile.id,
          section: userProfile.section,
          unit: "Unit 2: Computer Hardware & Volatility",
          task: "RAM & NVMe Hardware Disassembly Lab",
          complianceNote: "Order of Volatility strictly followed. Static mat used.",
          evidencePayload: {
            extractedOrder: newExtracted.map((c) => ({ name: c.name, order: c.extractedOrder, correct: c.isCorrectOrder }))
          }
        });
        setPracticumNotice("Unit 2 Hardware Disassembly practicum submitted to Faculty Desk!");
        setTimeout(() => setPracticumNotice(null), 4000);
      } else {
        setLabFeedback({
          success: false,
          message: "Order of Volatility violated! RAM or volatile data was risked."
        });
      }
    }
  };

  const resetHardwareLab = () => {
    setExtractedComponents([]);
    setLabFeedback(null);
    setShowLabHint(false);
  };

  // Lab 3: Charge Formulation
  const handleSelectCharge = (caseId, charge) => {
    setSelectedCharges((prev) => ({ ...prev, [caseId]: charge }));
    const nextCharges = { ...selectedCharges, [caseId]: charge };
    if (Object.keys(nextCharges).length >= 3) {
      setCompletedModules((prev) => ({ ...prev, "lesson-3": true }));
      submitPracticumLab({
        studentId: currentUser?.id,
        studentName: userProfile.name,
        studentIdNumber: userProfile.id,
        section: userProfile.section,
        unit: "Unit 3: RA 10175 Offenses",
        task: "Cybercrime Legal Charge Formulation Lab",
        complianceNote: "RA 10175 Section 4 offenses correctly charged across 3 case scenarios.",
        evidencePayload: { chargesFormulated: nextCharges }
      });
      setPracticumNotice("Unit 3 Legal Charge practicum submitted to Faculty Desk!");
      setTimeout(() => setPracticumNotice(null), 4000);
    }
  };

  // Lab 4: Memory Hex Search
  const handleSearchMemory = (e) => {
    e.preventDefault();
    if (!hexQuery.trim()) return;

    const matched = LAB_DATA["lab-4"].targetStrings.find((t) =>
      t.keyword.toLowerCase().includes(hexQuery.toLowerCase()) ||
      t.foundContent.toLowerCase().includes(hexQuery.toLowerCase()) ||
      t.evidenceType.toLowerCase().includes(hexQuery.toLowerCase())
    );

    if (matched && !discoveredMemoryStrings.some((d) => d.id === matched.id)) {
      const nextList = [...discoveredMemoryStrings, matched];
      setDiscoveredMemoryStrings(nextList);
      if (nextList.length >= 3) {
        setRamLabFeedback({
          success: true,
          message: "Forensic Extraction Complete! 'RAM String & Hex Hunter' Badge UNLOCKED!"
        });
        setCompletedModules((prev) => ({ ...prev, "lesson-4": true }));
        submitPracticumLab({
          studentId: currentUser?.id,
          studentName: userProfile.name,
          studentIdNumber: userProfile.id,
          section: userProfile.section,
          unit: "Unit 4: RAM Hex Dump & Strings",
          task: "memdump.raw Physical Memory String Extraction",
          complianceNote: "Located plaintext password credentials and BitLocker recovery key.",
          evidencePayload: { extractedStrings: nextList.map((s) => s.foundContent) }
        });
        setPracticumNotice("Unit 4 RAM Memory Extraction practicum submitted to Faculty Desk!");
        setTimeout(() => setPracticumNotice(null), 4000);
      }
    }
    setHexQuery("");
  };

  // Lab 5: Action Plan Step Toggle
  const handleTogglePlanStep = (stepNumber) => {
    const next = { ...completedPlanSteps, [stepNumber]: !completedPlanSteps[stepNumber] };
    setCompletedPlanSteps(next);
    const checkedCount = Object.values(next).filter(Boolean).length;
    if (checkedCount >= 5) {
      setCompletedModules((prev) => ({ ...prev, "lesson-5": true }));
      submitPracticumLab({
        studentId: currentUser?.id,
        studentName: userProfile.name,
        studentIdNumber: userProfile.id,
        section: userProfile.section,
        unit: "Unit 5: ISO/IEC 27037 Plan",
        task: "Digital Forensics Action Plan Checklist",
        complianceNote: "Complete 5-phase forensic action plan developed according to ISO standards.",
        evidencePayload: { planStepsChecked: checkedCount }
      });
      setPracticumNotice("Unit 5 Forensics Action Plan submitted to Faculty Desk!");
      setTimeout(() => setPracticumNotice(null), 4000);
    }
  };

  // Lab 6: USB Registry Artifact Examination
  const handleExamineArtifact = (artId) => {
    const next = { ...examinedArtifacts, [artId]: true };
    setExaminedArtifacts(next);
    if (Object.keys(next).length >= 4) {
      setCompletedModules((prev) => ({ ...prev, "lesson-6": true }));
      submitPracticumLab({
        studentId: currentUser?.id,
        studentName: userProfile.name,
        studentIdNumber: userProfile.id,
        section: userProfile.section,
        unit: "Unit 6: Windows Registry Forensics",
        task: "USBSTOR & Event ID 1102 Timeline Report",
        complianceNote: "USB connection timeline and security event log audit verified.",
        evidencePayload: { artifactsAnalyzed: Object.keys(next) }
      });
      setPracticumNotice("Unit 6 Forensic Artifact practicum submitted to Faculty Desk!");
      setTimeout(() => setPracticumNotice(null), 4000);
    }
  };

  // Lab 7: Warrant Evaluation
  const handleMatchWarrant = (warrantCode) => {
    const next = { ...warrantMatches, [warrantCode]: true };
    setWarrantMatches(next);
    if (Object.keys(next).length >= 4) {
      setCompletedModules((prev) => ({ ...prev, "lesson-7": true }));
      submitPracticumLab({
        studentId: currentUser?.id,
        studentName: userProfile.name,
        studentIdNumber: userProfile.id,
        section: userProfile.section,
        unit: "Unit 7: Cybercrime Warrants",
        task: "Supreme Court Warrant Matching Lab (A.M. 17-11-03-SC)",
        complianceNote: "Correctly mapped WSCD, WDCD, WICT, and WECD judicial issuances.",
        evidencePayload: { warrantsMatched: Object.keys(next) }
      });
      setPracticumNotice("Unit 7 Warrant Evaluation practicum submitted to Faculty Desk!");
      setTimeout(() => setPracticumNotice(null), 4000);
    }
  };

  // Lab 8: Green Contraband Verification
  const handleConfirmGreenAnalysis = (caseItem) => {
    const next = { ...analyzedGreenCases, [caseItem.id]: true };
    setAnalyzedGreenCases(next);
    if (Object.keys(next).length >= 3) {
      setCompletedModules((prev) => ({ ...prev, "lesson-8": true }));
      submitPracticumLab({
        studentId: currentUser?.id,
        studentName: userProfile.name,
        studentIdNumber: userProfile.id,
        section: userProfile.section,
        unit: "Unit 8: Green Forensics",
        task: "Pangolin Contraband & Timber Morphology Lab",
        complianceNote: "Classified CITES Appendix I wildlife specimen and timber morphology.",
        evidencePayload: { casesAnalyzed: Object.keys(next) }
      });
      setPracticumNotice("Unit 8 Green Forensics practicum submitted to Faculty Desk!");
      setTimeout(() => setPracticumNotice(null), 4000);
    }
  };

  // Submit Case Defense Argument
  const handleSubmitDefense = (e) => {
    e.preventDefault();
    if (!newDefenseArgument.trim()) return;

    const newPost = {
      id: `post-${Date.now()}`,
      authorName: userProfile.name,
      authorRole: `Student (${userProfile.section})`,
      timestamp: "Just now",
      content: newDefenseArgument,
      instructorFeedback: "Submission logged for faculty review. 'Cyber Moot Court Counsel' Badge UNLOCKED!"
    };

    const updatedTopics = caseTopics.map((t) => {
      if (t.id === selectedCaseDef.id) {
        return { ...t, initialPosts: [...t.initialPosts, newPost] };
      }
      return t;
    });

    setCaseTopics(updatedTopics);
    saveCaseTopics(updatedTopics);
    setSelectedCaseDef((prev) => ({
      ...prev,
      initialPosts: [...prev.initialPosts, newPost]
    }));
    setNewDefenseArgument("");
    setHasSubmittedDefense(true);

    submitPracticumLab({
      studentId: currentUser?.id,
      studentName: userProfile.name,
      studentIdNumber: userProfile.id,
      section: userProfile.section,
      unit: selectedCaseDef.title || "Case Defense Brief",
      task: "Legal Jurisprudence Moot Court Defense",
      complianceNote: newDefenseArgument.slice(0, 100) + "...",
      evidencePayload: { fullArgument: newDefenseArgument }
    });
    setPracticumNotice("Case Defense Docket submitted to Faculty Desk for review!");
    setTimeout(() => setPracticumNotice(null), 4000);
  };

  const filteredModules = syllabusModules.filter(
    (m) =>
      m.title.toLowerCase().includes(moduleSearch.toLowerCase()) ||
      m.period.toLowerCase().includes(moduleSearch.toLowerCase()) ||
      m.topics.some((t) => t.toLowerCase().includes(moduleSearch.toLowerCase()))
  );

  const filteredJurisprudence = JURISPRUDENCE_CASES.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(jurisSearch.toLowerCase()) ||
      c.citation.toLowerCase().includes(jurisSearch.toLowerCase()) ||
      c.keyDoctrine.toLowerCase().includes(jurisSearch.toLowerCase());
    const matchesCategory = selectedJurisCategory === "All" || c.category.includes(selectedJurisCategory);
    return matchesSearch && matchesCategory;
  });

  const currentUnitQuiz = SYLLABUS_QUIZZES[selectedModule.id] || SYLLABUS_QUIZZES["lesson-2"];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1E293B] flex flex-col md:flex-row font-sans selection:bg-[#002D62] selection:text-white">
      {/* 1. Sleek Minimal Sidebar with Toggle Switch */}
      <aside
        className={`${
          sidebarCollapsed ? "md:w-20" : "md:w-64"
        } w-full bg-white border-r border-[#EAEAEA] flex flex-col justify-between shrink-0 md:h-screen md:sticky md:top-0 z-30 transition-all duration-300 ease-in-out`}
      >
        <div>
          {/* Logo Header & Collapse Toggle */}
          <div className="p-4 border-b border-[#F0F0F0] flex items-center justify-between">
            <Link href="/" className={`flex items-center gap-2.5 ${sidebarCollapsed ? "justify-center w-full" : ""}`}>
              <div className="h-8 w-8 rounded-lg bg-[#002D62] text-white flex items-center justify-center shadow-sm shrink-0">
                <Shield className="h-4 w-4 text-[#C5A059]" />
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0">
                  <div className="font-bold text-[#002D62] text-xs tracking-tight font-serif truncate">
                    CDI 409 LEARNING
                  </div>
                  <div className="text-[10px] text-[#666] font-mono truncate">FSUU Criminology</div>
                </div>
              )}
            </Link>

            {!sidebarCollapsed && (
              <button
                type="button"
                onClick={() => setSidebarCollapsed(true)}
                title="Collapse Sidebar"
                className="hidden md:flex p-1.5 rounded-lg text-[#777] hover:text-[#002D62] hover:bg-[#F4F4F5] transition-colors"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            )}
          </div>

          {sidebarCollapsed && (
            <div className="hidden md:flex justify-center p-2 border-b border-[#F0F0F0]">
              <button
                type="button"
                onClick={() => setSidebarCollapsed(false)}
                title="Expand Sidebar"
                className="p-1.5 rounded-lg text-[#002D62] bg-[#002D62]/5 hover:bg-[#002D62]/10 transition-colors"
              >
                <PanelLeftOpen className="h-4 w-4 text-[#002D62]" />
              </button>
            </div>
          )}

          {!sidebarCollapsed && (
            <div className="p-4 mx-3 my-3 bg-[#F8F9FA] rounded-xl border border-[#EFEFEF] space-y-2.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-[#002D62]">Course Progress</span>
                <span className="font-mono text-[10px] text-[#C5A059] font-bold">
                  {completedCount}/8 Units ({progressPercent}%)
                </span>
              </div>
              <Progress value={progressPercent} className="h-1.5 bg-[#E2E8F0]" />
              <div className="flex items-center justify-between pt-1 border-t border-[#EAEAEA] text-[10px]">
                <span className="text-[#666] flex items-center gap-1 font-mono">
                  <Medal className="h-3.5 w-3.5 text-[#C5A059]" />
                  {unlockedBadgesCount} / 5 Badges
                </span>
                <span className="font-mono font-bold text-[#002D62]">{totalStudentPoints} XP</span>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="p-2.5 space-y-1">
            {[
              { id: "overview", label: "Student Overview", icon: LayoutDashboard },
              { id: "curriculum", label: "Syllabus Lessons", icon: BookOpen },
              { id: "crime-lab", label: "Crime Labs Suite", icon: Terminal },
              { id: "case-defense", label: "Case Defense Board", icon: MessageSquare },
              { id: "jurisprudence", label: "Jurisprudence & Rulings", icon: Gavel },
              { id: "badges", label: "Forensic Badges & XP", icon: Medal },
              { id: "warrants", label: "RA 10175 & Warrants", icon: Scale },
              { id: "grades", label: "My Grades & Formula", icon: BarChart3 },
              { id: "pcap-analyzer", label: "Wireshark PCAP Inspector", icon: Network },
              { id: "chain-of-custody", label: "PNP Chain of Custody", icon: FileSpreadsheet },
              { id: "outcomes", label: "Program Outcomes", icon: GraduationCap }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = navSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setNavSection(item.id);
                    if (item.id === "curriculum") setActiveTab("overview");
                  }}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    sidebarCollapsed ? "justify-center" : ""
                  } ${
                    isActive
                      ? "bg-[#002D62] text-white font-semibold shadow-xs"
                      : "text-[#555] hover:text-[#002D62] hover:bg-[#F4F4F5]"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Minimal User Profile & Logout */}
        <div className="p-3 border-t border-[#F0F0F0] bg-white">
          <div
            className={`flex items-center justify-between p-1.5 rounded-lg hover:bg-[#F8F9FA] transition-colors ${
              sidebarCollapsed ? "justify-center" : ""
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-7 w-7 rounded-full bg-[#002D62] text-white flex items-center justify-center font-bold text-[10px] shrink-0 font-mono">
                {userProfile.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0 truncate">
                  <div className="text-xs font-semibold text-[#1E293B] truncate">{userProfile.name}</div>
                  <div className="text-[10px] text-[#777] font-mono truncate">{userProfile.id}</div>
                </div>
              )}
            </div>

            {!sidebarCollapsed && (
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-1.5 rounded-md text-[#777] hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* 2. Main Minimal Content Stage */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#FAFAFA]">
        <header className="h-14 bg-white border-b border-[#EAEAEA] px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3 text-xs">
            {sidebarCollapsed && (
              <button
                type="button"
                onClick={() => setSidebarCollapsed(false)}
                title="Expand Sidebar"
                className="hidden md:flex p-1.5 rounded-lg text-[#002D62] bg-[#002D62]/5 hover:bg-[#002D62]/10 transition-colors"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </button>
            )}

            <span className="font-semibold text-[#002D62]">{COURSE_INFO.code}: {COURSE_INFO.title}</span>
            <span className="text-[#CCC] hidden sm:inline">•</span>
            <span className="text-[#666] hidden sm:inline text-[11px] font-mono">1st Semester AY 2026-2027</span>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="sm" className="h-8 text-xs text-[#555] hover:text-[#002D62]">
                Home
              </Button>
            </Link>
          </div>
        </header>

        <div className="p-4 md:p-6 max-w-6xl mx-auto w-full flex-1">
          {isPageLoading ? (
            <ForensicSkeletonLoader />
          ) : (
            <>
              {/* SECTION 0: CADET OVERVIEW DASHBOARD */}
              {navSection === "overview" && (
                <div className="space-y-6">
                  {/* Welcome Hero Card */}
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-[#002D62] via-[#001F44] to-[#002D62] text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-sm relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-80 h-full bg-[#C5A059]/10 skew-x-12 pointer-events-none" />
                    
                    <div className="space-y-1.5 relative z-10">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-[#C5A059] text-[11px] font-mono border border-white/10">
                        <GraduationCap className="h-3 w-3" />
                        <span>Father Saturnino Urios University • CDI 409</span>
                      </div>
                      <h1 className="text-2xl font-bold font-serif tracking-tight">
                        Welcome back, {userProfile.name}!
                      </h1>
                      <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                        Track your forensic competencies, complete hands-on crime labs, and practice legal case defense under <strong>RA 10175</strong> and <strong>RA 10173</strong>.
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 relative z-10">
                      <Button
                        onClick={() => {
                          setNavSection("curriculum");
                          setSelectedModule(SYLLABUS_MODULES[0]);
                        }}
                        className="bg-[#C5A059] hover:bg-[#b08d48] text-[#001F44] font-bold text-xs h-9 px-4 rounded-xl shadow-xs gap-1.5"
                      >
                        Resume Lessons <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setNavSection("crime-lab")}
                        className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs h-9 px-4 rounded-xl"
                      >
                        Crime Labs Suite
                      </Button>
                    </div>
                  </div>

                  {/* 4 Metric Counter Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                    <Card className="p-4 bg-white border-[#E5E5E5] rounded-xl space-y-1 shadow-xs">
                      <div className="flex items-center justify-between text-[#777]">
                        <span className="text-[11px] font-medium">Curriculum Progress</span>
                        <BookOpen className="h-4 w-4 text-[#002D62]" />
                      </div>
                      <div className="text-xl font-bold text-[#002D62] font-mono">
                        {completedCount} / 8 <span className="text-xs font-normal text-[#888]">Units</span>
                      </div>
                      <Progress value={progressPercent} className="h-1 bg-slate-100" />
                    </Card>

                    <Card className="p-4 bg-white border-[#E5E5E5] rounded-xl space-y-1 shadow-xs">
                      <div className="flex items-center justify-between text-[#777]">
                        <span className="text-[11px] font-medium">Accumulated XP</span>
                        <Flame className="h-4 w-4 text-amber-500" />
                      </div>
                      <div className="text-xl font-bold text-[#002D62] font-mono">
                        {totalStudentPoints} <span className="text-xs font-normal text-[#888]">XP</span>
                      </div>
                      <div className="text-[10px] text-emerald-700 font-mono">Top 5% in Section Alpha</div>
                    </Card>

                    <Card className="p-4 bg-white border-[#E5E5E5] rounded-xl space-y-1 shadow-xs">
                      <div className="flex items-center justify-between text-[#777]">
                        <span className="text-[11px] font-medium">Forensic Badges</span>
                        <Medal className="h-4 w-4 text-[#C5A059]" />
                      </div>
                      <div className="text-xl font-bold text-[#002D62] font-mono">
                        {unlockedBadgesCount} / 5 <span className="text-xs font-normal text-[#888]">Unlocked</span>
                      </div>
                      <div className="text-[10px] text-[#777] font-mono">Master Rank: Expert</div>
                    </Card>

                    <Card className="p-4 bg-white border-[#E5E5E5] rounded-xl space-y-1 shadow-xs">
                      <div className="flex items-center justify-between text-[#777]">
                        <span className="text-[11px] font-medium">Standing Grade</span>
                        <BarChart3 className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div className="text-xl font-bold text-emerald-700 font-mono">
                        {dynamicGrades.finalGrade}% <span className="text-xs font-normal text-[#888]">({dynamicGrades.gpa.split(" ")[0]})</span>
                      </div>
                      <div className="text-[10px] text-emerald-700 font-mono">
                        Status: {dynamicGrades.isPassed ? "PASSED (OBE Sec. VIII)" : "IN PROGRESS"}
                      </div>
                    </Card>
                  </div>

                  {/* 2-Column Content: Quick Next Unit & Recent Crime Labs */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* Left: Quick Launch Crime Labs */}
                    <div className="lg:col-span-7 space-y-3">
                      <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold text-[#002D62] font-serif flex items-center gap-1.5">
                          <Terminal className="h-4 w-4 text-[#C5A059]" />
                          Interactive Crime Labs (8 Available)
                        </h2>
                        <button
                          onClick={() => setNavSection("crime-lab")}
                          className="text-xs text-[#002D62] hover:underline font-semibold"
                        >
                          View All &rarr;
                        </button>
                      </div>

                      <div className="space-y-2.5">
                        {[
                          {
                            unit: 2,
                            title: "Hardware Disassembly & Volatility",
                            desc: "RFC 3227 order of volatility extraction for RAM and NVMe SSDs.",
                            badge: "Volatile Extraction",
                            action: () => {
                              setSelectedModule(SYLLABUS_MODULES[1]);
                              setActiveTab("crime-lab");
                              setNavSection("curriculum");
                            }
                          },
                          {
                            unit: 4,
                            title: "Volatile RAM Hex Dump Searcher",
                            desc: "Search memory offsets in memdump.raw for plaintext passwords and tokens.",
                            badge: "Hex Hunting",
                            action: () => {
                              setSelectedModule(SYLLABUS_MODULES[3]);
                              setActiveTab("crime-lab");
                              setNavSection("curriculum");
                            }
                          },
                          {
                            unit: 7,
                            title: "Rule on Cybercrime Warrants",
                            desc: "Evaluate Supreme Court warrant rules: WDCD, WSCD, WICT, WECD.",
                            badge: "Jurisprudence",
                            action: () => {
                              setSelectedModule(SYLLABUS_MODULES[6]);
                              setActiveTab("crime-lab");
                              setNavSection("curriculum");
                            }
                          }
                        ].map((lab) => (
                          <div
                            key={lab.unit}
                            className="p-3.5 rounded-xl bg-white border border-[#E5E5E5] hover:border-[#002D62]/40 transition-all flex items-center justify-between gap-3 shadow-xs"
                          >
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <Badge className="bg-[#002D62] text-white text-[9.5px] font-mono">
                                  Unit {lab.unit}
                                </Badge>
                                <span className="text-xs font-bold text-[#002D62] font-serif truncate">
                                  {lab.title}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#666] leading-tight truncate">{lab.desc}</p>
                            </div>
                            <Button
                              size="sm"
                              onClick={lab.action}
                              className="bg-[#002D62] hover:bg-[#001F44] text-white text-xs h-7 px-3 rounded-lg shrink-0"
                            >
                              Launch Lab
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right: Quick Statute & Case Defense Digest */}
                    <div className="lg:col-span-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold text-[#002D62] font-serif flex items-center gap-1.5">
                          <Scale className="h-4 w-4 text-[#C5A059]" />
                          Statutory & Legal Shortcuts
                        </h2>
                        <button
                          onClick={() => setNavSection("jurisprudence")}
                          className="text-xs text-[#002D62] hover:underline font-semibold"
                        >
                          Rulings &rarr;
                        </button>
                      </div>

                      <Card className="p-4 bg-white border-[#E5E5E5] rounded-xl space-y-3 shadow-xs">
                        <div className="space-y-2 border-b border-[#F0F0F0] pb-3">
                          <div className="flex items-center justify-between text-xs">
                            <strong className="text-[#002D62] font-serif">Republic Act 10175</strong>
                            <Badge variant="outline" className="text-[10px] border-blue-200 bg-blue-50 text-blue-800">
                              Cybercrime Law
                            </Badge>
                          </div>
                          <p className="text-[11px] text-[#555] leading-relaxed">
                            Comprehensive penal code covering illegal access, computer forgery, identity theft, cybersex, and online libel.
                          </p>
                        </div>

                        <div className="space-y-2 border-b border-[#F0F0F0] pb-3">
                          <div className="flex items-center justify-between text-xs">
                            <strong className="text-[#002D62] font-serif">Republic Act 10173</strong>
                            <Badge variant="outline" className="text-[10px] border-emerald-200 bg-emerald-50 text-emerald-800">
                              Data Privacy Act
                            </Badge>
                          </div>
                          <p className="text-[11px] text-[#555] leading-relaxed">
                            Protects sensitive personal data, mandating lawful processing criteria and law enforcement exemptions.
                          </p>
                        </div>

                        <Button
                          variant="outline"
                          onClick={() => setNavSection("case-defense")}
                          className="w-full text-xs h-8 border-[#002D62] text-[#002D62] hover:bg-[#002D62]/5 rounded-lg font-medium"
                        >
                          Participate in Case Defense Board &rarr;
                        </Button>
                      </Card>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 1: CURRICULUM VIEW */}
              {navSection === "curriculum" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#002D62] uppercase tracking-wider font-mono">
                    Lessons (8 Units)
                  </span>
                </div>

                <div className="relative">
                  <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#888]" />
                  <input
                    type="text"
                    value={moduleSearch}
                    onChange={(e) => setModuleSearch(e.target.value)}
                    placeholder="Search topics, laws..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white border border-[#E5E5E5] text-xs text-[#1E293B] focus:outline-none focus:border-[#002D62] transition-colors"
                  />
                </div>

                <div className="space-y-1.5 max-h-[calc(100vh-230px)] overflow-y-auto pr-1">
                  {filteredModules.map((mod) => {
                    const isSelected = selectedModule.id === mod.id;
                    const isDone = completedModules[mod.id];

                    return (
                      <button
                        key={mod.id}
                        onClick={() => setSelectedModule(mod)}
                        className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                          isSelected
                            ? "bg-white border-[#002D62] shadow-sm ring-1 ring-[#002D62]"
                            : "bg-white border-[#EBEBEB] hover:border-[#CCC] text-[#333]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`h-6 w-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 font-mono ${
                              isDone
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : isSelected
                                ? "bg-[#002D62] text-white"
                                : "bg-[#F3F4F6] text-[#555]"
                            }`}
                          >
                            {isDone ? <Check className="h-3.5 w-3.5" /> : `U${mod.lessonNumber}`}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold truncate leading-tight font-serif">{mod.title}</div>
                            <div className="text-[10px] text-[#777] font-mono">{mod.period}</div>
                          </div>
                        </div>
                        <ChevronRight className={`h-3.5 w-3.5 shrink-0 ${isSelected ? "text-[#002D62]" : "text-[#CCC]"}`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="lg:col-span-8 space-y-4">
                <Card className="bg-white border-[#E5E5E5] shadow-sm rounded-xl p-5 space-y-4">
                  <div className="border-b border-[#F0F0F0] pb-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-[#002D62] text-white text-[10px] font-mono">
                          Unit {selectedModule.lessonNumber}
                        </Badge>
                        <span className="text-[11px] text-[#666] font-mono">{selectedModule.period}</span>
                        <span className="text-[#DDD]">•</span>
                        <span className="text-[11px] text-[#666] font-mono">{selectedModule.duration}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Native Speech Audio Briefing Player */}
                        <LessonAudioPlayer
                          title={`Unit ${selectedModule.lessonNumber}: ${selectedModule.title}`}
                          summaryText={`${selectedModule.description}. Key topics include: ${selectedModule.topics.join(", ")}`}
                        />

                        {/* Mark Unit Completed Toggle */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setCompletedModules((prev) => ({
                              ...prev,
                              [selectedModule.id]: !prev[selectedModule.id]
                            }));
                          }}
                          className={`text-xs h-7 px-2.5 rounded-lg border font-medium gap-1.5 transition-all ${
                            completedModules[selectedModule.id]
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              : "bg-white text-[#555] border-[#E5E5E5] hover:border-[#002D62] hover:text-[#002D62]"
                          }`}
                        >
                          <Check className={`h-3.5 w-3.5 ${completedModules[selectedModule.id] ? "text-emerald-600 font-bold" : "text-[#888]"}`} />
                          {completedModules[selectedModule.id] ? "Completed ✓" : "Mark as Done"}
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h2 className="text-xl font-bold text-[#002D62] font-serif leading-snug">
                          {selectedModule.title}
                        </h2>
                        <p className="text-xs text-[#555] mt-1">{selectedModule.description}</p>
                      </div>

                      {/* Quick Unit Prev / Next Stepper */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={selectedModule.lessonNumber === 1}
                          onClick={() => {
                            const prevIdx = SYLLABUS_MODULES.findIndex((m) => m.id === selectedModule.id) - 1;
                            if (prevIdx >= 0) setSelectedModule(SYLLABUS_MODULES[prevIdx]);
                          }}
                          className="h-7 w-7 p-0 rounded-lg text-[#555] hover:text-[#002D62] hover:bg-[#F4F4F5] disabled:opacity-30"
                          title="Previous Unit"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-[11px] font-mono text-[#777]">
                          {selectedModule.lessonNumber} / 8
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={selectedModule.lessonNumber === 8}
                          onClick={() => {
                            const nextIdx = SYLLABUS_MODULES.findIndex((m) => m.id === selectedModule.id) + 1;
                            if (nextIdx < SYLLABUS_MODULES.length) setSelectedModule(SYLLABUS_MODULES[nextIdx]);
                          }}
                          className="h-7 w-7 p-0 rounded-lg text-[#555] hover:text-[#002D62] hover:bg-[#F4F4F5] disabled:opacity-30"
                          title="Next Unit"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-5 bg-[#F4F4F5] p-1 rounded-lg">
                      <TabsTrigger value="overview" className="text-xs font-medium py-1.5 data-[state=active]:bg-white data-[state=active]:text-[#002D62] data-[state=active]:shadow-sm">
                        Topics
                      </TabsTrigger>
                      <TabsTrigger value="lecture" className="text-xs font-medium py-1.5 data-[state=active]:bg-white data-[state=active]:text-[#002D62] data-[state=active]:shadow-sm">
                        Lecture Notes
                      </TabsTrigger>
                      <TabsTrigger value="5es-content" className="text-xs font-medium py-1.5 data-[state=active]:bg-white data-[state=active]:text-[#002D62] data-[state=active]:shadow-sm">
                        5Es Guide
                      </TabsTrigger>
                      <TabsTrigger value="crime-lab" className="text-xs font-medium py-1.5 data-[state=active]:bg-white data-[state=active]:text-[#002D62] data-[state=active]:shadow-sm">
                        Crime Lab
                      </TabsTrigger>
                      <TabsTrigger value="assessment" className="text-xs font-medium py-1.5 data-[state=active]:bg-white data-[state=active]:text-[#002D62] data-[state=active]:shadow-sm">
                        Quiz
                      </TabsTrigger>
                    </TabsList>

                    {/* TAB 1: Topics Overview */}
                    <TabsContent value="overview" className="mt-4 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {selectedModule.topics.map((t, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-[#FAFAFA] border border-[#EAEAEA] flex items-start gap-2.5">
                            <span className="h-5 w-5 rounded bg-[#002D62] text-white flex items-center justify-center text-[10px] font-bold shrink-0 font-mono">
                              {idx + 1}
                            </span>
                            <span className="text-xs text-[#1E293B] font-medium leading-snug">{t}</span>
                          </div>
                        ))}
                      </div>

                      <div className="p-3.5 rounded-lg bg-[#002D62]/5 border border-[#002D62]/10 flex items-center justify-between text-xs">
                        <span className="text-[#333]">Ready to read the complete syllabus lecture?</span>
                        <Button
                          size="sm"
                          onClick={() => setActiveTab("lecture")}
                          className="bg-[#002D62] hover:bg-[#001F44] text-white text-xs h-7 px-3 rounded-lg"
                        >
                          Read Lecture Notes <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </TabsContent>

                    {/* TAB 2: In-Depth Textbook Lecture Notes */}
                    <TabsContent value="lecture" className="mt-4 space-y-4">
                      {(() => {
                        const lessonDetail = LESSON_DETAILS[selectedModule.id] || LESSON_DETAILS["lesson-1"];
                        return (
                          <div className="space-y-4">
                            {/* Learning Objectives Box */}
                            <div className="p-4 rounded-xl bg-[#002D62]/5 border border-[#002D62]/10 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-[#002D62] uppercase tracking-wide font-mono flex items-center gap-1.5">
                                  <GraduationCap className="h-4 w-4 text-[#C5A059]" />
                                  Course Learning Objectives
                                </span>
                                <Badge variant="outline" className="text-[10px] font-mono text-[#666]">
                                  {lessonDetail.readTime}
                                </Badge>
                              </div>
                              <ul className="space-y-1.5 text-xs text-[#333]">
                                {lessonDetail.learningObjectives.map((obj, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <span className="text-[#C5A059] font-bold">›</span>
                                    <span>{obj}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Lecture Sections */}
                            <div className="space-y-3">
                              {lessonDetail.lectureBody.map((sec, idx) => (
                                <div key={idx} className="p-4 rounded-xl bg-white border border-[#EAEAEA] shadow-xs space-y-2">
                                  <h3 className="text-sm font-bold text-[#002D62] font-serif">{sec.heading}</h3>
                                  <div className="text-xs text-[#444] leading-relaxed whitespace-pre-line font-sans">
                                    {sec.content}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Statutory Citations Footer */}
                            <div className="p-3 bg-[#F8F9FA] rounded-xl border border-[#EAEAEA] text-[11px] text-[#555] space-y-1">
                              <div className="font-bold text-[#002D62] font-mono uppercase text-[10px]">
                                Legal & Forensic References:
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {lessonDetail.statutoryReferences.map((ref, idx) => (
                                  <Badge key={idx} className="bg-white border border-[#DDD] text-[#444] text-[9.5px] font-mono">
                                    {ref}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </TabsContent>

                    {/* TAB 3: 5Es Notes */}
                    <TabsContent value="5es-content" className="mt-4 space-y-2.5">
                      <div className="p-3.5 rounded-lg bg-[#FAFAFA] border border-[#EAEAEA] space-y-1">
                        <div className="font-semibold text-xs text-[#002D62] font-serif">1. Engage & Explore</div>
                        <p className="text-xs text-[#555] leading-relaxed">
                          First responders must analyze volatile and non-volatile layers of digital evidence without modifying cryptographic hashes or file timestamps.
                        </p>
                      </div>
                      <div className="p-3.5 rounded-lg bg-[#FAFAFA] border border-[#EAEAEA] space-y-1">
                        <div className="font-semibold text-xs text-[#C5A059] font-serif">2. Explain & Elaborate</div>
                        <p className="text-xs text-[#555] leading-relaxed">
                          Volatile memory (RAM) contains active passwords, sockets, and BitLocker keys. If power is removed, critical evidence is permanently lost.
                        </p>
                      </div>
                      <div className="p-3.5 rounded-lg bg-[#FAFAFA] border border-[#EAEAEA] space-y-1">
                        <div className="font-semibold text-xs text-emerald-700 font-serif">3. Evaluate & Apply</div>
                        <p className="text-xs text-[#555] leading-relaxed">
                          Maintain strict chain of custody logs with exact serial numbers, seizure timestamps, and write-blocked image files.
                        </p>
                      </div>
                    </TabsContent>

                    {/* TAB 3: Fully Dynamic Interactive Crime Labs for ALL 8 Units */}
                    <TabsContent value="crime-lab" className="mt-4 space-y-4">
                      {/* UNIT 1: Threat Intelligence Simulator */}
                      {selectedModule.id === "lesson-1" && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between pb-1 border-b border-[#F0F0F0]">
                            <span className="text-xs font-semibold text-[#002D62]">
                              Analyze network vectors & apply incident triage:
                            </span>
                            <Badge variant="outline" className="text-[9px] font-mono">
                              {Object.keys(investigatedThreats).length}/3 Investigated
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 gap-2.5">
                            {LAB_DATA["lab-1"].scenarios.map((scn) => {
                              const isDone = investigatedThreats[scn.id];
                              return (
                                <div key={scn.id} className="p-3.5 bg-[#FAFAFA] rounded-xl border border-[#EAEAEA] space-y-2 text-xs">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-[#002D62] font-serif">{scn.title}</span>
                                    <Badge className="bg-red-50 text-red-700 text-[9px] font-mono border border-red-200">
                                      {scn.threatVector}
                                    </Badge>
                                  </div>
                                  <div className="p-2 rounded bg-slate-900 text-emerald-400 font-mono text-[10.5px]">
                                    {scn.logSnippet}
                                  </div>
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-[#EAEAEA] text-[11px]">
                                    <span className="text-[#555]"><strong>Remediation:</strong> {scn.remediation}</span>
                                    <Button
                                      size="sm"
                                      onClick={() => handleInvestigateThreat(scn.id)}
                                      className={`text-[10px] h-6 px-2.5 rounded-md ${
                                        isDone ? "bg-emerald-600 text-white" : "bg-[#002D62] text-white"
                                      }`}
                                    >
                                      {isDone ? "Investigated ✓" : "Apply Triage"}
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* UNIT 2: Hardware Disassembly & Order of Volatility */}
                      {selectedModule.id === "lesson-2" && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between pb-1 border-b border-[#F0F0F0]">
                            <span className="text-xs font-semibold text-[#002D62]">
                              Select components in forensic Order of Volatility:
                            </span>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowLabHint(!showLabHint)}
                                className="h-6 text-[10px] text-[#C5A059] hover:bg-[#C5A059]/10 gap-1 font-semibold"
                              >
                                <Lightbulb className="h-3 w-3" />
                                {showLabHint ? "Hide Hint" : "Forensic Hint"}
                              </Button>
                              <Button variant="ghost" size="sm" onClick={resetHardwareLab} className="h-6 text-[10px] text-[#777]">
                                Reset
                              </Button>
                            </div>
                          </div>

                          {showLabHint && (
                            <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                              <Info className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                              <div>
                                <strong>RFC 3227 Rule:</strong> Primary Volatile Memory (RAM) must always be acquired <em>first</em> before persistent SSD or mechanical drives.
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              {LAB_DATA["lab-2"].components.map((comp) => {
                                const isExtracted = extractedComponents.some((c) => c.id === comp.id);
                                return (
                                  <button
                                    key={comp.id}
                                    disabled={isExtracted}
                                    onClick={() => handleExtractComponent(comp)}
                                    className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between ${
                                      isExtracted
                                        ? "bg-slate-50 border-[#EAEAEA] text-slate-400 cursor-not-allowed opacity-40"
                                        : "bg-white border-[#E5E5E5] hover:border-[#002D62] text-[#1E293B] shadow-xs"
                                    }`}
                                  >
                                    <div>
                                      <div className="text-xs font-semibold">{comp.name}</div>
                                      <div className="text-[10px] text-[#777] font-mono">{comp.category}</div>
                                    </div>
                                    <Badge variant="outline" className="text-[9px] font-mono">
                                      {isExtracted ? "Extracted" : "Extract"}
                                    </Badge>
                                  </button>
                                );
                              })}
                            </div>

                            <div className="p-3 bg-[#F8F9FA] rounded-lg border border-[#E5E5E5] flex flex-col justify-between min-h-[160px]">
                              <div className="space-y-1.5">
                                <span className="text-[10px] font-bold text-[#666] uppercase font-mono">Evidence Tray:</span>
                                {extractedComponents.length === 0 ? (
                                  <div className="text-center py-6 text-xs text-[#888]">
                                    Click components on the left in the correct order!
                                  </div>
                                ) : (
                                  extractedComponents.map((item) => (
                                    <div key={item.id} className="p-2 bg-white rounded border border-[#EAEAEA] text-xs flex items-center justify-between shadow-xs">
                                      <span className="font-medium text-[#1E293B]">#{item.extractedOrder} {item.name}</span>
                                      <span className="text-[9px] text-[#666] font-mono">{item.forensicValue.slice(0, 24)}...</span>
                                    </div>
                                  ))
                                )}
                              </div>

                              {labFeedback && (
                                <Alert className={`mt-2 py-2 ${labFeedback.success ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-red-50 text-red-800 border-red-200"}`}>
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  <AlertDescription className="text-xs font-medium">{labFeedback.message}</AlertDescription>
                                </Alert>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* UNIT 3: RA 10175 Statutory Charge Builder */}
                      {selectedModule.id === "lesson-3" && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between pb-1 border-b border-[#F0F0F0]">
                            <span className="text-xs font-semibold text-[#002D62]">
                              Formulate criminal charges under Republic Act 10175:
                            </span>
                            <Badge variant="outline" className="text-[9px] font-mono">
                              {Object.keys(selectedCharges).length}/3 Cases Charged
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 gap-2.5">
                            {LAB_DATA["lab-3"].cases.map((cs) => {
                              const isCharged = selectedCharges[cs.id];
                              return (
                                <div key={cs.id} className="p-3.5 bg-[#FAFAFA] rounded-xl border border-[#EAEAEA] space-y-2 text-xs">
                                  <div className="text-[#333]">
                                    <strong className="text-[#002D62]">Case Evidence:</strong> {cs.evidence}
                                  </div>

                                  {!isCharged ? (
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        onClick={() => handleSelectCharge(cs.id, cs.correctSection)}
                                        className="bg-[#002D62] text-white text-[10px] h-7 px-3 rounded-lg"
                                      >
                                        Formulate Proper Charge
                                      </Button>
                                    </div>
                                  ) : (
                                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                                      <div className="font-bold font-mono text-[10px] text-emerald-800">Verified Charge:</div>
                                      <div className="font-semibold text-xs">{cs.correctSection}</div>
                                      <p className="text-[11px] text-[#444] pt-0.5">{cs.rationale}</p>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* UNIT 4: Live Memory RAM Hex Forensics */}
                      {selectedModule.id === "lesson-4" && (
                        <div className="space-y-3">
                          <form onSubmit={handleSearchMemory} className="flex gap-2">
                            <input
                              type="text"
                              value={hexQuery}
                              onChange={(e) => setHexQuery(e.target.value)}
                              placeholder="Search memory keywords: password=, BitLocker, C2_SERVER..."
                              className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-[#E5E5E5] text-xs text-[#1E293B] focus:outline-none focus:border-[#002D62] font-mono"
                            />
                            <Button type="submit" size="sm" className="bg-[#002D62] hover:bg-[#001F44] text-white text-xs h-8 px-4 rounded-lg">
                              Search RAM
                            </Button>
                          </form>

                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-[#666] uppercase font-mono">
                              Discovered Artifacts ({discoveredMemoryStrings.length}/4):
                            </span>
                            {discoveredMemoryStrings.length === 0 ? (
                              <div className="p-4 bg-[#F8F9FA] rounded-lg border border-dashed border-[#E0E0E0] text-center text-xs text-[#777]">
                                Search <code className="font-mono text-[#002D62] font-bold">password=</code> or <code className="font-mono text-[#002D62] font-bold">BitLocker</code> to recover volatile data.
                              </div>
                            ) : (
                              discoveredMemoryStrings.map((item) => (
                                <div key={item.id} className="p-2.5 bg-white rounded-lg border border-emerald-200 text-xs flex items-center justify-between shadow-xs">
                                  <div>
                                    <div className="font-semibold text-[#002D62]">{item.evidenceType}</div>
                                    <div className="text-[11px] font-mono text-[#444] bg-[#F8F9FA] px-1.5 py-0.5 rounded mt-0.5">{item.foundContent}</div>
                                  </div>
                                  <Badge className="bg-emerald-50 text-emerald-700 text-[9px] font-mono">{item.hexOffset}</Badge>
                                </div>
                              ))
                            )}
                          </div>

                          {ramLabFeedback && (
                            <Alert className="bg-emerald-50 text-emerald-800 border-emerald-200 py-2">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <AlertDescription className="text-xs font-medium">{ramLabFeedback.message}</AlertDescription>
                            </Alert>
                          )}
                        </div>
                      )}

                      {/* UNIT 5: ISO/IEC 27037 Digital Forensics Action Plan Checklist */}
                      {selectedModule.id === "lesson-5" && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between pb-1 border-b border-[#F0F0F0]">
                            <span className="text-xs font-semibold text-[#002D62]">
                              ISO/IEC 27037 Digital Forensics Action Plan Checklist:
                            </span>
                            <Badge variant="outline" className="text-[9px] font-mono">
                              {Object.values(completedPlanSteps).filter(Boolean).length}/5 Completed
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 gap-2">
                            {LAB_DATA["lab-5"].stages.map((st) => {
                              const isChecked = completedPlanSteps[st.step];
                              return (
                                <button
                                  key={st.step}
                                  onClick={() => handleTogglePlanStep(st.step)}
                                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 text-xs ${
                                    isChecked
                                      ? "bg-emerald-50/60 border-emerald-300 shadow-xs"
                                      : "bg-[#FAFAFA] border-[#EAEAEA] hover:border-[#002D62]"
                                  }`}
                                >
                                  <span
                                    className={`h-6 w-6 rounded-md flex items-center justify-center font-bold text-[10px] font-mono shrink-0 ${
                                      isChecked ? "bg-emerald-600 text-white" : "bg-[#002D62] text-white"
                                    }`}
                                  >
                                    {isChecked ? "✓" : st.step}
                                  </span>
                                  <div className="space-y-0.5">
                                    <div className="font-bold text-[#002D62] font-serif">{st.title}</div>
                                    <p className="text-[#555] text-[11px] leading-relaxed">{st.action}</p>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* UNIT 6: USBSTOR Registry Artifacts */}
                      {selectedModule.id === "lesson-6" && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between pb-1 border-b border-[#F0F0F0]">
                            <span className="text-xs font-semibold text-[#002D62]">
                              Windows Registry & Prefetch Execution Timeline:
                            </span>
                            <Badge variant="outline" className="text-[9px] font-mono">
                              {Object.keys(examinedArtifacts).length}/4 Artifacts Examined
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 gap-2.5">
                            {LAB_DATA["lab-6"].artifacts.map((art) => {
                              const isExamined = examinedArtifacts[art.id];
                              return (
                                <div key={art.id} className="p-3 bg-[#FAFAFA] rounded-xl border border-[#EAEAEA] space-y-1.5 text-xs">
                                  <div className="flex items-center justify-between">
                                    <code className="font-mono text-[10px] font-bold text-[#002D62]">{art.artifact}</code>
                                    <Badge className="bg-[#002D62]/10 text-[#002D62] text-[9px] font-mono">{art.category}</Badge>
                                  </div>
                                  <p className="text-[#555] text-[11px]">{art.description}</p>
                                  <div className="flex justify-end pt-1">
                                    <Button
                                      size="sm"
                                      onClick={() => handleExamineArtifact(art.id)}
                                      className={`text-[10px] h-6 px-2.5 rounded-md ${
                                        isExamined ? "bg-emerald-600 text-white" : "bg-[#002D62] text-white"
                                      }`}
                                    >
                                      {isExamined ? "Verified ✓" : "Extract Key"}
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* UNIT 7: Supreme Court Cybercrime Warrants */}
                      {selectedModule.id === "lesson-7" && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between pb-1 border-b border-[#F0F0F0]">
                            <span className="text-xs font-semibold text-[#002D62]">
                              Supreme Court Judicial Cybercrime Warrants (A.M. No. 17-11-03-SC):
                            </span>
                            <Badge variant="outline" className="text-[9px] font-mono">
                              {Object.keys(warrantMatches).length}/4 Warrants Evaluated
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {LAB_DATA["lab-7"].warrantTypes.map((w) => {
                              const isMatched = warrantMatches[w.code];
                              return (
                                <div key={w.code} className="p-3 bg-[#FAFAFA] rounded-xl border border-[#EAEAEA] space-y-1.5 text-xs flex flex-col justify-between">
                                  <div>
                                    <div className="flex items-center justify-between">
                                      <Badge className="bg-[#002D62] text-white text-[10px] font-mono">{w.code}</Badge>
                                      <span className="text-[9px] text-[#777] font-mono">Judicial Issuance</span>
                                    </div>
                                    <div className="font-bold text-[#002D62] font-serif mt-1">{w.name}</div>
                                    <p className="text-[#555] text-[11px] leading-relaxed mt-0.5">{w.scope}</p>
                                  </div>

                                  <div className="pt-2 border-t border-[#EAEAEA]">
                                    <Button
                                      size="sm"
                                      onClick={() => handleMatchWarrant(w.code)}
                                      className={`w-full text-[10px] h-6 rounded-md ${
                                        isMatched ? "bg-emerald-600 text-white" : "bg-[#002D62] text-white"
                                      }`}
                                    >
                                      {isMatched ? "Warrant Validated ✓" : "Validate Scope"}
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* UNIT 8: Green Forensics Contraband Analysis */}
                      {selectedModule.id === "lesson-8" && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {LAB_DATA["lab-8"].contrabandCases.map((c) => {
                            const isDone = analyzedGreenCases[c.id];
                            return (
                              <div key={c.id} className="p-3 bg-white rounded-lg border border-[#E5E5E5] flex flex-col justify-between space-y-2 shadow-xs">
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between">
                                    <Badge className="bg-emerald-50 text-emerald-800 text-[9px] font-mono">Seizure</Badge>
                                    {isDone && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                                  </div>
                                  <div className="text-xs font-bold text-[#002D62] font-serif">{c.evidenceName}</div>
                                  <div className="text-[10px] text-[#555]">{c.findings}</div>
                                  <div className="text-[10px] text-red-700 font-mono bg-red-50 p-1 rounded">{c.legalViolation.slice(0, 32)}...</div>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => handleConfirmGreenAnalysis(c)}
                                  className="w-full bg-[#002D62] hover:bg-[#001F44] text-white text-xs h-7 rounded-lg"
                                >
                                  {isDone ? "Verified ✓" : "Verify Case"}
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </TabsContent>

                    {/* TAB 4: Quiz with Timer & Instant Explanations */}
                    <TabsContent value="assessment" className="mt-4 space-y-3">
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#002D62]/5 border border-[#002D62]/10 text-xs">
                        <div className="flex items-center gap-1.5 text-[#002D62] font-semibold">
                          <HelpCircle className="h-4 w-4 text-[#C5A059]" />
                          <span>Unit Assessment: Formative Quiz</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] font-mono text-[#002D62] font-bold">
                          <Timer className="h-3.5 w-3.5 text-amber-600" />
                          <span>Time Left: {quizTimerSeconds}s</span>
                        </div>
                      </div>

                      {currentUnitQuiz.map((q) => {
                        const hasAnswered = selectedQuizAnswers[q.id] !== undefined;

                        return (
                          <div key={q.id} className="p-3.5 rounded-lg bg-[#FAFAFA] border border-[#EAEAEA] space-y-2">
                            <p className="text-xs font-semibold text-[#002D62] font-serif">{q.question}</p>
                            <div className="space-y-1.5">
                              {q.options.map((opt, optIdx) => {
                                const isSelected = selectedQuizAnswers[q.id] === optIdx;
                                const isCorrect = q.correctIndex === optIdx;

                                return (
                                  <button
                                    key={optIdx}
                                    onClick={() => setSelectedQuizAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                                    className={`w-full text-left p-2.5 rounded-lg text-xs border transition-all ${
                                      isSelected
                                        ? isCorrect
                                          ? "bg-emerald-50 border-emerald-500 text-emerald-800 font-medium"
                                          : "bg-red-50 border-red-500 text-red-800 font-medium"
                                        : "bg-white border-[#E5E5E5] text-[#333] hover:border-[#002D62]"
                                    }`}
                                  >
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>

                            {hasAnswered && (
                              <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-100 text-xs text-blue-900 mt-2 space-y-0.5">
                                <strong className="text-[#002D62] text-[11px]">Legal & Forensic Explanation:</strong>
                                <p className="text-[11px] leading-relaxed">{q.explanation}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Quiz Summary & Retake Action */}
                      {(() => {
                        const totalQuizQ = currentUnitQuiz.length;
                        const answeredCount = Object.keys(selectedQuizAnswers).filter((k) =>
                          currentUnitQuiz.some((q) => q.id === k)
                        ).length;
                        const correctCount = currentUnitQuiz.filter(
                          (q) => selectedQuizAnswers[q.id] === q.correctIndex
                        ).length;

                        if (answeredCount === totalQuizQ && totalQuizQ > 0) {
                          const passed = correctCount >= Math.ceil(totalQuizQ * 0.7);
                          return (
                            <div className={`p-4 rounded-xl border space-y-2.5 ${passed ? "bg-emerald-50/70 border-emerald-200 text-emerald-900" : "bg-amber-50/70 border-amber-200 text-amber-900"}`}>
                              <div className="flex items-center justify-between">
                                <div className="font-bold text-xs font-serif flex items-center gap-1.5">
                                  <Medal className={`h-4 w-4 ${passed ? "text-emerald-700" : "text-amber-700"}`} />
                                  Assessment Result: {correctCount} / {totalQuizQ} Correct ({Math.round((correctCount / totalQuizQ) * 100)}%)
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    const next = { ...selectedQuizAnswers };
                                    currentUnitQuiz.forEach((q) => delete next[q.id]);
                                    setSelectedQuizAnswers(next);
                                    setQuizTimerSeconds(60);
                                  }}
                                  className="h-6 text-[10px] bg-[#002D62] text-white hover:bg-[#001F44] rounded-md px-2.5"
                                >
                                  Retake Assessment
                                </Button>
                              </div>
                              <p className="text-[11px] leading-relaxed">
                                {passed
                                  ? "Competency demonstrated! You have successfully mastered this unit's legal and forensic concepts."
                                  : "Review the statutory provisions and lecture notes above, then retake the assessment to demonstrate competency."}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </TabsContent>
                  </Tabs>
                </Card>
              </div>
            </div>
          )}

          {/* SECTION 2: CRIME LABS SUITE VIEW */}
          {navSection === "crime-lab" && (
            <div className="space-y-4">
              <div className="border-b border-[#EAEAEA] pb-3">
                <h2 className="text-lg font-bold text-[#002D62] font-serif">Forensics Crime Labs Suite</h2>
                <p className="text-xs text-[#666]">Choose a laboratory simulation to practice digital and green forensics.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 bg-white border-[#E5E5E5] rounded-xl flex flex-col justify-between space-y-3 shadow-xs">
                  <div className="space-y-1.5">
                    <div className="h-8 w-8 rounded-lg bg-[#002D62]/5 text-[#002D62] flex items-center justify-center">
                      <Cpu className="h-4 w-4 text-[#C5A059]" />
                    </div>
                    <h3 className="text-sm font-bold text-[#002D62] font-serif">Hardware Triage & Disassembly</h3>
                    <p className="text-xs text-[#666]">Order of Volatility disassembly for RAM, NVMe SSD, and SATA storage.</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setNavSection("curriculum");
                      setSelectedModule(SYLLABUS_MODULES[1]);
                      setActiveTab("crime-lab");
                    }}
                    className="w-full bg-[#002D62] hover:bg-[#001F44] text-white text-xs h-8 rounded-lg"
                  >
                    Open Hardware Lab
                  </Button>
                </Card>

                <Card className="p-4 bg-white border-[#E5E5E5] rounded-xl flex flex-col justify-between space-y-3 shadow-xs">
                  <div className="space-y-1.5">
                    <div className="h-8 w-8 rounded-lg bg-[#002D62]/5 text-[#002D62] flex items-center justify-center">
                      <Binary className="h-4 w-4 text-[#C5A059]" />
                    </div>
                    <h3 className="text-sm font-bold text-[#002D62] font-serif">Volatile RAM Hex Forensics</h3>
                    <p className="text-xs text-[#666]">Search physical memory dumps for plaintext passwords and encryption keys.</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setNavSection("curriculum");
                      setSelectedModule(SYLLABUS_MODULES[3]);
                      setActiveTab("crime-lab");
                    }}
                    className="w-full bg-[#002D62] hover:bg-[#001F44] text-white text-xs h-8 rounded-lg"
                  >
                    Open RAM Hex Lab
                  </Button>
                </Card>

                <Card className="p-4 bg-white border-[#E5E5E5] rounded-xl flex flex-col justify-between space-y-3 shadow-xs">
                  <div className="space-y-1.5">
                    <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                      <TreePine className="h-4 w-4 text-emerald-600" />
                    </div>
                    <h3 className="text-sm font-bold text-[#002D62] font-serif">Green & Wildlife Forensics</h3>
                    <p className="text-xs text-[#666]">Microscopic sawdust morphology & CITES illegal wildlife classification.</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setNavSection("curriculum");
                      setSelectedModule(SYLLABUS_MODULES[7]);
                      setActiveTab("crime-lab");
                    }}
                    className="w-full bg-[#002D62] hover:bg-[#001F44] text-white text-xs h-8 rounded-lg"
                  >
                    Open Green Lab
                  </Button>
                </Card>
              </div>
            </div>
          )}

          {/* SECTION 3: CASE DEFENSE FORUM */}
          {navSection === "case-defense" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-4 space-y-3">
                <div className="border-b border-[#EAEAEA] pb-2">
                  <h2 className="text-sm font-bold text-[#002D62] font-serif">Case Defense Dockets</h2>
                  <p className="text-[11px] text-[#666]">Select a legal scenario to defend your investigative findings.</p>
                </div>

                <div className="space-y-2">
                  {caseTopics.map((topic) => {
                    const isSelected = selectedCaseDef.id === topic.id;
                    return (
                      <button
                        key={topic.id}
                        onClick={() => setSelectedCaseDef(topic)}
                        className={`w-full text-left p-3 rounded-xl border transition-all space-y-1 ${
                          isSelected
                            ? "bg-white border-[#002D62] shadow-sm ring-1 ring-[#002D62]"
                            : "bg-white border-[#EBEBEB] hover:border-[#CCC]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <Badge className="bg-[#002D62]/10 text-[#002D62] text-[9px] font-mono">
                            Unit {topic.unitNumber} Defense
                          </Badge>
                          <span className="text-[10px] text-[#888] font-mono">
                            {topic.initialPosts.length} arguments
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-[#1E293B] line-clamp-2 leading-snug font-serif">
                          {topic.title}
                        </h4>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="lg:col-span-8 space-y-4">
                <Card className="p-5 bg-white border-[#E5E5E5] rounded-xl shadow-xs space-y-4">
                  <div className="border-b border-[#F0F0F0] pb-3 space-y-1">
                    <Badge className="bg-[#002D62] text-white text-[10px] font-mono">
                      Unit {selectedCaseDef.unitNumber} Moot Case
                    </Badge>
                    <h3 className="text-base font-bold text-[#002D62] font-serif leading-snug">
                      {selectedCaseDef.title}
                    </h3>
                    <div className="p-3 rounded-lg bg-[#F8F9FA] border border-[#EAEAEA] text-xs text-[#444] space-y-1 mt-2">
                      <div className="font-semibold text-[#002D62]">Case Synopsis:</div>
                      <p>{selectedCaseDef.synopsis}</p>
                      <div className="font-semibold text-[#C5A059] pt-1">Forensic Defense Task:</div>
                      <p className="italic">{selectedCaseDef.prompt}</p>
                    </div>
                  </div>

                  <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                    {selectedCaseDef.initialPosts.map((post) => (
                      <div key={post.id} className="p-3.5 bg-[#FAFAFA] rounded-xl border border-[#EAEAEA] space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-[#002D62] text-white flex items-center justify-center font-bold text-[9px] font-mono">
                              {post.authorName.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-semibold text-[#1E293B]">{post.authorName}</span>
                              <span className="text-[10px] text-[#777] ml-2 font-mono">{post.authorRole}</span>
                            </div>
                          </div>
                          <span className="text-[10px] text-[#888]">{post.timestamp}</span>
                        </div>

                        <p className="text-xs text-[#333] leading-relaxed pl-8">
                          {post.content}
                        </p>

                        {post.instructorFeedback && (
                          <div className="ml-8 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
                            <UserCheck className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-[10px] uppercase font-mono tracking-wide text-emerald-800">Faculty Review:</span>
                              <div className="text-[11px]">{post.instructorFeedback}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleSubmitDefense} className="space-y-2 pt-2 border-t border-[#F0F0F0]">
                    <label className="text-[11px] font-semibold text-[#002D62] flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5" />
                      Submit Your Legal & Forensic Argument:
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={newDefenseArgument}
                      onChange={(e) => setNewDefenseArgument(e.target.value)}
                      placeholder="State applicable statutory provisions (e.g. RA 10175 Sec. 4, A.M. No. 17-11-03-SC) and evidence artifacts..."
                      className="w-full p-3 rounded-lg border border-[#E0E0E0] text-xs text-[#1E293B] focus:outline-none focus:border-[#002D62] leading-relaxed"
                    />
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        size="sm"
                        className="bg-[#002D62] hover:bg-[#001F44] text-white text-xs h-8 px-4 rounded-lg font-semibold gap-1.5"
                      >
                        <Send className="h-3 w-3 text-[#C5A059]" />
                        Submit Defense Argument
                      </Button>
                    </div>
                  </form>
                </Card>
              </div>
            </div>
          )}

          {/* SECTION 4: JURISPRUDENCE & SUPREME COURT RULINGS LIBRARY */}
          {navSection === "jurisprudence" && (
            <div className="space-y-4">
              <div className="border-b border-[#EAEAEA] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-[#002D62] font-serif">Philippine Cybercrime & Environmental Jurisprudence</h2>
                  <p className="text-xs text-[#666]">Supreme Court En Banc doctrines, landmark cyber decisions, and environmental rulings.</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#888]" />
                    <input
                      type="text"
                      value={jurisSearch}
                      onChange={(e) => setJurisSearch(e.target.value)}
                      placeholder="Search doctrine, case name..."
                      className="pl-8 pr-3 py-1.5 rounded-lg bg-white border border-[#E5E5E5] text-xs text-[#1E293B] focus:outline-none focus:border-[#002D62] w-48 sm:w-64"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 text-xs">
                {["All", "RA 10175", "RA 10173", "Judicial Warrants", "Computer-Related Fraud", "Environmental"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedJurisCategory(cat)}
                    className={`px-3 py-1 rounded-lg transition-all font-medium text-[11px] ${
                      selectedJurisCategory === cat
                        ? "bg-[#002D62] text-white font-semibold"
                        : "bg-white border border-[#E5E5E5] text-[#555] hover:bg-[#F4F4F5]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredJurisprudence.map((caseItem) => (
                  <Card key={caseItem.id} className="p-4 bg-white border-[#E5E5E5] rounded-xl shadow-xs space-y-2.5 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Badge className="bg-[#002D62]/10 text-[#002D62] font-mono text-[9px]">{caseItem.court}</Badge>
                        <span className="text-[10px] font-mono text-[#C5A059] font-bold">{caseItem.category}</span>
                      </div>

                      <h3 className="text-xs font-bold text-[#002D62] font-serif leading-snug">{caseItem.title}</h3>
                      <div className="text-[10px] text-[#777] font-mono">{caseItem.citation}</div>

                      <div className="p-2.5 rounded-lg bg-[#F8F9FA] border border-[#EAEAEA] text-xs text-[#333] space-y-1">
                        <strong className="text-[#002D62] text-[11px]">Key Legal Doctrine:</strong>
                        <p className="leading-relaxed text-[11.5px]">{caseItem.keyDoctrine}</p>
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-blue-50/50 border border-blue-100 text-[11px] text-blue-900">
                      <strong>Criminology Application:</strong> {caseItem.criminologyApplication}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 5: FORENSIC BADGES & ACHIEVEMENTS */}
          {navSection === "badges" && (
            <div className="space-y-4">
              <div className="border-b border-[#EAEAEA] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-[#002D62] font-serif">Forensic Badges & XP Mastery</h2>
                  <p className="text-xs text-[#666]">Unlock achievements by demonstrating competency in digital and green forensics.</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 px-3 rounded-lg bg-[#002D62] text-white text-xs font-mono font-bold flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-[#C5A059]" />
                    Total XP: {totalStudentPoints}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {BADGES_DATA.map((badge) => {
                  const unlocked = isBadgeUnlocked(badge.id);

                  return (
                    <Card
                      key={badge.id}
                      className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all ${
                        unlocked
                          ? "bg-white border-[#002D62] shadow-xs"
                          : "bg-slate-50 border-[#EAEAEA] opacity-60"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge
                            className={`text-[9px] font-mono ${
                              unlocked
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {unlocked ? "UNLOCKED ✓" : "LOCKED"}
                          </Badge>
                          <span className="text-[10px] font-mono font-bold text-[#C5A059]">+{badge.points} XP</span>
                        </div>

                        <div className="flex items-start gap-2.5">
                          <div
                            className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 shadow-xs ${
                              unlocked ? "bg-[#002D62] text-[#C5A059]" : "bg-slate-300 text-slate-500"
                            }`}
                          >
                            <Medal className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-[#002D62] font-serif leading-snug">{badge.title}</h4>
                            <span className="text-[9px] text-[#777] font-mono">{badge.category} • {badge.tier} Tier</span>
                          </div>
                        </div>

                        <p className="text-xs text-[#555] leading-relaxed">{badge.description}</p>
                      </div>

                      <div className="pt-2 border-t border-[#F0F0F0] text-[10px] text-[#777] font-mono">
                        <strong className="text-[#333]">Requirement:</strong> {badge.requiredAction}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 6: WARRANTS VIEW */}
          {navSection === "warrants" && (
            <div className="space-y-4">
              <div className="border-b border-[#EAEAEA] pb-3">
                <h2 className="text-lg font-bold text-[#002D62] font-serif">Rule on Cybercrime Warrants (A.M. No. 17-11-03-SC)</h2>
                <p className="text-xs text-[#666]">Supreme Court judicial issuance framework for digital search and seizure.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {LAB_DATA["lab-7"].warrantTypes.map((w) => (
                  <Card key={w.code} className="p-4 bg-white border-[#E5E5E5] rounded-xl space-y-1.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-[#002D62]/10 text-[#002D62] font-mono text-[10px]">{w.code}</Badge>
                      <span className="text-[10px] text-[#777] font-mono">Judicial Issuance</span>
                    </div>
                    <h3 className="text-xs font-bold text-[#002D62] font-serif">{w.name}</h3>
                    <p className="text-xs text-[#555] leading-relaxed">{w.scope}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 7: GRADES VIEW */}
          {navSection === "grades" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAEAEA] pb-3">
                <div>
                  <h2 className="text-lg font-bold text-[#002D62] font-serif">Academic Grade Computation (Section VIII)</h2>
                  <p className="text-xs text-[#666]">Official FSUU Criminology Formula: 60% Summative + 40% Classwork.</p>
                </div>

                <Button
                  size="sm"
                  onClick={async () => {
                    const { generateStudentGradePDF } = await import("@/lib/pdfGenerator");
                    generateStudentGradePDF(userProfile, userProfile.grades);
                  }}
                  className="bg-[#002D62] hover:bg-[#001F44] text-white text-xs h-8 px-3.5 rounded-lg shadow-xs"
                >
                  <FileText className="h-3.5 w-3.5 mr-1.5 text-[#C5A059]" />
                  Download Grade Transcript (PDF)
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-white border border-[#E5E5E5] rounded-xl shadow-xs">
                  <div className="text-[11px] text-[#666] font-mono">Summative Mean (60%)</div>
                  <div className="text-xl font-bold text-[#002D62] font-mono mt-0.5">
                    {(((dynamicGrades.prelims + dynamicGrades.midterms) / 2) * 0.60).toFixed(2)}
                  </div>
                  <div className="text-[9px] text-[#888] font-mono mt-0.5">Prelim ({dynamicGrades.prelims}) & Midterm ({dynamicGrades.midterms})</div>
                </div>
                <div className="p-3.5 bg-white border border-[#E5E5E5] rounded-xl shadow-xs">
                  <div className="text-[11px] text-[#666] font-mono">Classwork (40%)</div>
                  <div className="text-xl font-bold text-[#C5A059] font-mono mt-0.5">
                    {(dynamicGrades.classwork * 0.40).toFixed(2)}
                  </div>
                  <div className="text-[9px] text-[#888] font-mono mt-0.5">Raw Score: {dynamicGrades.classwork}% ({completedCount} Labs/Units)</div>
                </div>
                <div className="p-3.5 bg-white border border-[#E5E5E5] rounded-xl shadow-xs">
                  <div className="text-[11px] text-[#666] font-mono">Midterm Grade</div>
                  <div className="text-xl font-bold text-[#002D62] font-mono mt-0.5">{dynamicGrades.midtermGrade}%</div>
                  <div className="text-[9px] text-[#888] font-mono mt-0.5">Summative + Classwork</div>
                </div>
                <div className="p-3.5 bg-white border border-[#E5E5E5] rounded-xl shadow-xs">
                  <div className="text-[11px] text-[#666] font-mono">Final Computed Grade</div>
                  <div className="text-xl font-bold text-emerald-600 font-mono mt-0.5">
                    {dynamicGrades.finalGrade} ({dynamicGrades.gpa.split(" ")[0]})
                  </div>
                  <div className="text-[9px] text-emerald-700 font-mono mt-0.5">
                    Status: {dynamicGrades.isPassed ? "PASSED" : "IN PROGRESS"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 7.2: LIVE NETWORK PACKET & WIRESHARK PCAP INSPECTOR */}
          {navSection === "pcap-analyzer" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAEAEA] pb-3">
                <div>
                  <h2 className="text-lg font-bold text-[#002D62] font-serif flex items-center gap-2">
                    <Network className="h-5 w-5 text-[#C5A059]" />
                    Live Network Packet & Wireshark PCAP Analyzer (Unit 4/5)
                  </h2>
                  <p className="text-xs text-[#666]">
                    Inspect captured Ethernet frames, reconstruct TCP streams, and extract cleartext C2 credentials & HTTP payloads.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className="bg-[#002D62] text-[#C5A059] font-mono text-[10px]">
                    Capture: suspect_c2_traffic.pcap
                  </Badge>
                  <Button
                    size="sm"
                    onClick={() => {
                      setExtractedPcapArtifacts({
                        credentials: true,
                        c2_server: true,
                        database: true
                      });
                    }}
                    className="bg-[#002D62] hover:bg-[#001F44] text-white text-xs h-8 px-3 rounded-lg shadow-xs font-semibold"
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-1 text-[#C5A059]" />
                    Extract Forensic Artifacts
                  </Button>
                </div>
              </div>

              {/* Wireshark Display Filter Bar */}
              <div className="p-3 bg-[#001F44] rounded-xl flex items-center gap-2 text-xs shadow-xs">
                <FilterIcon className="h-3.5 w-3.5 text-[#C5A059] shrink-0" />
                <span className="text-slate-300 font-mono text-[11px] shrink-0">Display Filter:</span>
                <div className="flex flex-wrap gap-1.5 flex-1">
                  {PCAP_FILTER_RULES.map((rule) => (
                    <button
                      key={rule.filter}
                      onClick={() => setPcapFilter(rule.filter)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-all ${
                        pcapFilter === rule.filter
                          ? "bg-[#C5A059] text-[#001F44] font-bold shadow-xs"
                          : "bg-white/10 text-slate-300 hover:bg-white/20"
                      }`}
                    >
                      {rule.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* PCAP Packet Grid & Inspector Split-Pane */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
                {/* 1. Packet List Pane (7 cols) */}
                <div className="lg:col-span-7 space-y-2">
                  <Card className="bg-white border-[#E5E5E5] rounded-xl overflow-hidden shadow-xs">
                    <div className="p-2.5 bg-[#002D62] text-white flex items-center justify-between text-xs font-mono">
                      <span>Packet Frame Stream</span>
                      <span className="text-[10px] text-[#C5A059]">ISO/OSI Layer 2-7</span>
                    </div>

                    <div className="overflow-x-auto max-h-[360px] overflow-y-auto">
                      <table className="w-full text-xs text-left border-collapse font-mono">
                        <thead className="bg-[#F8F9FA] text-[#002D62] text-[10px] sticky top-0 border-b border-[#E5E5E5]">
                          <tr>
                            <th className="p-2 text-center">No.</th>
                            <th className="p-2">Time</th>
                            <th className="p-2">Source</th>
                            <th className="p-2">Destination</th>
                            <th className="p-2">Proto</th>
                            <th className="p-2">Info</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EFEFEF] text-[11px]">
                          {PCAP_SAMPLE_PACKETS.filter((pkt) => {
                            if (pcapFilter === "All") return true;
                            if (pcapFilter === "http") return pkt.protocol === "HTTP";
                            if (pcapFilter === "dns") return pkt.protocol === "DNS";
                            if (pcapFilter === "tcp") return pkt.protocol === "TCP";
                            if (pcapFilter === "credentials") return pkt.frameNo === 5;
                            return true;
                          }).map((pkt) => {
                            const isSelected = selectedPcapFrame.frameNo === pkt.frameNo;
                            return (
                              <tr
                                key={pkt.frameNo}
                                onClick={() => setSelectedPcapFrame(pkt)}
                                className={`cursor-pointer transition-colors ${
                                  isSelected
                                    ? "bg-[#002D62]/10 font-bold border-l-4 border-[#002D62]"
                                    : "hover:bg-[#F8F9FA]"
                                }`}
                              >
                                <td className="p-2 text-center text-[#777]">{pkt.frameNo}</td>
                                <td className="p-2 text-[#555]">{pkt.time}</td>
                                <td className="p-2 text-[#002D62]">{pkt.source}</td>
                                <td className="p-2 text-[#002D62]">{pkt.destination}</td>
                                <td className="p-2">
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[9.5px] ${
                                      pkt.protocol === "HTTP"
                                        ? "bg-rose-100 text-rose-800"
                                        : pkt.protocol === "DNS"
                                        ? "bg-sky-100 text-sky-800"
                                        : "bg-slate-100 text-slate-800"
                                    }`}
                                  >
                                    {pkt.protocol}
                                  </span>
                                </td>
                                <td className="p-2 text-[#333] truncate max-w-[200px]" title={pkt.info}>
                                  {pkt.info}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </Card>

                  {/* Forensic Extraction Findings */}
                  <Card className="bg-white border-[#E5E5E5] rounded-xl p-3.5 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#002D62] font-serif flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        Extracted Court Evidence (RA 10175 Section 4(a)(1))
                      </span>
                      <Badge className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9.5px] font-mono">
                        Admissible Artifact
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono">
                      <div className="p-2 rounded-lg bg-[#F8F9FA] border border-[#EAEAEA]">
                        <span className="text-[9.5px] text-[#777] block">ADVERSARY C2 HOST</span>
                        <strong className="text-[#002D62]">darknet-c2-portal.xyz</strong>
                      </div>
                      <div className="p-2 rounded-lg bg-[#F8F9FA] border border-[#EAEAEA]">
                        <span className="text-[9.5px] text-[#777] block">EXFILTRATED USER</span>
                        <strong className="text-rose-600">fsuu_finance_admin</strong>
                      </div>
                      <div className="p-2 rounded-lg bg-[#F8F9FA] border border-[#EAEAEA]">
                        <span className="text-[9.5px] text-[#777] block">EXFILTRATED PASS</span>
                        <strong className="text-rose-600">P@ssw0rd2026!</strong>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* 2. Packet Details & Hex Stream Inspector (5 cols) */}
                <div className="lg:col-span-5 space-y-3">
                  <Card className="bg-white border-[#E5E5E5] rounded-xl overflow-hidden shadow-xs">
                    <div className="p-2.5 bg-[#001F44] text-white flex items-center justify-between text-xs font-serif font-bold">
                      <span>Frame #{selectedPcapFrame.frameNo} Protocol Tree</span>
                      <span className="text-[10px] text-[#C5A059] font-mono">{selectedPcapFrame.protocol}</span>
                    </div>

                    <div className="p-3.5 space-y-2.5 text-xs">
                      <div className="p-2.5 rounded-lg bg-[#F8F9FA] border border-[#EAEAEA] space-y-1">
                        <div className="font-bold text-[#002D62] text-[11.5px]">{selectedPcapFrame.layer}</div>
                        <div className="text-[11px] text-[#555]">{selectedPcapFrame.details.verdict}</div>
                      </div>

                      <div className="space-y-1 font-mono text-[10.5px] text-[#444] bg-[#FAFAFA] p-2.5 rounded-lg border border-[#EAEAEA]">
                        {Object.entries(selectedPcapFrame.details).map(([key, val]) => (
                          <div key={key} className="flex justify-between border-b border-[#EFEFEF] py-0.5 last:border-none">
                            <span className="text-[#777]">{key}:</span>
                            <span className="font-bold text-[#002D62] text-right truncate max-w-[200px]" title={String(val)}>
                              {String(val)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Raw Hex & ASCII Dump */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-[#666] uppercase font-mono block">
                          Raw Packet Hex Stream:
                        </span>
                        <div className="p-2.5 rounded-lg bg-[#001F44] text-emerald-400 font-mono text-[10px] leading-relaxed break-all max-h-[140px] overflow-y-auto">
                          {selectedPcapFrame.rawHex}
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 7.5: CHAIN OF CUSTODY & EVIDENCE FORM GENERATOR */}
          {navSection === "chain-of-custody" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAEAEA] pb-3">
                <div>
                  <h2 className="text-lg font-bold text-[#002D62] font-serif flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-[#C5A059]" />
                    PNP & NBI Evidence Chain of Custody (CoC) Form
                  </h2>
                  <p className="text-xs text-[#666]">
                    Standard ISO/IEC 27037 & RA 10175 Evidence Inventory, Tagging & Transfer Protocol (PNP-ACG Form 04).
                  </p>
                </div>

                <Button
                  size="sm"
                  onClick={async () => {
                    const { generateChainOfCustodyPDF } = await import("@/lib/pdfGenerator");
                    generateChainOfCustodyPDF(userProfile);
                  }}
                  className="bg-[#002D62] hover:bg-[#001F44] text-white text-xs h-8 px-4 rounded-lg shadow-xs font-semibold"
                >
                  <FileText className="h-3.5 w-3.5 mr-1.5 text-[#C5A059]" />
                  Generate Official CoC Form (PDF)
                </Button>
              </div>

              {/* Case Metadata Banner */}
              <div className="p-4 bg-white border border-[#E5E5E5] rounded-xl grid grid-cols-2 md:grid-cols-4 gap-3 text-xs shadow-xs">
                <div>
                  <span className="text-[10px] text-[#777] font-mono block">CASE CONTROL NO.</span>
                  <strong className="text-[#002D62] font-mono text-[11.5px]">CC-FSUU-2026-8941</strong>
                </div>
                <div>
                  <span className="text-[10px] text-[#777] font-mono block">SEARCH WARRANT NO.</span>
                  <strong className="text-[#002D62] font-mono text-[11.5px]">SW-2026-0881-RTC-BR10</strong>
                </div>
                <div>
                  <span className="text-[10px] text-[#777] font-mono block">SEIZING INVESTIGATOR</span>
                  <strong className="text-[#002D62] font-serif text-[11.5px]">{userProfile.name}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-[#777] font-mono block">ASSIGNED UNIT</span>
                  <strong className="text-[#002D62] text-[11px]">RACU 13 (Butuan HQ)</strong>
                </div>
              </div>

              {/* Specimen Inventory Table */}
              <Card className="bg-white border-[#E5E5E5] rounded-xl overflow-hidden shadow-xs">
                <div className="p-3 bg-[#002D62] text-white flex items-center justify-between">
                  <span className="text-xs font-bold font-serif tracking-wide">
                    I. Inventory of Seized Digital Specimens & Tamper Seals
                  </span>
                  <Badge className="bg-[#C5A059] text-[#001F44] text-[9.5px] font-mono font-bold">
                    3 Specimen Items Logged
                  </Badge>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#E5E5E5] bg-[#F8F9FA] text-[#002D62] font-mono text-[11px]">
                        <th className="p-3">Item #</th>
                        <th className="p-3">Specimen Description</th>
                        <th className="p-3">Serial / Barcode</th>
                        <th className="p-3">Evidence Tag</th>
                        <th className="p-3">SHA-256 Hash Integrity</th>
                        <th className="p-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFEFEF]">
                      {[
                        {
                          item: "ITEM-01",
                          name: "Samsung 980 Pro NVMe PCIe SSD 1TB",
                          sub: "Seized primary storage with partition image",
                          serial: "S649NX0W109283A",
                          tag: "EB-2026-091-A",
                          hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                          status: "Sealed (Faraday Bag)"
                        },
                        {
                          item: "ITEM-02",
                          name: "Kingston Fury Beast 16GB DDR4-3200 RAM",
                          sub: "Primary volatile RAM extracted via RFC 3227",
                          serial: "KF432C16BB1/16-9902",
                          tag: "EB-2026-091-B",
                          hash: "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e",
                          status: "Preserved (Anti-Static)"
                        },
                        {
                          item: "ITEM-03",
                          name: "SanDisk Ultra 64GB USB 3.0 Flash Drive",
                          sub: "Contains keylogger executable artifact",
                          serial: "SDCZ48-064G-U46",
                          tag: "EB-2026-091-C",
                          hash: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
                          status: "Write-Blocked"
                        }
                      ].map((spec) => (
                        <tr key={spec.item} className="hover:bg-[#F8F9FA]/60 transition-colors">
                          <td className="p-3 font-mono font-bold text-[#002D62]">{spec.item}</td>
                          <td className="p-3">
                            <strong className="text-[#002D62] block font-serif">{spec.name}</strong>
                            <span className="text-[10px] text-[#777]">{spec.sub}</span>
                          </td>
                          <td className="p-3 font-mono text-[11px] text-[#555]">{spec.serial}</td>
                          <td className="p-3 font-mono font-bold text-[#002D62]">{spec.tag}</td>
                          <td className="p-3 font-mono text-[10px] text-[#444] max-w-[160px] truncate" title={spec.hash}>
                            {spec.hash.slice(0, 16)}...{spec.hash.slice(-8)}
                          </td>
                          <td className="p-3 text-right">
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200">
                              {spec.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Successive Custody Transfer Log */}
              <Card className="bg-white border-[#E5E5E5] rounded-xl p-4 space-y-3 shadow-xs">
                <h3 className="text-xs font-bold text-[#002D62] font-serif uppercase tracking-wide">
                  II. Successive Transfer Chain of Custody Protocol
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-[#F8F9FA] border border-[#EAEAEA] space-y-1 text-xs">
                    <div className="flex items-center justify-between font-mono text-[10px] text-[#777]">
                      <span>STAGE 1: SEIZURE</span>
                      <span>15:00 HRS</span>
                    </div>
                    <strong className="text-[#002D62] block font-serif">{userProfile.name}</strong>
                    <p className="text-[11px] text-[#666]">Turnover of evidence from crime scene to RACU 13 evidence vault.</p>
                  </div>

                  <div className="p-3 rounded-lg bg-[#F8F9FA] border border-[#EAEAEA] space-y-1 text-xs">
                    <div className="flex items-center justify-between font-mono text-[10px] text-[#777]">
                      <span>STAGE 2: IMAGING</span>
                      <span>16:30 HRS</span>
                    </div>
                    <strong className="text-[#002D62] block font-serif">PCMS Elena S. Mercado</strong>
                    <p className="text-[11px] text-[#666]">Bit-stream forensic duplicate acquisition (FTK/Tableau Write-Block).</p>
                  </div>

                  <div className="p-3 rounded-lg bg-[#F8F9FA] border border-[#EAEAEA] space-y-1 text-xs">
                    <div className="flex items-center justify-between font-mono text-[10px] text-[#777]">
                      <span>STAGE 3: INQUEST</span>
                      <span>18:00 HRS</span>
                    </div>
                    <strong className="text-[#002D62] block font-serif">Atty. Cedrick G. Train</strong>
                    <p className="text-[11px] text-[#666]">Turnover to court custodian for judicial warrant inquest.</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* SECTION 8: OUTCOMES VIEW */}
          {navSection === "outcomes" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAEAEA] pb-3">
                <div>
                  <h2 className="text-lg font-bold text-[#002D62] font-serif">CHED & Institutional Program Outcomes</h2>
                  <p className="text-xs text-[#666]">Competency accreditation for BS Criminology students.</p>
                </div>

                <Button
                  size="sm"
                  onClick={async () => {
                    const { generateOBECertificatePDF } = await import("@/lib/pdfGenerator");
                    generateOBECertificatePDF(userProfile);
                  }}
                  className="bg-[#C5A059] hover:bg-[#b08d48] text-[#001F44] font-bold text-xs h-8 px-3.5 rounded-lg shadow-xs"
                >
                  <Award className="h-3.5 w-3.5 mr-1.5" />
                  Download OBE Certificate (PDF)
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {COURSE_INFO.programOutcomes.map((po) => (
                  <Card key={po.id} className="p-4 bg-white border-[#E5E5E5] rounded-xl space-y-1.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-[#002D62]/10 text-[#002D62] font-mono text-[10px]">{po.id}</Badge>
                      <span className="text-[10px] text-emerald-700 font-semibold font-mono">92% Attainment</span>
                    </div>
                    <h3 className="text-xs font-bold text-[#002D62] font-serif">{po.title}</h3>
                    <p className="text-xs text-[#555] leading-relaxed">{po.description}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}
            </>
          )}
        </div>
      </main>

      {/* Floating Practicum Submission Real-time Toast */}
      {practicumNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#001F44] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs animate-in slide-in-from-bottom duration-300 border border-[#C5A059]/50">
          <div className="h-6 w-6 rounded-full bg-[#C5A059]/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-4 w-4 text-[#C5A059]" />
          </div>
          <div>
            <div className="font-bold text-[#C5A059]">Practicum Sync Active</div>
            <div className="text-slate-200 text-[11px]">{practicumNotice}</div>
          </div>
        </div>
      )}
    </div>
  );
}
