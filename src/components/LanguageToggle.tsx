"use client";
import { useLang } from "@/context/LanguageContext";

export function LanguageToggle() {
  const { lang, toggle } = useLang();
  return (
    <div className="lang-toggle" title="Switch Language / భాష మార్చు">
      <button
        className={`lang-btn ${lang === "en" ? "active" : "inactive"}`}
        onClick={() => lang !== "en" && toggle()}
        aria-label="Switch to English"
      >
        EN
      </button>
      <button
        className={`lang-btn ${lang === "te" ? "active" : "inactive"}`}
        onClick={() => lang !== "te" && toggle()}
        aria-label="తెలుగుకు మారండి"
      >
        తె
      </button>
    </div>
  );
}
