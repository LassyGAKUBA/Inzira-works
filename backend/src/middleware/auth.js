import { verifyToken } from "../utils/jwt.js";
import { ApiError } from "../utils/apiError.js";
import * as userRepo from "../repositories/user.repository.js";

/**
 * Verifies the Bearer token and attaches the current user to req.user.
 * Use on any route that requires the caller to be logged in.
 *
 *   router.get("/me", requireAuth, getMe);
 */
export const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) throw new ApiError(401, "Authentication required");

    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      throw new ApiError(401, "Invalid or expired token");
    }

    const user = await userRepo.findById(payload.id);
    if (!user || !user.is_active) {
      throw new ApiError(401, "Account not found or inactive");
    }

    req.user = user; // { id, full_name, email, phone, role, district, ... }
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Restricts a route to one or more roles. Use AFTER requireAuth.
 *
 *   router.get("/admin/users", requireAuth, requireRole("admin"), listUsers);
 */
export const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, "You do not have permission to do that"));
    }
    next();
  };
