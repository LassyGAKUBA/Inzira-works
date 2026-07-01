import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Shield, CheckCircle, Banknote, MessageCircle,
  Calendar, MapPin, Image as ImageIcon, ExternalLink,
} from "lucide-react";

// ── Tokens ────────────────────────────────────────────────────────────────────
const G      = "#0E5C46";
const G_DARK = "#0a3d2c";
const CREAM  = "#ede9e0";
const DARK   = "#172420";
const GOLD   = "#b98a22";
const MUTED  = "#5c7068";
const SERIF  = "Spectral, serif";
const SANS   = "'Hanken Grotesk', sans-serif";
const CARD   = { backgroundColor: "white", borderRadius: 14, border: "1px solid #e8e2d8" };

// ── Mock data (matches design screenshots) ────────────────────────────────────
const STATS = [
  { Icon: Shield,         color: GOLD,      label: "Trust Score", value: "96 / 100", note: "↑ 2 this month",  noteGreen: true  },
  { Icon: CheckCircle,    color: G,         label: "Jobs done",   value: "12",        note: "this month",      noteGreen: false },
  { Icon: Banknote,       color: "#e05c5c", label: "Earned",      value: "380,000",   note: "RWF · this month",noteGreen: false },
  { Icon: MessageCircle,  color: MUTED,     label: "Response",    value: "98%",       note: "Excellent",       noteGreen: true  },
];

const PENDING = [
  { id: 1, initials: "AK", name: "Aline K.",     service: "Event catering — 40 guests",  datetime: "Sat 14 Jun · 12:00", location: "Kacyiru, Gasabo",    note: "Cocktail + main course for a birthday.", timeAgo: "2 hours ago" },
  { id: 2, initials: "JM", name: "Jean-Paul M.", service: "Custom celebration cake",       datetime: "Fri 20 Jun · 10:00", location: "Pickup at workshop", note: "Two-tier, chocolate, \"Happy 30th\".",     timeAgo: "5 hours ago" },
];

const PENDING_LIST = [
  { id: 1, initials: "AK", service: "Event catering — 40 guests", customer: "Aline K.",     datetime: "Sat 14 Jun · 12:00 · Kacyiru, Gasabo"    },
  { id: 2, initials: "JM", service: "Custom celebration cake",     customer: "Jean-Paul M.", datetime: "Fri 20 Jun · 10:00 · Pickup at workshop"  },
  { id: 3, initials: "DU", service: "Pastry & snack trays",        customer: "Divine U.",    datetime: "Wed 11 Jun · 15:00 · Remera, Gasabo"      },
];

const CONFIRMED = [
  { id: 1, service: "Custom celebration cake", customer: "Sandra I.",  datetime: "Tue 10 Jun · 09:00" },
  { id: 2, service: "Weekly meal prep",         customer: "Patrick R.", datetime: "Mon 09 Jun · 08:00" },
];

// ── Shared primitives ─────────────────────────────────────────────────────────
function InitialsCircle({ initials, size = 36 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", backgroundColor: "#e8f3ee", color: G, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: size * 0.33, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ tab, setTab, user }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const name = user?.fullName || user?.email?.split("@")[0] || "Provider";
  const firstName = name.split(" ")[0];

  const navItems = [
    { id: "overview",  label: "Overview"    },
    { id: "bookings",  label: "Bookings",  badge: 3 },
    { id: "profile",   label: "My profile" },
  ];

  return (
    <aside style={{ width: 220, backgroundColor: G, flexShrink: 0, display: "flex", flexDirection: "column", minHeight: "100vh", fontFamily: SANS }}>
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
      <p style={{ color: "#9ed3bf", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "24px 20px 8px" }}>
        PROVIDER
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
              backgroundColor: tab === id ? "rgba(255,255,255,0.14)" : "transparent",
              color: tab === id ? "white" : "rgba(255,255,255,0.65)",
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

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Bottom profile */}
      <div style={{ padding: 16, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 10, marginBottom: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", border: "1.5px dashed rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <ImageIcon size={14} style={{ color: "rgba(255,255,255,0.4)" }} />
          </div>
          <div>
            <p style={{ color: "white", fontSize: "0.8rem", fontWeight: 600 }}>{firstName}</p>
            <p style={{ color: GOLD, fontSize: "0.7rem", fontWeight: 500 }}>Trust 96</p>
          </div>
        </div>

        {/* Role switcher */}
        <div style={{ display: "flex", gap: 6 }}>
          {["Customer", "Admin"].map((role) => (
            <Link
              key={role}
              to={role === "Customer" ? "/customer/dashboard" : "#"}
              style={{ flex: 1, textAlign: "center", padding: "5px 0", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 6, color: "rgba(255,255,255,0.7)", fontSize: "0.72rem", textDecoration: "none" }}
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
function Overview({ user }) {
  const firstName = (user?.fullName || "Provider").split(" ")[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Greeting */}
      <div>
        <h1 style={{ fontFamily: SERIF, color: DARK, fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
          Muraho, {firstName} 👋
        </h1>
        <p style={{ color: MUTED, fontSize: "0.875rem", marginTop: 4 }}>Here's how your business is doing this month.</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {STATS.map(({ Icon, color, label, value, note, noteGreen }) => (
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

      {/* Booking requests */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <h2 style={{ fontFamily: SERIF, color: DARK, fontSize: "1.125rem", fontWeight: 700 }}>New booking requests</h2>
          <span style={{ backgroundColor: "#fee2e2", color: "#e05c5c", borderRadius: 99, padding: "3px 10px", fontSize: "0.72rem", fontWeight: 600 }}>
            {PENDING.length} pending
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {PENDING.map((b) => (
            <div key={b.id} style={{ ...CARD, padding: 18 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <InitialsCircle initials={b.initials} size={38} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <p style={{ color: DARK, fontWeight: 700, fontSize: "0.9rem" }}>{b.name}</p>
                    <span style={{ color: MUTED, fontSize: "0.72rem" }}>{b.timeAgo}</span>
                  </div>
                  <p style={{ color: DARK, fontSize: "0.875rem", fontWeight: 600, marginTop: 2 }}>{b.service}</p>
                  <p style={{ color: MUTED, fontSize: "0.75rem", marginTop: 4, display: "flex", alignItems: "center", gap: 8 }}>
                    <Calendar size={11} /> {b.datetime} &nbsp; <MapPin size={11} /> {b.location}
                  </p>
                  <p style={{ backgroundColor: "#f5f2ea", borderRadius: 8, padding: "8px 12px", marginTop: 10, color: "#5c7068", fontSize: "0.8rem", fontStyle: "italic" }}>
                    "{b.note}"
                  </p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button style={{ backgroundColor: G, color: "white", border: "none", borderRadius: 8, padding: "8px 20px", fontFamily: SANS, fontWeight: 600, fontSize: "0.8rem", cursor: "pointer" }}>
                        Accept
                      </button>
                      <button style={{ backgroundColor: "white", color: DARK, border: "1px solid #e8e2d8", borderRadius: 8, padding: "8px 20px", fontFamily: SANS, fontWeight: 500, fontSize: "0.8rem", cursor: "pointer" }}>
                        Decline
                      </button>
                    </div>
                    <button style={{ background: "none", border: "none", color: MUTED, fontFamily: SANS, fontSize: "0.8rem", cursor: "pointer" }}>Message</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Bookings tab ──────────────────────────────────────────────────────────────
function Bookings() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontFamily: SERIF, color: DARK, fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em" }}>Bookings</h1>
        <p style={{ color: MUTED, fontSize: "0.875rem", marginTop: 4 }}>Manage incoming requests and confirmed jobs.</p>
      </div>

      {/* Pending */}
      <div style={{ ...CARD, padding: 20 }}>
        <h2 style={{ color: DARK, fontSize: "0.95rem", fontWeight: 700, marginBottom: 16 }}>
          Pending requests · {PENDING_LIST.length}
        </h2>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {PENDING_LIST.map((b, i) => (
            <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderTop: i > 0 ? "1px solid #f0ece4" : "none" }}>
              <InitialsCircle initials={b.initials} size={34} />
              <div style={{ flex: 1 }}>
                <p style={{ color: DARK, fontWeight: 600, fontSize: "0.875rem" }}>{b.service}</p>
                <p style={{ color: MUTED, fontSize: "0.75rem", marginTop: 2 }}>{b.customer} · {b.datetime}</p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={{ backgroundColor: G, color: "white", border: "none", borderRadius: 8, padding: "7px 18px", fontFamily: SANS, fontWeight: 600, fontSize: "0.8rem", cursor: "pointer" }}>
                  Accept
                </button>
                <button style={{ backgroundColor: "white", color: DARK, border: "1px solid #e8e2d8", borderRadius: 8, padding: "7px 18px", fontFamily: SANS, fontWeight: 500, fontSize: "0.8rem", cursor: "pointer" }}>
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmed */}
      <div style={{ ...CARD, padding: 20 }}>
        <h2 style={{ color: DARK, fontSize: "0.95rem", fontWeight: 700, marginBottom: 16 }}>Confirmed jobs</h2>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {CONFIRMED.map((b, i) => (
            <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderTop: i > 0 ? "1px solid #f0ece4" : "none" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: G, flexShrink: 0, marginLeft: 4 }} />
              <div style={{ flex: 1 }}>
                <p style={{ color: DARK, fontWeight: 600, fontSize: "0.875rem" }}>{b.service}</p>
                <p style={{ color: MUTED, fontSize: "0.75rem", marginTop: 1 }}>for {b.customer}</p>
              </div>
              <span style={{ color: MUTED, fontSize: "0.75rem" }}>{b.datetime}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── My profile tab ────────────────────────────────────────────────────────────
function MyProfile() {
  const [form, setForm] = useState({
    business: "Esperance's Kitchen",
    about: "Caterer & pastry chef in Remera with 240+ completed jobs. Known for reliable, beautiful work for events large and small.",
    category: "Baking & Catering",
    district: "Gasabo",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontFamily: SERIF, color: DARK, fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em" }}>My profile</h1>
          <p style={{ color: MUTED, fontSize: "0.875rem", marginTop: 4 }}>This is what customers see. Keep it complete to rank higher.</p>
        </div>
        <button style={{ border: "1px solid #d4cfc5", backgroundColor: "white", borderRadius: 8, padding: "8px 16px", fontFamily: SANS, fontSize: "0.8rem", fontWeight: 500, color: DARK, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          <ExternalLink size={13} /> Preview public page
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16 }}>
        {/* Main form */}
        <div style={{ ...CARD, padding: 24 }}>
          {/* Photo + name */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", border: "1.5px dashed #c8c0b0", backgroundColor: "#f5f0e8", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, flexShrink: 0, cursor: "pointer" }}>
              <ImageIcon size={16} style={{ color: "#c8c0b0" }} />
              <span style={{ color: "#c8c0b0", fontSize: "0.6rem" }}>Photo</span>
            </div>
            <div>
              <p style={{ color: DARK, fontWeight: 700, fontSize: "1rem" }}>Esperance Nyiransabimana</p>
              <p style={{ color: MUTED, fontSize: "0.8rem", marginTop: 2 }}>Caterer & Pastry Chef</p>
            </div>
          </div>

          {/* Fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ color: MUTED, fontSize: "0.75rem", fontWeight: 500, display: "block", marginBottom: 6 }}>Business name</label>
              <input value={form.business} onChange={e => setForm(f => ({ ...f, business: e.target.value }))}
                style={{ width: "100%", padding: "10px 14px", border: "1px solid #e8e2d8", borderRadius: 10, fontFamily: SANS, fontSize: "0.875rem", color: DARK, outline: "none", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ color: MUTED, fontSize: "0.75rem", fontWeight: 500, display: "block", marginBottom: 6 }}>About</label>
              <textarea value={form.about} onChange={e => setForm(f => ({ ...f, about: e.target.value }))} rows={4}
                style={{ width: "100%", padding: "10px 14px", border: "1px solid #e8e2d8", borderRadius: 10, fontFamily: SANS, fontSize: "0.875rem", color: DARK, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ color: MUTED, fontSize: "0.75rem", fontWeight: 500, display: "block", marginBottom: 6 }}>Category</label>
                <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid #e8e2d8", borderRadius: 10, fontFamily: SANS, fontSize: "0.875rem", color: DARK, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ color: MUTED, fontSize: "0.75rem", fontWeight: 500, display: "block", marginBottom: 6 }}>District</label>
                <input value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))}
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid #e8e2d8", borderRadius: 10, fontFamily: SANS, fontSize: "0.875rem", color: DARK, outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>
            <button style={{ alignSelf: "flex-start", backgroundColor: G, color: "white", border: "none", borderRadius: 10, padding: "11px 24px", fontFamily: SANS, fontWeight: 600, fontSize: "0.875rem", cursor: "pointer" }}>
              Save changes
            </button>
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Profile completeness */}
          <div style={{ ...CARD, padding: 18 }}>
            <p style={{ color: DARK, fontSize: "0.8rem", fontWeight: 600, marginBottom: 12 }}>Profile completeness</p>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{ flex: 1, height: 6, backgroundColor: "#e8e2d8", borderRadius: 99 }}>
                <div style={{ width: "100%", height: "100%", backgroundColor: G, borderRadius: 99 }} />
              </div>
              <span style={{ color: G, fontSize: "0.8rem", fontWeight: 700 }}>100%</span>
            </div>
            <p style={{ color: MUTED, fontSize: "0.72rem" }}>Great — complete profiles rank higher in search.</p>
          </div>

          {/* Portfolio */}
          <div style={{ ...CARD, padding: 18 }}>
            <p style={{ color: DARK, fontSize: "0.8rem", fontWeight: 600, marginBottom: 12 }}>Portfolio</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[1, 2, 3, 4].map((n) => (
                <div key={n} style={{ aspectRatio: "1", border: "1.5px dashed #c8c0b0", borderRadius: 10, backgroundColor: "#f5f0e8", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, cursor: "pointer" }}>
                  <ImageIcon size={18} style={{ color: "#c8c0b0" }} />
                  <span style={{ color: "#c8c0b0", fontSize: "0.65rem" }}>Add</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page root ─────────────────────────────────────────────────────────────────
export default function ProviderDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState("overview");

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: SANS, backgroundColor: CREAM }}>
      <Sidebar tab={tab} setTab={setTab} user={user} />

      <main style={{ flex: 1, padding: 32, overflowY: "auto" }}>
        {tab === "overview"  && <Overview user={user} />}
        {tab === "bookings"  && <Bookings />}
        {tab === "profile"   && <MyProfile />}
      </main>
    </div>
  );
}
