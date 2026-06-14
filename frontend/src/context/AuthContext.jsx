// src/context/AuthContext.jsx
// Holds the logged-in user + token for the whole app.
//
// Usage:
//   const { user, login, register, logout, loading } = useAuth();
//
// On first load, if a token exists in localStorage, we call /me to
// restore the session (so a page refresh keeps you logged in).

import { createContext, useContext, useEffect, useState } from "react";
import { loginRequest, registerRequest, getMeRequest } from "../api/auth.js";
import { tokenStore } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // `loading` is true only during the initial session restore on mount.
  const [loading, setLoading] = useState(true);

  // Restore session on first load
  useEffect(() => {
    const token = tokenStore.get();
    if (!token) {
      setLoading(false);
      return;
    }
    getMeRequest()
      .then((data) => setUser(data.user))
      .catch(() => {
        // token invalid/expired → clear it
        tokenStore.clear();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // Log in: store token, set user. Returns the user (for role-based redirect).
  const login = async (credentials) => {
    const { user, token } = await loginRequest(credentials);
    tokenStore.set(token);
    setUser(user);
    return user;
  };

  // Register: store token, set user. Returns the user.
  const register = async (payload) => {
    const { user, token } = await registerRequest(payload);
    tokenStore.set(token);
    setUser(user);
    return user;
  };

  const logout = () => {
    tokenStore.clear();
    setUser(null);
  };

  const value = { user, loading, login, register, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth() must be used inside an <AuthProvider>.");
  }
  return ctx;
}
