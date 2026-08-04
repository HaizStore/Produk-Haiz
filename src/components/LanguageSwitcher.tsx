"use client";

import { useLanguage } from "@/lib/i18n";

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <button
      className="pill-btn lang-switch"
      onClick={() => setLang(lang === "id" ? "en" : "id")}
      title={lang === "id" ? "Switch to English" : "Ganti ke Bahasa Indonesia"}
      aria-label="Ganti bahasa / Change language"
    >
      {lang === "id" ? "🇮🇩 ID" : "🇬🇧 EN"}
    </button>
  );
}
