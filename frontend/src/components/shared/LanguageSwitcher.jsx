// ─────────────────────────────────────────────────────────────────────────────
// src/components/shared/LanguageSwitcher.jsx
// Dropdown language selector — drop into any Navbar or Settings page.
//
// Props:
//   compact (bool) — shows short code (EN/RW/SW) instead of full name.
//                    Use compact=true in a tight navbar, false in settings.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useLang, LANG_OPTIONS } from "../../i18n/LangContext";

export default function LanguageSwitcher({ compact = false }) {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const current = LANG_OPTIONS.find((l) => l.code === lang);

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Switch language"
        className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-orange-500 transition-colors px-2 py-1.5 rounded-lg hover:bg-orange-50"
      >
        <span aria-hidden="true">{current.flag}</span>
        <span>{compact ? current.short : current.label}</span>
        <span
          aria-hidden="true"
          style={{
            display: "inline-block",
            transition: "transform 0.2s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            fontSize: "0.6rem",
          }}
        >
          ▾
        </span>
      </button>

      {/* Backdrop — closes dropdown when clicking outside */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          aria-hidden="true"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Dropdown */}
      {open && (
        <ul
          role="listbox"
          aria-label="Select language"
          className="absolute right-0 top-full mt-1 z-50 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden min-w-[170px]"
        >
          {LANG_OPTIONS.map((opt) => {
            const isActive = lang === opt.code;
            return (
              <li key={opt.code} role="option" aria-selected={isActive}>
                <button
                  onClick={() => { setLang(opt.code); setOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left
                    ${isActive
                      ? "bg-orange-50 text-orange-600 font-semibold"
                      : "text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  <span className="text-base" aria-hidden="true">{opt.flag}</span>
                  <span>{opt.label}</span>
                  {isActive && (
                    <span className="ml-auto text-orange-500" aria-hidden="true">✓</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
