// src/pages/auth/LoginPage.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLang } from "../../i18n/LangContext";
import LanguageSwitcher from "../../components/shared/LanguageSwitcher";

// ── Reusable Input ────────────────────────────────────────────────────────────
function FormInput({ label, type = "text", value, onChange, placeholder, error, rightElement }) {
  const [show, setShow] = useState(false);
  const inputType = type === "password" ? (show ? "text" : "password") : type;

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full px-4 py-3 rounded-xl border text-sm text-slate-800 outline-none transition-all
            placeholder-slate-400 bg-white
            ${error
              ? "border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-100"
              : "border-slate-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
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
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</div>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ── Login Page ────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const { t } = useLang();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
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
      // TODO: replace with real API call
      // const res = await authService.login(form);
      await new Promise((r) => setTimeout(r, 1000)); // simulate network
      navigate("/dashboard"); // redirect after login
    } catch (err) {
      setApiError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel (decorative) ── */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #1E293B 0%, #0F172A 100%)" }}
      >
        {/* Background glow */}
        <div style={{ position: "absolute", top: "10%", right: "-10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, #F9731625 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "5%", left: "-5%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, #8B5CF620 0%, transparent 70%)", pointerEvents: "none" }} />

        {/* Logo */}
        <div className="flex items-center gap-2 relative z-10">
          <div style={{ backgroundColor: "#F97316" }} className="w-9 h-9 rounded-xl flex items-center justify-center">
            <span className="text-white font-black text-sm">IW</span>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">Inzira Works</span>
        </div>

        {/* Center quote */}
        <div className="relative z-10 flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <p style={{ color: "#F97316" }} className="text-xs font-bold uppercase tracking-widest">
              Trusted by 800+ providers
            </p>
            <h2 className="text-4xl font-black text-white leading-tight">
              Your skills deserve<br />
              <span style={{ color: "#F97316" }}>to be seen.</span>
            </h2>
            <p className="text-slate-400 text-base leading-relaxed max-w-sm">
              Join skilled women across Kigali who are building their professional presence and growing their customer base with Inzira Works.
            </p>
          </div>

          {/* Testimonial card */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 flex flex-col gap-3">
            <div className="flex gap-1">
              {[1,2,3,4,5].map((s) => <span key={s} style={{ color: "#F97316" }} className="text-sm">★</span>)}
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              "Inzira Works helped me reach customers I never could before. My bookings doubled in the first month."
            </p>
            <div className="flex items-center gap-3 pt-1">
              <div style={{ backgroundColor: "#F9731620", border: "2px solid #F97316", color: "#F97316" }} className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold">UC</div>
              <div>
                <p className="text-white text-sm font-semibold">Uwase Clarisse</p>
                <p className="text-slate-500 text-xs">Tailor · Gasabo</p>
              </div>
              <div style={{ border: "2px solid #10B981", color: "#10B981" }} className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full">✦ 94</div>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-slate-600 text-xs relative z-10">🇷🇼 Kigali, Rwanda · BSc Capstone Project</p>
      </div>

      {/* ── Right Panel (form) ── */}
      <div className="flex-1 flex flex-col" style={{ backgroundColor: "#F8FAFC" }}>
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4">
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 lg:hidden">
            <div style={{ backgroundColor: "#F97316" }} className="w-7 h-7 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xs">IW</span>
            </div>
            <span style={{ color: "#1E293B" }} className="font-bold text-base">Inzira Works</span>
          </Link>
          <div className="hidden lg:block" />
          <LanguageSwitcher compact />
        </div>

        {/* Form container */}
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-md flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col gap-1">
              <h1 style={{ color: "#1E293B" }} className="text-2xl font-black tracking-tight">
                {t("auth_login_title")}
              </h1>
              <p className="text-slate-500 text-sm">{t("auth_login_sub")}</p>
            </div>

            {/* API error banner */}
            {apiError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                {apiError}
              </div>
            )}

            {/* Form */}
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

              {/* Forgot password */}
              <div className="flex justify-end -mt-2">
                <Link
                  to="/forgot-password"
                  style={{ color: "#F97316" }}
                  className="text-xs font-medium hover:underline"
                >
                  {t("auth_forgot")}
                </Link>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{ backgroundColor: loading ? "#FDA96B" : "#F97316" }}
                className="w-full text-white font-semibold py-3 rounded-xl transition-opacity hover:opacity-90 flex items-center justify-center gap-2 mt-1"
              >
                {loading && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {loading ? "Signing in..." : t("auth_login_btn")}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400">or</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Sign up link */}
            <p className="text-center text-sm text-slate-500">
              {t("auth_no_account")}{" "}
              <Link
                to="/signup"
                style={{ color: "#F97316" }}
                className="font-semibold hover:underline"
              >
                {t("auth_signup_link")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
