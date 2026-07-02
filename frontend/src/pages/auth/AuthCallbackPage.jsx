import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

const G = "#0E5C46";

const ROLE_HOME = {
  provider: "/provider/dashboard",
  customer:  "/customer/dashboard",
  admin:     "/admin/dashboard",
};

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const didRun   = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    // Detect password recovery link (hash contains type=recovery)
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    if (hashParams.get("type") === "recovery") {
      await supabase.auth.getSession(); // exchanges the hash token
      navigate("/reset-password", { replace: true });
      return;
    }

    (async () => {
      // Exchange the token from the URL hash / query for a real session
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        navigate("/login", { replace: true });
        return;
      }

      const supaUser = session.user;
      const meta     = supaUser.user_metadata || {};
      const role     = meta.role || "customer";

      // For providers: ensure profile row exists + apply onboarding metadata
      if (role === "provider") {
        const { data: existing } = await supabase
          .from("provider_profiles")
          .select("id")
          .eq("user_id", supaUser.id)
          .maybeSingle();

        if (!existing) {
          // Create the row first
          await supabase.from("provider_profiles").insert({
            user_id:              supaUser.id,
            trust_score:          0,
            profile_completeness: 0,
            response_rate:        0,
            repeat_rate:          0,
          });
        }

        // Patch with onboarding data stored in user_metadata
        await supabase.from("provider_profiles").update({
          headline: meta.category || null,
          bio:      meta.bio      || null,
          district: meta.district || null,
        }).eq("user_id", supaUser.id);
      }

      navigate(ROLE_HOME[role] || "/customer/dashboard", { replace: true });
    })();
  }, [navigate]);

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#ede9e0",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 16,
      fontFamily: "'Hanken Grotesk', sans-serif",
    }}>
      <span style={{
        width: 40, height: 40,
        borderRadius: "50%",
        border: `4px solid ${G}33`,
        borderTopColor: G,
        display: "inline-block",
        animation: "spin 0.8s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: "#5c7068", fontSize: "0.875rem" }}>Verifying your email…</p>
    </div>
  );
}
