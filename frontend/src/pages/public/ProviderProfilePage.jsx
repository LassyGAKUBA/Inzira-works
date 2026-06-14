// src/pages/public/ProviderProfilePage.jsx
// Public Provider Profile — full detail view linked from the Directory
// Includes: Navbar, profile header, Trust Score breakdown, portfolio gallery,
// reviews, booking modal, similar providers, Footer

import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useLang } from "../../i18n/LangContext";
import LanguageSwitcher from "../../components/shared/LanguageSwitcher";

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA
// In a real app this would come from an API call using the :id param
// ─────────────────────────────────────────────────────────────────────────────
const PROVIDERS_DB = {
  1: {
    id: 1,
    name: "Uwase Clarisse",
    role: "Tailor & Fashion Designer",
    district: "Gasabo",
    sector: "Kimironko",
    trustScore: 94,
    rating: 4.9,
    reviews: 38,
    completedJobs: 112,
    responseRate: 97,
    responseTime: "~1 hour",
    memberSince: "January 2024",
    badge: "Top Rated",
    verified: true,
    initials: "UC",
    color: "#F97316",
    skills: ["Dresses", "Uniforms", "Alterations", "Traditional Imishanana", "Wedding Wear"],
    bio: "I am a professional tailor based in Gasabo with over 7 years of experience in fashion design and alterations. I specialize in wedding dresses, traditional Rwandan attire, and office wear. I take pride in attention to detail and always deliver on time. Let's bring your vision to life!",
    services: [
      { name: "Dress Alteration", price: "RWF 5,000 – 15,000", duration: "1-2 days" },
      { name: "Custom Wedding Dress", price: "RWF 80,000 – 200,000", duration: "2-3 weeks" },
      { name: "School Uniform (per set)", price: "RWF 8,000", duration: "3-5 days" },
      { name: "Traditional Imishanana", price: "RWF 40,000 – 70,000", duration: "1 week" },
    ],
    portfolio: [
      { id: 1, title: "Wedding Dress Collection", category: "Formal Wear", emoji: "👗" },
      { id: 2, title: "School Uniforms Batch", category: "Uniforms", emoji: "👔" },
      { id: 3, title: "Traditional Imishanana", category: "Traditional", emoji: "🪡" },
      { id: 4, title: "Office Suit Series", category: "Formal Wear", emoji: "🧥" },
      { id: 5, title: "Children's Clothing Set", category: "Kids Wear", emoji: "🧒" },
      { id: 6, title: "Casual Dress Line", category: "Casual", emoji: "👘" },
    ],
    trustFactors: [
      { label: "Customer Ratings", pct: 40, score: 38, max: 40, color: "#F97316" },
      { label: "Completed Jobs", pct: 25, score: 24, max: 25, color: "#8B5CF6" },
      { label: "Profile Completeness", pct: 15, score: 13, max: 15, color: "#10B981" },
      { label: "Response Rate", pct: 10, score: 10, max: 10, color: "#3B82F6" },
      { label: "Verification Status", pct: 10, score: 9, max: 10, color: "#F59E0B" },
    ],
  },
  2: {
    id: 2,
    name: "Mukamana Diane",
    role: "Professional Hairdresser",
    district: "Kicukiro",
    sector: "Niboye",
    trustScore: 88,
    rating: 4.7,
    reviews: 55,
    completedJobs: 203,
    responseRate: 91,
    responseTime: "~2 hours",
    memberSince: "August 2023",
    badge: "Verified",
    verified: true,
    initials: "MD",
    color: "#8B5CF6",
    skills: ["Braiding", "Natural Hair", "Styling", "Hair Treatment", "Extensions"],
    bio: "Hairdresser with 5+ years of experience specializing in braiding and natural hair care. I work from my home salon in Niboye and also offer mobile services for special occasions like weddings and events.",
    services: [
      { name: "Box Braids", price: "RWF 8,000 – 15,000", duration: "3-5 hours" },
      { name: "Natural Hair Treatment", price: "RWF 5,000", duration: "1-2 hours" },
      { name: "Bridal Hair Styling", price: "RWF 25,000 – 40,000", duration: "2-3 hours" },
      { name: "Hair Extensions Install", price: "RWF 12,000 – 20,000", duration: "2-4 hours" },
    ],
    portfolio: [
      { id: 1, title: "Box Braids Styles", category: "Braiding", emoji: "💇‍♀️" },
      { id: 2, title: "Bridal Hair", category: "Bridal", emoji: "👰" },
      { id: 3, title: "Natural Hair Care", category: "Treatment", emoji: "🌿" },
      { id: 4, title: "Event Styling", category: "Styling", emoji: "✨" },
    ],
    trustFactors: [
      { label: "Customer Ratings", pct: 40, score: 35, max: 40, color: "#F97316" },
      { label: "Completed Jobs", pct: 25, score: 25, max: 25, color: "#8B5CF6" },
      { label: "Profile Completeness", pct: 15, score: 11, max: 15, color: "#10B981" },
      { label: "Response Rate", pct: 10, score: 9, max: 10, color: "#3B82F6" },
      { label: "Verification Status", pct: 10, score: 8, max: 10, color: "#F59E0B" },
    ],
  },
};

const DEFAULT_PROVIDER = PROVIDERS_DB[1];

const REVIEWS = [
  { id: 1, customer: "Niyomugaba Jean", rating: 5, date: "Jun 10, 2026", text: "Clarisse is incredibly talented. The dress she made for my wife was perfect — exactly as described and delivered on time.", initials: "NJ", color: "#3B82F6" },
  { id: 2, customer: "Uwimana Grace", rating: 5, date: "Jun 3, 2026", text: "Professional, punctual, and great attention to detail. I've already recommended her to three friends.", initials: "UG", color: "#F59E0B" },
  { id: 3, customer: "Mukashyaka Rose", rating: 4, date: "May 28, 2026", text: "The uniforms came out beautifully. Slight delay on delivery but the quality made up for it.", initials: "MR", color: "#8B5CF6" },
  { id: 4, customer: "Habimana Eric", rating: 5, date: "May 20, 2026", text: "Best tailor I've found in Kigali. The suit fits perfectly and she understood exactly what I wanted.", initials: "HE", color: "#10B981" },
];

const SIMILAR_PROVIDERS = [
  { id: 10, name: "Akimana Vestine", role: "Seamstress", district: "Kicukiro", trustScore: 76, rating: 4.3, initials: "AV", color: "#A855F7" },
  { id: 11, name: "Mukamurenzi Esther", role: "Pastry Chef", district: "Nyarugenge", trustScore: 88, rating: 4.7, initials: "ME", color: "#F97316" },
  { id: 9, name: "Mukandayisenga Joy", role: "Bridal Makeup Artist", district: "Nyarugenge", trustScore: 92, rating: 4.9, initials: "MJ", color: "#EC4899" },
];

// ─────────────────────────────────────────────────────────────────────────────
// PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────
function Avatar({ initials, color, size = 48 }) {
  return (
    <div style={{ width: size, height: size, backgroundColor: color + "20", border: `2px solid ${color}`, color, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: size * 0.35, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function StarRating({ rating, size = "sm" }) {
  const px = size === "sm" ? "text-xs" : "text-base";
  return (
    <span className={`flex items-center gap-0.5 ${px}`}>
      {[1,2,3,4,5].map((s) => (
        <span key={s} style={{ color: s <= Math.round(rating) ? "#F97316" : "#CBD5E1" }}>★</span>
      ))}
    </span>
  );
}

function TrustScoreBadge({ score, size = "md" }) {
  const color = score >= 90 ? "#10B981" : score >= 75 ? "#F97316" : "#64748B";
  const px = size === "lg" ? "text-base px-3 py-1" : "text-xs px-2 py-0.5";
  return (
    <div style={{ border: `2px solid ${color}`, color }} className={`inline-flex items-center gap-1 rounded-full font-bold bg-white ${px}`}>
      <span>✦</span> {score}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NAVBAR
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

  const navLinks = [
    { key: "nav_browse",  to: "/providers" },
    { key: "nav_how",     to: "/about" },
    { key: "nav_about",   to: "/about" },
    { key: "nav_contact", to: "/contact" },
  ];

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
          {navLinks.map((item) => (
            <Link key={item.key} to={item.to} className="text-sm font-medium text-slate-600 hover:text-orange-500 transition-colors">
              {t(item.key)}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher compact />
          <div className="w-px h-5 bg-slate-200" />
          <Link to="/login" style={{ color: "#1E293B" }} className="text-sm font-medium hover:text-orange-500 transition-colors">{t("nav_login")}</Link>
          <Link to="/signup" style={{ backgroundColor: "#F97316" }} className="text-sm font-semibold text-white px-4 py-2 rounded-xl hover:opacity-90 transition-opacity">{t("nav_getstarted")}</Link>
        </div>

        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg text-slate-600" aria-label="Toggle menu">
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 flex flex-col gap-4">
          {navLinks.map((item) => (
            <Link key={item.key} to={item.to} onClick={() => setMenuOpen(false)} className="text-sm font-medium text-slate-700">
              {t(item.key)}
            </Link>
          ))}
          <LanguageSwitcher />
          <div className="flex gap-3 pt-1">
            <Link to="/login" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-slate-700 border border-slate-200 px-4 py-2 rounded-xl flex-1 text-center">{t("nav_login")}</Link>
            <Link to="/signup" onClick={() => setMenuOpen(false)} style={{ backgroundColor: "#F97316" }} className="text-sm font-semibold text-white px-4 py-2 rounded-xl flex-1 text-center">{t("nav_getstarted")}</Link>
          </div>
        </div>
      )}
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FOOTER
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
// BOOKING MODAL
// ─────────────────────────────────────────────────────────────────────────────
function BookingModal({ provider, onClose }) {
  const [form, setForm] = useState({ service: provider.services[0]?.name || "", date: "", time: "", notes: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.service) errs.service = "Please select a service.";
    if (!form.date) errs.date = "Please select a date.";
    if (!form.time) errs.time = "Please select a time.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      // TODO: replace with real API call
      // await bookingService.create({ providerId: provider.id, ...form });
      await new Promise((r) => setTimeout(r, 1000));
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {sent ? (
          /* Success state */
          <div className="p-8 flex flex-col items-center text-center gap-4">
            <div style={{ backgroundColor: "#F0FDF4", border: "2px solid #10B981" }} className="w-16 h-16 rounded-full flex items-center justify-center text-3xl">✓</div>
            <div>
              <h3 style={{ color: "#1E293B" }} className="text-xl font-black">Booking request sent!</h3>
              <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                {provider.name} will review your request and confirm within {provider.responseTime}.
                You'll be notified once it's accepted.
              </p>
            </div>
            <button
              onClick={onClose}
              style={{ backgroundColor: "#F97316" }}
              className="text-white font-semibold text-sm px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <Avatar initials={provider.initials} color={provider.color} size={40} />
                <div>
                  <p className="font-bold text-slate-800 text-sm">Book {provider.name}</p>
                  <p className="text-xs text-slate-500">{provider.role}</p>
                </div>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4" noValidate>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Service</label>
                <select
                  value={form.service}
                  onChange={set("service")}
                  className={`w-full px-4 py-3 rounded-xl border text-sm text-slate-800 outline-none transition-all bg-white
                    ${errors.service ? "border-red-400" : "border-slate-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"}`}
                >
                  {provider.services.map((s) => (
                    <option key={s.name} value={s.name}>{s.name} — {s.price}</option>
                  ))}
                </select>
                {errors.service && <p className="text-xs text-red-500">{errors.service}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={set("date")}
                    min={new Date().toISOString().split("T")[0]}
                    className={`w-full px-3 py-3 rounded-xl border text-sm text-slate-800 outline-none transition-all bg-white
                      ${errors.date ? "border-red-400" : "border-slate-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"}`}
                  />
                  {errors.date && <p className="text-xs text-red-500">{errors.date}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700">Time</label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={set("time")}
                    className={`w-full px-3 py-3 rounded-xl border text-sm text-slate-800 outline-none transition-all bg-white
                      ${errors.time ? "border-red-400" : "border-slate-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"}`}
                  />
                  {errors.time && <p className="text-xs text-red-500">{errors.time}</p>}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Additional Notes (optional)</label>
                <textarea
                  value={form.notes}
                  onChange={set("notes")}
                  rows={3}
                  placeholder="Describe what you need, sizes, preferred fabric, etc."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 resize-none bg-white"
                />
              </div>

              {/* Selected service price preview */}
              {form.service && (
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-sm text-orange-700 font-medium">Estimated price</span>
                  <span className="text-sm font-bold text-orange-700">
                    {provider.services.find((s) => s.name === form.service)?.price}
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{ backgroundColor: loading ? "#FDA96B" : "#F97316" }}
                className="text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {loading ? "Sending request..." : "Send Booking Request"}
              </button>
              <p className="text-xs text-slate-400 text-center">
                You won't be charged yet. {provider.name} will confirm availability first.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARE MODAL (simple)
// ─────────────────────────────────────────────────────────────────────────────
function ShareModal({ provider, onClose }) {
  const [copied, setCopied] = useState(false);
  const url = `https://inziraworks.rw/providers/${provider.id}`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800">Share Profile</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
        </div>
        <div className="flex gap-2 bg-slate-50 rounded-xl p-2 border border-slate-100">
          <input readOnly value={url} className="flex-1 px-2 text-xs text-slate-600 bg-transparent outline-none truncate" />
          <button
            onClick={handleCopy}
            style={{ backgroundColor: copied ? "#10B981" : "#F97316" }}
            className="text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function ProviderProfilePage() {
  const { id } = useParams();
  const provider = PROVIDERS_DB[id] || DEFAULT_PROVIDER;

  const [activeTab, setActiveTab] = useState("about");
  const [showBooking, setShowBooking] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [saved, setSaved] = useState(false);

  const total = provider.trustFactors.reduce((a, f) => a + f.score, 0);
  const reviewDist = [5,4,3,2,1].map((r) => ({
    r,
    count: REVIEWS.filter((rv) => rv.rating === r).length,
    pct: (REVIEWS.filter((rv) => rv.rating === r).length / REVIEWS.length) * 100,
  }));

  const TABS = [
    { id: "about",     label: "About" },
    { id: "services",  label: "Services" },
    { id: "portfolio", label: "Portfolio" },
    { id: "reviews",   label: `Reviews (${provider.reviews})` },
    { id: "trust",     label: "Trust Score" },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8FAFC" }}>
      <Navbar />

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link to="/" className="hover:text-orange-500">Home</Link>
          <span>/</span>
          <Link to="/providers" className="hover:text-orange-500">Providers</Link>
          <span>/</span>
          <span className="text-slate-600">{provider.name}</span>
        </div>
      </div>

      {/* Profile header */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <Avatar initials={provider.initials} color={provider.color} size={88} />

            <div className="flex-1 flex flex-col gap-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 style={{ color: "#1E293B" }} className="text-2xl font-black">{provider.name}</h1>
                    {provider.verified && (
                      <span className="text-green-600 text-sm flex items-center gap-1">✓ Verified</span>
                    )}
                  </div>
                  <p className="text-slate-500 text-base mt-0.5">{provider.role}</p>
                  <p className="text-slate-400 text-sm mt-1">📍 {provider.sector}, {provider.district} · Member since {provider.memberSince}</p>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSaved(!saved)}
                    className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-lg transition-colors hover:border-orange-300"
                    style={{ color: saved ? "#F97316" : "#94A3B8" }}
                    aria-label={saved ? "Unsave" : "Save"}
                  >
                    {saved ? "♥" : "♡"}
                  </button>
                  <button
                    onClick={() => setShowShare(true)}
                    className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-lg text-slate-400 hover:border-orange-300 hover:text-orange-500 transition-colors"
                    aria-label="Share"
                  >
                    🔗
                  </button>
                </div>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-3 flex-wrap">
                <TrustScoreBadge score={provider.trustScore} size="lg" />
                <div className="flex items-center gap-1.5">
                  <StarRating rating={provider.rating} size="md" />
                  <span className="text-sm text-slate-600 font-medium">{provider.rating}</span>
                  <span className="text-sm text-slate-400">({provider.reviews} reviews)</span>
                </div>
                <span className="text-sm font-medium px-2.5 py-1 rounded-full bg-orange-50 text-orange-600">{provider.badge}</span>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-3 max-w-md">
                {[
                  { label: "Jobs Done", value: provider.completedJobs },
                  { label: "Response Rate", value: `${provider.responseRate}%` },
                  { label: "Responds In", value: provider.responseTime },
                ].map((stat) => (
                  <div key={stat.label} className="bg-slate-50 rounded-xl p-3 text-center">
                    <p style={{ color: "#1E293B" }} className="font-black text-lg">{stat.value}</p>
                    <p className="text-xs text-slate-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
            {provider.skills.map((s) => (
              <span key={s} className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full">{s}</span>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <button
              onClick={() => setShowBooking(true)}
              style={{ backgroundColor: "#F97316" }}
              className="flex-1 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity"
            >
              Book Now
            </button>
            <button className="flex-1 sm:flex-none text-slate-600 font-semibold py-3 px-6 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
              💬 Message
            </button>
          </div>
        </div>
      </section>

      {/* Tabs + content */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* Main column */}
          <div className="flex flex-col gap-4">
            {/* Tab bar */}
            <div className="bg-white rounded-2xl border border-slate-100 p-1.5 flex gap-1 overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all"
                  style={{
                    backgroundColor: activeTab === tab.id ? "#F97316" : "transparent",
                    color: activeTab === tab.id ? "white" : "#64748B",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              {/* ABOUT */}
              {activeTab === "about" && (
                <div className="flex flex-col gap-4">
                  <h3 style={{ color: "#1E293B" }} className="font-bold text-lg">About {provider.name.split(" ")[0]}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{provider.bio}</p>

                  <div className="grid sm:grid-cols-2 gap-4 pt-2">
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Location</p>
                      <p className="text-sm text-slate-700">{provider.sector}, {provider.district} District</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Member Since</p>
                      <p className="text-sm text-slate-700">{provider.memberSince}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* SERVICES */}
              {activeTab === "services" && (
                <div className="flex flex-col gap-3">
                  <h3 style={{ color: "#1E293B" }} className="font-bold text-lg mb-1">Services & Pricing</h3>
                  {provider.services.map((s) => (
                    <div key={s.name} className="flex items-center justify-between gap-3 p-4 bg-slate-50 rounded-xl">
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{s.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">⏱ {s.duration}</p>
                      </div>
                      <p style={{ color: "#F97316" }} className="font-bold text-sm whitespace-nowrap">{s.price}</p>
                    </div>
                  ))}
                  <p className="text-xs text-slate-400 pt-1">* Prices are estimates and may vary based on materials and complexity.</p>
                </div>
              )}

              {/* PORTFOLIO */}
              {activeTab === "portfolio" && (
                <div className="flex flex-col gap-4">
                  <h3 style={{ color: "#1E293B" }} className="font-bold text-lg">Portfolio</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {provider.portfolio.map((item) => (
                      <div key={item.id} className="rounded-2xl border border-slate-100 overflow-hidden">
                        <div style={{ backgroundColor: "#F8FAFC" }} className="h-32 flex items-center justify-center text-4xl">
                          {item.emoji}
                        </div>
                        <div className="p-3">
                          <p className="text-sm font-semibold text-slate-800 leading-tight">{item.title}</p>
                          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full mt-1.5 inline-block">{item.category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* REVIEWS */}
              {activeTab === "reviews" && (
                <div className="flex flex-col gap-5">
                  <h3 style={{ color: "#1E293B" }} className="font-bold text-lg">Customer Reviews</h3>

                  {/* Summary */}
                  <div className="grid sm:grid-cols-2 gap-6 pb-4 border-b border-slate-100">
                    <div className="flex flex-col items-center justify-center gap-2 text-center">
                      <p style={{ color: "#1E293B" }} className="text-5xl font-black">{provider.rating}</p>
                      <StarRating rating={provider.rating} size="md" />
                      <p className="text-slate-500 text-sm">Based on {provider.reviews} reviews</p>
                    </div>
                    <div className="flex flex-col gap-2 justify-center">
                      {reviewDist.map((d) => (
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

                  {/* List */}
                  <div className="flex flex-col gap-4">
                    {REVIEWS.map((r) => (
                      <div key={r.id} className="flex flex-col gap-2">
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
              )}

              {/* TRUST SCORE */}
              {activeTab === "trust" && (
                <div className="flex flex-col gap-5">
                  <h3 style={{ color: "#1E293B" }} className="font-bold text-lg">Trust Score Breakdown</h3>

                  {/* Score hero */}
                  <div
                    className="rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6"
                    style={{ background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)" }}
                  >
                    <div className="relative flex-shrink-0">
                      <svg width="100" height="100" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="50" fill="none" stroke="#334155" strokeWidth="10" />
                        <circle
                          cx="60" cy="60" r="50" fill="none" stroke="#F97316" strokeWidth="10"
                          strokeDasharray={`${(total / 100) * 314} 314`}
                          strokeLinecap="round" transform="rotate(-90 60 60)"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span style={{ color: "#F97316" }} className="text-2xl font-black">{total}</span>
                        <span className="text-slate-400 text-xs">/ 100</span>
                      </div>
                    </div>
                    <div>
                      <p style={{ color: "#F97316" }} className="text-xs font-bold uppercase tracking-widest">
                        {total >= 90 ? "Excellent 🏆" : total >= 75 ? "Good 👍" : "Building ⬆️"}
                      </p>
                      <p className="text-white text-base mt-1 leading-relaxed">
                        This score is calculated from real job history, customer feedback, and platform activity.
                      </p>
                    </div>
                  </div>

                  {/* Factors */}
                  <div className="flex flex-col gap-4">
                    {provider.trustFactors.map((f) => (
                      <div key={f.label} className="flex flex-col gap-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-slate-700">{f.label}</span>
                          <span className="text-slate-500 text-xs">{f.score}/{f.max} pts</span>
                        </div>
                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div style={{ width: `${(f.score / f.max) * 100}%`, backgroundColor: f.color }} className="h-full rounded-full transition-all duration-700" />
                        </div>
                      </div>
                    ))}
                  </div>

                  <Link to="/about" style={{ color: "#F97316" }} className="text-sm font-semibold hover:underline">
                    Learn how the Trust Score is calculated →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            {/* Booking card */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-3 sticky top-20">
              <p style={{ color: "#1E293B" }} className="font-bold">Ready to book?</p>
              <p className="text-sm text-slate-500">
                Send a request and {provider.name.split(" ")[0]} will respond in {provider.responseTime}.
              </p>
              <button
                onClick={() => setShowBooking(true)}
                style={{ backgroundColor: "#F97316" }}
                className="text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity"
              >
                Book Now
              </button>
              <button className="text-slate-600 font-semibold py-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
                💬 Send Message
              </button>
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400">
                <span>🔒</span> Your contact info is only shared after booking is confirmed
              </div>
            </div>

            {/* Similar providers */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-3">
              <p style={{ color: "#1E293B" }} className="font-bold text-sm">Similar Providers</p>
              {SIMILAR_PROVIDERS.map((p) => (
                <Link key={p.id} to={`/providers/${p.id}`} className="flex items-center gap-3 group">
                  <Avatar initials={p.initials} color={p.color} size={40} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 group-hover:text-orange-500 transition-colors truncate">{p.name}</p>
                    <p className="text-xs text-slate-400 truncate">{p.role} · {p.district}</p>
                  </div>
                  <TrustScoreBadge score={p.trustScore} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Modals */}
      {showBooking && <BookingModal provider={provider} onClose={() => setShowBooking(false)} />}
      {showShare && <ShareModal provider={provider} onClose={() => setShowShare(false)} />}
    </div>
  );
}
