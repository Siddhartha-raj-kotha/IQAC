"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { Toast } from "@/components/Toast";
import { ChangePasswordModal } from "@/components/ChangePasswordModal";
import { t } from "@/lib/translations";
import { getAllSubmissions, updateSubmission, Submission } from "@/lib/mockData";
import { Eye, CheckCircle, XCircle, Search, KeyRound } from "lucide-react";

export default function PrincipalDashboard() {
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
    if (!isLoading && (!user || user.role !== "principal")) router.replace("/login");
  }, [user, isLoading, router]);

  useEffect(() => {
    const data = getAllSubmissions();
    setSubs(data);
    setFiltered(data);
  }, []);

  useEffect(() => {
    let data = subs;
    if (search) data = data.filter(s => s.facultyName.toLowerCase().includes(search.toLowerCase()));
    if (deptFilter !== "all") data = data.filter(s => s.department === deptFilter);
    if (statusFilter !== "all") data = data.filter(s => s.status === statusFilter);
    setFiltered(data);
  }, [search, deptFilter, statusFilter, subs]);

if (isLoading || !user) return null;

  const handleAction = (type: "forward" | "return") => {
    if (!selected) return;
    if (type === "return" && !remarks.trim()) {
      setToast({ msg: e ? "Please enter remarks before returning." : "తిరిగి పంపే ముందు వ్యాఖ్యలు నమోదు చేయండి.", type: "error" });
      return;
    }
    const updates: Partial<Submission> = {
      status: type === "forward" ? "approved_principal" : "returned_principal",
      principalRemarks: remarks,
    };
    const success = updateSubmission(selected.id, updates);
    if (success) {
      setSubs([...getAllSubmissions()]);
      setToast({
        msg: type === "forward"
          ? (e ? "Forwarded to IQAC Admin!" : "IQAC Admin కు పంపబడింది!")
          : (e ? "Returned to HOD with remarks." : "వ్యాఖ్యలతో HOD కి తిరిగి పంపబడింది."),
        type: "success"
      });
      setSelected(null);
      setRemarks("");
    }
  };

  const allSubs = getAllSubmissions();
  const stats = [
    { label: e ? "Total Submissions" : "మొత్తం సమర్పణలు", val: allSubs.length, bg: "bg-blue-50", color: "text-blue-800" },
    { label: e ? "Direct to IQAC (Submitted)" : "నేరుగా IQAC కి సమర్పించబడింది", val: allSubs.filter(s => s.status === "submitted").length, bg: "bg-yellow-50", color: "text-yellow-800" },
    { label: e ? "Accepted by IQAC" : "IQAC ఆమోదించారు", val: allSubs.filter(s => s.status === "accepted_iqac").length, bg: "bg-green-50", color: "text-green-800" },
    { label: e ? "Returned by IQAC" : "IQAC తిరిగి పంపింది", val: allSubs.filter(s => s.status === "returned_iqac").length, bg: "bg-red-50", color: "text-red-800" },
  ];

  const canAct = (_s: Submission) => false;

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="ku-header rounded-2xl p-6 text-white flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{e ? "Principal Dashboard" : "ప్రిన్సిపాల్ డాష్బోర్డ్"}</h1>
            <p className="text-white/70 text-sm mt-1">{user.name}</p>
            <p className="text-yellow-300 text-sm">{e ? "Institutional Overview — Faculty submissions go directly to IQAC." : "సంస్థా అవలోకనం — అధ్యాపక సమర్పణలు నేరుగా IQAC కి వెళ్తాయి."}</p>
          </div>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-medium px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition-all shadow-xs"
          >
            <KeyRound size={16} className="text-yellow-400" />
            {e ? "Change Password" : "పాస్‌వర్డ్ మార్చండి"}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={i} className={`card p-4 ${s.bg}`}>
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className={`text-3xl font-black mt-1 ${s.color}`}>{s.val}</p>
            </div>
          ))}
        </div>

        <div className="card p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="form-input pl-9 py-2 text-sm" placeholder={e ? "Search faculty..." : "అధ్యాపకుడు..."} value={search} onChange={ex => setSearch(ex.target.value)} />
          </div>
          <select className="form-select w-auto py-2 text-sm" value={deptFilter} onChange={ex => setDeptFilter(ex.target.value)}>
            <option value="all">{e ? "All Departments" : "అన్ని విభాగాలు"}</option>
            {[...new Set(subs.map(s => s.department))].map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select className="form-select w-auto py-2 text-sm" value={statusFilter} onChange={ex => setStatusFilter(ex.target.value)}>
            <option value="all">{e ? "All Status" : "అన్ని స్థితులు"}</option>
            <option value="approved_hod">{e ? "Approved by HOD" : "HOD ఆమోదించారు"}</option>
            <option value="approved_principal">{e ? "Approved by Principal" : "ప్రిన్సిపాల్ ఆమోదించారు"}</option>
            <option value="returned_principal">{e ? "Returned by Principal" : "ప్రిన్సిపాల్ తిరిగి పంపారు"}</option>
            <option value="accepted_iqac">{e ? "Accepted by IQAC" : "IQAC అంగీకరించారు"}</option>
          </select>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="dynamic-table w-full">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{e ? "Faculty Name" : "అధ్యాపకుడి పేరు"}</th>
                  <th>{e ? "Department" : "విభాగం"}</th>
                  <th>{e ? "HOD Remarks" : "HOD వ్యాఖ్యలు"}</th>
                  <th>{e ? "Status" : "స్థితి"}</th>
                  <th>{e ? "Actions" : "చర్యలు"}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-400">{t("noData", lang)}</td></tr>
                ) : filtered.map((sub, i) => (
                  <tr key={sub.id}>
                    <td className="text-center text-gray-400">{i + 1}</td>
                    <td className="font-semibold text-ku-navy">{sub.facultyName}</td>
                    <td className="text-sm text-gray-600">{sub.department}</td>
                    <td className="text-sm text-gray-500 max-w-[200px] truncate">{sub.hodRemarks || "—"}</td>
                    <td><StatusBadge status={sub.status} lang={lang} size="sm" /></td>
                    <td>
                      <button className="flex items-center gap-1 text-ku-blue text-sm font-medium" onClick={() => { setSelected(sub); setRemarks(sub.principalRemarks || ""); }}>
                        <Eye size={15} /> {e ? "Review" : "సమీక్ష"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="ku-header p-5 rounded-t-2xl text-white flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold">{selected.facultyName}</h3>
                <p className="text-white/70 text-sm">{selected.department}</p>
              </div>
              <StatusBadge status={selected.status} lang={lang} />
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[["Papers", selected.researchPapers.length], ["Books", selected.booksChapters.length], ["FDPs", selected.fdpAttended.length], ["Patents", selected.patents.length], ["Projects", selected.fundedProjects.length], ["Awards", selected.awardsResearch.length]].map(([k, v]) => (
                  <div key={String(k)} className="bg-blue-50 rounded-lg p-2 text-center">
                    <p className="text-blue-800 font-bold">{v}</p>
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
                      {selected.researchPapers.map(r => <li key={r.id}><strong>{r.title as string}</strong> ({r.journal as string}, {r.year as string}) - {r.authors as string}</li>)}
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
                      {selected.patents.map(r => <li key={r.id}><strong>{r.title as string}</strong> ({r.patentNumber as string}, {r.year as string})</li>)}
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
                {selected.fundedProjects.length > 0 && (
                  <div>
                    <h4 className="font-bold text-sm text-ku-navy mb-1">{e ? "Funded Projects" : "నిధుల ప్రాజెక్టులు"}</h4>
                    <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                      {selected.fundedProjects.map(r => <li key={r.id}><strong>{r.title as string}</strong> funded by {r.agency as string} (₹{r.amount as string}) - {r.projectStatus as string}</li>)}
                    </ul>
                  </div>
                )}
              </div>
              {selected.hodRemarks && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm">
                  <p className="font-semibold text-yellow-800">{e ? "HOD Remarks:" : "HOD వ్యాఖ్యలు:"}</p>
                  <p className="text-yellow-700 mt-1">{selected.hodRemarks}</p>
                </div>
              )}
              <div>
                <label className="form-label">{t("principalRemarks", lang)}</label>
                <textarea className="form-textarea" rows={3} value={remarks} onChange={ex => setRemarks(ex.target.value)} placeholder={t("enterRemarks", lang)} />
              </div>
              <div className="flex gap-3 justify-end pt-3 border-t border-gray-100">
                <button className="btn btn-secondary" onClick={() => { setSelected(null); setRemarks(""); }}>{t("close", lang)}</button>
                {canAct(selected) && (
                  <>
                    <button className="btn btn-danger flex items-center gap-2" onClick={() => handleAction("return")}>
                      <XCircle size={16} /> {t("returnToHOD", lang)}
                    </button>
                    <button className="btn btn-success flex items-center gap-2" onClick={() => handleAction("forward")}>
                      <CheckCircle size={16} /> {t("forwardToIQAC", lang)}
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
