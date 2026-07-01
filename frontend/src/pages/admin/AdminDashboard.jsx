import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Users, CalendarCheck, ShieldCheck, Clock, FileText } from "lucide-react";

// ── Tokens ────────────────────────────────────────────────────────────────────
const G_ADMIN = "#0a3d2c";
const G       = "#0E5C46";
const CREAM   = "#ede9e0";
const DARK    = "#172420";
const GOLD    = "#b98a22";
const MUTED   = "#5c7068";
const SERIF   = "Spectral, serif";
const SANS    = "'Hanken Grotesk', sans-serif";
const CARD    = { backgroundColor: "white", borderRadius: 14, border: "1px solid #e8e2d8" };

// ── Mock data ─────────────────────────────────────────────────────────────────
const PLATFORM = { providers: 1204, providersWeekly: 48, bookings30d: 2318, bookingsGrowth: 12, avgTrust: 87, pendingVerifications: 2 };

const ACTIVITY = [
  { id: 1, name: "Sandrine Iradukunda", action: "submitted verification documents",  time: "12 min ago" },
  { id: 2, name: "Solange Mukamana",    action: "completed a booking (+1 job)",        time: "1 hour ago"  },
  { id: 3, name: "New customer",        action: "signed up from Kicukiro",             time: "2 hours ago" },
  { id: 4, name: "Ange Keza",           action: "reached Trust Score 82",              time: "3 hours ago" },
  { id: 5, name: "Diane Ingabire",      action: "received a 5-star review",            time: "5 hours ago" },
];

const DISTRICTS = [
  { name: "Gasabo",      count: 512, pct: 100 },
  { name: "Kicukiro",   count: 418, pct: 82  },
  { name: "Nyarugenge", count: 274, pct: 54  },
];

const VERIFICATION_QUEUE = [
  { id: 1, name: "Aline Mukandayisenga", role: "Tailor — Uniforms & Repairs", district: "Kicukiro", trust: 79, docs: ["National ID", "TVET certificate"] },
  { id: 2, name: "Sandrine Iradukunda",  role: "Knitwear & Crochet Maker",    district: "Kicukiro", trust: 73, docs: ["National ID", "TVET certificate"] },
];

const ALL_PROVIDERS = [
  { id: 1,  name: "Esperance Nyiransabimana", district: "Gasabo",     category: "Baking & Catering",    trust: 96, verified: true  },
  { id: 2,  name: "Solange Mukamana",         district: "Gasabo",     category: "Tailoring & Fashion",  trust: 94, verified: true  },
  { id: 3,  name: "Diane Ingabire",           district: "Nyarugenge", category: "Baking & Catering",    trust: 91, verified: true  },
  { id: 4,  name: "Chantal Uwimana",          district: "Kicukiro",   category: "Home & Cleaning",      trust: 90, verified: true  },
  { id: 5,  name: "Claudine Uwase",           district: "Kicukiro",   category: "Hair & Beauty",        trust: 88, verified: true  },
  { id: 6,  name: "Josiane Mukamana",         district: "Gasabo",     category: "Handicraft & Décor",   trust: 87, verified: true  },
  { id: 7,  name: "Grace Umutoni",            district: "Nyarugenge", category: "Handicraft & Décor",   trust: 85, verified: true  },
  { id: 8,  name: "Ange Keza",                district: "Nyarugenge", category: "Hair & Beauty",        trust: 82, verified: true  },
  { id: 9,  name: "Aline Mukandayisenga",     district: "Kicukiro",   category: "Tailoring & Fashion",  trust: 79, verified: false },
  { id: 10, name: "Sandrine Iradukunda",      district: "Kicukiro",   category: "Knitwear & Textiles",  trust: 73, verified: false },
];

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ tab, setTab }) {
  const navItems = [
    { id: "overview",  label: "Overview",            badge: null },
    { id: "queue",     label: "Verification queue",  badge: VERIFICATION_QUEUE.length },
    { id: "providers", label: "All providers",       badge: null },
  ];

  return (
    <aside style={{ width: 220, backgroundColor: G_ADMIN, flexShrink: 0, display: "flex", flexDirection: "column", minHeight: "100vh", fontFamily: SANS }}>
      {/* Logo */}
      <div style={{ padding: "20px 20px 0" }}>
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="16" height="20" viewBox="0 0 18 22" fill="none">
            <path d="M9 2C9 2 3 5.5 3 12C3 16.5 5.5 19 9 19L9 21L13 17.5L9 14L9 16.5C7 16.5 5 15 5 12C5 7.5 9 5 9 5L9 2Z" fill="white" />
          </svg>
          <span style={{ fontFamily: SERIF, color: "white", fontWeight: 700, fontSize: "1rem" }}>Inzira Works</span>
        </Link>
      </div>

      {/* Section label */}
      <p style={{ color: "#6aab8e", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "24px 20px 8px" }}>
        ADMIN CONSOLE
      </p>

      {/* Nav */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 2, padding: "0 10px" }}>
        {navItems.map(({ id, label, badge }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              width: "100%", padding: "9px 12px",
              borderRadius: 8, border: "none", cursor: "pointer",
              backgroundColor: tab === id ? "rgba(255,255,255,0.12)" : "transparent",
              color: tab === id ? "white" : "rgba(255,255,255,0.6)",
              fontFamily: SANS, fontSize: "0.875rem", fontWeight: tab === id ? 600 : 400,
              textAlign: "left",
            }}
          >
            {label}
            {badge && (
              <span style={{ backgroundColor: "#e05c5c", color: "white", borderRadius: 99, padding: "1px 7px", fontSize: "0.7rem", fontWeight: 700 }}>
                {badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div style={{ flex: 1 }} />

      {/* Role switcher */}
      <div style={{ padding: 16, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {["Provider", "Customer"].map((role) => (
            <Link
              key={role}
              to={role === "Provider" ? "/provider/dashboard" : "/customer/dashboard"}
              style={{ flex: 1, textAlign: "center", padding: "5px 0", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 6, color: "rgba(255,255,255,0.6)", fontSize: "0.72rem", textDecoration: "none" }}
            >
              {role}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}

// ── Overview tab ──────────────────────────────────────────────────────────────
function Overview() {
  const stats = [
    { Icon: Users,        color: G,        label: "Total providers",      value: PLATFORM.providers.toLocaleString(), note: `+${PLATFORM.providersWeekly} this week`, noteGreen: true  },
    { Icon: CalendarCheck, color: "#3b82f6", label: "Bookings (30 days)",   value: PLATFORM.bookings30d.toLocaleString(), note: `+${PLATFORM.bookingsGrowth}% vs last month`, noteGreen: true  },
    { Icon: ShieldCheck,  color: GOLD,     label: "Avg Trust Score",       value: PLATFORM.avgTrust,                    note: "Across all providers",    noteGreen: false },
    { Icon: Clock,        color: "#e05c5c", label: "Pending verifications", value: PLATFORM.pendingVerifications,        note: "Needs review",            noteGreen: false },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontFamily: SERIF, color: DARK, fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em" }}>Platform overview</h1>
        <p style={{ color: MUTED, fontSize: "0.875rem", marginTop: 4 }}>Kigali City · live snapshot</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {stats.map(({ Icon, color, label, value, note, noteGreen }) => (
          <div key={label} style={{ ...CARD, padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Icon size={16} style={{ color }} />
              <span style={{ color: MUTED, fontSize: "0.75rem", fontWeight: 500 }}>{label}</span>
            </div>
            <p style={{ fontFamily: SERIF, color: DARK, fontSize: "1.5rem", fontWeight: 700, lineHeight: 1 }}>{value}</p>
            <p style={{ color: noteGreen ? G : MUTED, fontSize: "0.72rem", marginTop: 6 }}>{note}</p>
          </div>
        ))}
      </div>

      {/* Two-col row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16 }}>
        {/* Recent activity */}
        <div style={{ ...CARD, padding: 20 }}>
          <h2 style={{ color: DARK, fontSize: "0.95rem", fontWeight: 700, marginBottom: 16 }}>Recent activity</h2>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {ACTIVITY.map((a, i) => (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderTop: i > 0 ? "1px solid #f0ece4" : "none" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: G, flexShrink: 0 }} />
                <p style={{ flex: 1, color: DARK, fontSize: "0.82rem" }}>
                  <strong>{a.name}</strong> {a.action}
                </p>
                <span style={{ color: MUTED, fontSize: "0.72rem", flexShrink: 0 }}>{a.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* By district */}
        <div style={{ ...CARD, padding: 20 }}>
          <h2 style={{ color: DARK, fontSize: "0.95rem", fontWeight: 700, marginBottom: 16 }}>By district</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {DISTRICTS.map((d) => (
              <div key={d.name}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ color: DARK, fontSize: "0.8rem", fontWeight: 500 }}>{d.name}</span>
                  <span style={{ color: MUTED, fontSize: "0.78rem" }}>{d.count.toLocaleString()}</span>
                </div>
                <div style={{ height: 6, backgroundColor: "#e8e2d8", borderRadius: 99 }}>
                  <div style={{ width: `${d.pct}%`, height: "100%", backgroundColor: G, borderRadius: 99 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Verification queue tab ────────────────────────────────────────────────────
function VerificationQueue() {
  const [approved, setApproved] = useState([]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontFamily: SERIF, color: DARK, fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em" }}>Verification queue</h1>
        <p style={{ color: MUTED, fontSize: "0.875rem", marginTop: 4 }}>Review submitted documents and approve providers.</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {VERIFICATION_QUEUE.filter(p => !approved.includes(p.id)).map((p) => (
          <div key={p.id} style={{ ...CARD, padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
            {/* Initials */}
            <div style={{ width: 48, height: 48, borderRadius: "50%", backgroundColor: "#e8f3ee", color: G, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.9rem", flexShrink: 0 }}>
              {p.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <p style={{ color: DARK, fontWeight: 700, fontSize: "0.9rem" }}>{p.name}</p>
              <p style={{ color: MUTED, fontSize: "0.78rem", marginTop: 2 }}>{p.role} · {p.district}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                <span style={{ backgroundColor: DARK, color: GOLD, borderRadius: 99, padding: "2px 8px", fontSize: "0.65rem", fontWeight: 700 }}>
                  ◆ {p.trust}
                </span>
                {p.docs.map((doc) => (
                  <span key={doc} style={{ backgroundColor: "#e8f3ee", color: G, borderRadius: 99, padding: "2px 10px", fontSize: "0.65rem", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                    <FileText size={10} /> {doc}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ backgroundColor: "white", color: DARK, border: "1px solid #e8e2d8", borderRadius: 8, padding: "8px 16px", fontFamily: SANS, fontWeight: 500, fontSize: "0.8rem", cursor: "pointer" }}>
                View docs
              </button>
              <button
                onClick={() => setApproved(a => [...a, p.id])}
                style={{ backgroundColor: G, color: "white", border: "none", borderRadius: 8, padding: "8px 20px", fontFamily: SANS, fontWeight: 600, fontSize: "0.8rem", cursor: "pointer" }}
              >
                Approve
              </button>
            </div>
          </div>
        ))}

        {approved.length === VERIFICATION_QUEUE.length && (
          <div style={{ textAlign: "center", padding: "48px 0", color: MUTED }}>
            <p style={{ fontSize: "0.9rem" }}>All providers have been reviewed.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── All providers tab ─────────────────────────────────────────────────────────
function AllProviders() {
  const verified = ALL_PROVIDERS.filter(p => p.verified).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontFamily: SERIF, color: DARK, fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em" }}>All providers</h1>
        <p style={{ color: MUTED, fontSize: "0.875rem", marginTop: 4 }}>{ALL_PROVIDERS.length} shown · {verified} verified</p>
      </div>

      <div style={{ ...CARD, overflow: "hidden" }}>
        {/* Table header */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 160px 80px 100px", gap: 0, padding: "12px 20px", borderBottom: "1px solid #f0ece4", backgroundColor: "#faf8f4" }}>
          {["PROVIDER", "CATEGORY", "TRUST", "STATUS"].map(col => (
            <span key={col} style={{ color: MUTED, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em" }}>{col}</span>
          ))}
        </div>

        {/* Rows */}
        {ALL_PROVIDERS.map((p, i) => (
          <div key={p.id} style={{ display: "grid", gridTemplateColumns: "1fr 160px 80px 100px", gap: 0, padding: "14px 20px", borderTop: i > 0 ? "1px solid #f0ece4" : "none", alignItems: "center" }}>
            {/* Provider */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", backgroundColor: "#e8f3ee", color: G, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.65rem", flexShrink: 0 }}>
                {p.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </div>
              <div>
                <p style={{ color: DARK, fontSize: "0.82rem", fontWeight: 600 }}>{p.name}</p>
                <p style={{ color: MUTED, fontSize: "0.7rem" }}>{p.district}</p>
              </div>
            </div>

            {/* Category */}
            <span style={{ color: MUTED, fontSize: "0.78rem" }}>{p.category}</span>

            {/* Trust score */}
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: GOLD, fontSize: "0.78rem", fontWeight: 700 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: GOLD, display: "inline-block" }} />
              {p.trust}
            </span>

            {/* Status */}
            {p.verified ? (
              <span style={{ backgroundColor: "#e8f3ee", color: G, borderRadius: 99, padding: "3px 10px", fontSize: "0.68rem", fontWeight: 600, display: "inline-block" }}>
                Verified
              </span>
            ) : (
              <span style={{ backgroundColor: "#fef3c7", color: "#92700a", borderRadius: 99, padding: "3px 10px", fontSize: "0.68rem", fontWeight: 600, display: "inline-block" }}>
                Pending
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page root ─────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [tab, setTab] = useState("overview");

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: SANS, backgroundColor: CREAM }}>
      <Sidebar tab={tab} setTab={setTab} />

      <main style={{ flex: 1, padding: 32, overflowY: "auto" }}>
        {tab === "overview"  && <Overview />}
        {tab === "queue"     && <VerificationQueue />}
        {tab === "providers" && <AllProviders />}
      </main>
    </div>
  );
}
