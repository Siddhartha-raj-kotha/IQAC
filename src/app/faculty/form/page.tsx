"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import { AppShell } from "@/components/AppShell";
import { WizardProgress, WizardNav } from "@/components/WizardProgress";
import { DynamicTable } from "@/components/DynamicTable";
import { FileUpload } from "@/components/FileUpload";
import { Toast } from "@/components/Toast";
import { t } from "@/lib/translations";
import { departments, designations } from "@/lib/translations";
import { createSubmissionForFaculty, getSubmissionByFacultyId, updateSubmission, canFacultyEdit, DynamicRow, Submission } from "@/lib/mockData";
import {
  getResearchPaperCols, getBooksCols, getFdpCols, getPatentCols,
  getSeminarCols, getFellowshipCols, getProjectCols, getAwardCols,
  getEcontentCols, getOutRangeActivityCols, getOtherCols
} from "@/lib/formColumns";

const STEPS = [
  { key: "profile", labelEn: "Basic Profile", labelTe: "ప్రాథమిక వివరాలు" },
  { key: "papers", labelEn: "Research Papers", labelTe: "పరిశోధన పత్రాలు" },
  { key: "books", labelEn: "Books & Chapters", labelTe: "పుస్తకాలు & అధ్యాయాలు" },
  { key: "fdp", labelEn: "FDP Attended", labelTe: "FDP హాజరైనవి" },
  { key: "patents", labelEn: "Patents", labelTe: "పేటెంట్లు" },
  { key: "seminarsP", labelEn: "Seminars (Participated)", labelTe: "సెమినార్లు (పాల్గొన్నవి)" },
  { key: "seminarsO", labelEn: "Seminars (Organized)", labelTe: "సెమినార్లు (నిర్వహించినవి)" },
  { key: "fellowships", labelEn: "Fellowships", labelTe: "ఫెలోషిప్‌లు" },
  { key: "projects", labelEn: "Funded Projects", labelTe: "నిధుల ప్రాజెక్టులు" },
  { key: "awardsR", labelEn: "Awards / Recognitions for Research or Innovation", labelTe: "పరిశోధన లేదా ఆవిష్కరణకు అవార్డులు / గుర్తింపులు" },
  { key: "awardsE", labelEn: "Awards / Recognition for Extension Activities", labelTe: "విస్తరణ కార్యకలాపాలకు అవార్డులు / గుర్తింపు" },
  { key: "econtent", labelEn: "E-Content", labelTe: "ఈ-కంటెంట్" },
  { key: "outRange", labelEn: "Out Range Activity", labelTe: "అవుట్ రేంజ్ కార్యాచరణ" },
  { key: "other", labelEn: "Other Information", labelTe: "ఇతర సమాచారం" },
  { key: "review", labelEn: "Final Review & Submit", labelTe: "చివరి సమీక్ష & సమర్పణ" },
];

type ProfileData = Record<string, string>;

function emptyRow(): DynamicRow { return { id: Math.random().toString(36).slice(2) }; }

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-5 pb-4 border-b border-gray-200">
      <h2 className="text-xl font-bold text-ku-navy">{title}</h2>
      {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="form-label">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
      {children}
    </div>
  );
}

export default function FacultyFormPage() {
  const { user, isLoading } = useAuth();
  const { lang } = useLang();
  const router = useRouter();
  const e = lang === "en";

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "warning" } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState<Submission | null>(null);
  const [isResubmit, setIsResubmit] = useState(false);

  // Form state
  const [profile, setProfile] = useState<ProfileData>({});
  const [papers, setPapers] = useState<DynamicRow[]>([emptyRow()]);
  const [books, setBooks] = useState<DynamicRow[]>([emptyRow()]);
  const [fdp, setFdp] = useState<DynamicRow[]>([emptyRow()]);
  const [patents, setPatents] = useState<DynamicRow[]>([emptyRow()]);
  const [seminarsP, setSeminarsP] = useState<DynamicRow[]>([emptyRow()]);
  const [seminarsO, setSeminarsO] = useState<DynamicRow[]>([emptyRow()]);
  const [fellowships, setFellowships] = useState<DynamicRow[]>([emptyRow()]);
  const [projects, setProjects] = useState<DynamicRow[]>([emptyRow()]);
  const [awardsR, setAwardsR] = useState<DynamicRow[]>([emptyRow()]);
  const [awardsE, setAwardsE] = useState<DynamicRow[]>([emptyRow()]);
  const [econtent, setEcontent] = useState<DynamicRow[]>([emptyRow()]);
  const [outRange, setOutRange] = useState<DynamicRow[]>([emptyRow()]);
  const [other, setOther] = useState<DynamicRow[]>([emptyRow()]);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "faculty")) router.replace("/login");
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      const sub = getSubmissionByFacultyId(user.id);
      if (sub) {
        setCurrentSubmission(sub);
        setIsResubmit(sub.status === "returned_iqac" || sub.status === "returned_hod" || sub.status === "returned_principal");
        setProfile(sub.profile as ProfileData);
        if (sub.researchPapers.length) setPapers(sub.researchPapers);
        if (sub.booksChapters.length) setBooks(sub.booksChapters);
        if (sub.fdpAttended.length) setFdp(sub.fdpAttended);
        if (sub.patents.length) setPatents(sub.patents);
        if (sub.seminarsParticipated.length) setSeminarsP(sub.seminarsParticipated);
        if (sub.seminarsOrganized.length) setSeminarsO(sub.seminarsOrganized);
        if (sub.fellowships.length) setFellowships(sub.fellowships);
        if (sub.fundedProjects.length) setProjects(sub.fundedProjects);
        if (sub.awardsResearch.length) setAwardsR(sub.awardsResearch);
        if (sub.awardsExtension.length) setAwardsE(sub.awardsExtension);
        if (sub.econtent.length) setEcontent(sub.econtent);
        if (sub.outRangeActivity && sub.outRangeActivity.length) setOutRange(sub.outRangeActivity);
        if (sub.otherInfo.length) setOther(sub.otherInfo);
      } else {
        setProfile({ name: user.name, email: user.email, department: user.department, designation: user.designation || "" });
      }
    }
  }, [user]);

  if (isLoading || !user) return null;

  const isLocked = currentSubmission ? !canFacultyEdit(currentSubmission.status) : false;
  const steps = STEPS.map(s => ({ key: s.key, label: e ? s.labelEn : s.labelTe }));

  const handleReset = async () => {
    if (!user || isLocked) return;

    const confirmed = window.confirm(
      e
        ? "Reset & Start Fresh? This will remove your saved faculty data from this device."
        : "Reset & Start Fresh? ఈ డివైస్‌లో మీ సేవ్ చేసిన ఫ్యాకల్టీ డేటా తొలగించబడుతుంది."
    );

    if (!confirmed) return;

    const { deleteSubmissionByFacultyId } = await import("@/lib/mockData");
    deleteSubmissionByFacultyId(user.id);

    // Reset step + in-memory form state
    setStep(0);
    setCurrentSubmission(null);
    setProfile({
      name: user.name,
      email: user.email,
      department: user.department,
      designation: user.designation || "",
    });

    const fresh = [emptyRow()];
    setPapers(fresh);
    setBooks(fresh);
    setFdp(fresh);
    setPatents(fresh);
    setSeminarsP(fresh);
    setSeminarsO(fresh);
    setFellowships(fresh);
    setProjects(fresh);
    setAwardsR(fresh);
    setAwardsE(fresh);
    setEcontent(fresh);
    setOutRange(fresh);
    setOther(fresh);

    setToast({ msg: e ? "Reset completed. Start fresh!" : "రిసెట్ పూర్తైంది. కొత్తగా ప్రారంభించండి!", type: "success" });
  };

  const handleSave = async () => {
    if (isLocked) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 700));
    setSaving(false);
    setToast({ msg: e ? "Draft saved successfully!" : "ముసాయిదా సేవ్ అయింది!", type: "success" });
  };

  const handleSubmit = async () => {
    if (isLocked) return;
    setShowConfirm(false);
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);

    if (!user) return;

    // Ensure a submission record exists for this faculty (admin-added users may have none yet).
    const sub = currentSubmission ?? createSubmissionForFaculty({
      id: user.id,
      name: user.name,
      department: user.department,
    });

    const nowIso = new Date().toISOString();

    const success = updateSubmission(sub.id, {
      status: "submitted",
      submittedAt: nowIso,
      lastUpdated: nowIso,
      facultyId: user.id,
      facultyName: user.name,
      department: user.department,
      profile: profile,
      researchPapers: papers,
      booksChapters: books,
      fdpAttended: fdp,
      patents: patents,
      seminarsParticipated: seminarsP,
      seminarsOrganized: seminarsO,
      fellowships: fellowships,
      fundedProjects: projects,
      awardsResearch: awardsR,
      awardsExtension: awardsE,
      econtent: econtent,
      outRangeActivity: outRange,
      otherInfo: other,
    });

    if (!success) {
      setToast({ msg: e ? "Submit failed. Try again." : "సమర్పణ విఫలమైంది. మళ్ళీ ప్రయత్నించండి.", type: "error" });
      return;
    }

    const updatedSub = getSubmissionByFacultyId(user.id) ?? sub;
    setCurrentSubmission(updatedSub);
    setToast({ msg: e ? "Form submitted directly to IQAC!" : "ఫారం నేరుగా IQAC కి సమర్పించబడింది!", type: "success" });
    setTimeout(() => router.push("/faculty"), 2000);
  };

  const handleResubmit = async () => {
    if (!currentSubmission || isLocked) return;
    setSaving(true);
    const nowIso = new Date().toISOString();
    const success = updateSubmission(currentSubmission.id, {
      status: "submitted" as const,
      submittedAt: nowIso,
      lastUpdated: nowIso,
      profile: profile,
      researchPapers: papers,
      booksChapters: books,
      fdpAttended: fdp,
      patents: patents,
      seminarsParticipated: seminarsP,
      seminarsOrganized: seminarsO,
      fellowships: fellowships,
      fundedProjects: projects,
      awardsResearch: awardsR,
      awardsExtension: awardsE,
      econtent: econtent,
      outRangeActivity: outRange,
      otherInfo: other,
    });
    setSaving(false);
    if (success) {
      const updatedSub = getSubmissionByFacultyId(user.id) ?? currentSubmission;
      setCurrentSubmission(updatedSub);
      setToast({ msg: e ? "Form resubmitted to IQAC successfully!" : "IQAC కి విజయవంతంగా మళ్ళీ సమర్పించబడింది!", type: "success" });
      setTimeout(() => router.push("/faculty"), 1500);
    } else {
      setToast({ msg: e ? "Resubmit failed. Try again." : "మళ్ళీ సమర్పణ విఫలం. మళ్ళీ ప్రయత్నించండి.", type: "error" });
    }
  };

  const setProfileField = (key: string, val: string) => setProfile(p => ({ ...p, [key]: val }));

  const renderStep = () => {
    switch (step) {
      case 0: return (
        <div>
          <SectionHeader
            title={e ? "Teacher Basic Profile" : "అధ్యాపకుడి ప్రాథమిక వివరాలు"}
            subtitle={e ? "Fill in your personal and professional details carefully." : "మీ వ్యక్తిగత మరియు వృత్తిపరమైన వివరాలు జాగ్రత్తగా నమోదు చేయండి."}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label={e ? "Name of Teacher" : "అధ్యాపకుడి పేరు"} required>
              <input className="form-input" value={profile.name || ""} onChange={e2 => setProfileField("name", e2.target.value)} placeholder={e ? "Full name as per records" : "రికార్డుల ప్రకారం పూర్తి పేరు"} disabled={isLocked} />
            </Field>
            <Field label={e ? "Designation" : "హోదా"} required>
              <select className="form-select" value={profile.designation || ""} onChange={e2 => setProfileField("designation", e2.target.value)} disabled={isLocked}>
                <option value="">{e ? "Select..." : "ఎంచుకోండి..."}</option>
                {designations.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
            <Field label={e ? "Department" : "విభాగం"} required>
              <select className="form-select" value={profile.department || ""} onChange={e2 => setProfileField("department", e2.target.value)} disabled={isLocked}>
                <option value="">{e ? "Select..." : "ఎంచుకోండి..."}</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
            <Field label={e ? "Date of Appointment" : "నియామక తేదీ"}>
              <input type="date" className="form-input" value={profile.dateOfAppointment || ""} onChange={e2 => setProfileField("dateOfAppointment", e2.target.value)} disabled={isLocked} />
            </Field>
            <Field label={e ? "Appointment Order Evidence" : "నియామక ఉత్తర్వు సాక్ష్యం"}>
              <FileUpload
                lang={lang}
                value={profile.appointmentOrderEvidence || ""}
                onChange={val => setProfileField("appointmentOrderEvidence", val)}
                onRemove={() => setProfileField("appointmentOrderEvidence", "")}
                disabled={isLocked}
              />
            </Field>
            <Field label={e ? "Years of Experience (this institution)" : "అనుభవం సంవత్సరాలు (ఈ సంస్థలో)"}>
              <input type="number" className="form-input" value={profile.experience || ""} onChange={e2 => setProfileField("experience", e2.target.value)} placeholder="e.g. 15" min="0" max="50" disabled={isLocked} />
            </Field>
            <Field label={e ? "Mobile Number" : "మొబైల్ నంబర్"} required>
              <input type="tel" className="form-input" value={profile.mobile || ""} onChange={e2 => setProfileField("mobile", e2.target.value)} placeholder="10-digit mobile number" maxLength={10} disabled={isLocked} />
            </Field>
            <Field label={e ? "Email ID" : "ఇమెయిల్ ID"} required>
              <input type="email" className="form-input" value={profile.email || ""} onChange={e2 => setProfileField("email", e2.target.value)} placeholder="your.email@ku.ac.in" disabled={isLocked} />
            </Field>
            <Field label="PAN Number">
              <input className="form-input" value={profile.pan || ""} onChange={e2 => setProfileField("pan", e2.target.value)} placeholder="ABCDE1234F" maxLength={10} style={{ textTransform: "uppercase" }} disabled={isLocked} />
            </Field>
            <Field label={e ? "PAN Card Evidence" : "PAN కార్డు సాక్ష్యం"}>
              <FileUpload
                lang={lang}
                value={profile.panEvidence || ""}
                onChange={val => setProfileField("panEvidence", val)}
                onRemove={() => setProfileField("panEvidence", "")}
                disabled={isLocked}
              />
            </Field>
            <Field label={e ? "AADHAR Number" : "ఆధార్ నంబర్"}>
              <input className="form-input" value={profile.aadhar || ""} onChange={e2 => setProfileField("aadhar", e2.target.value)} placeholder="1234 5678 9012" maxLength={14} disabled={isLocked} />
            </Field>
            <Field label={e ? "Aadhaar Card Evidence" : "ఆధార్ కార్డు సాక్ష్యం"}>
              <FileUpload
                lang={lang}
                value={profile.aadharEvidence || ""}
                onChange={val => setProfileField("aadharEvidence", val)}
                onRemove={() => setProfileField("aadharEvidence", "")}
                disabled={isLocked}
              />
            </Field>
            <Field label={e ? "Social Status / Sub-caste" : "సామాజిక స్థితి / ఉప-కులం"}>
              <input className="form-input" value={profile.socialStatus || ""} onChange={e2 => setProfileField("socialStatus", e2.target.value)} placeholder={e ? "e.g. OBC - Kuruma" : "ఉదా. OBC - కురుమ"} disabled={isLocked} />
            </Field>
            <Field label={e ? "Date of Birth" : "పుట్టిన తేదీ"}>
              <input type="date" className="form-input" value={profile.dob || ""} onChange={e2 => setProfileField("dob", e2.target.value)} disabled={isLocked} />
            </Field>
            <Field label={e ? "Higher Qualification" : "అత్యధిక అర్హత"}>
              <input
                type="text"
                className="form-input"
                value={profile.highestQual || ""}
                onChange={e2 => setProfileField("highestQual", e2.target.value)}
                placeholder={e ? "e.g. Ph.D., Post-Doctoral, M.Tech" : "ఉదా. Ph.D., M.Tech"}
                disabled={isLocked}
              />
            </Field>
            <Field label={e ? "Highest Qualification Certificate Evidence" : "అత్యధిక అర్హత సర్టిఫికేట్ సాక్ష్యం"}>
              <FileUpload
                lang={lang}
                value={profile.highestQualEvidence || ""}
                onChange={val => setProfileField("highestQualEvidence", val)}
                onRemove={() => setProfileField("highestQualEvidence", "")}
                disabled={isLocked}
              />
            </Field>
            <Field label={e ? "Date of Awarding PhD" : "PhD అందుకున్న తేదీ"}>
              <input type="date" className="form-input" value={profile.phdDate || ""} onChange={e2 => setProfileField("phdDate", e2.target.value)} disabled={isLocked} />
            </Field>
            <Field label={e ? "Recognized as Research Guide?" : "పరిశోధన గైడ్‌గా గుర్తింపు పొందారా?"}>
              <select className="form-select" value={profile.isResearchGuide || ""} onChange={e2 => setProfileField("isResearchGuide", e2.target.value)} disabled={isLocked}>
                <option value="">{e ? "Select..." : "ఎంచుకోండి..."}</option>
                <option value="Yes">{e ? "Yes" : "అవును"}</option>
                <option value="No">{e ? "No" : "లేదు"}</option>
              </select>
            </Field>
            {profile.isResearchGuide === "Yes" && (
              <>
                <Field label={e ? "Date of Recognition as Research Guide" : "పరిశోధన గైడ్‌గా గుర్తింపు తేదీ"}>
                  <input type="date" className="form-input" value={profile.researchGuideDate || ""} onChange={e2 => setProfileField("researchGuideDate", e2.target.value)} disabled={isLocked} />
                </Field>
                <Field label={e ? "Research Guide Certificate Evidence" : "పరిశోధన గైడ్ సర్టిఫికేట్ సాక్ష్యం"}>
                  <FileUpload
                    lang={lang}
                    value={profile.researchGuideEvidence || ""}
                    onChange={val => setProfileField("researchGuideEvidence", val)}
                    onRemove={() => setProfileField("researchGuideEvidence", "")}
                    disabled={isLocked}
                  />
                </Field>
              </>
            )}
          </div>
        </div>
      );

      case 1: return (
        <div>
          <SectionHeader title={e ? "Research Papers" : "పరిశోధన పత్రాలు"}
            subtitle={e ? "Add all research papers published between June 2024 – May 2025." : "జూన్ 2024 – మే 2025 మధ్య ప్రచురించిన అన్ని పరిశోధన పత్రాలను జోడించండి."} />
          <DynamicTable columns={getResearchPaperCols(lang)} rows={papers} onChange={setPapers} lang={lang} sectionName="Research Papers" readOnly={isLocked} />
        </div>
      );
      case 2: return (
        <div>
          <SectionHeader title={e ? "Books / Chapters / Conference Proceedings" : "పుస్తకాలు / అధ్యాయాలు / కాన్ఫరెన్స్ ప్రొసీడింగ్స్"} />
          <DynamicTable columns={getBooksCols(lang)} rows={books} onChange={setBooks} lang={lang} sectionName="Books and Chapters" readOnly={isLocked} />
        </div>
      );
      case 3: return (
        <div>
          <SectionHeader title={e ? "Faculty Development Programmes (FDP) Attended" : "అధ్యాపక అభివృద్ధి కార్యక్రమాలు (FDP) హాజరైనవి"} />
          <DynamicTable columns={getFdpCols(lang)} rows={fdp} onChange={setFdp} lang={lang} sectionName="FDP Attended" readOnly={isLocked} />
        </div>
      );
      case 4: return (
        <div>
          <SectionHeader title={e ? "Patents Published / Awarded" : "పేటెంట్లు ప్రచురించినవి / అందుకున్నవి"} />
          <DynamicTable columns={getPatentCols(lang)} rows={patents} onChange={setPatents} lang={lang} sectionName="Patents" readOnly={isLocked} />
        </div>
      );
      case 5: return (
        <div>
          <SectionHeader title={e ? "Seminars / Conferences / Workshops — Participated" : "సెమినార్లు / సమావేశాలు / వర్క్‌షాప్‌లు — పాల్గొన్నవి"} />
          <DynamicTable columns={getSeminarCols(lang)} rows={seminarsP} onChange={setSeminarsP} lang={lang} sectionName="Seminars Participated" readOnly={isLocked} />
        </div>
      );
      case 6: return (
        <div>
          <SectionHeader title={e ? "Seminars / Conferences / Workshops — Organized" : "సెమినార్లు / సమావేశాలు / వర్క్‌షాప్‌లు — నిర్వహించినవి"} />
          <DynamicTable columns={getSeminarCols(lang)} rows={seminarsO} onChange={setSeminarsO} lang={lang} sectionName="Seminars Organized" readOnly={isLocked} />
        </div>
      );
      case 7: return (
        <div>
          <SectionHeader title={e ? "National / International Fellowships or Financial Support" : "జాతీయ / అంతర్జాతీయ ఫెలోషిప్‌లు లేదా ఆర్థిక సహాయం"} />
          <DynamicTable columns={getFellowshipCols(lang)} rows={fellowships} onChange={setFellowships} lang={lang} sectionName="Fellowships" readOnly={isLocked} />
        </div>
      );
      case 8: return (
        <div>
          <SectionHeader title={e ? "Research Projects funded by Govt / Non-Govt Agencies" : "ప్రభుత్వ / ప్రైవేట్ సంస్థలు నిధులు అందించిన పరిశోధన ప్రాజెక్టులు"} />
          <DynamicTable columns={getProjectCols(lang)} rows={projects} onChange={setProjects} lang={lang} sectionName="Funded Projects" readOnly={isLocked} />
        </div>
      );
      case 9: return (
        <div>
          <SectionHeader title={e ? "Awards / Recognitions for Research or Innovation" : "పరిశోధన లేదా ఆవిష్కరణకు అవార్డులు / గుర్తింపులు"} />
          <DynamicTable columns={getAwardCols(lang)} rows={awardsR} onChange={setAwardsR} lang={lang} sectionName="Research Awards" readOnly={isLocked} />
        </div>
      );
      case 10: return (
        <div>
          <SectionHeader title={e ? "Awards / Recognition for Extension Activities" : "విస్తరణ కార్యకలాపాలకు అవార్డులు / గుర్తింపు"} />
          <DynamicTable columns={getAwardCols(lang)} rows={awardsE} onChange={setAwardsE} lang={lang} sectionName="Extension Awards" readOnly={isLocked} />
        </div>
      );
      case 11: return (
        <div>
          <SectionHeader title={e ? "E-Content Developed" : "ఈ-కంటెంట్ అభివృద్ధి చేయబడింది"} />
          <DynamicTable columns={getEcontentCols(lang)} rows={econtent} onChange={setEcontent} lang={lang} sectionName="E-Content" readOnly={isLocked} />
        </div>
      );
      case 12: return (
        <div>
          <SectionHeader title={e ? "Out Range Activity" : "అవుట్ రేంజ్ కార్యాచరణ"} />
          <DynamicTable columns={getOutRangeActivityCols(lang)} rows={outRange} onChange={setOutRange} lang={lang} sectionName="Out Range Activity" readOnly={isLocked} />
        </div>
      );
      case 13: return (
        <div>
          <SectionHeader title={e ? "Any Other Information" : "ఏదైనా ఇతర సమాచారం"} />
          <DynamicTable columns={getOtherCols(lang)} rows={other} onChange={setOther} lang={lang} sectionName="Other Information" readOnly={isLocked} />
        </div>
      );

      case 14: return (
        <div>
          <SectionHeader
            title={e ? "Final Review — Please verify before submitting" : "చివరి సమీక్ష — సమర్పించే ముందు ధృవీకరించండి"}
            subtitle={e ? "Once submitted, you cannot edit unless IQAC returns the form for corrections." : "సమర్పించిన తర్వాత, IQAC సవరణలకు తిరిగి పంపే వరకు మీరు సవరించలేరు."}
          />
          <div className="space-y-4">
            {[
              { label: e ? "Teacher Name" : "అధ్యాపకుడి పేరు", val: profile.name },
              { label: e ? "Designation" : "హోదా", val: profile.designation },
              { label: e ? "Department" : "విభాగం", val: profile.department },
              { label: e ? "Email" : "ఇమెయిల్", val: profile.email },
              { label: e ? "Mobile" : "మొబైల్", val: profile.mobile },
              { label: e ? "Higher Qualification" : "అర్హత", val: profile.highestQual },
              { label: e ? "Highest Qual Certificate" : "అర్హత సర్టిఫికేట్", val: profile.highestQualEvidence },
              { label: e ? "Appointment Order" : "నియామక ఉత్తర్వు", val: profile.appointmentOrderEvidence },
              { label: e ? "PAN Document" : "PAN పత్రం", val: profile.panEvidence },
              { label: e ? "Aadhaar Document" : "ఆధార్ పత్రం", val: profile.aadharEvidence },
              { label: e ? "Research Guide Certificate" : "పరిశోధన గైడ్ సర్టిఫికేట్", val: profile.researchGuideEvidence },
              { label: e ? "Research Papers" : "పరిశోధన పత్రాలు", val: `${papers.filter(r => r.title).length} ${e ? "entries" : "ఎంట్రీలు"}` },
              { label: e ? "Books / Chapters" : "పుస్తకాలు / అధ్యాయాలు", val: `${books.filter(r => r.title).length} ${e ? "entries" : "ఎంట్రీలు"}` },
              { label: e ? "FDP Attended" : "FDP హాజరైనవి", val: `${fdp.filter(r => r.title).length} ${e ? "entries" : "ఎంట్రీలు"}` },
              { label: e ? "Patents" : "పేటెంట్లు", val: `${patents.filter(r => r.title).length} ${e ? "entries" : "ఎంట్రీలు"}` },
              { label: e ? "Seminars Participated" : "సెమినార్లు (పాల్గొన్నవి)", val: `${seminarsP.filter(r => r.title).length} ${e ? "entries" : "ఎంట్రీలు"}` },
              { label: e ? "Seminars Organized" : "సెమినార్లు (నిర్వహించినవి)", val: `${seminarsO.filter(r => r.title).length} ${e ? "entries" : "ఎంట్రీలు"}` },
              { label: e ? "Fellowships" : "ఫెలోషిప్‌లు", val: `${fellowships.filter(r => r.name).length} ${e ? "entries" : "ఎంట్రీలు"}` },
              { label: e ? "Funded Projects" : "నిధుల ప్రాజెక్టులు", val: `${projects.filter(r => r.title).length} ${e ? "entries" : "ఎంట్రీలు"}` },
              { label: e ? "Awards (Research)" : "బహుమతులు (పరిశోధన)", val: `${awardsR.filter(r => r.name).length} ${e ? "entries" : "ఎంట్రీలు"}` },
              { label: e ? "Extension Awards" : "విస్తరణ బహుమతులు", val: `${awardsE.filter(r => r.name).length} ${e ? "entries" : "ఎంట్రీలు"}` },
              { label: e ? "E-Content" : "ఈ-కంటెంట్", val: `${econtent.filter(r => r.title).length} ${e ? "entries" : "ఎంట్రీలు"}` },
              { label: e ? "Out Range Activity" : "అవుట్ రేంజ్ కార్యాచరణ", val: `${outRange.filter(r => r.description).length} ${e ? "entries" : "ఎంట్రీలు"}` },
              { label: e ? "Other Information" : "ఇతర సమాచారం", val: `${other.filter(r => r.description).length} ${e ? "entries" : "ఎంట్రీలు"}` },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">{item.label}</span>
                <span className="text-ku-navy font-semibold">{item.val || <span className="text-gray-300">—</span>}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-300 rounded-xl">
            <p className="text-yellow-800 font-semibold text-sm">
              ⚠️ {e ? "Once submitted, your form will be sent directly to IQAC for review. Editing will be locked until IQAC returns the form." : "సమర్పించిన తర్వాత, మీ ఫారం నేరుగా IQAC సమీక్ష కోసం పంపబడుతుంది. IQAC తిరిగి పంపే వరకు సవరణలు లాక్ చేయబడతాయి."}
            </p>
          </div>
        </div>
      );

      default: return null;
    }
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto">
        {isLocked && (
          <div className="mb-5 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-xl flex items-start gap-3 shadow-sm">
            <span className="text-xl">🔒</span>
            <div>
              <p className="font-bold text-amber-900">
                {currentSubmission?.status === "accepted_iqac"
                  ? (e ? "Submission Accepted & Finalized by IQAC" : "సమర్పణ IQAC ద్వారా అంగీకరించబడింది & ఖరారు చేయబడింది")
                  : (e ? "Submission Under IQAC Review — Form Locked" : "IQAC సమీక్షలో ఉంది — ఫారం లాక్ చేయబడింది")}
              </p>
              <p className="text-amber-800 text-sm mt-0.5">
                {currentSubmission?.status === "accepted_iqac"
                  ? (e ? "Your submission has been accepted and finalized by IQAC. Editing is locked." : "మీ సమర్పణ IQAC ద్వారా అంగీకరించబడింది. సవరణలు నిలిపివేయబడ్డాయి.")
                  : (e ? "Your form has been submitted directly to IQAC. Editing is locked until IQAC reviews or returns your form for corrections." : "మీ ఫారం నేరుగా IQAC కి సమర్పించబడింది. IQAC సమీక్షించి సవరణలకు తిరిగి పంపే వరకు సవరణలు లాక్ చేయబడతాయి.")}
              </p>
            </div>
          </div>
        )}

        {isResubmit && !isLocked && (
          <div className="mb-5 p-4 bg-orange-50 border-l-4 border-orange-500 rounded-xl flex items-start gap-3 shadow-sm">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-bold text-orange-900">
                {e ? "Form Returned by IQAC for Corrections" : "IQAC ద్వారా సవరణల కోసం ఫారం తిరిగి పంపబడింది"}
              </p>
              <p className="text-orange-800 text-sm mt-0.5">
                <strong>{e ? "IQAC Remarks:" : "IQAC వ్యాఖ్యలు:"}</strong>{" "}
                {currentSubmission?.iqacRemarks || currentSubmission?.hodRemarks || currentSubmission?.principalRemarks || (e ? "Please review remarks, update your entries, and resubmit to IQAC." : "దయచేసి వ్యాఖ్యలను సమీక్షించి, మీ ఎంట్రీలను నవీకరించి, IQAC కి మళ్ళీ సమర్పించండి.")}
              </p>
            </div>
          </div>
        )}

        <div className="card p-5 mb-5">
          <WizardProgress steps={steps} currentStep={step} lang={lang} onStepClick={setStep} />
        </div>

        <div className="card p-6 min-h-[400px]">
          {renderStep()}
          {!isLocked && (
            <div className="flex items-center justify-between gap-4 mb-3">
              <div />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleReset}
                disabled={saving}
              >
                {e ? "Reset & Start Fresh" : "రిసెట్ & కొత్తగా ప్రారంభించండి"}
              </button>
            </div>
          )}

          <WizardNav
            currentStep={step}
            totalSteps={STEPS.length}
            lang={lang}
            onNext={() => setStep(s => Math.min(s + 1, STEPS.length - 1))}
            onPrev={() => setStep(s => Math.max(s - 1, 0))}
            onSave={handleSave}
            onSubmit={isResubmit ? handleResubmit : (() => setShowConfirm(true))}
            saving={saving}
            isLocked={isLocked}
            isResubmit={isResubmit}
          />
          {isResubmit && !isLocked && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-blue-800 font-semibold text-sm mb-2">
                ℹ️ {e ? "Form was returned for corrections. After editing, click RESUBMIT to send directly to IQAC." : "సవరణల కోసం తిరిగి పంపబడింది. సవరించిన తర్వాత నేరుగా IQAC కి RESUBMIT చేయండి."}
              </p>
              {currentSubmission?.iqacRemarks && (
                <div className="bg-yellow-50 p-3 rounded-lg text-sm">
                  <p className="font-semibold text-yellow-800 mb-1">{e ? "IQAC Remarks:" : "IQAC వ్యాఖ్యలు:"}</p>
                  <p className="text-yellow-700">{currentSubmission.iqacRemarks}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirm submit dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-7 max-w-md w-full">
            <h3 className="text-xl font-bold text-ku-navy mb-3">
              {e ? "Confirm Submission to IQAC" : "IQAC కి సమర్పణ నిర్ధారించండి"}
            </h3>
            <p className="text-gray-600 mb-6">
              {isResubmit
                ? (e ? "Confirm resubmission directly to IQAC after corrections?" : "సవరణల తర్వాత నేరుగా IQAC కి మళ్ళీ సమర్పించాలా?")
                : (e ? "Are you sure you want to submit directly to IQAC? Editing will be locked until IQAC reviews or returns your form." : "మీరు నేరుగా IQAC కి సమర్పించాలని నిశ్చయించుకున్నారా? IQAC సమీక్షించి సవరణలకు తిరిగి పంపే వరకు సవరణలు లాక్ చేయబడతాయి.")}
            </p>
            <div className="flex gap-3 justify-end">
              <button className="btn btn-secondary" onClick={() => setShowConfirm(false)}>{t("cancel", lang)}</button>
              <button className="btn btn-gold" onClick={handleSubmit}>🚀 {e ? "Yes, Submit to IQAC" : "అవును, IQAC కి సమర్పించు"}</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.msg} type={toast.type} onDismiss={() => setToast(null)} />}
    </AppShell>
  );
}
