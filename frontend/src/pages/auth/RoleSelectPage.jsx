// src/pages/auth/RoleSelectPage.jsx
// Shown immediately after signup — user picks: Service Provider or Customer.
// This is where the account is actually created (role is needed at registration).
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLang } from "../../i18n/LangContext";
import { useAuth } from "../../context/AuthContext";
import LanguageSwitcher from "../../components/shared/LanguageSwitcher";
import { Briefcase, Users, Check } from "lucide-react";

const ROLES = [
  {
    id: "provider",
    Icon: Briefcase,
    title: "Service Provider",
    titleRw: "Utoa Serivisi",
    titleSw: "Mtoa Huduma",
    desc: "I offer skills and services — tailoring, hairdressing, handcraft, and more.",
    descRw: "Ntoa serivisi — gutera imyenda, guca umusatsi, bukorikori, n'ibindi.",
    descSw: "Natoa huduma — ushonaji, kunyoa nywele, ufundi, na zaidi.",
    perks: [
      "Create a professional profile",
      "Showcase your portfolio",
      "Receive bookings from customers",
      "Build your Trust Score",
      "Get verified",
    ],
    perksRw: [
      "Kora umwirondoro w'inzobere",
      "Erekana portfolio yawe",
      "Gabwa gahunda z'abakiriya",
      "Wubake Trust Score yawe",
      "Emezwa",
    ],
    perksSw: [
      "Unda wasifu wa kitaalamu",
      "Onyesha kazi yako",
      "Pokea nafasi kutoka kwa wateja",
      "Jenga Trust Score yako",
      "Thibitishwa",
    ],
    color: "#F97316",
    bgLight: "#FFF7ED",
    badge: "For skilled women",
  },
  {
    id: "customer",
    Icon: Users,
    title: "Customer",
    titleRw: "Umukiriya",
    titleSw: "Mteja",
    desc: "I'm looking for skilled women to hire for services in Kigali.",
    descRw: "Nshaka abagore inzobere ba serivisi i Kigali.",
    descSw: "Natafuta wanawake wenye ujuzi wa kuajiri kwa huduma Kigali.",
    perks: [
      "Browse verified providers",
      "Filter by district & skill",
      "Read reviews and Trust Scores",
      "Send booking requests",
      "Save your favourite providers",
    ],
    perksRw: [
      "Reba abatoa serivisi bemejwe",
      "Shungura ukurikiye indaro & ubuhanga",
      "Soma ibitekerezo na Trust Score",
      "Ohereza gahunda",
      "Bika abatoa serivisi bakugwiraho",
    ],
    perksSw: [
      "Vinjari watoa huduma waliothibitishwa",
      "Chuja kwa wilaya na ujuzi",
      "Soma maoni na Trust Score",
      "Tuma maombi ya nafasi",
      "Hifadhi watoa huduma unaowapenda",
    ],
    color: "#3B82F6",
    bgLight: "#EFF6FF",
    badge: "For businesses & individuals",
  },
];

export default function RoleSelectPage() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();

  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // The signup details were passed via navigation state.
  const signupData = location.state?.signup;

  // If someone navigates here directly (no signup data), send them to signup.
  useEffect(() => {
    if (!signupData) navigate("/signup", { replace: true });
  }, [signupData, navigate]);

  const getTitle = (role) => lang === "rw" ? role.titleRw : lang === "sw" ? role.titleSw : role.title;
  const getDesc = (role) => lang === "rw" ? role.descRw : lang === "sw" ? role.descSw : role.desc;
  const getPerks = (role) => lang === "rw" ? role.perksRw : lang === "sw" ? role.perksSw : role.perks;

  const handleContinue = async () => {
    if (!selected || !signupData) return;
    setLoading(true);
    setApiError("");
    try {
      const user = await register({ ...signupData, role: selected });
      navigate(user.role === "provider" ? "/provider/dashboard" : "/customer/dashboard");
    } catch (err) {
      setApiError(err.message || "Could not create your account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F8FAFC" }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
        <div className="flex items-center gap-2">
          <div style={{ backgroundColor: "#F97316" }} className="w-8 h-8 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-sm">IW</span>
          </div>
          <span style={{ color: "#1E293B" }} className="font-bold text-lg tracking-tight">Inzira Works</span>
        </div>
        <LanguageSwitcher compact />
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-center pt-8 px-6">
        <div className="flex items-center gap-2">
          {[
            { n: 1, label: "Account", done: true },
            { n: 2, label: "Your Role", done: false, active: true },
            { n: 3, label: "Profile", done: false },
          ].map((step, i) => (
            <div key={step.n} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    backgroundColor: step.done ? "#F97316" : step.active ? "#FFF7ED" : "#E2E8F0",
                    color: step.done ? "white" : step.active ? "#F97316" : "#94A3B8",
                    border: step.active ? "2px solid #F97316" : "none",
                  }}
                >
                  {step.done ? <Check size={14} /> : step.n}
                </div>
                <span
                  className="text-xs font-medium hidden sm:block"
                  style={{ color: step.done || step.active ? "#1E293B" : "#94A3B8" }}
                >
                  {step.label}
                </span>
              </div>
              {i < 2 && <div className="w-8 h-px bg-slate-200" />}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-3xl flex flex-col gap-8">
          {/* Header */}
          <div className="text-center flex flex-col gap-2">
            <h1 style={{ color: "#1E293B" }} className="text-2xl sm:text-3xl font-black tracking-tight">
              How will you use Inzira Works?
            </h1>
            <p className="text-slate-500 text-sm">
              Choose your role — you can always change this later in settings.
            </p>
          </div>

          {/* API error banner */}
          {apiError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl text-center">
              {apiError}
            </div>
          )}

          {/* Role cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            {ROLES.map((role) => {
              const isSelected = selected === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => setSelected(role.id)}
                  className="relative text-left rounded-2xl border-2 p-6 transition-all duration-200 flex flex-col gap-4 focus:outline-none"
                  style={{
                    borderColor: isSelected ? role.color : "#E2E8F0",
                    backgroundColor: isSelected ? role.bgLight : "white",
                    boxShadow: isSelected ? `0 0 0 4px ${role.color}15` : "none",
                  }}
                  aria-pressed={isSelected}
                >
                  {/* Selected checkmark */}
                  {isSelected && (
                    <div
                      className="absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: role.color }}
                    >
                      <Check size={13} />
                    </div>
                  )}

                  {/* Icon + title */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: role.bgLight, color: role.color }}
                    >
                      <role.Icon size={22} />
                    </div>
                    <div>
                      <p style={{ color: "#1E293B" }} className="font-bold text-base">{getTitle(role)}</p>
                      <p
                        className="text-xs font-medium px-2 py-0.5 rounded-full mt-0.5 w-fit"
                        style={{ backgroundColor: role.bgLight, color: role.color }}
                      >
                        {role.badge}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-slate-500 text-sm leading-relaxed">{getDesc(role)}</p>

                  {/* Perks */}
                  <div className="flex flex-col gap-2">
                    {getPerks(role).map((perk) => (
                      <div key={perk} className="flex items-start gap-2">
                        <Check size={12} style={{ color: role.color }} className="mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-slate-600 leading-relaxed">{perk}</span>
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Continue button */}
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={handleContinue}
              disabled={!selected || loading}
              style={{
                backgroundColor: selected ? "#F97316" : "#E2E8F0",
                color: selected ? "white" : "#94A3B8",
                cursor: selected ? "pointer" : "not-allowed",
              }}
              className="w-full sm:w-auto sm:min-w-[240px] font-semibold py-3 px-8 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {loading ? "Setting up your account..." : selected ? `Continue as ${ROLES.find(r => r.id === selected)?.title}` : "Select a role to continue"}
            </button>
            <p className="text-xs text-slate-400">You can switch roles anytime in Settings</p>
          </div>
        </div>
      </div>
    </div>
  );
}
