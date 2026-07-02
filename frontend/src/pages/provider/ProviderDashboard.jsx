import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import {
  Shield, CheckCircle, Banknote, MessageCircle,
  Calendar, MapPin, Image as ImageIcon, ExternalLink, Loader2, LogOut, Menu,
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
function Sidebar({ tab, setTab, user, profile, pendingCount, onLogout, isMobile, isOpen, onClose }) {
  const firstName = (user?.full_name || "Provider").split(" ")[0];
  const navItems = [
    { id: "overview",  label: "Overview",     badge: null },
    { id: "bookings",  label: "Bookings",     badge: pendingCount || null },
    { id: "history",   label: "History",      badge: null },
    { id: "reviews",   label: "Reviews",      badge: null },
    { id: "portfolio", label: "Portfolio",    badge: null },
    { id: "profile",   label: "My Profile",   badge: null },
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

      <p style={{ color: "#9ed3bf", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "24px 20px 8px" }}>
        PROVIDER
      </p>

      <nav style={{ display: "flex", flexDirection: "column", gap: 2, padding: "0 10px" }}>
        {navItems.map(({ id, label, badge }) => (
          <button key={id} onClick={() => handleNav(id)}
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
        <button onClick={onLogout}
          style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "9px 12px", borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: "transparent", color: "rgba(255,255,255,0.55)", fontFamily: SANS, fontSize: "0.825rem", fontWeight: 500, marginTop: 4 }}
          className="hover:bg-white/10 transition-colors">
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </aside>
  );
}

// ── Overview tab ──────────────────────────────────────────────────────────────
function Overview({ user, profile, pending, onAccept, onDecline, statsLoading }) {
  const firstName = (user?.full_name || "Provider").split(" ")[0];
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
          Welcome back, {firstName}
        </h1>
        <p style={{ color: MUTED, fontSize: "0.875rem", marginTop: 4 }}>Here's how your business is doing this month.</p>
      </div>

      {/* Stat cards */}
      <div className="stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
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
function Bookings({ pending, confirmed, onAccept, onDecline, onComplete }) {
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
                  <p style={{ color: MUTED, fontSize: "0.75rem", marginTop: 1 }}>for {b.customer_name} · {formatDate(b.scheduled_date)}</p>
                </div>
                <button onClick={() => onComplete(b.id)}
                  style={{ backgroundColor: "white", color: G, border: `1px solid ${G}`, borderRadius: 8, padding: "6px 14px", fontFamily: SANS, fontWeight: 600, fontSize: "0.75rem", cursor: "pointer", flexShrink: 0 }}>
                  Mark completed
                </button>
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

  // Photo upload
  const fileRef    = useRef(null);
  const [avatarUrl,      setAvatarUrl]      = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoErr,       setPhotoErr]       = useState("");

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

  // Load avatar from users table
  useEffect(() => {
    if (!user?.id) return;
    supabase.from("users").select("avatar_url").eq("id", user.id).single()
      .then(({ data }) => { if (data?.avatar_url) setAvatarUrl(data.avatar_url); });
  }, [user?.id]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    setPhotoUploading(true); setPhotoErr("");
    try {
      const ext  = file.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = urlData.publicUrl;
      await supabase.from("users").update({ avatar_url: publicUrl }).eq("id", user.id);
      setAvatarUrl(publicUrl);
    } catch {
      setPhotoErr("Upload failed. Check bucket permissions.");
    } finally {
      setPhotoUploading(false);
    }
  };

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
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoUpload} />
              <div onClick={() => fileRef.current?.click()} title="Click to upload photo"
                style={{ width: 56, height: 56, borderRadius: "50%", border: avatarUrl ? `2px solid ${G}` : "1.5px dashed #c8c0b0", backgroundColor: "#f5f0e8", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, flexShrink: 0, cursor: "pointer", overflow: "hidden" }}>
                {photoUploading ? (
                  <Loader2 size={18} style={{ color: G, animation: "spin 1s linear infinite" }} />
                ) : avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <>
                    <ImageIcon size={14} style={{ color: "#c8c0b0" }} />
                    <span style={{ color: "#c8c0b0", fontSize: "0.55rem" }}>Photo</span>
                  </>
                )}
              </div>
              <div>
                <p style={{ color: DARK, fontWeight: 700, fontSize: "0.95rem" }}>{user?.full_name || "Your name"}</p>
                <p style={{ color: MUTED, fontSize: "0.78rem", marginTop: 1 }}>{form.business || "Headline"}</p>
                {photoErr && <p style={{ color: "#e05c5c", fontSize: "0.7rem", marginTop: 2 }}>{photoErr}</p>}
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

// ── History tab ───────────────────────────────────────────────────────────────
function HistoryTab({ userId }) {
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!userId) return;
    supabase.from("bookings")
      .select("id, title, scheduled_date, updated_at, customer:users!customer_id(full_name)")
      .eq("provider_id", userId)
      .eq("status", "completed")
      .order("updated_at", { ascending: false })
      .then(({ data }) => { setBookings(data || []); setLoading(false); });
  }, [userId]);

  if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><Loader2 size={24} style={{ color: G, animation: "spin 1s linear infinite" }} /></div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontFamily: SERIF, color: DARK, fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em" }}>Completed Jobs</h1>
        <p style={{ color: MUTED, fontSize: "0.875rem", marginTop: 4 }}>{bookings.length} job{bookings.length !== 1 ? "s" : ""} completed in total.</p>
      </div>

      {bookings.length === 0 ? (
        <div style={{ ...CARD, padding: 48, textAlign: "center", color: MUTED, fontSize: "0.9rem" }}>
          No completed jobs yet. Accept bookings and mark them as completed to see them here.
        </div>
      ) : (
        <div style={{ ...CARD, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 180px 160px", padding: "12px 20px", borderBottom: "1px solid #f0ece4", backgroundColor: "#faf8f4" }}>
            {["SERVICE", "CUSTOMER", "COMPLETED ON"].map(col => (
              <span key={col} style={{ color: MUTED, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em" }}>{col}</span>
            ))}
          </div>
          {bookings.map((b, i) => (
            <div key={b.id} style={{ display: "grid", gridTemplateColumns: "1fr 180px 160px", padding: "14px 20px", borderTop: i > 0 ? "1px solid #f0ece4" : "none", alignItems: "center" }}>
              <div>
                <p style={{ color: DARK, fontWeight: 600, fontSize: "0.875rem" }}>{b.title}</p>
                <p style={{ color: MUTED, fontSize: "0.75rem", marginTop: 1 }}>
                  <Calendar size={10} style={{ display: "inline", marginRight: 4 }} />{formatDate(b.scheduled_date)}
                </p>
              </div>
              <p style={{ color: DARK, fontSize: "0.82rem" }}>{b.customer?.full_name || "—"}</p>
              <p style={{ color: MUTED, fontSize: "0.78rem" }}>{formatDate(b.updated_at)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Reviews tab ───────────────────────────────────────────────────────────────
function ReviewsTab({ userId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [avgRating, setAvgRating] = useState(0);

  useEffect(() => {
    if (!userId) return;
    supabase.from("reviews")
      .select("id, rating, comment, created_at, customer:users!customer_id(full_name)")
      .eq("provider_id", userId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        const rows = data || [];
        setReviews(rows);
        setAvgRating(rows.length ? rows.reduce((s, r) => s + r.rating, 0) / rows.length : 0);
        setLoading(false);
      });
  }, [userId]);

  if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><Loader2 size={24} style={{ color: G, animation: "spin 1s linear infinite" }} /></div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontFamily: SERIF, color: DARK, fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em" }}>Customer Reviews</h1>
        <p style={{ color: MUTED, fontSize: "0.875rem", marginTop: 4 }}>{reviews.length} review{reviews.length !== 1 ? "s" : ""} received.</p>
      </div>

      {reviews.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[
            { label: "Average Rating", value: avgRating.toFixed(1), sub: "out of 5.0" },
            { label: "Total Reviews",  value: reviews.length,       sub: "all time" },
            { label: "5-Star Reviews", value: reviews.filter(r => r.rating === 5).length, sub: `${Math.round(reviews.filter(r => r.rating === 5).length / reviews.length * 100)}% of total` },
          ].map(({ label, value, sub }) => (
            <div key={label} style={{ ...CARD, padding: 18 }}>
              <p style={{ color: MUTED, fontSize: "0.75rem", fontWeight: 500 }}>{label}</p>
              <p style={{ fontFamily: SERIF, color: DARK, fontSize: "1.75rem", fontWeight: 700, marginTop: 4 }}>{value}</p>
              <p style={{ color: MUTED, fontSize: "0.72rem", marginTop: 4 }}>{sub}</p>
            </div>
          ))}
        </div>
      )}

      {reviews.length === 0 ? (
        <div style={{ ...CARD, padding: 48, textAlign: "center", color: MUTED, fontSize: "0.9rem" }}>
          No reviews yet. Complete jobs to start receiving reviews from customers.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {reviews.map(r => (
            <div key={r.id} style={{ ...CARD, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <InitialsCircle name={r.customer?.full_name || "C"} size={38} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <p style={{ color: DARK, fontWeight: 700, fontSize: "0.875rem" }}>{r.customer?.full_name || "Customer"}</p>
                    <span style={{ color: MUTED, fontSize: "0.72rem" }}>{timeAgo(r.created_at)}</span>
                  </div>
                  <div style={{ display: "flex", gap: 2, marginTop: 4 }}>
                    {[1,2,3,4,5].map(s => (
                      <Banknote key={s} size={0} style={{ display: "none" }} />
                    ))}
                    {[1,2,3,4,5].map(s => (
                      <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill={s <= r.rating ? GOLD : "none"} stroke={s <= r.rating ? GOLD : "#c8c0b0"} strokeWidth="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    ))}
                  </div>
                  {r.comment && (
                    <p style={{ color: MUTED, fontSize: "0.8rem", marginTop: 8, lineHeight: 1.6, fontStyle: "italic" }}>"{r.comment}"</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Portfolio tab ─────────────────────────────────────────────────────────────
function PortfolioTab({ profile, userId }) {
  const [items,     setItems]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);
  const [err,       setErr]       = useState("");
  const fileRef = useRef(null);

  useEffect(() => {
    if (!profile?.id) return;
    supabase.from("portfolio_items")
      .select("id, image_url, caption")
      .eq("provider_id", profile.id)
      .order("created_at")
      .then(({ data }) => { setItems(data || []); setLoading(false); });
  }, [profile?.id]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.id || !userId) return;
    setUploading(true); setErr("");
    try {
      const ext  = file.name.split(".").pop();
      const path = `${userId}/portfolio/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: false });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      const { data: inserted, error: insErr } = await supabase.from("portfolio_items")
        .insert({ provider_id: profile.id, image_url: urlData.publicUrl, caption: "" })
        .select("id, image_url, caption").single();
      if (insErr) throw insErr;
      setItems(prev => [...prev, inserted]);
    } catch { setErr("Upload failed. Check that the storage bucket exists."); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
  };

  const handleRemove = async (id) => {
    await supabase.from("portfolio_items").delete().eq("id", id);
    setItems(prev => prev.filter(i => i.id !== id));
  };

  if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><Loader2 size={24} style={{ color: G, animation: "spin 1s linear infinite" }} /></div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontFamily: SERIF, color: DARK, fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em" }}>Portfolio</h1>
          <p style={{ color: MUTED, fontSize: "0.875rem", marginTop: 4 }}>Show your best work. Profiles with photos get 3× more bookings.</p>
        </div>
        <div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleUpload} />
          <button onClick={() => fileRef.current?.click()} disabled={uploading}
            style={{ backgroundColor: G, color: "white", border: "none", borderRadius: 10, padding: "10px 20px", fontFamily: SANS, fontWeight: 600, fontSize: "0.85rem", cursor: uploading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8 }}>
            {uploading ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Uploading…</> : <>+ Add photo</>}
          </button>
        </div>
      </div>

      {err && <p style={{ color: "#dc2626", backgroundColor: "#fef2f2", padding: "10px 14px", borderRadius: 10, fontSize: "0.85rem" }}>{err}</p>}

      {items.length === 0 ? (
        <div style={{ ...CARD, padding: 48, textAlign: "center" }}>
          <ImageIcon size={36} style={{ color: "#d4cfc5", margin: "0 auto 12px" }} />
          <p style={{ color: MUTED, fontSize: "0.9rem", marginBottom: 16 }}>No portfolio photos yet.</p>
          <button onClick={() => fileRef.current?.click()}
            style={{ backgroundColor: G, color: "white", border: "none", borderRadius: 10, padding: "10px 24px", fontFamily: SANS, fontWeight: 600, fontSize: "0.875rem", cursor: "pointer" }}>
            Upload your first photo
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {items.map(item => (
            <div key={item.id} style={{ ...CARD, overflow: "hidden", position: "relative" }}>
              <img src={item.image_url} alt={item.caption || "Portfolio"} style={{ width: "100%", aspectRatio: "1", objectFit: "cover", display: "block" }} />
              <div style={{ padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <p style={{ color: MUTED, fontSize: "0.75rem", flex: 1 }}>{item.caption || "No caption"}</p>
                <button onClick={() => handleRemove(item.id)}
                  style={{ background: "none", border: "1px solid #e8e2d8", borderRadius: 6, padding: "3px 8px", color: "#e05c5c", fontFamily: SANS, fontSize: "0.7rem", cursor: "pointer" }}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Page root ─────────────────────────────────────────────────────────────────
export default function ProviderDashboard() {
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

  const handleComplete = async (bookingId) => {
    await supabase.from("bookings").update({ status: "completed" }).eq("id", bookingId);
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
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @media(max-width:640px){.stat-grid{grid-template-columns:repeat(2,1fr)!important}}`}</style>

      {isMobile && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 56, backgroundColor: G, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", zIndex: 100, boxSizing: "border-box" }}>
          <button onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "white", padding: 4, display: "flex" }}>
            <Menu size={22} />
          </button>
          <span style={{ fontFamily: SERIF, color: "white", fontWeight: 700, fontSize: "1rem" }}>Inzira Works</span>
          <div style={{ width: 30 }} />
        </div>
      )}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 150 }} />
      )}

      <Sidebar tab={tab} setTab={setTab} user={user} profile={profile} pendingCount={pending.length} onLogout={handleLogout} isMobile={isMobile} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main style={{ flex: 1, padding: isMobile ? "72px 16px 24px" : 32, overflowY: "auto" }}>
        {tab === "overview"  && <Overview user={user} profile={profile} pending={pending} onAccept={handleAccept} onDecline={handleDecline} statsLoading={loading} />}
        {tab === "bookings"  && <Bookings pending={pending} confirmed={confirmed} onAccept={handleAccept} onDecline={handleDecline} onComplete={handleComplete} />}
        {tab === "history"   && <HistoryTab userId={user?.id} />}
        {tab === "reviews"   && <ReviewsTab userId={user?.id} />}
        {tab === "portfolio" && <PortfolioTab profile={profile} userId={user?.id} />}
        {tab === "profile"   && <MyProfile user={user} profile={profile} onSave={setProfile} />}
      </main>
    </div>
  );
}
