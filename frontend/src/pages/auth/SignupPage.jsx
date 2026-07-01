import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLang } from "../../i18n/LangContext";
import LanguageSwitcher from "../../components/shared/LanguageSwitcher";

const G      = "#0E5C46";
const G_DARK = "#0a4836";
const CREAM  = "#ede9e0";
const DARK   = "#172420";
const SERIF  = "Spectral, serif";

function FormInput({ label, type = "text", value, onChange, placeholder, error, hint }) {
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
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

function PasswordStrength({ password }) {
  const score = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "#EF4444", "#F59E0B", "#3B82F6", "#10B981"];
  if (!password) return null;
  return (
    <div className="flex flex-col gap-1.5 -mt-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{ backgroundColor: i <= score ? colors[score] : "#E2E8F0" }} />
        ))}
      </div>
      {score > 0 && <p className="text-xs font-medium" style={{ color: colors[score] }}>{labels[score]} password</p>}
    </div>
  );
}

export default function SignupPage() {
  const { t } = useLang();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", district: "", password: "", confirmPassword: "", agreeTerms: false,
  });
  const [errors, setErrors]   = useState({});
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
      const { confirmPassword, agreeTerms, ...details } = form;
      navigate("/role-select", { state: { signup: details } });
    } catch {
      setApiError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectClass = (hasError) =>
    `w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all bg-white ${
      hasError
        ? "border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-100"
        : "border-slate-200 focus:border-green-700 focus:ring-2 focus:ring-green-100"
    }`;

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>
      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-5/12 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: `linear-gradient(160deg, ${G_DARK} 0%, ${G} 100%)` }}
      >
        <div style={{ position: "absolute", top: "10%", right: "-10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(185,138,34,0.18) 0%, transparent 70%)", pointerEvents: "none" }} />

        <Link to="/" className="flex items-center gap-2" style={{ textDecoration: "none" }}>
          <svg width="18" height="22" viewBox="0 0 18 22" fill="none">
            <path d="M9 2C9 2 3 5.5 3 12C3 16.5 5.5 19 9 19L9 21L13 17.5L9 14L9 16.5C7 16.5 5 15 5 12C5 7.5 9 5 9 5L9 2Z" fill="rgba(255,255,255,0.9)" />
          </svg>
          <span style={{ fontFamily: SERIF, color: "white", fontWeight: 700, fontSize: "1.1rem" }}>Inzira Works</span>
        </Link>

        <div className="flex flex-col gap-7">
          <div className="flex flex-col gap-3">
            <p style={{ color: "#9ed3bf", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Get started in minutes
            </p>
            <h2 style={{ fontFamily: SERIF, color: "white", fontSize: "2.25rem", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
              Three steps to<br />
              <em style={{ color: "#e9c463" }}>your first booking.</em>
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            {[
              { n: "01", title: "Create your account",  desc: "Sign up with your email and phone number." },
              { n: "02", title: "Choose your role",     desc: "Join as a service provider or a customer." },
              { n: "03", title: "Complete your profile",desc: "Add your skills, portfolio, and start receiving bookings." },
            ].map(({ n, title, desc }) => (
              <div key={n} className="flex items-start gap-4">
                <div style={{ backgroundColor: "rgba(185,138,34,0.2)", color: "#e9c463", border: "1px solid rgba(185,138,34,0.3)", width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }}>
                  {n}
                </div>
                <div>
                  <p style={{ color: "white", fontWeight: 600, fontSize: "0.875rem" }}>{title}</p>
                  <p style={{ color: "#9ed3bf", fontSize: "0.75rem", marginTop: 2 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.72rem" }}>Kigali, Rwanda · Free to join</p>
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
          <div className="w-full max-w-md flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <h1 style={{ color: DARK, fontFamily: SERIF, fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
                Create your account
              </h1>
              <p style={{ color: "#5c7068", fontSize: "0.875rem" }}>Join Inzira Works — it's free</p>
            </div>

            {apiError && (
              <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: "0.875rem", padding: "12px 16px", borderRadius: 12 }}>
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              <FormInput label="Full Name" value={form.fullName} onChange={set("fullName")}
                placeholder="e.g. Uwase Clarisse" error={errors.fullName} />

              <FormInput label={t("auth_email")} type="email" value={form.email} onChange={set("email")}
                placeholder="you@example.com" error={errors.email} />

              <FormInput label="Phone Number" type="tel" value={form.phone} onChange={set("phone")}
                placeholder="0781 234 567" error={errors.phone}
                hint="Rwandan number — used for mobile money and notifications" />

              <div className="flex flex-col gap-1.5">
                <label style={{ color: "#3c4a44", fontSize: "0.875rem", fontWeight: 500 }}>District</label>
                <select value={form.district} onChange={set("district")}
                  style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}
                  className={selectClass(!!errors.district)}>
                  <option value="">Select your district…</option>
                  <option value="Gasabo">Gasabo</option>
                  <option value="Kicukiro">Kicukiro</option>
                  <option value="Nyarugenge">Nyarugenge</option>
                </select>
                {errors.district && <p className="text-xs text-red-500">{errors.district}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <FormInput label={t("auth_password")} type="password" value={form.password} onChange={set("password")}
                  placeholder="Min. 8 characters" error={errors.password} />
                <PasswordStrength password={form.password} />
              </div>

              <FormInput label="Confirm Password" type="password" value={form.confirmPassword}
                onChange={set("confirmPassword")} placeholder="Repeat your password" error={errors.confirmPassword} />

              <div className="flex flex-col gap-1">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.agreeTerms} onChange={set("agreeTerms")}
                    className="mt-0.5 w-4 h-4 rounded flex-shrink-0"
                    style={{ accentColor: G }} />
                  <span style={{ color: "#5c7068", fontSize: "0.75rem", lineHeight: 1.6 }}>
                    I agree to the{" "}
                    <Link to="/terms" style={{ color: G, fontWeight: 500, textDecoration: "none" }} className="hover:underline">Terms of Use</Link>
                    {" "}and{" "}
                    <Link to="/privacy" style={{ color: G, fontWeight: 500, textDecoration: "none" }} className="hover:underline">Privacy Policy</Link>
                  </span>
                </label>
                {errors.agreeTerms && <p className="text-xs text-red-500 ml-7">{errors.agreeTerms}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ backgroundColor: loading ? "#3d8a6e" : G, color: "white", borderRadius: 10, padding: "12px 0", fontWeight: 600, fontSize: "0.875rem", border: "none", cursor: loading ? "not-allowed" : "pointer" }}
                className="w-full flex items-center justify-center gap-2 transition-opacity hover:opacity-90 mt-1"
              >
                {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {loading ? "Continuing…" : t("auth_signup_btn")}
              </button>
            </form>

            <p style={{ textAlign: "center", fontSize: "0.875rem", color: "#5c7068" }}>
              {t("auth_have_account")}{" "}
              <Link to="/login" style={{ color: G, fontWeight: 600, textDecoration: "none" }} className="hover:underline">
                {t("auth_login_link")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
