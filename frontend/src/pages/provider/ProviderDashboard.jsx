import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import {
  Shield, CheckCircle, Banknote, MessageCircle,
  Calendar, MapPin, Image as ImageIcon, ExternalLink, Loader2,
} from "lucide-react";

// ── Tokens ────────────────────────────────────────────────────────────────────
const G      = "#0E5C46";
const CREAM  = "#ede9e0";
const DARK   = "#172420";
const GOLD   = "#b98a22";
const MUTED  = "#5c7068";
const SERIF  = "Spectral, serif";
const SANS   = "'Hanken Grotesk', sans-serif";
const CARD   = { backgroundColor: "white", borderRadius: 14, border: "1px solid #e8e2d8" };

// ── Helpers ───────────────────────────────────────────────────────────────────
function initialsFrom(name = "") {
  return name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });
}

function timeAgo(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ── Shared primitives ─────────────────────────────────────────────────────────
function InitialsCircle({ name = "", size = 36 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", backgroundColor: "#e8f3ee", color: G, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: size * 0.33, flexShrink: 0 }}>
      {initialsFrom(name)}
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ tab, setTab, user, profile, pendingCount }) {
  const firstName = (user?.fullName || "Provider").split(" ")[0];
  const navItems = [
    { id: "overview",  label: "Overview"   },
    { id: "bookings",  label: "Bookings",  badge: pendingCount || null },
    { id: "profile",   label: "My profile" },
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
        PROVIDER
      </p>

      <nav style={{ display: "flex", flexDirection: "column", gap: 2, padding: "0 10px" }}>
        {navItems.map(({ id, label, badge }) => (
          <button key={id} onClick={() => setTab(id)}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "9px 12px", borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: tab === id ? "rgba(255,255,255,0.14)" : "transparent", color: tab === id ? "white" : "rgba(255,255,255,0.65)", fontFamily: SANS, fontSize: "0.875rem", fontWeight: tab === id ? 600 : 400, textAlign: "left" }}>
            {label}
            {badge && <span style={{ backgroundColor: "#e05c5c", color: "white", borderRadius: 99, padding: "1px 7px", fontSize: "0.7rem", fontWeight: 700 }}>{badge}</span>}
          </button>
        ))}
      </nav>

      <div style={{ flex: 1 }} />

      <div style={{ padding: 16, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 10, marginBottom: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", border: "1.5px dashed rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <ImageIcon size={14} style={{ color: "rgba(255,255,255,0.4)" }} />
          </div>
          <div>
            <p style={{ color: "white", fontSize: "0.8rem", fontWeight: 600 }}>{firstName}</p>
            {profile && <p style={{ color: GOLD, fontSize: "0.7rem", fontWeight: 500 }}>Trust {Math.round(profile.trust_score ?? 0)}</p>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["Customer", "Admin"].map((role) => (
            <Link key={role} to={role === "Customer" ? "/customer/dashboard" : "/admin/dashboard"}
              style={{ flex: 1, textAlign: "center", padding: "5px 0", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 6, color: "rgba(255,255,255,0.7)", fontSize: "0.72rem", textDecoration: "none" }}>
              {role}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}

// ── Overview tab ──────────────────────────────────────────────────────────────
function Overview({ user, profile, pending, onAccept, onDecline, statsLoading }) {
  const firstName = (user?.fullName || "Provider").split(" ")[0];
  const trustScore = Math.round(profile?.trust_score ?? 0);
  const responseRate = Math.round(profile?.response_rate ?? 0);
  const jobsThisMonth = profile?.jobs_this_month ?? 0;
  const earnedThisMonth = profile?.earned_this_month ?? 0;

  const stats = [
    { Icon: Shield,        color: GOLD,      label: "Trust Score", value: `${trustScore} / 100`, note: profile?.verification_status === "verified" ? "Verified" : "Pending verification", noteGreen: profile?.verification_status === "verified" },
    { Icon: CheckCircle,   color: G,         label: "Jobs done",   value: jobsThisMonth,          note: "this month",       noteGreen: false },
    { Icon: Banknote,      color: "#e05c5c", label: "Earned",      value: earnedThisMonth > 0 ? earnedThisMonth.toLocaleString() : "—", note: "RWF · this month", noteGreen: false },
    { Icon: MessageCircle, color: MUTED,     label: "Response",    value: `${responseRate}%`,     note: responseRate >= 80 ? "Excellent" : "Keep improving", noteGreen: responseRate >= 80 },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontFamily: SERIF, color: DARK, fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
          Muraho, {firstName} 👋
        </h1>
        <p style={{ color: MUTED, fontSize: "0.875rem", marginTop: 4 }}>Here's how your business is doing this month.</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {stats.map(({ Icon, color, label, value, note, noteGreen }) => (
          <div key={label} style={{ ...CARD, padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Icon size={16} style={{ color }} />
              <span style={{ color: MUTED, fontSize: "0.75rem", fontWeight: 500 }}>{label}</span>
            </div>
            {statsLoading
              ? <div style={{ height: 28, backgroundColor: "#f0ece4", borderRadius: 6, marginBottom: 8 }} />
              : <p style={{ fontFamily: SERIF, color: DARK, fontSize: "1.5rem", fontWeight: 700, lineHeight: 1 }}>{value}</p>
            }
            <p style={{ color: noteGreen ? G : MUTED, fontSize: "0.72rem", marginTop: 6 }}>{note}</p>
          </div>
        ))}
      </div>

      {/* Booking requests */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <h2 style={{ fontFamily: SERIF, color: DARK, fontSize: "1.125rem", fontWeight: 700 }}>New booking requests</h2>
          {pending.length > 0 && (
            <span style={{ backgroundColor: "#fee2e2", color: "#e05c5c", borderRadius: 99, padding: "3px 10px", fontSize: "0.72rem", fontWeight: 600 }}>
              {pending.length} pending
            </span>
          )}
        </div>

        {pending.length === 0 ? (
          <div style={{ ...CARD, padding: 32, textAlign: "center", color: MUTED, fontSize: "0.875rem" }}>
            No pending requests right now.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {pending.map((b) => (
              <div key={b.id} style={{ ...CARD, padding: 18 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <InitialsCircle name={b.customer_name} size={38} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <p style={{ color: DARK, fontWeight: 700, fontSize: "0.9rem" }}>{b.customer_name}</p>
                      <span style={{ color: MUTED, fontSize: "0.72rem" }}>{timeAgo(b.created_at)}</span>
                    </div>
                    <p style={{ color: DARK, fontSize: "0.875rem", fontWeight: 600, marginTop: 2 }}>{b.title}</p>
                    <p style={{ color: MUTED, fontSize: "0.75rem", marginTop: 4, display: "flex", alignItems: "center", gap: 8 }}>
                      <Calendar size={11} /> {formatDate(b.scheduled_date)}
                    </p>
                    {b.notes && (
                      <p style={{ backgroundColor: "#f5f2ea", borderRadius: 8, padding: "8px 12px", marginTop: 10, color: MUTED, fontSize: "0.8rem", fontStyle: "italic" }}>
                        "{b.notes.replace(/^Preferred time:[^\n]*\n?/, "").trim() || b.notes}"
                      </p>
                    )}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => onAccept(b.id)} style={{ backgroundColor: G, color: "white", border: "none", borderRadius: 8, padding: "8px 20px", fontFamily: SANS, fontWeight: 600, fontSize: "0.8rem", cursor: "pointer" }}>
                          Accept
                        </button>
                        <button onClick={() => onDecline(b.id)} style={{ backgroundColor: "white", color: DARK, border: "1px solid #e8e2d8", borderRadius: 8, padding: "8px 20px", fontFamily: SANS, fontWeight: 500, fontSize: "0.8rem", cursor: "pointer" }}>
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
        )}
      </div>
    </div>
  );
}

// ── Bookings tab ──────────────────────────────────────────────────────────────
function Bookings({ pending, confirmed, onAccept, onDecline }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontFamily: SERIF, color: DARK, fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em" }}>Bookings</h1>
        <p style={{ color: MUTED, fontSize: "0.875rem", marginTop: 4 }}>Manage incoming requests and confirmed jobs.</p>
      </div>

      {/* Pending */}
      <div style={{ ...CARD, padding: 20 }}>
        <h2 style={{ color: DARK, fontSize: "0.95rem", fontWeight: 700, marginBottom: pending.length ? 16 : 0 }}>
          Pending requests · {pending.length}
        </h2>
        {pending.length === 0 ? (
          <p style={{ color: MUTED, fontSize: "0.82rem", marginTop: 8 }}>No pending requests.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {pending.map((b, i) => (
              <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderTop: i > 0 ? "1px solid #f0ece4" : "none" }}>
                <InitialsCircle name={b.customer_name} size={34} />
                <div style={{ flex: 1 }}>
                  <p style={{ color: DARK, fontWeight: 600, fontSize: "0.875rem" }}>{b.title}</p>
                  <p style={{ color: MUTED, fontSize: "0.75rem", marginTop: 2 }}>{b.customer_name} · {formatDate(b.scheduled_date)}</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => onAccept(b.id)} style={{ backgroundColor: G, color: "white", border: "none", borderRadius: 8, padding: "7px 18px", fontFamily: SANS, fontWeight: 600, fontSize: "0.8rem", cursor: "pointer" }}>Accept</button>
                  <button onClick={() => onDecline(b.id)} style={{ backgroundColor: "white", color: DARK, border: "1px solid #e8e2d8", borderRadius: 8, padding: "7px 18px", fontFamily: SANS, fontWeight: 500, fontSize: "0.8rem", cursor: "pointer" }}>Decline</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmed */}
      <div style={{ ...CARD, padding: 20 }}>
        <h2 style={{ color: DARK, fontSize: "0.95rem", fontWeight: 700, marginBottom: confirmed.length ? 16 : 0 }}>Confirmed jobs</h2>
        {confirmed.length === 0 ? (
          <p style={{ color: MUTED, fontSize: "0.82rem", marginTop: 8 }}>No confirmed jobs yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {confirmed.map((b, i) => (
              <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderTop: i > 0 ? "1px solid #f0ece4" : "none" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: G, flexShrink: 0, marginLeft: 4 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ color: DARK, fontWeight: 600, fontSize: "0.875rem" }}>{b.title}</p>
                  <p style={{ color: MUTED, fontSize: "0.75rem", marginTop: 1 }}>for {b.customer_name}</p>
                </div>
                <span style={{ color: MUTED, fontSize: "0.75rem" }}>{formatDate(b.scheduled_date)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── My profile tab ────────────────────────────────────────────────────────────
function MyProfile({ user, profile, onSave }) {
  const [form, setForm] = useState({
    business: profile?.headline || "",
    about:    profile?.bio      || "",
    district: profile?.district || "",
  });
  const [saving,  setSaving]  = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // Specialties
  const [specialties, setSpecialties] = useState([]);
  const [tagInput,    setTagInput]    = useState("");

  // Services
  const [services,     setServices]     = useState([]);
  const [showSvcForm,  setShowSvcForm]  = useState(false);
  const [svcForm,      setSvcForm]      = useState({ title: "", price: "", price_type: "fixed" });
  const [svcSaving,    setSvcSaving]    = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({ business: profile.headline || "", about: profile.bio || "", district: profile.district || "" });
      loadExtras();
    }
  }, [profile]);

  const loadExtras = async () => {
    if (!profile?.id) return;
    const [specRes, svcRes] = await Promise.all([
      supabase.from("provider_specialties").select("id, label").eq("provider_id", profile.id),
      supabase.from("services").select("id, title, price, price_type").eq("provider_id", profile.id).eq("is_active", true).order("created_at"),
    ]);
    setSpecialties(specRes.data || []);
    setServices(svcRes.data   || []);
  };

  const handleSave = async () => {
    setSaving(true); setSaveMsg("");
    try {
      const { error } = await supabase.from("provider_profiles")
        .update({ headline: form.business, bio: form.about, district: form.district })
        .eq("user_id", user.id);
      if (error) throw error;
      setSaveMsg("Saved!");
      if (onSave) onSave({ ...profile, headline: form.business, bio: form.about, district: form.district });
    } catch { setSaveMsg("Could not save. Please try again."); }
    finally { setSaving(false); setTimeout(() => setSaveMsg(""), 3000); }
  };

  const addTag = async () => {
    const label = tagInput.trim();
    if (!label || !profile?.id) return;
    const { data, error } = await supabase.from("provider_specialties").insert({ provider_id: profile.id, label }).select("id, label").single();
    if (!error && data) { setSpecialties(s => [...s, data]); setTagInput(""); }
  };

  const removeTag = async (id) => {
    await supabase.from("provider_specialties").delete().eq("id", id);
    setSpecialties(s => s.filter(t => t.id !== id));
  };

  const addService = async () => {
    if (!svcForm.title.trim() || !profile?.id) return;
    setSvcSaving(true);
    const { data, error } = await supabase.from("services").insert({
      provider_id: profile.id,
      title:       svcForm.title.trim(),
      price:       svcForm.price ? Number(svcForm.price) : null,
      price_type:  svcForm.price_type,
    }).select("id, title, price, price_type").single();
    setSvcSaving(false);
    if (!error && data) {
      setServices(s => [...s, data]);
      setSvcForm({ title: "", price: "", price_type: "fixed" });
      setShowSvcForm(false);
    }
  };

  const removeService = async (id) => {
    await supabase.from("services").update({ is_active: false }).eq("id", id);
    setServices(s => s.filter(sv => sv.id !== id));
  };

  const completeness = profile?.profile_completeness ?? 0;

  const inputStyle = { width: "100%", padding: "10px 14px", border: "1px solid #e8e2d8", borderRadius: 10, fontFamily: SANS, fontSize: "0.875rem", color: DARK, outline: "none", boxSizing: "border-box", backgroundColor: "white" };
  const labelStyle = { color: MUTED, fontSize: "0.75rem", fontWeight: 500, display: "block", marginBottom: 6 };
  const sectionDiv = { borderTop: "1px solid #f0ece4", paddingTop: 20, marginTop: 4 };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontFamily: SERIF, color: DARK, fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em" }}>My profile</h1>
          <p style={{ color: MUTED, fontSize: "0.875rem", marginTop: 4 }}>This is what customers see. Keep it complete to rank higher.</p>
        </div>
        <Link to={`/providers/${profile?.id || ""}`} style={{ border: "1px solid #d4cfc5", backgroundColor: "white", borderRadius: 8, padding: "8px 16px", fontFamily: SANS, fontSize: "0.8rem", fontWeight: 500, color: DARK, textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
          <ExternalLink size={13} /> Preview public page
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16 }}>
        {/* ── Left column ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Basic info */}
          <div style={{ ...CARD, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", border: "1.5px dashed #c8c0b0", backgroundColor: "#f5f0e8", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, flexShrink: 0 }}>
                <ImageIcon size={14} style={{ color: "#c8c0b0" }} />
                <span style={{ color: "#c8c0b0", fontSize: "0.55rem" }}>Photo</span>
              </div>
              <div>
                <p style={{ color: DARK, fontWeight: 700, fontSize: "0.95rem" }}>{user?.fullName || "Your name"}</p>
                <p style={{ color: MUTED, fontSize: "0.78rem", marginTop: 1 }}>{form.business || "Headline"}</p>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={labelStyle}>Headline</label>
                <input value={form.business} onChange={e => setForm(f => ({ ...f, business: e.target.value }))}
                  placeholder="e.g. Tailor & Fashion Designer" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>About</label>
                <textarea value={form.about} onChange={e => setForm(f => ({ ...f, about: e.target.value }))} rows={4}
                  placeholder="Tell customers about your skills and experience…"
                  style={{ ...inputStyle, resize: "vertical" }} />
              </div>
              <div>
                <label style={labelStyle}>District</label>
                <select value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))} style={inputStyle}>
                  <option value="">Select district</option>
                  {["Gasabo", "Kicukiro", "Nyarugenge"].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button onClick={handleSave} disabled={saving}
                  style={{ backgroundColor: saving ? "#3d8a6e" : G, color: "white", border: "none", borderRadius: 10, padding: "10px 22px", fontFamily: SANS, fontWeight: 600, fontSize: "0.875rem", cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                  {saving && <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />}
                  {saving ? "Saving…" : "Save changes"}
                </button>
                {saveMsg && <span style={{ color: saveMsg === "Saved!" ? G : "#e05c5c", fontSize: "0.8rem" }}>{saveMsg}</span>}
              </div>
            </div>
          </div>

          {/* Specialties */}
          <div style={{ ...CARD, padding: 20 }}>
            <p style={{ color: DARK, fontSize: "0.875rem", fontWeight: 700, marginBottom: 12 }}>Skills & specialties</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
              {specialties.map((t) => (
                <span key={t.id} style={{ backgroundColor: "#e8f3ee", color: G, borderRadius: 99, padding: "5px 12px", fontSize: "0.78rem", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                  {t.label}
                  <button onClick={() => removeTag(t.id)} style={{ background: "none", border: "none", cursor: "pointer", color: G, padding: 0, lineHeight: 1, fontSize: "0.9rem" }}>×</button>
                </span>
              ))}
              {specialties.length === 0 && <p style={{ color: MUTED, fontSize: "0.8rem" }}>No specialties yet.</p>}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())}
                placeholder="e.g. Wedding dresses, Agaseke…"
                style={{ ...inputStyle, flex: 1, padding: "8px 12px" }}
              />
              <button onClick={addTag} style={{ backgroundColor: G, color: "white", border: "none", borderRadius: 10, padding: "8px 16px", fontFamily: SANS, fontWeight: 600, fontSize: "0.8rem", cursor: "pointer", flexShrink: 0 }}>
                Add
              </button>
            </div>
          </div>

          {/* Services */}
          <div style={{ ...CARD, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <p style={{ color: DARK, fontSize: "0.875rem", fontWeight: 700 }}>Services offered</p>
              <button onClick={() => setShowSvcForm(v => !v)}
                style={{ backgroundColor: showSvcForm ? "#f0ece4" : G, color: showSvcForm ? DARK : "white", border: "none", borderRadius: 8, padding: "6px 14px", fontFamily: SANS, fontWeight: 600, fontSize: "0.78rem", cursor: "pointer" }}>
                {showSvcForm ? "Cancel" : "+ Add service"}
              </button>
            </div>

            {showSvcForm && (
              <div style={{ backgroundColor: "#faf8f4", borderRadius: 10, padding: 16, marginBottom: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                <input value={svcForm.title} onChange={e => setSvcForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Service title (e.g. Custom dress alteration)"
                  style={{ ...inputStyle, padding: "9px 12px" }} />
                <div style={{ display: "flex", gap: 8 }}>
                  <input value={svcForm.price} onChange={e => setSvcForm(f => ({ ...f, price: e.target.value }))}
                    placeholder="Price (RWF, optional)" type="number" min="0"
                    style={{ ...inputStyle, flex: 1, padding: "9px 12px" }} />
                  <select value={svcForm.price_type} onChange={e => setSvcForm(f => ({ ...f, price_type: e.target.value }))}
                    style={{ ...inputStyle, width: 130, padding: "9px 12px" }}>
                    <option value="fixed">Fixed</option>
                    <option value="starting">Starting at</option>
                    <option value="hourly">Per hour</option>
                  </select>
                </div>
                <button onClick={addService} disabled={svcSaving || !svcForm.title.trim()}
                  style={{ backgroundColor: G, color: "white", border: "none", borderRadius: 8, padding: "9px 0", fontFamily: SANS, fontWeight: 600, fontSize: "0.82rem", cursor: svcSaving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  {svcSaving && <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />}
                  {svcSaving ? "Adding…" : "Add service"}
                </button>
              </div>
            )}

            {services.length === 0 ? (
              <p style={{ color: MUTED, fontSize: "0.8rem" }}>No services yet. Add one so customers can book you.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {services.map((sv, i) => (
                  <div key={sv.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderTop: i > 0 ? "1px solid #f0ece4" : "none" }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: DARK, fontSize: "0.85rem", fontWeight: 600 }}>{sv.title}</p>
                      {sv.price != null && (
                        <p style={{ color: MUTED, fontSize: "0.75rem", marginTop: 2 }}>
                          {sv.price_type === "starting" ? "From " : ""}{Number(sv.price).toLocaleString()} RWF{sv.price_type === "hourly" ? "/hr" : ""}
                        </p>
                      )}
                    </div>
                    <button onClick={() => removeService(sv.id)}
                      style={{ background: "none", border: "1px solid #e8e2d8", borderRadius: 6, padding: "4px 10px", color: "#e05c5c", fontFamily: SANS, fontSize: "0.72rem", cursor: "pointer" }}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* ── Right column ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ ...CARD, padding: 18 }}>
            <p style={{ color: DARK, fontSize: "0.8rem", fontWeight: 600, marginBottom: 12 }}>Profile completeness</p>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{ flex: 1, height: 6, backgroundColor: "#e8e2d8", borderRadius: 99 }}>
                <div style={{ width: `${completeness}%`, height: "100%", backgroundColor: G, borderRadius: 99 }} />
              </div>
              <span style={{ color: G, fontSize: "0.8rem", fontWeight: 700 }}>{Math.round(completeness)}%</span>
            </div>
            <p style={{ color: MUTED, fontSize: "0.72rem" }}>Complete profiles rank higher in search.</p>
          </div>

          <div style={{ ...CARD, padding: 18 }}>
            <p style={{ color: DARK, fontSize: "0.8rem", fontWeight: 600, marginBottom: 12 }}>Portfolio</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[1, 2, 3, 4].map(n => (
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
  const [tab,       setTab]       = useState("overview");
  const [profile,   setProfile]   = useState(null);
  const [pending,   setPending]   = useState([]);
  const [confirmed, setConfirmed] = useState([]);
  const [loading,   setLoading]   = useState(true);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Provider profile with derived stats
      const startOfMonth = new Date();
      startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);

      const [profileRes, pendingRes, confirmedRes, jobsRes, earnedRes] = await Promise.all([
        supabase.from("provider_profiles")
          .select("id, headline, bio, district, trust_score, response_rate, verification_status, profile_completeness")
          .eq("user_id", user.id)
          .single(),

        supabase.from("bookings")
          .select("id, title, scheduled_date, notes, created_at, customer:users!customer_id(full_name)")
          .eq("provider_id", user.id)
          .eq("status", "pending")
          .order("created_at", { ascending: false }),

        supabase.from("bookings")
          .select("id, title, scheduled_date, customer:users!customer_id(full_name)")
          .eq("provider_id", user.id)
          .eq("status", "confirmed")
          .order("scheduled_date", { ascending: true }),

        supabase.from("bookings")
          .select("id", { count: "exact", head: true })
          .eq("provider_id", user.id)
          .eq("status", "completed")
          .gte("updated_at", startOfMonth.toISOString()),

        supabase.from("bookings")
          .select("amount")
          .eq("provider_id", user.id)
          .eq("status", "completed")
          .gte("updated_at", startOfMonth.toISOString())
          .not("amount", "is", null),
      ]);

      if (profileRes.data) {
        const earnedTotal = (earnedRes.data || []).reduce((s, b) => s + Number(b.amount || 0), 0);
        setProfile({
          ...profileRes.data,
          jobs_this_month:   jobsRes.count  || 0,
          earned_this_month: earnedTotal,
        });
      }

      const mapBooking = (b) => ({ ...b, customer_name: b.customer?.full_name || "Customer" });
      setPending((pendingRes.data  || []).map(mapBooking));
      setConfirmed((confirmedRes.data || []).map(mapBooking));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAccept = async (bookingId) => {
    await supabase.from("bookings").update({ status: "confirmed", responded_at: new Date().toISOString() }).eq("id", bookingId);
    await loadData();
  };

  const handleDecline = async (bookingId) => {
    await supabase.from("bookings").update({ status: "rejected", responded_at: new Date().toISOString() }).eq("id", bookingId);
    await loadData();
  };

  if (loading && !profile) {
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
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <Sidebar tab={tab} setTab={setTab} user={user} profile={profile} pendingCount={pending.length} />
      <main style={{ flex: 1, padding: 32, overflowY: "auto" }}>
        {tab === "overview" && <Overview user={user} profile={profile} pending={pending} onAccept={handleAccept} onDecline={handleDecline} statsLoading={loading} />}
        {tab === "bookings" && <Bookings pending={pending} confirmed={confirmed} onAccept={handleAccept} onDecline={handleDecline} />}
        {tab === "profile"  && <MyProfile user={user} profile={profile} onSave={setProfile} />}
      </main>
    </div>
  );
}
