// src/pages/public/AboutPage.jsx
// About Us — mission, story, Trust Score explainer, team/impact stats

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLang } from "../../i18n/LangContext";
import LanguageSwitcher from "../../components/shared/LanguageSwitcher";

// ─────────────────────────────────────────────────────────────────────────────
// NAVBAR (shared pattern)
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
          <Link to="/providers" className="text-sm font-medium text-slate-600 hover:text-orange-500 transition-colors">{t("nav_browse")}</Link>
          <a href="#" className="text-sm font-medium text-slate-600 hover:text-orange-500 transition-colors">{t("nav_how")}</a>
          <Link to="/about" style={{ color: "#F97316" }} className="text-sm font-semibold">{t("nav_about")}</Link>
          <Link to="/contact" className="text-sm font-medium text-slate-600 hover:text-orange-500 transition-colors">{t("nav_contact")}</Link>
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
          <Link to="/providers" className="text-sm font-medium text-slate-700">{t("nav_browse")}</Link>
          <a href="#" className="text-sm font-medium text-slate-700">{t("nav_how")}</a>
          <Link to="/about" style={{ color: "#F97316" }} className="text-sm font-semibold">{t("nav_about")}</Link>
          <Link to="/contact" className="text-sm font-medium text-slate-700">{t("nav_contact")}</Link>
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
// FOOTER (shared compact pattern)
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
// DATA
// ─────────────────────────────────────────────────────────────────────────────
const VALUES = [
  { icon: "🤝", title: "Trust First", desc: "Every feature we build starts with one question: does this help customers and providers trust each other more?" },
  { icon: "🇷🇼", title: "Built for Rwanda", desc: "Localized for Kigali's districts, Kinyarwanda and Swahili speakers, and mobile money — not a copy-paste of foreign platforms." },
  { icon: "📈", title: "Economic Empowerment", desc: "We exist to help skilled women turn informal work into visible, sustainable income." },
  { icon: "🔍", title: "Transparency", desc: "Our Trust Score formula is open and explained — no hidden algorithms deciding who gets seen." },
];

const TIMELINE = [
  { year: "2025", title: "The Idea", desc: "Started as a final-year BSc Software Engineering capstone project, inspired by the gap between skilled women in Kigali and the customers who need their services." },
  { year: "2025", title: "Research & Design", desc: "Conducted interviews with tailors, hairdressers, and cooperative members in Gasabo, Kicukiro, and Nyarugenge to shape the Trust Score model and feature set." },
  { year: "2026", title: "Platform Launch", desc: "Inzira Works goes live — connecting the first cohort of verified providers with customers across Kigali." },
  { year: "Future", title: "Scaling Up", desc: "Plans to expand beyond Kigali to other Rwandan provinces, and add mobile money payments, in-app messaging, and a provider mobile app." },
];

const IMPACT_STATS = [
  { value: "800+", label: "Skilled Women Onboarded" },
  { value: "3,200+", label: "Jobs Completed" },
  { value: "3", label: "Districts Covered" },
  { value: "96%", label: "Customer Satisfaction" },
];

const TRUST_FACTORS = [
  { label: "Customer Ratings", pct: 40, color: "#F97316", desc: "Average star rating across all completed jobs." },
  { label: "Completed Jobs", pct: 25, color: "#8B5CF6", desc: "Total number of jobs successfully delivered." },
  { label: "Profile Completeness", pct: 15, color: "#10B981", desc: "Bio, portfolio, skills, and photos filled out." },
  { label: "Response Rate", pct: 10, color: "#3B82F6", desc: "How quickly a provider responds to booking requests." },
  { label: "Verification Status", pct: 10, color: "#F59E0B", desc: "ID and phone number verified by Inzira Works." },
];

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8FAFC" }}>
      <Navbar />

      {/* ── Hero ── */}
      <section
        style={{ background: "linear-gradient(135deg, #FFF7ED 0%, #FFECD2 50%, #FFF7ED 100%)" }}
        className="relative overflow-hidden py-16"
      >
        <div style={{ position: "absolute", top: "-10%", right: "-5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, #F9731620 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center flex flex-col gap-4 relative z-10">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1.5 rounded-full w-fit mx-auto">
            <span>🇷🇼</span> Our Story
          </div>
          <h1 style={{ color: "#1E293B" }} className="text-3xl sm:text-5xl font-black tracking-tight">
            Building visibility for<br /><span style={{ color: "#F97316" }}>Kigali's skilled women</span>
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed max-w-2xl mx-auto">
            Inzira Works exists to close the gap between talented women across Gasabo, Kicukiro, and Nyarugenge
            and the customers who need their skills — built on trust, localized for Rwanda.
          </p>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-4">
            <p style={{ color: "#F97316" }} className="text-xs font-bold uppercase tracking-widest">Our Mission</p>
            <h2 style={{ color: "#1E293B" }} className="text-3xl font-black tracking-tight leading-tight">
              Every skilled woman deserves to be found.
            </h2>
            <p className="text-slate-500 text-base leading-relaxed">
              Across Kigali, thousands of women — tailors, hairdressers, caterers, artisans, and cooperative
              members — have real skills and real businesses, but no easy way to reach new customers or prove
              their reliability.
            </p>
            <p className="text-slate-500 text-base leading-relaxed">
              Existing platforms weren't built with them in mind: no Kinyarwanda support, no mobile money,
              high commissions, and requirements that assume a formal registered business. Inzira Works
              was designed from the ground up to remove those barriers.
            </p>
          </div>

          {/* Stats card */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
            <p style={{ color: "#1E293B" }} className="font-bold mb-6">Our Impact So Far</p>
            <div className="grid grid-cols-2 gap-6">
              {IMPACT_STATS.map((s) => (
                <div key={s.label} className="flex flex-col gap-1">
                  <p style={{ color: "#F97316" }} className="text-3xl font-black">{s.value}</p>
                  <p className="text-slate-500 text-sm">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section style={{ backgroundColor: "#FFF7ED" }} className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p style={{ color: "#F97316" }} className="text-xs font-bold uppercase tracking-widest mb-3">What We Stand For</p>
            <h2 style={{ color: "#1E293B" }} className="text-3xl font-black tracking-tight">Our Values</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v) => (
              <div key={v.title} className="bg-white rounded-2xl p-6 border border-orange-100 flex flex-col gap-3">
                <div style={{ backgroundColor: "#FFF7ED" }} className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl">
                  {v.icon}
                </div>
                <p className="font-bold text-slate-800">{v.title}</p>
                <p className="text-sm text-slate-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p style={{ color: "#F97316" }} className="text-xs font-bold uppercase tracking-widest mb-3">Our Journey</p>
            <h2 style={{ color: "#1E293B" }} className="text-3xl font-black tracking-tight">From Idea to Platform</h2>
          </div>
          <div className="flex flex-col gap-0">
            {TIMELINE.map((step, i) => (
              <div key={step.title} className="flex gap-5">
                {/* Line + dot */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    style={{ backgroundColor: "#F97316" }}
                    className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
                  />
                  {i < TIMELINE.length - 1 && (
                    <div style={{ backgroundColor: "#FED7AA" }} className="w-0.5 flex-1 my-1" />
                  )}
                </div>
                {/* Content */}
                <div className="pb-8 flex-1">
                  <span style={{ color: "#F97316" }} className="text-xs font-bold uppercase tracking-widest">{step.year}</span>
                  <p style={{ color: "#1E293B" }} className="font-bold text-lg mt-1">{step.title}</p>
                  <p className="text-slate-500 text-sm leading-relaxed mt-1">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust Score deep-dive ── */}
      <section style={{ backgroundColor: "#1E293B" }} className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col gap-10">
          <div className="text-center">
            <p style={{ color: "#F97316" }} className="text-xs font-bold uppercase tracking-widest mb-3">How We Build Trust</p>
            <h2 className="text-white text-3xl font-black tracking-tight">The Trust Score, Explained</h2>
            <p className="text-slate-400 text-base leading-relaxed max-w-2xl mx-auto mt-3">
              Every provider has a Trust Score from 0–100, recalculated automatically as they complete jobs,
              receive reviews, and stay active on the platform. Here's exactly how it's calculated.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {TRUST_FACTORS.map((f) => (
              <div key={f.label} className="bg-slate-800 border border-slate-700 rounded-2xl p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="text-white font-bold">{f.label}</p>
                  <span style={{ color: f.color }} className="text-xl font-black">{f.pct}%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div style={{ width: `${f.pct * 2}%`, backgroundColor: f.color }} className="h-full rounded-full" />
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/providers"
              style={{ backgroundColor: "#F97316" }}
              className="inline-block text-white font-semibold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity text-sm"
            >
              See Trust Scores in Action →
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ backgroundColor: "#F97316" }} className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center gap-6">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Join the Inzira Works community
          </h2>
          <p className="text-orange-100 text-lg max-w-xl">
            Whether you're a skilled woman ready to grow your business, or a customer looking for trusted
            local talent — there's a place for you here.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/signup" className="bg-white text-orange-600 font-bold px-8 py-3 rounded-xl hover:bg-orange-50 transition-colors text-sm">
              Join as a Provider
            </Link>
            <Link to="/providers" className="border-2 border-white text-white font-bold px-8 py-3 rounded-xl hover:bg-orange-600 transition-colors text-sm">
              Browse Services
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
