import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useLang } from "../../i18n/LangContext";
import LanguageSwitcher from "./LanguageSwitcher";

const NAV_LINKS = [
  { key: "nav_browse",  to: "/providers" },
  { key: "nav_how",    to: "/#how-it-works" },
  { key: "nav_about",  to: "/about" },
  { key: "nav_contact", to: "/contact" },
];

export default function Navbar() {
  const { t } = useLang();
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const isActive = (to) => {
    if (to === "/providers") return pathname === "/providers" || pathname.startsWith("/providers/");
    if (to.startsWith("/#")) return false;
    return pathname === to;
  };

  return (
    <nav className={`sticky top-0 z-50 bg-white transition-all duration-200 ${scrolled ? "shadow-sm" : "border-b border-slate-100"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div style={{ backgroundColor: "#F97316" }} className="w-8 h-8 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-sm">IW</span>
          </div>
          <span style={{ color: "#1E293B" }} className="font-bold text-lg tracking-tight">Inzira Works</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ key, to }) => (
            <Link
              key={key}
              to={to}
              style={isActive(to) ? { color: "#F97316" } : {}}
              className={`text-sm transition-colors hover:text-orange-500 ${
                isActive(to) ? "font-semibold" : "font-medium text-slate-600"
              }`}
            >
              {t(key)}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher compact />
          <div className="w-px h-5 bg-slate-200" />
          <Link to="/login" style={{ color: "#1E293B" }} className="text-sm font-medium hover:text-orange-500 transition-colors">
            {t("nav_login")}
          </Link>
          <Link
            to="/signup"
            style={{ backgroundColor: "#F97316" }}
            className="text-sm font-semibold text-white px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
          >
            {t("nav_getstarted")}
          </Link>
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 flex flex-col gap-4">
          {NAV_LINKS.map(({ key, to }) => (
            <Link
              key={key}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={`text-sm font-medium ${
                isActive(to) ? "text-orange-500 font-semibold" : "text-slate-700 hover:text-orange-500"
              }`}
            >
              {t(key)}
            </Link>
          ))}
          <LanguageSwitcher />
          <div className="flex gap-3 pt-2 border-t border-slate-100">
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="text-sm font-medium text-slate-700 border border-slate-200 px-4 py-2 rounded-xl flex-1 text-center"
            >
              {t("nav_login")}
            </Link>
            <Link
              to="/signup"
              onClick={() => setMenuOpen(false)}
              style={{ backgroundColor: "#F97316" }}
              className="text-sm font-semibold text-white px-4 py-2 rounded-xl flex-1 text-center"
            >
              {t("nav_getstarted")}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
