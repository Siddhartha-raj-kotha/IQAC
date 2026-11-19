"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import { AppShell } from "@/components/AppShell";

export default function SettingsPage() {
  const { user, isLoading } = useAuth();
  const { lang } = useLang();
  const router = useRouter();
  const e = lang === "en";

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) router.replace("/login");
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="ku-header rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold">{e ? "System Settings" : "సిస్టమ్ సెట్టింగులు"}</h1>
          <p className="text-white/70 text-sm mt-1">{e ? "Configure application settings and academic year parameters." : "అప్లికేషన్ సెట్టింగులు మరియు విద్యా సంవత్సర పారామితులను కాన్ఫిగర్ చేయండి."}</p>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-bold text-ku-navy mb-4">{e ? "Academic Year Settings" : "విద్యా సంవత్సర సెట్టింగులు"}</h2>
          <div className="space-y-4">
            <div>
              <label className="form-label">{e ? "Current Academic Year" : "ప్రస్తుత విద్యా సంవత్సరం"}</label>
              <select className="form-select max-w-sm">
                <option>2024-25</option>
                <option>2023-24</option>
              </select>
            </div>
            <div>
              <label className="form-label">{e ? "Submission Deadline" : "సమర్పణ చివరి తేదీ"}</label>
              <input type="date" className="form-input max-w-sm" defaultValue="2025-05-31" />
            </div>
            <button className="btn btn-primary mt-2">{e ? "Save Settings" : "సెట్టింగులను సేవ్ చేయండి"}</button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
