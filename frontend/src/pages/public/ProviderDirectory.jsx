import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/shared/Navbar";
import PageTransition from "../../components/shared/PageTransition";
import { useLang } from "../../i18n/LangContext";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import {
  MapPin, Star, CheckCircle, Search,
  SlidersHorizontal, X, AlertTriangle,
  Scissors, Sparkles, Package, ChefHat, Image as ImageIcon, Heart,
} from "lucide-react";

// ── Tokens ────────────────────────────────────────────────────────────────────
const G     = "#0E5C46";
const CREAM = "#ede9e0";
const DARK  = "#172420";
const GOLD  = "#b98a22";
const MUTED = "#5c7068";
const SERIF = "Spectral, serif";
const SANS  = "'Hanken Grotesk', sans-serif";

// ── Categories ─────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { label: "Tailoring & Fashion", Icon: Scissors, keywords: /tailor|sew|dress|fashion|cloth|uniform|design/i },
  { label: "Hair & Beauty",       Icon: Sparkles,  keywords: /hair|braid|beauty|nail|skin|salon|makeup/i      },
  { label: "Handcraft & Weaving", Icon: Package,   keywords: /craft|weav|crochet|knit|basket|handmad|textile/i },
  { label: "Catering & Food",     Icon: ChefHat,   keywords: /cater|food|cook|bak|pastry|chef|meal|cake/i     },
];

const DISTRICTS = ["Gasabo", "Kicukiro", "Nyarugenge"];
const PER_PAGE  = 9;

// ── Data mapping ───────────────────────────────────────────────────────────────
function inferCategories(headline = "", skills = []) {
  const text = [headline, ...skills].join(" ");
  return CATEGORIES
    .filter((c) => c.keywords.test(text))
    .map((c) => c.label);
}

function mapProvider(row) {
  const trustScore = Math.round(Number(row.trust_score) || 0);
  const rating     = Number(row.avg_rating)   || 0;
  const reviews    = Number(row.review_count) || 0;
  const verified   = row.verification_status === "verified";
  const skills     = Array.isArray(row.specialties) ? row.specialties : [];

  // Use DB categories if the RPC returns them, otherwise infer from text
  const dbCats   = Array.isArray(row.categories) ? row.categories : [];
  const categories = dbCats.length > 0 ? dbCats : inferCategories(row.headline || "", skills);

  return {
    id:         row.provider_id,
    name:       row.full_name,
    headline:   row.headline || "Service Provider",
    district:   row.district || "—",
    trustScore,
    rating,
    reviews,
    verified,
    skills,
    categories,
    avatarUrl:  row.avatar_url || null,
  };
}

// ── Provider Card ──────────────────────────────────────────────────────────────
function ProviderCard({ provider, saved, onToggleSave }) {
  const catLabel = provider.categories[0] || null;
  const stars    = Math.round(provider.rating);

  return (
    <div style={{ backgroundColor: "white", borderRadius: 14, border: "1px solid #e8e2d8", padding: 18, display: "flex", flexDirection: "column", gap: 14, fontFamily: SANS }}>
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        {/* Photo / initials placeholder */}
        <div style={{ width: 52, height: 52, borderRadius: "50%", border: "1.5px dashed #c8c0b0", backgroundColor: "#f5f0e8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {provider.avatarUrl ? (
            <img src={provider.avatarUrl} alt={provider.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
          ) : (
            <ImageIcon size={18} style={{ color: "#c8c0b0" }} />
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Category label */}
          {catLabel && (
            <p style={{ color: G, fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 3 }}>{catLabel}</p>
          )}
          {/* Name + verified */}
          <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
            <p style={{ color: DARK, fontWeight: 700, fontSize: "0.875rem", lineHeight: 1.2 }}>{provider.name}</p>
            {provider.verified && <CheckCircle size={13} style={{ color: G, flexShrink: 0 }} />}
          </div>
          <p style={{ color: MUTED, fontSize: "0.75rem", marginTop: 2 }}>{provider.headline}</p>
        </div>

        {/* Trust score badge */}
        <div style={{ backgroundColor: DARK, borderRadius: 99, padding: "3px 10px", display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: GOLD, display: "inline-block" }} />
          <span style={{ color: "white", fontSize: "0.72rem", fontWeight: 700 }}>{provider.trustScore}</span>
        </div>
      </div>

      {/* Rating */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ display: "flex", gap: 1 }}>
          {[1,2,3,4,5].map((s) => (
            <Star key={s} size={12} style={{ color: s <= stars ? GOLD : "#d4cfc5", fill: s <= stars ? GOLD : "none" }} />
          ))}
        </span>
        {provider.reviews > 0 ? (
          <span style={{ color: MUTED, fontSize: "0.72rem" }}>{provider.rating.toFixed(1)} ({provider.reviews} review{provider.reviews !== 1 ? "s" : ""})</span>
        ) : (
          <span style={{ color: MUTED, fontSize: "0.72rem" }}>New provider</span>
        )}
      </div>

      {/* Skills */}
      {provider.skills.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {provider.skills.slice(0, 3).map((s) => (
            <span key={s} style={{ backgroundColor: "#f0ece4", color: MUTED, borderRadius: 99, padding: "3px 9px", fontSize: "0.68rem" }}>{s}</span>
          ))}
          {provider.skills.length > 3 && (
            <span style={{ backgroundColor: "#f0ece4", color: MUTED, borderRadius: 99, padding: "3px 9px", fontSize: "0.68rem" }}>+{provider.skills.length - 3}</span>
          )}
        </div>
      )}

      {/* Footer: district + CTA */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid #f0ece4", marginTop: "auto" }}>
        <span style={{ color: MUTED, fontSize: "0.75rem", display: "flex", alignItems: "center", gap: 4 }}>
          <MapPin size={11} /> {provider.district}
        </span>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {onToggleSave && (
            <button onClick={() => onToggleSave(provider.id)} aria-label={saved ? "Unsave" : "Save"}
              style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e8e2d8", backgroundColor: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Heart size={14} fill={saved ? G : "none"} style={{ color: saved ? G : MUTED }} />
            </button>
          )}
          <Link to={`/providers/${provider.id}`}
            style={{ backgroundColor: G, color: "white", borderRadius: 8, padding: "7px 18px", fontSize: "0.78rem", fontWeight: 600, textDecoration: "none" }}>
            Book
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Skeleton card ──────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ backgroundColor: "white", borderRadius: 14, border: "1px solid #e8e2d8", padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ width: 52, height: 52, borderRadius: "50%", backgroundColor: "#f0ece4" }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, justifyContent: "center" }}>
          <div style={{ height: 10, backgroundColor: "#f0ece4", borderRadius: 99, width: "60%" }} />
          <div style={{ height: 8,  backgroundColor: "#f0ece4", borderRadius: 99, width: "40%" }} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <div style={{ height: 22, backgroundColor: "#f0ece4", borderRadius: 99, width: 60 }} />
        <div style={{ height: 22, backgroundColor: "#f0ece4", borderRadius: 99, width: 80 }} />
      </div>
      <div style={{ height: 36, backgroundColor: "#f0ece4", borderRadius: 10 }} />
    </div>
  );
}

// ── Filters sidebar ────────────────────────────────────────────────────────────
function FiltersSidebar({ filters, setFilters, onClose }) {
  const set = (key, val) => setFilters((p) => ({ ...p, [key]: val }));

  const toggleCat = (label) =>
    setFilters((p) => ({
      ...p,
      categories: p.categories.includes(label)
        ? p.categories.filter((c) => c !== label)
        : [...p.categories, label],
    }));

  const clearAll = () => setFilters({ categories: [], district: "all", minRating: 0, minTrust: 0, verifiedOnly: false });

  const activeCount =
    filters.categories.length +
    (filters.district !== "all" ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.minTrust  > 0 ? 1 : 0) +
    (filters.verifiedOnly  ? 1 : 0);

  const sectionHead = { color: MUTED, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 };

  return (
    <div style={{ backgroundColor: "white", borderRadius: 14, border: "1px solid #e8e2d8", padding: 20, display: "flex", flexDirection: "column", gap: 20, position: "sticky", top: 80, fontFamily: SANS }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ color: DARK, fontWeight: 700, fontSize: "0.875rem" }}>Filters</p>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {activeCount > 0 && (
            <button onClick={clearAll} style={{ background: "none", border: "none", color: G, fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", padding: 0 }}>
              Clear ({activeCount})
            </button>
          )}
          {onClose && (
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: MUTED, display: "flex" }}>
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* District */}
      <div>
        <p style={sectionHead}>District</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {["all", ...DISTRICTS].map((d) => (
            <label key={d} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input type="radio" name="district" checked={filters.district === d} onChange={() => set("district", d)} style={{ accentColor: G }} />
              <span style={{ color: DARK, fontSize: "0.82rem" }}>{d === "all" ? "All districts" : d}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <p style={sectionHead}>Category</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {CATEGORIES.map(({ label, Icon }) => (
            <label key={label} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input type="checkbox" checked={filters.categories.includes(label)} onChange={() => toggleCat(label)} style={{ accentColor: G }} />
              <Icon size={13} style={{ color: G, flexShrink: 0 }} />
              <span style={{ color: DARK, fontSize: "0.82rem", flex: 1 }}>{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <p style={sectionHead}>Minimum Rating</p>
        <div style={{ display: "flex", gap: 6 }}>
          {[0, 4, 4.5].map((r) => (
            <button
              key={r}
              onClick={() => set("minRating", r)}
              style={{ flex: 1, padding: "6px 0", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: SANS, fontSize: "0.75rem", fontWeight: 600, backgroundColor: filters.minRating === r ? G : "#f0ece4", color: filters.minRating === r ? "white" : MUTED }}
            >
              {r === 0 ? "Any" : `${r}+`}
            </button>
          ))}
        </div>
      </div>

      {/* Trust score */}
      <div>
        <p style={sectionHead}>Minimum Trust Score</p>
        <input type="range" min="0" max="95" step="5" value={filters.minTrust} onChange={(e) => set("minTrust", Number(e.target.value))} style={{ width: "100%", accentColor: G }} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <span style={{ color: MUTED, fontSize: "0.7rem" }}>Any</span>
          <span style={{ color: G, fontSize: "0.7rem", fontWeight: 700 }}>{filters.minTrust > 0 ? `${filters.minTrust}+` : "Any"}</span>
          <span style={{ color: MUTED, fontSize: "0.7rem" }}>95</span>
        </div>
      </div>

      {/* Verified only */}
      <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
        <input type="checkbox" checked={filters.verifiedOnly} onChange={(e) => set("verifiedOnly", e.target.checked)} style={{ accentColor: G }} />
        <span style={{ color: DARK, fontSize: "0.82rem", display: "flex", alignItems: "center", gap: 5 }}>
          <CheckCircle size={13} style={{ color: G }} /> Verified only
        </span>
      </label>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function ProviderDirectory() {
  const { t }    = useLang();
  const { user } = useAuth();
  const [search,             setSearch]             = useState("");
  const [sortBy,             setSortBy]             = useState("trust");
  const [providers,          setProviders]          = useState([]);
  const [loading,            setLoading]            = useState(true);
  const [error,              setError]              = useState("");
  const [page,               setPage]               = useState(1);
  const [mobileFiltersOpen,  setMobileFiltersOpen]  = useState(false);
  const [savedIds,           setSavedIds]           = useState(new Set());
  const [filters, setFilters] = useState({ categories: [], district: "all", minRating: 0, minTrust: 0, verifiedOnly: false });

  // Fetch from Supabase RPC
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const { data, error: rpcErr } = await supabase.rpc("get_providers");
        if (rpcErr) throw new Error(rpcErr.message);
        if (!cancelled) setProviders((data || []).map(mapProvider));
      } catch (err) {
        if (!cancelled) setError(err.message || "Could not load providers.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Load saved provider IDs for the logged-in customer
  useEffect(() => {
    if (!user?.id || user?.role !== "customer") return;
    supabase.from("saved_providers").select("provider_profile_id").eq("customer_id", user.id)
      .then(({ data }) => { if (data) setSavedIds(new Set(data.map(r => r.provider_profile_id))); });
  }, [user?.id]);

  const handleToggleSave = async (profileId) => {
    if (!user?.id) { window.location.href = "/login"; return; }
    if (savedIds.has(profileId)) {
      const { error } = await supabase.from("saved_providers").delete().eq("customer_id", user.id).eq("provider_profile_id", profileId);
      if (!error) setSavedIds(prev => { const s = new Set(prev); s.delete(profileId); return s; });
    } else {
      const { error } = await supabase.from("saved_providers").insert({ customer_id: user.id, provider_profile_id: profileId });
      if (!error) setSavedIds(prev => new Set([...prev, profileId]));
    }
  };

  // Reset page on filter/search change
  useEffect(() => { setPage(1); }, [search, sortBy, filters]);

  const filtered = useMemo(() => {
    let result = providers.filter((p) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.headline.toLowerCase().includes(q) ||
        p.skills.some((s) => s.toLowerCase().includes(q)) ||
        p.categories.some((c) => c.toLowerCase().includes(q));

      const matchesDistrict  = filters.district === "all" || p.district === filters.district;
      const matchesCategory  = filters.categories.length === 0 || p.categories.some((c) => filters.categories.includes(c));
      const matchesRating    = p.rating    >= filters.minRating;
      const matchesTrust     = p.trustScore >= filters.minTrust;
      const matchesVerified  = !filters.verifiedOnly || p.verified;

      return matchesSearch && matchesDistrict && matchesCategory && matchesRating && matchesTrust && matchesVerified;
    });

    result.sort((a, b) => {
      const verifiedDiff = (b.verified ? 1 : 0) - (a.verified ? 1 : 0);
      if (sortBy === "trust")   { const d = b.trustScore - a.trustScore; return d !== 0 ? d : verifiedDiff; }
      if (sortBy === "rating")  { const d = b.rating - a.rating;         return d !== 0 ? d : verifiedDiff; }
      if (sortBy === "reviews") { const d = b.reviews - a.reviews;       return d !== 0 ? d : verifiedDiff; }
      return verifiedDiff;
    });

    return result;
  }, [providers, search, sortBy, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const activeFilterCount =
    filters.categories.length +
    (filters.district !== "all" ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.minTrust  > 0 ? 1 : 0) +
    (filters.verifiedOnly  ? 1 : 0);

  return (
    <PageTransition>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: CREAM, fontFamily: SANS }}>
        <Navbar />

        {/* Header */}
        <section style={{ backgroundColor: CREAM, borderBottom: "1px solid #d4cfc5", padding: "32px 24px 24px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <h1 style={{ fontFamily: SERIF, color: DARK, fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                {t("dir_title")}
              </h1>
              <p style={{ color: MUTED, fontSize: "0.875rem", marginTop: 6 }}>
                {loading ? t("shared_loading") : `${filtered.length} provider${filtered.length !== 1 ? "s" : ""} in Kigali`}
              </p>
            </div>

            {/* Search bar */}
            <div style={{ display: "flex", gap: 0, backgroundColor: "white", borderRadius: 12, border: "1px solid #d4cfc5", overflow: "hidden", maxWidth: 560 }}>
              <div style={{ display: "flex", alignItems: "center", paddingLeft: 14 }}>
                <Search size={16} style={{ color: MUTED }} />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("dir_search_ph")}
                style={{ flex: 1, padding: "11px 12px", border: "none", outline: "none", fontFamily: SANS, fontSize: "0.875rem", color: DARK, backgroundColor: "transparent" }}
              />
              {search && (
                <button onClick={() => setSearch("")} style={{ padding: "0 12px", background: "none", border: "none", cursor: "pointer", color: MUTED }}>
                  <X size={14} />
                </button>
              )}
              <button
                style={{ backgroundColor: G, color: "white", border: "none", padding: "0 20px", fontFamily: SANS, fontWeight: 600, fontSize: "0.875rem", cursor: "pointer" }}
              >
                Search
              </button>
            </div>

            {/* Category quick pills */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {CATEGORIES.map(({ label, Icon }) => {
                const active = filters.categories.includes(label);
                return (
                  <button
                    key={label}
                    onClick={() => setFilters((p) => ({
                      ...p,
                      categories: active ? p.categories.filter((c) => c !== label) : [...p.categories, label],
                    }))}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 99, border: `1px solid ${active ? G : "#d4cfc5"}`, backgroundColor: active ? G : "white", color: active ? "white" : MUTED, fontSize: "0.78rem", fontWeight: 500, cursor: "pointer", fontFamily: SANS }}
                  >
                    <Icon size={13} /> {label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Body */}
        <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%", padding: "28px 24px", flex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 24 }}>
            {/* Sidebar */}
            <div>
              <FiltersSidebar filters={filters} setFilters={setFilters} />
            </div>

            {/* Results */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Toolbar */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                {/* Mobile filter toggle */}
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  style={{ display: "none", alignItems: "center", gap: 6, padding: "8px 14px", border: "1px solid #d4cfc5", borderRadius: 8, backgroundColor: "white", fontFamily: SANS, fontSize: "0.8rem", fontWeight: 500, color: DARK, cursor: "pointer" }}
                >
                  <SlidersHorizontal size={14} /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                </button>

                <p style={{ color: MUTED, fontSize: "0.8rem" }}>
                  {!loading && filtered.length > 0 &&
                    `Showing ${(page - 1) * PER_PAGE + 1}–${Math.min(page * PER_PAGE, filtered.length)} of ${filtered.length}`}
                </p>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: MUTED, fontSize: "0.78rem" }}>Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{ border: "1px solid #d4cfc5", borderRadius: 8, padding: "7px 12px", fontFamily: SANS, fontSize: "0.8rem", color: DARK, backgroundColor: "white", outline: "none", cursor: "pointer" }}
                  >
                    <option value="trust">Trust Score</option>
                    <option value="rating">Highest Rated</option>
                    <option value="reviews">Most Reviews</option>
                  </select>
                </div>
              </div>

              {/* Active filter chips */}
              {activeFilterCount > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {filters.categories.map((cat) => (
                    <span key={cat} style={{ display: "flex", alignItems: "center", gap: 5, backgroundColor: "#e8f3ee", color: G, borderRadius: 99, padding: "4px 10px", fontSize: "0.72rem", fontWeight: 600 }}>
                      {cat}
                      <button onClick={() => setFilters((p) => ({ ...p, categories: p.categories.filter((c) => c !== cat) }))} style={{ background: "none", border: "none", cursor: "pointer", color: G, display: "flex", padding: 0 }}><X size={10} /></button>
                    </span>
                  ))}
                  {filters.district !== "all" && (
                    <span style={{ display: "flex", alignItems: "center", gap: 5, backgroundColor: "#e8f3ee", color: G, borderRadius: 99, padding: "4px 10px", fontSize: "0.72rem", fontWeight: 600 }}>
                      <MapPin size={10} /> {filters.district}
                      <button onClick={() => setFilters((p) => ({ ...p, district: "all" }))} style={{ background: "none", border: "none", cursor: "pointer", color: G, display: "flex", padding: 0 }}><X size={10} /></button>
                    </span>
                  )}
                  {filters.minRating > 0 && (
                    <span style={{ display: "flex", alignItems: "center", gap: 5, backgroundColor: "#e8f3ee", color: G, borderRadius: 99, padding: "4px 10px", fontSize: "0.72rem", fontWeight: 600 }}>
                      {filters.minRating}+ <Star size={10} />
                      <button onClick={() => setFilters((p) => ({ ...p, minRating: 0 }))} style={{ background: "none", border: "none", cursor: "pointer", color: G, display: "flex", padding: 0 }}><X size={10} /></button>
                    </span>
                  )}
                  {filters.minTrust > 0 && (
                    <span style={{ display: "flex", alignItems: "center", gap: 5, backgroundColor: "#e8f3ee", color: G, borderRadius: 99, padding: "4px 10px", fontSize: "0.72rem", fontWeight: 600 }}>
                      Trust {filters.minTrust}+
                      <button onClick={() => setFilters((p) => ({ ...p, minTrust: 0 }))} style={{ background: "none", border: "none", cursor: "pointer", color: G, display: "flex", padding: 0 }}><X size={10} /></button>
                    </span>
                  )}
                  {filters.verifiedOnly && (
                    <span style={{ display: "flex", alignItems: "center", gap: 5, backgroundColor: "#e8f3ee", color: G, borderRadius: 99, padding: "4px 10px", fontSize: "0.72rem", fontWeight: 600 }}>
                      <CheckCircle size={10} /> Verified only
                      <button onClick={() => setFilters((p) => ({ ...p, verifiedOnly: false }))} style={{ background: "none", border: "none", cursor: "pointer", color: G, display: "flex", padding: 0 }}><X size={10} /></button>
                    </span>
                  )}
                </div>
              )}

              {/* Grid */}
              {error ? (
                <div style={{ backgroundColor: "white", borderRadius: 14, border: "1px solid #e8e2d8", padding: 48, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                  <AlertTriangle size={28} style={{ color: "#e05c5c" }} />
                  <p style={{ color: DARK, fontWeight: 600, fontSize: "0.9rem" }}>Couldn't load providers</p>
                  <p style={{ color: MUTED, fontSize: "0.8rem" }}>{error}</p>
                  <button onClick={() => window.location.reload()} style={{ backgroundColor: G, color: "white", border: "none", borderRadius: 8, padding: "9px 20px", fontFamily: SANS, fontWeight: 600, fontSize: "0.8rem", cursor: "pointer", marginTop: 8 }}>
                    Retry
                  </button>
                </div>
              ) : loading ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                  {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : paginated.length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                  {paginated.map((p) => <ProviderCard key={p.id} provider={p} saved={savedIds.has(p.id)} onToggleSave={user?.role === "customer" ? handleToggleSave : null} />)}
                </div>
              ) : (
                <div style={{ backgroundColor: "white", borderRadius: 14, border: "1px solid #e8e2d8", padding: 48, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                  <Search size={28} style={{ color: "#c8c0b0" }} />
                  <p style={{ color: DARK, fontWeight: 600, fontSize: "0.9rem" }}>No providers match your search</p>
                  <p style={{ color: MUTED, fontSize: "0.8rem" }}>Try removing some filters or searching a different term.</p>
                  <button
                    onClick={() => { setSearch(""); setFilters({ categories: [], district: "all", minRating: 0, minTrust: 0, verifiedOnly: false }); }}
                    style={{ backgroundColor: G, color: "white", border: "none", borderRadius: 8, padding: "9px 20px", fontFamily: SANS, fontWeight: 600, fontSize: "0.8rem", cursor: "pointer", marginTop: 8 }}
                  >
                    Reset filters
                  </button>
                </div>
              )}

              {/* Pagination */}
              {!loading && filtered.length > PER_PAGE && (
                <div style={{ display: "flex", justifyContent: "center", gap: 6, paddingTop: 8 }}>
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    style={{ padding: "7px 14px", border: "1px solid #d4cfc5", borderRadius: 8, backgroundColor: "white", fontFamily: SANS, fontSize: "0.8rem", color: DARK, cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.4 : 1 }}
                  >
                    ← Prev
                  </button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      style={{ width: 36, height: 36, borderRadius: 8, border: "none", cursor: "pointer", fontFamily: SANS, fontSize: "0.8rem", fontWeight: 600, backgroundColor: page === i + 1 ? G : "white", color: page === i + 1 ? "white" : DARK, outline: page === i + 1 ? "none" : "1px solid #d4cfc5" }}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    style={{ padding: "7px 14px", border: "1px solid #d4cfc5", borderRadius: 8, backgroundColor: "white", fontFamily: SANS, fontSize: "0.8rem", color: DARK, cursor: page === totalPages ? "not-allowed" : "pointer", opacity: page === totalPages ? 0.4 : 1 }}
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
          <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex" }}>
            <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)" }} onClick={() => setMobileFiltersOpen(false)} />
            <div style={{ position: "relative", backgroundColor: "white", width: "100%", maxWidth: 320, height: "100%", marginLeft: "auto", overflowY: "auto", padding: 16 }}>
              <FiltersSidebar filters={filters} setFilters={setFilters} onClose={() => setMobileFiltersOpen(false)} />
              <button
                onClick={() => setMobileFiltersOpen(false)}
                style={{ width: "100%", marginTop: 16, backgroundColor: G, color: "white", border: "none", borderRadius: 10, padding: "12px 0", fontFamily: SANS, fontWeight: 600, fontSize: "0.875rem", cursor: "pointer" }}
              >
                Show {filtered.length} Results
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer style={{ backgroundColor: "#0a3d2c", padding: "20px 24px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="14" height="17" viewBox="0 0 18 22" fill="none">
                <path d="M9 2C9 2 3 5.5 3 12C3 16.5 5.5 19 9 19L9 21L13 17.5L9 14L9 16.5C7 16.5 5 15 5 12C5 7.5 9 5 9 5L9 2Z" fill="white" />
              </svg>
              <span style={{ color: "white", fontFamily: SERIF, fontWeight: 700, fontSize: "0.9rem" }}>Inzira Works</span>
            </div>
            <p style={{ color: "#6aab8e", fontSize: "0.72rem" }}>A capstone project · Enhancing market access for skilled women in Kigali City</p>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
}
