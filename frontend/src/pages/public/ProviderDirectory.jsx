// src/pages/public/ProviderDirectory.jsx
// Public Provider Directory — browse & search page (no login required)
// Includes: Navbar, hero search header, filters sidebar, provider grid, pagination, footer
// Fetches live providers from the backend (GET /api/providers).

import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useLang } from "../../i18n/LangContext";
import LanguageSwitcher from "../../components/shared/LanguageSwitcher";
import { supabase } from "../../lib/supabase";
import {
  MapPin, Star, CheckCircle, ArrowRight,
  Menu, X, SlidersHorizontal, Search, AlertTriangle,
  Scissors, Sparkles, Package, ChefHat,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORIES  (focused on the four core services)
// Each category has an `image` (shown as a thumbnail) and an `emoji` fallback
// that displays automatically if the image file is missing.
// Put the image files in:  frontend/public/categories/
// ─────────────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { label: "Tailoring & Fashion", image: "/categories/tailoring.jpg", Icon: Scissors, count: 142 },
  { label: "Hair & Beauty",       image: "/categories/hair.jpg",      Icon: Sparkles,  count: 98  },
  { label: "Handcraft & Weaving", image: "/categories/handcraft.jpg", Icon: Package,   count: 76  },
  { label: "Catering & Food",     image: "/categories/catering.jpg",  Icon: ChefHat,   count: 61  },
];

const DISTRICTS = ["Gasabo", "Kicukiro", "Nyarugenge"];

// ─────────────────────────────────────────────────────────────────────────────
// API → CARD MAPPING
// The backend (GET /api/providers) returns snake_case rows with numbers as
// strings. These helpers turn one row into the shape ProviderCard expects.
// ─────────────────────────────────────────────────────────────────────────────
const AVATAR_PALETTE = ["#F97316", "#8B5CF6", "#10B981", "#3B82F6", "#EC4899", "#A855F7", "#06B6D4", "#F59E0B"];

function initialsFrom(name = "") {
  return name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

// Deterministic avatar color so the same provider always gets the same colour.
function colorFromId(id = "") {
  let sum = 0;
  for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i);
  return AVATAR_PALETTE[sum % AVATAR_PALETTE.length];
}

function mapProvider(row) {
  const trustScore = Math.round(Number(row.trust_score) || 0);
  const rating = Number(row.avg_rating) || 0;
  const reviews = Number(row.review_count) || 0;
  const verified = row.verification_status === "verified";
  return {
    id: row.provider_id,
    name: row.full_name,
    role: row.headline || "Service Provider",
    district: row.district || "—",
    trustScore,
    rating,
    reviews,
    verified,
    skills: Array.isArray(row.specialties) ? row.specialties : [],
    initials: initialsFrom(row.full_name),
    color: colorFromId(row.provider_id),
    badge: trustScore >= 90 ? "Top Rated" : verified ? "Verified" : "New",
    category: null, // backend doesn't return category yet — see filtered()
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────

function CategoryIcon({ category, size = 20 }) {
  const [imgOk, setImgOk] = useState(!!category.image);

  if (imgOk) {
    return (
      <img
        src={category.image}
        alt={category.label}
        onError={() => setImgOk(false)}
        style={{ width: size, height: size, objectFit: "cover", borderRadius: 4, flexShrink: 0 }}
      />
    );
  }
  const Icon = category.Icon;
  return <Icon size={size * 0.8} style={{ color: "#F97316", flexShrink: 0 }} />;
}

function StarRating({ rating, size = "sm" }) {
  const px = size === "sm" ? 12 : 14;
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={px}
          style={{
            color: s <= Math.round(rating) ? "#F97316" : "#CBD5E1",
            fill:  s <= Math.round(rating) ? "#F97316" : "none",
          }}
        />
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

function Avatar({ initials, color, size = 48 }) {
  return (
    <div style={{ width: size, height: size, backgroundColor: color + "20", border: `2px solid ${color}`, color, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: size * 0.35, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROVIDER CARD
// ─────────────────────────────────────────────────────────────────────────────
function ProviderCard({ provider }) {
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
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 flex-shrink-0">
          {provider.badge}
        </span>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <TrustScoreBadge score={provider.trustScore} />
        {provider.reviews > 0 ? (
          <div className="flex items-center gap-1">
            <StarRating rating={provider.rating} />
            <span className="text-xs text-slate-500">{provider.rating.toFixed(1)} ({provider.reviews})</span>
          </div>
        ) : (
          <span className="text-xs text-slate-400">New provider</span>
        )}
        {provider.verified && (
          <span className="text-xs text-emerald-600 flex items-center gap-1">
            <CheckCircle size={11} /> Verified
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {provider.skills.map((s) => (
          <span key={s} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{s}</span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-slate-400">
          <MapPin size={12} />
          <span className="text-xs">{provider.district}</span>
        </div>
        <Link
          to={`/providers/${provider.id}`}
          className="text-xs font-semibold flex items-center gap-1 hover:opacity-80 transition-opacity"
          style={{ color: "#F97316" }}
        >
          View Profile <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON CARD (loading state)
// ─────────────────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-slate-100" />
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-3 bg-slate-100 rounded w-2/3" />
          <div className="h-2.5 bg-slate-100 rounded w-1/2" />
        </div>
      </div>
      <div className="h-2.5 bg-slate-100 rounded w-1/3" />
      <div className="flex gap-1.5">
        <div className="h-5 bg-slate-100 rounded-full w-16" />
        <div className="h-5 bg-slate-100 rounded-full w-20" />
      </div>
      <div className="h-8 bg-slate-100 rounded-lg" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NAVBAR (shared, simplified for directory page)
// ─────────────────────────────────────────────────────────────────────────────
function Navbar() {
  const { t } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-200 bg-white ${scrolled ? "shadow-sm" : "border-b border-slate-100"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div style={{ backgroundColor: "#F97316" }} className="w-8 h-8 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-sm">IW</span>
          </div>
          <span style={{ color: "#1E293B" }} className="font-bold text-lg tracking-tight">Inzira Works</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/providers" style={{ color: "#F97316" }} className="text-sm font-semibold">{t("nav_browse")}</Link>
          <a href="#" className="text-sm font-medium text-slate-600 hover:text-orange-500 transition-colors">{t("nav_how")}</a>
          <a href="#" className="text-sm font-medium text-slate-600 hover:text-orange-500 transition-colors">{t("nav_about")}</a>
          <a href="#" className="text-sm font-medium text-slate-600 hover:text-orange-500 transition-colors">{t("nav_contact")}</a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher compact />
          <div className="w-px h-5 bg-slate-200" />
          <Link to="/login" style={{ color: "#1E293B" }} className="text-sm font-medium hover:text-orange-500 transition-colors">{t("nav_login")}</Link>
          <Link to="/signup" style={{ backgroundColor: "#F97316" }} className="text-sm font-semibold text-white px-4 py-2 rounded-xl hover:opacity-90 transition-opacity">{t("nav_getstarted")}</Link>
        </div>

        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors" aria-label="Toggle menu">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 flex flex-col gap-4">
          <Link to="/providers" style={{ color: "#F97316" }} className="text-sm font-semibold">{t("nav_browse")}</Link>
          <a href="#" className="text-sm font-medium text-slate-700">{t("nav_how")}</a>
          <a href="#" className="text-sm font-medium text-slate-700">{t("nav_about")}</a>
          <a href="#" className="text-sm font-medium text-slate-700">{t("nav_contact")}</a>
          <LanguageSwitcher />
          <div className="flex gap-3 pt-1">
            <Link to="/login" className="text-sm font-medium text-slate-700 border border-slate-200 px-4 py-2 rounded-xl flex-1 text-center">{t("nav_login")}</Link>
            <Link to="/signup" style={{ backgroundColor: "#F97316" }} className="text-sm font-semibold text-white px-4 py-2 rounded-xl flex-1 text-center">{t("nav_getstarted")}</Link>
          </div>
        </div>
      )}
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FOOTER (compact)
// ─────────────────────────────────────────────────────────────────────────────
function Footer() {
  const { t } = useLang();
  return (
    <footer style={{ backgroundColor: "#0F172A" }} className="py-10 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div style={{ backgroundColor: "#F97316" }} className="w-7 h-7 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-xs">IW</span>
          </div>
          <span className="text-white font-bold text-sm">Inzira Works</span>
        </div>
        <p className="text-slate-500 text-xs">© {new Date().getFullYear()} {t("foot_copy")}</p>
        <p className="text-slate-700 text-xs">{t("foot_capstone")}</p>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FILTERS SIDEBAR
// ─────────────────────────────────────────────────────────────────────────────
function FiltersSidebar({ filters, setFilters, onClose }) {
  const setFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

  const toggleCategory = (cat) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat],
    }));
  };

  const clearAll = () => setFilters({
    categories: [],
    district: "all",
    minRating: 0,
    minTrust: 0,
    verifiedOnly: false,
  });

  const activeCount = filters.categories.length
    + (filters.district !== "all" ? 1 : 0)
    + (filters.minRating > 0 ? 1 : 0)
    + (filters.minTrust > 0 ? 1 : 0)
    + (filters.verifiedOnly ? 1 : 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-6 sticky top-20">
      <div className="flex items-center justify-between">
        <h3 style={{ color: "#1E293B" }} className="font-bold">Filters</h3>
        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <button onClick={clearAll} style={{ color: "#F97316" }} className="text-xs font-semibold hover:underline">
              Clear ({activeCount})
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 lg:hidden transition-colors">
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* District */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">District</p>
        <div className="flex flex-col gap-1.5">
          {["all", ...DISTRICTS].map((d) => (
            <label key={d} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="district"
                checked={filters.district === d}
                onChange={() => setFilter("district", d)}
                className="accent-orange-500"
              />
              <span className="text-sm text-slate-600">{d === "all" ? "All Districts" : d}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Category */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Category</p>
        <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
          {CATEGORIES.map((cat) => (
            <label key={cat.label} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.categories.includes(cat.label)}
                onChange={() => toggleCategory(cat.label)}
                className="accent-orange-500"
              />
              <CategoryIcon category={cat} size={18} />
              <span className="text-sm text-slate-600 flex-1">{cat.label}</span>
              <span className="text-xs text-slate-400">{cat.count}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Minimum rating */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Minimum Rating</p>
        <div className="flex gap-2">
          {[0, 4, 4.5].map((r) => (
            <button
              key={r}
              onClick={() => setFilter("minRating", r)}
              className="flex-1 text-xs font-semibold py-1.5 rounded-lg transition-all"
              style={{
                backgroundColor: filters.minRating === r ? "#F97316" : "#F1F5F9",
                color: filters.minRating === r ? "white" : "#64748B",
              }}
            >
              {r === 0 ? "Any" : `${r}+`}
            </button>
          ))}
        </div>
      </div>

      {/* Trust score */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Minimum Trust Score</p>
        <div className="flex flex-col gap-2">
          <input
            type="range"
            min="0"
            max="95"
            step="5"
            value={filters.minTrust}
            onChange={(e) => setFilter("minTrust", Number(e.target.value))}
            className="w-full accent-orange-500"
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>Any</span>
            <span style={{ color: "#F97316" }} className="font-bold">{filters.minTrust}+</span>
            <span>95</span>
          </div>
        </div>
      </div>

      {/* Verified only */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={filters.verifiedOnly}
          onChange={(e) => setFilter("verifiedOnly", e.target.checked)}
          className="accent-orange-500"
        />
        <span className="text-sm text-slate-600 flex items-center gap-1.5">
          <CheckCircle size={14} className="text-emerald-500" /> Verified providers only
        </span>
      </label>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function ProviderDirectory() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("trust");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [providers, setProviders] = useState([]);
  const [page, setPage] = useState(1);
  const PER_PAGE = 6;

  const [filters, setFilters] = useState({
    categories: [],
    district: "all",
    minRating: 0,
    minTrust: 0,
    verifiedOnly: false,
  });

  // Fetch real providers from the backend: GET /api/providers
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const { data: rows, error } = await supabase.rpc("get_providers");
        if (error) throw new Error(error.message);
        if (!cancelled) setProviders(rows.map(mapProvider));
      } catch (err) {
        if (!cancelled) setError(err.message || "Could not load providers.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Reset to page 1 whenever filters/search/sort change
  useEffect(() => {
    setPage(1);
  }, [search, sortBy, filters]);

  const filtered = useMemo(() => {
    let result = providers.filter((p) => {
      const matchesSearch = search === "" ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.role.toLowerCase().includes(search.toLowerCase()) ||
        p.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()));

      const matchesDistrict = filters.district === "all" || p.district === filters.district;
      // Category filtering activates once the backend returns each provider's
      // category. Until then category is null, so providers are not excluded.
      const matchesCategory =
        filters.categories.length === 0 ||
        p.category == null ||
        filters.categories.includes(p.category);
      const matchesRating = p.rating >= filters.minRating;
      const matchesTrust = p.trustScore >= filters.minTrust;
      const matchesVerified = !filters.verifiedOnly || p.verified;

      return matchesSearch && matchesDistrict && matchesCategory && matchesRating && matchesTrust && matchesVerified;
    });

    result = [...result].sort((a, b) => {
      if (sortBy === "trust") return b.trustScore - a.trustScore;
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "reviews") return b.reviews - a.reviews;
      return 0;
    });

    return result;
  }, [providers, search, sortBy, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const activeFilterCount = filters.categories.length
    + (filters.district !== "all" ? 1 : 0)
    + (filters.minRating > 0 ? 1 : 0)
    + (filters.minTrust > 0 ? 1 : 0)
    + (filters.verifiedOnly ? 1 : 0);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F8FAFC" }}>
      <Navbar />

      {/* Header / Search */}
      <section
        style={{ background: "linear-gradient(135deg, #FFF7ED 0%, #FFECD2 60%, #FFF7ED 100%)" }}
        className="py-10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col gap-5">
          <div>
            <h1 style={{ color: "#1E293B" }} className="text-2xl sm:text-3xl font-black tracking-tight">
              Browse Skilled Women in Kigali
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {filtered.length} verified provider{filtered.length !== 1 ? "s" : ""} ready to help with your project
            </p>
          </div>

          {/* Search bar */}
          <div className="flex gap-2 bg-white rounded-2xl shadow-md p-2 border border-slate-100 max-w-2xl">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, skill, or service (e.g. Tailor, Braiding)..."
              className="flex-1 px-4 py-2 text-sm text-slate-700 outline-none bg-transparent placeholder-slate-400"
            />
            <button style={{ backgroundColor: "#F97316" }} className="text-white font-semibold text-sm px-5 py-2 rounded-xl hover:opacity-90 transition-opacity whitespace-nowrap">
              Search
            </button>
          </div>

          {/* Category quick pills */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => {
              const isActive = filters.categories.includes(cat.label);
              return (
                <button
                  key={cat.label}
                  onClick={() => setFilters((prev) => ({
                    ...prev,
                    categories: isActive ? prev.categories.filter((c) => c !== cat.label) : [...prev.categories, cat.label],
                  }))}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex-shrink-0"
                  style={{
                    backgroundColor: isActive ? "#F97316" : "white",
                    color: isActive ? "white" : "#64748B",
                    border: isActive ? "1px solid #F97316" : "1px solid #E2E8F0",
                  }}
                >
                  <CategoryIcon category={cat} size={16} rounded={4} /> {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          {/* Desktop filters sidebar */}
          <div className="hidden lg:block">
            <FiltersSidebar filters={filters} setFilters={setFilters} />
          </div>

          {/* Results */}
          <div className="flex flex-col gap-5">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 text-sm font-semibold text-slate-600 border border-slate-200 bg-white px-4 py-2 rounded-xl"
              >
                <SlidersHorizontal size={15} /> Filters {activeFilterCount > 0 && <span style={{ backgroundColor: "#F97316" }} className="text-white text-xs rounded-full px-1.5">{activeFilterCount}</span>}
              </button>

              <p className="text-sm text-slate-500 hidden sm:block">
                Showing {paginated.length === 0 ? 0 : (page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
              </p>

              <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs text-slate-400">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm font-medium text-slate-600 border border-slate-200 rounded-xl px-3 py-2 outline-none bg-white"
                >
                  <option value="trust">Trust Score</option>
                  <option value="rating">Highest Rated</option>
                  <option value="reviews">Most Reviews</option>
                </select>
              </div>
            </div>

            {/* Active filter chips */}
            {activeFilterCount > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                {filters.categories.map((cat) => (
                  <span key={cat} className="flex items-center gap-1.5 text-xs font-medium bg-orange-50 text-orange-600 px-3 py-1 rounded-full">
                    {cat}
                    <button onClick={() => setFilters((p) => ({ ...p, categories: p.categories.filter((c) => c !== cat) }))}><X size={11} /></button>
                  </span>
                ))}
                {filters.district !== "all" && (
                  <span className="flex items-center gap-1.5 text-xs font-medium bg-orange-50 text-orange-600 px-3 py-1 rounded-full">
                    <MapPin size={11} /> {filters.district}
                    <button onClick={() => setFilters((p) => ({ ...p, district: "all" }))}><X size={11} /></button>
                  </span>
                )}
                {filters.minRating > 0 && (
                  <span className="flex items-center gap-1.5 text-xs font-medium bg-orange-50 text-orange-600 px-3 py-1 rounded-full">
                    {filters.minRating}+ <Star size={11} style={{ fill: "#EA580C" }} />
                    <button onClick={() => setFilters((p) => ({ ...p, minRating: 0 }))}><X size={11} /></button>
                  </span>
                )}
                {filters.minTrust > 0 && (
                  <span className="flex items-center gap-1.5 text-xs font-medium bg-orange-50 text-orange-600 px-3 py-1 rounded-full">
                    Trust {filters.minTrust}+
                    <button onClick={() => setFilters((p) => ({ ...p, minTrust: 0 }))}><X size={11} /></button>
                  </span>
                )}
                {filters.verifiedOnly && (
                  <span className="flex items-center gap-1.5 text-xs font-medium bg-orange-50 text-orange-600 px-3 py-1 rounded-full">
                    <CheckCircle size={11} /> Verified only
                    <button onClick={() => setFilters((p) => ({ ...p, verifiedOnly: false }))}><X size={11} /></button>
                  </span>
                )}
              </div>
            )}

            {/* Grid */}
            {error ? (
              <div className="bg-white rounded-2xl border border-red-100 p-12 text-center flex flex-col items-center gap-3">
                <AlertTriangle size={28} className="text-red-300" />
                <p className="font-semibold text-slate-700">Couldn't load providers</p>
                <p className="text-sm text-slate-400">{error}</p>
              </div>
            ) : loading ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : paginated.length > 0 ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {paginated.map((p) => <ProviderCard key={p.id} provider={p} />)}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center flex flex-col items-center gap-3">
                <Search size={28} className="text-slate-300" />
                <p className="font-semibold text-slate-700">No providers match your filters</p>
                <p className="text-sm text-slate-400">Try removing some filters or searching a different term.</p>
                <button
                  onClick={() => { setSearch(""); setFilters({ categories: [], district: "all", minRating: 0, minTrust: 0, verifiedOnly: false }); }}
                  style={{ backgroundColor: "#F97316" }}
                  className="text-white text-sm font-semibold px-5 py-2 rounded-xl hover:opacity-90 transition-opacity mt-1"
                >
                  Reset Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {!loading && filtered.length > PER_PAGE && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-2 rounded-lg text-sm font-medium border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                >
                  ← Prev
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className="w-9 h-9 rounded-lg text-sm font-semibold transition-colors"
                    style={{
                      backgroundColor: page === i + 1 ? "#F97316" : "white",
                      color: page === i + 1 ? "white" : "#64748B",
                      border: page === i + 1 ? "none" : "1px solid #E2E8F0",
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-2 rounded-lg text-sm font-medium border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filters drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
          <div className="relative bg-white w-full max-w-sm h-full ml-auto overflow-y-auto p-4">
            <FiltersSidebar filters={filters} setFilters={setFilters} onClose={() => setMobileFiltersOpen(false)} />
            <button
              onClick={() => setMobileFiltersOpen(false)}
              style={{ backgroundColor: "#F97316" }}
              className="w-full text-white font-semibold py-3 rounded-xl mt-4 hover:opacity-90 transition-opacity"
            >
              Show {filtered.length} Results
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
