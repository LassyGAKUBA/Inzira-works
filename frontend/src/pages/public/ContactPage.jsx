// src/pages/public/ContactPage.jsx
// Contact Us — form with validation, contact info cards, FAQ accordion, map placeholder

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLang } from "../../i18n/LangContext";
import LanguageSwitcher from "../../components/shared/LanguageSwitcher";
import {
  Menu, X, MapPin, Mail, Phone, Clock, ChevronDown,
  MessageCircle, HelpCircle, Briefcase, Shield, FileText, CheckCircle,
} from "lucide-react";

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
          <Link to="/about" className="text-sm font-medium text-slate-600 hover:text-orange-500 transition-colors">{t("nav_about")}</Link>
          <Link to="/contact" style={{ color: "#F97316" }} className="text-sm font-semibold">{t("nav_contact")}</Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher compact />
          <div className="w-px h-5 bg-slate-200" />
          <Link to="/login" style={{ color: "#1E293B" }} className="text-sm font-medium hover:text-orange-500 transition-colors">{t("nav_login")}</Link>
          <Link to="/signup" style={{ backgroundColor: "#F97316" }} className="text-sm font-semibold text-white px-4 py-2 rounded-xl hover:opacity-90 transition-opacity">{t("nav_getstarted")}</Link>
        </div>

        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg text-slate-600" aria-label="Toggle menu">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 flex flex-col gap-4">
          <Link to="/providers" className="text-sm font-medium text-slate-700">{t("nav_browse")}</Link>
          <a href="#" className="text-sm font-medium text-slate-700">{t("nav_how")}</a>
          <Link to="/about" className="text-sm font-medium text-slate-700">{t("nav_about")}</Link>
          <Link to="/contact" style={{ color: "#F97316" }} className="text-sm font-semibold">{t("nav_contact")}</Link>
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
// DATA
// ─────────────────────────────────────────────────────────────────────────────
const CONTACT_INFO = [
  { Icon: MapPin, label: "Office", value: "Kigali Innovation City, Gasabo, Kigali, Rwanda" },
  { Icon: Mail,   label: "Email",  value: "support@inziraworks.rw" },
  { Icon: Phone,  label: "Phone",  value: "+250 788 000 000" },
  { Icon: Clock,  label: "Hours",  value: "Mon – Fri: 8:00 AM – 6:00 PM (CAT)" },
];

const SUBJECTS = [
  "General Inquiry",
  "Become a Provider",
  "Report an Issue",
  "Partnership / Press",
  "Account & Billing",
  "Other",
];

const FAQS = [
  {
    q: "How do I become a service provider on Inzira Works?",
    a: "Sign up for a free account, select \"Service Provider\" during role selection, then complete your profile with your skills, portfolio, and verification documents. Once approved, you'll start appearing in search results.",
  },
  {
    q: "Is Inzira Works free to use?",
    a: "Yes — creating an account and browsing providers is completely free. Providers pay no commission on their first 10 completed jobs, after which a small platform fee applies to help us maintain and improve the service.",
  },
  {
    q: "How is the Trust Score calculated?",
    a: "The Trust Score combines customer ratings (40%), completed jobs (25%), profile completeness (15%), response rate (10%), and verification status (10%) into a single score from 0–100. Visit our About page for the full breakdown.",
  },
  {
    q: "What payment methods are supported?",
    a: "We're built with mobile money in mind (MTN Mobile Money and Airtel Money), since this is the most common payment method for informal service providers and customers in Rwanda.",
  },
  {
    q: "I found an issue with a provider's profile — how do I report it?",
    a: "Use the contact form below and select \"Report an Issue\" as the subject. Include the provider's name and a description of the issue, and our team will review it within 48 hours.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// FAQ ACCORDION ITEM
// ─────────────────────────────────────────────────────────────────────────────
function FAQItem({ faq, isOpen, onToggle }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-slate-800 text-sm">{faq.q}</span>
        <ChevronDown
          size={16}
          style={{ color: "#F97316", transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}
        />
      </button>
      {isOpen && (
        <div className="px-5 pb-4">
          <p className="text-sm text-slate-500 leading-relaxed">{faq.a}</p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTACT FORM
// ─────────────────────────────────────────────────────────────────────────────
function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: SUBJECTS[0], message: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required.";
    if (!form.email) errs.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Enter a valid email.";
    if (!form.message.trim()) errs.message = "Message cannot be empty.";
    else if (form.message.trim().length < 10) errs.message = "Please write at least 10 characters.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      // TODO: replace with real API call
      // await contactService.send(form);
      await new Promise((r) => setTimeout(r, 1000));
      setSent(true);
      setForm({ name: "", email: "", subject: SUBJECTS[0], message: "" });
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 flex flex-col items-center text-center gap-4">
        <div style={{ backgroundColor: "#F0FDF4", border: "2px solid #10B981" }} className="w-16 h-16 rounded-full flex items-center justify-center">
          <CheckCircle size={30} style={{ color: "#10B981" }} />
        </div>
        <div>
          <h3 style={{ color: "#1E293B" }} className="text-xl font-black">Message sent!</h3>
          <p className="text-slate-500 text-sm mt-2 leading-relaxed">
            Thanks for reaching out. Our team typically responds within 24–48 hours.
          </p>
        </div>
        <button
          onClick={() => setSent(false)}
          style={{ color: "#F97316" }}
          className="text-sm font-semibold hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8 flex flex-col gap-5">
      <div>
        <h3 style={{ color: "#1E293B" }} className="text-xl font-black">Send us a message</h3>
        <p className="text-slate-500 text-sm mt-1">We'd love to hear from you. Fill out the form below.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={set("name")}
              placeholder="Your name"
              className={`w-full px-4 py-3 rounded-xl border text-sm text-slate-800 outline-none transition-all placeholder-slate-400 bg-white
                ${errors.name ? "border-red-400 focus:ring-2 focus:ring-red-100" : "border-slate-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"}`}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Email Address</label>
            <input
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="you@example.com"
              className={`w-full px-4 py-3 rounded-xl border text-sm text-slate-800 outline-none transition-all placeholder-slate-400 bg-white
                ${errors.email ? "border-red-400 focus:ring-2 focus:ring-red-100" : "border-slate-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"}`}
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Subject</label>
          <select
            value={form.subject}
            onChange={set("subject")}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-white"
          >
            {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Message</label>
          <textarea
            value={form.message}
            onChange={set("message")}
            rows={5}
            placeholder="Tell us how we can help..."
            className={`w-full px-4 py-3 rounded-xl border text-sm text-slate-800 outline-none transition-all placeholder-slate-400 resize-none bg-white
              ${errors.message ? "border-red-400 focus:ring-2 focus:ring-red-100" : "border-slate-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"}`}
          />
          <div className="flex justify-between">
            {errors.message ? <p className="text-xs text-red-500">{errors.message}</p> : <span />}
            <p className="text-xs text-slate-400">{form.message.length}/1000</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ backgroundColor: loading ? "#FDA96B" : "#F97316" }}
          className="text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {loading ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function ContactPage() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8FAFC" }}>
      <Navbar />

      {/* Hero */}
      <section
        style={{ background: "linear-gradient(135deg, #FFF7ED 0%, #FFECD2 50%, #FFF7ED 100%)" }}
        className="py-14"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center flex flex-col gap-3">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1.5 rounded-full w-fit mx-auto">
            <MessageCircle size={13} /> We're here to help
          </div>
          <h1 style={{ color: "#1E293B" }} className="text-3xl sm:text-4xl font-black tracking-tight">Get in Touch</h1>
          <p className="text-slate-500 text-base max-w-xl mx-auto">
            Questions, feedback, or partnership ideas — our team usually responds within 24–48 hours.
          </p>
        </div>
      </section>

      {/* Contact info cards */}
      <section className="py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CONTACT_INFO.map((info) => (
            <div key={info.label} className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-2">
              <div style={{ backgroundColor: "#FFF7ED", color: "#F97316" }} className="w-10 h-10 rounded-xl flex items-center justify-center">
                <info.Icon size={18} />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{info.label}</p>
              <p className="text-sm font-medium text-slate-700 leading-relaxed">{info.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Form + Map */}
      <section className="pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-[1.2fr_1fr] gap-6">
          <ContactForm />

          {/* Map placeholder + quick links */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden flex-1 min-h-[240px] flex items-center justify-center relative">
              {/* Map placeholder */}
              <div style={{ backgroundColor: "#F1F5F9" }} className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <MapPin size={36} style={{ color: "#CBD5E1" }} />
                <p className="text-sm font-medium text-slate-500">Kigali Innovation City</p>
                <p className="text-xs text-slate-400">Gasabo, Kigali, Rwanda</p>
              </div>
            </div>

            {/* Quick help links */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-3">
              <p style={{ color: "#1E293B" }} className="font-bold text-sm">Quick Links</p>
              {[
                { label: "Help Center",      Icon: HelpCircle },
                { label: "Become a Provider", Icon: Briefcase  },
                { label: "Trust & Safety",   Icon: Shield      },
                { label: "Terms of Use",     Icon: FileText    },
              ].map((link) => (
                <a key={link.label} href="#" className="flex items-center gap-3 text-sm text-slate-600 hover:text-orange-500 transition-colors">
                  <link.Icon size={15} /> {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ backgroundColor: "#FFF7ED" }} className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p style={{ color: "#F97316" }} className="text-xs font-bold uppercase tracking-widest mb-3">FAQ</p>
            <h2 style={{ color: "#1E293B" }} className="text-3xl font-black tracking-tight">Frequently Asked Questions</h2>
          </div>
          <div className="flex flex-col gap-3">
            {FAQS.map((faq, i) => (
              <FAQItem
                key={faq.q}
                faq={faq}
                isOpen={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? -1 : i)}
              />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
