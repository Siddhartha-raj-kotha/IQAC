export type Role = "faculty" | "hod" | "principal" | "admin";

// ── LocalStorage Persistence Key ───────────────────────────────────────────────
const STORAGE_KEY = "iqac_submissions";

// Helper to load from localStorage (client-side only)
function loadFromStorage(): Submission[] | null {
  if (typeof window === "undefined") return null;
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    return json ? JSON.parse(json) : null;
  } catch { return null; }
}

// Helper to save to localStorage (client-side only)
function saveToStorage(data: Submission[]): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

const USERS_STORAGE_KEY = "iqac_users";

function loadUsersFromStorage(): User[] | null {
  if (typeof window === "undefined") return null;
  try {
    const json = localStorage.getItem(USERS_STORAGE_KEY);
    return json ? JSON.parse(json) : null;
  } catch { return null; }
}

function saveUsersToStorage(data: User[]): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(data)); } catch {}
}

export const departments = [
  "Computer Science & Engineering",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Botany",
  "Zoology",
  "History",
  "Telugu",
  "English",
  "Economics",
  "Political Science",
  "Commerce",
  "MBA",
  "Pharmacy",
  "Law",
  "Education",
  "Physical Education",
  "Fine Arts",
  "Library Science",
];

export type SubmissionStatus =
  | "draft"
  | "submitted"
  | "returned_hod"
  | "approved_hod"
  | "returned_principal"
  | "approved_principal"
  | "returned_iqac"
  | "accepted_iqac";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  department: string;
  designation?: string;
}

export interface DynamicRow {
  id: string;
  [key: string]: string | boolean | File | null;
}

export interface FacultyProfile {
  name: string;
  designation: string;
  department: string;
  dateOfAppointment: string;
  appointmentOrderEvidence?: string;
  experience: string;
  mobile: string;
  email: string;
  pan: string;
  panEvidence?: string;
  aadhar: string;
  aadharEvidence?: string;
  socialStatus: string;
  dob: string;
  highestQual: string;
  highestQualEvidence?: string;
  phdDate: string;
  isResearchGuide: string;
  researchGuideDate: string;
  researchGuideEvidence?: string;
}

export function canFacultyEdit(status: SubmissionStatus | undefined | null): boolean {
  if (!status) return true;
  return status === "draft" || status === "returned_iqac" || status === "returned_hod" || status === "returned_principal";
}

export function canIqacAct(status: SubmissionStatus | undefined | null): boolean {
  if (!status) return false;
  return status === "submitted";
}

export interface Submission {
  id: string;
  facultyId: string;
  facultyName: string;
  department: string;
  academicYear: string;
  status: SubmissionStatus;
  lastUpdated: string;
  submittedAt?: string;
  hodRemarks?: string;
  principalRemarks?: string;
  iqacRemarks?: string;
  profile: Partial<FacultyProfile>;
  researchPapers: DynamicRow[];
  booksChapters: DynamicRow[];
  fdpAttended: DynamicRow[];
  patents: DynamicRow[];
  seminarsParticipated: DynamicRow[];
  seminarsOrganized: DynamicRow[];
  fellowships: DynamicRow[];
  fundedProjects: DynamicRow[];
  awardsResearch: DynamicRow[];
  awardsExtension: DynamicRow[];
  econtent: DynamicRow[];
  outRangeActivity: DynamicRow[];
  otherInfo: DynamicRow[];
}

// ── Mock Users ─────────────────────────────────────────────────────────────
export const mockUsers: User[] = [
  { id: "f1", name: "Dr. Ramesh Kumar", email: "ramesh@ku.ac.in", password: "faculty123", role: "faculty", department: "Mathematics", designation: "Associate Professor" },
  { id: "f2", name: "Prof. Sunitha Reddy", email: "sunitha@ku.ac.in", password: "faculty123", role: "faculty", department: "Physics", designation: "Professor" },
  { id: "f3", name: "Dr. Venkat Rao", email: "venkat@ku.ac.in", password: "faculty123", role: "faculty", department: "Chemistry", designation: "Assistant Professor" },
  { id: "f4", name: "Dr. Lalitha Devi", email: "lalitha@ku.ac.in", password: "faculty123", role: "faculty", department: "Mathematics", designation: "Professor" },
  { id: "f5", name: "Prof. Srinivas Murthy", email: "srinivas@ku.ac.in", password: "faculty123", role: "faculty", department: "Computer Science & Engineering", designation: "Associate Professor" },
  { id: "h1", name: "Prof. Anand Sharma", email: "hod.math@ku.ac.in", password: "hod123", role: "hod", department: "Mathematics" },
  { id: "h2", name: "Dr. Kavitha Nair", email: "hod.physics@ku.ac.in", password: "hod123", role: "hod", department: "Physics" },
  { id: "h3", name: "Prof. Rajan Pillai", email: "hod.cse@ku.ac.in", password: "hod123", role: "hod", department: "Computer Science & Engineering" },
  { id: "p1", name: "Prof. D. Narasimha Rao", email: "principal@ku.ac.in", password: "principal123", role: "principal", department: "All" },
  { id: "a1", name: "Dr. Meena Kumari", email: "iqac@ku.ac.in", password: "admin123", role: "admin", department: "All" },
];

// ── Mock Submissions ───────────────────────────────────────────────────────
export const mockSubmissions: Submission[] = [
  {
    id: "s1",
    facultyId: "f1",
    facultyName: "Dr. Ramesh Kumar",
    department: "Mathematics",
    academicYear: "2024-25",
    status: "submitted",
    lastUpdated: "2025-04-15",
    submittedAt: "2025-04-10",
    profile: {
      name: "Dr. Ramesh Kumar",
      designation: "Associate Professor",
      department: "Mathematics",
      dateOfAppointment: "2005-07-01",
      appointmentOrderEvidence: "appointment_order_2005.pdf",
      experience: "19",
      mobile: "9876543210",
      email: "ramesh@ku.ac.in",
      pan: "ABCDE1234F",
      panEvidence: "pan_card_ramesh.pdf",
      aadhar: "1234 5678 9012",
      aadharEvidence: "aadhaar_ramesh.pdf",
      socialStatus: "OBC - Kuruma",
      dob: "1978-03-15",
      highestQual: "PhD",
      highestQualEvidence: "phd_certificate.pdf",
      phdDate: "2003-06-20",
      isResearchGuide: "Yes",
      researchGuideDate: "2010-01-15",
      researchGuideEvidence: "research_guide_order.pdf",
    },
    researchPapers: [
      { id: "rp1", title: "A Study on Fractional Calculus Applications", journal: "Indian Journal of Mathematics", impactFactor: "2.4", issn: "0019-5588", volume: "Vol 65, Issue 2", year: "2024", authors: "Ramesh Kumar, Lalitha Devi", doi: "10.xxxx/ijm.2024.65.2" },
      { id: "rp2", title: "Differential Equations in Biological Models", journal: "Applied Mathematics Letters", impactFactor: "3.8", issn: "0893-9659", volume: "Vol 148", year: "2024", authors: "Ramesh Kumar", doi: "10.xxxx/aml.2024.148" },
    ],
    booksChapters: [
      { id: "bc1", type: "Book Chapter", title: "Advances in Number Theory", publisher: "Springer", isbn: "978-3-xxx", year: "2024", authors: "Ramesh Kumar" },
    ],
    fdpAttended: [
      { id: "fdp1", title: "Research Methodology Workshop", organizer: "UGC-HRDC Hyderabad", dateFrom: "2024-11-10", dateTo: "2024-11-16", duration: "7", mode: "Offline", sponsoredBy: "UGC" },
    ],
    patents: [],
    seminarsParticipated: [
      { id: "sp1", title: "National Seminar on Pure Mathematics, Analysis, and Applications", organizer: "KU Mathematics Dept, Warangal, Telangana", dateFrom: "2024-09-20", dateTo: "2024-09-21", level: "National", role: "Keynote Speaker, Participant" },
    ],
    seminarsOrganized: [
      { id: "so1", title: "Workshop on Mathematical Modeling, Simulation, and Data Analysis", organizer: "Kakatiya University, Warangal, Telangana", dateFrom: "2025-01-15", dateTo: "2025-01-17", level: "State", role: "Organizer, Convener" },
    ],
    fellowships: [
      { id: "fel2", name: "Visiting Fellowship, Mathematical Sciences", type: "National", body: "Indian Academy of Sciences, Bengaluru", amount: "300000", year: "2024" },
    ],
    fundedProjects: [
      { id: "fp1", title: "Nonlinear Dynamics, Chaos, and Control in Complex Systems", agency: "SERB, DST, Government of India", type: "Government", amount: "1500000", duration: "3", projectStatus: "Ongoing" },
    ],
    awardsResearch: [
      { id: "ar1", name: "Best Researcher Award, Science and Technology", body: "Kakatiya University, Warangal", year: "2024" },
    ],
    econtent: [
      { id: "ec1", title: "Calculus for Beginners, Modules 1, 2, and 3", platform: "SWAYAM-NPTEL, UGC e-PG Pathshala", url: "https://swayam.gov.in/course/123", year: "2024" },
    ],
    awardsExtension: [
      { id: "ae2", name: "Outstanding Community Outreach, Science Promotion, and Education", body: "Telangana Higher Education Council, Hyderabad", year: "2024" },
    ],
    outRangeActivity: [
      { id: "ora1", description: "Rural Science Awareness and Digital Literacy Campaign in Warangal District", year: "2024" },
    ],
    otherInfo: [
      { id: "oi0", description: "Coordinator, University NIRF Committee, NAAC Criteria Incharge, and Member of Academic Senate.", year: "2024" },
    ],
  },
  {
    id: "s2",
    facultyId: "f2",
    facultyName: "Prof. Sunitha Reddy",
    department: "Physics",
    academicYear: "2024-25",
    status: "submitted",
    lastUpdated: "2025-04-18",
    submittedAt: "2025-04-18",
    profile: {
      name: "Prof. Sunitha Reddy",
      designation: "Professor",
      department: "Physics",
      experience: "22",
      mobile: "9988776655",
      email: "sunitha@ku.ac.in",
      highestQual: "PhD",
      isResearchGuide: "Yes",
    },
    researchPapers: [
      { id: "rp3", title: "Quantum Tunneling in Semiconductor Junctions", journal: "Physical Review B", impactFactor: "3.9", issn: "2469-9950", volume: "Vol 110", year: "2024", authors: "Sunitha Reddy, Anand S.", doi: "10.xxxx/prb.2024" },
    ],
    booksChapters: [],
    fdpAttended: [
      { id: "fdp2", title: "Advanced Spectroscopy Techniques", organizer: "IIT Hyderabad", dateFrom: "2024-12-01", dateTo: "2024-12-05", duration: "5", mode: "Online", sponsoredBy: "DST" },
    ],
    patents: [
      { id: "pat1", title: "Solar Energy Conversion Device", patentNumber: "IN2024/001234", patentStatus: "Published", patentUrl: "https://patents.google.com/patent/IN2024001234", year: "2024" },
    ],
    seminarsParticipated: [],
    seminarsOrganized: [],
    fellowships: [
      { id: "fel1", name: "DST Women Scientist Fellowship", type: "National", body: "Department of Science & Technology", amount: "500000", year: "2024" },
    ],
    fundedProjects: [],
    awardsResearch: [],
    econtent: [],
    awardsExtension: [],
    outRangeActivity: [],
    otherInfo: [],
  },
  {
    id: "s3",
    facultyId: "f3",
    facultyName: "Dr. Venkat Rao",
    department: "Chemistry",
    academicYear: "2024-25",
    status: "draft",
    lastUpdated: "2025-04-20",
    profile: { name: "Dr. Venkat Rao", designation: "Assistant Professor", department: "Chemistry", experience: "8", mobile: "9876501234", email: "venkat@ku.ac.in" },
    researchPapers: [],
    booksChapters: [],
    fdpAttended: [],
    patents: [],
    seminarsParticipated: [],
    seminarsOrganized: [],
    fellowships: [],
    fundedProjects: [],
    awardsResearch: [],
    econtent: [],
    awardsExtension: [],
    outRangeActivity: [],
    otherInfo: [],
  },
  {
    id: "s4",
    facultyId: "f4",
    facultyName: "Dr. Lalitha Devi",
    department: "Mathematics",
    academicYear: "2024-25",
    status: "returned_iqac",
    lastUpdated: "2025-04-12",
    submittedAt: "2025-04-08",
    iqacRemarks: "Please provide missing ISSN numbers for all journal papers and upload certificates for FDP programmes.",
    profile: { name: "Dr. Lalitha Devi", designation: "Professor", department: "Mathematics", experience: "25", mobile: "9811223344", email: "lalitha@ku.ac.in" },
    researchPapers: [
      { id: "rp4", title: "Graph Theory and Network Analysis", journal: "Discrete Mathematics", impactFactor: "1.8", issn: "", volume: "Vol 347", year: "2024", authors: "Lalitha Devi" },
    ],
    booksChapters: [],
    fdpAttended: [
      { id: "fdp3", title: "NEP Implementation Workshop", organizer: "Osmania University", dateFrom: "2024-08-20", dateTo: "2024-08-22", duration: "3", mode: "Offline", sponsoredBy: "UGC" },
    ],
    patents: [],
    seminarsParticipated: [],
    seminarsOrganized: [],
    fellowships: [],
    fundedProjects: [],
    awardsResearch: [],
    econtent: [],
    awardsExtension: [],
    outRangeActivity: [],
    otherInfo: [],
  },
  {
    id: "s5",
    facultyId: "f5",
    facultyName: "Prof. Srinivas Murthy",
    department: "Computer Science & Engineering",
    academicYear: "2024-25",
    status: "accepted_iqac",
    lastUpdated: "2025-04-25",
    submittedAt: "2025-04-05",
    hodRemarks: "Excellent research output. Approved.",
    principalRemarks: "Verified and forwarded to IQAC.",
    iqacRemarks: "Data verified. Accepted for AQAR 2024-25.",
    profile: { name: "Prof. Srinivas Murthy", designation: "Associate Professor", department: "Computer Science & Engineering", experience: "15", mobile: "9765432109", email: "srinivas@ku.ac.in", highestQual: "PhD", isResearchGuide: "Yes" },
    researchPapers: [
      { id: "rp5", title: "Deep Learning for Medical Image Analysis", journal: "IEEE Transactions on Medical Imaging", impactFactor: "10.6", issn: "0278-0062", volume: "Vol 43, Issue 3", year: "2024", authors: "Srinivas Murthy, et al.", doi: "10.1109/tmi.2024" },
      { id: "rp6", title: "Federated Learning in Edge Computing", journal: "ACM Computing Surveys", impactFactor: "16.1", issn: "0360-0300", volume: "Vol 56, Issue 8", year: "2024", authors: "Srinivas Murthy", doi: "10.1145/acm.2024" },
    ],
    booksChapters: [],
    fdpAttended: [
      { id: "fdp4", title: "AI & Machine Learning FDP", organizer: "IIT Bombay", dateFrom: "2024-10-10", dateTo: "2024-10-20", duration: "11", mode: "Online", sponsoredBy: "AICTE" },
    ],
    patents: [
      { id: "pat2", title: "Intelligent Traffic Management System", patentNumber: "IN2024/005678", patentStatus: "Awarded", patentUrl: "https://patents.google.com/patent/IN2024005678", year: "2024" },
    ],
    seminarsParticipated: [
      { id: "sp5", title: "IEEE International Conference on AI, Deep Learning, and Robotics", organizer: "IIT Madras, Chennai, Tamil Nadu", dateFrom: "2024-11-05", dateTo: "2024-11-08", level: "International", role: "Session Chair, Speaker" },
    ],
    seminarsOrganized: [
      { id: "so2", title: "International Conference on AI & Society", organizer: "CSE Dept KU", dateFrom: "2025-02-10", dateTo: "2025-02-12", level: "International", role: "Organizing Secretary" },
    ],
    fellowships: [
      { id: "fel5", name: "AICTE National Research Fellowship", type: "National", body: "AICTE, New Delhi", amount: "600000", year: "2024" },
    ],
    fundedProjects: [
      { id: "fp2", title: "AI-based Crop Disease Detection", agency: "ICAR", type: "Government", amount: "2500000", duration: "2", projectStatus: "Ongoing" },
    ],
    awardsResearch: [
      { id: "ar2", name: "Young Scientist Award", body: "DST Telangana", year: "2024" },
    ],
    econtent: [
      { id: "ec2", title: "Python for Data Science", platform: "SWAYAM", url: "https://swayam.gov.in/py-ds", year: "2024" },
    ],
    awardsExtension: [
      { id: "ae1", name: "Best Outreach Programme", body: "Kakatiya University", year: "2024" },
    ],
    outRangeActivity: [
      { id: "ora2", description: "Free Coding and STEM Bootcamps for Tribal High School Students, Mahabubabad", year: "2024" },
    ],
    otherInfo: [
      { id: "oi5", description: "Convener, University Web Portal Development, NAAC Criteria 3 Incharge, and Member of Board of Studies.", year: "2024" },
    ],
  },
];

// Cached submission state (initialized from localStorage when available)
let cachedSubmissions: Submission[] | null = null;
let cachedUsers: User[] | null = null;

export function getAllUsers(): User[] {
  if (cachedUsers === null) {
    const stored = loadUsersFromStorage();
    cachedUsers = stored || [...mockUsers];
  }
  return cachedUsers;
}

export function saveUsers(users: User[]): void {
  cachedUsers = users;
  saveUsersToStorage(users);
}

export function getUserByCredentials(email: string, password: string): User | null {
  return getAllUsers().find(u => u.email === email && u.password === password) ?? null;
}

export function getSubmissionByFacultyId(facultyId: string): Submission | undefined {
  const subs = getAllSubmissions();
  return subs.find(s => s.facultyId === facultyId);
}

// Create a missing submission record for a faculty (client-side, localStorage-backed).
export function createSubmissionForFaculty(user: Pick<User, "id" | "name" | "department">): Submission {
  const subs = getAllSubmissions();
  const existing = subs.find(s => s.facultyId === user.id);
  if (existing) return existing;

  const now = new Date().toISOString();

  const sub: Submission = {
    id: `s_${Math.random().toString(36).slice(2)}`,
    facultyId: user.id,
    facultyName: user.name,
    department: user.department,
    academicYear: "2024-25",
    status: "draft",
    lastUpdated: now,
    profile: {
      name: user.name,
      department: user.department,
      // other profile fields are collected in the form; keep empty defaults here
      designation: "",
    },
    researchPapers: [],
    booksChapters: [],
    fdpAttended: [],
    patents: [],
    seminarsParticipated: [],
    seminarsOrganized: [],
    fellowships: [],
    fundedProjects: [],
    awardsResearch: [],
    awardsExtension: [],
    econtent: [],
    outRangeActivity: [],
    otherInfo: [],
  };

  subs.push(sub);
  cachedSubmissions = subs;
  saveToStorage(subs);
  return sub;
}

export function getSubmissionsByDept(dept: string): Submission[] {
  return getAllSubmissions().filter(s => s.department === dept);
}

export function getAllSubmissions(): Submission[] {
  // Try to load from localStorage first (client-side only)
  if (cachedSubmissions === null) {
    const stored = loadFromStorage();
    cachedSubmissions = stored || [...mockSubmissions];
  }
  return cachedSubmissions;
}

// Update submission status and persist to localStorage
export function updateSubmission(id: string, updates: Partial<Submission>): boolean {
  const subs = getAllSubmissions();
  const idx = subs.findIndex(s => s.id === id);
  if (idx === -1) return false;
  
  subs[idx] = { ...subs[idx], ...updates, lastUpdated: new Date().toISOString() };
  cachedSubmissions = subs;
  saveToStorage(subs);
  return true;
}

export function deleteSubmissionByFacultyId(facultyId: string): boolean {
  const subs = getAllSubmissions();
  const existing = subs.find(s => s.facultyId === facultyId);
  if (existing && !canFacultyEdit(existing.status)) {
    return false;
  }
  const next = subs.filter(s => s.facultyId !== facultyId);
  if (next.length === subs.length) return false;

  cachedSubmissions = next;
  saveToStorage(next);
  return true;
}

export const statusColorMap: Record<SubmissionStatus, string> = {
  draft: "bg-gray-100 text-gray-700",
  submitted: "bg-blue-100 text-blue-800",
  returned_hod: "bg-orange-100 text-orange-800",
  approved_hod: "bg-yellow-100 text-yellow-800",
  returned_principal: "bg-red-100 text-red-800",
  approved_principal: "bg-indigo-100 text-indigo-800",
  returned_iqac: "bg-pink-100 text-pink-800",
  accepted_iqac: "bg-green-100 text-green-800",
};
