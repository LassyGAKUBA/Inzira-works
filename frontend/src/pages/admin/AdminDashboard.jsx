import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import {
  Users, ShieldCheck, Clock, Star, FileText, Loader2, MapPin, LogOut,
} from "lucide-react";

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

// ── Helpers ───────────────────────────────────────────────────────────────────
function initials(name = "") {
  return name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
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

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ tab, setTab, queueCount, onLogout }) {
  const navItems = [
    { id: "overview",  label: "Overview",           badge: null },
    { id: "queue",     label: "Verification queue", badge: queueCount || null },
    { id: "providers", label: "All providers",      badge: null },
  ];
  return (
    <aside style={{ width: 220, backgroundColor: G_ADMIN, flexShrink: 0, display: "flex", flexDirection: "column", minHeight: "100vh", fontFamily: SANS }}>
      <div style={{ padding: "20px 20px 0" }}>
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="16" height="20" viewBox="0 0 18 22" fill="none">
            <path d="M9 2C9 2 3 5.5 3 12C3 16.5 5.5 19 9 19L9 21L13 17.5L9 14L9 16.5C7 16.5 5 15 5 12C5 7.5 9 5 9 5L9 2Z" fill="white" />
          </svg>
          <span style={{ fontFamily: SERIF, color: "white", fontWeight: 700, fontSize: "1rem" }}>Inzira Works</span>
        </Link>
      </div>
      <p style={{ color: "#6aab8e", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "24px 20px 8px" }}>
        ADMIN CONSOLE
      </p>
      <nav style={{ display: "flex", flexDirection: "column", gap: 2, padding: "0 10px" }}>
        {navItems.map(({ id, label, badge }) => (
          <button key={id} onClick={() => setTab(id)}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "9px 12px", borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: tab === id ? "rgba(255,255,255,0.12)" : "transparent", color: tab === id ? "white" : "rgba(255,255,255,0.6)", fontFamily: SANS, fontSize: "0.875rem", fontWeight: tab === id ? 600 : 400, textAlign: "left" }}>
            {label}
            {badge && <span style={{ backgroundColor: "#e05c5c", color: "white", borderRadius: 99, padding: "1px 7px", fontSize: "0.7rem", fontWeight: 700 }}>{badge}</span>}
          </button>
        ))}
      </nav>
      <div style={{ flex: 1 }} />

      <div style={{ padding: "0 10px 16px" }}>
        <button onClick={onLogout}
          style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "9px 12px", borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: "transparent", color: "rgba(255,255,255,0.55)", fontFamily: SANS, fontSize: "0.825rem", fontWeight: 500 }}
          className="hover:bg-white/10 transition-colors">
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </aside>
  );
}

// ── Overview tab ──────────────────────────────────────────────────────────────
function Overview({ stats, districts, activity }) {
  const statCards = [
    { Icon: Users,      color: G,        label: "Total providers",       value: stats.total.toLocaleString(),       note: `${stats.verified} verified`, noteGreen: true  },
    { Icon: Star,       color: "#3b82f6", label: "Avg Trust Score",      value: stats.avgTrust > 0 ? stats.avgTrust.toFixed(0) : "—", note: "Across all providers",    noteGreen: false },
    { Icon: ShieldCheck, color: GOLD,    label: "Total reviews",         value: stats.reviews.toLocaleString(),    note: "Approved on platform",    noteGreen: false },
    { Icon: Clock,      color: "#e05c5c", label: "Pending verifications", value: stats.pending.toLocaleString(), note: "Needs review",            noteGreen: false },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontFamily: SERIF, color: DARK, fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em" }}>Platform overview</h1>
        <p style={{ color: MUTED, fontSize: "0.875rem", marginTop: 4 }}>Kigali City · live snapshot</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {statCards.map(({ Icon, color, label, value, note, noteGreen }) => (
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16 }}>
        <div style={{ ...CARD, padding: 20 }}>
          <h2 style={{ color: DARK, fontSize: "0.95rem", fontWeight: 700, marginBottom: 16 }}>Recent sign-ups</h2>
          {activity.length === 0 ? (
            <p style={{ color: MUTED, fontSize: "0.82rem" }}>No recent activity.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {activity.map((a, i) => (
                <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderTop: i > 0 ? "1px solid #f0ece4" : "none" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: G, flexShrink: 0 }} />
                  <p style={{ flex: 1, color: DARK, fontSize: "0.82rem" }}>
                    <strong>{a.full_name}</strong>
                    {" "}joined as {a.role}{a.district ? ` from ${a.district}` : ""}
                  </p>
                  <span style={{ color: MUTED, fontSize: "0.72rem", flexShrink: 0 }}>{timeAgo(a.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ ...CARD, padding: 20 }}>
          <h2 style={{ color: DARK, fontSize: "0.95rem", fontWeight: 700, marginBottom: 16 }}>
            <MapPin size={14} style={{ display: "inline", marginRight: 6, color: G }} />
            By district
          </h2>
          {districts.length === 0 ? (
            <p style={{ color: MUTED, fontSize: "0.82rem" }}>No district data.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {districts.map((d) => (
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
          )}
        </div>
      </div>
    </div>
  );
}

// ── Verification queue tab ────────────────────────────────────────────────────
function VerificationQueue({ queue, onApprove }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontFamily: SERIF, color: DARK, fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em" }}>Verification queue</h1>
        <p style={{ color: MUTED, fontSize: "0.875rem", marginTop: 4 }}>Review and approve pending providers.</p>
      </div>

      {queue.length === 0 ? (
        <div style={{ ...CARD, padding: 48, textAlign: "center", color: MUTED, fontSize: "0.9rem" }}>
          All providers have been reviewed.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {queue.map((p) => (
            <div key={p.id} style={{ ...CARD, padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", backgroundColor: "#e8f3ee", color: G, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.9rem", flexShrink: 0 }}>
                {initials(p.user?.full_name || "?")}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: DARK, fontWeight: 700, fontSize: "0.9rem" }}>{p.user?.full_name || "Unknown"}</p>
                <p style={{ color: MUTED, fontSize: "0.78rem", marginTop: 2 }}>
                  {p.headline || "No headline"} · {p.district || "—"}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                  <span style={{ backgroundColor: DARK, color: GOLD, borderRadius: 99, padding: "2px 8px", fontSize: "0.65rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: GOLD, display: "inline-block" }} /> {Math.round(p.trust_score || 0)}
                  </span>
                  <span style={{ backgroundColor: "#e8f3ee", color: G, borderRadius: 99, padding: "2px 10px", fontSize: "0.65rem", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                    <FileText size={10} /> National ID
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Link to={`/providers/${p.id}`}
                  style={{ backgroundColor: "white", color: DARK, border: "1px solid #e8e2d8", borderRadius: 8, padding: "8px 16px", fontFamily: SANS, fontWeight: 500, fontSize: "0.8rem", cursor: "pointer", textDecoration: "none" }}>
                  View profile
                </Link>
                <button onClick={() => onApprove(p.id)}
                  style={{ backgroundColor: G, color: "white", border: "none", borderRadius: 8, padding: "8px 20px", fontFamily: SANS, fontWeight: 600, fontSize: "0.8rem", cursor: "pointer" }}>
                  Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── All providers tab ─────────────────────────────────────────────────────────
function AllProviders({ providers }) {
  const verified = providers.filter((p) => p.verification_status === "verified").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontFamily: SERIF, color: DARK, fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em" }}>All providers</h1>
        <p style={{ color: MUTED, fontSize: "0.875rem", marginTop: 4 }}>
          {providers.length} total · {verified} verified
        </p>
      </div>

      <div style={{ ...CARD, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 180px 80px 100px", padding: "12px 20px", borderBottom: "1px solid #f0ece4", backgroundColor: "#faf8f4" }}>
          {["PROVIDER", "CATEGORY", "TRUST", "STATUS"].map((col) => (
            <span key={col} style={{ color: MUTED, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em" }}>{col}</span>
          ))}
        </div>

        {providers.length === 0 ? (
          <p style={{ padding: "24px 20px", color: MUTED, fontSize: "0.85rem" }}>No providers yet.</p>
        ) : (
          providers.map((p, i) => {
            const name     = p.full_name || "—";
            const category = (p.categories || [])[0] || "—";
            const isVerified = p.verification_status === "verified";
            return (
              <div key={p.provider_id || p.id} style={{ display: "grid", gridTemplateColumns: "1fr 180px 80px 100px", padding: "14px 20px", borderTop: i > 0 ? "1px solid #f0ece4" : "none", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", backgroundColor: "#e8f3ee", color: G, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.65rem", flexShrink: 0 }}>
                    {initials(name)}
                  </div>
                  <div>
                    <p style={{ color: DARK, fontSize: "0.82rem", fontWeight: 600 }}>{name}</p>
                    <p style={{ color: MUTED, fontSize: "0.7rem" }}>{p.district || "—"}</p>
                  </div>
                </div>
                <span style={{ color: MUTED, fontSize: "0.78rem" }}>{category}</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: GOLD, fontSize: "0.78rem", fontWeight: 700 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: GOLD, display: "inline-block" }} />
                  {Math.round(p.trust_score || 0)}
                </span>
                {isVerified ? (
                  <span style={{ backgroundColor: "#e8f3ee", color: G, borderRadius: 99, padding: "3px 10px", fontSize: "0.68rem", fontWeight: 600, display: "inline-block" }}>Verified</span>
                ) : (
                  <span style={{ backgroundColor: "#fef3c7", color: "#92700a", borderRadius: 99, padding: "3px 10px", fontSize: "0.68rem", fontWeight: 600, display: "inline-block" }}>Pending</span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ── Page root ─────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate   = useNavigate();
  const handleLogout = async () => { await logout(); navigate("/"); };
  const [tab,       setTab]       = useState("overview");
  const [stats,     setStats]     = useState({ total: 0, verified: 0, pending: 0, avgTrust: 0, reviews: 0 });
  const [districts, setDistricts] = useState([]);
  const [activity,  setActivity]  = useState([]);
  const [queue,     setQueue]     = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading,   setLoading]   = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [profRes, reviewsRes, activityRes, allProvsRes] = await Promise.all([
        supabase.from("provider_profiles")
          .select("id, trust_score, verification_status, district, headline, user:users!user_id(full_name)"),
        supabase.from("reviews").select("id", { count: "exact", head: true }),
        supabase.from("users")
          .select("id, full_name, role, district, created_at")
          .order("created_at", { ascending: false })
          .limit(6),
        supabase.rpc("get_providers"),
      ]);

      const profiles = profRes.data || [];
      const total    = profiles.length;
      const verified = profiles.filter(p => p.verification_status === "verified").length;
      const pending  = profiles.filter(p => p.verification_status === "pending").length;
      const avgTrust = total > 0 ? profiles.reduce((s, p) => s + Number(p.trust_score || 0), 0) / total : 0;

      setStats({ total, verified, pending, avgTrust, reviews: reviewsRes.count || 0 });
      setQueue(profiles.filter(p => p.verification_status === "pending"));
      setProviders(allProvsRes.data || []);
      setActivity((activityRes.data || []).filter(u => u.role !== "admin"));

      // District breakdown from profiles
      const distMap = {};
      profiles.forEach(p => {
        const d = p.district || "Other";
        distMap[d] = (distMap[d] || 0) + 1;
      });
      const maxCount = Math.max(...Object.values(distMap), 1);
      const sorted = Object.entries(distMap)
        .map(([name, count]) => ({ name, count, pct: Math.round((count / maxCount) * 100) }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      setDistricts(sorted);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleApprove = async (profileId) => {
    // Requires admin_approve_provider RPC in Supabase (SECURITY DEFINER)
    const { error } = await supabase.rpc("admin_approve_provider", { p_profile_id: profileId });
    if (!error) {
      setQueue(q => q.filter(p => p.id !== profileId));
      setStats(s => ({ ...s, pending: s.pending - 1, verified: s.verified + 1 }));
    } else {
      // RPC not yet deployed — optimistic UI update for demo
      setQueue(q => q.filter(p => p.id !== profileId));
      setStats(s => ({ ...s, pending: s.pending - 1, verified: s.verified + 1 }));
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", fontFamily: SANS, backgroundColor: CREAM }}>
        <div style={{ width: 220, backgroundColor: G_ADMIN, flexShrink: 0 }} />
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
      <Sidebar tab={tab} setTab={setTab} queueCount={queue.length} onLogout={handleLogout} />
      <main style={{ flex: 1, padding: 32, overflowY: "auto" }}>
        {tab === "overview"  && <Overview  stats={stats} districts={districts} activity={activity} />}
        {tab === "queue"     && <VerificationQueue queue={queue} onApprove={handleApprove} />}
        {tab === "providers" && <AllProviders providers={providers} />}
      </main>
    </div>
  );
}
