// src/pages/provider/ProviderDashboard.jsx
// Complete Provider Dashboard — sidebar + all sections in one file
// Sections: Overview, Bookings, Portfolio, Reviews, Trust Score, Settings

import { useState } from "react";
import { Link } from "react-router-dom";
import { useLang } from "../../i18n/LangContext";
import LanguageSwitcher from "../../components/shared/LanguageSwitcher";

const PROVIDER = {
  name: "Uwase Clarisse",
  role: "Tailor & Fashion Designer",
  district: "Gasabo",
  initials: "UC",
  trustScore: 94,
  rating: 4.9,
  reviews: 38,
  completedJobs: 112,
  responseRate: 97,
  profileComplete: 85,
  verified: true,
  memberSince: "January 2024",
  earnings: "RWF 340,000",
  thisMonth: "RWF 72,000",
};

const BOOKINGS = [
  { id: 1, customer: "Niyomugaba Jean", service: "Wedding Dress Alteration", date: "Jun 14, 2026", time: "10:00 AM", status: "pending", amount: "RWF 15,000", initials: "NJ", color: "#3B82F6" },
  { id: 2, customer: "Mukashyaka Rose", service: "School Uniform (x3)", date: "Jun 15, 2026", time: "2:00 PM", status: "confirmed", amount: "RWF 24,000", initials: "MR", color: "#8B5CF6" },
  { id: 3, customer: "Habimana Eric", service: "Office Suit Tailoring", date: "Jun 18, 2026", time: "9:00 AM", status: "confirmed", amount: "RWF 45,000", initials: "HE", color: "#10B981" },
  { id: 4, customer: "Uwimana Grace", service: "Dress (Traditional)", date: "Jun 10, 2026", time: "11:00 AM", status: "completed", amount: "RWF 18,000", initials: "UG", color: "#F59E0B" },
  { id: 5, customer: "Ingabire Alice", service: "Blouse & Skirt Set", date: "Jun 8, 2026", time: "3:00 PM", status: "completed", amount: "RWF 12,000", initials: "IA", color: "#EF4444" },
  { id: 6, customer: "Manzi Patrick", service: "Suit Alteration", date: "Jun 5, 2026", time: "10:00 AM", status: "cancelled", amount: "RWF 8,000", initials: "MP", color: "#64748B" },
];

const PORTFOLIO = [
  { id: 1, title: "Wedding Dress Collection", category: "Formal Wear", likes: 24, emoji: "👗" },
  { id: 2, title: "School Uniforms Batch", category: "Uniforms", likes: 18, emoji: "👔" },
  { id: 3, title: "Traditional Imishanana", category: "Traditional", likes: 31, emoji: "🪡" },
  { id: 4, title: "Office Suit Series", category: "Formal Wear", likes: 15, emoji: "🧥" },
  { id: 5, title: "Children's Clothing Set", category: "Kids Wear", likes: 22, emoji: "🧒" },
  { id: 6, title: "Casual Dress Line", category: "Casual", likes: 19, emoji: "👘" },
];

const REVIEWS = [
  { id: 1, customer: "Niyomugaba Jean", rating: 5, date: "Jun 10, 2026", text: "Clarisse is incredibly talented. The dress she made for my wife was perfect — exactly as described and delivered on time.", initials: "NJ", color: "#3B82F6" },
  { id: 2, customer: "Uwimana Grace", rating: 5, date: "Jun 3, 2026", text: "Professional, punctual, and great attention to detail. I've already recommended her to three friends.", initials: "UG", color: "#F59E0B" },
  { id: 3, customer: "Mukashyaka Rose", rating: 4, date: "May 28, 2026", text: "The uniforms came out beautifully. Slight delay on delivery but the quality made up for it.", initials: "MR", color: "#8B5CF6" },
  { id: 4, customer: "Habimana Eric", rating: 5, date: "May 20, 2026", text: "Best tailor I've found in Kigali. The suit fits perfectly and she understood exactly what I wanted.", initials: "HE", color: "#10B981" },
];

const TRUST_FACTORS = [
  { label: "Customer Ratings", key: "ts_f1", pct: 40, score: 38, max: 40, color: "#F97316" },
  { label: "Completed Jobs", key: "ts_f2", pct: 25, score: 24, max: 25, color: "#8B5CF6" },
  { label: "Profile Completeness", key: "ts_f3", pct: 15, score: 13, max: 15, color: "#10B981" },
  { label: "Response Rate", key: "ts_f4", pct: 10, score: 10, max: 10, color: "#3B82F6" },
  { label: "Verification Status", key: "ts_f5", pct: 10, score: 9, max: 10, color: "#F59E0B" },
];

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────
function Avatar({ initials, color, size = 40 }) {
  return (
    <div style={{ width: size, height: size, backgroundColor: color + "20", border: `2px solid ${color}`, color, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: size * 0.33, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function StarRating({ rating }) {
  return (
    <span className="flex gap-0.5">
      {[1,2,3,4,5].map((s) => (
        <span key={s} style={{ color: s <= rating ? "#F97316" : "#CBD5E1" }} className="text-sm">★</span>
      ))}
    </span>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending:   { bg: "#FEF3C7", color: "#D97706", label: "Pending" },
    confirmed: { bg: "#DCFCE7", color: "#16A34A", label: "Confirmed" },
    completed: { bg: "#EFF6FF", color: "#2563EB", label: "Completed" },
    cancelled: { bg: "#FEE2E2", color: "#DC2626", label: "Cancelled" },
  };
  const s = map[status] || map.pending;
  return (
    <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

function StatCard({ icon, label, value, sub, color = "#F97316" }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: color + "15" }}>
          {icon}
        </div>
        {sub && <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">{sub}</span>}
      </div>
      <div>
        <p className="text-2xl font-black" style={{ color: "#1E293B" }}>{value}</p>
        <p className="text-sm text-slate-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NAV ITEMS
// ─────────────────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "overview",    icon: "📊", label: "Overview" },
  { id: "bookings",    icon: "📅", label: "Bookings" },
  { id: "portfolio",   icon: "🖼️",  label: "Portfolio" },
  { id: "reviews",     icon: "⭐", label: "Reviews" },
  { id: "trust",       icon: "✦",  label: "Trust Score" },
  { id: "settings",    icon: "⚙️",  label: "Settings" },
];

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────────────────────────────────────
function Sidebar({ active, setActive, collapsed, setCollapsed }) {
  return (
    <aside
      className="flex flex-col h-full transition-all duration-200"
      style={{
        width: collapsed ? 64 : 240,
        backgroundColor: "#1E293B",
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-700">
        <div style={{ backgroundColor: "#F97316", flexShrink: 0 }} className="w-8 h-8 rounded-lg flex items-center justify-center">
          <span className="text-white font-black text-sm">IW</span>
        </div>
        {!collapsed && (
          <span className="text-white font-bold text-base tracking-tight whitespace-nowrap">Inzira Works</span>
        )}
      </div>

      {/* Provider mini profile */}
      {!collapsed && (
        <div className="px-4 py-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <Avatar initials="UC" color="#F97316" size={36} />
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{PROVIDER.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span style={{ border: "1.5px solid #10B981", color: "#10B981" }} className="text-xs font-bold px-1.5 py-0.5 rounded-full">✦ {PROVIDER.trustScore}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-left w-full"
              style={{
                backgroundColor: isActive ? "#F97316" : "transparent",
                color: isActive ? "white" : "#94A3B8",
              }}
              title={collapsed ? item.label : undefined}
            >
              <span className="text-base flex-shrink-0">{item.icon}</span>
              {!collapsed && (
                <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="px-2 py-4 border-t border-slate-700 flex flex-col gap-1">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-700 transition-colors w-full"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <span className="text-base">{collapsed ? "→" : "←"}</span>
          {!collapsed && <span className="text-xs font-medium">Collapse</span>}
        </button>
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-slate-700 transition-colors"
          title={collapsed ? "Log out" : undefined}
        >
          <span className="text-base">🚪</span>
          {!collapsed && <span className="text-sm font-medium">Log out</span>}
        </Link>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: OVERVIEW
// ─────────────────────────────────────────────────────────────────────────────
function OverviewSection() {
  const pending = BOOKINGS.filter((b) => b.status === "pending").length;

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome banner */}
      <div
        className="rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{ background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)" }}
      >
        <div className="flex flex-col gap-1">
          <p style={{ color: "#F97316" }} className="text-xs font-bold uppercase tracking-widest">Good morning</p>
          <h2 className="text-white text-xl font-black">Welcome back, Clarisse! 👋</h2>
          <p className="text-slate-400 text-sm">You have <span style={{ color: "#F97316" }} className="font-semibold">{pending} pending booking{pending !== 1 ? "s" : ""}</span> waiting for your response.</p>
        </div>
        <div
          className="flex-shrink-0 flex flex-col items-center justify-center rounded-2xl px-6 py-4 gap-1"
          style={{ backgroundColor: "#F9731620", border: "1.5px solid #F9731640" }}
        >
          <p style={{ color: "#F97316" }} className="text-3xl font-black">{PROVIDER.trustScore}</p>
          <p className="text-slate-400 text-xs font-medium">Trust Score</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="📅" label="Total Bookings" value={BOOKINGS.length} sub="+2 this week" color="#F97316" />
        <StatCard icon="✅" label="Completed Jobs" value={PROVIDER.completedJobs} sub="+5 this month" color="#10B981" />
        <StatCard icon="⭐" label="Average Rating" value={PROVIDER.rating} color="#F59E0B" />
        <StatCard icon="💰" label="This Month" value={PROVIDER.thisMonth} sub="↑ 12%" color="#8B5CF6" />
      </div>

      {/* Recent bookings preview */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 style={{ color: "#1E293B" }} className="font-bold">Recent Bookings</h3>
          <button style={{ color: "#F97316" }} className="text-xs font-semibold hover:underline">View all</button>
        </div>
        <div className="flex flex-col gap-3">
          {BOOKINGS.slice(0, 4).map((b) => (
            <div key={b.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
              <Avatar initials={b.initials} color={b.color} size={36} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{b.customer}</p>
                <p className="text-xs text-slate-500 truncate">{b.service}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <StatusBadge status={b.status} />
                <p className="text-xs text-slate-400 mt-1">{b.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Profile completeness alert */}
      {PROVIDER.profileComplete < 100 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 flex items-start gap-4">
          <span className="text-xl flex-shrink-0">⚡</span>
          <div className="flex-1">
            <p className="font-semibold text-orange-800 text-sm">Complete your profile to boost your Trust Score</p>
            <p className="text-orange-600 text-xs mt-1">Your profile is {PROVIDER.profileComplete}% complete. Add your bio and more portfolio items to reach 100%.</p>
            <div className="mt-3 h-2 bg-orange-100 rounded-full overflow-hidden">
              <div style={{ width: `${PROVIDER.profileComplete}%`, backgroundColor: "#F97316" }} className="h-full rounded-full" />
            </div>
          </div>
          <button style={{ backgroundColor: "#F97316" }} className="text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex-shrink-0 hover:opacity-90">
            Complete
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: BOOKINGS
// ─────────────────────────────────────────────────────────────────────────────
function BookingsSection() {
  const [filter, setFilter] = useState("all");
  const filters = ["all", "pending", "confirmed", "completed", "cancelled"];

  const filtered = filter === "all" ? BOOKINGS : BOOKINGS.filter((b) => b.status === filter);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 style={{ color: "#1E293B" }} className="text-xl font-black">Bookings</h2>
        <span className="text-sm text-slate-500">{filtered.length} {filter === "all" ? "total" : filter}</span>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all"
            style={{
              backgroundColor: filter === f ? "#F97316" : "#F1F5F9",
              color: filter === f ? "white" : "#64748B",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Bookings list */}
      <div className="flex flex-col gap-3">
        {filtered.map((b) => (
          <div key={b.id} className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="flex items-start gap-4">
              <Avatar initials={b.initials} color={b.color} size={44} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-800">{b.customer}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{b.service}</p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
                <div className="flex items-center gap-4 mt-3 flex-wrap">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    📅 {b.date} · {b.time}
                  </span>
                  <span className="text-xs font-semibold text-slate-700">{b.amount}</span>
                </div>
                {/* Action buttons for pending */}
                {b.status === "pending" && (
                  <div className="flex gap-2 mt-3">
                    <button style={{ backgroundColor: "#F97316" }} className="text-white text-xs font-semibold px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity">
                      Accept
                    </button>
                    <button className="text-slate-500 text-xs font-semibold px-4 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                      Decline
                    </button>
                  </div>
                )}
                {b.status === "confirmed" && (
                  <div className="flex gap-2 mt-3">
                    <button style={{ backgroundColor: "#10B981" }} className="text-white text-xs font-semibold px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity">
                      Mark Complete
                    </button>
                    <button className="text-slate-500 text-xs font-semibold px-4 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50">
                      Message
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <p className="text-3xl mb-3">📭</p>
            <p className="font-semibold text-slate-700">No {filter} bookings</p>
            <p className="text-sm text-slate-400 mt-1">They'll appear here when customers book you.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: PORTFOLIO
// ─────────────────────────────────────────────────────────────────────────────
function PortfolioSection() {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ color: "#1E293B" }} className="text-xl font-black">Portfolio</h2>
          <p className="text-slate-500 text-sm mt-0.5">Showcase your best work to attract more customers</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          style={{ backgroundColor: "#F97316" }}
          className="text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <span>+</span> Add Work
        </button>
      </div>

      {/* Add work form */}
      {showAdd && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 flex flex-col gap-4">
          <h3 className="font-semibold text-orange-800 text-sm">Add New Portfolio Item</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-700">Title</label>
              <input type="text" placeholder="e.g. Wedding Dress Collection" className="px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-orange-400 bg-white" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-700">Category</label>
              <select className="px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-orange-400 bg-white">
                {["Formal Wear", "Traditional", "Uniforms", "Kids Wear", "Casual"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          {/* Upload area */}
          <div className="border-2 border-dashed border-orange-300 rounded-xl p-8 text-center bg-white">
            <p className="text-2xl mb-2">📷</p>
            <p className="text-sm font-medium text-slate-600">Click to upload photos</p>
            <p className="text-xs text-slate-400 mt-1">JPG, PNG up to 5MB each · Max 5 photos</p>
          </div>
          <div className="flex gap-2">
            <button style={{ backgroundColor: "#F97316" }} className="text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90">Save</button>
            <button onClick={() => setShowAdd(false)} className="text-slate-500 text-sm font-semibold px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50">Cancel</button>
          </div>
        </div>
      )}

      {/* Portfolio grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {PORTFOLIO.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden group hover:shadow-md transition-shadow">
            {/* Placeholder image area */}
            <div
              className="h-40 flex items-center justify-center text-5xl"
              style={{ backgroundColor: "#F8FAFC" }}
            >
              {item.emoji}
            </div>
            <div className="p-3">
              <p className="text-sm font-semibold text-slate-800 leading-tight">{item.title}</p>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{item.category}</span>
                <span className="text-xs text-slate-400 flex items-center gap-1">❤️ {item.likes}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: REVIEWS
// ─────────────────────────────────────────────────────────────────────────────
function ReviewsSection() {
  const avg = (REVIEWS.reduce((a, r) => a + r.rating, 0) / REVIEWS.length).toFixed(1);
  const dist = [5,4,3,2,1].map((r) => ({
    r,
    count: REVIEWS.filter((rv) => rv.rating === r).length,
    pct: (REVIEWS.filter((rv) => rv.rating === r).length / REVIEWS.length) * 100,
  }));

  return (
    <div className="flex flex-col gap-5">
      <h2 style={{ color: "#1E293B" }} className="text-xl font-black">Reviews</h2>

      {/* Summary */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 grid sm:grid-cols-2 gap-6">
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <p style={{ color: "#1E293B" }} className="text-6xl font-black">{avg}</p>
          <StarRating rating={Math.round(avg)} />
          <p className="text-slate-500 text-sm">Based on {REVIEWS.length} reviews</p>
        </div>
        <div className="flex flex-col gap-2 justify-center">
          {dist.map((d) => (
            <div key={d.r} className="flex items-center gap-3">
              <span className="text-xs text-slate-500 w-4">{d.r}</span>
              <span style={{ color: "#F97316" }} className="text-xs">★</span>
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div style={{ width: `${d.pct}%`, backgroundColor: "#F97316" }} className="h-full rounded-full" />
              </div>
              <span className="text-xs text-slate-400 w-4">{d.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Review list */}
      <div className="flex flex-col gap-3">
        {REVIEWS.map((r) => (
          <div key={r.id} className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar initials={r.initials} color={r.color} size={38} />
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{r.customer}</p>
                  <p className="text-xs text-slate-400">{r.date}</p>
                </div>
              </div>
              <StarRating rating={r.rating} />
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{r.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: TRUST SCORE
// ─────────────────────────────────────────────────────────────────────────────
function TrustScoreSection() {
  const total = TRUST_FACTORS.reduce((a, f) => a + f.score, 0);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 style={{ color: "#1E293B" }} className="text-xl font-black">Trust Score</h2>
        <p className="text-slate-500 text-sm mt-0.5">Your credibility rating — updated in real time</p>
      </div>

      {/* Score hero */}
      <div
        className="rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6"
        style={{ background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)" }}
      >
        {/* Circle score */}
        <div className="relative flex-shrink-0">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="#334155" strokeWidth="10" />
            <circle
              cx="60" cy="60" r="50"
              fill="none"
              stroke="#F97316"
              strokeWidth="10"
              strokeDasharray={`${(total / 100) * 314} 314`}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span style={{ color: "#F97316" }} className="text-3xl font-black">{total}</span>
            <span className="text-slate-400 text-xs">/ 100</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 flex-1">
          <div>
            <p style={{ color: "#F97316" }} className="text-xs font-bold uppercase tracking-widest">Current Score</p>
            <p className="text-white text-2xl font-black mt-1">
              {total >= 90 ? "Excellent 🏆" : total >= 75 ? "Good 👍" : "Building ⬆️"}
            </p>
            <p className="text-slate-400 text-sm mt-1">
              You're in the top 15% of providers on Inzira Works.
            </p>
          </div>
          <div className="flex gap-2">
            <div style={{ backgroundColor: "#10B98120", border: "1px solid #10B98140" }} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-green-400 flex items-center gap-1">
              ✓ Verified
            </div>
            <div style={{ backgroundColor: "#F9731620", border: "1px solid #F9731640" }} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-orange-400 flex items-center gap-1">
              ★ Top Rated
            </div>
          </div>
        </div>
      </div>

      {/* Factor breakdown */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-5">
        <h3 className="font-bold text-slate-800">Score Breakdown</h3>
        {TRUST_FACTORS.map((f) => (
          <div key={f.label} className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">{f.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-xs">{f.score}/{f.max} pts</span>
                <span className="font-bold text-slate-800">{f.pct}%</span>
              </div>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                style={{ width: `${(f.score / f.max) * 100}%`, backgroundColor: f.color }}
                className="h-full rounded-full transition-all duration-700"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Tips to improve */}
      <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 flex flex-col gap-3">
        <p className="font-bold text-orange-800 text-sm flex items-center gap-2">⚡ Tips to improve your score</p>
        <div className="flex flex-col gap-2">
          {[
            "Complete your profile bio (+2 pts)",
            "Add 2 more portfolio items (+3 pts)",
            "Respond to bookings within 1 hour (+1 pt)",
          ].map((tip) => (
            <div key={tip} className="flex items-start gap-2">
              <span className="text-orange-400 text-xs mt-0.5">→</span>
              <span className="text-orange-700 text-sm">{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: SETTINGS
// ─────────────────────────────────────────────────────────────────────────────
function SettingsSection() {
  const [form, setForm] = useState({
    fullName: PROVIDER.name,
    role: PROVIDER.role,
    district: PROVIDER.district,
    phone: "0781 234 567",
    bio: "I am a professional tailor based in Gasabo with over 7 years of experience in fashion design and alterations. I specialize in wedding dresses, traditional Rwandan attire, and office wear.",
    notifications: true,
    publicProfile: true,
  });

  const set = (field) => (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  return (
    <div className="flex flex-col gap-5">
      <h2 style={{ color: "#1E293B" }} className="text-xl font-black">Settings</h2>

      {/* Profile info */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-5">
        <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">Profile Information</h3>

        {/* Avatar */}
        <div className="flex items-center gap-4">
          <Avatar initials="UC" color="#F97316" size={64} />
          <div>
            <button style={{ color: "#F97316" }} className="text-sm font-semibold hover:underline">Change photo</button>
            <p className="text-xs text-slate-400 mt-0.5">JPG or PNG, max 2MB</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: "Full Name", field: "fullName", placeholder: "Your full name" },
            { label: "Service / Role", field: "role", placeholder: "e.g. Tailor & Fashion Designer" },
            { label: "Phone Number", field: "phone", placeholder: "0781 234 567" },
            { label: "District", field: "district", type: "select", options: ["Gasabo", "Kicukiro", "Nyarugenge"] },
          ].map(({ label, field, placeholder, type, options }) => (
            <div key={field} className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-700">{label}</label>
              {type === "select" ? (
                <select
                  value={form[field]}
                  onChange={set(field)}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-white text-slate-800"
                >
                  {options.map((o) => <option key={o}>{o}</option>)}
                </select>
              ) : (
                <input
                  type="text"
                  value={form[field]}
                  onChange={set(field)}
                  placeholder={placeholder}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-slate-800 bg-white"
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-700">Bio</label>
          <textarea
            value={form.bio}
            onChange={set("bio")}
            rows={4}
            className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 resize-none text-slate-800 bg-white"
            placeholder="Tell customers about your skills and experience..."
          />
          <p className="text-xs text-slate-400 text-right">{form.bio.length}/500</p>
        </div>

        <button style={{ backgroundColor: "#F97316" }} className="text-white font-semibold text-sm px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity w-fit">
          Save Changes
        </button>
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-4">
        <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">Preferences</h3>

        {[
          { label: "Email & SMS Notifications", desc: "Receive alerts for new bookings and messages", field: "notifications" },
          { label: "Public Profile", desc: "Allow customers to find and view your profile", field: "publicProfile" },
        ].map(({ label, desc, field }) => (
          <div key={field} className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-700">{label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
            </div>
            <button
              onClick={() => setForm((p) => ({ ...p, [field]: !p[field] }))}
              className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
              style={{ backgroundColor: form[field] ? "#F97316" : "#CBD5E1" }}
              role="switch"
              aria-checked={form[field]}
            >
              <span
                className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                style={{ transform: form[field] ? "translateX(20px)" : "translateX(2px)" }}
              />
            </button>
          </div>
        ))}
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-2xl border border-red-100 p-5 flex flex-col gap-3">
        <h3 className="font-bold text-red-600 text-sm">Danger Zone</h3>
        <p className="text-xs text-slate-500">These actions are permanent and cannot be undone.</p>
        <div className="flex gap-3 flex-wrap">
          <button className="text-red-500 text-sm font-semibold px-4 py-2 rounded-xl border border-red-200 hover:bg-red-50 transition-colors">
            Deactivate Account
          </button>
          <button className="text-red-600 text-sm font-semibold px-4 py-2 rounded-xl border border-red-300 hover:bg-red-50 transition-colors">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TOPBAR
// ─────────────────────────────────────────────────────────────────────────────
function Topbar({ active, mobileMenuOpen, setMobileMenuOpen }) {
  const label = NAV_ITEMS.find((n) => n.id === active)?.label || "Dashboard";
  return (
    <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
        >
          ☰
        </button>
        <h1 style={{ color: "#1E293B" }} className="font-bold text-base">{label}</h1>
      </div>
      <div className="flex items-center gap-3">
        <LanguageSwitcher compact />
        <div className="w-px h-5 bg-slate-200" />
        <Avatar initials="UC" color="#F97316" size={32} />
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MOBILE BOTTOM NAV
// ─────────────────────────────────────────────────────────────────────────────
function MobileNav({ active, setActive }) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 z-40 flex">
      {NAV_ITEMS.slice(0, 5).map((item) => {
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className="flex-1 flex flex-col items-center gap-0.5 py-2 transition-colors"
            style={{ color: isActive ? "#F97316" : "#94A3B8" }}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD ROOT
// ─────────────────────────────────────────────────────────────────────────────
export default function ProviderDashboard() {
  const [active, setActive] = useState("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const SECTIONS = {
    overview:  <OverviewSection />,
    bookings:  <BookingsSection />,
    portfolio: <PortfolioSection />,
    reviews:   <ReviewsSection />,
    trust:     <TrustScoreSection />,
    settings:  <SettingsSection />,
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <Sidebar
          active={active}
          setActive={setActive}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 z-50 lg:hidden">
            <Sidebar
              active={active}
              setActive={(id) => { setActive(id); setMobileMenuOpen(false); }}
              collapsed={false}
              setCollapsed={() => {}}
            />
          </div>
        </>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar
          active={active}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* Scrollable content area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 lg:pb-6">
          <div className="max-w-4xl mx-auto">
            {SECTIONS[active]}
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav active={active} setActive={setActive} />
    </div>
  );
}
