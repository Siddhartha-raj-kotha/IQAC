"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { Toast } from "@/components/Toast";
import { t } from "@/lib/translations";
import { getAllSubmissions, updateSubmission, Submission, mockUsers } from "@/lib/mockData";
import { Eye, CheckCircle, XCircle, Download, Search, BarChart3, FileSpreadsheet, FileText, KeyRound } from "lucide-react";
import { ChangePasswordModal } from "@/components/ChangePasswordModal";
import {
  exportFacultyToExcel,
  exportAllFacultyToExcel,
  exportFacultyToPdf,
  exportAllFacultyToPdf,
  exportFacultyToCsv,
  exportAllFacultyToCsv,
} from "@/lib/exportUtils";

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const { lang } = useLang();
  const router = useRouter();
  const e = lang === "en";

  const [subs, setSubs] = useState<Submission[]>([]);
  const [filtered, setFiltered] = useState<Submission[]>([]);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Submission | null>(null);
  const [remarks, setRemarks] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) router.replace("/login");
  }, [user, isLoading, router]);

  useEffect(() => {
    setSubs(getAllSubmissions());
  }, []);

  useEffect(() => {
    let data = subs;
    if (search) data = data.filter(s => s.facultyName.toLowerCase().includes(search.toLowerCase()) || s.department.toLowerCase().includes(search.toLowerCase()));
    if (deptFilter !== "all") data = data.filter(s => s.department === deptFilter);
    if (statusFilter !== "all") data = data.filter(s => s.status === statusFilter);
    setFiltered(data);
  }, [search, deptFilter, statusFilter, subs]);

if (isLoading || !user) return null;

  const handleAction = (type: "accept" | "return") => {
    if (!selected) return;
    if (type === "return" && !remarks.trim()) {
setToast({ msg: e ? "Please enter remarks before returning." : "తిరిగి పంపే ముందు వ్యాఖ్యలు నమోదు చేయండి.", type: "error" });
      return;
    }
    const updates: Partial<Submission> = {
      status: type === "accept" ? "accepted_iqac" : "returned_iqac",
      iqacRemarks: remarks,
    };
    const success = updateSubmission(selected.id, updates);
    if (success) {
      setSubs([...getAllSubmissions()]);
      setToast({
        msg: type === "accept"
          ? (e ? "Submission accepted by IQAC!" : "IQAC సమర్పణ అంగీకరించింది!")
          : (e ? "Returned for correction." : "సవరణ కోసం తిరిగి పంపబడింది."),
        type: "success"
      });
      setSelected(null);
      setRemarks("");
    }
  };

  const handleExportAllExcel = () => {
    try {
      exportAllFacultyToExcel(allSubs);
      setToast({
        msg: e ? "Consolidated Excel workbook exported successfully!" : "సమీకృత Excel వర్క్‌బుక్ ఎగుమతి చేయబడింది!",
        type: "success",
      });
    } catch (err) {
      console.error(err);
      setToast({ msg: e ? "Failed to export Excel." : "Excel ఎగుమతి విఫలమైంది.", type: "error" });
    }
  };

  const handleExportAllPdf = () => {
    try {
      exportAllFacultyToPdf(allSubs);
      setToast({
        msg: e ? "Consolidated PDF exported successfully!" : "సమీకృత PDF ఎగుమతి చేయబడింది!",
        type: "success",
      });
    } catch (err) {
      console.error(err);
      setToast({ msg: e ? "Failed to export PDF." : "PDF ఎగుమతి విఫలమైంది.", type: "error" });
    }
  };

  const handleExportAllCsv = () => {
    try {
      exportAllFacultyToCsv(allSubs);
      setToast({
        msg: e ? "Summary CSV exported successfully!" : "సారాంశం CSV ఎగుమతి చేయబడింది!",
        type: "success",
      });
    } catch (err) {
      console.error(err);
      setToast({ msg: e ? "Failed to export CSV." : "CSV ఎగుమతి విఫలమైంది.", type: "error" });
    }
  };

  const handleExportFacultyExcel = (sub: Submission) => {
    try {
      exportFacultyToExcel(sub);
      setToast({
        msg: e ? `Excel exported for ${sub.facultyName}!` : `${sub.facultyName} కోసం Excel ఎగుమతి చేయబడింది!`,
        type: "success",
      });
    } catch (err) {
      console.error(err);
      setToast({ msg: e ? "Failed to export Excel." : "Excel ఎగుమతి విఫలమైంది.", type: "error" });
    }
  };

  const handleExportFacultyPdf = (sub: Submission) => {
    try {
      exportFacultyToPdf(sub);
      setToast({
        msg: e ? `PDF exported for ${sub.facultyName}!` : `${sub.facultyName} కోసం PDF ఎగుమతి చేయబడింది!`,
        type: "success",
      });
    } catch (err) {
      console.error(err);
      setToast({ msg: e ? "Failed to export PDF." : "PDF ఎగుమతి విఫలమైంది.", type: "error" });
    }
  };

  const handleExportFacultyCsv = (sub: Submission) => {
    try {
      exportFacultyToCsv(sub);
      setToast({
        msg: e ? `CSV exported for ${sub.facultyName}!` : `${sub.facultyName} కోసం CSV ఎగుమతి చేయబడింది!`,
        type: "success",
      });
    } catch (err) {
      console.error(err);
      setToast({ msg: e ? "Failed to export CSV." : "CSV ఎగుమతి విఫలమైంది.", type: "error" });
    }
  };

  const allSubs = getAllSubmissions();
  const stats = [
    { label: e ? "Total Faculty" : "మొత్తం అధ్యాపకులు", val: mockUsers.filter(u => u.role === "faculty").length, bg: "bg-blue-50", color: "text-blue-800" },
    { label: e ? "Submitted" : "సమర్పించారు", val: allSubs.filter(s => s.status !== "draft").length, bg: "bg-indigo-50", color: "text-indigo-800" },
    { label: e ? "Accepted by IQAC" : "IQAC అంగీకరించింది", val: allSubs.filter(s => s.status === "accepted_iqac").length, bg: "bg-green-50", color: "text-green-800" },
    { label: e ? "Pending Review" : "సమీక్ష పెండింగ్", val: allSubs.filter(s => s.status === "submitted").length, bg: "bg-yellow-50", color: "text-yellow-800" },
    { label: e ? "Returned" : "తిరిగి పంపబడింది", val: allSubs.filter(s => s.status === "returned_iqac").length, bg: "bg-red-50", color: "text-red-800" },
    { label: e ? "Draft / Not Submitted" : "ముసాయిదా / సమర్పించలేదు", val: allSubs.filter(s => s.status === "draft").length, bg: "bg-gray-50", color: "text-gray-700" },
  ];

  const canAct = (s: Submission) => s.status === "submitted";

  const depts = [...new Set(allSubs.map(s => s.department))];

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="ku-header rounded-2xl p-6 text-white flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{e ? "IQAC Admin Dashboard" : "IQAC అడ్మిన్ డాష్బోర్డ్"}</h1>
            <p className="text-white/70 text-sm mt-1">{user.name}</p>
            <p className="text-yellow-300 text-sm">{e ? "Review, accept, or return all submissions. Export data for AQAR." : "అన్ని సమర్పణలను సమీక్షించి AQAR కోసం డేటా ఎగుమతి చేయండి."}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              className="btn btn-gold flex items-center gap-2 text-sm shadow-sm"
              onClick={handleExportAllExcel}
              title={e ? "Download all faculty forms combined in one Excel worksheet" : "అన్ని అధ్యాపక ఫారాలను ఒకే Excel వర్క్‌షీట్‌లో డౌన్‌లోడ్ చేయండి"}
            >
              <FileSpreadsheet size={16} /> {e ? "All Forms (Excel)" : "అన్ని ఫారాలు (Excel)"}
            </button>
            <button
              className="bg-red-700 hover:bg-red-800 text-white font-semibold px-4 py-2 rounded-xl flex items-center gap-2 text-sm transition-all shadow-sm"
              onClick={handleExportAllPdf}
              title={e ? "Download all faculty forms combined into one PDF" : "అన్ని అధ్యాపక ఫారాలను ఒకే PDF లో డౌన్‌లోడ్ చేయండి"}
            >
              <FileText size={16} /> {e ? "All Forms (PDF)" : "అన్ని ఫారాలు (PDF)"}
            </button>
            <button
              className="bg-white/15 hover:bg-white/25 text-white border border-white/30 font-medium px-3 py-2 rounded-xl flex items-center gap-2 text-sm transition-all"
              onClick={handleExportAllCsv}
              title={e ? "Download summary CSV of all faculty submissions" : "అన్ని అధ్యాపక సమర్పణల సారాంశం CSV ని డౌన్‌లోడ్ చేయండి"}
            >
              <Download size={16} /> {e ? "Summary (CSV)" : "సారాంశం (CSV)"}
            </button>
            <button
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-medium px-3 py-2 rounded-xl flex items-center gap-2 text-sm transition-all"
              onClick={() => setShowPasswordModal(true)}
              title={e ? "Change account password" : "ఖాతా పాస్‌వర్డ్ మార్చండి"}
            >
              <KeyRound size={16} className="text-yellow-400" /> {e ? "Change Password" : "పాస్‌వర్డ్ మార్చండి"}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {stats.map((s, i) => (
            <div key={i} className={`card p-4 ${s.bg}`}>
              <p className="text-xs text-gray-500 leading-tight">{s.label}</p>
              <p className={`text-3xl font-black mt-1 ${s.color}`}>{s.val}</p>
            </div>
          ))}
        </div>

        {/* Department-wise progress */}
        <div className="card p-5">
          <h3 className="font-bold text-ku-navy mb-4 flex items-center gap-2">
            <BarChart3 size={20} /> {e ? "Department-wise Submission Progress" : "విభాగం వారీగా సమర్పణ పురోగతి"}
          </h3>
          <div className="space-y-3">
            {depts.map(dept => {
              const dSubs = allSubs.filter(s => s.department === dept);
              const accepted = dSubs.filter(s => s.status === "accepted_iqac").length;
              const pct = dSubs.length ? Math.round((accepted / dSubs.length) * 100) : 0;
              return (
                <div key={dept}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700 truncate">{dept}</span>
                    <span className="text-gray-500 ml-2 flex-shrink-0">{accepted}/{dSubs.length}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: pct === 100 ? "#008000" : "#337ab7" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <div className="card p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="form-input pl-9 py-2 text-sm" placeholder={e ? "Search name or department..." : "పేరు లేదా విభాగం శోధించండి..."} value={search} onChange={ex => setSearch(ex.target.value)} />
          </div>
          <select className="form-select w-auto py-2 text-sm" value={deptFilter} onChange={ex => setDeptFilter(ex.target.value)}>
            <option value="all">{e ? "All Departments" : "అన్ని విభాగాలు"}</option>
            {depts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select className="form-select w-auto py-2 text-sm" value={statusFilter} onChange={ex => setStatusFilter(ex.target.value)}>
            <option value="all">{e ? "All Status" : "అన్ని స్థితులు"}</option>
            {["draft","submitted","returned_hod","approved_hod","returned_principal","approved_principal","returned_iqac","accepted_iqac"].map(s => (
              <option key={s} value={s}>{s.replace(/_/g," ")}</option>
            ))}
          </select>
        </div>

        {/* Main table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="dynamic-table w-full">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{e ? "Faculty Name" : "అధ్యాపకుడి పేరు"}</th>
                  <th>{e ? "Department" : "విభాగం"}</th>
                  <th>{e ? "Papers" : "పత్రాలు"}</th>
                  <th>{e ? "Projects" : "ప్రాజెక్టులు"}</th>
                  <th>{e ? "Last Updated" : "నవీకరించబడింది"}</th>
                  <th>{e ? "Status" : "స్థితి"}</th>
                  <th>{e ? "Actions" : "చర్యలు"}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-8 text-gray-400">{t("noData", lang)}</td></tr>
                ) : filtered.map((sub, i) => (
                  <tr key={sub.id}>
                    <td className="text-center text-gray-400">{i + 1}</td>
                    <td className="font-semibold text-ku-navy">{sub.facultyName}</td>
                    <td className="text-sm text-gray-600">{sub.department}</td>
                    <td className="text-center font-bold text-ku-blue">{sub.researchPapers.length}</td>
                    <td className="text-center font-bold text-ku-blue">{sub.fundedProjects.length}</td>
                    <td className="text-sm text-gray-500">{sub.lastUpdated}</td>
                    <td><StatusBadge status={sub.status} lang={lang} size="sm" /></td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <button
                          className="p-1.5 text-ku-blue hover:text-ku-navy hover:bg-blue-50 rounded-lg transition-colors"
                          title={e ? "Review Details" : "వివరాలు సమీక్షించండి"}
                          onClick={() => { setSelected(sub); setRemarks(sub.iqacRemarks || ""); }}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors"
                          title={e ? "Download Excel (.xlsx)" : "Excel డౌన్‌లోడ్ (.xlsx)"}
                          onClick={() => handleExportFacultyExcel(sub)}
                        >
                          <FileSpreadsheet size={16} />
                        </button>
                        <button
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                          title={e ? "Download PDF (.pdf)" : "PDF డౌన్‌లోడ్ (.pdf)"}
                          onClick={() => handleExportFacultyPdf(sub)}
                        >
                          <FileText size={16} />
                        </button>
                        <button
                          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          title={e ? "Download CSV" : "CSV డౌన్‌లోడ్"}
                          onClick={() => handleExportFacultyCsv(sub)}
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="ku-header p-5 rounded-t-2xl text-white flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold">{selected.facultyName}</h3>
                <p className="text-white/70 text-sm">{selected.department} | Academic Year 2024-25</p>
              </div>
              <StatusBadge status={selected.status} lang={lang} />
            </div>
            <div className="p-6 space-y-4">
              {/* Profile */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                {[
                  ["Designation", selected.profile.designation],
                  ["Experience", selected.profile.experience ? `${selected.profile.experience} yrs` : "—"],
                  ["Higher Qualification", selected.profile.highestQual],
                  ["Qual Certificate", selected.profile.highestQualEvidence],
                  ["Appointment Order", selected.profile.appointmentOrderEvidence],
                  ["PAN Document", selected.profile.panEvidence],
                  ["Aadhaar Document", selected.profile.aadharEvidence],
                  ["Research Guide", selected.profile.isResearchGuide],
                  ["Guide Certificate", selected.profile.researchGuideEvidence],
                  ["Mobile", selected.profile.mobile],
                  ["Email", selected.profile.email],
                ].map(([k, v]) => (
                  <div key={String(k)} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">{k}</p>
                    <p className="text-ku-navy font-semibold truncate">{v || "—"}</p>
                  </div>
                ))}
              </div>
              {/* Section counts */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-sm text-center">
                {[
                  ["Papers", selected.researchPapers.length],
                  ["Books", selected.booksChapters.length],
                  ["FDPs", selected.fdpAttended.length],
                  ["Patents", selected.patents.length],
                  ["Seminars", selected.seminarsParticipated.length + selected.seminarsOrganized.length],
                  ["Fellowships", selected.fellowships.length],
                  ["Projects", selected.fundedProjects.length],
                  ["Research Awards", selected.awardsResearch.length],
                  ["Extension Awards", selected.awardsExtension.length],
                  ["E-Content", selected.econtent.length],
                  ["Out Range", (selected.outRangeActivity || []).length],
                  ["Other Info", (selected.otherInfo || []).length],
                ].map(([k, v]) => (
                  <div key={String(k)} className="bg-blue-50 border border-blue-100 rounded-lg p-2">
                    <p className="text-blue-800 font-bold text-lg">{v}</p>
                    <p className="text-blue-600 text-xs">{k}</p>
                  </div>
                ))}
              </div>

              {/* Detailed Data */}
              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                {selected.researchPapers.length > 0 && (
                  <div>
                    <h4 className="font-bold text-sm text-ku-navy mb-1">{e ? "Research Papers" : "పరిశోధన పత్రాలు"}</h4>
                    <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                      {selected.researchPapers.map(r => (
                        <li key={r.id}>
                          <strong>{r.title as string}</strong> ({r.journal as string}, {r.year as string}) - {r.authors as string} {r.impactFactor ? `[Impact Factor: ${r.impactFactor}]` : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {selected.booksChapters.length > 0 && (
                  <div>
                    <h4 className="font-bold text-sm text-ku-navy mb-1">{e ? "Books/Chapters" : "పుస్తకాలు/అధ్యాయాలు"}</h4>
                    <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                      {selected.booksChapters.map(r => <li key={r.id}><strong>{r.title as string}</strong> by {r.authors as string} ({r.publisher as string}, {r.year as string})</li>)}
                    </ul>
                  </div>
                )}
                {selected.fdpAttended.length > 0 && (
                  <div>
                    <h4 className="font-bold text-sm text-ku-navy mb-1">{e ? "FDPs Attended" : "FDP హాజరైనవి"}</h4>
                    <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                      {selected.fdpAttended.map(r => <li key={r.id}><strong>{r.title as string}</strong> at {r.organizer as string} ({r.mode as string})</li>)}
                    </ul>
                  </div>
                )}
                {selected.patents.length > 0 && (
                  <div>
                    <h4 className="font-bold text-sm text-ku-navy mb-1">{e ? "Patents" : "పేటెంట్లు"}</h4>
                    <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                      {selected.patents.map(r => (
                        <li key={r.id}>
                          <strong>{r.title as string}</strong> ({r.patentNumber as string}, {r.year as string}) - {r.patentStatus as string} {r.patentUrl ? `[URL: ${r.patentUrl}]` : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {(selected.seminarsParticipated.length > 0 || selected.seminarsOrganized.length > 0) && (
                  <div>
                    <h4 className="font-bold text-sm text-ku-navy mb-1">{e ? "Seminars/Conferences" : "సెమినార్లు/సమావేశాలు"}</h4>
                    <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                      {selected.seminarsParticipated.map(r => <li key={r.id}>Participated: <strong>{r.title as string}</strong> at {r.organizer as string}</li>)}
                      {selected.seminarsOrganized.map(r => <li key={r.id}>Organized: <strong>{r.title as string}</strong> ({r.level as string})</li>)}
                    </ul>
                  </div>
                )}
                {selected.fellowships.length > 0 && (
                  <div>
                    <h4 className="font-bold text-sm text-ku-navy mb-1">{e ? "Fellowships" : "ఫెలోషిప్‌లు"}</h4>
                    <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                      {selected.fellowships.map(r => <li key={r.id}><strong>{r.name as string}</strong> {r.type ? `(${r.type})` : ""} from {r.body as string} - ₹{r.amount as string}</li>)}
                    </ul>
                  </div>
                )}
                {selected.fundedProjects.length > 0 && (
                  <div>
                    <h4 className="font-bold text-sm text-ku-navy mb-1">{e ? "Funded Projects" : "నిధుల ప్రాజెక్టులు"}</h4>
                    <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                      {selected.fundedProjects.map(r => <li key={r.id}><strong>{r.title as string}</strong> funded by {r.agency as string} (₹{r.amount as string}) - {r.projectStatus as string}</li>)}
                    </ul>
                  </div>
                )}
                {selected.awardsResearch.length > 0 && (
                  <div>
                    <h4 className="font-bold text-sm text-ku-navy mb-1">{e ? "Research Awards" : "పరిశోధన అవార్డులు"}</h4>
                    <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                      {selected.awardsResearch.map(r => <li key={r.id}><strong>{r.name as string}</strong> by {r.body as string} ({r.year as string})</li>)}
                    </ul>
                  </div>
                )}
                {selected.awardsExtension.length > 0 && (
                  <div>
                    <h4 className="font-bold text-sm text-ku-navy mb-1">{e ? "Extension Activities Awards" : "విస్తరణ కార్యకలాపాల అవార్డులు"}</h4>
                    <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                      {selected.awardsExtension.map(r => <li key={r.id}><strong>{r.name as string}</strong> by {r.body as string} ({r.year as string})</li>)}
                    </ul>
                  </div>
                )}
                {selected.outRangeActivity && selected.outRangeActivity.length > 0 && (
                  <div>
                    <h4 className="font-bold text-sm text-ku-navy mb-1">{e ? "Out Range Activity" : "అవుట్ రేంజ్ కార్యాచరణ"}</h4>
                    <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                      {selected.outRangeActivity.map(r => (
                        <li key={r.id}>
                          <strong>{r.description as string}</strong> {r.year ? `(${r.year as string})` : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {selected.otherInfo && selected.otherInfo.length > 0 && (
                  <div>
                    <h4 className="font-bold text-sm text-ku-navy mb-1">{e ? "Other Information" : "ఇతర సమాచారం"}</h4>
                    <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                      {selected.otherInfo.map(r => (
                        <li key={r.id}>
                          <strong>{r.description as string}</strong> {r.year ? `(${r.year as string})` : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {/* Previous remarks */}
              {selected.hodRemarks && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
                  <p className="font-semibold text-yellow-800">{e ? "HOD Remarks:" : "HOD వ్యాఖ్యలు:"}</p>
                  <p className="text-yellow-700">{selected.hodRemarks}</p>
                </div>
              )}
              {selected.principalRemarks && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-sm">
                  <p className="font-semibold text-indigo-800">{e ? "Principal Remarks:" : "ప్రిన్సిపాల్ వ్యాఖ్యలు:"}</p>
                  <p className="text-indigo-700">{selected.principalRemarks}</p>
                </div>
              )}
              {/* IQAC remarks */}
              <div>
                <label className="form-label">{t("iqacRemarks", lang)}</label>
                <textarea className="form-textarea" rows={3} value={remarks} onChange={ex => setRemarks(ex.target.value)} placeholder={t("enterRemarks", lang)} />
              </div>
              <div className="flex gap-2 justify-end pt-3 border-t border-gray-100 flex-wrap">
                <button className="btn btn-secondary text-sm" onClick={() => { setSelected(null); setRemarks(""); }}>{t("close", lang)}</button>
                <button
                  className="btn btn-outline border-emerald-600 text-emerald-700 hover:bg-emerald-50 flex items-center gap-1.5 text-sm"
                  onClick={() => handleExportFacultyExcel(selected)}
                >
                  <FileSpreadsheet size={15} /> {e ? "Excel (.xlsx)" : "Excel (.xlsx)"}
                </button>
                <button
                  className="btn btn-outline border-red-600 text-red-700 hover:bg-red-50 flex items-center gap-1.5 text-sm"
                  onClick={() => handleExportFacultyPdf(selected)}
                >
                  <FileText size={15} /> {e ? "PDF (.pdf)" : "PDF (.pdf)"}
                </button>
                <button
                  className="btn btn-outline flex items-center gap-1.5 text-sm"
                  onClick={() => handleExportFacultyCsv(selected)}
                >
                  <Download size={15} /> {e ? "CSV" : "CSV"}
                </button>
                {canAct(selected) && (
                  <>
                    <button className="btn btn-danger flex items-center gap-2" onClick={() => handleAction("return")}>
                      <XCircle size={16} /> {e ? "Return for Correction" : "సవరణకు తిరిగి పంపు"}
                    </button>
                    <button className="btn btn-success flex items-center gap-2" onClick={() => handleAction("accept")}>
                      <CheckCircle size={16} /> {t("approveAccept", lang)}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSuccess={(msg) => setToast({ msg, type: "success" })}
      />
      {toast && <Toast message={toast.msg} type={toast.type} onDismiss={() => setToast(null)} />}
    </AppShell>
  );
}
