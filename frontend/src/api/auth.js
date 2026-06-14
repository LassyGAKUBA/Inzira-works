// src/api/auth.js
// Functions that map directly to the backend's /api/auth endpoints.

import { api } from "./client.js";

// POST /api/auth/register → { user, token }
export const registerRequest = (payload) =>
  api.post("/api/auth/register", payload);

// POST /api/auth/login → { user, token }
export const loginRequest = (payload) =>
  api.post("/api/auth/login", payload);

// GET /api/auth/me → { user }   (requires token)
export const getMeRequest = () =>
  api.get("/api/auth/me", { auth: true });
