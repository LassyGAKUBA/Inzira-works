import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { Calendar, Image as ImageIcon, Star, X, Loader2 } from "lucide-react";

// ── Tokens ────────────────────────────────────────────────────────────────────
const G     = "#0E5C46";
const CREAM = "#ede9e0";
const DARK  = "#172420";
const GOLD  = "#b98a22";
const MUTED = "#5c7068";
const SERIF = "Spectral, serif";
const SANS  = "'Hanken Grotesk', sans-serif";
const CARD  = { backgroundColor: "white", borderRadius: 14, border: "1px solid #e8e2d8" };

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });
}

function providerFromRow(row) {
  const p = row.provider || {};
  const profiles = p.provider_profiles;
  const profile = Array.isArray(profiles) ? profiles[0] : profiles;
  return {
    name:       p.full_name || "Provider",
    trustScore: Math.round(profile?.trust_score ?? 0),
  };
}

// ── Review modal ──────────────────────────────────────────────────────────────
function ReviewModal({ booking, onClose, onSubmitted }) {
  const { user } = useAuth();
  const [rating,  setRating]  = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [saving,  setSaving]  = useState(false);
  const [err,     setErr]     = useState("");

  const provider = providerFromRow(booking);

  const submit = async () => {
    if (!rating) { setErr("Please choose a star rating."); return; }
    setSaving(true); setErr("");
    const { error } = await supabase.from("reviews").insert({
      booking_id:  booking.id,
      customer_id: user.id,
      provider_id: booking.provider_id,
      rating,
      comment: comment.trim() || null,
    });
    setSaving(false);
    if (error) { setErr("Could not submit. Please try again."); return; }
    onSubmitted();
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(23,36,32,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}>
      <div style={{ ...CARD, width: "100%", maxWidth: 440, padding: 28, position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: MUTED }}><X size={18} /></button>
        <h2 style={{ fontFamily: SERIF, color: DARK, fontSize: "1.3rem", fontWeight: 700, marginBottom: 4 }}>Leave a review</h2>
        <p style={{ color: MUTED, fontSize: "0.8rem", marginBottom: 20 }}>for {provider.name} · {booking.title}</p>

        <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {[1,2,3,4,5].map((n) => (
            <button key={n} onMouseEnter={() => setHovered(n)} onMouseLeave={() => setHovered(0)} onClick={() => setRating(n)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
              <Star size={28} fill={(hovered || rating) >= n ? GOLD : "none"} stroke={(hovered || rating) >= n ? GOLD : "#c8c0b0"} />
            </button>
          ))}
        </div>

        <textarea value={comment} onChange={e => setComment(e.target.value)} rows={4} placeholder="Tell others about your experience (optional)…"
          style={{ width: "100%", padding: "10px 14px", border: "1px solid #e8e2d8", borderRadius: 10, fontFamily: SANS, fontSize: "0.875rem", color: DARK, outline: "none", resize: "vertical", boxSizing: "border-box", marginBottom: 16 }} />

        {err && <p style={{ color: "#e05c5c", fontSize: "0.8rem", marginBottom: 10 }}>{err}</p>}

        <button onClick={submit} disabled={saving}
          style={{ width: "100%", backgroundColor: GOLD, color: "white", border: "none", borderRadius: 10, padding: "12px 0", fontFamily: SANS, fontWeight: 700, fontSize: "0.9rem", cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {saving && <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />}
          {saving ? "Submitting…" : "Submit review"}
        </button>
      </div>
    </div>
  );
}

// ── Booking card ──────────────────────────────────────────────────────────────
function BookingCard({ row, onReviewClick }) {
  const prov      = providerFromRow(row);
  const isUpcoming = ["pending", "confirmed"].includes(row.status);
  const hasReview  = (row.reviews || []).length > 0;

  return (
    <div style={{ ...CARD, padding: 18, display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ width: 52, height: 52, borderRadius: "50%", border: "1.5px dashed #c8c0b0", backgroundColor: "#f5f0e8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <ImageIcon size={18} style={{ color: "#c8c0b0" }} />
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
          <p style={{ color: DARK, fontWeight: 700, fontSize: "0.9rem" }}>{prov.name}</p>
          {prov.trustScore > 0 && (
            <span style={{ backgroundColor: DARK, color: GOLD, borderRadius: 99, padding: "2px 8px", fontSize: "0.65rem", fontWeight: 700 }}>
              ◆ {prov.trustScore}
            </span>
          )}
        </div>
        <p style={{ color: MUTED, fontSize: "0.8rem" }}>{row.title}</p>
        <p style={{ color: MUTED, fontSize: "0.75rem", marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
          <Calendar size={11} /> {formatDate(row.scheduled_date)}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
        {isUpcoming && row.status === "confirmed" && (
          <span style={{ border: `1px solid ${G}`, color: G, borderRadius: 99, padding: "3px 10px", fontSize: "0.7rem", fontWeight: 600 }}>✓ Confirmed</span>
        )}
        {isUpcoming && row.status === "pending" && (
          <span style={{ border: `1px solid ${GOLD}`, color: GOLD, borderRadius: 99, padding: "3px 10px", fontSize: "0.7rem", fontWeight: 600 }}>⌛ Awaiting reply</span>
        )}
        {!isUpcoming && (
          <span style={{ backgroundColor: "#f0ece4", color: MUTED, borderRadius: 99, padding: "3px 10px", fontSize: "0.7rem", fontWeight: 600 }}>Completed</span>
        )}

        {!isUpcoming && !hasReview && (
          <button onClick={() => onReviewClick(row)}
            style={{ backgroundColor: GOLD, color: "white", border: "none", borderRadius: 8, padding: "7px 14px", fontFamily: SANS, fontWeight: 600, fontSize: "0.78rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
            <Star size={12} fill="white" /> Leave a review
          </button>
        )}
        {!isUpcoming && hasReview && (
          <span style={{ color: G, fontSize: "0.75rem", fontWeight: 600 }}>★ Reviewed</span>
        )}
        {isUpcoming && (
          <div style={{ display: "flex", gap: 8 }}>
            <Link to={`/providers/${row.provider_id}`}
              style={{ backgroundColor: "white", color: DARK, border: "1px solid #e8e2d8", borderRadius: 8, padding: "7px 14px", fontFamily: SANS, fontWeight: 500, fontSize: "0.78rem", cursor: "pointer", textDecoration: "none" }}>
              View
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ tab, setTab, upcomingCount }) {
  const navItems = [
    { id: "upcoming",  label: "Upcoming",  badge: upcomingCount || null },
    { id: "completed", label: "Completed", badge: null                   },
  ];

  return (
    <aside style={{ width: 220, backgroundColor: G, flexShrink: 0, display: "flex", flexDirection: "column", minHeight: "100vh", fontFamily: SANS }}>
      <div style={{ padding: "20px 20px 0" }}>
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="16" height="20" viewBox="0 0 18 22" fill="none">
            <path d="M9 2C9 2 3 5.5 3 12C3 16.5 5.5 19 9 19L9 21L13 17.5L9 14L9 16.5C7 16.5 5 15 5 12C5 7.5 9 5 9 5L9 2Z" fill="white" />
          </svg>
          <span style={{ fontFamily: SERIF, color: "white", fontWeight: 700, fontSize: "1rem" }}>Inzira Works</span>
        </Link>
      </div>

      <p style={{ color: "#9ed3bf", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "24px 20px 8px" }}>
        MY BOOKINGS
      </p>

      <nav style={{ display: "flex", flexDirection: "column", gap: 2, padding: "0 10px" }}>
        {navItems.map(({ id, label, badge }) => (
          <button key={id} onClick={() => setTab(id)}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "9px 12px", borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: tab === id ? "rgba(255,255,255,0.14)" : "transparent", color: tab === id ? "white" : "rgba(255,255,255,0.65)", fontFamily: SANS, fontSize: "0.875rem", fontWeight: tab === id ? 600 : 400, textAlign: "left" }}>
            {label}
            {badge && <span style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "white", borderRadius: 99, padding: "1px 7px", fontSize: "0.7rem", fontWeight: 600 }}>{badge}</span>}
          </button>
        ))}
      </nav>

      <div style={{ padding: "16px 10px" }}>
        <Link to="/providers" style={{ display: "block", textAlign: "center", backgroundColor: "#0a3d2c", color: "white", borderRadius: 8, padding: "10px 0", fontFamily: SANS, fontWeight: 600, fontSize: "0.8rem", textDecoration: "none" }}>
          Find a provider
        </Link>
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ padding: 16, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {[["Provider", "/provider/dashboard"], ["Admin", "/admin/dashboard"]].map(([role, href]) => (
            <Link key={role} to={href} style={{ flex: 1, textAlign: "center", padding: "5px 0", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 6, color: "rgba(255,255,255,0.7)", fontSize: "0.72rem", textDecoration: "none" }}>
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
  const [tab,       setTab]       = useState("upcoming");
  const [upcoming,  setUpcoming]  = useState([]);
  const [completed, setCompleted] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [reviewing, setReviewing] = useState(null);

  const firstName = (user?.full_name || "there").split(" ")[0];

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const FIELDS = `
        id, title, status, scheduled_date, provider_id,
        provider:users!provider_id(
          full_name,
          provider_profiles(trust_score)
        )
      `;

      const [upRes, cmpRes] = await Promise.all([
        supabase.from("bookings")
          .select(FIELDS)
          .eq("customer_id", user.id)
          .in("status", ["pending", "confirmed"])
          .order("scheduled_date", { ascending: true }),

        supabase.from("bookings")
          .select(FIELDS + ", reviews(id, rating, comment)")
          .eq("customer_id", user.id)
          .eq("status", "completed")
          .order("updated_at", { ascending: false }),
      ]);

      setUpcoming(upRes.data   || []);
      setCompleted(cmpRes.data || []);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", fontFamily: SANS, backgroundColor: CREAM }}>
        <div style={{ width: 220, backgroundColor: G, flexShrink: 0 }} />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Loader2 size={28} style={{ color: G, animation: "spin 1s linear infinite" }} />
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const list = tab === "upcoming" ? upcoming : completed;

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: SANS, backgroundColor: CREAM }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <Sidebar tab={tab} setTab={setTab} upcomingCount={upcoming.length} />

      <main style={{ flex: 1, padding: 32, overflowY: "auto" }}>
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

        {list.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: MUTED }}>
            <p style={{ fontSize: "0.9rem", marginBottom: 10 }}>
              {tab === "upcoming" ? "No upcoming bookings yet." : "No completed bookings yet."}
            </p>
            {tab === "upcoming" && (
              <Link to="/providers" style={{ color: G, fontWeight: 600, fontSize: "0.875rem" }}>Browse providers →</Link>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {list.map((row) => (
              <BookingCard key={row.id} row={row} onReviewClick={setReviewing} />
            ))}
          </div>
        )}
      </main>

      {reviewing && (
        <ReviewModal
          booking={reviewing}
          onClose={() => setReviewing(null)}
          onSubmitted={loadData}
        />
      )}
    </div>
  );
}
