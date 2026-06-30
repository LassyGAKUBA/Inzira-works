// src/pages/auth/SignupPage.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLang } from "../../i18n/LangContext";
import LanguageSwitcher from "../../components/shared/LanguageSwitcher";
import { MapPin } from "lucide-react";

// ── Reusable Input ────────────────────────────────────────────────────────────
function FormInput({ label, type = "text", value, onChange, placeholder, error, hint }) {
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
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

// ── Password Strength Indicator ───────────────────────────────────────────────
function PasswordStrength({ password }) {
  const getStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const score = getStrength();
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "#EF4444", "#F59E0B", "#3B82F6", "#10B981"];

  if (!password) return null;

  return (
    <div className="flex flex-col gap-1.5 -mt-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{ backgroundColor: i <= score ? colors[score] : "#E2E8F0" }}
          />
        ))}
      </div>
      {score > 0 && (
        <p className="text-xs font-medium" style={{ color: colors[score] }}>
          {labels[score]} password
        </p>
      )}
    </div>
  );
}

// ── Signup Page ───────────────────────────────────────────────────────────────
export default function SignupPage() {
  const { t } = useLang();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    district: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const set = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setApiError("");
  };

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = "Full name is required.";
    else if (form.fullName.trim().length < 3) errs.fullName = "Name must be at least 3 characters.";

    if (!form.email) errs.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Enter a valid email.";

    if (!form.phone) errs.phone = "Phone number is required.";
    else if (!/^(\+?250)?0?7[2-9]\d{7}$/.test(form.phone.replace(/\s/g, "")))
      errs.phone = "Enter a valid Rwandan phone number (e.g. 0781234567).";

    if (!form.district) errs.district = "Please select your district.";

    if (!form.password) errs.password = "Password is required.";
    else if (form.password.length < 8) errs.password = "Password must be at least 8 characters.";

    if (!form.confirmPassword) errs.confirmPassword = "Please confirm your password.";
    else if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match.";

    if (!form.agreeTerms) errs.agreeTerms = "You must agree to the terms to continue.";

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      // We don't create the account yet — the role is chosen on the next
      // screen, and the backend needs the role at registration time.
      // Carry the validated details to RoleSelectPage via router state.
      const { confirmPassword, agreeTerms, ...details } = form;
      navigate("/role-select", { state: { signup: details } });
    } catch (err) {
      setApiError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel ── */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #1E293B 0%, #0F172A 100%)" }}
      >
        <div style={{ position: "absolute", top: "10%", right: "-10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, #F9731625 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "5%", left: "-5%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, #10B98120 0%, transparent 70%)", pointerEvents: "none" }} />

        {/* Logo */}
        <div className="flex items-center gap-2 relative z-10">
          <div style={{ backgroundColor: "#F97316" }} className="w-9 h-9 rounded-xl flex items-center justify-center">
            <span className="text-white font-black text-sm">IW</span>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">Inzira Works</span>
        </div>

        {/* Steps preview */}
        <div className="relative z-10 flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <p style={{ color: "#F97316" }} className="text-xs font-bold uppercase tracking-widest">Get started in minutes</p>
            <h2 className="text-4xl font-black text-white leading-tight">
              Three steps to<br />
              <span style={{ color: "#F97316" }}>your first booking.</span>
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            {[
              { n: "01", title: "Create your account", desc: "Sign up with your email and phone number." },
              { n: "02", title: "Choose your role", desc: "Join as a service provider or a customer." },
              { n: "03", title: "Complete your profile", desc: "Add your skills, portfolio, and start receiving bookings." },
            ].map((step) => (
              <div key={step.n} className="flex items-start gap-4">
                <div style={{ backgroundColor: "#F9731615", color: "#F97316", border: "1px solid #F9731640" }} className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0">
                  {step.n}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{step.title}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-slate-600 text-xs relative z-10 flex items-center gap-1"><MapPin size={11} /> Kigali, Rwanda · Free to join</p>
      </div>

      {/* ── Right Panel (form) ── */}
      <div className="flex-1 flex flex-col" style={{ backgroundColor: "#F8FAFC" }}>
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2 lg:hidden">
            <div style={{ backgroundColor: "#F97316" }} className="w-7 h-7 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xs">IW</span>
            </div>
            <span style={{ color: "#1E293B" }} className="font-bold text-base">Inzira Works</span>
          </Link>
          <div className="hidden lg:block" />
          <LanguageSwitcher compact />
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-md flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <h1 style={{ color: "#1E293B" }} className="text-2xl font-black tracking-tight">
                {t("auth_signup_title")}
              </h1>
              <p className="text-slate-500 text-sm">{t("auth_signup_sub")}</p>
            </div>

            {apiError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              <FormInput
                label="Full Name"
                value={form.fullName}
                onChange={set("fullName")}
                placeholder="e.g. Uwase Clarisse"
                error={errors.fullName}
              />

              <FormInput
                label={t("auth_email")}
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="you@example.com"
                error={errors.email}
              />

              <FormInput
                label="Phone Number"
                type="tel"
                value={form.phone}
                onChange={set("phone")}
                placeholder="0781 234 567"
                error={errors.phone}
                hint="Rwandan number — used for mobile money and notifications"
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">District</label>
                <select
                  value={form.district}
                  onChange={set("district")}
                  className={`w-full px-4 py-3 rounded-xl border text-sm text-slate-800 outline-none transition-all bg-white
                    ${errors.district
                      ? "border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                      : "border-slate-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    }`}
                >
                  <option value="">Select your district…</option>
                  <option value="Gasabo">Gasabo</option>
                  <option value="Kicukiro">Kicukiro</option>
                  <option value="Nyarugenge">Nyarugenge</option>
                </select>
                {errors.district && <p className="text-xs text-red-500">{errors.district}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <FormInput
                  label={t("auth_password")}
                  type="password"
                  value={form.password}
                  onChange={set("password")}
                  placeholder="Min. 8 characters"
                  error={errors.password}
                />
                <PasswordStrength password={form.password} />
              </div>

              <FormInput
                label="Confirm Password"
                type="password"
                value={form.confirmPassword}
                onChange={set("confirmPassword")}
                placeholder="Repeat your password"
                error={errors.confirmPassword}
              />

              {/* Terms */}
              <div className="flex flex-col gap-1">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.agreeTerms}
                    onChange={set("agreeTerms")}
                    className="mt-0.5 w-4 h-4 rounded accent-orange-500 flex-shrink-0"
                  />
                  <span className="text-xs text-slate-500 leading-relaxed">
                    I agree to the{" "}
                    <Link to="/terms" style={{ color: "#F97316" }} className="font-medium hover:underline">Terms of Use</Link>
                    {" "}and{" "}
                    <Link to="/privacy" style={{ color: "#F97316" }} className="font-medium hover:underline">Privacy Policy</Link>
                  </span>
                </label>
                {errors.agreeTerms && <p className="text-xs text-red-500 ml-7">{errors.agreeTerms}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ backgroundColor: loading ? "#FDA96B" : "#F97316" }}
                className="w-full text-white font-semibold py-3 rounded-xl transition-opacity hover:opacity-90 flex items-center justify-center gap-2 mt-1"
              >
                {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {loading ? "Continuing..." : t("auth_signup_btn")}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500">
              {t("auth_have_account")}{" "}
              <Link to="/login" style={{ color: "#F97316" }} className="font-semibold hover:underline">
                {t("auth_login_link")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
