import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLang } from "../../i18n/LangContext";
import { useAuth } from "../../context/AuthContext";
import LanguageSwitcher from "../../components/shared/LanguageSwitcher";
import { Star } from "lucide-react";

const G      = "#0E5C46";
const G_DARK = "#0a4836";
const CREAM  = "#ede9e0";
const DARK   = "#172420";
const SERIF  = "Spectral, serif";

function FormInput({ label, type = "text", value, onChange, placeholder, error }) {
  const [show, setShow] = useState(false);
  const inputType = type === "password" ? (show ? "text" : "password") : type;

  return (
    <div className="flex flex-col gap-1.5">
      <label style={{ color: "#3c4a44", fontSize: "0.875rem", fontWeight: 500 }}>{label}</label>
      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}
          className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all
            placeholder-slate-400 bg-white
            ${error
              ? "border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-100"
              : "border-slate-200 focus:border-green-700 focus:ring-2 focus:ring-green-100"
            }`}
        />
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-medium"
          >
            {show ? "Hide" : "Show"}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default function LoginPage() {
  const { t } = useLang();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm]       = useState({ email: "", password: "" });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setApiError("");
  };

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Enter a valid email.";
    if (!form.password) errs.password = "Password is required.";
    else if (form.password.length < 6) errs.password = "Password must be at least 6 characters.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const user = await login(form);
      if (user.role === "provider") navigate("/provider/dashboard");
      else if (user.role === "admin") navigate("/admin/dashboard");
      else navigate("/customer/dashboard");
    } catch (err) {
      setApiError(err.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>
      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-5/12 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: `linear-gradient(160deg, ${G_DARK} 0%, ${G} 100%)` }}
      >
        <div style={{ position: "absolute", top: "8%", right: "-8%", width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle, rgba(185,138,34,0.18) 0%, transparent 70%)", pointerEvents: "none" }} />

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2" style={{ textDecoration: "none" }}>
          <svg width="18" height="22" viewBox="0 0 18 22" fill="none">
            <path d="M9 2C9 2 3 5.5 3 12C3 16.5 5.5 19 9 19L9 21L13 17.5L9 14L9 16.5C7 16.5 5 15 5 12C5 7.5 9 5 9 5L9 2Z" fill="rgba(255,255,255,0.9)" />
          </svg>
          <span style={{ fontFamily: SERIF, color: "white", fontWeight: 700, fontSize: "1.1rem" }}>Inzira Works</span>
        </Link>

        {/* Quote block */}
        <div className="flex flex-col gap-7">
          <div className="flex flex-col gap-3">
            <p style={{ color: "#9ed3bf", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Trusted by 1,200+ providers
            </p>
            <h2 style={{ fontFamily: SERIF, color: "white", fontSize: "2.25rem", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
              Your skills deserve<br />
              <em style={{ color: "#e9c463" }}>to be seen.</em>
            </h2>
            <p style={{ color: "#9ed3bf", fontSize: "0.9rem", lineHeight: 1.7, maxWidth: "24rem" }}>
              Join skilled women across Kigali who are building their professional presence and growing their customer base.
            </p>
          </div>

          {/* Testimonial */}
          <div style={{ backgroundColor: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 20 }}>
            <div className="flex gap-1" style={{ marginBottom: 10 }}>
              {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={13} style={{ color: "#b98a22", fill: "#b98a22" }} />)}
            </div>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.85rem", lineHeight: 1.6 }}>
              "Inzira Works helped me reach customers I never could before. My bookings doubled in the first month."
            </p>
            <div className="flex items-center gap-3" style={{ marginTop: 14 }}>
              <div style={{ backgroundColor: "rgba(185,138,34,0.2)", border: "2px solid #b98a22", color: "#b98a22", width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700 }}>UC</div>
              <div>
                <p style={{ color: "white", fontSize: "0.85rem", fontWeight: 600 }}>Uwase Clarisse</p>
                <p style={{ color: "#9ed3bf", fontSize: "0.72rem" }}>Tailor · Gasabo</p>
              </div>
            </div>
          </div>
        </div>

        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.72rem" }}>Kigali, Rwanda · BSc Capstone Project</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col" style={{ backgroundColor: CREAM }}>
        <div className="flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2 lg:hidden" style={{ textDecoration: "none" }}>
            <svg width="14" height="18" viewBox="0 0 18 22" fill="none">
              <path d="M9 2C9 2 3 5.5 3 12C3 16.5 5.5 19 9 19L9 21L13 17.5L9 14L9 16.5C7 16.5 5 15 5 12C5 7.5 9 5 9 5L9 2Z" fill={G} />
            </svg>
            <span style={{ color: DARK, fontFamily: SERIF, fontWeight: 700, fontSize: "1rem" }}>Inzira Works</span>
          </Link>
          <div className="hidden lg:block" />
          <LanguageSwitcher compact />
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-md flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h1 style={{ color: DARK, fontFamily: SERIF, fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
                Welcome back
              </h1>
              <p style={{ color: "#5c7068", fontSize: "0.875rem" }}>Sign in to your Inzira Works account</p>
            </div>

            {apiError && (
              <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: "0.875rem", padding: "12px 16px", borderRadius: 12 }}>
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              <FormInput
                label={t("auth_email")}
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="you@example.com"
                error={errors.email}
              />
              <FormInput
                label={t("auth_password")}
                type="password"
                value={form.password}
                onChange={set("password")}
                placeholder="••••••••"
                error={errors.password}
              />

              <div className="flex justify-end -mt-2">
                <Link to="/forgot-password" style={{ color: G, fontSize: "0.75rem", fontWeight: 500, textDecoration: "none" }} className="hover:underline">
                  {t("auth_forgot")}
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ backgroundColor: loading ? "#3d8a6e" : G, color: "white", borderRadius: 10, padding: "12px 0", fontWeight: 600, fontSize: "0.875rem", border: "none", cursor: loading ? "not-allowed" : "pointer" }}
                className="w-full flex items-center justify-center gap-2 transition-opacity hover:opacity-90 mt-1"
              >
                {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {loading ? "Signing in…" : t("auth_login_btn")}
              </button>
            </form>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ backgroundColor: "#d4cfc5" }} />
              <span style={{ color: "#9aab9e", fontSize: "0.75rem" }}>or</span>
              <div className="flex-1 h-px" style={{ backgroundColor: "#d4cfc5" }} />
            </div>

            <p style={{ textAlign: "center", fontSize: "0.875rem", color: "#5c7068" }}>
              {t("auth_no_account")}{" "}
              <Link to="/signup" style={{ color: G, fontWeight: 600, textDecoration: "none" }} className="hover:underline">
                {t("auth_signup_link")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
