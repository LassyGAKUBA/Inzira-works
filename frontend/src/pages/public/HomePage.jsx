import { useState, useEffect, createContext, useContext } from "react";
import { Link } from "react-router-dom";
import {
  Search, MapPin, Star, Check, CheckCircle, ArrowRight,
  Menu, X, ChevronDown, Scissors, Sparkles, Package,
  ChefHat, Calendar, Eye, Shield, Users,
} from "lucide-react";

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

    hero_badge: "Proudly Kigali-based Platform",
    hero_h1_1: "Find Skilled Women",
    hero_h1_2: "You Can Trust",
    hero_desc: "Inzira Works connects you with verified, talented women professionals across Gasabo, Kicukiro, and Nyarugenge. From tailoring to handcraft — book with confidence.",
    hero_search_placeholder: "e.g. Tailor in Gasabo...",
    hero_search_btn: "Search",
    hero_trust: "verified providers ready to help",
    hero_available: "Available Today",
    hero_verified: "Verified Profile",
    hero_book: "Book Now",

    stat_districts: "Districts Covered",
    stat_categories: "Service Categories",
    stat_verified: "Verified Profiles",
    stat_trust: "Trust Score System",

    cat_label: "Browse by Category",
    cat_h2: "What are you looking for?",
    cat_desc: "Explore services from skilled women professionals across Kigali",
    cat_browse: "Browse all",

    fp_label: "Featured Providers",
    fp_h2: "Meet Our Top Professionals",
    fp_viewall: "View all providers",
    fp_jobs: "jobs",
    fp_repeat: "Repeat",
    fp_response: "Response",
    fp_view_profile: "View Profile",

    badge_top: "Top Rated",
    badge_verified: "Verified",

    hiw_label: "How It Works",
    hiw_h2: "Simple. Safe. Local.",
    hiw_s1_title: "Search & Discover",
    hiw_s1_desc: "Browse verified service providers by category, district, or skill. Filter by Trust Score and ratings.",
    hiw_s2_title: "Review Profiles",
    hiw_s2_desc: "Explore portfolios, completed jobs, and customer reviews. Trust Score gives you a full picture before booking.",
    hiw_s3_title: "Book Directly",
    hiw_s3_desc: "Send a booking request with your requirements. Providers confirm and you're set — pay via mobile money.",

    ts_label: "Our Innovation",
    ts_h2: "The Trust Score",
    ts_sub: "Know before you book",
    ts_desc: "Every provider on Inzira Works has a Trust Score — a transparent, data-driven credibility rating built from real job history, customer feedback, and platform activity.",
    ts_learn: "Learn how we calculate it",
    ts_breakdown: "Score Breakdown",
    ts_f1: "Customer Ratings",
    ts_f2: "Completed Jobs",
    ts_f3: "Profile Completeness",
    ts_f4: "Response Rate",
    ts_f5: "Verification Status",

    test_label: "Testimonials",
    test_h2: "Trusted by Kigali's Community",
    test_1: "I found an incredible tailor through Inzira Works. Her work quality is exceptional and the Trust Score gave me confidence before even meeting her.",
    test_2: "Booking skilled women through this platform has transformed how I source talent for events. Fast, reliable, and locally connected.",
    test_3: "The verified profiles and portfolio feature make it easy to trust new service providers. We've hired three providers from Inzira Works this quarter.",

    cta_h2: "Are you a skilled woman in Kigali?",
    cta_desc: "Join Inzira Works — create your profile, showcase your work, and start receiving bookings from customers who need your skills.",
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

    lang_label: "Language",
  },

  rw: {
    nav_browse: "Reba Serivisi",
    nav_how: "Uburyo Bikora",
    nav_about: "Abo Turi Bo",
    nav_contact: "Twandikire",
    nav_login: "Injira",
    nav_getstarted: "Tangira",

    hero_badge: "Urubuga Rwacu i Kigali",
    hero_h1_1: "Shaka Abagore Inzobere",
    hero_h1_2: "Ushobora Kwizera",
    hero_desc: "Inzira Works ikuhuza n'abagore inzobere bonywe, baguye i Gasabo, Kicukiro, na Nyarugenge. Kuva mu gutera imyenda kugeza mu bukorikori — bika icyizere.",
    hero_search_placeholder: "urugero: Usona i Gasabo...",
    hero_search_btn: "Shaka",
    hero_trust: "abatoa serivisi bemejwe bategereye gufasha",
    hero_available: "Ahari Uyu Munsi",
    hero_verified: "Umwirondoro Wemejwe",
    hero_book: "Fata Gahunda",

    stat_districts: "Indaro Zirinzwe",
    stat_categories: "Ibyiciro bya Serivisi",
    stat_verified: "Imyirondoro Yemejwe",
    stat_trust: "Sisitemu ya Trust Score",

    cat_label: "Shaka ukurikiye Icyiciro",
    cat_h2: "Urashaka iki?",
    cat_desc: "Reba serivisi z'abagore inzobere i Kigali yose",
    cat_browse: "Reba byose",

    fp_label: "Abatoa Serivisi Batoranyijwe",
    fp_h2: "Ganira n'Inzobere Zacu",
    fp_viewall: "Reba abatoa serivisi bose",
    fp_jobs: "imirimo",
    fp_repeat: "Bagarutse",
    fp_response: "Igisubizo",
    fp_view_profile: "Reba Umwirondoro",

    badge_top: "Iya Mbere",
    badge_verified: "Yemejwe",

    hiw_label: "Uburyo Bikora",
    hiw_h2: "Byoroshye. Biramutse. Bihuje n'Igihugu.",
    hiw_s1_title: "Shaka no Kumenya",
    hiw_s1_desc: "Reba abatoa serivisi bemejwe ukurikije icyiciro, indaro, cyangwa ubuhanga. Shungura ukurikiye Trust Score na igenamiterere.",
    hiw_s2_title: "Suzuma Imyirondoro",
    hiw_s2_desc: "Reba portfolio, imirimo yakewe, n'ibitekerezo by'abakiriya. Trust Score ikugezaho amakuru yuzuye mbere yo kufata gahunda.",
    hiw_s3_title: "Fata Gahunda Directly",
    hiw_s3_desc: "Ohereza gahunda y'ubufasha ukeneye. Abatoa serivisi bemeza kandi uhite usigura — wishyura hakoreshejwe mobile money.",

    ts_label: "Ubuzi Bwacu",
    ts_h2: "Trust Score",
    ts_sub: "Menya Mbere yo Gufata Gahunda",
    ts_desc: "Buri mutoa serivisi kuri Inzira Works afite Trust Score — igenamiterere risobanutse, ryubakiwe ku makuru y'akazi, ibitekerezo by'abakiriya, n'ibikorwa bya platform.",
    ts_learn: "Menya uburyo tubishyiraho",
    ts_breakdown: "Igereranya rya Score",
    ts_f1: "Igenamiterere ry'Abakiriya",
    ts_f2: "Imirimo Yakewe",
    ts_f3: "Uzuzwa kw'Umwirondoro",
    ts_f4: "Igipimo cy'Igisubizo",
    ts_f5: "Imiterere yo Kwemezwa",

    test_label: "Ibitekerezo",
    test_h2: "Bizewe na Sosiyete ya Kigali",
    test_1: "Nabonanye usona w'inzobere hakoreshejwe Inzira Works. Akazi ke ni keza cyane kandi Trust Score yanyemereye icyizere mbere y'uko duhurana.",
    test_2: "Gufata gahunda y'abagore inzobere bakoresheje uru rubuga byahinduye uburyo mshaka imitihanangwa. Byihuse, biryoheye, kandi bihuje na gahunda yacu y'igihugu.",
    test_3: "Imyirondoro yemejwe na portfolio biroroshya kwizera abatoa serivisi bashya. Twabafashe batatu kuva kuri Inzira Works gihembwe gishize.",

    cta_h2: "Uri umugoroba w'inzobere i Kigali?",
    cta_desc: "Injira kuri Inzira Works — kora umwirondoro wawe, erekana akazi kawe, kandi utangire guhabwa gahunda n'abakiriya bakeneye ubuhanga bwawe.",
    cta_join: "Injira nk'Utoa Serivisi",
    cta_browse: "Reba Serivisi",
    cta_free: "Kwinjira biribwa · Nta commission ku imirimo 10 ya mbere",

    foot_tagline: "Guhuza abagore inzobere n'abakiriya mu Kigali yose.",
    foot_platform: "Urubuga",
    foot_company: "Sosiyete",
    foot_support: "Inkunga",
    foot_links_platform: ["Reba Abatoa Serivisi", "Ibyiciro", "Uburyo Bikora", "Trust Score"],
    foot_links_company: ["Abo Turi Bo", "Twandikire", "Blog", "Akazi"],
    foot_links_support: ["Ikigo cy'Ubufasha", "Politiki y'Ubuzima bw'Amakuru", "Amabwiriza y'Imikoreshereze", "Tanga Ikibazo"],
    foot_copy: "Inzira Works. Yakozwe u Rwanda.",
    foot_capstone: "Umushinga wa BSc Software Engineering",

    lang_label: "Ururimi",
  },

  sw: {
    nav_browse: "Vinjari Huduma",
    nav_how: "Jinsi Inavyofanya Kazi",
    nav_about: "Kuhusu Sisi",
    nav_contact: "Wasiliana",
    nav_login: "Ingia",
    nav_getstarted: "Anza",

    hero_badge: "Jukwaa la Kigali kwa Kiburi",
    hero_h1_1: "Pata Wanawake Wenye Ujuzi",
    hero_h1_2: "Unaoamini",
    hero_desc: "Inzira Works inakuunganisha na watoa huduma wanawake walioidhinishwa katika Gasabo, Kicukiro, na Nyarugenge. Kutoka ushonaji hadi ufundi — weka nafasi kwa ujasiri.",
    hero_search_placeholder: "mf. Mshonaji Gasabo...",
    hero_search_btn: "Tafuta",
    hero_trust: "watoa huduma waliothibitishwa wako tayari kusaidia",
    hero_available: "Anapatikana Leo",
    hero_verified: "Wasifu Uliothibitishwa",
    hero_book: "Weka Nafasi",

    stat_districts: "Wilaya Zinazohudumia",
    stat_categories: "Kategoria za Huduma",
    stat_verified: "Wasifu Uliothibitishwa",
    stat_trust: "Mfumo wa Trust Score",

    cat_label: "Vinjari kwa Kategoria",
    cat_h2: "Unatafuta nini?",
    cat_desc: "Chunguza huduma kutoka kwa wanawake wenye ujuzi katika Kigali yote",
    cat_browse: "Tazama zote",

    fp_label: "Watoa Huduma Walioangaziwa",
    fp_h2: "Kutana na Wataalamu Wetu Bora",
    fp_viewall: "Tazama watoa huduma wote",
    fp_jobs: "kazi",
    fp_repeat: "Wanarudi",
    fp_response: "Jibu",
    fp_view_profile: "Tazama Wasifu",

    badge_top: "Aliyepewa Daraja",
    badge_verified: "Amethibitishwa",

    hiw_label: "Jinsi Inavyofanya Kazi",
    hiw_h2: "Rahisi. Salama. Ya Ndani.",
    hiw_s1_title: "Tafuta na Gundua",
    hiw_s1_desc: "Vinjari watoa huduma waliothibitishwa kwa kategoria, wilaya, au ujuzi. Chuja kwa Trust Score na daraja.",
    hiw_s2_title: "Kagua Maelezo",
    hiw_s2_desc: "Chunguza kazi zilizokamilika na maoni ya wateja. Trust Score inakupa picha kamili kabla ya kuweka nafasi.",
    hiw_s3_title: "Weka Nafasi Moja kwa Moja",
    hiw_s3_desc: "Tuma ombi la nafasi na mahitaji yako. Watoa huduma wanathibitisha na uko tayari — lipa kupitia pesa ya simu.",

    ts_label: "Ubunifu Wetu",
    ts_h2: "Trust Score",
    ts_sub: "Jua Kabla ya Kuweka Nafasi",
    ts_desc: "Kila mtoa huduma kwenye Inzira Works ana Trust Score — kiwango cha uaminifu kinachoeleweka, kilichojengwa kutoka historia halisi ya kazi, maoni ya wateja, na shughuli za jukwaa.",
    ts_learn: "Jifunze jinsi tunavyoihesabu",
    ts_breakdown: "Mgawanyo wa Alama",
    ts_f1: "Daraja la Wateja",
    ts_f2: "Kazi Zilizokamilika",
    ts_f3: "Ukamilifu wa Wasifu",
    ts_f4: "Kiwango cha Majibu",
    ts_f5: "Hali ya Uthibitisho",

    test_label: "Ushuhuda",
    test_h2: "Inaaminiwa na Jamii ya Kigali",
    test_1: "Nilipata mshonaji wa ajabu kupitia Inzira Works. Ubora wa kazi yake ni wa kipekee na Trust Score ilinipa ujasiri kabla hata ya kukutana naye.",
    test_2: "Kuweka nafasi ya wanawake wenye ujuzi kupitia jukwaa hili kumebadilisha jinsi ninavyotafuta vipaji kwa matukio. Kwa haraka, kuaminika, na muunganisho wa ndani.",
    test_3: "Maelezo yaliyothibitishwa na kipengele cha mkoba vinafanya iwe rahisi kuamini watoa huduma wapya. Tumeajiri watoa huduma watatu kutoka Inzira Works robo hii.",

    cta_h2: "Je, wewe ni mwanamke mwenye ujuzi Kigali?",
    cta_desc: "Jiunge na Inzira Works — unda wasifu wako, onyesha kazi yako, na uanze kupokea nafasi kutoka kwa wateja wanaohitaji ujuzi wako.",
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

    lang_label: "Lugha",
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

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────
const LANG_OPTIONS = [
  { code: "en", label: "English",     short: "EN" },
  { code: "rw", label: "Kinyarwanda", short: "RW" },
  { code: "sw", label: "Swahili",     short: "SW" },
];

const CATEGORIES = [
  { labelKey: "Tailoring & Fashion", Icon: Scissors },
  { labelKey: "Hair & Beauty",       Icon: Sparkles  },
  { labelKey: "Handcraft & Weaving", Icon: Package   },
  { labelKey: "Catering & Food",     Icon: ChefHat   },
];

const FEATURED_PROVIDERS = [
  { id: 1, name: "Uwase Clarisse",  roleKey: "Tailor & Fashion Designer",    district: "Gasabo",     trustScore: 94, rating: 4.9, reviews: 38, completedJobs: 112, badgeKey: "badge_top",      skills: ["Dresses", "Uniforms", "Alterations"],    initials: "UC", color: "#F97316" },
  { id: 2, name: "Mukamana Diane",  roleKey: "Professional Hairdresser",     district: "Kicukiro",   trustScore: 88, rating: 4.7, reviews: 55, completedJobs: 203, badgeKey: "badge_verified", skills: ["Braiding", "Natural Hair", "Styling"],   initials: "MD", color: "#8B5CF6" },
  { id: 3, name: "Ingabire Alice",  roleKey: "Handcraft & Basket Weaving",   district: "Nyarugenge", trustScore: 91, rating: 4.8, reviews: 27, completedJobs: 89,  badgeKey: "badge_verified", skills: ["Agaseke", "Sisal Crafts", "Export"],     initials: "IA", color: "#10B981" },
];

const TESTIMONIALS = [
  { name: "Niyomugaba Jean",  role: "Business Owner, Kigali", textKey: "test_1", rating: 5, initials: "NJ", color: "#F97316" },
  { name: "Habimana Eric",    role: "Event Planner",          textKey: "test_2", rating: 5, initials: "HE", color: "#8B5CF6" },
  { name: "Uwimana Grace",    role: "Hotel Manager",          textKey: "test_3", rating: 5, initials: "UG", color: "#10B981" },
];

const STEPS = [
  { num: "01", Icon: Search,   titleKey: "hiw_s1_title", descKey: "hiw_s1_desc" },
  { num: "02", Icon: Eye,      titleKey: "hiw_s2_title", descKey: "hiw_s2_desc" },
  { num: "03", Icon: Calendar, titleKey: "hiw_s3_title", descKey: "hiw_s3_desc" },
];

const TRUST_FACTORS = [
  { key: "ts_f1", pct: 40, color: "#F97316" },
  { key: "ts_f2", pct: 25, color: "#8B5CF6" },
  { key: "ts_f3", pct: 15, color: "#10B981" },
  { key: "ts_f4", pct: 10, color: "#3B82F6" },
  { key: "ts_f5", pct: 10, color: "#F59E0B" },
];

// ─────────────────────────────────────────────────────────────────────────────
// PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────
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
    <div
      style={{ border: `2px solid ${color}`, color }}
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold bg-white"
    >
      <span>✦</span> {score}
    </div>
  );
}

function Avatar({ initials, color, size = 48 }) {
  return (
    <div
      style={{
        width: size, height: size,
        backgroundColor: color + "20",
        border: `2px solid ${color}`,
        color, borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: 700, fontSize: size * 0.35, flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LANGUAGE SWITCHER
// ─────────────────────────────────────────────────────────────────────────────
function LanguageSwitcher({ compact = false }) {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const current = LANG_OPTIONS.find((l) => l.code === lang);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-orange-500 transition-colors px-2 py-1.5 rounded-lg hover:bg-orange-50"
        aria-label="Switch language"
        aria-expanded={open}
      >
        <span>{current.flag}</span>
        <span>{compact ? current.short : current.label}</span>
        <ChevronDown
          size={14}
          style={{
            transition: "transform 0.2s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden min-w-[160px]">
            {LANG_OPTIONS.map((opt) => (
              <button
                key={opt.code}
                onClick={() => { setLang(opt.code); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left
                  ${lang === opt.code ? "bg-orange-50 text-orange-600 font-semibold" : "text-slate-600 hover:bg-slate-50"}`}
              >
                <span className="text-base">{opt.flag}</span>
                <span>{opt.label}</span>
                {lang === opt.code && <Check size={14} className="ml-auto" style={{ color: "#F97316" }} />}
              </button>
            ))}
          </div>
        </>
      )}
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
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const navLinks = [
    { key: "nav_browse",  to: "/providers" },
    { key: "nav_about",   to: "/about"     },
    { key: "nav_contact", to: "/contact"   },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || menuOpen ? "bg-white shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div
            style={{ backgroundColor: "#F97316" }}
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          >
            <span className="text-white font-black text-sm">IW</span>
          </div>
          <span style={{ color: "#0F172A" }} className="font-bold text-lg tracking-tight">
            Inzira Works
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-7">
          {navLinks.map((item) => (
            <Link
              key={item.key}
              to={item.to}
              className="text-sm font-medium text-slate-600 hover:text-orange-500 transition-colors"
            >
              {t(item.key)}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher compact />
          <div className="w-px h-5 bg-slate-200" />
          <Link
            to="/login"
            style={{ color: "#0F172A" }}
            className="text-sm font-medium hover:text-orange-500 transition-colors"
          >
            {t("nav_login")}
          </Link>
          <Link
            to="/signup"
            style={{ backgroundColor: "#F97316" }}
            className="text-sm font-semibold text-white px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
          >
            {t("nav_getstarted")}
          </Link>
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 flex flex-col gap-4">
          {navLinks.map((item) => (
            <Link
              key={item.key}
              to={item.to}
              onClick={() => setMenuOpen(false)}
              className="text-sm font-medium text-slate-700 hover:text-orange-500 transition-colors"
            >
              {t(item.key)}
            </Link>
          ))}
          <LanguageSwitcher />
          <div className="flex gap-3 pt-1">
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="text-sm font-medium text-slate-700 border border-slate-200 px-4 py-2 rounded-xl flex-1 text-center hover:border-slate-300 transition-colors"
            >
              {t("nav_login")}
            </Link>
            <Link
              to="/signup"
              onClick={() => setMenuOpen(false)}
              style={{ backgroundColor: "#F97316" }}
              className="text-sm font-semibold text-white px-4 py-2 rounded-xl flex-1 text-center hover:opacity-90 transition-opacity"
            >
              {t("nav_getstarted")}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO
// ─────────────────────────────────────────────────────────────────────────────
function HeroSection() {
  const { t } = useLang();

  return (
    <section
      className="relative flex items-center pt-16 overflow-hidden min-h-screen"
      style={{ backgroundColor: "#FAFAF8" }}
    >
      {/* Subtle dot grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#E2E8F0 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          opacity: 0.6,
        }}
      />
      {/* Warm accent */}
      <div
        className="absolute top-0 right-0 w-[40vw] h-[60vh] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at top right, #FFF7ED 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 w-full grid md:grid-cols-2 gap-12 items-center">
        {/* Left */}
        <div className="flex flex-col gap-6">
          <div
            className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full w-fit"
            style={{ backgroundColor: "#FFF7ED", color: "#C2410C" }}
          >
            <MapPin size={12} />
            {t("hero_badge")}
          </div>

          <h1
            style={{ color: "#0F172A", lineHeight: 1.1 }}
            className="text-4xl sm:text-5xl font-black tracking-tight"
          >
            {t("hero_h1_1")}
            <br />
            <span style={{ color: "#F97316" }}>{t("hero_h1_2")}</span>
          </h1>

          <p style={{ color: "#475569" }} className="text-lg leading-relaxed max-w-md">
            {t("hero_desc")}
          </p>

          <div className="flex gap-2 bg-white rounded-2xl shadow-sm p-2 border border-slate-200 max-w-md">
            <Search size={18} className="text-slate-400 ml-2 my-auto flex-shrink-0" />
            <input
              type="text"
              placeholder={t("hero_search_placeholder")}
              className="flex-1 py-2 text-sm text-slate-700 outline-none bg-transparent placeholder-slate-400"
            />
            <Link
              to="/providers"
              style={{ backgroundColor: "#F97316" }}
              className="text-white font-semibold text-sm px-5 py-2 rounded-xl hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              {t("hero_search_btn")}
            </Link>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <div className="flex -space-x-2">
              {[["UC", "#F97316"], ["MD", "#8B5CF6"], ["IA", "#10B981"], ["NM", "#3B82F6"]].map(
                ([init, col]) => (
                  <div
                    key={init}
                    style={{ backgroundColor: col + "20", border: `2px solid ${col}`, color: col }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  >
                    {init}
                  </div>
                )
              )}
            </div>
            <p className="text-sm text-slate-500">
              <strong style={{ color: "#0F172A" }}>3+</strong> {t("hero_trust")}
            </p>
          </div>
        </div>

        {/* Right — provider preview card */}
        <div className="relative flex justify-center md:justify-end">
          <div className="relative w-full max-w-sm">
            <div className="bg-white rounded-3xl shadow-lg p-6 border border-slate-100">
              <div className="flex items-center gap-3 mb-5">
                <Avatar initials="UC" color="#F97316" size={56} />
                <div>
                  <p className="font-bold text-slate-800">Uwase Clarisse</p>
                  <p className="text-sm text-slate-500">Tailor & Fashion Designer</p>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-5">
                <TrustScoreBadge score={94} />
                <StarRating rating={4.9} size="md" />
                <span className="text-xs text-slate-500">4.9 (38)</span>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-5">
                {[
                  { label: "Jobs", value: "112" },
                  { label: t("fp_repeat"), value: "78%" },
                  { label: t("fp_response"), value: "~1hr" },
                ].map((m) => (
                  <div key={m.label} className="bg-slate-50 rounded-xl p-2.5 text-center border border-slate-100">
                    <p className="font-bold text-slate-800 text-sm">{m.value}</p>
                    <p className="text-xs text-slate-400">{m.label}</p>
                  </div>
                ))}
              </div>

              <Link
                to="/providers"
                style={{ backgroundColor: "#F97316" }}
                className="block w-full text-white font-semibold text-sm py-3 rounded-xl hover:opacity-90 transition-opacity text-center"
              >
                {t("hero_book")}
              </Link>
            </div>

            <div className="absolute -top-3 -right-3 bg-white border border-emerald-200 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
              <CheckCircle size={12} className="text-emerald-500" />
              {t("hero_verified")}
            </div>

            <div
              style={{ backgroundColor: "#0F172A" }}
              className="absolute -bottom-3 -left-3 text-white text-xs font-medium px-3 py-2 rounded-xl shadow-md flex items-center gap-2"
            >
              <span className="w-2 h-2 bg-emerald-400 rounded-full inline-block animate-pulse" />
              {t("hero_available")}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PLATFORM FACTS BAR
// ─────────────────────────────────────────────────────────────────────────────
function PlatformBar() {
  const { t } = useLang();
  const facts = [
    { value: "3", key: "stat_districts",  Icon: MapPin   },
    { value: "4", key: "stat_categories", Icon: Scissors },
    { value: "100%", key: "stat_verified", Icon: Shield   },
    { value: "Free", key: "stat_trust",    Icon: Users    },
  ];
  return (
    <section style={{ backgroundColor: "#0F172A" }} className="py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
        {facts.map((f) => (
          <div key={f.key} className="flex flex-col items-center gap-2 text-center">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "#F9731620" }}
            >
              <f.Icon size={18} style={{ color: "#F97316" }} />
            </div>
            <p style={{ color: "#F97316" }} className="text-2xl font-black tracking-tight">
              {f.value}
            </p>
            <p className="text-slate-400 text-xs leading-snug">{t(f.key)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORIES
// ─────────────────────────────────────────────────────────────────────────────
function CategoriesSection() {
  const { t } = useLang();
  return (
    <section style={{ backgroundColor: "#F8FAFC" }} className="py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: "#F97316" }}
          >
            {t("cat_label")}
          </p>
          <h2
            style={{ color: "#0F172A" }}
            className="text-3xl sm:text-4xl font-black tracking-tight"
          >
            {t("cat_h2")}
          </h2>
          <p className="text-slate-500 mt-3 text-base max-w-md mx-auto">{t("cat_desc")}</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES.map(({ labelKey, Icon }) => (
            <Link
              key={labelKey}
              to="/providers"
              className="group bg-white rounded-2xl p-6 border border-slate-100 hover:border-orange-200 hover:shadow-md transition-all duration-200 flex flex-col gap-3"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-200"
                style={{ backgroundColor: "#FFF7ED" }}
              >
                <Icon
                  size={22}
                  style={{ color: "#F97316" }}
                  className="group-hover:scale-110 transition-transform duration-200"
                />
              </div>
              <p className="font-semibold text-slate-700 text-sm group-hover:text-orange-600 transition-colors leading-snug">
                {labelKey}
              </p>
              <div className="flex items-center gap-1 text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="text-xs font-medium">{t("cat_browse")}</span>
                <ArrowRight size={12} />
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
function ProviderCard({ provider }) {
  const { t } = useLang();
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:-translate-y-1 hover:shadow-md transition-all duration-200 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar initials={provider.initials} color={provider.color} size={48} />
          <div>
            <p className="font-semibold text-slate-800 text-sm leading-tight">{provider.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">{provider.roleKey}</p>
          </div>
        </div>
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
          style={{ backgroundColor: "#FFF7ED", color: "#C2410C" }}
        >
          {t(provider.badgeKey)}
        </span>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <TrustScoreBadge score={provider.trustScore} />
        <div className="flex items-center gap-1.5">
          <StarRating rating={provider.rating} />
          <span className="text-xs text-slate-500">
            {provider.rating} ({provider.reviews})
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {provider.skills.map((s) => (
          <span
            key={s}
            className="text-xs px-2.5 py-0.5 rounded-full border"
            style={{ backgroundColor: "#F8FAFC", color: "#475569", borderColor: "#E2E8F0" }}
          >
            {s}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-slate-400">
          <MapPin size={13} />
          <span className="text-xs">{provider.district}</span>
          <span className="text-slate-300">·</span>
          <span className="text-xs">{provider.completedJobs} {t("fp_jobs")}</span>
        </div>
        <Link
          to="/providers"
          className="text-xs font-semibold flex items-center gap-1 transition-colors hover:opacity-80"
          style={{ color: "#F97316" }}
        >
          {t("fp_view_profile")}
          <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}

function FeaturedProviders() {
  const { t } = useLang();
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p
              className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: "#F97316" }}
            >
              {t("fp_label")}
            </p>
            <h2
              style={{ color: "#0F172A" }}
              className="text-3xl sm:text-4xl font-black tracking-tight"
            >
              {t("fp_h2")}
            </h2>
          </div>
          <Link
            to="/providers"
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ color: "#F97316" }}
          >
            {t("fp_viewall")}
            <ArrowRight size={15} />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {FEATURED_PROVIDERS.map((p) => (
            <ProviderCard key={p.id} provider={p} />
          ))}
        </div>

        <div className="mt-8 sm:hidden text-center">
          <Link
            to="/providers"
            className="inline-flex items-center gap-1.5 text-sm font-semibold"
            style={{ color: "#F97316" }}
          >
            {t("fp_viewall")}
            <ArrowRight size={15} />
          </Link>
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
    <section style={{ backgroundColor: "#F8FAFC" }} className="py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: "#F97316" }}
          >
            {t("hiw_label")}
          </p>
          <h2
            style={{ color: "#0F172A" }}
            className="text-3xl sm:text-4xl font-black tracking-tight"
          >
            {t("hiw_h2")}
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 relative">
          {STEPS.map((step, i) => (
            <div key={step.titleKey} className="relative flex flex-col gap-4">
              {i < STEPS.length - 1 && (
                <div
                  className="hidden sm:block absolute top-7 left-[calc(100%_-_24px)] w-1/2 h-px z-0"
                  style={{ background: "linear-gradient(to right, #F9731640, transparent)" }}
                />
              )}
              <div className="relative z-10 bg-white rounded-2xl p-6 border border-slate-100 hover:border-orange-100 hover:shadow-sm transition-all duration-200 flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "#FFF7ED" }}
                  >
                    <step.Icon size={22} style={{ color: "#F97316" }} />
                  </div>
                  <span
                    className="text-3xl font-black leading-none"
                    style={{ color: "#F9731620" }}
                  >
                    {step.num}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-slate-800 mb-1.5">{t(step.titleKey)}</p>
                  <p className="text-sm text-slate-500 leading-relaxed">{t(step.descKey)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TRUST SCORE
// ─────────────────────────────────────────────────────────────────────────────
function TrustScoreSection() {
  const { t } = useLang();
  return (
    <section style={{ backgroundColor: "#0F172A" }} className="py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-16 items-center">
        <div className="flex flex-col gap-6">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#F97316" }}>
            {t("ts_label")}
          </p>
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {t("ts_h2")}
            </h2>
            <p className="text-slate-400 text-xl mt-1">{t("ts_sub")}</p>
          </div>
          <p className="text-slate-400 text-base leading-relaxed">{t("ts_desc")}</p>
          <Link
            to="/about"
            className="flex items-center gap-2 text-sm font-semibold w-fit hover:opacity-80 transition-opacity"
            style={{ color: "#F97316" }}
          >
            {t("ts_learn")}
            <ArrowRight size={15} />
          </Link>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <p className="text-white font-bold">{t("ts_breakdown")}</p>
            <TrustScoreBadge score={94} />
          </div>
          <div className="flex flex-col gap-4">
            {TRUST_FACTORS.map((f) => (
              <div key={f.key}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400">{t(f.key)}</span>
                  <span className="text-white font-semibold">{f.pct}%</span>
                </div>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${f.pct * 2}%`, backgroundColor: f.color }}
                    className="h-full rounded-full transition-all duration-700"
                  />
                </div>
              </div>
            ))}
          </div>
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
    <section style={{ backgroundColor: "#FFFFFF" }} className="py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#F97316" }}>
            {t("test_label")}
          </p>
          <h2 style={{ color: "#0F172A" }} className="text-3xl sm:text-4xl font-black tracking-tight">
            {t("test_h2")}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((test) => (
            <div
              key={test.name}
              className="bg-white rounded-2xl p-6 border border-slate-100 flex flex-col gap-4 hover:shadow-sm transition-shadow duration-200"
            >
              <StarRating rating={test.rating} size="md" />
              <p className="text-slate-600 text-sm leading-relaxed flex-1">
                &ldquo;{t(test.textKey)}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <div
                  style={{
                    backgroundColor: test.color + "20",
                    color: test.color,
                    border: `2px solid ${test.color}`,
                  }}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                >
                  {test.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{test.name}</p>
                  <p className="text-xs text-slate-500">{test.role}</p>
                </div>
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
    <section style={{ backgroundColor: "#F97316" }} className="py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center gap-6">
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          {t("cta_h2")}
        </h2>
        <p className="text-orange-100 text-base sm:text-lg max-w-xl leading-relaxed">
          {t("cta_desc")}
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/signup"
            className="bg-white font-bold px-8 py-3 rounded-xl hover:bg-orange-50 transition-colors text-sm"
            style={{ color: "#C2410C" }}
          >
            {t("cta_join")}
          </Link>
          <Link
            to="/providers"
            className="border-2 border-white text-white font-bold px-8 py-3 rounded-xl hover:bg-white hover:text-orange-600 transition-colors text-sm"
          >
            {t("cta_browse")}
          </Link>
        </div>
        <p className="text-orange-200 text-xs">{t("cta_free")}</p>
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
    <footer style={{ backgroundColor: "#0A0F1A" }} className="py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div
                style={{ backgroundColor: "#F97316" }}
                className="w-8 h-8 rounded-lg flex items-center justify-center"
              >
                <span className="text-white font-black text-sm">IW</span>
              </div>
              <span className="text-white font-bold text-lg">Inzira Works</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">{t("foot_tagline")}</p>
            <div className="flex items-center gap-1.5 text-slate-600 text-xs mt-1">
              <MapPin size={12} />
              <span>Kigali, Rwanda</span>
            </div>
          </div>

          {cols.map((col) => (
            <div key={col.headingKey}>
              <p className="text-white font-semibold text-sm mb-4">{t(col.headingKey)}</p>
              <div className="flex flex-col gap-2.5">
                {(t(col.linksKey) || []).map((link) => (
                  <a
                    key={link}
                    href="#"
                    className="text-slate-500 text-sm hover:text-orange-400 transition-colors"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-slate-600 text-xs">
            © {new Date().getFullYear()} {t("foot_copy")}
          </p>
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
      <div className="min-h-screen font-sans">
        <Navbar />
        <HeroSection />
        <PlatformBar />
        <CategoriesSection />
        <FeaturedProviders />
        <HowItWorks />
        <TrustScoreSection />
        <Testimonials />
        <CTASection />
        <Footer />
      </div>
    </LangProvider>
  );
}
