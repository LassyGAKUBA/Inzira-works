import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

function mapUser(supabaseUser) {
  if (!supabaseUser) return null;
  return {
    id: supabaseUser.id,
    email: supabaseUser.email,
    role: supabaseUser.user_metadata?.role || "customer",
    full_name: supabaseUser.user_metadata?.full_name || "",
    phone: supabaseUser.user_metadata?.phone || "",
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session on first load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(mapUser(session?.user ?? null));
      setLoading(false);
    });

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(mapUser(session?.user ?? null));
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    return mapUser(data.user);
  };

  const register = async ({ fullName, email, phone, address = "", district, bio = "", category = "", password, role }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone, address, district, role, bio, category },
      },
    });
    if (error) throw new Error(error.message);

    // session is null when Supabase requires email confirmation
    const needsConfirmation = !data.session;

    // Only create + patch provider profile when session is immediate (no confirmation)
    if (!needsConfirmation && role === "provider" && data.user) {
      const { data: inserted } = await supabase.from("provider_profiles").insert({
        user_id: data.user.id,
        trust_score: 0,
        profile_completeness: 0,
        response_rate: 0,
        repeat_rate: 0,
      }).select("id").single();

      if (inserted) {
        await supabase.from("provider_profiles").update({
          headline: category || null,
          bio:      bio      || null,
          district: district || null,
        }).eq("id", inserted.id);
      }
    }

    return { needsConfirmation, user: mapUser(data.user) };
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const value = { user, loading, login, register, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth() must be used inside an <AuthProvider>.");
  return ctx;
}
