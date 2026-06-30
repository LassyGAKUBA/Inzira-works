// src/pages/auth/CheckEmailPage.jsx
// Shown after signup when Supabase requires email confirmation.
import { Link, useLocation } from "react-router-dom";
import { Mail, ArrowRight } from "lucide-react";

export default function CheckEmailPage() {
  const location = useLocation();
  const email = location.state?.email || "your inbox";

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#F8FAFC" }}>
      <div className="w-full max-w-sm flex flex-col items-center text-center gap-7">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div style={{ backgroundColor: "#F97316" }} className="w-8 h-8 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-xs">IW</span>
          </div>
          <span style={{ color: "#0F172A" }} className="font-bold text-lg">Inzira Works</span>
        </div>

        {/* Icon */}
        <div
          style={{ width: 80, height: 80, backgroundColor: "#FFF7ED", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <Mail size={34} style={{ color: "#F97316" }} />
        </div>

        {/* Heading */}
        <div className="flex flex-col gap-2">
          <h1 style={{ color: "#0F172A" }} className="text-2xl font-black tracking-tight">
            Check your email
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            We sent a confirmation link to{" "}
            <strong className="text-slate-700">{email}</strong>.
            Click it to activate your account and get started.
          </p>
        </div>

        {/* Steps */}
        <div
          className="w-full text-left flex flex-col gap-3 p-5"
          style={{ backgroundColor: "#fff", border: "1px solid #E2E8F0", borderRadius: "14px" }}
        >
          {[
            "Open the email from Inzira Works",
            "Click the "Confirm your account" link",
            "You'll be signed in automatically",
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <span
                className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
                style={{ backgroundColor: "#F97316" }}
              >
                {i + 1}
              </span>
              <p className="text-sm text-slate-600">{step}</p>
            </div>
          ))}
        </div>

        {/* Resend / spam note */}
        <p className="text-xs text-slate-400 leading-relaxed">
          Didn't receive it? Check your spam folder.{" "}
          <Link to="/signup" style={{ color: "#F97316" }} className="font-medium hover:underline">
            Try signing up again
          </Link>
          .
        </p>

        {/* Back to login */}
        <Link
          to="/login"
          className="flex items-center gap-1.5 text-sm font-semibold hover:opacity-70 transition-opacity"
          style={{ color: "#F97316" }}
        >
          Back to Log in <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
