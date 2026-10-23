"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  ShieldAlert,
  Layers,
  Terminal,
  Scale,
  BarChart3,
  GraduationCap,
  BookOpen,
  Cpu,
  Binary,
  FileCheck2,
  Fingerprint,
  FileSignature,
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
  Globe,
  PlayCircle,
  MonitorPlay,
  Monitor,
  Download,
  Bell,
  Plus,
  Loader2,
  ExternalLink,
  RefreshCw
} from "lucide-react";
import { COURSE_INFO, SYLLABUS_MODULES, getSavedModules, fetchDynamicModules } from "@/lib/curriculum";
import {
  SANS_RESOURCES,
  getSansResourcesForLesson,
  getSansCheatSheets,
  getSansWhitepapers,
  getSansResourcesByUnit
} from "@/lib/sansResources";
import { LAB_DATA } from "@/lib/labData";
import { BADGES_DATA } from "@/lib/badgeData";
import { SYLLABUS_QUIZZES } from "@/lib/quizData";
import { LESSON_DETAILS } from "@/lib/lessonDetails";
import { LessonAudioPlayer } from "@/components/LessonAudioPlayer";
import { ForensicSkeletonLoader } from "@/components/RouteLoadingBar";
import ForensicTerminalSandbox from "@/components/ForensicTerminalSandbox";
import { supabase } from "@/lib/supabaseClient";
import { submitPracticumLab, getStudentCompletedModules } from "@/lib/practicumService";
import { getStudentGrades } from "@/lib/gradeService";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { subscribeToMaintenanceStatus, getMaintenanceStatus } from "@/lib/maintenanceService";

// Helper function to find a specific video by ID across all sections
const getIntroVideoById = (id, dataObj) => {
  if (!dataObj || !dataObj.sections) return null;
  for (const section of dataObj.sections) {
    const found = section.lessons.find((lesson) => lesson.id === id);
    if (found) return found;
  }
  return null;
};

// Helper function to resolve lesson reference (e.g., 'lesson-1')
const resolveLessonRef = (video) => {
  if (!video) return "lesson-1";
  if (video.lessonRef) return video.lessonRef;
  if (video.title) {
    const match = video.title.match(/(?:Unit|Lesson)\s*(\d+)/i) || video.title.match(/^(\d+)\./);
    if (match) {
      const n = parseInt(match[1], 10);
      return `lesson-${Math.min(Math.max(n, 1), 8)}`;
    }
  }
  return "lesson-1";
};

// Helper to format student display names professionally
const formatStudentDisplayName = (raw) => {
  if (!raw) return "Criminology Student";
  let name = String(raw).trim();
  if (name.includes("@")) {
    name = name.split("@")[0];
  }
  if (name.toLowerCase() === "khimlucintes") {
    return "Khim Lucintes";
  }
  name = name.replace(/[._\-+]/g, " ").replace(/^(cad\.|cadet)\s+/i, "");
  const formatted = name
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
  return formatted || "Criminology Student";
};

export default function StudentDashboard() {
  const router = useRouter();

  const [dynamicCourseData, setDynamicCourseData] = useState({ sections: [] });

  useEffect(() => {
    async function loadDynamicCourses() {
      try {
        const { data: secData } = await supabase.from('course_sections').select('*').order('sort_order', { ascending: true });
        const { data: lesData } = await supabase.from('course_lessons').select('*').order('sort_order', { ascending: true });
        if (secData && secData.length > 0) {
          const formatted = {
            sections: secData.map(sec => ({
              id: sec.id,
              title: sec.title,
              lessons: (lesData || []).filter(l => l.section_id === sec.id).map(l => ({
                id: l.id,
                lessonRef: l.lesson_ref,
                title: l.title,
                description: l.description,
                notes: l.notes,
                video_url: l.video_url,
                reading_content: l.reading_content,
                download_url: l.download_url,
                download_type: l.download_type,
                is_locked: l.is_locked,
                type: "video"
              }))
            }))
          };
          setDynamicCourseData(formatted);
          if (formatted.sections[0]?.lessons[0]) {
            setIntroCourseActiveVideo(formatted.sections[0].lessons[0].id);
          }
        }
      } catch (e) { console.error("Error loading dynamic courses:", e); }
    }
    loadDynamicCourses();
  }, []);

  // Profile & Loading state
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState({
    id: "22100001903",
    name: "Khim Lucintes",
    avatar: "K",
    program: "Bachelor of Science in Criminology",
    yearLevel: "4th Year",
    section: "Section Alpha",
    institution: "Father Saturnino Urios University",
    lastActive: "Just now",
    progress: { overall: 0, coursework: 0, summative: 0 }
  });
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isFacultyPreview, setIsFacultyPreview] = useState(false);
  const [staffRole, setStaffRole] = useState(null);
  const [practicumNotice, setPracticumNotice] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [dynamicQuizzes, setDynamicQuizzes] = useState({});
  const [dbGrades, setDbGrades] = useState({
    prelims: 0, midterms: 0, semiFinals: 0, finals: 0, classwork: 0,
    midtermGrade: 0, tentativeFinal: 0, finalGrade: 0, gpa: "Loading...", isPassed: false
  });

  // System Maintenance Lockout State
  const [maintenanceInfo, setMaintenanceInfo] = useState({ active: false });

  useEffect(() => {
    const unsubscribe = subscribeToMaintenanceStatus((status) => {
      setMaintenanceInfo(status || { active: false });
    });
    return () => unsubscribe();
  }, []);

  // Profile Settings State
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    program: "",
    yearLevel: "",
    section: ""
  });

  // Messages State
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [msgSubject, setMsgSubject] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);

  const fetchMessagesAndNotifs = async () => {
    if (!currentUser) return;

    // Messages
    try {
      const { data, error } = await supabase
        .from('direct_messages')
        .select('*')
        .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id},receiver_id.eq.BROADCAST`)
        .order('created_at', { ascending: true });
      if (!error && data) setMessages(data);
    } catch (e) {
      const stored = localStorage.getItem(`all_msgs`);
      if (stored) {
        const parsed = JSON.parse(stored);
        const myMsgs = parsed.filter(m => m.sender_id === currentUser.id || m.receiver_id === currentUser.id || m.receiver_id === 'BROADCAST');
        setMessages(myMsgs);
      }
    }

    // Notifications
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .or(`user_id.eq.${currentUser.id},user_id.eq.BROADCAST`)
        .order('created_at', { ascending: false });
      if (!error && data) setNotifications(data);
    } catch (e) {
      const stored = localStorage.getItem(`notifs_${currentUser.id}`);
      if (stored) setNotifications(JSON.parse(stored));
      else {
        setNotifications([]);
      }
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchMessagesAndNotifs();
    }
  }, [currentUser, showMessages, showNotifications]);

  const unreadMessagesCount = messages.filter(m => !m.is_read && m.sender_id !== currentUser?.id).length;
  const unreadNotifsCount = notifications.filter(n => !n.is_read).length;

  const handleMarkMessagesRead = async () => {
    if (!currentUser) return;
    const updated = messages.map(m => (m.sender_id !== currentUser.id ? { ...m, is_read: true } : m));
    setMessages(updated);
    try {
      await supabase.from('direct_messages').update({ is_read: true }).eq('receiver_id', currentUser.id).eq('is_read', false);
    } catch (e) { }
    localStorage.setItem(`all_msgs`, JSON.stringify(updated));
  };

  const handleMarkNotifsRead = async () => {
    if (!currentUser) return;
    const updated = notifications.map(n => ({ ...n, is_read: true }));
    setNotifications(updated);
    try {
      await supabase.from('notifications').update({ is_read: true }).eq('user_id', currentUser.id).eq('is_read', false);
    } catch (e) { }
    localStorage.setItem(`notifs_${currentUser.id}`, JSON.stringify(updated));
  };

  const handleSendMessage = async (text) => {
    if (!text.trim() || !currentUser) return;
    setIsSendingMessage(true);
    try {
      const instructorId = "22222222-2222-2222-2222-222222222222"; // Known Instructor ID
      const newMsg = {
        sender_id: currentUser.id,
        sender_name: userProfile.name,
        receiver_id: instructorId,
        content: text,
      };

      const { error } = await supabase.from('direct_messages').insert([newMsg]);

      if (error) {
        // Fallback to local storage
        const currentMsgs = [...messages, { ...newMsg, created_at: new Date().toISOString() }];
        setMessages(currentMsgs);
        localStorage.setItem(`msgs_${currentUser.id}`, JSON.stringify(currentMsgs));

        // Also add to global fallback store for admin
        const allMsgs = JSON.parse(localStorage.getItem('all_msgs') || '[]');
        allMsgs.push({ ...newMsg, created_at: new Date().toISOString() });
        localStorage.setItem('all_msgs', JSON.stringify(allMsgs));
      } else {
        fetchMessagesAndNotifs();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Update form when userProfile changes
  useEffect(() => {
    if (userProfile.name && userProfile.name !== "Student" && userProfile.name !== "Cyber Student" && userProfile.name !== "Criminology Student" && userProfile.name !== "Cyber Cadet" && profileForm.name === "") {
      setProfileForm({
        name: userProfile.name,
        program: userProfile.program === "Loading..." ? "" : userProfile.program,
        yearLevel: userProfile.yearLevel,
        section: userProfile.section,
      });
    }
  }, [userProfile]);

  // Sidebar Collapse / Toggle State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Navigation
  const [syllabusModules, setSyllabusModules] = useState(SYLLABUS_MODULES);
  const [navSection, setNavSection] = useState("overview");
  const [selectedModule, setSelectedModule] = useState(SYLLABUS_MODULES[1]);
  const [activeTab, setActiveTab] = useState("overview");
  const [moduleSearch, setModuleSearch] = useState("");
  const [isFocusMode, setIsFocusMode] = useState(false);

  // === Global Spotlight Search (Ctrl + K) State ===
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [globalSearchCategory, setGlobalSearchCategory] = useState("all");
  const [searchSelectedIndex, setSearchSelectedIndex] = useState(0);
  const searchInputRef = useRef(null);

  // Global Ctrl+K / Cmd+K Spotlight shortcut
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setGlobalSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape" && globalSearchOpen) {
        setGlobalSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [globalSearchOpen]);

  // Focus input when modal opens
  useEffect(() => {
    if (globalSearchOpen) {
      setSearchSelectedIndex(0);
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [globalSearchOpen]);

  // Search catalog mapping all statutes, curriculum units, and forensic labs
  const SEARCH_ITEMS = useMemo(() => [
    // --- STATUTES & LEGAL JURISPRUDENCE ---
    {
      id: "statute-ra10175",
      title: "Republic Act 10175 (Cybercrime Prevention Act)",
      category: "laws",
      categoryLabel: "Statute",
      description: "Philippine cyber offenses: illegal access, system interference, cybersex, child pornography, and online libel.",
      keywords: "ra 10175 cybercrime prevention act illegal access system interference data interference cybersex online libel penal law",
      icon: Scale,
      action: () => {
        setNavSection("intro-course");
        const mod = syllabusModules.find(m => m.id === "lesson-2") || syllabusModules[1];
        if (mod) setSelectedModule(mod);
      }
    },
    {
      id: "statute-ra10173",
      title: "Republic Act 10173 (Data Privacy Act of 2012)",
      category: "laws",
      categoryLabel: "Statute",
      description: "Data privacy compliance, National Privacy Commission mandates, sensitive personal information, and breach reporting.",
      keywords: "ra 10173 data privacy act npc sensitive personal information privacy breach data protection officer",
      icon: Scale,
      action: () => {
        setNavSection("intro-course");
        const mod = syllabusModules.find(m => m.id === "lesson-7") || syllabusModules[6];
        if (mod) setSelectedModule(mod);
      }
    },
    {
      id: "statute-ra10173-sec25",
      title: "Republic Act 10173 (Data Privacy Act of 2012)",
      category: "laws",
      categoryLabel: "Statute",
      description: "Data privacy compliance, National Privacy Commission (NPC) mandates, sensitive personal information, and 72-hour breach reporting.",
      keywords: "ra 10173 data privacy act npc sensitive personal information privacy breach data protection officer unauthorized processing",
      icon: Scale,
      action: () => {
        setNavSection("intro-course");
        const mod = syllabusModules.find(m => m.id === "lesson-7") || syllabusModules[6];
        if (mod) setSelectedModule(mod);
      }
    },
    {
      id: "statute-am-warrants",
      title: "Rule on Cybercrime Warrants (A.M. No. 17-11-03-SC)",
      category: "laws",
      categoryLabel: "Court Rule",
      description: "Supreme Court procedure governing WSCD, WDCD, WESD, and WEIC for electronic search, seizure, and examination.",
      keywords: "rule on cybercrime warrants am 17-11-03-sc wscd wdcd wesd weic search seizure computer data examination supreme court",
      icon: Gavel,
      action: () => {
        setNavSection("intro-course");
      }
    },
    {
      id: "statute-am-evidence",
      title: "Rules on Electronic Evidence (A.M. No. 01-7-01-SC)",
      category: "laws",
      categoryLabel: "Court Rule",
      description: "Supreme Court rules on admissibility of electronic documents, dual cryptographic hash verification, and chain of custody.",
      keywords: "am 01-7-01-sc rules on electronic evidence admissibility hash integrity chain of custody electronic documents",
      icon: Scale,
      action: () => {
        setNavSection("intro-course");
      }
    },

    // --- CURRICULUM MODULES ---
    {
      id: "mod-unit-1",
      title: "Unit 1: Introduction to Cybercrime & Legal Frameworks",
      category: "curriculum",
      categoryLabel: "Curriculum Unit",
      description: "Cyberspace history, evolution of computer crime, Budapest Convention, and Philippine institutional enforcement.",
      keywords: "unit 1 introduction cybercrime legal frameworks budapest convention cyberspace computer history",
      icon: BookOpen,
      action: () => {
        setNavSection("intro-course");
        const mod = syllabusModules.find(m => m.id === "lesson-1") || syllabusModules[0];
        if (mod) setSelectedModule(mod);
      }
    },
    {
      id: "mod-unit-2",
      title: "Unit 2: Nature & Classification of Cybercrimes (RA 10175)",
      category: "curriculum",
      categoryLabel: "Curriculum Unit",
      description: "Detailed legal breakdown of offenses against confidentiality, integrity, computer fraud, content offenses, and penalties.",
      keywords: "unit 2 nature types offenses illegal access illegal interception data interference system interference cybersex online libel",
      icon: BookOpen,
      action: () => {
        setNavSection("intro-course");
        const mod = syllabusModules.find(m => m.id === "lesson-2") || syllabusModules[1];
        if (mod) setSelectedModule(mod);
      }
    },
    {
      id: "mod-unit-3",
      title: "Unit 3: Digital Forensics & Investigation Fundamentals",
      category: "curriculum",
      categoryLabel: "Curriculum Unit",
      description: "RFC 3227 order of volatility, live vs dead box acquisition, hardware write-blocking, and dual SHA-256 validation.",
      keywords: "unit 3 digital forensics investigation fundamentals rfc 3227 order of volatility write blocking sha256 chain of custody",
      icon: BookOpen,
      action: () => {
        setNavSection("intro-course");
        const mod = syllabusModules.find(m => m.id === "lesson-3") || syllabusModules[2];
        if (mod) setSelectedModule(mod);
      }
    },
    {
      id: "mod-unit-4",
      title: "Unit 4: Incident Response & Digital Evidence Collection",
      category: "curriculum",
      categoryLabel: "Curriculum Unit",
      description: "First responder triage, volatile RAM acquisition, FTK Imager disk imaging, and evidence packaging protocols.",
      keywords: "unit 4 incident response digital evidence collection live memory ftk imager ram dump triage first responder",
      icon: BookOpen,
      action: () => {
        setNavSection("intro-course");
        const mod = syllabusModules.find(m => m.id === "lesson-4") || syllabusModules[3];
        if (mod) setSelectedModule(mod);
      }
    },
    {
      id: "mod-unit-5",
      title: "Unit 5: Network Forensics & Cyber Threat Analysis",
      category: "curriculum",
      categoryLabel: "Curriculum Unit",
      description: "Network packet capture triage, Wireshark frame analysis, IP routing forensics, and brute force detection.",
      keywords: "unit 5 network forensics cyber threat analysis pcap wireshark packet capture tcp ip intrusion detection",
      icon: BookOpen,
      action: () => {
        setNavSection("intro-course");
        const mod = syllabusModules.find(m => m.id === "lesson-5") || syllabusModules[4];
        if (mod) setSelectedModule(mod);
      }
    },
    {
      id: "mod-unit-6",
      title: "Unit 6: Rule on Cybercrime Warrants & Judicial Procedure",
      category: "curriculum",
      categoryLabel: "Curriculum Unit",
      description: "Affidavit preparation, applying for WSCD and WDCD, executing search warrants on computer systems, and court direct testimony.",
      keywords: "unit 6 rule on cybercrime warrants judicial procedure court deposition affidavit wscd wdcd",
      icon: BookOpen,
      action: () => {
        setNavSection("intro-course");
        const mod = syllabusModules.find(m => m.id === "lesson-6") || syllabusModules[5];
        if (mod) setSelectedModule(mod);
      }
    },
    {
      id: "mod-unit-7",
      title: "Unit 7: Data Privacy Act in Cyber Investigation",
      category: "curriculum",
      categoryLabel: "Curriculum Unit",
      description: "Balancing police investigative powers with personal data rights, lawful processing, and NPC notification requirements.",
      keywords: "unit 7 data privacy act privacy rights lawful processing lawful intercept npc notification",
      icon: BookOpen,
      action: () => {
        setNavSection("intro-course");
        const mod = syllabusModules.find(m => m.id === "lesson-7") || syllabusModules[6];
        if (mod) setSelectedModule(mod);
      }
    },
    {
      id: "mod-unit-8",
      title: "Unit 8: Digital Evidence Admissibility & Cyber Jurisprudence",
      category: "curriculum",
      categoryLabel: "Curriculum Unit",
      description: "Rules on Electronic Evidence (A.M. No. 01-7-01-SC), chain of custody verification, and forensic expert witness testimony.",
      keywords: "unit 8 electronic evidence admissibility court am 01-7-01-sc chain of custody expert testimony judicial affidavit",
      icon: BookOpen,
      action: () => {
        setNavSection("intro-course");
        const mod = syllabusModules.find(m => m.id === "lesson-8") || syllabusModules[7];
        if (mod) setSelectedModule(mod);
      }
    },

    // --- FORENSIC LABS & PRACTICUM TOOLS ---
    {
      id: "tool-kali-desktop",
      title: "Kali Linux Forensic Virtual Desktop",
      category: "labs",
      categoryLabel: "Virtual Lab",
      description: "Simulated graphical forensic desktop pre-loaded with Volatility 3, Autopsy, SleuthKit, and Wireshark.",
      keywords: "kali linux virtual desktop autopsy volatility sleuthkit gui xfce forensic station",
      icon: Cpu,
      action: () => {
        setNavSection("forensic-sandbox");
      }
    },
    {
      id: "tool-terminal-sandbox",
      title: "Forensic SIFT Terminal Sandbox",
      category: "labs",
      categoryLabel: "Terminal CLI",
      description: "Interactive command-line sandbox for executing triage commands, string searches, volatile memory inspections, and hash validation.",
      keywords: "terminal sandbox cli sift commands bash linux triage grep strings sha256sum",
      icon: Terminal,
      action: () => {
        setNavSection("terminal-playground");
      }
    },
    {
      id: "tool-sans-vault",
      title: "SANS DFIR Academic Reference Vault",
      category: "labs",
      categoryLabel: "Academic Library",
      description: "Canonical SANS Institute research whitepapers, memory analysis cheat sheets, and field acquisition cheat sheets.",
      keywords: "sans institute dfir vault whitepapers cheat sheets posters memory forensics network analysis",
      icon: BookMarked,
      action: () => {
        setNavSection("sans-vault");
      }
    },
    {
      id: "tool-messages",
      title: "Direct Faculty Messages & Advising",
      category: "academics",
      categoryLabel: "Communication",
      description: "Direct real-time inquiry channel with CDI 409 course instructors and academic advisors.",
      keywords: "messages direct messaging faculty instructor inquiry chat communications advisor",
      icon: MessageSquare,
      action: () => {
        router.push("/dashboard/student/messages");
      }
    },
    {
      id: "tool-badges",
      title: "Competency Badges & XP Portfolio",
      category: "academics",
      categoryLabel: "Gamified Mastery",
      description: "Review earned digital evidence badges, laboratory achievement points (XP), and IAM credentials.",
      keywords: "badges competencies xp achievements level profile gamification portfolio",
      icon: Award,
      action: () => {
        setNavSection("badges");
      }
    }
  ], [syllabusModules]);

  // Filtered search items based on query and category
  const filteredSearchItems = useMemo(() => {
    const q = globalSearchQuery.trim().toLowerCase();
    return SEARCH_ITEMS.filter((item) => {
      if (globalSearchCategory !== "all" && item.category !== globalSearchCategory) {
        return false;
      }
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.keywords.toLowerCase().includes(q) ||
        item.categoryLabel.toLowerCase().includes(q)
      );
    });
  }, [SEARCH_ITEMS, globalSearchQuery, globalSearchCategory]);

  const handleSelectItem = (item) => {
    item.action();
    setGlobalSearchOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSearchSelectedIndex((prev) => (prev + 1 < filteredSearchItems.length ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSearchSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : filteredSearchItems.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredSearchItems[searchSelectedIndex]) {
        handleSelectItem(filteredSearchItems[searchSelectedIndex]);
      }
    } else if (e.key === "Escape") {
      setGlobalSearchOpen(false);
    }
  };

  // Lab Hints State
  const [showLabHint, setShowLabHint] = useState(false);

  // Intro Course State
  const [introCourseActiveVideo, setIntroCourseActiveVideo] = useState("vid-1");
  const [introCourseActiveTab, setIntroCourseActiveTab] = useState("overview");



  // SANS DFIR Vault State
  const [sansSearchQuery, setSansSearchQuery] = useState("");
  const [sansSelectedType, setSansSelectedType] = useState("all");
  const [sansSelectedUnit, setSansSelectedUnit] = useState("all");

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

  // Live Account Password Management State
  const [newPassword, setNewPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);



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
    if (badgeId === "badge-volatility") return !!completedModules["lesson-2"] || extractedComponents.length === 5;
    if (badgeId === "badge-hex-hunter") return !!completedModules["lesson-4"] || discoveredMemoryStrings.length >= 3;
    if (badgeId === "badge-warrant-master") return !!completedModules["lesson-7"];
    if (badgeId === "badge-green-defender") return !!completedModules["lesson-8"];
    if (badgeId === "badge-moot-defender") return !!completedModules["lesson-3"] || !!completedModules["moot-counsel"];
    return false;
  };

  // Forensic Sandbox State & Rewards
  const [sandboxPoints, setSandboxPoints] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPoints = localStorage.getItem("cdi409_forensic_sandbox_xp");
      if (savedPoints) {
        setSandboxPoints(parseInt(savedPoints, 10) || 0);
      }
    }
  }, []);

  const handleAwardSandboxXP = (xp) => {
    setSandboxPoints((prev) => {
      const next = prev + xp;
      if (typeof window !== "undefined") {
        localStorage.setItem("cdi409_forensic_sandbox_xp", next.toString());
      }
      return next;
    });
  };

  const unlockedBadgesCount = BADGES_DATA.filter((b) => isBadgeUnlocked(b.id)).length;
  const totalStudentPoints =
    BADGES_DATA.filter((b) => isBadgeUnlocked(b.id)).reduce((acc, b) => acc + b.points, 0) +
    sandboxPoints;

  const completedCount = Object.values(completedModules).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / (syllabusModules.length || 1)) * 100);

  // Dynamic Grade Computation (Section VIII OBE Formula: 60% Summative + 40% Classwork)
  const dynamicGrades = useMemo(() => {
    const raw = dbGrades || {};
    const classworkMean = Number(raw.classwork || 88);
    const hasExamScores = Boolean(Number(raw.midterms || 0) > 0 || Number(raw.finals || 0) > 0);

    // In OBE academic portals, when semester exams are not yet submitted by faculty,
    // the running standing grade is computed from verified classwork and laboratory milestones.
    const effectiveFinal = hasExamScores && Number(raw.finalGrade || 0) > 0 ? Number(raw.finalGrade) : classworkMean;

    let gpaEquivalent = "1.75 (88-90%)";
    if (effectiveFinal >= 97) gpaEquivalent = "1.00 (97-100%)";
    else if (effectiveFinal >= 94) gpaEquivalent = "1.25 (94-96%)";
    else if (effectiveFinal >= 91) gpaEquivalent = "1.50 (91-93%)";
    else if (effectiveFinal >= 88) gpaEquivalent = "1.75 (88-90%)";
    else if (effectiveFinal >= 85) gpaEquivalent = "2.00 (85-87%)";
    else if (effectiveFinal >= 80) gpaEquivalent = "2.25 (80-84%)";
    else if (effectiveFinal >= 75) gpaEquivalent = "3.00 (75-79%)";
    else gpaEquivalent = "5.00 (Failed)";

    return {
      ...raw,
      classwork: classworkMean,
      finalGrade: effectiveFinal,
      gpa: gpaEquivalent,
      isPassed: effectiveFinal >= 75,
      isExamPending: !hasExamScores
    };
  }, [dbGrades]);

  // 1. Initial Session & Saved Progress Loader (Runs once on mount)
  useEffect(() => {
    async function loadUserSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        let stored = null;
        let role = null;

        if (typeof window !== "undefined") {
          const raw = localStorage.getItem("student_profile");
          if (raw) {
            try {
              stored = JSON.parse(raw);
              role = stored.role?.toLowerCase();
            } catch (e) {}
          }
          if (!role) {
            role = localStorage.getItem("user_role")?.toLowerCase();
          }
        }

        // STRICT AUTH GUARD: Unauthenticated users are redirected to the landing page
        if (!session?.user && !stored) {
          console.warn("CDI 409 RBAC: Unauthenticated access blocked. Redirecting to landing portal.");
          router.replace("/");
          return;
        }

        // ROLE GUARD: Allow faculty and superadmin to view as student in preview mode
        const isStaff = role === "faculty" || role === "instructor" || role === "admin" || role === "superadmin";
        if (isStaff) {
          setIsFacultyPreview(true);
          setStaffRole(role);
        }

        // Clearance granted
        setIsAuthorized(true);

        if (stored) {
          setUserProfile((prev) => ({
            ...prev,
            name: isStaff
              ? (stored.name ? `${stored.name} (Student View)` : "Faculty Student Preview")
              : formatStudentDisplayName(stored.name || prev.name),
            id: isStaff ? "STU-PREVIEW-409" : (stored.studentId || "22100001903"),
            program: stored.program || prev.program,
            section: stored.section || prev.section,
            yearLevel: stored.yearLevel || prev.yearLevel,
          }));
        }

        if (typeof window !== "undefined") {
          const savedCompleted = localStorage.getItem("student_completed_modules");
          if (savedCompleted) {
            try {
              setCompletedModules(JSON.parse(savedCompleted));
            } catch (e) { }
          }
        }

        if (session?.user) {
          setCurrentUser(session.user);
          // Overwrite with real DB data if available
          const dbCompleted = await getStudentCompletedModules(session.user.id);
          if (Object.keys(dbCompleted).length > 0) {
            setCompletedModules(prev => ({ ...prev, ...dbCompleted }));
          }

          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (profile) {
            const formattedName = formatStudentDisplayName(profile.full_name || session.user.email);
            const profIsStaff = profile.role === "instructor" || profile.role === "superadmin" || isStaff;
            setUserProfile((prev) => ({
              ...prev,
              id: profIsStaff ? "STU-PREVIEW-409" : (profile.student_or_faculty_id || "22100001903"),
              name: profIsStaff ? `${formattedName} (Student View)` : formattedName,
              program: profile.program || "Bachelor of Science in Criminology",
              yearLevel: profile.year_level || "4th Year",
              section: profile.section || "Section Alpha",
              institution: "Father Saturnino Urios University",
              avatar: formattedName.charAt(0) || "K"
            }));
          }

          // Fetch student grades from Supabase grading_records
          const grades = await getStudentGrades(session.user.id);
          if (grades) {
            setDbGrades(grades);
          }
        }

        const { data: quizzesData, error: quizzesError } = await supabase.from("quizzes").select("*");
        if (!quizzesError && quizzesData) {
          const parsedQuizzes = {};
          quizzesData.forEach((q) => {
            parsedQuizzes[`lesson-${q.module_id}`] = q.questions;
          });
          const { data: modulesData } = await supabase.from("modules").select("id, unit_number");
          if (modulesData) {
            const moduleMap = {};
            modulesData.forEach(m => moduleMap[m.id] = m.unit_number);
            const formattedQuizzes = {};
            quizzesData.forEach((q) => {
              const unit = moduleMap[q.module_id];
              if (unit) {
                formattedQuizzes[`lesson-${unit}`] = q.questions;
              }
            });
            setDynamicQuizzes(formattedQuizzes);
          }
        }
      } catch (err) {
        console.warn("Session check notice:", err.message);
      } finally {
        setIsPageLoading(false);
        setIsCheckingAuth(false);
      }
    }
    loadUserSession();

    // Fetch dynamic syllabus modules instead of static local ones
    fetchDynamicModules().then((initialModules) => {
      setSyllabusModules(initialModules);
      setSelectedModule((prev) => initialModules.find((m) => m.id === prev?.id) || initialModules[0]);
    });

    const handleCurriculumUpdate = (e) => {
      if (e.detail && Array.isArray(e.detail)) {
        setSyllabusModules(e.detail);
        setSelectedModule((prev) => e.detail.find((m) => m.id === prev?.id) || e.detail[0]);
      }
    };

    window.addEventListener("cdi409_curriculum_updated", handleCurriculumUpdate);
    return () => {
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





  const filteredModules = syllabusModules.filter(
    (m) =>
      m.title.toLowerCase().includes(moduleSearch.toLowerCase()) ||
      m.period.toLowerCase().includes(moduleSearch.toLowerCase()) ||
      m.topics.some((t) => t.toLowerCase().includes(moduleSearch.toLowerCase()))
  );



  const currentUnitQuiz = dynamicQuizzes[selectedModule?.id] || SYLLABUS_QUIZZES[selectedModule?.id] || SYLLABUS_QUIZZES["lesson-2"];

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6 text-center">
        <div className="relative h-12 w-12 rounded-full p-0.5 bg-gradient-to-tr from-[#C5A059] to-[#002D62] shadow-sm overflow-hidden mb-4 animate-pulse">
          <img src="/fsuu_seal.jpg" alt="FSUU CCJE Seal" className="h-full w-full object-cover rounded-full" />
        </div>
        <Loader2 className="h-6 w-6 text-[#002D62] animate-spin mb-2" />
        <p className="text-sm font-semibold text-[#002D62] font-serif">Verifying Student Clearance...</p>
        <p className="text-xs text-slate-500 font-mono mt-0.5">CDI 409 Secure Forensic Gateway</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1E293B] flex flex-col md:flex-row font-sans selection:bg-[#002D62] selection:text-white">


      {/* 1. Sleek Minimal Sidebar with Toggle Switch */}
      <aside
        className={`${sidebarCollapsed ? "md:w-20" : "md:w-64"
          } w-full bg-white border-r border-[#EAEAEA] flex flex-col justify-between shrink-0 md:h-screen md:sticky md:top-0 z-30 transition-all duration-300 ease-in-out relative`}
      >
        {/* Floating Center-Edge Sidebar Toggle Button */}
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
          <div className="p-4 border-b border-[#F0F0F0] flex items-center justify-between">
            <Link href="/dashboard/student" onClick={() => setNavSection("overview")} className={`flex items-center gap-2.5 ${sidebarCollapsed ? "justify-center w-full" : ""}`}>
              <div className="relative h-8 w-8 rounded-full p-0.5 bg-gradient-to-tr from-[#C5A059] to-[#002D62] shadow-sm shrink-0 overflow-hidden">
                <img src="/fsuu_seal.jpg" alt="FSUU CCJE Seal" className="h-full w-full object-cover rounded-full" />
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0">
                  <div className="font-bold text-[#002D62] text-xs tracking-tight font-serif truncate">
                    Urios CyberLearn
                  </div>
                  <div className="text-[10px] text-[#666] font-mono truncate">FSUU CCJE Criminology</div>
                </div>
              )}
            </Link>
          </div>

          {!sidebarCollapsed && (
            <div className="p-4 mx-3 my-3 bg-[#F8F9FA] rounded-xl border border-[#EFEFEF] space-y-2.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-[#002D62]">Lesson Progress</span>
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

          {/* Navigation Links (Genuine Dynamic Student Features) */}
          <nav className="p-2.5 space-y-3 overflow-y-auto max-h-[calc(100vh-250px)]">
            {[
              {
                category: "Academics",
                items: [
                  { id: "overview", label: "Student Overview", icon: LayoutDashboard },
                  { id: "intro-course", label: "Lessons & Syllabus", icon: BookOpen }
                ]
              },
              {
                category: "Forensic Practicum",
                items: [
                  { id: "forensic-sandbox", label: "Forensic Terminal", icon: Terminal }
                ]
              },
              {
                category: "Research & DFIR",
                items: [
                  { id: "sans-vault", label: "SANS DFIR Vault", icon: BookMarked }
                ]
              },
              {
                category: "Student Records",
                items: [
                  { id: "badges", label: "Competency Badges", icon: Award },
                  { id: "profile-settings", label: "Profile Settings", icon: UserCheck }
                ]
              }
            ].map((section, sIdx) => (
              <div key={sIdx} className="space-y-0.5">
                {!sidebarCollapsed && (
                  <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider px-3 py-1">
                    {section.category}
                  </div>
                )}
                {section.items.map((item) => {
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
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        sidebarCollapsed ? "justify-center" : ""
                      } ${
                        isActive
                          ? "bg-[#002D62] text-white font-semibold shadow-xs"
                          : "text-slate-600 hover:text-[#002D62] hover:bg-slate-100/80"
                      }`}
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-[#C5A059]" : "text-slate-500"}`} />
                      {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Minimal User Profile & Logout */}
        <div className="p-3 border-t border-[#F0F0F0] bg-white">
          <div
            className={`flex items-center justify-between p-1.5 rounded-lg hover:bg-[#F8F9FA] transition-colors ${sidebarCollapsed ? "justify-center" : ""
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
        {/* Student View Banner for Instructors & SuperAdmins */}
        {isFacultyPreview && (
          <div className="bg-[#002D62] text-white px-4 py-2.5 flex items-center justify-between text-xs sticky top-0 z-30 border-b border-[#C5A059]/40 shadow-sm">
            <div className="flex items-center gap-2.5">
              <Badge className="bg-[#C5A059] text-[#001F44] font-bold text-[10px] font-mono tracking-wider">
                STUDENT PREVIEW MODE
              </Badge>
              <span className="text-slate-200 hidden sm:inline text-xs">
                You are previewing the student forensic portal as an authorized instructor/administrator.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Link href={staffRole === "superadmin" ? "/dashboard/superadmin" : "/dashboard/admin"}>
                <Button size="sm" variant="outline" className="h-7 text-xs bg-white text-[#002D62] hover:bg-slate-100 border-none font-semibold rounded-lg cursor-pointer shadow-xs">
                  &larr; Exit Student View
                </Button>
              </Link>
            </div>
          </div>
        )}

        <header className="h-14 bg-white border-b border-[#EAEAEA] px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3 text-xs">
            <span className="font-bold text-[#002D62] font-serif tracking-tight text-xs sm:text-sm">
              FATHER SATURNINO URIOS UNIVERSITY
            </span>
            <Badge className={`text-[10px] font-mono hidden sm:inline-flex ${isFacultyPreview ? "bg-amber-100 text-amber-900 border border-amber-300" : "bg-slate-100 text-[#002D62] border border-slate-200"}`}>
              {isFacultyPreview ? "Preview Mode" : "Student Portal"}
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
              <div className="absolute top-12 right-20 w-80 bg-white border border-[#EAEAEA] rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 flex flex-col">
                <div className="p-3 border-b border-[#EAEAEA] flex items-center justify-between bg-[#F8F9FA]">
                  <h3 className="text-xs font-bold text-[#002D62] font-serif">Direct Messages</h3>
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
                      No direct messages yet.
                    </div>
                  ) : (
                    (() => {
                      const inboxThreads = [];
                      const threadMap = {};
                      // Loop backwards to get the latest message per user
                      [...messages].reverse().forEach(msg => {
                        const otherId = msg.sender_id === userProfile.id ? msg.receiver_id : msg.sender_id;
                        if (otherId === 'BROADCAST') return;
                        if (!threadMap[otherId]) {
                          threadMap[otherId] = true;
                          inboxThreads.push({
                            id: otherId,
                            name: msg.sender_id === userProfile.id ? "Instructor" : (msg.sender_name || "Instructor"),
                            latestMessage: msg.content,
                            time: msg.created_at,
                            is_read: msg.sender_id === userProfile.id ? true : msg.is_read
                          });
                        }
                      });

                      if (inboxThreads.length === 0) {
                        return (
                          <div className="text-center text-[11px] text-[#888] flex flex-col items-center gap-2 py-8">
                            <MessageSquare className="h-6 w-6 text-[#E5E5E5]" />
                            No direct messages yet.
                          </div>
                        );
                      }

                      return inboxThreads.map((thread, i) => (
                        <div key={i} className={`p-3 cursor-pointer border-b border-[#EAEAEA] flex gap-3 ${!thread.is_read ? 'bg-sky-50/30' : 'hover:bg-[#F8F9FA]'}`} onClick={() => router.push('/dashboard/student/messages')}>
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
                    onClick={() => router.push('/dashboard/student/messages')}
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
              <div className="absolute top-12 right-12 w-80 bg-white border border-[#EAEAEA] rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="p-3 border-b border-[#EAEAEA] flex items-center justify-between bg-[#F8F9FA]">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-[#002D62] font-serif">Notifications</h3>
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
                      No new notifications.
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div key={notif.id} className={`p-3 cursor-pointer border-b border-[#EAEAEA] flex gap-3 ${!notif.is_read ? 'bg-sky-50/30' : 'hover:bg-[#F8F9FA]'}`}>
                        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                          <Shield className="h-4 w-4 text-emerald-600" />
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
                    <button className="text-[10px] font-semibold text-[#002D62] hover:underline">View All Notifications</button>
                  </div>
                )}
              </div>
            )}

            <div className="w-px h-4 bg-[#EAEAEA] mx-1"></div>

            {/* Student Quick Profile Chip */}
            <button
              type="button"
              onClick={() => setNavSection("profile-settings")}
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200/80 transition-all border border-slate-200 cursor-pointer"
              title="View Profile Settings"
            >
              <div className="h-6 w-6 rounded-full bg-[#002D62] text-[#DFCA95] flex items-center justify-center font-bold text-[10px] font-mono shrink-0">
                {userProfile.avatar || "K"}
              </div>
              <span className="text-xs font-semibold text-[#002D62] hidden md:inline truncate max-w-[130px]">
                {userProfile.name}
              </span>
            </button>
          </div>
        </header>

        <div className="p-4 md:p-6 max-w-6xl mx-auto w-full flex-1">
          {isPageLoading ? (
            <ForensicSkeletonLoader />
          ) : (
            <>
              {/* SECTION 0: STUDENT OVERVIEW DASHBOARD */}
              {navSection === "overview" && (
                <div className="space-y-6">
                  {/* Welcome Hero Card (Executive University Student Banner) */}
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-[#002D62] via-[#001F44] to-[#002D62] text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-80 h-full bg-[#C5A059]/10 skew-x-12 pointer-events-none" />

                    <div className="space-y-2 relative z-10 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-[#DFCA95] text-[11px] font-mono border border-white/10">
                          <GraduationCap className="h-3 w-3 text-[#C5A059]" />
                          <span>FSUU College of Criminal Justice Education</span>
                        </div>
                      </div>
                      <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight">
                        Welcome back, {userProfile.name ? String(userProfile.name).replace(/^(Cad\.|Cadet)\s+/i, '') : "Student"}!
                      </h1>
                      <p className="text-xs text-slate-200 leading-relaxed">
                        Cybercrime Investigation &amp; Digital Forensics (CDI 409). Master Linux memory artifact recovery, volatile packet carving, and statutory compliance under <strong className="text-amber-300 font-semibold">Republic Act 10175 (Cybercrime Prevention Act)</strong> and <strong className="text-amber-300 font-semibold">Republic Act 10173 (Data Privacy Act)</strong>.
                      </p>

                      {/* Professional Student Academic Strip */}
                      <div className="pt-2 flex flex-wrap items-center gap-2.5 text-[11px] font-mono text-slate-300">
                        <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
                          <Shield className="h-3 w-3 text-[#C5A059]" />
                          <span>ID: <strong className="text-white">{userProfile.id || "22100001903"}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
                          <BookOpen className="h-3 w-3 text-[#C5A059]" />
                          <span>{userProfile.program || "Bachelor of Science in Criminology"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
                          <UserCheck className="h-3 w-3 text-[#C5A059]" />
                          <span>{userProfile.yearLevel || "4th Year"} • {userProfile.section || "Section Alpha"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch sm:items-center gap-2.5 shrink-0 relative z-10 w-full sm:w-auto">
                      <Button
                        onClick={() => setNavSection("intro-course")}
                        className="bg-[#C5A059] hover:bg-[#b08d48] text-[#001F44] font-bold text-xs h-10 px-5 rounded-xl shadow-xs gap-2 cursor-pointer transition-all hover:scale-[1.02]"
                      >
                        <BookOpen className="h-4 w-4" />
                        <span>Resume Lessons</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        onClick={() => setNavSection("forensic-sandbox")}
                        className="bg-white/15 hover:bg-white/25 text-white font-bold text-xs h-10 px-4 rounded-xl shadow-xs gap-2 cursor-pointer border border-white/20 transition-all hover:scale-[1.02]"
                      >
                        <Terminal className="h-4 w-4 text-[#DFCA95]" />
                        <span>Open Kali Terminal</span>
                      </Button>
                    </div>
                  </div>

                  {/* 4 Clean Metric Counter Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                    <Card className="p-4 bg-white border-[#E5E5E5] rounded-xl space-y-1.5 shadow-xs hover:border-[#002D62]/40 transition-colors">
                      <div className="flex items-center justify-between text-[#777]">
                        <span className="text-[11px] font-semibold text-slate-500">Curriculum Progress</span>
                        <BookOpen className="h-4 w-4 text-[#002D62]" />
                      </div>
                      <div className="text-xl font-bold text-[#002D62] font-mono">
                        {completedCount} / 8 <span className="text-xs font-normal text-[#888]">Units</span>
                      </div>
                      <Progress value={progressPercent} className="h-1.5 bg-slate-100" />
                      <div className="text-[10px] text-slate-600 font-mono font-medium">{progressPercent}% Units Verified</div>
                    </Card>

                    <Card className="p-4 bg-white border-[#E5E5E5] rounded-xl space-y-1.5 shadow-xs hover:border-[#002D62]/40 transition-colors">
                      <div className="flex items-center justify-between text-[#777]">
                        <span className="text-[11px] font-semibold text-slate-500">Forensic Experience</span>
                        <Flame className="h-4 w-4 text-amber-500" />
                      </div>
                      <div className="text-xl font-bold text-[#002D62] font-mono">
                        {totalStudentPoints} <span className="text-xs font-normal text-[#888]">XP</span>
                      </div>
                      <div className="text-[10px] text-amber-700 font-semibold flex items-center gap-1">
                        <Award className="h-3 w-3 text-amber-600" />
                        <span>{totalStudentPoints >= 600 ? "Senior Investigator" : totalStudentPoints >= 300 ? "Field Investigator" : "Student Examiner"}</span>
                      </div>
                    </Card>

                    <Card className="p-4 bg-white border-[#E5E5E5] rounded-xl space-y-1.5 shadow-xs hover:border-[#002D62]/40 transition-colors">
                      <div className="flex items-center justify-between text-[#777]">
                        <span className="text-[11px] font-semibold text-slate-500">Competency Badges</span>
                        <Medal className="h-4 w-4 text-[#C5A059]" />
                      </div>
                      <div className="text-xl font-bold text-[#002D62] font-mono">
                        {unlockedBadgesCount} / 5 <span className="text-xs font-normal text-[#888]">Unlocked</span>
                      </div>
                      <div className="text-[10px] text-slate-600 font-medium">
                        {5 - unlockedBadgesCount > 0 ? `${5 - unlockedBadgesCount} badge${5 - unlockedBadgesCount > 1 ? "s" : ""} to next rank` : "All Specialized Badges Unlocked"}
                      </div>
                    </Card>

                    <Card className="p-4 bg-white border-[#E5E5E5] rounded-xl space-y-1.5 shadow-xs hover:border-[#002D62]/40 transition-colors">
                      <div className="flex items-center justify-between text-[#777]">
                        <span className="text-[11px] font-semibold text-slate-500">Enrollment Status</span>
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div className="text-xl font-bold text-emerald-700 font-mono">
                        Active Enrollee
                      </div>
                      <div className="text-[10px] font-semibold text-slate-600 flex items-center gap-1">
                        <GraduationCap className="h-3 w-3 text-[#002D62]" />
                        <span>FSUU CCJE • Regular</span>
                      </div>
                    </Card>
                  </div>

                  {/* High-Value Academic & Practicum Hub (6 Clean Cards) */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-bold text-[#002D62] font-serif uppercase tracking-wider flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4 text-[#C5A059]" />
                        <span>Academic &amp; Forensic Practicum Modules</span>
                      </h2>
                      <span className="text-xs text-slate-500 font-mono">CHED CMO Compliant • OBE System</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Hub 1: Forensic Lessons */}
                      <div className="p-4 bg-white border border-[#E5E5E5] hover:border-[#002D62] rounded-xl shadow-xs transition-all flex flex-col justify-between space-y-3 group">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="h-9 w-9 rounded-lg bg-[#002D62]/10 text-[#002D62] flex items-center justify-center group-hover:bg-[#002D62] group-hover:text-white transition-colors">
                              <BookOpen className="h-4 w-4" />
                            </div>
                            <Badge variant="outline" className="text-[10px] border-slate-200 text-[#002D62] font-mono">
                              8 Units • CDI 409
                            </Badge>
                          </div>
                          <h3 className="text-sm font-bold text-[#002D62] font-serif">Forensic Lessons &amp; Syllabus</h3>
                          <p className="text-xs text-[#666] leading-relaxed">
                            Video lectures, statutory readings under RA 10175 and RA 10173, and interactive chapter assessments.
                          </p>
                        </div>
                        <Button
                          onClick={() => setNavSection("intro-course")}
                          variant="outline"
                          className="w-full text-xs h-8.5 border-[#002D62]/30 text-[#002D62] hover:bg-[#002D62] hover:text-white font-semibold rounded-lg transition-colors flex items-center justify-between cursor-pointer"
                        >
                          <span>Open Lessons &amp; Syllabus</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      {/* Hub 2: Forensic Terminal */}
                      <div className="p-4 bg-white border border-[#E5E5E5] hover:border-[#002D62] rounded-xl shadow-xs transition-all flex flex-col justify-between space-y-3 group">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="h-9 w-9 rounded-lg bg-[#002D62]/10 text-[#002D62] flex items-center justify-center group-hover:bg-[#002D62] group-hover:text-white transition-colors">
                              <Terminal className="h-4 w-4" />
                            </div>
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-mono">
                              Live SIFT Range
                            </Badge>
                          </div>
                          <h3 className="text-sm font-bold text-[#002D62] font-serif">Kali Forensic Terminal</h3>
                          <p className="text-xs text-[#666] leading-relaxed">
                            Simulated Linux CLI with Volatility 3, Autopsy, tshark, and real-time evidence dockets CF-01 to CF-03.
                          </p>
                        </div>
                        <Button
                          onClick={() => setNavSection("forensic-sandbox")}
                          variant="outline"
                          className="w-full text-xs h-8.5 border-[#002D62]/30 text-[#002D62] hover:bg-[#002D62] hover:text-white font-semibold rounded-lg transition-colors flex items-center justify-between cursor-pointer"
                        >
                          <span>Launch Forensic Terminal</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      {/* Hub 3: SANS DFIR Research Vault */}
                      <div className="p-4 bg-white border border-[#E5E5E5] hover:border-[#002D62] rounded-xl shadow-xs transition-all flex flex-col justify-between space-y-3 group">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="h-9 w-9 rounded-lg bg-[#002D62]/10 text-[#002D62] flex items-center justify-center group-hover:bg-[#002D62] group-hover:text-white transition-colors">
                              <BookMarked className="h-4 w-4" />
                            </div>
                            <Badge className="bg-[#C5A059]/15 text-[#002D62] border-[#C5A059]/30 text-[10px] font-mono">
                              Canonical DFIR
                            </Badge>
                          </div>
                          <h3 className="text-sm font-bold text-[#002D62] font-serif">SANS DFIR Research Vault</h3>
                          <p className="text-xs text-[#666] leading-relaxed">
                            Peer-reviewed SANS Institute forensic posters, memory cheat sheets, and digital acquisition whitepapers.
                          </p>
                        </div>
                        <Button
                          onClick={() => setNavSection("sans-vault")}
                          variant="outline"
                          className="w-full text-xs h-8.5 border-[#002D62]/30 text-[#002D62] hover:bg-[#002D62] hover:text-white font-semibold rounded-lg transition-colors flex items-center justify-between cursor-pointer"
                        >
                          <span>Explore DFIR Vault</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      {/* Hub 4: Student Identity & Settings */}
                      <div className="p-4 bg-white border border-[#E5E5E5] hover:border-[#002D62] rounded-xl shadow-xs transition-all flex flex-col justify-between space-y-3 group">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="h-9 w-9 rounded-lg bg-[#002D62]/10 text-[#002D62] flex items-center justify-center group-hover:bg-[#002D62] group-hover:text-white transition-colors">
                              <UserCheck className="h-4 w-4" />
                            </div>
                            <Badge variant="outline" className="text-[10px] border-slate-200 text-[#002D62] font-mono">
                              Account Security
                            </Badge>
                          </div>
                          <h3 className="text-sm font-bold text-[#002D62] font-serif">Profile &amp; Settings</h3>
                          <p className="text-xs text-[#666] leading-relaxed">
                            Configure institutional credentials, section enrollment, and update account authentication password.
                          </p>
                        </div>
                        <Button
                          onClick={() => setNavSection("profile-settings")}
                          variant="outline"
                          className="w-full text-xs h-8.5 border-[#002D62]/30 text-[#002D62] hover:bg-[#002D62] hover:text-white font-semibold rounded-lg transition-colors flex items-center justify-between cursor-pointer"
                        >
                          <span>Manage Profile</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      {/* Hub 5: Competency Badges & XP */}
                      <div className="p-4 bg-white border border-[#E5E5E5] hover:border-[#002D62] rounded-xl shadow-xs transition-all flex flex-col justify-between space-y-3 group">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="h-9 w-9 rounded-lg bg-[#002D62]/10 text-[#002D62] flex items-center justify-center group-hover:bg-[#002D62] group-hover:text-white transition-colors">
                              <Award className="h-4 w-4" />
                            </div>
                            <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-[10px] font-mono">
                              Mastery Badges
                            </Badge>
                          </div>
                          <h3 className="text-sm font-bold text-[#002D62] font-serif">Competency Badges</h3>
                          <p className="text-xs text-[#666] leading-relaxed">
                            Review earned digital evidence badges, laboratory achievement points (XP), and verified forensics mastery.
                          </p>
                        </div>
                        <Button
                          onClick={() => setNavSection("badges")}
                          variant="outline"
                          className="w-full text-xs h-8.5 border-[#002D62]/30 text-[#002D62] hover:bg-[#002D62] hover:text-white font-semibold rounded-lg transition-colors flex items-center justify-between cursor-pointer"
                        >
                          <span>View Badges &amp; XP</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      {/* Hub 6: Direct Faculty Messaging & Advisory */}
                      <div className="p-4 bg-white border border-[#E5E5E5] hover:border-[#002D62] rounded-xl shadow-xs transition-all flex flex-col justify-between space-y-3 group">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="h-9 w-9 rounded-lg bg-[#002D62]/10 text-[#002D62] flex items-center justify-center group-hover:bg-[#002D62] group-hover:text-white transition-colors">
                              <MessageSquare className="h-4 w-4" />
                            </div>
                            <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-mono">
                              Direct Advisory
                            </Badge>
                          </div>
                          <h3 className="text-sm font-bold text-[#002D62] font-serif">Faculty Inquiries &amp; Messages</h3>
                          <p className="text-xs text-[#666] leading-relaxed">
                            Communicate directly with your CDI 409 instructor, submit forensic clarification requests, and check broadcasts.
                          </p>
                        </div>
                        <Button
                          onClick={() => router.push("/dashboard/student/messages")}
                          variant="outline"
                          className="w-full text-xs h-8.5 border-[#002D62]/30 text-[#002D62] hover:bg-[#002D62] hover:text-white font-semibold rounded-lg transition-colors flex items-center justify-between cursor-pointer"
                        >
                          <span>Open Messages</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Investigation Dockets & Milestone Tracker */}
                  <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="text-sm font-bold text-[#002D62] font-serif flex items-center gap-2">
                          <Terminal className="h-4 w-4 text-[#C5A059]" />
                          <span>Active Forensic Investigation Dockets</span>
                        </h3>
                        <p className="text-xs text-slate-500">
                          Interactive hands-on cases mapped to Philippine statutory provisions.
                        </p>
                      </div>
                      <Badge className="bg-[#002D62] text-[#DFCA95] text-[10px] font-mono px-2.5 py-1 self-start sm:self-auto">
                        3 Practicum Missions
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                      <div className="p-3.5 rounded-xl border border-slate-200 hover:border-[#002D62] transition-all bg-[#F8F9FA] space-y-2 flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-[#002D62] bg-[#002D62]/10 px-2 py-0.5 rounded">CF-01</span>
                            <span className="text-[10px] font-mono text-emerald-700 font-semibold">+350 XP</span>
                          </div>
                          <div className="text-xs font-bold text-[#002D62] font-serif">Operation Nightfall</div>
                          <div className="text-[11px] text-slate-600 leading-snug">
                            Volatile RAM memory triage, malicious inject carving, and RA 10175 Sec. 4(a)(1) illegal access analysis.
                          </div>
                        </div>
                        <Button
                          onClick={() => setNavSection("forensic-sandbox")}
                          size="sm"
                          className="w-full text-xs h-8 bg-[#002D62] hover:bg-[#001F44] text-[#DFCA95] font-semibold rounded-lg mt-2 cursor-pointer"
                        >
                          Simulate Docket CF-01 &rarr;
                        </Button>
                      </div>

                      <div className="p-3.5 rounded-xl border border-slate-200 hover:border-[#002D62] transition-all bg-[#F8F9FA] space-y-2 flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-[#002D62] bg-[#002D62]/10 px-2 py-0.5 rounded">CF-02</span>
                            <span className="text-[10px] font-mono text-emerald-700 font-semibold">+400 XP</span>
                          </div>
                          <div className="text-xs font-bold text-[#002D62] font-serif">Operation DeepPacket</div>
                          <div className="text-[11px] text-slate-600 leading-snug">
                            Network PCAP stream dissection, exfiltration beacon detection, and RA 10175 Sec. 4(a)(2) interception.
                          </div>
                        </div>
                        <Button
                          onClick={() => setNavSection("forensic-sandbox")}
                          size="sm"
                          className="w-full text-xs h-8 bg-[#002D62] hover:bg-[#001F44] text-[#DFCA95] font-semibold rounded-lg mt-2 cursor-pointer"
                        >
                          Simulate Docket CF-02 &rarr;
                        </Button>
                      </div>

                      <div className="p-3.5 rounded-xl border border-slate-200 hover:border-[#002D62] transition-all bg-[#F8F9FA] space-y-2 flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-[#002D62] bg-[#002D62]/10 px-2 py-0.5 rounded">CF-03</span>
                            <span className="text-[10px] font-mono text-emerald-700 font-semibold">+450 XP</span>
                          </div>
                          <div className="text-xs font-bold text-[#002D62] font-serif">Operation DataVault</div>
                          <div className="text-[11px] text-slate-600 leading-snug">
                            Database dump analysis, citizen SSS/TIN record carving, and RA 10173 Sec. 25 &amp; 29 privacy breach triage.
                          </div>
                        </div>
                        <Button
                          onClick={() => setNavSection("forensic-sandbox")}
                          size="sm"
                          className="w-full text-xs h-8 bg-[#002D62] hover:bg-[#001F44] text-[#DFCA95] font-semibold rounded-lg mt-2 cursor-pointer"
                        >
                          Simulate Docket CF-03 &rarr;
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}



              {/* SECTION 1.5: INTRO TO CYBERSECURITY (COURSERA CLONE) */}
              {navSection === "intro-course" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

                  {/* Left Column: Video Player & Tabs */}
                  <div className="lg:col-span-8 space-y-4">
                    {/* Video Player or Placeholder */}
                    {(() => {
                      const currentVideo = getIntroVideoById(introCourseActiveVideo, dynamicCourseData);

                      if (currentVideo?.is_locked) {
                        return (
                          <div className="w-full aspect-video bg-black rounded-xl overflow-hidden relative flex flex-col items-center justify-center shadow-md border border-slate-800">
                            <Lock className="h-12 w-12 text-[#C5A059] mb-4 opacity-80" />
                            <h3 className="text-white font-serif text-lg font-bold">Lesson Locked</h3>
                            <p className="text-slate-400 text-sm mt-1">This lesson is currently locked.</p>
                          </div>
                        );
                      }

                      const hasVideoUrl = currentVideo?.video_url && currentVideo.video_url.trim() !== "";

                      if (hasVideoUrl) {
                        let embedUrl = currentVideo.video_url;
                        // Auto-convert standard YouTube URLs to embed URLs
                        if (embedUrl.includes("youtube.com/watch?v=")) {
                          embedUrl = embedUrl.replace("watch?v=", "embed/");
                          // Remove any extra parameters like &t=
                          embedUrl = embedUrl.split("&")[0];
                        } else if (embedUrl.includes("youtu.be/")) {
                          embedUrl = embedUrl.replace("youtu.be/", "youtube.com/embed/");
                          embedUrl = embedUrl.split("?")[0];
                        }

                        return (
                          <div className="w-full aspect-video bg-black rounded-xl overflow-hidden relative shadow-md border border-slate-800">
                            <iframe
                              src={embedUrl}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                          </div>
                        );
                      }

                      // Official lecture & curriculum reading view when video is not attached
                      return (
                        <div className="w-full p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#002D62] via-[#001F44] to-[#001835] text-white shadow-md border border-slate-800 relative overflow-hidden flex flex-col justify-between min-h-[190px]">
                          <div className="absolute right-0 top-0 w-72 h-full bg-[#C5A059]/10 skew-x-12 pointer-events-none" />
                          <div className="space-y-2 relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[#DFCA95] text-[11px] font-mono">
                              <BookOpen className="h-3.5 w-3.5 text-[#C5A059]" />
                              <span>Curriculum Reading &amp; Statutory Takeaways</span>
                            </div>
                            <h3 className="text-xl sm:text-2xl font-bold font-serif text-white tracking-tight">
                              {currentVideo?.title || "Digital Forensics & Cybercrime Investigation"}
                            </h3>
                            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                              This unit focuses on statutory provisions, procedural evidence rules, and canonical SANS DFIR whitepapers. Review the lecture takeaways, reading material, and downloads below.
                            </p>
                          </div>
                          <div className="pt-4 flex flex-wrap items-center gap-3 relative z-10 text-[11px] font-mono text-slate-300">
                            <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
                              <GraduationCap className="h-3.5 w-3.5 text-[#C5A059]" />
                              <span>CHED CDI 409 Curriculum</span>
                            </span>
                            <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                              <span>Lecture Materials Active</span>
                            </span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Video Details & Tabs */}
                    <Card className="p-4 bg-white border-[#E5E5E5] rounded-xl shadow-xs">
                      <Tabs value={introCourseActiveTab} onValueChange={setIntroCourseActiveTab} className="w-full">
                        <TabsList className="grid grid-cols-4 bg-transparent border-b border-[#EAEAEA] p-0 h-10 w-full mb-4 rounded-none">
                          <TabsTrigger value="overview" className="text-xs font-semibold data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#002D62] data-[state=active]:text-[#002D62] rounded-none shadow-none h-full data-[state=active]:shadow-none transition-none">
                            Overview
                          </TabsTrigger>
                          <TabsTrigger value="notes" className="text-xs font-semibold data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#002D62] data-[state=active]:text-[#002D62] rounded-none shadow-none h-full data-[state=active]:shadow-none transition-none">
                            Key Notes
                          </TabsTrigger>
                          <TabsTrigger value="reading" className="text-xs font-semibold data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#002D62] data-[state=active]:text-[#002D62] rounded-none shadow-none h-full data-[state=active]:shadow-none transition-none">
                            Reading Material
                          </TabsTrigger>
                          <TabsTrigger value="downloads" className="text-xs font-semibold data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#002D62] data-[state=active]:text-[#002D62] rounded-none shadow-none h-full data-[state=active]:shadow-none transition-none">
                            Downloads
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="mt-0">
                          <div className="space-y-2 p-4 bg-white rounded-xl border border-[#EAEAEA]">
                            {(() => {
                              const video = getIntroVideoById(introCourseActiveVideo, dynamicCourseData);
                              if (!video) {
                                return <div className="text-sm text-slate-500 py-2">Select a lesson to view its overview.</div>;
                              }
                              return (
                                <>
                                  <h2 className="text-lg font-bold text-[#002D62] font-serif">
                                    {video.title}
                                  </h2>
                                  <p className="text-xs text-[#555] leading-relaxed mt-2">
                                    {video.description || "No description provided for this lesson."}
                                  </p>
                                </>
                              );
                            })()}
                          </div>
                        </TabsContent>

                        <TabsContent value="notes" className="mt-0">
                          <div className="p-4 bg-[#F8F9FA] rounded-xl border border-[#EAEAEA]">
                            <h3 className="text-xs font-bold text-[#002D62] mb-3 uppercase font-mono">Lecture Takeaways</h3>
                            {(() => {
                              const video = getIntroVideoById(introCourseActiveVideo, dynamicCourseData);
                              if (!video || !video.notes) {
                                return <div className="text-xs text-slate-500 italic">No notes provided for this lesson.</div>;
                              }
                              return (
                                <div className="text-xs text-[#444] leading-loose whitespace-pre-line font-sans">
                                  {video.notes}
                                </div>
                              );
                            })()}
                          </div>
                        </TabsContent>

                        <TabsContent value="reading" className="mt-0">
                          <div className="p-4 bg-white border border-[#EAEAEA] rounded-xl space-y-4 max-h-[550px] overflow-y-auto">
                            {(() => {
                              const video = getIntroVideoById(introCourseActiveVideo, dynamicCourseData);
                              const lessonRef = resolveLessonRef(video);
                              const sansResources = getSansResourcesForLesson(lessonRef);
                              const whitepapers = sansResources.filter(r => r.type === "Whitepaper");

                              return (
                                <div className="space-y-4">
                                  {/* Instructor Reading Content (if any) */}
                                  {video?.reading_content && video.reading_content.trim() !== "" && (
                                    <div className="p-4 bg-[#F8F9FA] rounded-xl border border-[#EAEAEA] space-y-2">
                                      <div className="flex items-center gap-2 text-xs font-bold text-[#002D62] font-mono uppercase">
                                        <FileText className="h-3.5 w-3.5 text-[#C5A059]" /> Instructor Lecture Notes
                                      </div>
                                      <div className="text-xs text-[#444] leading-relaxed whitespace-pre-line font-sans">
                                        {video.reading_content}
                                      </div>
                                    </div>
                                  )}

                                  {/* Official SANS Institute Whitepapers Header */}
                                  <div className="p-3.5 bg-gradient-to-r from-[#002D62]/5 via-[#002D62]/10 to-transparent rounded-xl border border-[#002D62]/15 flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                      <div className="h-7 px-2 bg-[#002D62] text-[#C5A059] text-[10px] font-mono font-bold rounded flex items-center shrink-0">
                                        SANS
                                      </div>
                                      <div>
                                        <div className="text-xs font-bold text-[#002D62] font-serif">
                                          Official SANS Institute DFIR Whitepapers
                                        </div>
                                        <div className="text-[10px] text-[#666]">
                                          Peer-reviewed digital forensics research referenced for this module
                                        </div>
                                      </div>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setNavSection("sans-vault")}
                                      className="text-[11px] text-[#002D62] hover:text-[#001F44] font-semibold h-7 px-2"
                                    >
                                      View Vault &rarr;
                                    </Button>
                                  </div>

                                  {/* Whitepaper Cards List */}
                                  {whitepapers.length === 0 ? (
                                    <div className="p-4 text-center text-xs text-slate-500 italic bg-[#FAFAFA] rounded-xl border border-[#EAEAEA]">
                                      No specific SANS whitepapers assigned to this unit. Browse the{" "}
                                      <button onClick={() => setNavSection("sans-vault")} className="text-[#002D62] underline font-semibold">
                                        SANS Vault
                                      </button>{" "}
                                      for related papers.
                                    </div>
                                  ) : (
                                    <div className="space-y-3">
                                      {whitepapers.map((paper) => (
                                        <div
                                          key={paper.id}
                                          className="p-3.5 bg-white rounded-xl border border-[#E5E7EB] hover:border-[#002D62] hover:shadow-xs transition-all space-y-2 group"
                                        >
                                          <div className="flex items-start justify-between gap-3">
                                            <div className="space-y-1 min-w-0">
                                              <div className="flex items-center gap-2 flex-wrap">
                                                <Badge className="bg-[#002D62] text-white text-[9px] font-mono">
                                                  SANS Whitepaper
                                                </Badge>
                                                <Badge variant="outline" className="text-[9px] font-mono border-slate-300 text-slate-600">
                                                  {paper.category}
                                                </Badge>
                                                <span className="text-[10px] text-slate-500 font-mono">
                                                  {paper.estReadTime}
                                                </span>
                                              </div>
                                              <h4 className="text-xs font-bold text-[#002D62] font-serif group-hover:text-[#001F44] leading-snug">
                                                {paper.title}
                                              </h4>
                                              <div className="text-[10px] text-slate-500 font-mono">
                                                Author: {paper.author}
                                              </div>
                                            </div>

                                            <a
                                              href={paper.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="shrink-0 px-2.5 py-1.5 bg-[#F8F9FA] hover:bg-[#002D62] text-[#002D62] hover:text-[#C5A059] border border-[#E2E8F0] hover:border-[#002D62] rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
                                            >
                                              <span>Read on SANS.org</span>
                                              <ExternalLink className="h-3 w-3" />
                                            </a>
                                          </div>

                                          <p className="text-[11px] text-[#555] leading-relaxed">
                                            {paper.summary}
                                          </p>

                                          <div className="flex items-center gap-1.5 flex-wrap pt-1">
                                            {paper.topics.map((t, idx) => (
                                              <span
                                                key={idx}
                                                className="text-[9px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono"
                                              >
                                                #{t}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        </TabsContent>

                        <TabsContent value="downloads" className="mt-0">
                          <div className="p-4 bg-white border border-[#EAEAEA] rounded-xl space-y-4 max-h-[550px] overflow-y-auto">
                            {(() => {
                              const video = getIntroVideoById(introCourseActiveVideo, dynamicCourseData);
                              const lessonRef = resolveLessonRef(video);
                              const sansResources = getSansResourcesForLesson(lessonRef);
                              const cheatSheets = sansResources.filter(r => r.type === "Cheat Sheet" || r.type === "DFIR Poster");

                              return (
                                <div className="space-y-4">
                                  {/* Instructor Attachment File (if any) */}
                                  {video?.download_url && video.download_url.trim() !== "" && (
                                    <a
                                      href={video.download_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-3 bg-white border border-[#EAEAEA] rounded-lg flex items-center justify-between hover:border-[#002D62] transition-colors cursor-pointer block"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 bg-blue-50 text-blue-600 rounded flex items-center justify-center">
                                          <FileText className="h-4 w-4" />
                                        </div>
                                        <div>
                                          <div className="text-xs font-bold text-[#1E293B]">Lesson Attachment</div>
                                          <div className="text-[10px] text-[#777]">
                                            {video.download_type || "Downloadable"} Document
                                          </div>
                                        </div>
                                      </div>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-[#002D62]">
                                        <Download className="h-4 w-4" />
                                      </Button>
                                    </a>
                                  )}

                                  {/* SANS DFIR Posters & Cheat Sheets Header */}
                                  <div className="p-3.5 bg-gradient-to-r from-[#C5A059]/10 via-[#C5A059]/5 to-transparent rounded-xl border border-[#C5A059]/30 flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                      <div className="h-7 px-2 bg-[#002D62] text-[#C5A059] text-[10px] font-mono font-bold rounded flex items-center shrink-0">
                                        DFIR
                                      </div>
                                      <div>
                                        <div className="text-xs font-bold text-[#002D62] font-serif">
                                          SANS DFIR Field Posters & Cheat Sheets
                                        </div>
                                        <div className="text-[10px] text-[#666]">
                                          Essential command line references & forensic evidence cheat sheets
                                        </div>
                                      </div>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setNavSection("sans-vault")}
                                      className="text-[11px] text-[#002D62] hover:text-[#001F44] font-semibold h-7 px-2"
                                    >
                                      All Sheets &rarr;
                                    </Button>
                                  </div>

                                  {/* Cheat Sheets List */}
                                  {cheatSheets.length === 0 ? (
                                    <div className="p-4 text-center text-xs text-slate-500 italic bg-[#FAFAFA] rounded-xl border border-[#EAEAEA]">
                                      No unit-specific cheat sheets found. Explore the{" "}
                                      <button onClick={() => setNavSection("sans-vault")} className="text-[#002D62] underline font-semibold">
                                        full SANS Vault
                                      </button>{" "}
                                      for all forensic cheat sheets.
                                    </div>
                                  ) : (
                                    <div className="space-y-3">
                                      {cheatSheets.map((sheet) => (
                                        <div
                                          key={sheet.id}
                                          className="p-3.5 bg-white rounded-xl border border-[#E5E7EB] hover:border-[#C5A059] hover:shadow-xs transition-all space-y-2 group"
                                        >
                                          <div className="flex items-start justify-between gap-3">
                                            <div className="space-y-1 min-w-0">
                                              <div className="flex items-center gap-2 flex-wrap">
                                                <Badge
                                                  className={
                                                    sheet.type === "DFIR Poster"
                                                      ? "bg-purple-700 text-white text-[9px] font-mono"
                                                      : "bg-amber-600 text-white text-[9px] font-mono"
                                                  }
                                                >
                                                  {sheet.type}
                                                </Badge>
                                                <Badge variant="outline" className="text-[9px] font-mono border-slate-300 text-slate-600">
                                                  {sheet.category}
                                                </Badge>
                                                <span className="text-[10px] text-amber-700 font-mono font-semibold">
                                                  Quick Reference
                                                </span>
                                              </div>
                                              <h4 className="text-xs font-bold text-[#002D62] font-serif group-hover:text-[#001F44] leading-snug">
                                                {sheet.title}
                                              </h4>
                                              <div className="text-[10px] text-slate-500 font-mono">
                                                Source: {sheet.author}
                                              </div>
                                            </div>

                                            <a
                                              href={sheet.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="shrink-0 px-2.5 py-1.5 bg-[#C5A059]/10 hover:bg-[#C5A059] text-[#001F44] hover:text-white border border-[#C5A059]/30 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
                                            >
                                              <span>Open Sheet (sans.org)</span>
                                              <ExternalLink className="h-3 w-3" />
                                            </a>
                                          </div>

                                          <p className="text-[11px] text-[#555] leading-relaxed">
                                            {sheet.summary}
                                          </p>

                                          <div className="flex items-center gap-1.5 flex-wrap pt-1">
                                            {sheet.topics.map((t, idx) => (
                                              <span
                                                key={idx}
                                                className="text-[9px] bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded font-mono"
                                              >
                                                {t}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        </TabsContent>
                      </Tabs>
                    </Card>
                  </div>

                  {/* Right Column: Course Playlist */}
                  <div className="lg:col-span-4 space-y-4">
                    <div className="border-b border-[#EAEAEA] pb-3">
                      <h2 className="text-sm font-bold text-[#002D62] font-serif">Lesson Modules</h2>
                      <p className="text-[11px] text-[#666]">Introduction to Cybersecurity Specialization</p>
                    </div>

                    <div className="space-y-4">
                      {!dynamicCourseData.sections || dynamicCourseData.sections.length === 0 ? (
                        <div className="p-8 text-center border border-dashed border-slate-300 rounded-xl bg-[#F8F9FA] text-slate-500">
                          <BookOpen className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                          <p className="text-sm font-semibold">No Lessons Uploaded</p>
                          <p className="text-xs mt-1">Lesson modules will appear here once published by the Admin.</p>
                        </div>
                      ) : (
                        dynamicCourseData.sections.map((section) => (
                          <div key={section.id} className="space-y-2">
                            <div className="text-xs font-bold text-[#333] uppercase font-mono tracking-wider ml-1">{section.title}</div>
                            <div className="space-y-2">
                              {section.lessons.map((video) => {
                                const isActive = introCourseActiveVideo === video.id;
                                return (
                                  <button
                                    key={video.id}
                                    onClick={() => !video.is_locked && setIntroCourseActiveVideo(video.id)}
                                    disabled={video.is_locked}
                                    className={`w-full text-left p-3 rounded-xl border transition-all flex gap-3 ${isActive
                                        ? "bg-white border-[#002D62] shadow-sm ring-1 ring-[#002D62]"
                                        : "bg-[#FAFAFA] border-[#EAEAEA] hover:border-[#CCC]"
                                      } ${video.is_locked ? "opacity-60 cursor-not-allowed" : ""}`}
                                  >
                                    <div className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center ${isActive ? "bg-[#002D62] text-[#C5A059]" : "bg-white border border-[#DDD] text-[#888]"
                                      }`}>
                                      {video.is_locked ? <Lock className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                                    </div>
                                    <div className="space-y-1 flex-1">
                                      <div className={`text-xs font-bold font-serif leading-tight ${isActive ? "text-[#002D62]" : "text-[#333]"}`}>
                                        {video.title}
                                      </div>
                                      <div className="text-[10px] font-mono text-[#666] flex items-center justify-between uppercase w-full">
                                        <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {video.type}</span>
                                        {video.is_locked && <span className="text-red-500 font-bold">LOCKED</span>}
                                      </div>
                                    </div>
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* SECTION: FORENSIC TERMINAL SANDBOX (STUDENT + MISSIONS + PLAYGROUND) */}
              {navSection === "forensic-sandbox" && (
                <ForensicTerminalSandbox
                  onAwardXP={handleAwardSandboxXP}
                  onAwardBadge={(badgeName) => {
                    setPracticumNotice(`🎉 Forensic Badge Unlocked: ${badgeName}!`);
                    setTimeout(() => setPracticumNotice(null), 5000);
                  }}
                />
              )}

              {/* SECTION: IN-BROWSER FORENSIC PLAYGROUND (OPEN SIFT TERMINAL) */}
              {navSection === "terminal-playground" && (
                <ForensicTerminalSandbox
                  defaultTab="playground"
                  onAwardXP={handleAwardSandboxXP}
                  onAwardBadge={(badgeName) => {
                    setPracticumNotice(`🎉 Forensic Badge Unlocked: ${badgeName}!`);
                    setTimeout(() => setPracticumNotice(null), 5000);
                  }}
                />
              )}

              {/* SECTION 2: SANS DFIR REFERENCE VAULT */}
              {navSection === "sans-vault" && (
                <div className="space-y-6">
                  {/* Header Hero Banner */}
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-[#002D62] via-[#001F44] to-[#002D62] text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-sm relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-80 h-full bg-[#C5A059]/10 skew-x-12 pointer-events-none" />

                    <div className="space-y-2 relative z-10 max-w-2xl">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-[#C5A059] text-[11px] font-mono border border-white/10">
                        <BookMarked className="h-3 w-3" />
                        <span>SANS Institute (sans.org) Academic Reference Vault</span>
                      </div>
                      <h1 className="text-2xl font-bold font-serif tracking-tight">
                        SANS DFIR Whitepapers & Cheat Sheets
                      </h1>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Canonical Digital Forensics and Incident Response (DFIR) research papers, field acquisition guides, and memory/network analysis cheat sheets curated and mapped across all 8 curriculum units.
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 relative z-10">
                      <a
                        href="https://www.sans.org/posters/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-colors"
                      >
                        <span>All SANS Posters</span>
                        <ExternalLink className="h-3 w-3 text-[#C5A059]" />
                      </a>
                      <a
                        href="https://www.sans.org/white-papers/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#C5A059] hover:bg-[#b08d48] text-[#001F44] text-xs font-bold transition-colors shadow-xs"
                      >
                        <span>SANS Reading Room</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>

                  {/* 4 Metric Counter Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                    <Card className="p-4 bg-white border-[#E5E5E5] rounded-xl space-y-1 shadow-xs">
                      <div className="flex items-center justify-between text-[#777]">
                        <span className="text-[11px] font-medium">Total Curated Resources</span>
                        <BookOpen className="h-4 w-4 text-[#002D62]" />
                      </div>
                      <div className="text-xl font-bold text-[#002D62] font-mono">
                        {SANS_RESOURCES.length} <span className="text-xs font-normal text-[#888]">Materials</span>
                      </div>
                      <div className="text-[10px] text-[#666] font-mono">100% Peer-Reviewed / sans.org</div>
                    </Card>

                    <Card className="p-4 bg-white border-[#E5E5E5] rounded-xl space-y-1 shadow-xs">
                      <div className="flex items-center justify-between text-[#777]">
                        <span className="text-[11px] font-medium">Cheat Sheets & Posters</span>
                        <Flame className="h-4 w-4 text-amber-500" />
                      </div>
                      <div className="text-xl font-bold text-amber-700 font-mono">
                        {getSansCheatSheets().length} <span className="text-xs font-normal text-[#888]">Reference Guides</span>
                      </div>
                      <div className="text-[10px] text-amber-700 font-mono">High-Yield Field Commands</div>
                    </Card>

                    <Card className="p-4 bg-white border-[#E5E5E5] rounded-xl space-y-1 shadow-xs">
                      <div className="flex items-center justify-between text-[#777]">
                        <span className="text-[11px] font-medium">Research Whitepapers</span>
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="text-xl font-bold text-blue-800 font-mono">
                        {getSansWhitepapers().length} <span className="text-xs font-normal text-[#888]">Whitepapers</span>
                      </div>
                      <div className="text-[10px] text-blue-700 font-mono">In-Depth Forensic Theory</div>
                    </Card>

                    <Card className="p-4 bg-white border-[#E5E5E5] rounded-xl space-y-1 shadow-xs">
                      <div className="flex items-center justify-between text-[#777]">
                        <span className="text-[11px] font-medium">Mapped Lesson Units</span>
                        <Layers className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div className="text-xl font-bold text-emerald-700 font-mono">
                        8 / 8 <span className="text-xs font-normal text-[#888]">Units Covered</span>
                      </div>
                      <div className="text-[10px] text-emerald-700 font-mono">Prelims to Finals Examination</div>
                    </Card>
                  </div>

                  {/* Filters & Search Control Bar */}
                  <Card className="p-4 bg-white border-[#E5E5E5] rounded-xl space-y-4 shadow-xs">
                    <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                      {/* Search Input */}
                      <div className="relative flex-1">
                        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={sansSearchQuery}
                          onChange={(e) => setSansSearchQuery(e.target.value)}
                          placeholder="Search by title, tool (Volatility, Wireshark, Prefetch, USB, SSD, Drone), or author..."
                          className="w-full pl-9 pr-4 py-2 bg-[#F8F9FA] border border-[#E5E5E5] rounded-lg text-xs text-[#1E293B] placeholder-slate-400 focus:outline-none focus:border-[#002D62] transition-colors"
                        />
                        {sansSearchQuery && (
                          <button
                            onClick={() => setSansSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Type Filter Buttons */}
                      <div className="flex items-center gap-1.5 p-1 bg-[#F4F4F5] rounded-lg shrink-0">
                        <button
                          onClick={() => setSansSelectedType("all")}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${sansSelectedType === "all"
                              ? "bg-white text-[#002D62] font-bold shadow-xs"
                              : "text-[#666] hover:text-[#002D62]"
                            }`}
                        >
                          All ({SANS_RESOURCES.length})
                        </button>
                        <button
                          onClick={() => setSansSelectedType("cheatsheet")}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${sansSelectedType === "cheatsheet"
                              ? "bg-white text-amber-800 font-bold shadow-xs"
                              : "text-[#666] hover:text-amber-800"
                            }`}
                        >
                          Cheat Sheets ({getSansCheatSheets().length})
                        </button>
                        <button
                          onClick={() => setSansSelectedType("whitepaper")}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${sansSelectedType === "whitepaper"
                              ? "bg-white text-blue-800 font-bold shadow-xs"
                              : "text-[#666] hover:text-blue-800"
                            }`}
                        >
                          Whitepapers ({getSansWhitepapers().length})
                        </button>
                      </div>
                    </div>

                    {/* Unit Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-t border-[#F0F0F0] pt-3">
                      <span className="text-[11px] font-mono text-[#777] uppercase font-bold shrink-0 mr-1 flex items-center gap-1">
                        <FilterIcon className="h-3 w-3" /> Unit:
                      </span>
                      <button
                        onClick={() => setSansSelectedUnit("all")}
                        className={`px-2.5 py-1 rounded-full text-[11px] shrink-0 transition-colors ${sansSelectedUnit === "all"
                            ? "bg-[#002D62] text-white font-bold"
                            : "bg-[#F4F4F5] text-[#555] hover:bg-[#EAEAEA]"
                          }`}
                      >
                        All Units
                      </button>
                      {[
                        { u: 1, label: "Unit 1: Cyberspace & IR" },
                        { u: 2, label: "Unit 2: Hardware & Volatility" },
                        { u: 3, label: "Unit 3: RA 10175 & Privacy" },
                        { u: 4, label: "Unit 4: RAM & Budapest" },
                        { u: 5, label: "Unit 5: Storage & TRIM" },
                        { u: 6, label: "Unit 6: Windows Artifacts" },
                        { u: 7, label: "Unit 7: Warrants & Court" },
                        { u: 8, label: "Unit 8: Green Forensics" }
                      ].map((item) => (
                        <button
                          key={item.u}
                          onClick={() => setSansSelectedUnit(item.u)}
                          className={`px-2.5 py-1 rounded-full text-[11px] shrink-0 transition-colors ${sansSelectedUnit === item.u
                              ? "bg-[#002D62] text-white font-bold"
                              : "bg-[#F4F4F5] text-[#555] hover:bg-[#EAEAEA]"
                            }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </Card>

                  {/* Resource Cards Grid */}
                  {(() => {
                    const filtered = SANS_RESOURCES.filter((res) => {
                      if (sansSelectedType === "cheatsheet" && res.type !== "Cheat Sheet" && res.type !== "DFIR Poster") return false;
                      if (sansSelectedType === "whitepaper" && res.type !== "Whitepaper") return false;
                      if (sansSelectedUnit !== "all" && res.unitNumber !== Number(sansSelectedUnit)) return false;

                      if (sansSearchQuery.trim() !== "") {
                        const q = sansSearchQuery.toLowerCase();
                        const titleMatch = res.title.toLowerCase().includes(q);
                        const authorMatch = res.author.toLowerCase().includes(q);
                        const summaryMatch = res.summary.toLowerCase().includes(q);
                        const categoryMatch = res.category.toLowerCase().includes(q);
                        const topicsMatch = res.topics.some((t) => t.toLowerCase().includes(q));
                        if (!titleMatch && !authorMatch && !summaryMatch && !categoryMatch && !topicsMatch) return false;
                      }
                      return true;
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="p-12 text-center bg-white rounded-xl border border-dashed border-[#DDD] space-y-2">
                          <BookOpen className="h-10 w-10 text-slate-300 mx-auto" />
                          <h3 className="text-sm font-bold text-[#002D62]">No SANS Resources Found</h3>
                          <p className="text-xs text-slate-500 max-w-sm mx-auto">
                            No whitepapers or cheat sheets matched your search filter. Try clearing the search query or selecting &quot;All Units&quot;.
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSansSearchQuery("");
                              setSansSelectedType("all");
                              setSansSelectedUnit("all");
                            }}
                            className="text-xs mt-2"
                          >
                            Reset Filters
                          </Button>
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map((res) => {
                          const isPoster = res.type === "DFIR Poster";
                          const isCheatSheet = res.type === "Cheat Sheet";
                          const isWhitepaper = res.type === "Whitepaper";

                          return (
                            <div
                              key={res.id}
                              className="p-4 bg-white rounded-xl border border-[#E5E7EB] hover:border-[#002D62] hover:shadow-md transition-all flex flex-col justify-between group space-y-3"
                            >
                              <div className="space-y-2.5">
                                {/* Card Top: Badges & Unit */}
                                <div className="flex items-center justify-between gap-2">
                                  <Badge
                                    className={
                                      isPoster
                                        ? "bg-purple-700 text-white text-[9px] font-mono"
                                        : isCheatSheet
                                          ? "bg-amber-600 text-white text-[9px] font-mono"
                                          : "bg-[#002D62] text-white text-[9px] font-mono"
                                    }
                                  >
                                    {res.type}
                                  </Badge>

                                  <span className="text-[10px] font-mono font-bold text-[#002D62] bg-[#002D62]/5 px-2 py-0.5 rounded">
                                    Unit {res.unitNumber}
                                  </span>
                                </div>

                                {/* Title & Author */}
                                <div className="space-y-1">
                                  <a
                                    href={res.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs font-bold text-[#002D62] font-serif group-hover:text-[#001F44] hover:underline leading-snug line-clamp-2 block"
                                  >
                                    {res.title}
                                  </a>
                                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                                    <span>{res.author}</span>
                                    <span>{res.estReadTime}</span>
                                  </div>
                                </div>

                                {/* Summary */}
                                <p className="text-[11px] text-[#555] leading-relaxed line-clamp-3">
                                  {res.summary}
                                </p>

                                {/* Topic Tags */}
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {res.topics.slice(0, 3).map((topic, idx) => (
                                    <span
                                      key={idx}
                                      className="text-[9px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono"
                                    >
                                      #{topic}
                                    </span>
                                  ))}
                                  {res.topics.length > 3 && (
                                    <span className="text-[9px] text-slate-400 font-mono">
                                      +{res.topics.length - 3} more
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Card Footer: Action */}
                              <div className="pt-2 border-t border-[#F0F0F0]">
                                <a
                                  href={res.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${isWhitepaper
                                      ? "bg-[#002D62] hover:bg-[#001F44] text-[#C5A059]"
                                      : "bg-[#C5A059] hover:bg-[#b08d48] text-[#001F44]"
                                    }`}
                                >
                                  <span>Open on sans.org</span>
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
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
                          className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all ${unlocked
                              ? "bg-white border-[#002D62] shadow-xs"
                              : "bg-slate-50 border-[#EAEAEA] opacity-60"
                            }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Badge
                                className={`text-[9px] font-mono ${unlocked
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
                                className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 shadow-xs ${unlocked ? "bg-[#002D62] text-[#C5A059]" : "bg-slate-300 text-slate-500"
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





              {/* SECTION 12: PROFILE SETTINGS & IAM SETUP */}
              {navSection === "profile-settings" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAEAEA] pb-3">
                    <div>
                      <h2 className="text-lg font-bold text-[#002D62] font-serif flex items-center gap-2">
                        <UserCheck className="h-5 w-5 text-[#C5A059]" />
                        Profile Settings & Identity Setup
                      </h2>
                      <p className="text-xs text-[#666] mt-1">
                        Update your institutional details, section enrollment, and account credentials.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Profile Information */}
                    <Card className="lg:col-span-2 p-6 bg-white border-[#E5E5E5] shadow-sm rounded-xl space-y-6">
                      <div>
                        <h3 className="text-sm font-bold text-[#002D62] font-serif mb-4 flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-[#C5A059]" />
                          Student Profile Configuration
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5 sm:col-span-2">
                            <label className="text-[11px] font-bold text-[#1E293B]">Full Name</label>
                            <input
                              type="text"
                              value={profileForm.name}
                              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                              placeholder={userProfile.name}
                              className="w-full p-2.5 text-xs border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#002D62] bg-[#F8F9FA]"
                            />
                          </div>
                          <div className="space-y-1.5 sm:col-span-2">
                            <label className="text-[11px] font-bold text-[#1E293B]">Email Address</label>
                            <input
                              type="email"
                              value={currentUser?.email || (userProfile.name ? `${userProfile.name.toLowerCase().replace(/\s+/g, '.')}@urios.edu.ph` : '')}
                              disabled
                              className="w-full p-2.5 text-xs border border-[#EAEAEA] rounded-lg focus:outline-none bg-[#F1F5F9] text-[#666]"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-[#1E293B]">Academic Program</label>
                            <select
                              value={profileForm.program}
                              onChange={(e) => setProfileForm({ ...profileForm, program: e.target.value })}
                              className="w-full p-2.5 text-xs border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#002D62] bg-[#F8F9FA]"
                            >
                              <option value="">{userProfile.program}</option>
                              <option value="BS Criminology">BS Criminology</option>
                              <option value="BS Information Technology">BS Information Technology</option>
                              <option value="BS Computer Science">BS Computer Science</option>
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-[#1E293B]">Year Level</label>
                            <select
                              value={profileForm.yearLevel}
                              onChange={(e) => setProfileForm({ ...profileForm, yearLevel: e.target.value })}
                              className="w-full p-2.5 text-xs border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#002D62] bg-[#F8F9FA]"
                            >
                              <option value="">{userProfile.yearLevel}</option>
                              <option value="1st Year">1st Year</option>
                              <option value="2nd Year">2nd Year</option>
                              <option value="3rd Year">3rd Year</option>
                              <option value="4th Year">4th Year</option>
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-[#1E293B]">Section Enrolled</label>
                            <select
                              value={profileForm.section}
                              onChange={(e) => setProfileForm({ ...profileForm, section: e.target.value })}
                              className="w-full p-2.5 text-xs border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#002D62] bg-[#F8F9FA]"
                            >
                              <option value="">{userProfile.section}</option>
                              <option value="Alpha">Alpha</option>
                              <option value="Bravo">Bravo</option>
                              <option value="Charlie">Charlie</option>
                              <option value="Delta">Delta</option>
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-[#1E293B]">Institutional ID</label>
                            <input
                              type="text"
                              value={userProfile.id}
                              disabled
                              className="w-full p-2.5 text-xs border border-[#EAEAEA] rounded-lg focus:outline-none bg-[#F1F5F9] text-[#666] font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-[#EAEAEA]">
                        <Button
                          className="bg-[#002D62] hover:bg-[#001F44] text-white text-xs font-semibold px-6 py-2 h-auto rounded-lg"
                          disabled={isSavingProfile}
                          onClick={async () => {
                            setIsSavingProfile(true);
                            try {
                              const nameToSave = profileForm.name || userProfile.name;
                              const programToSave = profileForm.program || userProfile.program;
                              const yearToSave = profileForm.yearLevel || userProfile.yearLevel;
                              const sectionToSave = profileForm.section || userProfile.section;

                              const { error } = await supabase
                                .from('profiles')
                                .update({
                                  full_name: nameToSave,
                                  program: programToSave,
                                  year_level: yearToSave,
                                  section: sectionToSave,
                                  updated_at: new Date().toISOString()
                                })
                                .eq('id', currentUser?.id);

                              if (error) throw error;

                              setUserProfile(prev => ({
                                ...prev,
                                name: nameToSave,
                                program: programToSave,
                                yearLevel: yearToSave,
                                section: sectionToSave,
                                avatar: nameToSave.charAt(0)
                              }));

                              // Also store locally for fallback
                              localStorage.setItem("student_profile", JSON.stringify({
                                name: nameToSave,
                                studentId: userProfile.id
                              }));

                              setPracticumNotice("Profile updated successfully!");
                              setTimeout(() => setPracticumNotice(null), 3000);
                            } catch (err) {
                              alert("Failed to update profile: " + err.message);
                            } finally {
                              setIsSavingProfile(false);
                            }
                          }}
                        >
                          {isSavingProfile ? "Saving Profile..." : "Save Identity Configuration"}
                        </Button>
                      </div>
                    </Card>

                    {/* Account Security & Badges */}
                    <div className="space-y-6">
                      <Card className="p-6 bg-white border-[#E5E5E5] shadow-sm rounded-xl space-y-4">
                        <h3 className="text-sm font-bold text-[#002D62] font-serif">Account Security &amp; Credentials</h3>

                        {passwordSuccess && (
                          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs">
                            Password updated successfully in authentication service.
                          </div>
                        )}
                        {passwordError && (
                          <div className="p-2.5 rounded-lg bg-red-50 text-red-800 border border-red-200 text-xs">
                            {passwordError}
                          </div>
                        )}

                        <form
                          onSubmit={async (e) => {
                            e.preventDefault();
                            setPasswordError("");
                            setPasswordSuccess(false);
                            if (newPassword.length < 6) {
                              setPasswordError("Password must be at least 6 characters.");
                              return;
                            }
                            setIsUpdatingPassword(true);
                            try {
                              const { error } = await supabase.auth.updateUser({ password: newPassword });
                              if (error) throw error;
                              setPasswordSuccess(true);
                              setNewPassword("");
                            } catch (err) {
                              setPasswordError(err.message || "Failed to update password.");
                            } finally {
                              setIsUpdatingPassword(false);
                            }
                          }}
                          className="space-y-3"
                        >
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-[#1E293B]">New Account Password</label>
                            <input
                              type="password"
                              required
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Minimum 6 characters"
                              className="w-full p-2.5 text-xs border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#002D62] bg-[#F8F9FA]"
                            />
                          </div>

                          <Button
                            type="submit"
                            disabled={isUpdatingPassword || !newPassword}
                            variant="outline"
                            className="w-full text-xs font-semibold border-[#002D62] text-[#002D62] hover:bg-[#002D62] hover:text-white rounded-lg cursor-pointer"
                          >
                            {isUpdatingPassword ? "Updating Password..." : "Update Password"}
                          </Button>
                        </form>
                      </Card>

                      <Card className="p-6 border-[#E5E5E5] shadow-sm bg-gradient-to-br from-[#F8F9FA] to-white relative overflow-hidden rounded-xl">
                        <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none">
                          <Shield className="w-48 h-48" />
                        </div>
                        <h3 className="text-sm font-bold text-[#002D62] font-serif mb-4 flex items-center gap-2">
                          <Lock className="h-4 w-4 text-[#C5A059]" />
                          IAM Governance & Badges
                        </h3>
                        <div className="space-y-4">
                          <div className="p-3 bg-[#002D62]/5 rounded-xl border border-[#002D62]/10 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono text-[#555] font-semibold">ACCOUNT ROLE</span>
                              <Badge className="bg-[#002D62] text-white hover:bg-[#001F44] text-[9px] px-1.5 h-4">Student</Badge>
                            </div>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-[#EAEAEA]">
                            <h4 className="text-[11px] font-bold text-[#555]">Earned Competencies ({unlockedBadgesCount})</h4>
                            <div className="flex flex-wrap gap-2">
                              {BADGES_DATA.filter(b => isBadgeUnlocked(b.id)).map(badge => (
                                <div key={badge.id} className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 border border-emerald-200 rounded text-[9px] font-mono text-emerald-800">
                                  <span className="text-xs">{badge.icon}</span>
                                  {badge.title} (+{badge.points} XP)
                                </div>
                              ))}
                              {unlockedBadgesCount === 0 && (
                                <div className="text-[10px] text-[#888] italic">No badges earned yet. Complete unit labs to unlock competencies.</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
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

      {/* NEW MESSAGE MODAL */}
      {showNewMessageModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95">
            <div className="flex items-center justify-between p-4 border-b border-[#EAEAEA] bg-[#002D62] text-white">
              <h2 className="text-sm font-bold font-serif">New Message</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowNewMessageModal(false)} className="h-6 w-6 text-white hover:bg-white/20 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-xs font-semibold text-[#555] w-14 text-right">To:</label>
                <div className="flex-1 px-3 py-2 bg-[#F8F9FA] border border-[#EAEAEA] rounded-lg text-xs text-[#1E293B] font-medium">
                  Mr. Orlando Ritchie R. Natonton (Instructor)
                </div>
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

      {/* 10. GLOBAL SPOTLIGHT SEARCH MODAL (Ctrl + K) */}
      {globalSearchOpen && (
        <div
          id="global-spotlight-modal-backdrop"
          className="fixed inset-0 z-[120] flex items-start justify-center pt-14 sm:pt-20 px-4 bg-slate-950/65 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
          onClick={() => setGlobalSearchOpen(false)}
        >
          <div
            id="global-spotlight-card"
            className="w-full max-w-2xl bg-white text-[#1E293B] rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[82vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Search Input Box */}
            <div className="flex items-center px-4 py-3.5 border-b border-slate-200 gap-3 bg-white">
              <Search className="h-5 w-5 text-[#002D62] shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                id="global-spotlight-input"
                value={globalSearchQuery}
                onChange={(e) => {
                  setGlobalSearchQuery(e.target.value);
                  setSearchSelectedIndex(0);
                }}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search laws (RA 10175, RA 10173), units, SIFT labs, warrants, messages..."
                className="w-full text-sm bg-transparent outline-none placeholder:text-slate-400 font-sans text-slate-800"
              />
              {globalSearchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setGlobalSearchQuery("");
                    searchInputRef.current?.focus();
                  }}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-md text-xs font-mono"
                >
                  Clear
                </button>
              )}
              <kbd className="hidden sm:inline-flex items-center text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                ESC
              </kbd>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-100 bg-slate-50/80 overflow-x-auto text-xs shrink-0">
              {[
                { id: "all", label: `All (${filteredSearchItems.length})` },
                { id: "laws", label: "⚖️ Laws & Statutes" },
                { id: "curriculum", label: "📚 Lessons & Units" },
                { id: "labs", label: "🧪 Labs & Tools" },
                { id: "academics", label: "💬 Messages & Advising" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setGlobalSearchCategory(cat.id);
                    setSearchSelectedIndex(0);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all shrink-0 cursor-pointer ${globalSearchCategory === cat.id
                      ? "bg-[#002D62] text-white shadow-xs font-semibold"
                      : "text-slate-600 hover:bg-slate-200/70"
                    }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
              {filteredSearchItems.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs space-y-1">
                  <p className="font-semibold text-slate-600">No matching items found</p>
                  <p className="text-[11px]">
                    Try searching for <span className="font-mono text-[#002D62]">RA 10175</span>,{" "}
                    <span className="font-mono text-[#002D62]">RA 10173</span>,{" "}
                    <span className="font-mono text-[#002D62]">warrant</span>, or{" "}
                    <span className="font-mono text-[#002D62]">messages</span>.
                  </p>
                </div>
              ) : (
                filteredSearchItems.map((item, index) => {
                  const Icon = item.icon;
                  const isSelected = index === searchSelectedIndex;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectItem(item)}
                      onMouseEnter={() => setSearchSelectedIndex(index)}
                      className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between gap-3 group cursor-pointer ${isSelected
                          ? "bg-[#002D62]/5 border border-[#002D62]/20 shadow-2xs"
                          : "hover:bg-slate-50 border border-transparent"
                        }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`p-2 rounded-xl shrink-0 transition-colors ${isSelected ? "bg-[#002D62] text-[#C5A059]" : "bg-slate-100 text-[#002D62] group-hover:bg-[#002D62]/10"
                            }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-[#002D62] group-hover:text-[#001F44] truncate">
                              {item.title}
                            </span>
                            <span className="text-[9.5px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                              {item.categoryLabel}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <ChevronRight
                        className={`h-4 w-4 shrink-0 transition-transform ${isSelected ? "text-[#002D62] translate-x-0.5" : "text-slate-300 group-hover:text-slate-400"
                        }`}
                      />
                    </button>
                  );
                })
              )}
            </div>

            {/* Bottom Keyboard Shortcuts Strip */}
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-[10.5px] text-slate-400 font-mono">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded text-[9px] shadow-2xs">↑↓</kbd> Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded text-[9px] shadow-2xs">↵</kbd> Select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded text-[9px] shadow-2xs">esc</kbd> Close
                </span>
              </div>
              <div className="hidden sm:block text-[#002D62] font-semibold font-serif">
                Urios CyberLearn
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
