// src/pages/auth/AuthCallbackPage.jsx
// Landing page for the email confirmation link.
// Supabase exchanges the token from the URL, fires onAuthStateChange(SIGNED_IN),
// and AuthContext sets the user. We then create the provider profile (if needed)
// and redirect to the correct dashboard.
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

export default function AuthCallbackPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const didRun = useRef(false);

  useEffect(() => {
    if (loading || didRun.current) return;

    if (!user) {
      // Auth state not resolved yet — wait for next render
      return;
    }

    didRun.current = true;

    (async () => {
      // Create provider_profiles row if this is a provider who confirmed email
      if (user.role === "provider") {
        const { data: existing } = await supabase
          .from("provider_profiles")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!existing) {
          await supabase.from("provider_profiles").insert({
            user_id: user.id,
            trust_score: 0,
            profile_completeness: 0,
            response_rate: 0,
            repeat_rate: 0,
          });
        }
      }

      navigate(
        user.role === "provider" ? "/provider/dashboard" : "/customer/dashboard",
        { replace: true }
      );
    })();
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: "#F8FAFC" }}>
      <span className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
      <p className="text-slate-400 text-sm">Verifying your email…</p>
    </div>
  );
}
