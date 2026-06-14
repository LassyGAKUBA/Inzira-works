import * as userRepo from "../repositories/user.repository.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { signToken } from "../utils/jwt.js";
import { ApiError } from "../utils/apiError.js";

/**
 * Register a new customer or provider.
 * Throws 409 if the email is already taken.
 * Returns { user, token }.
 */
export const register = async (data) => {
  const existing = await userRepo.findByEmail(data.email);
  if (existing) {
    throw new ApiError(409, "An account with this email already exists");
  }

  const passwordHash = await hashPassword(data.password);
  const user = await userRepo.createUser({
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    passwordHash,
    role: data.role,
    district: data.district,
  });

  const token = signToken({ id: user.id, role: user.role });
  return { user, token };
};

/**
 * Log a user in with email + password.
 * Throws 401 on any mismatch (same message for both cases so we don't
 * reveal whether an email exists). Returns { user, token }.
 */
export const login = async ({ email, password }) => {
  const record = await userRepo.findByEmail(email);
  if (!record) throw new ApiError(401, "Invalid email or password");

  const ok = await comparePassword(password, record.password_hash);
  if (!ok) throw new ApiError(401, "Invalid email or password");

  if (!record.is_active) throw new ApiError(403, "This account is inactive");

  // Strip the password hash before returning.
  const { password_hash, ...user } = record;
  const token = signToken({ id: user.id, role: user.role });
  return { user, token };
};
