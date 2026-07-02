import { useState } from "react";
import { Link } from "react-router-dom";
import { useLang } from "../../i18n/LangContext";
import LanguageSwitcher from "../../components/shared/LanguageSwitcher";
import { KeyRound, Mail } from "lucide-react";
import { supabase } from "../../lib/supabase";

const G     = "#0E5C46";
const CREAM = "#ede9e0";
const DARK  = "#172420";
const SERIF = "Spectral, serif";

export default function ForgotPasswordPage() {
  const { t } = useLang();
  const [email, setEmail]   = useState("");
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]     = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setError("Email is required."); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError("Enter a valid email address."); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      });
      if (error) throw error;
      setSent(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: CREAM, display: "flex", flexDirection: "column", fontFamily: "'Hanken Grotesk', sans-serif" }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid #d4cfc5" }}>
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="16" height="20" viewBox="0 0 18 22" fill="none">
            <path d="M9 2C9 2 3 5.5 3 12C3 16.5 5.5 19 9 19L9 21L13 17.5L9 14L9 16.5C7 16.5 5 15 5 12C5 7.5 9 5 9 5L9 2Z" fill={G} />
          </svg>
          <span style={{ fontFamily: SERIF, color: DARK, fontWeight: 700, fontSize: "1.05rem" }}>Inzira Works</span>
        </Link>
        <LanguageSwitcher compact />
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
        <div style={{ width: "100%", maxWidth: 440 }}>
          {!sent ? (
            <div style={{ backgroundColor: "white", borderRadius: 18, border: "1px solid #e8e2d8", padding: 36, display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ backgroundColor: "#e8f3ee", color: G, width: 52, height: 52, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <KeyRound size={22} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <h1 style={{ color: DARK, fontFamily: SERIF, fontSize: "1.625rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
                  Forgot your password?
                </h1>
                <p style={{ color: "#5c7068", fontSize: "0.875rem", lineHeight: 1.65 }}>
                  No problem. Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              {error && (
                <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: "0.875rem", padding: "12px 16px", borderRadius: 10 }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }} noValidate>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ color: "#3c4a44", fontSize: "0.875rem", fontWeight: 500 }}>{t("auth_email")}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    placeholder="you@example.com"
                    className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all placeholder-slate-400 bg-white
                      ${error ? "border-red-400 focus:ring-2 focus:ring-red-100" : "border-slate-200 focus:border-green-700 focus:ring-2 focus:ring-green-100"}`}
                    style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{ backgroundColor: loading ? "#3d8a6e" : G, color: "white", borderRadius: 10, padding: "12px 0", fontWeight: 600, fontSize: "0.875rem", border: "none", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                  className="hover:opacity-90 transition-opacity"
                >
                  {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {loading ? "Sending…" : "Send Reset Link"}
                </button>
              </form>

              <Link to="/login" style={{ textAlign: "center", fontSize: "0.875rem", color: "#5c7068", textDecoration: "none" }} className="hover:opacity-70 transition-opacity">
                ← Back to login
              </Link>
            </div>
          ) : (
            <div style={{ backgroundColor: "white", borderRadius: 18, border: "1px solid #e8e2d8", padding: 36, display: "flex", flexDirection: "column", alignItems: "center", gap: 20, textAlign: "center" }}>
              <div style={{ backgroundColor: "#F0FDF4", border: "2px solid #10B981", color: "#10B981", width: 64, height: 64, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Mail size={28} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <h2 style={{ color: DARK, fontFamily: SERIF, fontSize: "1.375rem", fontWeight: 700, letterSpacing: "-0.01em" }}>
                  Check your email
                </h2>
                <p style={{ color: "#5c7068", fontSize: "0.875rem", lineHeight: 1.65 }}>
                  We've sent a password reset link to{" "}
                  <strong style={{ color: DARK }}>{email}</strong>.
                  Check your inbox and follow the instructions.
                </p>
              </div>
              <p style={{ color: "#9aab9e", fontSize: "0.75rem" }}>
                Didn't receive it? Check your spam folder, or{" "}
                <button
                  onClick={() => setSent(false)}
                  style={{ color: G, fontWeight: 500, background: "none", border: "none", cursor: "pointer", padding: 0 }}
                  className="hover:underline"
                >
                  try again
                </button>.
              </p>
              <Link
                to="/login"
                style={{ backgroundColor: G, color: "white", borderRadius: 10, padding: "10px 24px", fontSize: "0.875rem", fontWeight: 600, textDecoration: "none", marginTop: 8 }}
                className="hover:opacity-90 transition-opacity"
              >
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
