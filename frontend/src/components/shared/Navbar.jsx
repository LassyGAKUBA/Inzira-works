import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const G     = "#0E5C46";
const CREAM = "#ede9e0";
const DARK  = "#172420";

const NAV_LINKS = [
  { label: "Find a provider", to: "/providers" },
  { label: "For providers",   to: "/signup"    },
  { label: "How it works",    to: "/about"     },
];

function LogoMark() {
  return (
    <svg width="18" height="22" viewBox="0 0 18 22" fill="none" aria-hidden="true">
      <path
        d="M9 2C9 2 3 5.5 3 12C3 16.5 5.5 19 9 19L9 21L13 17.5L9 14L9 16.5C7 16.5 5 15 5 12C5 7.5 9 5 9 5L9 2Z"
        fill={G}
      />
    </svg>
  );
}

export default function Navbar() {
  const { pathname } = useLocation();
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const isActive = (to) =>
    to === "/providers"
      ? pathname === "/providers" || pathname.startsWith("/providers/")
      : pathname === to;

  return (
    <nav
      style={{
        backgroundColor: CREAM,
        borderBottom: scrolled ? "1px solid #d4cfc5" : "1px solid transparent",
        position: "sticky",
        top: 0,
        zIndex: 50,
        transition: "border-color 0.2s",
      }}
    >
      <div
        style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 64 }}
        className="flex items-center justify-between"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0" style={{ textDecoration: "none" }}>
          <LogoMark />
          <span
            style={{
              color: DARK,
              fontFamily: "Spectral, serif",
              fontWeight: 700,
              fontSize: "1.1rem",
              letterSpacing: "-0.01em",
            }}
          >
            Inzira Works
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              style={{
                color: isActive(to) ? G : "#3c4a44",
                fontWeight: isActive(to) ? 600 : 500,
                fontSize: "0.875rem",
                textDecoration: "none",
              }}
              className="hover:opacity-70 transition-opacity"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-5">
          <Link
            to="/login"
            style={{ color: DARK, fontWeight: 500, fontSize: "0.875rem", textDecoration: "none" }}
            className="hover:opacity-70 transition-opacity"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            style={{
              backgroundColor: G,
              color: "white",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: "0.875rem",
              padding: "8px 18px",
              textDecoration: "none",
            }}
            className="hover:opacity-90 transition-opacity"
          >
            Join Inzira
          </Link>
        </div>

        {/* Mobile burger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-lg transition-colors"
          style={{ color: DARK }}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div
          style={{
            backgroundColor: CREAM,
            borderTop: "1px solid #d4cfc5",
            padding: "16px 24px",
          }}
          className="md:hidden flex flex-col gap-4"
        >
          {NAV_LINKS.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              style={{ color: "#3c4a44", fontWeight: 500, fontSize: "0.875rem", textDecoration: "none" }}
            >
              {label}
            </Link>
          ))}
          <div className="flex gap-3 pt-3" style={{ borderTop: "1px solid #d4cfc5" }}>
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              style={{
                border: "1px solid #d4cfc5",
                borderRadius: 8,
                padding: "9px 16px",
                color: DARK,
                fontWeight: 500,
                fontSize: "0.875rem",
                textDecoration: "none",
                textAlign: "center",
                flex: 1,
              }}
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              onClick={() => setMenuOpen(false)}
              style={{
                backgroundColor: G,
                borderRadius: 8,
                padding: "9px 16px",
                color: "white",
                fontWeight: 600,
                fontSize: "0.875rem",
                textDecoration: "none",
                textAlign: "center",
                flex: 1,
              }}
            >
              Join Inzira
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
