import { Link, useLocation } from "react-router-dom";
import { Mail, ArrowRight } from "lucide-react";

const G    = "#0E5C46";
const CREAM = "#ede9e0";
const DARK  = "#172420";
const SERIF = "Spectral, serif";

export default function CheckEmailPage() {
  const email = useLocation().state?.email || "your inbox";

  return (
    <div style={{ minHeight: "100vh", backgroundColor: CREAM, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px", fontFamily: "'Hanken Grotesk', sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 380, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 28 }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="18" height="22" viewBox="0 0 18 22" fill="none">
            <path d="M9 2C9 2 3 5.5 3 12C3 16.5 5.5 19 9 19L9 21L13 17.5L9 14L9 16.5C7 16.5 5 15 5 12C5 7.5 9 5 9 5L9 2Z" fill={G} />
          </svg>
          <span style={{ fontFamily: SERIF, color: DARK, fontWeight: 700, fontSize: "1.05rem" }}>Inzira Works</span>
        </Link>

        {/* Icon */}
        <div style={{ width: 76, height: 76, backgroundColor: "#e8f3ee", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Mail size={32} style={{ color: G }} />
        </div>

        {/* Text */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <h1 style={{ color: DARK, fontFamily: SERIF, fontSize: "1.625rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
            Check your email
          </h1>
          <p style={{ color: "#5c7068", fontSize: "0.875rem", lineHeight: 1.65 }}>
            We sent a confirmation link to{" "}
            <strong style={{ color: DARK }}>{email}</strong>.
            Click it to activate your account and get started.
          </p>
        </div>

        {/* Steps */}
        <div style={{ width: "100%", backgroundColor: "white", border: "1px solid #e8e2d8", borderRadius: 14, padding: 20, textAlign: "left", display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            "Open the email from Inzira Works",
            'Click the “Confirm your account” link',
            "You’ll be signed in automatically",
          ].map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <span style={{ flexShrink: 0, width: 22, height: 22, borderRadius: "50%", backgroundColor: G, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, marginTop: 1 }}>
                {i + 1}
              </span>
              <p style={{ color: "#3c4a44", fontSize: "0.875rem", lineHeight: 1.5 }}>{step}</p>
            </div>
          ))}
        </div>

        <p style={{ color: "#9aab9e", fontSize: "0.75rem", lineHeight: 1.6 }}>
          Didn&apos;t receive it? Check your spam folder.{" "}
          <Link to="/signup" style={{ color: G, fontWeight: 500, textDecoration: "none" }} className="hover:underline">
            Try signing up again
          </Link>
          .
        </p>

        <Link to="/login" style={{ display: "flex", alignItems: "center", gap: 6, color: G, fontSize: "0.875rem", fontWeight: 600, textDecoration: "none" }} className="hover:opacity-70 transition-opacity">
          Back to Log in <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
