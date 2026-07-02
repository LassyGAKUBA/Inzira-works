import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { KeyRound, Eye, EyeOff, CheckCircle } from "lucide-react";

const G     = "#0E5C46";
const CREAM = "#ede9e0";
const DARK  = "#172420";
const SERIF = "Spectral, serif";
const SANS  = "'Hanken Grotesk', sans-serif";

function strengthOf(pw) {
  const score = [pw.length >= 8, /[A-Z]/.test(pw), /[0-9]/.test(pw), /[^A-Za-z0-9]/.test(pw)].filter(Boolean).length;
  const levels = [
    { label: "Weak",   color: "#ef4444", width: "25%" },
    { label: "Fair",   color: "#f97316", width: "50%" },
    { label: "Good",   color: "#eab308", width: "75%" },
    { label: "Strong", color: "#22c55e", width: "100%" },
  ];
  return levels[score - 1] || levels[0];
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [form, setForm]     = useState({ password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone]     = useState(false);
  const [sessionOk, setSessionOk] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/forgot-password", { replace: true });
      } else {
        setSessionOk(true);
      }
    });
  }, [navigate]);

  const set = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    setErrors((p) => ({ ...p, [field]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.password) errs.password = "Password is required.";
    else if (form.password.length < 8) errs.password = "Must be at least 8 characters.";
    if (!form.confirm) errs.confirm = "Please confirm your password.";
    else if (form.password !== form.confirm) errs.confirm = "Passwords do not match.";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: form.password });
      if (error) throw error;
      setDone(true);
      setTimeout(() => navigate("/login", { replace: true }), 3000);
    } catch (err) {
      setErrors({ password: err.message || "Failed to reset password. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const strength = form.password ? strengthOf(form.password) : null;

  if (!sessionOk) return null;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: CREAM, display: "flex", flexDirection: "column", fontFamily: SANS }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid #d4cfc5" }}>
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="16" height="20" viewBox="0 0 18 22" fill="none">
            <path d="M9 2C9 2 3 5.5 3 12C3 16.5 5.5 19 9 19L9 21L13 17.5L9 14L9 16.5C7 16.5 5 15 5 12C5 7.5 9 5 9 5L9 2Z" fill={G} />
          </svg>
          <span style={{ fontFamily: SERIF, color: DARK, fontWeight: 700, fontSize: "1.05rem" }}>Inzira Works</span>
        </Link>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
        <div style={{ width: "100%", maxWidth: 440 }}>
          {done ? (
            <div style={{ backgroundColor: "white", borderRadius: 18, border: "1px solid #e8e2d8", padding: 36, display: "flex", flexDirection: "column", alignItems: "center", gap: 20, textAlign: "center" }}>
              <div style={{ backgroundColor: "#F0FDF4", border: "2px solid #22c55e", color: "#22c55e", width: 64, height: 64, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckCircle size={28} />
              </div>
              <div>
                <h2 style={{ color: DARK, fontFamily: SERIF, fontSize: "1.375rem", fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 8 }}>
                  Password updated!
                </h2>
                <p style={{ color: "#5c7068", fontSize: "0.875rem", lineHeight: 1.65 }}>
                  Your password has been changed successfully. Redirecting you to login…
                </p>
              </div>
              <Link to="/login" style={{ backgroundColor: G, color: "white", borderRadius: 10, padding: "10px 24px", fontSize: "0.875rem", fontWeight: 600, textDecoration: "none" }}
                className="hover:opacity-90 transition-opacity">
                Go to Login
              </Link>
            </div>
          ) : (
            <div style={{ backgroundColor: "white", borderRadius: 18, border: "1px solid #e8e2d8", padding: 36, display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ backgroundColor: "#e8f3ee", color: G, width: 52, height: 52, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <KeyRound size={22} />
              </div>

              <div>
                <h1 style={{ color: DARK, fontFamily: SERIF, fontSize: "1.625rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 6 }}>
                  Set a new password
                </h1>
                <p style={{ color: "#5c7068", fontSize: "0.875rem", lineHeight: 1.65 }}>
                  Choose a strong password you haven't used before.
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }} noValidate>
                {/* New password */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ color: "#3c4a44", fontSize: "0.875rem", fontWeight: 500 }}>New password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPw ? "text" : "password"}
                      value={form.password}
                      onChange={set("password")}
                      placeholder="••••••••"
                      style={{ fontFamily: SANS }}
                      className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all placeholder-slate-400 bg-white pr-12
                        ${errors.password ? "border-red-400 focus:ring-2 focus:ring-red-100" : "border-slate-200 focus:border-green-700 focus:ring-2 focus:ring-green-100"}`}
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex" }}>
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {form.password && strength && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <div style={{ height: 4, backgroundColor: "#e2e8f0", borderRadius: 99 }}>
                        <div style={{ height: "100%", width: strength.width, backgroundColor: strength.color, borderRadius: 99, transition: "width 0.3s, background-color 0.3s" }} />
                      </div>
                      <p style={{ fontSize: "0.72rem", color: strength.color, fontWeight: 600 }}>{strength.label}</p>
                    </div>
                  )}
                  {errors.password && <p style={{ fontSize: "0.75rem", color: "#dc2626" }}>{errors.password}</p>}
                </div>

                {/* Confirm password */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ color: "#3c4a44", fontSize: "0.875rem", fontWeight: 500 }}>Confirm password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showCf ? "text" : "password"}
                      value={form.confirm}
                      onChange={set("confirm")}
                      placeholder="••••••••"
                      style={{ fontFamily: SANS }}
                      className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all placeholder-slate-400 bg-white pr-12
                        ${errors.confirm ? "border-red-400 focus:ring-2 focus:ring-red-100" : "border-slate-200 focus:border-green-700 focus:ring-2 focus:ring-green-100"}`}
                    />
                    <button type="button" onClick={() => setShowCf(!showCf)}
                      style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex" }}>
                      {showCf ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.confirm && <p style={{ fontSize: "0.75rem", color: "#dc2626" }}>{errors.confirm}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{ backgroundColor: loading ? "#3d8a6e" : G, color: "white", borderRadius: 10, padding: "12px 0", fontWeight: 600, fontSize: "0.875rem", border: "none", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                  className="hover:opacity-90 transition-opacity">
                  {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {loading ? "Updating…" : "Update password"}
                </button>
              </form>

              <Link to="/login" style={{ textAlign: "center", fontSize: "0.875rem", color: "#5c7068", textDecoration: "none" }} className="hover:opacity-70 transition-opacity">
                ← Back to login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
