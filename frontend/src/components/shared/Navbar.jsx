import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const G     = "#0E5C46";
const CREAM = "#ede9e0";
const DARK  = "#172420";
const MUTED = "#5c7068";
const SANS  = "'Hanken Grotesk', sans-serif";

const NAV_LINKS = [
  { label: "Find a provider", to: "/providers"   },
  { label: "For providers",   to: "/role-select" },
  { label: "How it works",    to: "/about"       },
];

const ROLE_DASHBOARD = {
  provider: "/provider/dashboard",
  customer:  "/customer/dashboard",
  admin:     "/admin/dashboard",
};

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
  const { pathname }          = useLocation();
  const { user, logout }      = useAuth();
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [joinHover, setJoinHover] = useState(false);
  const [dropOpen,  setDropOpen]  = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!dropOpen) return;
    const close = () => setDropOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [dropOpen]);

  const isActive = (to) =>
    to === "/providers"
      ? pathname === "/providers" || pathname.startsWith("/providers/")
      : pathname === to;

  const dashboardHref = ROLE_DASHBOARD[user?.role] || "/customer/dashboard";
  const firstName = (user?.full_name || "").split(" ")[0] || "Account";

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
          <span style={{ color: DARK, fontFamily: "Spectral, serif", fontWeight: 700, fontSize: "1.1rem", letterSpacing: "-0.01em" }}>
            Inzira Works
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ label, to }) => (
            <Link key={to} to={to}
              style={{ color: isActive(to) ? G : "#3c4a44", fontWeight: isActive(to) ? 600 : 500, fontSize: "0.875rem", textDecoration: "none" }}
              className="hover:opacity-70 transition-opacity">
              {label}
            </Link>
          ))}
        </div>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div style={{ position: "relative" }}>
              <button
                onClick={(e) => { e.stopPropagation(); setDropOpen((v) => !v); }}
                style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "1px solid #d4cfc5", borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontFamily: SANS, fontSize: "0.875rem", color: DARK, fontWeight: 500 }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", backgroundColor: G, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.65rem", flexShrink: 0 }}>
                  {firstName[0]?.toUpperCase()}
                </div>
                {firstName}
              </button>

              {dropOpen && (
                <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", backgroundColor: "white", border: "1px solid #e8e2d8", borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.1)", minWidth: 180, overflow: "hidden", zIndex: 100 }}>
                  <div style={{ padding: "10px 14px", borderBottom: "1px solid #f0ece4" }}>
                    <p style={{ color: DARK, fontWeight: 600, fontSize: "0.82rem", fontFamily: SANS }}>{user.full_name}</p>
                    <p style={{ color: MUTED, fontSize: "0.72rem", fontFamily: SANS, marginTop: 1 }}>{user.role}</p>
                  </div>
                  <Link to={dashboardHref} onClick={() => setDropOpen(false)}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", color: DARK, textDecoration: "none", fontSize: "0.82rem", fontFamily: SANS, fontWeight: 500 }}
                    className="hover:bg-[#f5f2ea]">
                    <LayoutDashboard size={14} style={{ color: G }} /> Dashboard
                  </Link>
                  <button onClick={() => { logout(); setDropOpen(false); }}
                    style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 14px", background: "none", border: "none", cursor: "pointer", color: "#e05c5c", fontSize: "0.82rem", fontFamily: SANS, fontWeight: 500, textAlign: "left" }}
                    className="hover:bg-[#f5f2ea]">
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login"
                style={{ color: DARK, fontWeight: 500, fontSize: "0.875rem", textDecoration: "none" }}
                className="hover:opacity-70 transition-opacity">
                Sign in
              </Link>
              <Link to="/role-select"
                onMouseEnter={() => setJoinHover(true)}
                onMouseLeave={() => setJoinHover(false)}
                style={{ backgroundColor: G, color: "white", borderRadius: 8, fontWeight: 600, fontSize: "0.875rem", padding: "8px 18px", textDecoration: "none", opacity: joinHover ? 0.85 : 1, transition: "opacity 0.15s" }}>
                Join Inzira
              </Link>
            </>
          )}
        </div>

        {/* Mobile burger */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg" style={{ color: DARK }} aria-label="Toggle menu">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div style={{ backgroundColor: CREAM, borderTop: "1px solid #d4cfc5", padding: "16px 24px" }} className="md:hidden flex flex-col gap-4">
          {NAV_LINKS.map(({ label, to }) => (
            <Link key={to} to={to} onClick={() => setMenuOpen(false)}
              style={{ color: "#3c4a44", fontWeight: 500, fontSize: "0.875rem", textDecoration: "none" }}>
              {label}
            </Link>
          ))}
          <div className="flex gap-3 pt-3" style={{ borderTop: "1px solid #d4cfc5" }}>
            {user ? (
              <>
                <Link to={dashboardHref} onClick={() => setMenuOpen(false)}
                  style={{ flex: 1, backgroundColor: G, borderRadius: 8, padding: "9px 16px", color: "white", fontWeight: 600, fontSize: "0.875rem", textDecoration: "none", textAlign: "center" }}>
                  Dashboard
                </Link>
                <button onClick={() => { logout(); setMenuOpen(false); }}
                  style={{ flex: 1, border: "1px solid #d4cfc5", borderRadius: 8, padding: "9px 16px", color: DARK, fontWeight: 500, fontSize: "0.875rem", background: "none", cursor: "pointer" }}>
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)}
                  style={{ flex: 1, border: "1px solid #d4cfc5", borderRadius: 8, padding: "9px 16px", color: DARK, fontWeight: 500, fontSize: "0.875rem", textDecoration: "none", textAlign: "center" }}>
                  Sign in
                </Link>
                <Link to="/role-select" onClick={() => setMenuOpen(false)}
                  style={{ flex: 1, backgroundColor: G, borderRadius: 8, padding: "9px 16px", color: "white", fontWeight: 600, fontSize: "0.875rem", textDecoration: "none", textAlign: "center" }}>
                  Join Inzira
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
