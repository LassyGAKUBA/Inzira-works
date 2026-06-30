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

  const register = async ({ fullName, email, phone, district, password, role }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone, district, role },
      },
    });
    if (error) throw new Error(error.message);

    // If user is a provider, also create the provider_profiles row
    if (role === "provider" && data.user) {
      await supabase.from("provider_profiles").insert({
        user_id: data.user.id,
        trust_score: 0,
        profile_completeness: 0,
        response_rate: 0,
        repeat_rate: 0,
      });
    }

    return mapUser(data.user);
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
