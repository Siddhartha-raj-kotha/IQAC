"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, roleHome } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import { t } from "@/lib/translations";
import { Eye, EyeOff, Lock, User, GraduationCap, Briefcase, Building, Shield } from "lucide-react";
import type { Role } from "@/lib/mockData";

const roles: { key: Role; icon: React.ReactNode; color: string; credEn: string; credTe: string }[] = [
  {
    key: "faculty",
    icon: <GraduationCap size={28} />,
    color: "from-blue-600 to-blue-800",
    credEn: "Faculty Login",
    credTe: "అధ్యాపకుడు లాగిన్",
  },
  {
    key: "hod",
    icon: <Briefcase size={28} />,
    color: "from-green-600 to-green-800",
    credEn: "HOD Login",
    credTe: "HOD లాగిన్",
  },
  {
    key: "principal",
    icon: <Building size={28} />,
    color: "from-purple-600 to-purple-800",
    credEn: "Principal Login",
    credTe: "ప్రిన్సిపాల్ లాగిన్",
  },
  {
    key: "admin",
    icon: <Shield size={28} />,
    color: "from-red-700 to-red-900",
    credEn: "IQAC Admin",
    credTe: "IQAC అడ్మిన్",
  },
];

const sampleCreds: Record<Role, { u: string; p: string }> = {
  faculty: { u: "ramesh@ku.ac.in", p: "faculty123" },
  hod: { u: "hod.math@ku.ac.in", p: "hod123" },
  principal: { u: "principal@ku.ac.in", p: "principal123" },
  admin: { u: "iqac@ku.ac.in", p: "admin123" },
};

export default function LoginPage() {
  const { login } = useAuth();
  const { lang } = useLang();
  const router = useRouter();

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setEmail(sampleCreds[role].u);
    setPassword(sampleCreds[role].p);
    setError("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError(lang === "en" ? "Please enter your credentials." : "దయచేసి మీ ఆధారాలు నమోదు చేయండి."); return; }
    setLoading(true);
    setError("");
    await new Promise(r => setTimeout(r, 800));
    const ok = await login(email, password);
    if (ok) {
      const stored = JSON.parse(localStorage.getItem("iqac_user") || "{}");
      router.push(roleHome[stored.role as Role] || "/");
    } else {
      setError(t("loginError", lang));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(135deg, #001A33 0%, #002147 45%, #003366 100%)" }}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-ku-navy font-black text-xl border-2 border-yellow-400">
            KU
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">
              {lang === "en" ? "Kakatiya University" : "కాకతీయ విశ్వవిద్యాలయం"}
            </h1>
            <p className="text-yellow-300 text-sm">
              {lang === "en" ? "IQAC Faculty Data Portal" : "IQAC అధ్యాపక డేటా పోర్టల్"}
            </p>
          </div>
        </div>
        <LanguageToggle />
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl">
          {/* Hero text */}
          <div className="text-center mb-8">
            <h2 className="text-white text-3xl font-bold mb-2">
              {t("loginTitle", lang)}
            </h2>
            <p className="text-white/60 text-lg">
              {lang === "en" ? "AQAR 2024-25 | Academic Year: June 2024 – May 2025" : "AQAR 2024-25 | విద్యా సంవత్సరం: జూన్ 2024 – మే 2025"}
            </p>
            <p className="text-yellow-300/80 text-sm mt-2">
              {t("loginSubtitle", lang)}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 items-start">
            {/* Role selector cards */}
            <div>
              <p className="text-white/70 text-sm font-medium mb-3 text-center">
                {t("selectRole", lang)}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {roles.map(role => (
                  <button
                    key={role.key}
                    type="button"
                    onClick={() => handleRoleSelect(role.key)}
                    className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 group
                      ${selectedRole === role.key
                        ? "border-yellow-400 bg-yellow-400/10 shadow-lg shadow-yellow-400/20"
                        : "border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40"
                      }`}
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center text-white shadow-lg`}>
                      {role.icon}
                    </div>
                    <span className="text-white font-semibold text-sm text-center leading-tight">
                      {lang === "en" ? role.credEn : role.credTe}
                    </span>
                    {selectedRole === role.key && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                        <span className="text-ku-navy text-xs font-bold">✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Login form */}
            <div className="bg-white rounded-2xl shadow-2xl p-7">
              <h3 className="text-ku-navy font-bold text-xl mb-1">
                {selectedRole
                  ? `${lang === "en" ? "Login as" : "లాగిన్"} ${roles.find(r => r.key === selectedRole)?.[lang === "en" ? "credEn" : "credTe"]}`
                  : t("loginTitle", lang)}
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                {t("loginSubtitle", lang)}
              </p>

              <form onSubmit={handleLogin} className="space-y-4" noValidate>
                <div>
                  <label className="form-label" htmlFor="email">
                    {t("username", lang)}
                  </label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      className="form-input pl-10"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="your.email@ku.ac.in"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label" htmlFor="password">
                    {t("password", lang)}
                  </label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      id="password"
                      type={showPwd ? "text" : "password"}
                      className="form-input pl-10 pr-11"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-ku-navy"
                      aria-label={showPwd ? "Hide password" : "Show password"}
                    >
                      {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm font-medium flex items-center gap-2">
                    ⚠️ {error}
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn btn-primary w-full mt-2">
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> {t("loggingIn", lang)}</>
                  ) : (
                    t("loginBtn", lang)
                  )}
                </button>
              </form>

              <p className="text-center text-xs text-gray-400 mt-5">
                {t("forgotPassword", lang)}
              </p>

              {/* Sample credentials box */}
              {selectedRole && (
                <div className="mt-5 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-xs font-semibold text-blue-800 mb-1">
                    {lang === "en" ? "📋 Demo credentials auto-filled:" : "📋 డెమో ఆధారాలు నమోదు చేయబడ్డాయి:"}
                  </p>
                  <p className="text-xs text-blue-700 font-mono">{sampleCreds[selectedRole].u}</p>
                  <p className="text-xs text-blue-700 font-mono">{sampleCreds[selectedRole].p}</p>
                </div>
              )}
            </div>
          </div>

          {/* All credentials quick reference */}
          <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="text-white/70 text-sm font-semibold mb-3 text-center">
              {lang === "en" ? "🔑 Sample Login Credentials (Demo Mode)" : "🔑 నమూనా లాగిన్ ఆధారాలు (డెమో మోడ్)"}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {roles.map(role => (
                <button
                  key={role.key}
                  type="button"
                  onClick={() => handleRoleSelect(role.key)}
                  className="text-left p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all"
                >
                  <p className="text-yellow-300 text-xs font-bold mb-1">{lang === "en" ? role.credEn : role.credTe}</p>
                  <p className="text-white/60 text-xs font-mono truncate">{sampleCreds[role.key].u}</p>
                  <p className="text-white/40 text-xs font-mono">{sampleCreds[role.key].p}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center text-white/30 text-xs py-4">
        © 2025 Kakatiya University, Warangal — IQAC Academic Data Collection System
      </footer>
    </div>
  );
}
