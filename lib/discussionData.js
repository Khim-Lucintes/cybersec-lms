// Simulated Discussion Board & Case Defense Docket for CDI 409

export const CASE_DEFENSE_TOPICS = [
  {
    id: "case-def-1",
    unitNumber: 3,
    title: "State vs. Suspect 'X': Unauthorized Access & System Interference (RA 10175 Sec. 4(a)(1))",
    synopsis: "The suspect penetrated a banking API gateway using stolen administrative credentials and altered transaction audit logs. Defense claims accidental network connection.",
    prompt: "As a Criminology First Responder, defend the legal basis of RA 10175 Sec. 4(a) and explain why log manipulation constitutes Computer-Related Forgery under Sec. 4(b)(1).",
    initialPosts: [
      {
        id: "post-1",
        authorName: "Student Juan Dela Cruz",
        authorRole: "Student (Section Alpha)",
        timestamp: "2 hours ago",
        content: "Under RA 10175 Sec. 4(a)(1), access without right or in excess of authority constitutes illegal access. The presence of forged session tokens in memory and intentional clearing of Event ID 1102 (Audit log cleared) establishes malicious mens rea, nullifying the accidental defense.",
        instructorFeedback: "Accurate invocation of mens rea and event ID correlation. +10 OBE Practicum points."
      },
      {
        id: "post-2",
        authorName: "Student Maria Santos",
        authorRole: "Student (Section Alpha)",
        timestamp: "1 hour ago",
        content: "Additionally, applying for a Warrant to Search, Seize and Examine (WSCD) under A.M. No. 17-11-03-SC allows examiners to perform hash comparisons on the database backup.",
        instructorFeedback: null
      }
    ]
  },
  {
    id: "case-def-2",
    unitNumber: 7,
    title: "Application for Warrant to Intercept Computer Data (WICT) vs Right to Privacy",
    synopsis: "LEAs received a tip on an ongoing syndicated illegal wildlife trafficking ring operating via encrypted email and cloud channels in Caraga.",
    prompt: "Justify why a Warrant to Intercept Computer Data (WICT) is required rather than a standard Search Warrant, citing specific provisions of Supreme Court Rule on Cybercrime Warrants.",
    initialPosts: [
      {
        id: "post-3",
        authorName: "Atty. Cedrick G. Train",
        authorRole: "Faculty Lead / Dean",
        timestamp: "Yesterday",
        content: "Students, take note: WICT is governed by Section 5.1 of A.M. No. 17-11-03-SC. You must demonstrate probable cause and establish that standard investigative procedures have failed or are unlikely to succeed.",
        instructorFeedback: null
      }
    ]
  }
];

export const TOPIC_STORAGE_KEY = "cdi409_case_topics";

export function getSavedCaseTopics() {
  if (typeof window === "undefined") return CASE_DEFENSE_TOPICS;
  try {
    const raw = localStorage.getItem(TOPIC_STORAGE_KEY);
    return raw ? JSON.parse(raw) : CASE_DEFENSE_TOPICS;
  } catch {
    return CASE_DEFENSE_TOPICS;
  }
}

export function saveCaseTopics(topics) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TOPIC_STORAGE_KEY, JSON.stringify(topics));
    window.dispatchEvent(new CustomEvent("cdi409_case_topics_updated", { detail: topics }));
  } catch (err) {
    console.warn("Notice saving case topics:", err);
  }
}
