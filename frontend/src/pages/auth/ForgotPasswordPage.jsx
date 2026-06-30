// src/pages/auth/ForgotPasswordPage.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { useLang } from "../../i18n/LangContext";
import LanguageSwitcher from "../../components/shared/LanguageSwitcher";
import { KeyRound, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setError("Email is required."); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError("Enter a valid email address."); return; }

    setLoading(true);
    try {
      // TODO: replace with real API call
      // await authService.forgotPassword(email);
      await new Promise((r) => setTimeout(r, 1000));
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F8FAFC" }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <div style={{ backgroundColor: "#F97316" }} className="w-8 h-8 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-sm">IW</span>
          </div>
          <span style={{ color: "#1E293B" }} className="font-bold text-lg">Inzira Works</span>
        </Link>
        <LanguageSwitcher compact />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {!sent ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 flex flex-col gap-6">
              {/* Icon */}
              <div style={{ backgroundColor: "#FFF7ED", color: "#F97316" }} className="w-14 h-14 rounded-2xl flex items-center justify-center">
                <KeyRound size={24} />
              </div>

              <div className="flex flex-col gap-1">
                <h1 style={{ color: "#1E293B" }} className="text-2xl font-black tracking-tight">Forgot your password?</h1>
                <p className="text-slate-500 text-sm leading-relaxed">
                  No problem. Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700">{t("auth_email")}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    placeholder="you@example.com"
                    className={`w-full px-4 py-3 rounded-xl border text-sm text-slate-800 outline-none transition-all placeholder-slate-400 bg-white
                      ${error ? "border-red-400 focus:ring-2 focus:ring-red-100" : "border-slate-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"}`}
                  />
                  {error && <p className="text-xs text-red-500">{error}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{ backgroundColor: loading ? "#FDA96B" : "#F97316" }}
                  className="w-full text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>

              <Link
                to="/login"
                className="text-center text-sm text-slate-500 hover:text-orange-500 transition-colors"
              >
                ← Back to login
              </Link>
            </div>
          ) : (
            /* Success state */
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 flex flex-col items-center gap-5 text-center">
              <div style={{ backgroundColor: "#F0FDF4", border: "2px solid #10B981", color: "#10B981" }} className="w-16 h-16 rounded-full flex items-center justify-center">
                <Mail size={28} />
              </div>
              <div className="flex flex-col gap-2">
                <h2 style={{ color: "#1E293B" }} className="text-xl font-black">Check your email</h2>
                <p className="text-slate-500 text-sm leading-relaxed">
                  We've sent a password reset link to <strong style={{ color: "#1E293B" }}>{email}</strong>.
                  Check your inbox and follow the instructions.
                </p>
              </div>
              <p className="text-xs text-slate-400">
                Didn't receive it? Check your spam folder, or{" "}
                <button
                  onClick={() => setSent(false)}
                  style={{ color: "#F97316" }}
                  className="font-medium hover:underline"
                >
                  try again
                </button>.
              </p>
              <Link
                to="/login"
                style={{ backgroundColor: "#F97316" }}
                className="text-white font-semibold text-sm px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity mt-2"
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
