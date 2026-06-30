import { useState, useEffect, createContext, useContext } from "react";
import { Link } from "react-router-dom";
import {
  Search, MapPin, Star, ArrowRight,
  Scissors, Sparkles, Package, ChefHat,
} from "lucide-react";
import Navbar from "../../components/shared/Navbar";
import PageTransition from "../../components/shared/PageTransition";

// ─────────────────────────────────────────────────────────────────────────────
// TRANSLATIONS
// ─────────────────────────────────────────────────────────────────────────────
const TRANSLATIONS = {
  en: {
    nav_browse: "Browse Services",
    nav_how: "How It Works",
    nav_about: "About Us",
    nav_contact: "Contact",
    nav_login: "Log in",
    nav_getstarted: "Get Started",

    hero_h1_1: "Find Skilled Women",
    hero_h1_2: "You Can Trust",
    hero_desc: "Verified tailors, hairdressers, artisans, and caterers across Gasabo, Kicukiro, and Nyarugenge — with a Trust Score on every profile.",
    hero_search_placeholder: "e.g. Tailor in Gasabo...",
    hero_search_btn: "Search",
    hero_trust: "verified providers ready to help",
    hero_available: "Available Today",
    hero_verified: "Verified Profile",
    hero_book: "Book Now",

    fp_repeat: "Repeat",
    fp_response: "Response",
    fp_jobs: "jobs",
    fp_view_profile: "View Profile",
    fp_viewall: "View all providers",
    fp_h2: "Top Providers",

    cat_h2: "What are you looking for?",
    cat_browse: "Browse all",

    hiw_h2: "Simple. Safe. Local.",
    hiw_s1_title: "Search & Discover",
    hiw_s1_desc: "Browse verified providers by category, district, or skill. Filter by Trust Score and ratings.",
    hiw_s2_title: "Review Profiles",
    hiw_s2_desc: "Explore portfolios, completed jobs, and customer reviews. Trust Score gives you the full picture.",
    hiw_s3_title: "Book Directly",
    hiw_s3_desc: "Send a booking request with your requirements. Providers confirm and you're set — pay via mobile money.",

    test_h2: "Trusted by Kigali's Community",
    test_1: "I found an incredible tailor through Inzira Works. Her work quality is exceptional and the Trust Score gave me confidence before even meeting her.",
    test_2: "Booking skilled women through this platform has transformed how I source talent for events. Fast, reliable, and locally connected.",
    test_3: "The verified profiles and portfolio feature make it easy to trust new service providers. We've hired three providers from Inzira Works this quarter.",

    cta_h2: "Are you a skilled woman in Kigali?",
    cta_desc: "Create your profile, showcase your work, and start receiving bookings.",
    cta_join: "Join as a Provider",
    cta_browse: "Browse Services",
    cta_free: "Free to join · No commission on your first 10 jobs",

    foot_tagline: "Connecting skilled women with customers across Kigali City.",
    foot_platform: "Platform",
    foot_company: "Company",
    foot_support: "Support",
    foot_links_platform: ["Browse Providers", "Categories", "How It Works", "Trust Score"],
    foot_links_company: ["About Us", "Contact", "Blog", "Careers"],
    foot_links_support: ["Help Center", "Privacy Policy", "Terms of Use", "Report Issue"],
    foot_copy: "Inzira Works. Built in Rwanda.",
    foot_capstone: "BSc Software Engineering Capstone Project",
  },

  rw: {
    nav_browse: "Reba Serivisi",
    nav_how: "Uburyo Bikora",
    nav_about: "Abo Turi Bo",
    nav_contact: "Twandikire",
    nav_login: "Injira",
    nav_getstarted: "Tangira",

    hero_h1_1: "Shaka Abagore Inzobere",
    hero_h1_2: "Ushobora Kwizera",
    hero_desc: "Abagore inzobere bemejwe baguye i Gasabo, Kicukiro, na Nyarugenge — buri umwe afite Trust Score ku mwirondoro we.",
    hero_search_placeholder: "urugero: Usona i Gasabo...",
    hero_search_btn: "Shaka",
    hero_trust: "abatoa serivisi bemejwe bategereye gufasha",
    hero_available: "Ahari Uyu Munsi",
    hero_verified: "Umwirondoro Wemejwe",
    hero_book: "Fata Gahunda",

    fp_repeat: "Bagarutse",
    fp_response: "Igisubizo",
    fp_jobs: "imirimo",
    fp_view_profile: "Reba Umwirondoro",
    fp_viewall: "Reba abatoa serivisi bose",
    fp_h2: "Abatoa Serivisi Ba Mbere",

    cat_h2: "Urashaka iki?",
    cat_browse: "Reba byose",

    hiw_h2: "Byoroshye. Biramutse. Bihuje n'Igihugu.",
    hiw_s1_title: "Shaka no Kumenya",
    hiw_s1_desc: "Reba abatoa serivisi bemejwe ukurikije icyiciro, indaro, cyangwa ubuhanga.",
    hiw_s2_title: "Suzuma Imyirondoro",
    hiw_s2_desc: "Reba portfolio, imirimo yakewe, n'ibitekerezo by'abakiriya.",
    hiw_s3_title: "Fata Gahunda",
    hiw_s3_desc: "Ohereza gahunda y'ubufasha ukeneye. Abatoa serivisi bemeza kandi uhite usigura.",

    test_h2: "Bizewe na Sosiyete ya Kigali",
    test_1: "Nabonanye usona w'inzobere hakoreshejwe Inzira Works. Akazi ke ni keza cyane kandi Trust Score yanyemereye icyizere mbere y'uko duhurana.",
    test_2: "Gufata gahunda y'abagore inzobere bakoresheje uru rubuga byahinduye uburyo nshaka imitihanangwa.",
    test_3: "Imyirondoro yemejwe na portfolio biroroshya kwizera abatoa serivisi bashya.",

    cta_h2: "Uri umugoroba w'inzobere i Kigali?",
    cta_desc: "Kora umwirondoro wawe, erekana akazi kawe, kandi utangire guhabwa gahunda.",
    cta_join: "Injira nk'Utoa Serivisi",
    cta_browse: "Reba Serivisi",
    cta_free: "Kwinjira biribwa · Nta commission ku imirimo 10 ya mbere",

    foot_tagline: "Guhuza abagore inzobere n'abakiriya mu Kigali yose.",
    foot_platform: "Urubuga",
    foot_company: "Sosiyete",
    foot_support: "Inkunga",
    foot_links_platform: ["Reba Abatoa Serivisi", "Ibyiciro", "Uburyo Bikora", "Trust Score"],
    foot_links_company: ["Abo Turi Bo", "Twandikire", "Blog", "Akazi"],
    foot_links_support: ["Ikigo cy'Ubufasha", "Politiki y'Ubuzima bw'Amakuru", "Amabwiriza", "Tanga Ikibazo"],
    foot_copy: "Inzira Works. Yakozwe u Rwanda.",
    foot_capstone: "Umushinga wa BSc Software Engineering",
  },

  sw: {
    nav_browse: "Vinjari Huduma",
    nav_how: "Jinsi Inavyofanya Kazi",
    nav_about: "Kuhusu Sisi",
    nav_contact: "Wasiliana",
    nav_login: "Ingia",
    nav_getstarted: "Anza",

    hero_h1_1: "Pata Wanawake Wenye Ujuzi",
    hero_h1_2: "Unaoamini",
    hero_desc: "Watoa huduma wanawake walioidhinishwa katika Gasabo, Kicukiro, na Nyarugenge — kila mmoja ana Trust Score kwenye wasifu wake.",
    hero_search_placeholder: "mf. Mshonaji Gasabo...",
    hero_search_btn: "Tafuta",
    hero_trust: "watoa huduma waliothibitishwa wako tayari kusaidia",
    hero_available: "Anapatikana Leo",
    hero_verified: "Wasifu Uliothibitishwa",
    hero_book: "Weka Nafasi",

    fp_repeat: "Wanarudi",
    fp_response: "Jibu",
    fp_jobs: "kazi",
    fp_view_profile: "Tazama Wasifu",
    fp_viewall: "Tazama watoa huduma wote",
    fp_h2: "Watoa Huduma Bora",

    cat_h2: "Unatafuta nini?",
    cat_browse: "Tazama zote",

    hiw_h2: "Rahisi. Salama. Ya Ndani.",
    hiw_s1_title: "Tafuta na Gundua",
    hiw_s1_desc: "Vinjari watoa huduma waliothibitishwa kwa kategoria, wilaya, au ujuzi.",
    hiw_s2_title: "Kagua Maelezo",
    hiw_s2_desc: "Chunguza kazi zilizokamilika na maoni ya wateja.",
    hiw_s3_title: "Weka Nafasi Moja kwa Moja",
    hiw_s3_desc: "Tuma ombi la nafasi na mahitaji yako. Watoa huduma wanathibitisha na uko tayari.",

    test_h2: "Inaaminiwa na Jamii ya Kigali",
    test_1: "Nilipata mshonaji wa ajabu kupitia Inzira Works. Ubora wa kazi yake ni wa kipekee na Trust Score ilinipa ujasiri.",
    test_2: "Kuweka nafasi ya wanawake wenye ujuzi kupitia jukwaa hili kumebadilisha jinsi ninavyotafuta vipaji.",
    test_3: "Maelezo yaliyothibitishwa na kipengele cha mkoba vinafanya iwe rahisi kuamini watoa huduma wapya.",

    cta_h2: "Je, wewe ni mwanamke mwenye ujuzi Kigali?",
    cta_desc: "Unda wasifu wako, onyesha kazi yako, na uanze kupokea nafasi.",
    cta_join: "Jiunge kama Mtoa Huduma",
    cta_browse: "Vinjari Huduma",
    cta_free: "Bure kujiunga · Hakuna kamisheni kwa kazi 10 za kwanza",

    foot_tagline: "Kuunganisha wanawake wenye ujuzi na wateja katika Kigali yote.",
    foot_platform: "Jukwaa",
    foot_company: "Kampuni",
    foot_support: "Msaada",
    foot_links_platform: ["Vinjari Watoa Huduma", "Kategoria", "Jinsi Inavyofanya Kazi", "Trust Score"],
    foot_links_company: ["Kuhusu Sisi", "Wasiliana", "Blogu", "Kazi"],
    foot_links_support: ["Kituo cha Msaada", "Sera ya Faragha", "Masharti ya Matumizi", "Ripoti Tatizo"],
    foot_copy: "Inzira Works. Iliyotengenezwa Rwanda.",
    foot_capstone: "Mradi wa BSc Software Engineering",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// LANG CONTEXT
// ─────────────────────────────────────────────────────────────────────────────
const LangContext = createContext(null);

function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside LangProvider");
  return ctx;
}

function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("iw_lang") || "en");
  useEffect(() => {
    localStorage.setItem("iw_lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);
  const t = (key) => TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS["en"]?.[key] ?? key;
  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { label: "Tailoring & Fashion", Icon: Scissors },
  { label: "Hair & Beauty",       Icon: Sparkles  },
  { label: "Handcraft & Weaving", Icon: Package   },
  { label: "Catering & Food",     Icon: ChefHat   },
];

const FEATURED_PROVIDERS = [
  { id: 1, name: "Uwase Clarisse", role: "Tailor & Fashion Designer",  district: "Gasabo",     trustScore: 94, rating: 4.9, reviews: 38,  completedJobs: 112, initials: "UC", color: "#F97316" },
  { id: 2, name: "Mukamana Diane", role: "Professional Hairdresser",   district: "Kicukiro",   trustScore: 88, rating: 4.7, reviews: 55,  completedJobs: 203, initials: "MD", color: "#8B5CF6" },
  { id: 3, name: "Ingabire Alice", role: "Handcraft & Basket Weaving", district: "Nyarugenge", trustScore: 91, rating: 4.8, reviews: 27,  completedJobs: 89,  initials: "IA", color: "#10B981" },
];

const TESTIMONIALS = [
  { name: "Niyomugaba Jean", role: "Business Owner, Kigali", textKey: "test_1", rating: 5, initials: "NJ" },
  { name: "Habimana Eric",   role: "Event Planner",          textKey: "test_2", rating: 5, initials: "HE" },
  { name: "Uwimana Grace",   role: "Hotel Manager, Kigali",  textKey: "test_3", rating: 4, initials: "UG" },
];

const STEPS = [
  { num: "01", titleKey: "hiw_s1_title", descKey: "hiw_s1_desc" },
  { num: "02", titleKey: "hiw_s2_title", descKey: "hiw_s2_desc" },
  { num: "03", titleKey: "hiw_s3_title", descKey: "hiw_s3_desc" },
];

// ─────────────────────────────────────────────────────────────────────────────
// PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────
function StarRating({ rating }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={13} style={{
          color: s <= Math.round(rating) ? "#F97316" : "#E2E8F0",
          fill:  s <= Math.round(rating) ? "#F97316" : "none",
        }} />
      ))}
    </span>
  );
}

function TrustBadge({ score }) {
  const color = score >= 90 ? "#10B981" : "#F97316";
  return (
    <span style={{ border: `1.5px solid ${color}`, color, borderRadius: "999px" }}
      className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold">
      ✦ {score}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO
// ─────────────────────────────────────────────────────────────────────────────
function HeroSection() {
  const { t } = useLang();
  return (
    <section
      className="pt-16 flex items-center overflow-hidden"
      style={{ backgroundColor: "#FFFFFF", minHeight: "100vh" }}
    >
      <div className="px-4 sm:px-6 py-20 w-full grid md:grid-cols-2 gap-16 items-center">
        {/* Left */}
        <div className="flex flex-col gap-8">
          <h1
            style={{
              color: "#0F172A",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              fontWeight: 900,
              fontSize: "clamp(2.6rem, 5.5vw, 4.25rem)",
            }}
          >
            {t("hero_h1_1")}<br />
            <span style={{ color: "#F97316" }}>{t("hero_h1_2")}</span>
          </h1>

          <p style={{ color: "#64748B", lineHeight: 1.75, maxWidth: "26rem", fontSize: "1.0625rem" }}>
            {t("hero_desc")}
          </p>

          <div
            className="flex gap-2 bg-white p-1.5 border border-slate-200 max-w-md"
            style={{ borderRadius: "14px" }}
          >
            <Search size={17} className="text-slate-400 ml-2.5 my-auto flex-shrink-0" />
            <input
              type="text"
              placeholder={t("hero_search_placeholder")}
              className="flex-1 py-2.5 text-sm text-slate-700 outline-none bg-transparent placeholder-slate-400"
            />
            <Link
              to="/providers"
              className="text-white font-semibold text-sm px-5 py-2.5 hover:opacity-90 transition-opacity whitespace-nowrap"
              style={{ backgroundColor: "#F97316", borderRadius: "10px" }}
            >
              {t("hero_search_btn")}
            </Link>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <div className="flex -space-x-2.5">
              {[["UC","#F97316"],["MD","#8B5CF6"],["IA","#10B981"]].map(([i, c]) => (
                <div key={i}
                  style={{ backgroundColor: c + "22", border: `2px solid ${c}`, color: c }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                >{i}</div>
              ))}
            </div>
            <p className="text-sm" style={{ color: "#94A3B8" }}>
              <strong style={{ color: "#0F172A" }}>3+</strong> {t("hero_trust")}
            </p>
          </div>
        </div>

        {/* Right — provider preview card */}
        <div className="relative flex justify-center md:justify-end">
          <div className="relative w-full max-w-[340px]">
            <div
              className="bg-white p-6"
              style={{ borderRadius: "20px", border: "1px solid #E2E8F0", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div style={{ width: 52, height: 52, backgroundColor: "#F9731622", border: "2px solid #F97316", color: "#F97316", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18, flexShrink: 0 }}>
                  UC
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">Uwase Clarisse</p>
                  <p className="text-xs text-slate-500 mt-0.5">Tailor & Fashion Designer</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 mb-5">
                <TrustBadge score={94} />
                <StarRating rating={4.9} />
                <span className="text-xs text-slate-400">4.9 (38)</span>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-5">
                {[
                  { label: "Jobs",            value: "112"  },
                  { label: t("fp_repeat"),    value: "78%"  },
                  { label: t("fp_response"),  value: "~1hr" },
                ].map((m) => (
                  <div key={m.label}
                    className="p-2.5 text-center"
                    style={{ backgroundColor: "#F8FAFC", borderRadius: "10px", border: "1px solid #E2E8F0" }}
                  >
                    <p className="font-bold text-slate-800 text-sm">{m.value}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{m.label}</p>
                  </div>
                ))}
              </div>

              <Link
                to="/providers"
                className="block w-full text-white font-semibold text-sm py-3 hover:opacity-90 transition-opacity text-center"
                style={{ backgroundColor: "#F97316", borderRadius: "10px" }}
              >
                {t("hero_book")}
              </Link>
            </div>

            {/* Floating — verified */}
            <div
              className="absolute -top-3 -right-3 bg-white text-xs font-semibold px-3 py-1.5 flex items-center gap-1.5"
              style={{ borderRadius: "999px", border: "1px solid #BBF7D0", color: "#059669", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
            >
              <span>✓</span> {t("hero_verified")}
            </div>

            {/* Floating — available */}
            <div
              className="absolute -bottom-3 -left-3 text-white text-xs font-medium px-3 py-2 flex items-center gap-2"
              style={{ backgroundColor: "#0F172A", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.18)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full inline-block animate-pulse" style={{ backgroundColor: "#34D399" }} />
              {t("hero_available")}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PLATFORM TICKER
// ─────────────────────────────────────────────────────────────────────────────
function PlatformBar() {
  const items = [
    "Serving Gasabo · Kicukiro · Nyarugenge",
    "Tailoring · Hair · Handcraft · Catering",
    "Trust Score on every profile",
    "Free to join",
  ];
  return (
    <div style={{ backgroundColor: "#0F172A" }} className="py-3 border-y border-slate-800">
      <div className="px-4 sm:px-6 flex items-center justify-center flex-wrap gap-x-8 gap-y-1">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-8">
            <span className="text-slate-500 text-xs tracking-wide">{item}</span>
            {i < items.length - 1 && <span className="text-slate-800 hidden sm:inline">·</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORIES
// ─────────────────────────────────────────────────────────────────────────────
function CategoriesSection() {
  const { t } = useLang();
  return (
    <section style={{ backgroundColor: "#FFFFFF" }} className="py-20">
      <div className="px-4 sm:px-6">
        <div className="flex items-end justify-between mb-10">
          <h2 style={{ color: "#0F172A", fontWeight: 900, letterSpacing: "-0.02em", fontSize: "clamp(1.6rem, 3vw, 2.25rem)" }}>
            {t("cat_h2")}
          </h2>
          <Link to="/providers" className="text-sm font-semibold flex items-center gap-1.5 hover:opacity-70 transition-opacity" style={{ color: "#F97316" }}>
            {t("cat_browse")} <ArrowRight size={14} />
          </Link>
        </div>

        {/* Grid with hairline dividers */}
        <div className="grid grid-cols-2 lg:grid-cols-4 border border-slate-100" style={{ borderRadius: "16px", overflow: "hidden" }}>
          {CATEGORIES.map(({ label, Icon }, i) => (
            <Link
              key={label}
              to="/providers"
              className="group flex flex-col gap-4 p-7 bg-white hover:bg-slate-50 transition-colors relative"
              style={{ borderRight: i < 3 ? "1px solid #F1F5F9" : "none" }}
            >
              <Icon size={22} style={{ color: "#F97316" }} />
              <div>
                <p className="font-bold text-slate-800 text-sm leading-snug">{label}</p>
                <span className="text-xs text-slate-400 mt-1.5 flex items-center gap-1 group-hover:text-orange-500 transition-colors">
                  {t("cat_browse")} <ArrowRight size={11} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FEATURED PROVIDERS
// ─────────────────────────────────────────────────────────────────────────────
function FeaturedProviders() {
  const { t } = useLang();
  return (
    <section style={{ backgroundColor: "#F8FAFC" }} className="py-20">
      <div className="px-4 sm:px-6">
        <div className="flex items-end justify-between mb-10">
          <h2 style={{ color: "#0F172A", fontWeight: 900, letterSpacing: "-0.02em", fontSize: "clamp(1.6rem, 3vw, 2.25rem)" }}>
            {t("fp_h2")}
          </h2>
          <Link to="/providers" className="text-sm font-semibold flex items-center gap-1.5 hover:opacity-70 transition-opacity" style={{ color: "#F97316" }}>
            {t("fp_viewall")} <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {FEATURED_PROVIDERS.map((p) => (
            <Link
              key={p.id}
              to="/providers"
              className="group bg-white p-5 flex flex-col gap-4 hover:shadow-md transition-all duration-200"
              style={{ borderRadius: "16px", border: "1px solid #E2E8F0" }}
            >
              {/* Header */}
              <div className="flex items-center gap-3">
                <div style={{
                  width: 44, height: 44, backgroundColor: p.color + "18",
                  border: `1.5px solid ${p.color}`, color: p.color,
                  borderRadius: "50%", display: "flex", alignItems: "center",
                  justifyContent: "center", fontWeight: 700, fontSize: 15, flexShrink: 0,
                }}>
                  {p.initials}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 text-sm truncate">{p.name}</p>
                  <p className="text-xs text-slate-500 truncate">{p.role}</p>
                </div>
              </div>

              {/* Rating + badge */}
              <div className="flex items-center gap-2.5">
                <TrustBadge score={p.trustScore} />
                <StarRating rating={p.rating} />
                <span className="text-xs text-slate-400">{p.rating} ({p.reviews})</span>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3.5 border-t border-slate-100 mt-auto">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <MapPin size={11} /> {p.district} · {p.completedJobs} {t("fp_jobs")}
                </span>
                <span className="text-xs font-semibold flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color: "#F97316" }}>
                  {t("fp_view_profile")} <ArrowRight size={11} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HOW IT WORKS
// ─────────────────────────────────────────────────────────────────────────────
function HowItWorks() {
  const { t } = useLang();
  return (
    <section id="how-it-works" style={{ backgroundColor: "#FFFFFF" }} className="py-20">
      <div className="px-4 sm:px-6">
        <h2 style={{ color: "#0F172A", fontWeight: 900, letterSpacing: "-0.02em", fontSize: "clamp(1.6rem, 3vw, 2.25rem)", marginBottom: "3rem" }}>
          {t("hiw_h2")}
        </h2>

        <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {STEPS.map((step, i) => (
            <div key={step.num} className={`flex flex-col gap-4 py-8 md:py-0 ${i === 0 ? "md:pr-10" : i === 1 ? "md:px-10" : "md:pl-10"}`}>
              <span
                style={{ color: "#F97316", fontWeight: 900, fontSize: "3.5rem", lineHeight: 1, opacity: 0.15, display: "block" }}
              >
                {step.num}
              </span>
              <h3 className="font-bold text-slate-800 text-base -mt-1">{t(step.titleKey)}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{t(step.descKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TESTIMONIALS
// ─────────────────────────────────────────────────────────────────────────────
function Testimonials() {
  const { t } = useLang();
  return (
    <section style={{ backgroundColor: "#0F172A" }} className="py-20">
      <div className="px-4 sm:px-6">
        <h2 className="text-white font-black mb-12" style={{ letterSpacing: "-0.02em", fontSize: "clamp(1.6rem, 3vw, 2.25rem)" }}>
          {t("test_h2")}
        </h2>

        <div className="grid md:grid-cols-3 gap-0 border-t border-slate-800 pt-12 divide-y md:divide-y-0 md:divide-x divide-slate-800">
          {TESTIMONIALS.map((test, i) => (
            <div key={test.name} className={`flex flex-col gap-5 py-8 md:py-0 ${i === 0 ? "md:pr-10" : i === 1 ? "md:px-10" : "md:pl-10"}`}>
              <StarRating rating={test.rating} />
              <p className="text-slate-300 text-sm leading-relaxed flex-1">
                &ldquo;{t(test.textKey)}&rdquo;
              </p>
              <div className="pt-5 border-t border-slate-800">
                <p className="text-white text-sm font-semibold">{test.name}</p>
                <p className="text-slate-500 text-xs mt-0.5">{test.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CTA
// ─────────────────────────────────────────────────────────────────────────────
function CTASection() {
  const { t } = useLang();
  return (
    <section style={{ backgroundColor: "#F97316" }} className="py-16">
      <div className="px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
        <div>
          <h2 className="text-white font-black leading-tight" style={{ letterSpacing: "-0.02em", fontSize: "clamp(1.5rem, 3vw, 2rem)", maxWidth: "30rem" }}>
            {t("cta_h2")}
          </h2>
          <p className="mt-2 text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
            {t("cta_free")}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
          <Link
            to="/signup"
            className="bg-white font-bold px-7 py-3.5 hover:bg-orange-50 transition-colors text-sm text-center whitespace-nowrap"
            style={{ color: "#C2410C", borderRadius: "10px" }}
          >
            {t("cta_join")}
          </Link>
          <Link
            to="/providers"
            className="font-bold px-7 py-3.5 transition-colors text-sm text-center whitespace-nowrap"
            style={{ color: "white", border: "1.5px solid rgba(255,255,255,0.35)", borderRadius: "10px" }}
          >
            {t("cta_browse")}
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────────────────────────────────────
function Footer() {
  const { t } = useLang();
  const cols = [
    { headingKey: "foot_platform", linksKey: "foot_links_platform" },
    { headingKey: "foot_company",  linksKey: "foot_links_company"  },
    { headingKey: "foot_support",  linksKey: "foot_links_support"  },
  ];
  return (
    <footer style={{ backgroundColor: "#0A0F1A" }} className="py-14">
      <div className="px-4 sm:px-6">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div style={{ backgroundColor: "#F97316", width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span className="text-white font-black text-xs">IW</span>
              </div>
              <span className="text-white font-bold">Inzira Works</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mt-1">{t("foot_tagline")}</p>
            <p className="text-slate-700 text-xs flex items-center gap-1 mt-1">
              <MapPin size={11} /> Kigali, Rwanda
            </p>
          </div>

          {cols.map((col) => (
            <div key={col.headingKey}>
              <p className="text-white font-semibold text-sm mb-4">{t(col.headingKey)}</p>
              <div className="flex flex-col gap-2.5">
                {(t(col.linksKey) || []).map((link) => (
                  <a key={link} href="#" className="text-slate-500 text-sm hover:text-slate-300 transition-colors">
                    {link}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-slate-600 text-xs">© {new Date().getFullYear()} {t("foot_copy")}</p>
          <p className="text-slate-700 text-xs">{t("foot_capstone")}</p>
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE ROOT
// ─────────────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <LangProvider>
      <PageTransition>
        <div className="min-h-screen font-sans">
          <Navbar />
          <HeroSection />
          <PlatformBar />
          <CategoriesSection />
          <FeaturedProviders />
          <HowItWorks />
          <Testimonials />
          <CTASection />
          <Footer />
        </div>
      </PageTransition>
    </LangProvider>
  );
}
