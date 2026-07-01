import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

const G = "#0E5C46";

export default function AuthCallbackPage() {
  const { user, loading } = useAuth();
  const navigate  = useNavigate();
  const didRun = useRef(false);

  useEffect(() => {
    if (loading || didRun.current) return;
    if (!user) return;

    didRun.current = true;

    (async () => {
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
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#ede9e0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        fontFamily: "'Hanken Grotesk', sans-serif",
      }}
    >
      <span
        style={{
          width: 40, height: 40,
          borderRadius: "50%",
          border: `4px solid ${G}33`,
          borderTopColor: G,
          display: "inline-block",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: "#5c7068", fontSize: "0.875rem" }}>Verifying your email…</p>
    </div>
  );
}
