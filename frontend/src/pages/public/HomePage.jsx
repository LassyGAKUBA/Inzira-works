import { Link } from "react-router-dom";
import {
  Scissors, Sparkles, ChefHat, Package, Home, Layers,
  ChevronDown, Star, ArrowRight, MapPin,
} from "lucide-react";
import Navbar from "../../components/shared/Navbar";
import PageTransition from "../../components/shared/PageTransition";

// ── Design tokens ─────────────────────────────────────────────────────────────
const G      = "#0E5C46";
const G_DARK = "#0a3d2c";
const CREAM  = "#ede9e0";
const DARK   = "#172420";
const GOLD   = "#b98a22";
const MUTED  = "#5c7068";
const SERIF  = "Spectral, serif";
const SANS   = "'Hanken Grotesk', sans-serif";
const W      = 1200; // content max-width

// ── Static data ───────────────────────────────────────────────────────────────
const CATEGORIES = [
  { label: "Tailoring & Fashion", Icon: Scissors },
  { label: "Hair & Beauty",       Icon: Sparkles  },
  { label: "Baking & Catering",   Icon: ChefHat   },
  { label: "Handicraft & Décor",  Icon: Package   },
  { label: "Home & Cleaning",     Icon: Home      },
  { label: "Knitwear & Textiles", Icon: Layers    },
];

const PROVIDERS = [
  { id: 1, name: "Esperance Nyiransabimana", title: "Caterer & Pastry Chef",      category: "Baking & Catering",   district: "Gasabo",     score: 96, rating: 5.0, reviews: 188 },
  { id: 2, name: "Solange Mukamana",         title: "Bespoke Tailor & Designer",  category: "Tailoring & Fashion", district: "Gasabo",     score: 94, rating: 4.9, reviews: 127 },
  { id: 3, name: "Diane Ingabire",           title: "Baker — Cakes & Events",     category: "Baking & Catering",   district: "Nyarugenge", score: 91, rating: 4.9, reviews: 110 },
  { id: 4, name: "Chantal Uwimana",          title: "Home Cleaning & Laundry",    category: "Home & Cleaning",     district: "Kicukiro",   score: 90, rating: 4.8, reviews: 132 },
];

// ── Shared primitives ─────────────────────────────────────────────────────────
function Container({ children, style }) {
  return (
    <div style={{ maxWidth: W, margin: "0 auto", padding: "0 24px", ...style }}>
      {children}
    </div>
  );
}

function ScoreRing({ score, size = 72 }) {
  const r    = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const off  = circ - (score / 100) * circ;
  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="5" />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={GOLD} strokeWidth="5"
        strokeDasharray={circ} strokeDashoffset={off}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x={size / 2} y={size / 2 + 7}
        textAnchor="middle"
        style={{ fill: "white", fontSize: 18, fontWeight: 700, fontFamily: SANS }}
      >
        {score}
      </text>
    </svg>
  );
}

function StarRow({ rating }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s} size={12}
          style={{ color: s <= Math.round(rating) ? GOLD : "#d8d3c8", fill: s <= Math.round(rating) ? GOLD : "none" }}
        />
      ))}
    </span>
  );
}

// ── Section: Hero ─────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section style={{ backgroundColor: CREAM, paddingBottom: 64 }}>
      <Container>
        <div className="grid md:grid-cols-2 gap-12 items-center" style={{ minHeight: 520 }}>
          {/* Left */}
          <div className="flex flex-col gap-6 py-14">
            {/* Badge */}
            <div>
              <span
                style={{
                  backgroundColor: "#f0e8c8",
                  color: GOLD,
                  border: `1px solid ${GOLD}55`,
                  borderRadius: 999,
                  padding: "5px 14px",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span style={{ color: GOLD, fontSize: 8 }}>●</span>
                Built for skilled women in Kigali City
              </span>
            </div>

            {/* Headline */}
            <h1
              style={{
                fontFamily: SERIF,
                color: DARK,
                lineHeight: 1.06,
                letterSpacing: "-0.02em",
                fontSize: "clamp(2.4rem, 5vw, 3.6rem)",
                fontWeight: 800,
              }}
            >
              Skilled hands,<br />
              now easy to{" "}
              <em style={{ color: G, fontStyle: "italic" }}>find & trust.</em>
            </h1>

            {/* Sub */}
            <p style={{ color: MUTED, maxWidth: "26rem", lineHeight: 1.7, fontSize: "1rem" }}>
              Inzira — meaning <em>the path</em> — connects tailors, hairdressers,
              bakers and artisans with the customers who need them, backed by a
              verifiable <strong style={{ color: DARK, fontWeight: 600 }}>Trust Score</strong>.
            </p>

            {/* Search bar */}
            <div
              style={{
                backgroundColor: "white",
                borderRadius: 14,
                border: "1px solid #ddd8ce",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                display: "flex",
                alignItems: "center",
                padding: 6,
                maxWidth: 420,
                gap: 0,
              }}
            >
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  borderRight: "1px solid #ddd8ce",
                  background: "none",
                  border: "none",
                  borderRight: "1px solid #ddd8ce",
                  cursor: "pointer",
                  color: MUTED,
                  fontSize: "0.875rem",
                  flexShrink: 0,
                }}
              >
                All categories <ChevronDown size={14} />
              </button>
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: MUTED,
                  fontSize: "0.875rem",
                  flexShrink: 0,
                }}
              >
                <MapPin size={13} /> All Kigali <ChevronDown size={14} />
              </button>
              <Link
                to="/providers"
                style={{
                  marginLeft: "auto",
                  backgroundColor: G,
                  color: "white",
                  borderRadius: 10,
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  padding: "9px 20px",
                  textDecoration: "none",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}
                className="hover:opacity-90 transition-opacity"
              >
                Find
              </Link>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 pt-2 flex-wrap">
              {[
                { value: "1,200+", label: "Verified providers"   },
                { value: "8,400+", label: "Bookings completed"   },
                { value: "3",      label: "Kigali districts"     },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p style={{ fontFamily: SERIF, color: DARK, fontSize: "1.6rem", fontWeight: 700, lineHeight: 1 }}>
                    {value}
                  </p>
                  <p style={{ color: MUTED, fontSize: "0.75rem", marginTop: 4 }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — photo collage placeholder */}
          <div className="hidden md:flex items-center justify-end py-8">
            <div style={{ position: "relative", width: 380, height: 400 }}>
              {/* Large photo placeholder */}
              <div
                style={{
                  width: 290, height: 265,
                  border: "1.5px dashed #c8c0b0",
                  borderRadius: 16,
                  backgroundColor: "#f5f0e8",
                  position: "absolute", top: 0, right: 0,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c0b89c" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="m21 15-5-5L5 21" />
                </svg>
                <p style={{ color: "#c0b89c", fontSize: "0.7rem", textAlign: "center", lineHeight: 1.4 }}>
                  Drop a photo — a woman at work<br />(tailor, baker...)
                </p>
              </div>

              {/* Small photo placeholder */}
              <div
                style={{
                  width: 200, height: 175,
                  border: "1.5px dashed #c8c0b0",
                  borderRadius: 16,
                  backgroundColor: "#f5f0e8",
                  position: "absolute", bottom: 0, left: 0,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c0b89c" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="m21 15-5-5L5 21" />
                </svg>
                <p style={{ color: "#c0b89c", fontSize: "0.7rem" }}>Portfolio / product photo</p>
              </div>

              {/* Trust Score floating chip */}
              <div
                style={{
                  position: "absolute", bottom: 24, right: -8,
                  backgroundColor: "white",
                  borderRadius: 12,
                  padding: "10px 14px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                  display: "flex", alignItems: "center", gap: 10,
                  border: "1px solid #ece7de",
                }}
              >
                <div
                  style={{
                    width: 40, height: 40, borderRadius: "50%",
                    border: `3px solid ${GOLD}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <span style={{ color: GOLD, fontWeight: 700, fontSize: 13, fontFamily: SANS }}>96</span>
                </div>
                <div>
                  <p style={{ color: "#9aab9e", fontSize: "0.65rem", fontWeight: 500 }}>Trust Score</p>
                  <p style={{ color: DARK, fontSize: "0.75rem", fontWeight: 600 }}>Esperance N. · Caterer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

// ── Section: Browse by trade ──────────────────────────────────────────────────
function BrowseByTrade() {
  return (
    <section style={{ backgroundColor: CREAM, paddingTop: 16, paddingBottom: 64 }}>
      <Container>
        <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
          <h2 style={{ fontFamily: SERIF, color: DARK, fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.01em" }}>
            Browse by trade
          </h2>
          <Link
            to="/providers"
            style={{ color: G, fontSize: "0.875rem", fontWeight: 500, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}
            className="hover:opacity-70 transition-opacity"
          >
            View all providers <ArrowRight size={14} />
          </Link>
        </div>

        <div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
        >
          {CATEGORIES.map(({ label, Icon }) => (
            <Link
              key={label}
              to="/providers"
              style={{
                backgroundColor: "white",
                borderRadius: 12,
                border: "1px solid #e8e2d8",
                padding: "18px 12px",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                textDecoration: "none",
              }}
              className="hover:border-[#0E5C46] transition-colors group"
            >
              <Icon size={22} style={{ color: G }} />
              <p style={{ color: DARK, fontSize: "0.75rem", fontWeight: 500, textAlign: "center", lineHeight: 1.3 }}>
                {label}
              </p>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

// ── Section: Trust Score (dark green band) ────────────────────────────────────
function TrustScoreSection() {
  const bars = [
    { label: "Customer ratings",    weight: "40%", value: "4.9 / 5", pct: 98 },
    { label: "Completed bookings",  weight: "30%", value: "210",     pct: 84 },
    { label: "Profile completeness",weight: "20%", value: "100%",    pct: 100 },
    { label: "Response rate",       weight: "10%", value: "96%",     pct: 96  },
  ];

  return (
    <section style={{ backgroundColor: G, padding: "80px 0" }}>
      <Container>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left text */}
          <div className="flex flex-col gap-6">
            <p style={{ color: "#9ed3bf", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              THE TRUST SCORE
            </p>
            <h2
              style={{ fontFamily: SERIF, color: "white", fontSize: "clamp(1.8rem, 3.5vw, 2.75rem)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em" }}
            >
              Reputation you can carry anywhere.
            </h2>
            <p style={{ color: "#9ed3bf", lineHeight: 1.7, fontSize: "0.95rem", maxWidth: "26rem" }}>
              Every completed job builds a single, transparent score from 0–100 — so a new
              customer can trust a provider they've never met. No word-of-mouth required.
            </p>
            <div>
              <Link
                to="/about"
                style={{
                  display: "inline-block",
                  border: "1.5px solid rgba(255,255,255,0.5)",
                  color: "white",
                  borderRadius: 8,
                  padding: "10px 22px",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
                className="hover:bg-white hover:bg-opacity-10 transition-colors"
              >
                See how it works
              </Link>
            </div>
          </div>

          {/* Right — score card */}
          <div
            style={{
              backgroundColor: "rgba(0,0,0,0.22)",
              borderRadius: 18,
              padding: 28,
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {/* Score ring + label */}
            <div className="flex items-center gap-5" style={{ marginBottom: 24 }}>
              <ScoreRing score={94} size={76} />
              <div>
                <p style={{ color: "white", fontWeight: 700, fontSize: "1.05rem" }}>Excellent standing</p>
                <p style={{ color: "#9ed3bf", fontSize: "0.8rem", marginTop: 2 }}>Based on 210 completed jobs</p>
              </div>
            </div>

            {/* Progress bars */}
            <div className="flex flex-col gap-4">
              {bars.map(({ label, weight, value, pct }) => (
                <div key={label}>
                  <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                    <span style={{ color: "#9ed3bf", fontSize: "0.75rem" }}>
                      {label} <span style={{ opacity: 0.6 }}>· {weight}</span>
                    </span>
                    <span style={{ color: "white", fontSize: "0.8rem", fontWeight: 600 }}>{value}</span>
                  </div>
                  <div style={{ height: 5, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 99 }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: "100%",
                        backgroundColor: GOLD,
                        borderRadius: 99,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

// ── Section: Top-rated providers ──────────────────────────────────────────────
function TopRated() {
  return (
    <section style={{ backgroundColor: CREAM, padding: "64px 0" }}>
      <Container>
        <div className="flex items-end justify-between" style={{ marginBottom: 8 }}>
          <h2 style={{ fontFamily: SERIF, color: DARK, fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.01em" }}>
            Top-rated this week
          </h2>
          <Link
            to="/providers"
            style={{ color: G, fontSize: "0.875rem", fontWeight: 500, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}
            className="hover:opacity-70 transition-opacity"
          >
            Browse all <ArrowRight size={14} />
          </Link>
        </div>
        <p style={{ color: MUTED, fontSize: "0.875rem", marginBottom: 24 }}>
          Skilled women with the strongest standing in Kigali
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PROVIDERS.map((p) => (
            <Link
              key={p.id}
              to="/providers"
              style={{
                backgroundColor: "white",
                borderRadius: 14,
                border: "1px solid #e8e2d8",
                overflow: "hidden",
                textDecoration: "none",
                display: "flex",
                flexDirection: "column",
              }}
              className="hover:border-[#0E5C46] transition-colors"
            >
              {/* Photo placeholder */}
              <div
                style={{
                  backgroundColor: "#f5f0e8",
                  margin: 10,
                  borderRadius: 10,
                  border: "1.5px dashed #c8c0b0",
                  height: 130,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5,
                }}
              >
                <p style={{ color: "#c8c0b0", fontSize: "0.7rem" }}>{p.category}</p>
              </div>

              {/* Info */}
              <div style={{ padding: "10px 14px 14px" }}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p style={{ color: DARK, fontWeight: 700, fontSize: "0.9rem", lineHeight: 1.3 }}>{p.name}</p>
                    <p style={{ color: MUTED, fontSize: "0.75rem", marginTop: 2 }}>{p.title}</p>
                  </div>
                  {/* Score badge */}
                  <span
                    style={{
                      backgroundColor: "#f0e8c8",
                      color: GOLD,
                      borderRadius: 999,
                      padding: "3px 8px",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ fontSize: 7 }}>●</span> {p.score}
                  </span>
                </div>
                <div className="flex items-center gap-2" style={{ marginTop: 10 }}>
                  <StarRow rating={p.rating} />
                  <span style={{ color: MUTED, fontSize: "0.72rem" }}>
                    {p.rating} ({p.reviews}) · {p.district}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

// ── Section: How it works ─────────────────────────────────────────────────────
function HowItWorks() {
  const customerSteps = [
    { n: 1, title: "Search by trade & district",    desc: "Filter providers near you and compare their Trust Scores." },
    { n: 2, title: "Enquire and pick a service",    desc: "Pick a service, date and place — no payment needed to enquire." },
    { n: 3, title: "Get the work done & review",    desc: "Your rating helps the next customer — and rewards good work." },
  ];
  const providerSteps = [
    { n: 1, title: "Create a professional profile", desc: "Showcase your services, prices and a portfolio of real work." },
    { n: 2, title: "Accept requests from customers",desc: "Accept requests, message customers and track every job." },
    { n: 3, title: "Build your Trust Score",        desc: "A verifiable record you can show partners, buyers and lenders." },
  ];

  return (
    <section style={{ backgroundColor: CREAM, padding: "64px 0" }}>
      <Container>
        <h2
          style={{ fontFamily: SERIF, color: DARK, fontSize: "clamp(1.6rem, 3vw, 2.25rem)", fontWeight: 700, letterSpacing: "-0.02em", textAlign: "center", marginBottom: 40 }}
        >
          How Inzira works
        </h2>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Customers card */}
          <div style={{ backgroundColor: "white", borderRadius: 16, border: "1px solid #e8e2d8", padding: 28 }}>
            <p style={{ color: G, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20 }}>
              FOR CUSTOMERS
            </p>
            <div className="flex flex-col gap-5">
              {customerSteps.map(({ n, title, desc }) => (
                <div key={n} className="flex gap-4">
                  <span
                    style={{
                      width: 28, height: 28, borderRadius: "50%",
                      backgroundColor: G,
                      color: "white",
                      fontSize: "0.75rem", fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {n}
                  </span>
                  <div>
                    <p style={{ color: DARK, fontWeight: 600, fontSize: "0.9rem" }}>{title}</p>
                    <p style={{ color: MUTED, fontSize: "0.8rem", marginTop: 3, lineHeight: 1.55 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Providers card */}
          <div style={{ backgroundColor: "white", borderRadius: 16, border: "1px solid #e8e2d8", padding: 28 }}>
            <p style={{ color: G, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20 }}>
              FOR PROVIDERS
            </p>
            <div className="flex flex-col gap-5">
              {providerSteps.map(({ n, title, desc }) => (
                <div key={n} className="flex gap-4">
                  <span
                    style={{
                      width: 28, height: 28, borderRadius: "50%",
                      backgroundColor: "#f0e8c8",
                      color: GOLD,
                      fontSize: "0.75rem", fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {n}
                  </span>
                  <div>
                    <p style={{ color: DARK, fontWeight: 600, fontSize: "0.9rem" }}>{title}</p>
                    <p style={{ color: MUTED, fontSize: "0.8rem", marginTop: 3, lineHeight: 1.55 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link
              to="/signup"
              style={{
                display: "block",
                marginTop: 24,
                backgroundColor: G,
                color: "white",
                borderRadius: 10,
                padding: "12px 0",
                textAlign: "center",
                fontSize: "0.875rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
              className="hover:opacity-90 transition-opacity"
            >
              Create your profile — it's free
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}

// ── Section: CTA ──────────────────────────────────────────────────────────────
function CTASection() {
  return (
    <section style={{ backgroundColor: CREAM, padding: "0 0 64px" }}>
      <Container>
        <div
          style={{
            backgroundColor: G_DARK,
            borderRadius: 20,
            padding: "56px 48px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative path mark */}
          <svg
            style={{ position: "absolute", right: 40, bottom: 0, opacity: 0.12, pointerEvents: "none" }}
            width="160" height="160" viewBox="0 0 160 160" fill="none"
          >
            <path d="M80 20C80 20 30 50 30 90C30 120 50 140 80 140L80 155L110 135L80 115L80 130C58 130 44 118 44 90C44 60 80 42 80 42L80 20Z" fill="white" />
          </svg>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="flex flex-col gap-4">
              <h2 style={{ fontFamily: SERIF, color: "white", fontSize: "clamp(1.6rem, 3vw, 2.25rem)", fontWeight: 800, lineHeight: 1.12, letterSpacing: "-0.02em" }}>
                Your skill deserves to be seen.
              </h2>
              <p style={{ color: "#9ed3bf", fontSize: "0.95rem", lineHeight: 1.65, maxWidth: "28rem" }}>
                Join thousands of women turning their craft into a growing business — with
                the visibility and credibility they've earned.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row md:justify-end gap-3">
              <Link
                to="/signup"
                style={{
                  border: "1.5px solid rgba(255,255,255,0.6)",
                  color: "white",
                  borderRadius: 10,
                  padding: "12px 24px",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  textAlign: "center",
                }}
                className="hover:bg-white hover:bg-opacity-10 transition-colors"
              >
                Join Inzira Works
              </Link>
              <Link
                to="/providers"
                style={{
                  backgroundColor: "rgba(255,255,255,0.15)",
                  color: "white",
                  borderRadius: 10,
                  padding: "12px 24px",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  textAlign: "center",
                }}
                className="hover:bg-opacity-25 transition-colors"
              >
                See the dashboard
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ backgroundColor: "#e8e3d8", borderTop: "1px solid #d4cfc5", padding: "20px 0" }}>
      <Container>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <svg width="14" height="18" viewBox="0 0 18 22" fill="none">
              <path d="M9 2C9 2 3 5.5 3 12C3 16.5 5.5 19 9 19L9 21L13 17.5L9 14L9 16.5C7 16.5 5 15 5 12C5 7.5 9 5 9 5L9 2Z" fill={G} />
            </svg>
            <span style={{ color: DARK, fontWeight: 600, fontSize: "0.875rem" }}>Inzira Works</span>
          </div>
          <p style={{ color: MUTED, fontSize: "0.75rem" }}>
            A capstone project · Enhancing market access for skilled women in Kigali City
          </p>
        </div>
      </Container>
    </footer>
  );
}

// ── Page root ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <PageTransition>
      <div style={{ fontFamily: SANS }}>
        <Navbar />
        <Hero />
        <BrowseByTrade />
        <TrustScoreSection />
        <TopRated />
        <HowItWorks />
        <CTASection />
        <Footer />
      </div>
    </PageTransition>
  );
}
