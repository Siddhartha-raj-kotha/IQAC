"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AppShell } from "@/components/AppShell";
import { useLang } from "@/context/LanguageContext";
import { t } from "@/lib/translations";
import { StatusBadge } from "@/components/StatusBadge";
import { Toast } from "@/components/Toast";
import { ChangePasswordModal } from "@/components/ChangePasswordModal";
import { getSubmissionByFacultyId, canFacultyEdit } from "@/lib/mockData";
import Link from "next/link";
import { FileText, Clock, CheckCircle, ArrowRight, Bell, BookOpen, KeyRound, ShieldCheck } from "lucide-react";

export default function FacultyDashboard() {
  const { user, isLoading } = useAuth();
  const { lang } = useLang();
  const router = useRouter();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "faculty")) router.replace("/login");
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  const submission = getSubmissionByFacultyId(user.id);

  const stats = [
    {
      icon: <FileText size={24} />,
      labelEn: "Form Status",
      labelTe: "ఫారం స్థితి",
      value: submission ? <StatusBadge status={submission.status} lang={lang} /> : <span className="text-gray-400 text-sm">{lang === "en" ? "Not started" : "మొదలు కాలేదు"}</span>,
      bg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      icon: <Clock size={24} />,
      labelEn: "Last Updated",
      labelTe: "చివరిగా నవీకరించబడింది",
      value: <span className="text-ku-navy font-bold">{submission?.lastUpdated ?? "—"}</span>,
      bg: "bg-yellow-50",
      iconColor: "text-yellow-600",
    },
    {
      icon: <CheckCircle size={24} />,
      labelEn: "Academic Year",
      labelTe: "విద్యా సంవత్సరం",
      value: <span className="text-ku-navy font-bold">2024-25</span>,
      bg: "bg-green-50",
      iconColor: "text-green-600",
    },
  ];

  const isReturnedToFaculty = submission?.status === "returned_iqac" || submission?.status === "returned_hod" || submission?.status === "returned_principal";
  const isLocked = submission ? !canFacultyEdit(submission.status) : false;

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Welcome banner */}
        <div className="ku-header rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-yellow-300 text-sm font-medium mb-1">
                {lang === "en" ? "Welcome back" : "తిరిగి స్వాగతం"} 👋
              </p>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-white/70 text-sm mt-1">
                {user.designation} — {user.department}
              </p>
              <p className="text-white/50 text-xs mt-2">
                {lang === "en"
                  ? "AQAR 2024-25 | Period: June 1, 2024 – May 31, 2025"
                  : "AQAR 2024-25 | కాలం: జూన్ 1, 2024 – మే 31, 2025"}
              </p>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-medium px-3.5 py-1.5 rounded-xl text-xs inline-flex items-center gap-1.5 transition-all mt-3 shadow-xs"
              >
                <KeyRound size={13} className="text-yellow-400" />
                {lang === "en" ? "Change Password" : "పాస్‌వర్డ్ మార్చండి"}
              </button>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center min-w-[120px]">
              <p className="text-3xl font-black text-yellow-400">
                {submission ? (
                  submission.status === "accepted_iqac" ? "100%" :
                  submission.status === "submitted" ? "75%" :
                  isReturnedToFaculty ? "50%" :
                  "40%"
                ) : "0%"}
              </p>
              <p className="text-white/60 text-xs mt-1">
                {lang === "en" ? "Progress" : "పురోగతి"}
              </p>
            </div>
          </div>
        </div>

        {/* Return notice */}
        {isReturnedToFaculty && submission && (
          <div className="bg-orange-50 border-l-4 border-orange-500 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <Bell size={22} className="text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-orange-800 mb-1">
                  {lang === "en" ? "⚠️ Your form has been returned for corrections" : "⚠️ మీ ఫారం సవరణలకు తిరిగి పంపబడింది"}
                </p>
                <p className="text-orange-700 text-sm">
                  <strong>{lang === "en" ? "Remarks:" : "వ్యాఖ్యలు:"}</strong>{" "}
                  {submission.iqacRemarks || submission.hodRemarks || submission.principalRemarks ||
                    (lang === "en" ? "Please review and resubmit." : "దయచేసి సమీక్షించి మళ్ళీ సమర్పించండి.")}
                </p>
                <Link href="/faculty/form" className="btn btn-primary btn-sm mt-3 inline-flex">
                  {lang === "en" ? "Edit & Resubmit to IQAC →" : "సవరించి IQAC కి మళ్ళీ సమర్పించు →"}
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Locked status note */}
        {isLocked && submission && (
          <div className="bg-blue-50 border-l-4 border-blue-600 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <span className="text-xl">🔒</span>
              <div>
                <p className="font-bold text-blue-900 mb-1">
                  {submission.status === "accepted_iqac"
                    ? (lang === "en" ? "Form Accepted & Finalized by IQAC" : "IQAC ద్వారా ఫారం అంగీకరించబడింది & ఖరారు చేయబడింది")
                    : (lang === "en" ? "Form Submitted directly to IQAC (Under Review)" : "ఫారం నేరుగా IQAC కి సమర్పించబడింది (సమీక్షలో ఉంది)")}
                </p>
                <p className="text-blue-700 text-sm">
                  {submission.status === "accepted_iqac"
                    ? (lang === "en" ? "Your submission has been accepted by IQAC. Editing is disabled." : "మీ సమర్పణ IQAC ద్వారా అంగీకరించబడింది. సవరణలు నిలిపివేయబడ్డాయి.")
                    : (lang === "en" ? "Editing is locked until IQAC reviews or returns your form for corrections." : "IQAC సమీక్షించి సవరణలకు తిరిగి పంపే వరకు సవరణలు లాక్ చేయబడతాయి.")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((s, i) => (
            <div key={i} className={`card p-5 flex items-center gap-4 ${s.bg}`}>
              <div className={`w-12 h-12 rounded-xl bg-white shadow flex items-center justify-center ${s.iconColor} flex-shrink-0`}>
                {s.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{lang === "en" ? s.labelEn : s.labelTe}</p>
                <div className="mt-0.5">{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Main action card */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-ku-navy">
                {lang === "en" ? "Faculty Data Form" : "అధ్యాపక డేటా ఫారం"}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {lang === "en"
                  ? "Fill in all 15 sections including your profile and academic activities."
                  : "మీ వివరాలు మరియు విద్యా కార్యకలాపాలతో సహా అన్ని 15 విభాగాలను పూర్తి చేయండి."}
              </p>
            </div>
            <Link href="/faculty/form" className="btn btn-primary flex items-center gap-2">
              <FileText size={18} />
              {submission?.status === "draft" || !submission
                ? (lang === "en" ? "Fill Form" : "ఫారం నింపు")
                : isReturnedToFaculty
                ? (lang === "en" ? "Edit & Resubmit" : "సవరించి మళ్ళీ సమర్పించు")
                : isLocked
                ? (lang === "en" ? "View Form" : "ఫారం చూడు")
                : (lang === "en" ? "Continue Form" : "ఫారం కొనసాగించు")}
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Section checklist */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            {[
              { icon: "👤", en: "Basic Profile", te: "ప్రాథమిక వివరాలు" },
              { icon: "📄", en: "Research Papers", te: "పరిశోధన పత్రాలు" },
              { icon: "📚", en: "Books & Chapters", te: "పుస్తకాలు & అధ్యాయాలు" },
              { icon: "🎓", en: "FDP Attended", te: "FDP హాజరైనవి" },
              { icon: "💡", en: "Patents", te: "పేటెంట్లు" },
              { icon: "🎤", en: "Seminars Participated", te: "సెమినార్లు (పాల్గొన్నవి)" },
              { icon: "🏛️", en: "Seminars Organized", te: "సెమినార్లు (నిర్వహించినవి)" },
              { icon: "🏆", en: "Fellowships", te: "ఫెలోషిప్‌లు" },
              { icon: "💰", en: "Funded Projects", te: "నిధుల ప్రాజెక్టులు" },
              { icon: "🥇", en: "Awards (Research)", te: "బహుమతులు (పరిశోధన)" },
              { icon: "🌟", en: "Awards (Extension)", te: "విస్తరణ బహుమతులు" },
              { icon: "💻", en: "E-Content", te: "ఈ-కంటెంట్" },
              { icon: "🌐", en: "Out Range Activity", te: "అవుట్ రేంజ్ కార్యాచరణ" },
              { icon: "📝", en: "Other Information", te: "ఇతర సమాచారం" },
              { icon: "✅", en: "Final Review", te: "చివరి సమీక్ష" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100">
                <span>{s.icon}</span>
                <span className="text-gray-700">{lang === "en" ? s.en : s.te}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Info note */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
          <BookOpen size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">
              {lang === "en" ? "ℹ️ Instructions" : "ℹ️ సూచనలు"}
            </p>
            <ul className="space-y-1 list-disc list-inside text-blue-700">
              <li>{lang === "en" ? "You can save your progress at any time using 'Save Draft'." : "మీరు ఎప్పుడైనా 'ముసాయిదా సేవ్' ఉపయోగించి సేవ్ చేయవచ్చు."}</li>
              <li>{lang === "en" ? "Upload supporting documents for each entry." : "ప్రతి ఎంట్రీకి సహాయక పత్రాలు అప్లోడ్ చేయండి."}</li>
              <li>{lang === "en" ? "Once submitted directly to IQAC, editing is locked until IQAC reviews or returns your form." : "నేరుగా IQAC కి సమర్పించిన తర్వాత, IQAC సమీక్షించి తిరిగి పంపే వరకు సవరణలు లాక్ చేయబడతాయి."}</li>
              <li>{lang === "en" ? "Last date for submission: May 31, 2025." : "సమర్పణ చివరి తేదీ: మే 31, 2025."}</li>
            </ul>
          </div>
        </div>
        {/* Account Security Card */}
        <div className="card p-5 flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-gray-50 to-blue-50/40 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-ku-navy text-yellow-400 flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="font-bold text-ku-navy text-sm">{lang === "en" ? "Account Security" : "ఖాతా భద్రత"}</p>
              <p className="text-gray-500 text-xs">{lang === "en" ? "Change and update your account login password" : "మీ ఖాతా లాగిన్ పాస్‌వర్డ్‌ను మార్చండి మరియు నవీకరించండి"}</p>
            </div>
          </div>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="btn btn-outline flex items-center gap-2 text-sm"
          >
            <KeyRound size={15} />
            {lang === "en" ? "Change Password" : "పాస్‌వర్డ్ మార్చండి"}
          </button>
        </div>

        <ChangePasswordModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          onSuccess={(msg) => setToast({ msg, type: "success" })}
        />
        {toast && <Toast message={toast.msg} type={toast.type} onDismiss={() => setToast(null)} />}
      </div>
    </AppShell>
  );
}
