import * as authService from "../services/auth.service.js";
import { asyncHandler } from "../utils/apiError.js";

export const register = asyncHandler(async (req, res) => {
  const { user, token } = await authService.register(req.body);
  res.status(201).json({ user, token });
});

export const login = asyncHandler(async (req, res) => {
  const { user, token } = await authService.login(req.body);
  res.json({ user, token });
});

/**
 * Returns the currently logged-in user.
 * req.user was attached by requireAuth, so no DB call needed here.
 */
export const getMe = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});
