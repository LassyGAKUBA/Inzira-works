// src/pages/customer/CustomerDashboard.jsx
// Complete Customer Dashboard — sidebar + all sections in one file
// Sections: Overview, Browse Providers, My Bookings, Saved Providers, Reviews, Settings

import { useState } from "react";
import { Link } from "react-router-dom";
import { useLang } from "../../i18n/LangContext";
import LanguageSwitcher from "../../components/shared/LanguageSwitcher";

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────────────────────────
const CUSTOMER = {
  name: "Niyomugaba Jean",
  initials: "NJ",
  email: "jean.niyomugaba@example.com",
  phone: "0788 123 456",
  district: "Gasabo",
  memberSince: "March 2025",
  totalBookings: 9,
  activeBookings: 2,
  savedCount: 5,
};

const PROVIDERS = [
  { id: 1, name: "Uwase Clarisse", role: "Tailor & Fashion Designer", district: "Gasabo", trustScore: 94, rating: 4.9, reviews: 38, completedJobs: 112, badge: "Top Rated", skills: ["Dresses", "Uniforms", "Alterations"], initials: "UC", color: "#F97316", saved: true },
  { id: 2, name: "Mukamana Diane", role: "Professional Hairdresser", district: "Kicukiro", trustScore: 88, rating: 4.7, reviews: 55, completedJobs: 203, badge: "Verified", skills: ["Braiding", "Natural Hair", "Styling"], initials: "MD", color: "#8B5CF6", saved: true },
  { id: 3, name: "Ingabire Alice", role: "Handcraft & Basket Weaving", district: "Nyarugenge", trustScore: 91, rating: 4.8, reviews: 27, completedJobs: 89, badge: "Verified", skills: ["Agaseke", "Sisal Crafts", "Export Quality"], initials: "IA", color: "#10B981", saved: false },
  { id: 4, name: "Mukashyaka Rose", role: "Caterer & Event Chef", district: "Gasabo", trustScore: 86, rating: 4.6, reviews: 41, completedJobs: 78, badge: "Verified", skills: ["Local Cuisine", "Event Catering", "Buffet"], initials: "MR", color: "#3B82F6", saved: false },
  { id: 5, name: "Uwimana Grace", role: "Event Decorator", district: "Kicukiro", trustScore: 90, rating: 4.8, reviews: 33, completedJobs: 65, badge: "Top Rated", skills: ["Weddings", "Balloon Decor", "Venue Styling"], initials: "UG", color: "#F59E0B", saved: true },
  { id: 6, name: "Nyirahabimana Anne", role: "House Cleaning Specialist", district: "Nyarugenge", trustScore: 82, rating: 4.5, reviews: 22, completedJobs: 54, badge: "Verified", skills: ["Deep Cleaning", "Laundry", "Organizing"], initials: "NA", color: "#EC4899", saved: false },
];

const BOOKINGS = [
  { id: 1, provider: "Uwase Clarisse", role: "Tailor", service: "Wedding Dress Alteration", date: "Jun 14, 2026", time: "10:00 AM", status: "pending", amount: "RWF 15,000", initials: "UC", color: "#F97316" },
  { id: 2, provider: "Uwimana Grace", role: "Event Decorator", service: "Birthday Party Decoration", date: "Jun 20, 2026", time: "8:00 AM", status: "confirmed", amount: "RWF 60,000", initials: "UG", color: "#F59E0B" },
  { id: 3, provider: "Mukamana Diane", role: "Hairdresser", service: "Braiding Session", date: "Jun 5, 2026", time: "1:00 PM", status: "completed", amount: "RWF 8,000", initials: "MD", color: "#8B5CF6" },
  { id: 4, provider: "Mukashyaka Rose", role: "Caterer", service: "Office Lunch Catering (20 ppl)", date: "May 28, 2026", time: "12:00 PM", status: "completed", amount: "RWF 90,000", initials: "MR", color: "#3B82F6" },
  { id: 5, provider: "Nyirahabimana Anne", role: "Cleaner", service: "Apartment Deep Clean", date: "May 15, 2026", time: "9:00 AM", status: "cancelled", amount: "RWF 20,000", initials: "NA", color: "#EC4899" },
];

const CATEGORIES = [
  { label: "Tailoring & Fashion", icon: "✂️" },
  { label: "Hair & Beauty", icon: "💇‍♀️" },
  { label: "Handcraft & Weaving", icon: "🧺" },
  { label: "Catering & Food", icon: "🍽️" },
  { label: "Event Decoration", icon: "🎀" },
  { label: "Cleaning Services", icon: "🧹" },
];

const MY_REVIEWS = [
  { id: 1, provider: "Mukamana Diane", rating: 5, date: "Jun 6, 2026", text: "Diane did an amazing job with my braids. Very professional and gentle. Will book again!", initials: "MD", color: "#8B5CF6", editable: true },
  { id: 2, provider: "Mukashyaka Rose", rating: 4, date: "May 29, 2026", text: "Food was delicious and arrived on time. Would have liked more variety in the buffet.", initials: "MR", color: "#3B82F6", editable: true },
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

function StarRating({ rating, size = "sm" }) {
  const px = size === "sm" ? "text-xs" : "text-sm";
  return (
    <span className={`flex gap-0.5 ${px}`}>
      {[1,2,3,4,5].map((s) => (
        <span key={s} style={{ color: s <= Math.round(rating) ? "#F97316" : "#CBD5E1" }}>★</span>
      ))}
    </span>
  );
}

function TrustScoreBadge({ score }) {
  const color = score >= 90 ? "#10B981" : score >= 75 ? "#F97316" : "#64748B";
  return (
    <div style={{ border: `2px solid ${color}`, color }} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold bg-white">
      <span>✦</span> {score}
    </div>
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
        {sub && <span className="text-xs text-slate-400 font-medium">{sub}</span>}
      </div>
      <div>
        <p className="text-2xl font-black" style={{ color: "#1E293B" }}>{value}</p>
        <p className="text-sm text-slate-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROVIDER CARD (for Browse + Saved sections)
// ─────────────────────────────────────────────────────────────────────────────
function ProviderCard({ provider, savedIds, toggleSave }) {
  const isSaved = savedIds.includes(provider.id);
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow duration-200 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar initials={provider.initials} color={provider.color} size={48} />
          <div>
            <p className="font-semibold text-slate-800 text-sm leading-tight">{provider.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">{provider.role}</p>
          </div>
        </div>
        <button
          onClick={() => toggleSave(provider.id)}
          className="text-lg flex-shrink-0 transition-transform hover:scale-110"
          aria-label={isSaved ? "Unsave provider" : "Save provider"}
          style={{ color: isSaved ? "#F97316" : "#CBD5E1" }}
        >
          {isSaved ? "♥" : "♡"}
        </button>
      </div>

      <div className="flex items-center gap-3">
        <TrustScoreBadge score={provider.trustScore} />
        <div className="flex items-center gap-1">
          <StarRating rating={provider.rating} />
          <span className="text-xs text-slate-500">{provider.rating} ({provider.reviews})</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {provider.skills.map((s) => (
          <span key={s} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{s}</span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
        <span className="text-xs text-slate-500">📍 {provider.district} · {provider.completedJobs} jobs</span>
        <button style={{ backgroundColor: "#F97316" }} className="text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity">
          Book Now
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NAV ITEMS
// ─────────────────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "overview", icon: "🏠", label: "Overview" },
  { id: "browse",   icon: "🔍", label: "Browse" },
  { id: "bookings", icon: "📅", label: "Bookings" },
  { id: "saved",    icon: "♥",  label: "Saved" },
  { id: "reviews",  icon: "⭐", label: "Reviews" },
  { id: "settings", icon: "⚙️",  label: "Settings" },
];

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────────────────────────────────────
function Sidebar({ active, setActive, collapsed, setCollapsed }) {
  return (
    <aside
      className="flex flex-col h-full transition-all duration-200"
      style={{ width: collapsed ? 64 : 240, backgroundColor: "#1E293B", flexShrink: 0 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-700">
        <div style={{ backgroundColor: "#F97316", flexShrink: 0 }} className="w-8 h-8 rounded-lg flex items-center justify-center">
          <span className="text-white font-black text-sm">IW</span>
        </div>
        {!collapsed && <span className="text-white font-bold text-base tracking-tight whitespace-nowrap">Inzira Works</span>}
      </div>

      {/* Mini profile */}
      {!collapsed && (
        <div className="px-4 py-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <Avatar initials={CUSTOMER.initials} color="#3B82F6" size={36} />
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{CUSTOMER.name}</p>
              <p className="text-slate-500 text-xs truncate">{CUSTOMER.district}</p>
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
              style={{ backgroundColor: isActive ? "#F97316" : "transparent", color: isActive ? "white" : "#94A3B8" }}
              title={collapsed ? item.label : undefined}
            >
              <span className="text-base flex-shrink-0">{item.icon}</span>
              {!collapsed && <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>}
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
function OverviewSection({ savedIds, toggleSave, setActive }) {
  const upcoming = BOOKINGS.filter((b) => b.status === "pending" || b.status === "confirmed");
  const recommended = PROVIDERS.slice(0, 3);

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome banner */}
      <div
        className="rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{ background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)" }}
      >
        <div className="flex flex-col gap-1">
          <p style={{ color: "#F97316" }} className="text-xs font-bold uppercase tracking-widest">Good morning</p>
          <h2 className="text-white text-xl font-black">Welcome back, Jean! 👋</h2>
          <p className="text-slate-400 text-sm">
            You have <span style={{ color: "#F97316" }} className="font-semibold">{upcoming.length} upcoming booking{upcoming.length !== 1 ? "s" : ""}</span>.
          </p>
        </div>
        <button
          onClick={() => setActive("browse")}
          style={{ backgroundColor: "#F97316" }}
          className="text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity flex-shrink-0"
        >
          Find a Provider
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="📅" label="Total Bookings" value={CUSTOMER.totalBookings} color="#F97316" />
        <StatCard icon="⏳" label="Active Bookings" value={CUSTOMER.activeBookings} color="#3B82F6" />
        <StatCard icon="♥" label="Saved Providers" value={CUSTOMER.savedCount} color="#EC4899" />
        <StatCard icon="⭐" label="Reviews Given" value={MY_REVIEWS.length} color="#F59E0B" />
      </div>

      {/* Upcoming bookings */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 style={{ color: "#1E293B" }} className="font-bold">Upcoming Bookings</h3>
          <button onClick={() => setActive("bookings")} style={{ color: "#F97316" }} className="text-xs font-semibold hover:underline">View all</button>
        </div>
        {upcoming.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No upcoming bookings yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {upcoming.map((b) => (
              <div key={b.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                <Avatar initials={b.initials} color={b.color} size={36} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{b.provider}</p>
                  <p className="text-xs text-slate-500 truncate">{b.service}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <StatusBadge status={b.status} />
                  <p className="text-xs text-slate-400 mt-1">{b.date}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommended providers */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 style={{ color: "#1E293B" }} className="font-bold">Recommended for You</h3>
          <button onClick={() => setActive("browse")} style={{ color: "#F97316" }} className="text-xs font-semibold hover:underline">Browse all</button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommended.map((p) => (
            <ProviderCard key={p.id} provider={p} savedIds={savedIds} toggleSave={toggleSave} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: BROWSE PROVIDERS
// ─────────────────────────────────────────────────────────────────────────────
function BrowseSection({ savedIds, toggleSave }) {
  const [search, setSearch] = useState("");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [sortBy, setSortBy] = useState("trust");

  const districts = ["all", "Gasabo", "Kicukiro", "Nyarugenge"];

  let filtered = PROVIDERS.filter((p) => {
    const matchesSearch = search === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.role.toLowerCase().includes(search.toLowerCase()) ||
      p.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    const matchesDistrict = districtFilter === "all" || p.district === districtFilter;
    return matchesSearch && matchesDistrict;
  });

  filtered = [...filtered].sort((a, b) => {
    if (sortBy === "trust") return b.trustScore - a.trustScore;
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "jobs") return b.completedJobs - a.completedJobs;
    return 0;
  });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 style={{ color: "#1E293B" }} className="text-xl font-black">Browse Providers</h2>
        <p className="text-slate-500 text-sm mt-0.5">Find skilled women professionals across Kigali</p>
      </div>

      {/* Search */}
      <div className="flex gap-2 bg-white rounded-2xl shadow-sm p-2 border border-slate-100">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, skill, or service..."
          className="flex-1 px-4 py-2 text-sm text-slate-700 outline-none bg-transparent placeholder-slate-400"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2 flex-wrap">
          {districts.map((d) => (
            <button
              key={d}
              onClick={() => setDistrictFilter(d)}
              className="px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all"
              style={{
                backgroundColor: districtFilter === d ? "#F97316" : "#F1F5F9",
                color: districtFilter === d ? "white" : "#64748B",
              }}
            >
              {d === "all" ? "All Districts" : d}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-slate-400">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs font-medium text-slate-600 border border-slate-200 rounded-lg px-3 py-1.5 outline-none bg-white"
          >
            <option value="trust">Trust Score</option>
            <option value="rating">Rating</option>
            <option value="jobs">Most Jobs</option>
          </select>
        </div>
      </div>

      {/* Categories quick filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.label}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 border border-slate-200 bg-white hover:border-orange-300 hover:text-orange-600 transition-colors flex-shrink-0"
          >
            <span>{cat.icon}</span> {cat.label}
          </button>
        ))}
      </div>

      {/* Results */}
      <p className="text-sm text-slate-500">{filtered.length} provider{filtered.length !== 1 ? "s" : ""} found</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <ProviderCard key={p.id} provider={p} savedIds={savedIds} toggleSave={toggleSave} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <p className="text-3xl mb-3">🔍</p>
          <p className="font-semibold text-slate-700">No providers found</p>
          <p className="text-sm text-slate-400 mt-1">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: MY BOOKINGS
// ─────────────────────────────────────────────────────────────────────────────
function BookingsSection() {
  const [filter, setFilter] = useState("all");
  const filters = ["all", "pending", "confirmed", "completed", "cancelled"];

  const filtered = filter === "all" ? BOOKINGS : BOOKINGS.filter((b) => b.status === filter);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 style={{ color: "#1E293B" }} className="text-xl font-black">My Bookings</h2>
        <span className="text-sm text-slate-500">{filtered.length} {filter === "all" ? "total" : filter}</span>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all"
            style={{ backgroundColor: filter === f ? "#F97316" : "#F1F5F9", color: filter === f ? "white" : "#64748B" }}
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
                    <p className="font-semibold text-slate-800">{b.provider}</p>
                    <p className="text-xs text-slate-400">{b.role}</p>
                    <p className="text-sm text-slate-500 mt-1">{b.service}</p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
                <div className="flex items-center gap-4 mt-3 flex-wrap">
                  <span className="text-xs text-slate-500 flex items-center gap-1">📅 {b.date} · {b.time}</span>
                  <span className="text-xs font-semibold text-slate-700">{b.amount}</span>
                </div>

                {/* Actions */}
                {b.status === "pending" && (
                  <div className="flex gap-2 mt-3">
                    <button className="text-slate-500 text-xs font-semibold px-4 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                      Cancel Request
                    </button>
                  </div>
                )}
                {b.status === "confirmed" && (
                  <div className="flex gap-2 mt-3">
                    <button style={{ backgroundColor: "#F97316" }} className="text-white text-xs font-semibold px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity">
                      Message Provider
                    </button>
                    <button className="text-slate-500 text-xs font-semibold px-4 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50">
                      Cancel
                    </button>
                  </div>
                )}
                {b.status === "completed" && (
                  <div className="flex gap-2 mt-3">
                    <button style={{ backgroundColor: "#F97316" }} className="text-white text-xs font-semibold px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity">
                      Leave a Review
                    </button>
                    <button className="text-slate-500 text-xs font-semibold px-4 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50">
                      Book Again
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
            <p className="text-sm text-slate-400 mt-1">Browse providers to make your first booking.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: SAVED PROVIDERS
// ─────────────────────────────────────────────────────────────────────────────
function SavedSection({ savedIds, toggleSave, setActive }) {
  const saved = PROVIDERS.filter((p) => savedIds.includes(p.id));

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 style={{ color: "#1E293B" }} className="text-xl font-black">Saved Providers</h2>
        <p className="text-slate-500 text-sm mt-0.5">Providers you've bookmarked for later</p>
      </div>

      {saved.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center flex flex-col items-center gap-3">
          <p className="text-3xl">♡</p>
          <p className="font-semibold text-slate-700">No saved providers yet</p>
          <p className="text-sm text-slate-400">Tap the heart icon on any provider to save them here.</p>
          <button
            onClick={() => setActive("browse")}
            style={{ backgroundColor: "#F97316" }}
            className="text-white text-sm font-semibold px-5 py-2 rounded-xl hover:opacity-90 transition-opacity mt-1"
          >
            Browse Providers
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {saved.map((p) => (
            <ProviderCard key={p.id} provider={p} savedIds={savedIds} toggleSave={toggleSave} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: MY REVIEWS
// ─────────────────────────────────────────────────────────────────────────────
function ReviewsSection() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 style={{ color: "#1E293B" }} className="text-xl font-black">My Reviews</h2>
        <p className="text-slate-500 text-sm mt-0.5">Reviews you've left for service providers</p>
      </div>

      {MY_REVIEWS.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <p className="text-3xl mb-3">⭐</p>
          <p className="font-semibold text-slate-700">No reviews yet</p>
          <p className="text-sm text-slate-400 mt-1">After a completed booking, you can leave a review.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {MY_REVIEWS.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar initials={r.initials} color={r.color} size={38} />
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{r.provider}</p>
                    <p className="text-xs text-slate-400">{r.date}</p>
                  </div>
                </div>
                <StarRating rating={r.rating} size="md" />
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{r.text}</p>
              {r.editable && (
                <div className="flex gap-2 pt-1 border-t border-slate-50">
                  <button style={{ color: "#F97316" }} className="text-xs font-semibold hover:underline pt-2">Edit</button>
                  <button className="text-xs font-semibold text-slate-400 hover:text-red-500 pt-2">Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: SETTINGS
// ─────────────────────────────────────────────────────────────────────────────
function SettingsSection() {
  const [form, setForm] = useState({
    fullName: CUSTOMER.name,
    email: CUSTOMER.email,
    phone: CUSTOMER.phone,
    district: CUSTOMER.district,
    notifications: true,
    smsAlerts: false,
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

        <div className="flex items-center gap-4">
          <Avatar initials={CUSTOMER.initials} color="#3B82F6" size={64} />
          <div>
            <button style={{ color: "#F97316" }} className="text-sm font-semibold hover:underline">Change photo</button>
            <p className="text-xs text-slate-400 mt-0.5">JPG or PNG, max 2MB</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: "Full Name", field: "fullName" },
            { label: "Email Address", field: "email" },
            { label: "Phone Number", field: "phone" },
            { label: "District", field: "district", type: "select", options: ["Gasabo", "Kicukiro", "Nyarugenge"] },
          ].map(({ label, field, type, options }) => (
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
                  className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-slate-800 bg-white"
                />
              )}
            </div>
          ))}
        </div>

        <button style={{ backgroundColor: "#F97316" }} className="text-white font-semibold text-sm px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity w-fit">
          Save Changes
        </button>
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-4">
        <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">Preferences</h3>
        {[
          { label: "Email Notifications", desc: "Get booking confirmations and updates via email", field: "notifications" },
          { label: "SMS Alerts", desc: "Receive text messages for urgent booking updates", field: "smsAlerts" },
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
        <Avatar initials={CUSTOMER.initials} color="#3B82F6" size={32} />
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
export default function CustomerDashboard() {
  const [active, setActive] = useState("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Centralized saved-providers state, shared across Overview, Browse, Saved sections
  const [savedIds, setSavedIds] = useState(
    PROVIDERS.filter((p) => p.saved).map((p) => p.id)
  );

  const toggleSave = (id) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const SECTIONS = {
    overview: <OverviewSection savedIds={savedIds} toggleSave={toggleSave} setActive={setActive} />,
    browse:   <BrowseSection savedIds={savedIds} toggleSave={toggleSave} />,
    bookings: <BookingsSection />,
    saved:    <SavedSection savedIds={savedIds} toggleSave={toggleSave} setActive={setActive} />,
    reviews:  <ReviewsSection />,
    settings: <SettingsSection />,
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <Sidebar active={active} setActive={setActive} collapsed={collapsed} setCollapsed={setCollapsed} />
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
        <Topbar active={active} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 lg:pb-6">
          <div className="max-w-5xl mx-auto">
            {SECTIONS[active]}
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav active={active} setActive={setActive} />
    </div>
  );
}
