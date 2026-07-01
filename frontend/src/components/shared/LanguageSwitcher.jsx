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
import { ChevronDown, Check } from "lucide-react";

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
        className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-green-700 transition-colors px-2 py-1.5 rounded-lg hover:bg-green-50"
      >
        <span>{compact ? current.short : current.label}</span>
        <ChevronDown
          size={14}
          aria-hidden="true"
          style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
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
                      ? "bg-green-50 text-green-800 font-semibold"
                      : "text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  <span>{opt.label}</span>
                  {isActive && (
                    <Check size={14} className="ml-auto text-green-700" aria-hidden="true" />
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
