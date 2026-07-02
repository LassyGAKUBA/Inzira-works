// src/pages/public/ProviderProfilePage.jsx
// Public Provider Profile — full detail view linked from the Directory.
// Fetches live data from GET /api/providers/:id.
// Includes: Navbar, profile header, Trust Score breakdown, portfolio gallery,
// reviews, booking modal, similar providers, Footer.

import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useLang } from "../../i18n/LangContext";
import Navbar from "../../components/shared/Navbar";
import PageTransition from "../../components/shared/PageTransition";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import {
  MapPin, Star, CheckCircle, ArrowRight,
  X, Heart, Share2, MessageCircle, Lock,
  Search, Image as ImageIcon, Shield,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// API → VIEW MAPPING
// The backend returns snake_case with numbers as strings. These helpers turn
// the GET /api/providers/:id response into the shape this page renders.
// ─────────────────────────────────────────────────────────────────────────────
const AVATAR_PALETTE = ["#0E5C46", "#8B5CF6", "#10B981", "#3B82F6", "#EC4899", "#A855F7", "#06B6D4", "#F59E0B"];

function initialsFrom(name = "") {
  return name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function colorFromId(id = "") {
  let sum = 0;
  for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i);
  return AVATAR_PALETTE[sum % AVATAR_PALETTE.length];
}

function formatMonthYear(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatResponseTime(minutes) {
  const m = Number(minutes);
  if (!m) return "—";
  if (m < 60) return `~${m} min`;
  const h = Math.round(m / 60);
  return `~${h} hour${h > 1 ? "s" : ""}`;
}

function formatPrice(price, type) {
  const n = Number(price);
  if (!n) return "Contact for price";
  const amount = `RWF ${n.toLocaleString("en-US")}`;
  if (type === "starting") return `From ${amount}`;
  if (type === "hourly") return `${amount}/hr`;
  return amount;
}

function mapReview(r) {
  return {
    id: r.id,
    customer: r.customer_name,
    rating: r.rating,
    date: formatDate(r.created_at),
    text: r.comment || "",
    initials: initialsFrom(r.customer_name),
    color: colorFromId(r.id),
  };
}

function mapProvider(d) {
  const rating = Number(d.avg_rating) || 0;
  const trustScore = Math.round(Number(d.trust_score) || 0);
  const verified = d.verification_status === "verified";
  return {
    id: d.provider_id,
    userId: d.user_id,
    name: d.full_name,
    role: d.headline || "Service Provider",
    district: d.district || "—",
    trustScore,
    rating,
    reviews: Number(d.review_count) || 0,
    completedJobs: Number(d.completed_jobs) || 0,
    responseRate: Math.round(Number(d.response_rate) || 0),
    responseTime: formatResponseTime(d.avg_response_minutes),
    profileCompleteness: Number(d.profile_completeness) || 0,
    memberSince: formatMonthYear(d.member_since),
    verified,
    badge: trustScore >= 90 ? "Top Rated" : verified ? "Verified" : "New",
    initials: initialsFrom(d.full_name),
    color: colorFromId(d.provider_id),
    avatarUrl: d.avatar_url || null,
    bio: d.bio || "",
    phone: d.phone || null,
    skills: Array.isArray(d.specialties) ? d.specialties : [],
    services: (d.services || []).map((s) => ({
      id: s.id,
      name: s.title,
      description: s.description || "",
      price: formatPrice(s.price, s.price_type),
    })),
    portfolio: (d.portfolio || []).map((it) => ({
      id: it.id,
      imageUrl: it.image_url,
      caption: it.caption || "",
    })),
    reviewList: (d.reviews || []).map(mapReview),
  };
}

function openWhatsApp(phone, message) {
  let n = (phone || "").replace(/\D/g, "");
  if (n.startsWith("0")) n = "250" + n.slice(1);
  else if (n && !n.startsWith("250")) n = "250" + n;
  if (!n) return;
  window.open(`https://wa.me/${n}?text=${encodeURIComponent(message)}`, "_blank");
}

function mapSimilar(rows = [], currentId) {
  return rows
    .filter((row) => row.provider_id !== currentId)
    .slice(0, 3)
    .map((row) => ({
      id: row.provider_id,
      name: row.full_name,
      role: row.headline || "Service Provider",
      district: row.district || "—",
      trustScore: Math.round(Number(row.trust_score) || 0),
      initials: initialsFrom(row.full_name),
      color: colorFromId(row.provider_id),
    }));
}

// Trust score breakdown computed from the provider's real stored signals.
// Each factor's max points mirror the platform's weighting (sums to 100).
function computeTrustFactors(p) {
  const pct = (v, cap = 100) => Math.min(Math.max(v, 0) / cap, 1);
  const verifiedPct = p.verified ? 1 : 0.4;
  return [
    { label: "Customer Ratings",     max: 40, score: Math.round(pct(p.rating, 5) * 40), color: "#0E5C46" },
    { label: "Completed Jobs",       max: 25, score: Math.round(pct(p.completedJobs, 20) * 25), color: "#8B5CF6" },
    { label: "Profile Completeness", max: 15, score: Math.round(pct(p.profileCompleteness) * 15), color: "#10B981" },
    { label: "Response Rate",        max: 10, score: Math.round(pct(p.responseRate) * 10), color: "#3B82F6" },
    { label: "Verification Status",  max: 10, score: Math.round(verifiedPct * 10), color: "#F59E0B" },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────
function Avatar({ initials, color, size = 48, src }) {
  if (src) {
    return (
      <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: `2px solid ${color}` }}>
        <img src={src} alt={initials} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    );
  }
  return (
    <div style={{ width: size, height: size, backgroundColor: color + "20", border: `2px solid ${color}`, color, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: size * 0.35, flexShrink: 0 }}>
      {initials}
    </div>
  );
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
            color: s <= Math.round(rating) ? "#0E5C46" : "#CBD5E1",
            fill:  s <= Math.round(rating) ? "#0E5C46" : "none",
          }}
        />
      ))}
    </span>
  );
}

function TrustScoreBadge({ score, size = "md" }) {
  const color = score >= 90 ? "#10B981" : score >= 75 ? "#0E5C46" : "#64748B";
  const px = size === "lg" ? "text-base px-3 py-1" : "text-xs px-2 py-0.5";
  return (
    <div style={{ border: `2px solid ${color}`, color }} className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-white ${px}`}>
      <Shield size={11} fill={color} stroke="none" /> {score}
    </div>
  );
}

// Portfolio image with a graceful fallback if the file isn't present yet.
function PortfolioImage({ item }) {
  const [failed, setFailed] = useState(false);
  if (failed || !item.imageUrl) {
    return (
      <div style={{ backgroundColor: "#F1F5F9" }} className="h-32 flex items-center justify-center text-slate-300">
        <ImageIcon size={32} />
      </div>
    );
  }
  return (
    <img
      src={item.imageUrl}
      alt={item.caption}
      onError={() => setFailed(true)}
      className="h-32 w-full object-cover"
    />
  );
}

function Footer() {
  const { t } = useLang();
  return (
    <footer style={{ backgroundColor: "#0a3d2c" }} className="py-10 mt-12">
      <div className="px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div style={{ backgroundColor: "#0E5C46" }} className="w-7 h-7 rounded-lg flex items-center justify-center">
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
function BookingModal({ provider, user, providerPhone, onClose }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ service: provider.services[0]?.name || "", date: "", time: "", notes: "" });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.service) errs.service = "Please select a service.";
    if (!form.date)    errs.date    = "Please select a date.";
    if (!form.time)    errs.time    = "Please select a time.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setSubmitError("");
    try {
      const selectedService = provider.services.find((s) => s.name === form.service);
      const notesText = [
        form.time  ? `Preferred time: ${form.time}` : "",
        form.notes || "",
      ].filter(Boolean).join("\n");

      const { error } = await supabase.from("bookings").insert({
        customer_id:    user.id,
        provider_id:    provider.userId,
        service_id:     selectedService?.id || null,
        title:          form.service,
        scheduled_date: form.date,
        notes:          notesText || null,
        status:         "pending",
      });

      if (error) throw error;
      setSent(true);
      if (providerPhone) {
        const lines = [
          `Hi ${provider.name.split(" ")[0]}, I just sent a booking request on Inzira Works!`,
          ``,
          `Service: ${form.service}`,
          `Date: ${form.date}`,
          `Time: ${form.time}`,
          form.notes ? `Notes: ${form.notes}` : "",
        ].filter((l) => l !== undefined);
        openWhatsApp(providerPhone, lines.join("\n").trim());
      }
    } catch (err) {
      setSubmitError(err.message || "Could not send request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Not logged in — prompt to sign in
  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 flex flex-col items-center text-center gap-4">
          <div style={{ backgroundColor: "#e8f3ee", width: 56, height: 56, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Lock size={22} style={{ color: "#0E5C46" }} />
          </div>
          <div>
            <h3 style={{ color: "#172420", fontFamily: "Spectral, serif", fontSize: "1.25rem", fontWeight: 700 }}>Sign in to book</h3>
            <p className="text-slate-500 text-sm mt-2 leading-relaxed">
              You need an account to send a booking request to {provider.name.split(" ")[0]}.
            </p>
          </div>
          <button
            onClick={() => navigate("/login", { state: { from: `/providers/${provider.id}` } })}
            style={{ backgroundColor: "#0E5C46" }}
            className="w-full text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity"
          >
            Sign in
          </button>
          <Link to="/role-select" className="text-sm" style={{ color: "#0E5C46" }}>
            No account yet? Join Inzira →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {sent ? (
          <div className="p-8 flex flex-col items-center text-center gap-4">
            <div style={{ backgroundColor: "#e8f3ee", border: "2px solid #0E5C46" }} className="w-16 h-16 rounded-full flex items-center justify-center">
              <CheckCircle size={30} style={{ color: "#0E5C46" }} />
            </div>
            <div>
              <h3 style={{ color: "#172420", fontFamily: "Spectral, serif", fontSize: "1.25rem", fontWeight: 700 }}>Booking request sent!</h3>
              <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                A WhatsApp message was opened so {provider.name.split(" ")[0]} can see your request right away.
              </p>
            </div>
            {providerPhone && (
              <button
                onClick={() => {
                  const lines = [
                    `Hi ${provider.name.split(" ")[0]}, following up on my booking request on Inzira Works.`,
                  ];
                  openWhatsApp(providerPhone, lines.join("\n"));
                }}
                style={{ backgroundColor: "#25D366", color: "white" }}
                className="font-semibold text-sm px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <MessageCircle size={15} /> Open WhatsApp again
              </button>
            )}
            <button onClick={onClose} style={{ backgroundColor: "#0E5C46" }} className="text-white font-semibold text-sm px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity">
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <Avatar initials={provider.initials} color={provider.color} size={40} />
                <div>
                  <p className="font-bold text-slate-800 text-sm">Book {provider.name}</p>
                  <p className="text-xs text-slate-500">{provider.role}</p>
                </div>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4" noValidate>
              {submitError && (
                <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: "0.8rem", padding: "10px 14px", borderRadius: 10 }}>
                  {submitError}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Service</label>
                <select
                  value={form.service}
                  onChange={set("service")}
                  className={`w-full px-4 py-3 rounded-xl border text-sm text-slate-800 outline-none transition-all bg-white
                    ${errors.service ? "border-red-400" : "border-slate-200 focus:border-green-700"}`}
                >
                  {provider.services.length === 0 && <option value="">No services listed</option>}
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
                      ${errors.date ? "border-red-400" : "border-slate-200 focus:border-green-700"}`}
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
                      ${errors.time ? "border-red-400" : "border-slate-200 focus:border-green-700"}`}
                  />
                  {errors.time && <p className="text-xs text-red-500">{errors.time}</p>}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Additional Notes <span className="text-slate-400 font-normal">(optional)</span></label>
                <textarea
                  value={form.notes}
                  onChange={set("notes")}
                  rows={3}
                  placeholder="Describe what you need, sizes, preferred fabric, etc."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:border-green-700 resize-none bg-white"
                />
              </div>

              {form.service && (
                <div style={{ backgroundColor: "#e8f3ee", border: "1px solid #b8d9c8", borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="text-sm font-medium" style={{ color: "#0E5C46" }}>Estimated price</span>
                  <span className="text-sm font-bold" style={{ color: "#0E5C46" }}>
                    {provider.services.find((s) => s.name === form.service)?.price}
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{ backgroundColor: loading ? "#3d8a6e" : "#0E5C46" }}
                className="text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {loading ? "Sending request…" : "Send Booking Request"}
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
// SHARE MODAL
// ─────────────────────────────────────────────────────────────────────────────
function ShareModal({ provider, onClose }) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/providers/${provider.id}`;

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
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="flex gap-2 bg-slate-50 rounded-xl p-2 border border-slate-100">
          <input readOnly value={url} className="flex-1 px-2 text-xs text-slate-600 bg-transparent outline-none truncate" />
          <button
            onClick={handleCopy}
            style={{ backgroundColor: copied ? "#10B981" : "#0E5C46" }}
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
// LOADING & NOT-FOUND STATES
// ─────────────────────────────────────────────────────────────────────────────
function PageShell({ children }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#ede9e0" }}>
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}

function LoadingState() {
  return (
    <PageShell>
      <div className="px-4 sm:px-6 py-20 flex flex-col items-center gap-4">
        <span className="w-10 h-10 border-4 border-green-200 border-t-orange-500 rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Loading provider…</p>
      </div>
    </PageShell>
  );
}

function NotFoundState() {
  return (
    <PageShell>
      <div className="px-4 sm:px-6 py-20">
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center flex flex-col items-center gap-3">
          <Search size={36} className="text-slate-300" />
          <p className="font-bold text-slate-700 text-lg">Provider not found</p>
          <p className="text-sm text-slate-400">This provider may have been removed or the link is incorrect.</p>
          <Link to="/providers" style={{ backgroundColor: "#0E5C46" }} className="text-white text-sm font-semibold px-5 py-2 rounded-xl hover:opacity-90 transition-opacity mt-1">
            Back to all providers
          </Link>
        </div>
      </div>
    </PageShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function ProviderProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [provider, setProvider] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [activeTab, setActiveTab] = useState("about");
  const [showBooking, setShowBooking] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setActiveTab("about");
    window.scrollTo(0, 0);

    (async () => {
      try {
        const { data, error } = await supabase.rpc("get_provider_detail", { p_id: id });
        if (error || !data) throw new Error("Not found");
        const mapped = mapProvider(data);
        if (!mapped.phone) {
          const { data: u } = await supabase.from("users").select("phone").eq("id", data.user_id).maybeSingle();
          mapped.phone = u?.phone || null;
        }
        if (!cancelled) setProvider(mapped);
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }

      // Similar providers — best effort, ignore failures.
      try {
        const { data: rows } = await supabase.rpc("get_providers");
        if (!cancelled) setSimilar(mapSimilar(rows || [], id));
      } catch { /* non-critical */ }
    })();

    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <LoadingState />;
  if (notFound || !provider) return <NotFoundState />;

  const total = provider.trustScore;
  const trustFactors = computeTrustFactors(provider);
  const reviewList = provider.reviewList;
  const reviewDist = [5,4,3,2,1].map((r) => {
    const count = reviewList.filter((rv) => rv.rating === r).length;
    return { r, count, pct: reviewList.length ? (count / reviewList.length) * 100 : 0 };
  });

  const TABS = [
    { id: "about",     label: "About" },
    { id: "services",  label: "Services" },
    { id: "portfolio", label: "Portfolio" },
    { id: "reviews",   label: `Reviews (${provider.reviews})` },
    { id: "trust",     label: "Trust Score" },
  ];

  return (
    <PageTransition>
    <div className="min-h-screen" style={{ backgroundColor: "#ede9e0" }}>
      <Navbar />

      {/* Breadcrumb */}
      <div className="px-4 sm:px-6 pt-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link to="/" className="hover:text-green-700">Home</Link>
          <span>/</span>
          <Link to="/providers" className="hover:text-green-700">Providers</Link>
          <span>/</span>
          <span className="text-slate-600">{provider.name}</span>
        </div>
      </div>

      {/* Profile header */}
      <section className="px-4 sm:px-6 pt-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <Avatar initials={provider.initials} color={provider.color} size={88} src={provider.avatarUrl} />

            <div className="flex-1 flex flex-col gap-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 style={{ color: "#172420" }} className="text-2xl font-black">{provider.name}</h1>
                    {provider.verified && (
                      <span className="text-emerald-600 text-sm flex items-center gap-1 font-medium">
                        <CheckCircle size={14} /> Verified
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-base mt-0.5">{provider.role}</p>
                  <div className="flex items-center gap-1.5 text-slate-400 text-sm mt-1">
                    <MapPin size={13} />
                    <span>{provider.district} · Member since {provider.memberSince}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSaved(!saved)}
                    className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center transition-all hover:border-green-300"
                    aria-label={saved ? "Unsave" : "Save"}
                  >
                    <Heart
                      size={18}
                      style={{
                        color: saved ? "#0E5C46" : "#94A3B8",
                        fill: saved ? "#0E5C46" : "none",
                      }}
                    />
                  </button>
                  <button
                    onClick={() => setShowShare(true)}
                    className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:border-green-300 hover:text-green-700 transition-colors"
                    aria-label="Share"
                  >
                    <Share2 size={18} />
                  </button>
                </div>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-3 flex-wrap">
                <TrustScoreBadge score={provider.trustScore} size="lg" />
                {provider.reviews > 0 ? (
                  <div className="flex items-center gap-1.5">
                    <StarRating rating={provider.rating} size="md" />
                    <span className="text-sm text-slate-600 font-medium">{provider.rating.toFixed(1)}</span>
                    <span className="text-sm text-slate-400">({provider.reviews} reviews)</span>
                  </div>
                ) : (
                  <span className="text-sm text-slate-400">New provider</span>
                )}
                <span className="text-sm font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-700">{provider.badge}</span>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-3 max-w-md">
                {[
                  { label: "Jobs Done", value: provider.completedJobs },
                  { label: "Response Rate", value: `${provider.responseRate}%` },
                  { label: "Responds In", value: provider.responseTime },
                ].map((stat) => (
                  <div key={stat.label} className="bg-slate-50 rounded-xl p-3 text-center">
                    <p style={{ color: "#172420" }} className="font-black text-lg">{stat.value}</p>
                    <p className="text-xs text-slate-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Skills */}
          {provider.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
              {provider.skills.map((s) => (
                <span key={s} className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full">{s}</span>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* Tabs + content */}
      <section className="px-4 sm:px-6 py-6">
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          <div className="flex flex-col gap-4">
            {/* Tab bar */}
            <div className="bg-white rounded-2xl border border-slate-100 p-1.5 flex gap-1 overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all"
                  style={{
                    backgroundColor: activeTab === tab.id ? "#0E5C46" : "transparent",
                    color: activeTab === tab.id ? "white" : "#64748B",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              {/* ABOUT */}
              {activeTab === "about" && (
                <div className="flex flex-col gap-4">
                  <h3 style={{ color: "#172420" }} className="font-bold text-lg">About {provider.name.split(" ")[0]}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{provider.bio || "No bio provided yet."}</p>

                  <div className="grid sm:grid-cols-2 gap-4 pt-2">
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Location</p>
                      <p className="text-sm text-slate-700">{provider.district} District</p>
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
                  <h3 style={{ color: "#172420" }} className="font-bold text-lg mb-1">Services & Pricing</h3>
                  {provider.services.length === 0 ? (
                    <p className="text-sm text-slate-400">No services listed yet.</p>
                  ) : (
                    provider.services.map((s) => (
                      <div key={s.name} className="flex items-center justify-between gap-3 p-4 bg-slate-50 rounded-xl">
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{s.name}</p>
                          {s.description && <p className="text-xs text-slate-400 mt-0.5">{s.description}</p>}
                        </div>
                        <p style={{ color: "#0E5C46" }} className="font-bold text-sm whitespace-nowrap">{s.price}</p>
                      </div>
                    ))
                  )}
                  <p className="text-xs text-slate-400 pt-1">* Prices are estimates and may vary based on materials and complexity.</p>
                </div>
              )}

              {/* PORTFOLIO */}
              {activeTab === "portfolio" && (
                <div className="flex flex-col gap-4">
                  <h3 style={{ color: "#172420" }} className="font-bold text-lg">Portfolio</h3>
                  {provider.portfolio.length === 0 ? (
                    <p className="text-sm text-slate-400">No portfolio items yet.</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {provider.portfolio.map((item) => (
                        <div key={item.id} className="rounded-2xl border border-slate-100 overflow-hidden">
                          <PortfolioImage item={item} />
                          <div className="p-3">
                            <p className="text-sm font-semibold text-slate-800 leading-tight">{item.caption}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* REVIEWS */}
              {activeTab === "reviews" && (
                <div className="flex flex-col gap-5">
                  <h3 style={{ color: "#172420" }} className="font-bold text-lg">Customer Reviews</h3>

                  {reviewList.length === 0 ? (
                    <p className="text-sm text-slate-400">No reviews yet — be the first to book and review.</p>
                  ) : (
                    <>
                      <div className="grid sm:grid-cols-2 gap-6 pb-4 border-b border-slate-100">
                        <div className="flex flex-col items-center justify-center gap-2 text-center">
                          <p style={{ color: "#172420" }} className="text-5xl font-black">{provider.rating.toFixed(1)}</p>
                          <StarRating rating={provider.rating} size="md" />
                          <p className="text-slate-500 text-sm">Based on {provider.reviews} reviews</p>
                        </div>
                        <div className="flex flex-col gap-2 justify-center">
                          {reviewDist.map((d) => (
                            <div key={d.r} className="flex items-center gap-3">
                              <span className="text-xs text-slate-500 w-4">{d.r}</span>
                              <Star size={11} style={{ color: "#0E5C46", fill: "#0E5C46" }} />
                              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div style={{ width: `${d.pct}%`, backgroundColor: "#0E5C46" }} className="h-full rounded-full" />
                              </div>
                              <span className="text-xs text-slate-400 w-4">{d.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-4">
                        {reviewList.map((r) => (
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
                    </>
                  )}
                </div>
              )}

              {/* TRUST SCORE */}
              {activeTab === "trust" && (
                <div className="flex flex-col gap-5">
                  <h3 style={{ color: "#172420" }} className="font-bold text-lg">Trust Score Breakdown</h3>

                  <div
                    className="rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6"
                    style={{ background: "linear-gradient(135deg, #1E293B 0%, #0a3d2c 100%)" }}
                  >
                    <div className="relative flex-shrink-0">
                      <svg width="100" height="100" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="50" fill="none" stroke="#334155" strokeWidth="10" />
                        <circle
                          cx="60" cy="60" r="50" fill="none" stroke="#0E5C46" strokeWidth="10"
                          strokeDasharray={`${(total / 100) * 314} 314`}
                          strokeLinecap="round" transform="rotate(-90 60 60)"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span style={{ color: "#0E5C46" }} className="text-2xl font-black">{total}</span>
                        <span className="text-slate-400 text-xs">/ 100</span>
                      </div>
                    </div>
                    <div>
                      <p style={{ color: "#0E5C46" }} className="text-xs font-bold uppercase tracking-widest">
                        {total >= 90 ? "Excellent" : total >= 75 ? "Good Standing" : "Building Trust"}
                      </p>
                      <p className="text-white text-base mt-1 leading-relaxed">
                        This score is calculated from real job history, customer feedback, and platform activity.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    {trustFactors.map((f) => (
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

                  <Link to="/about" className="flex items-center gap-1.5 text-sm font-semibold hover:opacity-80 transition-opacity w-fit" style={{ color: "#0E5C46" }}>
                    Learn how the Trust Score is calculated <ArrowRight size={14} />
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            {user?.role !== "admin" && (
            <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-3 sticky top-20">
              <p style={{ color: "#172420" }} className="font-bold">Ready to book?</p>
              <p className="text-sm text-slate-500">
                Send a request and {provider.name.split(" ")[0]} will respond in {provider.responseTime}.
              </p>
              <button
                onClick={() => setShowBooking(true)}
                style={{ backgroundColor: "#0E5C46" }}
                className="text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity"
              >
                Book Now
              </button>
              <button
                onClick={() => {
                  if (!provider.phone) return;
                  openWhatsApp(
                    provider.phone,
                    `Hi ${provider.name.split(" ")[0]}, I found you on Inzira Works and I'm interested in your services. Are you available?`
                  );
                }}
                style={{ backgroundColor: "#25D366", color: "white", border: "none" }}
                className="font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <MessageCircle size={16} /> Message on WhatsApp
              </button>
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400">
                <Lock size={11} className="flex-shrink-0" />
                Your contact info is only shared after booking is confirmed
              </div>
            </div>
            )}

            {/* Similar providers */}
            {similar.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-3">
                <p style={{ color: "#172420" }} className="font-bold text-sm">Similar Providers</p>
                {similar.map((p) => (
                  <Link key={p.id} to={`/providers/${p.id}`} className="flex items-center gap-3 group">
                    <Avatar initials={p.initials} color={p.color} size={40} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 group-hover:text-green-700 transition-colors truncate">{p.name}</p>
                      <p className="text-xs text-slate-400 truncate">{p.role} · {p.district}</p>
                    </div>
                    <TrustScoreBadge score={p.trustScore} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />

      {/* Modals */}
      {showBooking && user?.role !== "admin" && <BookingModal provider={provider} user={user} providerPhone={provider.phone} onClose={() => setShowBooking(false)} />}
      {showShare && <ShareModal provider={provider} onClose={() => setShowShare(false)} />}
    </div>
    </PageTransition>
  );
}


