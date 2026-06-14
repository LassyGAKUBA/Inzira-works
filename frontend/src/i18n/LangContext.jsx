// ─────────────────────────────────────────────────────────────────────────────
// src/i18n/LangContext.jsx
// Drop-in language context for the entire Inzira Works app.
//
// Usage:
//   1. Wrap your <App /> (or router root) in <LangProvider>
//   2. In any component: const { t, lang, setLang } = useLang();
//   3. Render text:       {t("nav_browse")}
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useEffect, useState } from "react";
import { TRANSLATIONS } from "./translations";

// ── Context ──────────────────────────────────────────────────────────────────
const LangContext = createContext(null);

// ── Provider ─────────────────────────────────────────────────────────────────
export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    // Persist choice in localStorage so it survives page refresh
    return localStorage.getItem("iw_lang") || "en";
  });

  const setLang = (code) => {
    if (!TRANSLATIONS[code]) return; // guard against invalid codes
    setLangState(code);
  };

  useEffect(() => {
    localStorage.setItem("iw_lang", lang);
    // Set the HTML lang attribute for accessibility & SEO
    document.documentElement.lang = lang;
  }, [lang]);

  /**
   * t(key) — translate a key for the active language.
   * Falls back to English if the key is missing in the chosen language.
   * Falls back to the key itself if it's missing in English too (dev safety).
   */
  const t = (key) =>
    TRANSLATIONS[lang]?.[key] ??
    TRANSLATIONS["en"]?.[key] ??
    key;

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) {
    throw new Error(
      "useLang() must be called inside a <LangProvider>. " +
      "Wrap your App or Router root in <LangProvider>."
    );
  }
  return ctx;
}

// ── Language options list (use this anywhere you need flags/labels) ───────────
export const LANG_OPTIONS = [
  { code: "en", label: "English",     flag: "🇬🇧", short: "EN" },
  { code: "rw", label: "Kinyarwanda", flag: "🇷🇼", short: "RW" },
  { code: "sw", label: "Swahili",     flag: "sw",  short: "SW" },
];
