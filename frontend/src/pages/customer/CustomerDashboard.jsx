import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Calendar, Image as ImageIcon, Star } from "lucide-react";

// ── Tokens ────────────────────────────────────────────────────────────────────
const G      = "#0E5C46";
const CREAM  = "#ede9e0";
const DARK   = "#172420";
const GOLD   = "#b98a22";
const MUTED  = "#5c7068";
const SERIF  = "Spectral, serif";
const SANS   = "'Hanken Grotesk', sans-serif";
const CARD   = { backgroundColor: "white", borderRadius: 14, border: "1px solid #e8e2d8" };

// ── Mock data ─────────────────────────────────────────────────────────────────
const UPCOMING = [
  { id: 1, name: "Solange Mukamana",        score: 94, service: "Custom dress (made-to-measure)", datetime: "Thu 12 Jun · 11:00", status: "confirmed" },
  { id: 2, name: "Claudine Uwase",           score: 88, service: "Braiding / cornrows",            datetime: "Sat 14 Jun · 14:00", status: "awaiting"  },
  { id: 3, name: "Diane Ingabire",           score: 91, service: "Custom celebration cake",        datetime: "Fri 20 Jun · 10:00", status: "confirmed" },
];

const COMPLETED = [
  { id: 1, name: "Esperance Nyiransabimana", score: 96, service: "Pastry & snack trays", datetime: "Fri 30 May · 15:00" },
  { id: 2, name: "Chantal Uwimana",          score: 90, service: "Deep home cleaning",   datetime: "Sat 24 May · 09:00" },
];

// ── Booking card ──────────────────────────────────────────────────────────────
function BookingCard({ booking, showStatus = true, showReview = false }) {
  return (
    <div style={{ ...CARD, padding: 18, display: "flex", alignItems: "center", gap: 16 }}>
      {/* Photo placeholder */}
      <div style={{ width: 52, height: 52, borderRadius: "50%", border: "1.5px dashed #c8c0b0", backgroundColor: "#f5f0e8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <ImageIcon size={18} style={{ color: "#c8c0b0" }} />
      </div>

      {/* Info */}
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
          <p style={{ color: DARK, fontWeight: 700, fontSize: "0.9rem" }}>{booking.name}</p>
          <span style={{ backgroundColor: DARK, color: GOLD, borderRadius: 99, padding: "2px 8px", fontSize: "0.65rem", fontWeight: 700 }}>
            ◆ {booking.score}
          </span>
        </div>
        <p style={{ color: MUTED, fontSize: "0.8rem" }}>{booking.service}</p>
        <p style={{ color: MUTED, fontSize: "0.75rem", marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
          <Calendar size={11} /> {booking.datetime}
        </p>
      </div>

      {/* Right: status + actions */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
        {showStatus && booking.status === "confirmed" && (
          <span style={{ border: "1px solid #0E5C46", color: G, borderRadius: 99, padding: "3px 10px", fontSize: "0.7rem", fontWeight: 600 }}>
            ✓ Confirmed
          </span>
        )}
        {showStatus && booking.status === "awaiting" && (
          <span style={{ border: `1px solid ${GOLD}`, color: GOLD, borderRadius: 99, padding: "3px 10px", fontSize: "0.7rem", fontWeight: 600 }}>
            ⌛ Awaiting reply
          </span>
        )}
        {!showStatus && (
          <span style={{ backgroundColor: "#f0ece4", color: MUTED, borderRadius: 99, padding: "3px 10px", fontSize: "0.7rem", fontWeight: 600 }}>
            Completed
          </span>
        )}

        {showReview ? (
          <button style={{ backgroundColor: GOLD, color: "white", border: "none", borderRadius: 8, padding: "7px 14px", fontFamily: SANS, fontWeight: 600, fontSize: "0.78rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
            <Star size={12} fill="white" /> Leave a review
          </button>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ backgroundColor: "white", color: DARK, border: "1px solid #e8e2d8", borderRadius: 8, padding: "7px 14px", fontFamily: SANS, fontWeight: 500, fontSize: "0.78rem", cursor: "pointer" }}>
              View
            </button>
            <button style={{ backgroundColor: G, color: "white", border: "none", borderRadius: 8, padding: "7px 14px", fontFamily: SANS, fontWeight: 600, fontSize: "0.78rem", cursor: "pointer" }}>
              Message
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ tab, setTab }) {
  const navItems = [
    { id: "upcoming",  label: "Upcoming",  badge: UPCOMING.length },
    { id: "completed", label: "Completed", badge: null             },
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
        MY BOOKINGS
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
              <span style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "white", borderRadius: 99, padding: "1px 7px", fontSize: "0.7rem", fontWeight: 600 }}>
                {badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Find a provider */}
      <div style={{ padding: "16px 10px" }}>
        <Link to="/providers" style={{ display: "block", textAlign: "center", backgroundColor: "#0a3d2c", color: "white", borderRadius: 8, padding: "10px 0", fontFamily: SANS, fontWeight: 600, fontSize: "0.8rem", textDecoration: "none" }}>
          Find a provider
        </Link>
      </div>

      <div style={{ flex: 1 }} />

      {/* Role switcher */}
      <div style={{ padding: 16, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {["Provider", "Admin"].map((role) => (
            <Link
              key={role}
              to={role === "Provider" ? "/provider/dashboard" : "#"}
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

// ── Page root ─────────────────────────────────────────────────────────────────
export default function CustomerDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState("upcoming");
  const firstName = (user?.fullName || "there").split(" ")[0];

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: SANS, backgroundColor: CREAM }}>
      <Sidebar tab={tab} setTab={setTab} />

      <main style={{ flex: 1, padding: 32, overflowY: "auto" }}>
        {/* Heading */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: SERIF, color: DARK, fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
            {tab === "upcoming" ? `Upcoming, ${firstName}` : "Completed bookings"}
          </h1>
          <p style={{ color: MUTED, fontSize: "0.875rem", marginTop: 4 }}>
            {tab === "upcoming"
              ? "Your confirmed and pending bookings."
              : "Past services — leave a review to help others find great providers."}
          </p>
        </div>

        {/* Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {tab === "upcoming"  && UPCOMING.map(b  => <BookingCard key={b.id} booking={b} showStatus={true}  showReview={false} />)}
          {tab === "completed" && COMPLETED.map(b => <BookingCard key={b.id} booking={b} showStatus={false} showReview={true}  />)}
        </div>

        {tab === "upcoming"  && UPCOMING.length  === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: MUTED }}>
            <p style={{ fontSize: "0.9rem", marginBottom: 10 }}>No upcoming bookings yet.</p>
            <Link to="/providers" style={{ color: G, fontWeight: 600, fontSize: "0.875rem" }}>Browse providers →</Link>
          </div>
        )}
        {tab === "completed" && COMPLETED.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: MUTED }}>
            <p style={{ fontSize: "0.9rem" }}>No completed bookings yet.</p>
          </div>
        )}
      </main>
    </div>
  );
}
