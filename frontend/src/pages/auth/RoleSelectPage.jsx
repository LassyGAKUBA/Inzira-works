// src/pages/auth/RoleSelectPage.jsx
// Multi-step onboarding: role picker → account → (provider: craft → showcase → verify)
import { useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import {
  Shirt, Search, ChevronRight, Image as ImageIcon,
  CreditCard, Shield, Check,
} from "lucide-react";

const G    = "#0E5C46";
const DARK = "#172420";
const CREAM = "#ede9e0";

const CATEGORIES = [
  "Tailoring & Fashion",
  "Hairdressing & Beauty",
  "Cleaning & Laundry",
  "Cooking & Catering",
  "Childcare & Nanny",
  "Teaching & Tutoring",
  "Handcraft & Art",
  "Other",
];

const DISTRICTS = [
  "Gasabo", "Kicukiro", "Nyarugenge",
  "Bugesera", "Gatsibo", "Kayonza", "Kirehe", "Ngoma", "Nyagatare", "Rwamagana",
  "Burera", "Gakenke", "Gicumbi", "Musanze", "Rulindo",
  "Gisagara", "Huye", "Kamonyi", "Muhanga", "Nyamagabe",
  "Nyanza", "Nyaruguru", "Ruhango",
  "Karongi", "Ngororero", "Nyabihu", "Nyamasheke", "Rubavu", "Rutsiro", "Rusizi",
];

// ─── Shared small components ─────────────────────────────────────────────────

function Field({ label, type = "text", placeholder, value, onChange, error }) {
  const [show, setShow] = useState(false);
  const realType = type === "password" ? (show ? "text" : "password") : type;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: "0.85rem", color: "#3c4a44", fontWeight: 500 }}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type={realType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{
            width: "100%", boxSizing: "border-box",
            padding: "10px 14px", borderRadius: 10,
            border: `1px solid ${error ? "#f87171" : "#e2e8f0"}`,
            fontSize: "0.875rem", color: DARK, outline: "none",
            fontFamily: "'Hanken Grotesk', sans-serif",
          }}
        />
        {type === "password" && (
          <button type="button" onClick={() => setShow((s) => !s)}
            style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: "0.75rem", fontWeight: 500 }}>
            {show ? "Hide" : "Show"}
          </button>
        )}
      </div>
      {error && <p style={{ fontSize: "0.75rem", color: "#dc2626" }}>{error}</p>}
    </div>
  );
}

function StepFooter({ onBack, onNext, loading, nextLabel = "Continue" }) {
  return (
    <>
      <hr style={{ border: "none", borderTop: "1px solid #f0ece4", margin: "4px 0" }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={onBack}
          style={{ background: "none", border: "1px solid #d4cfc5", borderRadius: 8, padding: "9px 20px", color: DARK, fontSize: "0.875rem", cursor: "pointer", fontWeight: 500, fontFamily: "'Hanken Grotesk', sans-serif" }}>
          Back
        </button>
        <button onClick={onNext} disabled={loading}
          style={{ backgroundColor: G, color: "white", borderRadius: 8, padding: "9px 22px", fontSize: "0.875rem", fontWeight: 600, border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.75 : 1, display: "flex", alignItems: "center", gap: 8, fontFamily: "'Hanken Grotesk', sans-serif" }}>
          {loading && (
            <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
          )}
          {loading ? "Creating account…" : nextLabel}
        </button>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

function ProgressBar({ step }) {
  const labels = ["Account", "Your craft", "Showcase", "Verify"];
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", marginBottom: 28 }}>
      {labels.map((label, i) => {
        const n   = i + 1;
        const done   = step > n;
        const active = step === n;
        return (
          <div key={label} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                backgroundColor: done || active ? G : "#e2e8f0",
                color: done || active ? "white" : "#94a3b8",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.75rem", fontWeight: 700,
              }}>
                {done ? <Check size={13} /> : n}
              </div>
              <span style={{ fontSize: "0.65rem", color: done || active ? G : "#94a3b8", fontWeight: done || active ? 600 : 400, whiteSpace: "nowrap" }}>
                {label}
              </span>
            </div>
            {i < 3 && (
              <div style={{ width: 48, height: 2, backgroundColor: done ? G : "#e2e8f0", marginBottom: 18, flexShrink: 0, marginLeft: 0, marginRight: 0 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Role picker (screen 0) ───────────────────────────────────────────────────

function RolePicker({ onPick }) {
  return (
    <div style={{ width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", alignItems: "center", gap: 24, textAlign: "center" }}>
      <div>
        <h1 style={{ color: DARK, fontFamily: "Spectral, serif", fontSize: "1.85rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
          Welcome to Inzira Works
        </h1>
        <p style={{ color: "#5c7068", fontSize: "0.875rem", marginTop: 6 }}>
          First, tell us how you'll use the platform.
        </p>
      </div>

      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
        {[
          {
            id: "provider",
            Icon: Shirt,
            iconBg: "#e8f3ee",
            iconColor: G,
            title: "I offer a skill or service",
            desc: "Create a profile, get bookings and build your Trust Score.",
          },
          {
            id: "customer",
            Icon: Search,
            iconBg: "#fce8e8",
            iconColor: "#c0392b",
            title: "I'm looking for a service",
            desc: "Find trusted, skilled women near you and book with confidence.",
          },
        ].map(({ id, Icon, iconBg, iconColor, title, desc }) => (
          <button key={id} onClick={() => onPick(id)}
            style={{ width: "100%", backgroundColor: "white", borderRadius: 16, border: "1px solid #e8e2d8", padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, textAlign: "left", cursor: "pointer", fontFamily: "'Hanken Grotesk', sans-serif" }}
            className="hover:shadow-sm transition-shadow"
          >
            <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon size={20} style={{ color: iconColor }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: DARK, fontWeight: 600, fontSize: "0.95rem" }}>{title}</p>
              <p style={{ color: "#5c7068", fontSize: "0.8rem", marginTop: 3 }}>{desc}</p>
            </div>
            <ChevronRight size={16} style={{ color: "#94a3b8", flexShrink: 0 }} />
          </button>
        ))}
      </div>

      <p style={{ color: "#5c7068", fontSize: "0.85rem" }}>
        Already have an account?{" "}
        <Link to="/login" style={{ color: G, fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
      </p>
    </div>
  );
}

// ─── Provider flow (steps 1–4) ────────────────────────────────────────────────

function ProviderFlow({ step, form, setField, errors, apiError, photos, previews, photoRefs, onPhotoChange, docs, setDocs, docRefs, loading, onBack, onNext }) {
  return (
    <div style={{ width: "100%", maxWidth: 520, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <ProgressBar step={step} />

      <div style={{ backgroundColor: "white", borderRadius: 20, border: "1px solid #e8e2d8", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", width: "100%", padding: "28px 32px", display: "flex", flexDirection: "column", gap: 20, fontFamily: "'Hanken Grotesk', sans-serif" }}>

        {/* ── Step 1: Account ── */}
        {step === 1 && <>
          <div>
            <h2 style={{ color: DARK, fontFamily: "Spectral, serif", fontSize: "1.4rem", fontWeight: 700 }}>Create your account</h2>
            <p style={{ color: G, fontSize: "0.85rem", marginTop: 4 }}>We use your phone number to keep bookings secure.</p>
          </div>
          {apiError && <p style={{ color: "#dc2626", backgroundColor: "#fef2f2", padding: "10px 14px", borderRadius: 10, fontSize: "0.85rem" }}>{apiError}</p>}
          <Field label="Full name"     placeholder="e.g. Solange Mukamana" value={form.fullName} onChange={setField("fullName")} error={errors.fullName} />
          <Field label="Email address" type="email" placeholder="you@example.com" value={form.email} onChange={setField("email")} error={errors.email} />
          <Field label="Phone number"  type="tel" placeholder="07XX XXX XXX" value={form.phone} onChange={setField("phone")} error={errors.phone} />
          <Field label="Password"      type="password" placeholder="Create a password" value={form.password} onChange={setField("password")} error={errors.password} />
          <StepFooter onBack={onBack} onNext={onNext} loading={loading} />
        </>}

        {/* ── Step 2: Your craft ── */}
        {step === 2 && <>
          <div>
            <h2 style={{ color: DARK, fontFamily: "Spectral, serif", fontSize: "1.4rem", fontWeight: 700 }}>Tell us about your craft</h2>
            <p style={{ color: G, fontSize: "0.85rem", marginTop: 4 }}>This is what customers will see first.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { label: "Main category", field: "category", options: CATEGORIES },
              { label: "District",      field: "district", options: DISTRICTS  },
            ].map(({ label, field, options }) => (
              <div key={field} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: "0.85rem", color: "#3c4a44", fontWeight: 500 }}>{label}</label>
                <select value={form[field]} onChange={setField(field)}
                  style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: "0.875rem", color: DARK, outline: "none", fontFamily: "'Hanken Grotesk', sans-serif", backgroundColor: "white" }}>
                  {options.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: "0.85rem", color: "#3c4a44", fontWeight: 500 }}>Short bio</label>
            <textarea value={form.bio} onChange={setField("bio")} rows={4}
              placeholder="Describe your experience and what makes your work special…"
              style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: "0.875rem", color: DARK, outline: "none", resize: "vertical", fontFamily: "'Hanken Grotesk', sans-serif" }} />
          </div>
          <StepFooter onBack={onBack} onNext={onNext} loading={loading} />
        </>}

        {/* ── Step 3: Showcase ── */}
        {step === 3 && <>
          <div>
            <h2 style={{ color: DARK, fontFamily: "Spectral, serif", fontSize: "1.4rem", fontWeight: 700 }}>Show your best work</h2>
            <p style={{ color: "#5c7068", fontSize: "0.85rem", marginTop: 4 }}>Profiles with photos get up to 3× more bookings. Add a few now or later.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {[0, 1, 2].map((i) => (
              <div key={i}>
                <input ref={photoRefs[i]} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => onPhotoChange(i, e)} />
                <button onClick={() => photoRefs[i].current?.click()}
                  style={{ width: "100%", aspectRatio: "1", borderRadius: 12, border: "1.5px dashed #d4cfc5", backgroundColor: previews[i] ? "transparent" : "#f8f5f0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", overflow: "hidden", padding: 0 }}>
                  {previews[i]
                    ? <img src={previews[i]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }} />
                    : <>
                        <ImageIcon size={22} style={{ color: "#c4bdb4" }} />
                        <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Add photo</span>
                      </>
                  }
                </button>
              </div>
            ))}
          </div>
          <StepFooter onBack={onBack} onNext={onNext} loading={loading} />
        </>}

        {/* ── Step 4: Verify ── */}
        {step === 4 && <>
          <div>
            <h2 style={{ color: DARK, fontFamily: "Spectral, serif", fontSize: "1.4rem", fontWeight: 700 }}>Build trust — get verified</h2>
            <p style={{ color: "#5c7068", fontSize: "0.85rem", marginTop: 4 }}>Verification boosts your Trust Score and reassures customers. Optional, but recommended.</p>
          </div>
          {[
            { key: "nationalId", ref: docRefs.national, Icon: CreditCard, title: "National ID",       desc: "Confirms your identity"  },
            { key: "tvetCert",   ref: docRefs.tvet,     Icon: Shield,      title: "TVET certificate", desc: "Verifies your training"   },
          ].map(({ key, ref, Icon, title, desc }) => (
            <div key={key}>
              <input ref={ref} type="file" accept=".pdf,image/*" style={{ display: "none" }}
                onChange={(e) => setDocs((prev) => ({ ...prev, [key]: e.target.files[0] || null }))} />
              <div style={{ backgroundColor: "#f8f5f0", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 36, height: 36, backgroundColor: "#e8f3ee", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={16} style={{ color: G }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: "0.875rem", color: DARK }}>{title}</p>
                  <p style={{ fontSize: "0.75rem", color: "#5c7068", marginTop: 2 }}>{desc}</p>
                  {docs[key] && <p style={{ fontSize: "0.7rem", color: G, marginTop: 2 }}>{docs[key].name}</p>}
                </div>
                <button onClick={() => ref.current?.click()}
                  style={{ color: G, fontWeight: 600, fontSize: "0.825rem", background: "none", border: "none", cursor: "pointer", fontFamily: "'Hanken Grotesk', sans-serif" }}>
                  {docs[key] ? "Change" : "Upload"}
                </button>
              </div>
            </div>
          ))}
          {apiError && <p style={{ color: "#dc2626", backgroundColor: "#fef2f2", padding: "10px 14px", borderRadius: 10, fontSize: "0.85rem" }}>{apiError}</p>}
          <StepFooter onBack={onBack} onNext={onNext} loading={loading} nextLabel="Finish & go to dashboard" />
        </>}

      </div>
    </div>
  );
}

// ─── Customer flow (single step) ─────────────────────────────────────────────

function CustomerFlow({ form, setField, errors, apiError, loading, onBack, onFinish }) {
  return (
    <div style={{ width: "100%", maxWidth: 460 }}>
      <div style={{ backgroundColor: "white", borderRadius: 20, border: "1px solid #e8e2d8", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", padding: "28px 32px", display: "flex", flexDirection: "column", gap: 20, fontFamily: "'Hanken Grotesk', sans-serif" }}>
        <div>
          <h2 style={{ color: DARK, fontFamily: "Spectral, serif", fontSize: "1.4rem", fontWeight: 700 }}>Create your account</h2>
          <p style={{ color: "#5c7068", fontSize: "0.85rem", marginTop: 4 }}>We use your phone number to keep bookings secure.</p>
        </div>
        {apiError && <p style={{ color: "#dc2626", backgroundColor: "#fef2f2", padding: "10px 14px", borderRadius: 10, fontSize: "0.85rem" }}>{apiError}</p>}
        <Field label="Full name"     placeholder="e.g. Solange Mukamana" value={form.fullName} onChange={setField("fullName")} error={errors.fullName} />
        <Field label="Email address" type="email" placeholder="you@example.com" value={form.email} onChange={setField("email")} error={errors.email} />
        <Field label="Phone number"  type="tel" placeholder="07XX XXX XXX" value={form.phone} onChange={setField("phone")} error={errors.phone} />
        <Field label="Address"       placeholder="e.g. Kimihurura, Kigali" value={form.address} onChange={setField("address")} error={errors.address} />
        <Field label="Password"      type="password" placeholder="Create a password" value={form.password} onChange={setField("password")} error={errors.password} />
        <StepFooter onBack={onBack} onNext={onFinish} loading={loading} nextLabel="Finish & go to dashboard" />
      </div>
    </div>
  );
}

// ─── Page root ────────────────────────────────────────────────────────────────

export default function RoleSelectPage() {
  const navigate    = useNavigate();
  const location    = useLocation();
  const { register } = useAuth();

  // Pre-fill from /signup if the user came via that route
  const seed = location.state?.signup || {};

  const [role, setRole]   = useState(null);
  const [step, setStep]   = useState(0);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [errors, setErrors]   = useState({});

  const [form, setFormState] = useState({
    fullName: seed.fullName || "",
    email:    seed.email    || "",
    phone:    seed.phone    || "",
    password: seed.password || "",
    address:  seed.address  || "",
    category: "Tailoring & Fashion",
    district: seed.district || "Gasabo",
    bio:      "",
  });

  const [photos,   setPhotos]   = useState([null, null, null]);
  const [previews, setPreviews] = useState([null, null, null]);
  const [docs, setDocs]         = useState({ nationalId: null, tvetCert: null });

  const photoRefs = [useRef(), useRef(), useRef()];
  const docRefs   = { national: useRef(), tvet: useRef() };

  const setField = (field) => (e) => {
    setFormState((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev)    => ({ ...prev, [field]: "" }));
    setApiError("");
  };

  const onPhotoChange = (i, e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotos((prev)   => { const n = [...prev];   n[i] = file;                        return n; });
    setPreviews((prev) => { const n = [...prev];   n[i] = URL.createObjectURL(file);   return n; });
  };

  const validateAccount = () => {
    const errs = {};
    if (!form.fullName.trim())              errs.fullName = "Full name is required.";
    if (!form.email)                        errs.email    = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Enter a valid email.";
    if (!form.phone.trim())                 errs.phone    = "Phone number is required.";
    if (!form.password)                     errs.password = "Password is required.";
    else if (form.password.length < 8)      errs.password = "At least 8 characters.";
    return errs;
  };

  const handleFinish = async () => {
    setLoading(true);
    setApiError("");
    try {
      const { needsConfirmation, user } = await register({
        fullName: form.fullName,
        email:    form.email,
        phone:    form.phone,
        address:  form.address || "",
        district: form.district,
        password: form.password,
        role,
      });

      // For providers: patch the profile row with bio, headline, district
      if (!needsConfirmation && role === "provider" && user) {
        await supabase.from("provider_profiles").update({
          headline: form.category,
          bio:      form.bio || null,
          district: form.district,
        }).eq("user_id", user.id);
      }

      if (needsConfirmation) {
        navigate("/check-email", { state: { email: form.email } });
      } else {
        navigate(role === "provider" ? "/provider/dashboard" : "/customer/dashboard");
      }
    } catch (err) {
      const msg = err.message || "";
      if (msg.includes("500") || msg.toLowerCase().includes("unexpected")) {
        setApiError("Email service temporarily unavailable. Please try again in a moment.");
      } else if (msg.toLowerCase().includes("already registered") || msg.toLowerCase().includes("already exists")) {
        setApiError("An account with this email already exists. Try signing in instead.");
      } else {
        setApiError(msg || "Could not create your account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (step === 1) {
      const errs = validateAccount();
      if (Object.keys(errs).length) { setErrors(errs); return; }
      if (role === "customer") { await handleFinish(); return; }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      await handleFinish();
    }
  };

  const pickRole = (r) => { setRole(r); setStep(1); };
  const goBack   = () => (step <= 1 ? setStep(0) : setStep(step - 1));

  return (
    <div style={{ minHeight: "100vh", backgroundColor: CREAM, fontFamily: "'Hanken Grotesk', sans-serif" }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", padding: "16px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="16" height="20" viewBox="0 0 18 22" fill="none">
            <path d="M9 2C9 2 3 5.5 3 12C3 16.5 5.5 19 9 19L9 21L13 17.5L9 14L9 16.5C7 16.5 5 15 5 12C5 7.5 9 5 9 5L9 2Z" fill={G} />
          </svg>
          <span style={{ color: DARK, fontFamily: "Spectral, serif", fontWeight: 700, fontSize: "1.05rem" }}>Inzira Works</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px 48px", minHeight: "calc(100vh - 60px)" }}>
        {step === 0 && <RolePicker onPick={pickRole} />}

        {step >= 1 && role === "provider" && (
          <ProviderFlow
            step={step} form={form} setField={setField}
            errors={errors} apiError={apiError}
            photos={photos} previews={previews}
            photoRefs={photoRefs} onPhotoChange={onPhotoChange}
            docs={docs} setDocs={setDocs} docRefs={docRefs}
            loading={loading} onBack={goBack} onNext={handleNext}
          />
        )}

        {step >= 1 && role === "customer" && (
          <CustomerFlow
            form={form} setField={setField}
            errors={errors} apiError={apiError}
            loading={loading} onBack={goBack} onFinish={handleNext}
          />
        )}
      </div>
    </div>
  );
}
