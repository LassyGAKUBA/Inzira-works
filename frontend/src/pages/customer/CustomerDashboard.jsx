import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import {
  Calendar, Star, X, Loader2, CheckCircle, Clock, LogOut,
  User, LayoutDashboard, BookOpen, History as HistoryIcon,
  MessageCircle, Shield, ChevronRight, Edit2, Save, Menu,
} from "lucide-react";

const G     = "#0E5C46";
const CREAM = "#ede9e0";
const DARK  = "#172420";
const GOLD  = "#b98a22";
const MUTED = "#5c7068";
const SERIF = "Spectral, serif";
const SANS  = "'Hanken Grotesk', sans-serif";
const CARD  = { backgroundColor: "white", borderRadius: 14, border: "1px solid #e8e2d8" };

const DISTRICTS = [
  "Gasabo","Kicukiro","Nyarugenge","Bugesera","Gatsibo","Kayonza","Kirehe","Ngoma",
  "Nyagatare","Rwamagana","Burera","Gakenke","Gicumbi","Musanze","Rulindo","Gisagara",
  "Huye","Kamonyi","Muhanga","Nyamagabe","Nyanza","Nyaruguru","Ruhango","Karongi",
  "Ngororero","Nyabihu","Nyamasheke","Rubavu","Rutsiro","Rusizi",
];

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });
}

function openWhatsApp(phone, message) {
  let n = (phone || "").replace(/\D/g, "");
  if (n.startsWith("0")) n = "250" + n.slice(1);
  else if (n && !n.startsWith("250")) n = "250" + n;
  if (!n) return;
  window.open(`https://wa.me/${n}?text=${encodeURIComponent(message)}`, "_blank");
}

function StatusBadge({ status }) {
  const map = {
    pending:   { label: "Awaiting reply", bg: "#fef9ec", color: GOLD,      border: GOLD },
    confirmed: { label: "Confirmed",      bg: "#e8f3ee", color: G,         border: G    },
    completed: { label: "Completed",      bg: "#f0ece4", color: MUTED,     border: "#c8c0b0" },
    rejected:  { label: "Declined",       bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
  };
  const m = map[status] || map.pending;
  return (
    <span style={{ backgroundColor: m.bg, color: m.color, border: `1px solid ${m.border}`, borderRadius: 99, padding: "3px 10px", fontSize: "0.7rem", fontWeight: 600 }}>
      {m.label}
    </span>
  );
}

function ReviewModal({ booking, onClose, onSubmitted }) {
  const { user } = useAuth();
  const provider = booking.provider?.full_name || "Provider";
  const [rating,  setRating]  = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [saving,  setSaving]  = useState(false);
  const [err,     setErr]     = useState("");

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
        <h2 style={{ fontFamily: SERIF, color: DARK, fontSize: "1.25rem", fontWeight: 700, marginBottom: 4 }}>Leave a review</h2>
        <p style={{ color: MUTED, fontSize: "0.8rem", marginBottom: 20 }}>for {provider} · {booking.title}</p>
        <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {[1,2,3,4,5].map(n => (
            <button key={n} onMouseEnter={() => setHovered(n)} onMouseLeave={() => setHovered(0)} onClick={() => setRating(n)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
              <Star size={28} fill={(hovered || rating) >= n ? GOLD : "none"} stroke={(hovered || rating) >= n ? GOLD : "#c8c0b0"} />
            </button>
          ))}
        </div>
        <textarea value={comment} onChange={e => setComment(e.target.value)} rows={4}
          placeholder="Tell others about your experience (optional)…"
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

function Sidebar({ tab, setTab, upcomingCount, user, onLogout, isMobile, isOpen, onClose }) {
  const firstName = (user?.full_name || "there").split(" ")[0];
  const navItems = [
    { id: "overview",  label: "Overview",     Icon: LayoutDashboard, badge: null },
    { id: "bookings",  label: "My Bookings",  Icon: BookOpen,        badge: upcomingCount || null },
    { id: "history",   label: "History",      Icon: HistoryIcon,     badge: null },
    { id: "profile",   label: "My Profile",   Icon: User,            badge: null },
  ];
  const handleNav = (id) => { setTab(id); if (isMobile && onClose) onClose(); };
  return (
    <aside style={{ width: 220, backgroundColor: G, flexShrink: 0, display: "flex", flexDirection: "column", minHeight: "100vh", fontFamily: SANS, ...(isMobile ? { position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 200, transform: isOpen ? "translateX(0)" : "translateX(-220px)", transition: "transform 0.25s ease", boxShadow: isOpen ? "4px 0 20px rgba(0,0,0,0.3)" : "none" } : {}) }}>
      <div style={{ padding: "20px 20px 0" }}>
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="16" height="20" viewBox="0 0 18 22" fill="none">
            <path d="M9 2C9 2 3 5.5 3 12C3 16.5 5.5 19 9 19L9 21L13 17.5L9 14L9 16.5C7 16.5 5 15 5 12C5 7.5 9 5 9 5L9 2Z" fill="white" />
          </svg>
          <span style={{ fontFamily: SERIF, color: "white", fontWeight: 700, fontSize: "1rem" }}>Inzira Works</span>
        </Link>
      </div>

      <div style={{ padding: "20px 20px 8px", borderBottom: "1px solid rgba(255,255,255,0.1)", marginTop: 16 }}>
        <div style={{ width: 38, height: 38, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
          <User size={18} style={{ color: "white" }} />
        </div>
        <p style={{ color: "white", fontSize: "0.85rem", fontWeight: 600 }}>{firstName}</p>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.7rem" }}>Customer</p>
      </div>

      <p style={{ color: "#9ed3bf", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "16px 20px 8px" }}>MENU</p>

      <nav style={{ display: "flex", flexDirection: "column", gap: 2, padding: "0 10px" }}>
        {navItems.map(({ id, label, Icon, badge }) => (
          <button key={id} onClick={() => handleNav(id)}
            style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "space-between", width: "100%", padding: "9px 12px", borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: tab === id ? "rgba(255,255,255,0.14)" : "transparent", color: tab === id ? "white" : "rgba(255,255,255,0.65)", fontFamily: SANS, fontSize: "0.875rem", fontWeight: tab === id ? 600 : 400, textAlign: "left" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Icon size={15} /> {label}
            </span>
            {badge && <span style={{ backgroundColor: "#e05c5c", color: "white", borderRadius: 99, padding: "1px 7px", fontSize: "0.7rem", fontWeight: 700 }}>{badge}</span>}
          </button>
        ))}
      </nav>

      <div style={{ padding: "12px 10px" }}>
        <Link to="/providers"
          style={{ display: "block", textAlign: "center", backgroundColor: "#0a3d2c", color: "white", borderRadius: 8, padding: "10px 0", fontFamily: SANS, fontWeight: 600, fontSize: "0.8rem", textDecoration: "none" }}>
          Find a provider
        </Link>
      </div>

      <div style={{ flex: 1 }} />
      <div style={{ padding: "0 10px 16px" }}>
        <button onClick={onLogout}
          style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "9px 12px", borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: "transparent", color: "rgba(255,255,255,0.55)", fontFamily: SANS, fontSize: "0.825rem", fontWeight: 500 }}>
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </aside>
  );
}

function StatCard({ label, value, color, note }) {
  return (
    <div style={{ ...CARD, padding: 20 }}>
      <p style={{ color: MUTED, fontSize: "0.75rem", fontWeight: 500, marginBottom: 8 }}>{label}</p>
      <p style={{ fontFamily: SERIF, color, fontSize: "2rem", fontWeight: 700, lineHeight: 1 }}>{value}</p>
      {note && <p style={{ color: MUTED, fontSize: "0.72rem", marginTop: 6 }}>{note}</p>}
    </div>
  );
}

function Overview({ stats, upcoming, completed, onTabChange }) {
  const recent = [...upcoming, ...completed]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 4);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontFamily: SERIF, color: DARK, fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em" }}>Your dashboard</h1>
        <p style={{ color: MUTED, fontSize: "0.875rem", marginTop: 4 }}>Here's a summary of your activity on Inzira Works.</p>
      </div>

      <div className="stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <StatCard label="Total Bookings"   value={stats.total}     color={DARK}       note="all time" />
        <StatCard label="Upcoming"         value={stats.upcoming}  color={G}          note="pending + confirmed" />
        <StatCard label="Completed"        value={stats.completed} color="#3b82f6"    note="jobs done" />
        <StatCard label="Providers Tried"  value={stats.providers} color={GOLD}       note="unique providers" />
      </div>

      <div style={{ ...CARD, padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ fontFamily: SERIF, color: DARK, fontSize: "1.1rem", fontWeight: 700 }}>Recent activity</h2>
          <button onClick={() => onTabChange("bookings")} style={{ background: "none", border: "none", color: G, fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
            See all <ChevronRight size={13} />
          </button>
        </div>

        {recent.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: MUTED }}>
            <p style={{ fontSize: "0.9rem", marginBottom: 12 }}>No bookings yet.</p>
            <Link to="/providers" style={{ backgroundColor: G, color: "white", borderRadius: 8, padding: "9px 20px", fontFamily: SANS, fontWeight: 600, fontSize: "0.85rem", textDecoration: "none" }}>
              Browse providers
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {recent.map((b, i) => {
              const prov = b.provider?.full_name || "Provider";
              return (
                <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderTop: i > 0 ? "1px solid #f0ece4" : "none" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: b.status === "completed" ? G : b.status === "confirmed" ? "#3b82f6" : GOLD, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ color: DARK, fontWeight: 600, fontSize: "0.875rem" }}>{b.title}</p>
                    <p style={{ color: MUTED, fontSize: "0.75rem", marginTop: 1 }}>with {prov} · {formatDate(b.scheduled_date)}</p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {stats.total === 0 && (
        <div style={{ ...CARD, padding: 28, textAlign: "center", background: "linear-gradient(135deg, #e8f3ee, #f5f0e8)" }}>
          <p style={{ fontFamily: SERIF, color: DARK, fontSize: "1.1rem", fontWeight: 700, marginBottom: 8 }}>Ready to get started?</p>
          <p style={{ color: MUTED, fontSize: "0.875rem", marginBottom: 20 }}>Browse verified providers near you and book your first service.</p>
          <Link to="/providers" style={{ backgroundColor: G, color: "white", borderRadius: 10, padding: "11px 28px", fontFamily: SANS, fontWeight: 600, fontSize: "0.9rem", textDecoration: "none" }}>
            Browse providers
          </Link>
        </div>
      )}
    </div>
  );
}

function MyBookings({ bookings }) {
  if (bookings.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div>
          <h1 style={{ fontFamily: SERIF, color: DARK, fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em" }}>My Bookings</h1>
          <p style={{ color: MUTED, fontSize: "0.875rem", marginTop: 4 }}>Your upcoming and pending services.</p>
        </div>
        <div style={{ ...CARD, padding: 48, textAlign: "center", color: MUTED }}>
          <Calendar size={32} style={{ color: "#d4cfc5", margin: "0 auto 12px" }} />
          <p style={{ fontSize: "0.9rem", marginBottom: 12 }}>No upcoming bookings.</p>
          <Link to="/providers" style={{ color: G, fontWeight: 600, fontSize: "0.875rem" }}>Find a provider →</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontFamily: SERIF, color: DARK, fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em" }}>My Bookings</h1>
        <p style={{ color: MUTED, fontSize: "0.875rem", marginTop: 4 }}>{bookings.length} active booking{bookings.length !== 1 ? "s" : ""}.</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {bookings.map(b => {
          const prov = b.provider || {};
          const provName = prov.full_name || "Provider";
          const phone = prov.phone || null;
          const profile = Array.isArray(prov.provider_profiles) ? prov.provider_profiles[0] : prov.provider_profiles;
          const trust = Math.round(profile?.trust_score ?? 0);

          return (
            <div key={b.id} style={{ ...CARD, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", backgroundColor: "#e8f3ee", color: G, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.85rem", flexShrink: 0 }}>
                  {provName.trim().split(/\s+/).map(w => w[0]).slice(0,2).join("").toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <p style={{ color: DARK, fontWeight: 700, fontSize: "0.9rem" }}>{provName}</p>
                      {trust > 0 && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, backgroundColor: DARK, color: GOLD, borderRadius: 99, padding: "2px 8px", fontSize: "0.65rem", fontWeight: 700 }}>
                          <Shield size={9} /> {trust}
                        </span>
                      )}
                    </div>
                    <StatusBadge status={b.status} />
                  </div>
                  <p style={{ color: DARK, fontWeight: 600, fontSize: "0.875rem", marginTop: 6 }}>{b.title}</p>
                  <p style={{ color: MUTED, fontSize: "0.75rem", marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
                    <Calendar size={11} /> {formatDate(b.scheduled_date)}
                  </p>
                  <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                    <Link to={`/providers/${b.provider_id}`}
                      style={{ border: `1px solid #d4cfc5`, borderRadius: 8, padding: "7px 14px", fontFamily: SANS, fontWeight: 500, fontSize: "0.78rem", color: DARK, textDecoration: "none" }}>
                      View profile
                    </Link>
                    {phone && (
                      <button
                        onClick={() => openWhatsApp(phone, `Hi ${provName.split(" ")[0]}, I'm following up on my booking for "${b.title}" scheduled on ${formatDate(b.scheduled_date)}.`)}
                        style={{ backgroundColor: "#25D366", color: "white", border: "none", borderRadius: 8, padding: "7px 14px", fontFamily: SANS, fontWeight: 600, fontSize: "0.78rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                        <MessageCircle size={12} /> WhatsApp
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HistoryTab({ bookings, onReviewClick, onRefresh }) {
  if (bookings.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div>
          <h1 style={{ fontFamily: SERIF, color: DARK, fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em" }}>History</h1>
          <p style={{ color: MUTED, fontSize: "0.875rem", marginTop: 4 }}>Your completed services will appear here.</p>
        </div>
        <div style={{ ...CARD, padding: 48, textAlign: "center", color: MUTED }}>
          <HistoryIcon size={32} style={{ color: "#d4cfc5", margin: "0 auto 12px" }} />
          <p style={{ fontSize: "0.9rem" }}>No completed bookings yet. Once a provider marks a service as completed, it will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontFamily: SERIF, color: DARK, fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em" }}>History</h1>
        <p style={{ color: MUTED, fontSize: "0.875rem", marginTop: 4 }}>{bookings.length} completed service{bookings.length !== 1 ? "s" : ""}.</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {bookings.map(b => {
          const provName = b.provider?.full_name || "Provider";
          const hasReview = (b.reviews || []).length > 0;
          const review = hasReview ? b.reviews[0] : null;

          return (
            <div key={b.id} style={{ ...CARD, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", backgroundColor: "#f0ece4", color: MUTED, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.85rem", flexShrink: 0 }}>
                  {provName.trim().split(/\s+/).map(w => w[0]).slice(0,2).join("").toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: DARK, fontWeight: 700, fontSize: "0.9rem" }}>{provName}</p>
                  <p style={{ color: DARK, fontWeight: 600, fontSize: "0.875rem", marginTop: 2 }}>{b.title}</p>
                  <p style={{ color: MUTED, fontSize: "0.75rem", marginTop: 2, display: "flex", alignItems: "center", gap: 5 }}>
                    <Calendar size={11} /> {formatDate(b.scheduled_date)}
                  </p>
                  {hasReview && (
                    <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ display: "flex", gap: 2 }}>
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} size={12} fill={s <= review.rating ? GOLD : "none"} stroke={s <= review.rating ? GOLD : "#ccc"} />
                        ))}
                      </div>
                      {review.comment && <p style={{ color: MUTED, fontSize: "0.75rem", fontStyle: "italic" }}>"{review.comment.slice(0,60)}{review.comment.length > 60 ? "…" : ""}"</p>}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                  <span style={{ backgroundColor: "#f0ece4", color: MUTED, borderRadius: 99, padding: "3px 10px", fontSize: "0.7rem", fontWeight: 600 }}>Completed</span>
                  {!hasReview ? (
                    <button onClick={() => onReviewClick(b)}
                      style={{ backgroundColor: GOLD, color: "white", border: "none", borderRadius: 8, padding: "7px 14px", fontFamily: SANS, fontWeight: 600, fontSize: "0.78rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                      <Star size={12} fill="white" /> Leave review
                    </button>
                  ) : (
                    <span style={{ color: G, fontSize: "0.75rem", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                      <CheckCircle size={12} /> Reviewed
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProfileTab({ user }) {
  const [form, setForm] = useState({ full_name: "", phone: "", district: "" });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [msg,     setMsg]     = useState("");

  useEffect(() => {
    if (!user?.id) return;
    supabase.from("users").select("full_name, phone, district").eq("id", user.id).single()
      .then(({ data }) => {
        if (data) setForm({ full_name: data.full_name || "", phone: data.phone || "", district: data.district || "" });
        setLoading(false);
      });
  }, [user?.id]);

  const handleSave = async () => {
    setSaving(true); setMsg("");
    const { error } = await supabase.from("users")
      .update({ full_name: form.full_name, phone: form.phone, district: form.district })
      .eq("id", user.id);
    setSaving(false);
    setMsg(error ? "Could not save. Please try again." : "Saved!");
    setTimeout(() => setMsg(""), 3000);
  };

  const inp = { width: "100%", padding: "10px 14px", border: "1px solid #e8e2d8", borderRadius: 10, fontFamily: SANS, fontSize: "0.875rem", color: DARK, outline: "none", boxSizing: "border-box" };
  const lbl = { color: MUTED, fontSize: "0.75rem", fontWeight: 500, display: "block", marginBottom: 6 };

  if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><Loader2 size={24} style={{ color: G, animation: "spin 1s linear infinite" }} /></div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontFamily: SERIF, color: DARK, fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em" }}>My Profile</h1>
        <p style={{ color: MUTED, fontSize: "0.875rem", marginTop: 4 }}>Update your personal information.</p>
      </div>

      <div style={{ ...CARD, padding: 28, maxWidth: 520 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label style={lbl}>Full name</label>
            <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} style={inp} placeholder="Your full name" />
          </div>
          <div>
            <label style={lbl}>Email address</label>
            <input value={user?.email || ""} disabled style={{ ...inp, backgroundColor: "#f8f5f0", color: MUTED, cursor: "not-allowed" }} />
            <p style={{ color: MUTED, fontSize: "0.7rem", marginTop: 4 }}>Email cannot be changed here.</p>
          </div>
          <div>
            <label style={lbl}>Phone number</label>
            <div style={{ display: "flex", borderRadius: 10, border: "1px solid #e8e2d8", overflow: "hidden" }}>
              <span style={{ padding: "10px 12px", backgroundColor: "#f8f5f0", color: MUTED, fontSize: "0.875rem", fontWeight: 600, borderRight: "1px solid #e8e2d8", whiteSpace: "nowrap", display: "flex", alignItems: "center" }}>+250</span>
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} style={{ flex: 1, padding: "10px 14px", border: "none", outline: "none", fontSize: "0.875rem", color: DARK, fontFamily: SANS }} placeholder="7XX XXX XXX" />
            </div>
          </div>
          <div>
            <label style={lbl}>District</label>
            <select value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))} style={inp}>
              <option value="">Select your district</option>
              {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 4 }}>
            <button onClick={handleSave} disabled={saving}
              style={{ backgroundColor: saving ? "#3d8a6e" : G, color: "white", border: "none", borderRadius: 10, padding: "10px 24px", fontFamily: SANS, fontWeight: 600, fontSize: "0.875rem", cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8 }}>
              {saving && <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />}
              {saving ? "Saving…" : <><Save size={14} /> Save changes</>}
            </button>
            {msg && <span style={{ color: msg === "Saved!" ? G : "#e05c5c", fontSize: "0.82rem", fontWeight: 500 }}>{msg}</span>}
          </div>
        </div>
      </div>

      <div style={{ ...CARD, padding: 20, maxWidth: 520 }}>
        <p style={{ color: DARK, fontWeight: 600, fontSize: "0.875rem", marginBottom: 4 }}>Account details</p>
        <p style={{ color: MUTED, fontSize: "0.78rem" }}>Joined: {user?.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—"}</p>
        <p style={{ color: MUTED, fontSize: "0.78rem", marginTop: 4 }}>Role: Customer</p>
      </div>
    </div>
  );
}

export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => { await logout(); navigate("/"); };

  const [tab,         setTab]         = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile,    setIsMobile]    = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const check = () => { const m = window.innerWidth < 768; setIsMobile(m); if (!m) setSidebarOpen(false); };
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  const [stats,     setStats]     = useState({ total: 0, upcoming: 0, completed: 0, providers: 0 });
  const [upcoming,  setUpcoming]  = useState([]);
  const [completed, setCompleted] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [reviewing, setReviewing] = useState(null);

  const BOOKING_FIELDS = `
    id, title, status, scheduled_date, created_at, provider_id,
    provider:users!provider_id(full_name, phone, provider_profiles(trust_score))
  `;

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [allRes, upRes, compRes] = await Promise.all([
        supabase.from("bookings").select("id, status, provider_id").eq("customer_id", user.id),
        supabase.from("bookings")
          .select(BOOKING_FIELDS)
          .eq("customer_id", user.id)
          .in("status", ["pending", "confirmed"])
          .order("scheduled_date", { ascending: true }),
        supabase.from("bookings")
          .select(BOOKING_FIELDS + ", reviews(id, rating, comment)")
          .eq("customer_id", user.id)
          .eq("status", "completed")
          .order("updated_at", { ascending: false }),
      ]);

      const all = allRes.data || [];
      setStats({
        total:     all.length,
        upcoming:  all.filter(b => ["pending","confirmed"].includes(b.status)).length,
        completed: all.filter(b => b.status === "completed").length,
        providers: new Set(all.map(b => b.provider_id).filter(Boolean)).size,
      });
      setUpcoming(upRes.data   || []);
      setCompleted(compRes.data || []);
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

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: SANS, backgroundColor: CREAM }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @media(max-width:640px){.stat-grid{grid-template-columns:repeat(2,1fr)!important}}`}</style>

      {isMobile && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 56, backgroundColor: G, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", zIndex: 100, boxSizing: "border-box" }}>
          <button onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "white", padding: 4, display: "flex" }}>
            <Menu size={22} />
          </button>
          <span style={{ fontFamily: "Spectral, serif", color: "white", fontWeight: 700, fontSize: "1rem" }}>Inzira Works</span>
          <div style={{ width: 30 }} />
        </div>
      )}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 150 }} />
      )}

      <Sidebar tab={tab} setTab={setTab} upcomingCount={upcoming.length} user={user} onLogout={handleLogout} isMobile={isMobile} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main style={{ flex: 1, padding: isMobile ? "72px 16px 24px" : 32, overflowY: "auto" }}>
        {tab === "overview"  && <Overview stats={stats} upcoming={upcoming} completed={completed} onTabChange={setTab} />}
        {tab === "bookings"  && <MyBookings bookings={upcoming} />}
        {tab === "history"   && <HistoryTab bookings={completed} onReviewClick={setReviewing} onRefresh={loadData} />}
        {tab === "profile"   && <ProfileTab user={user} />}
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
