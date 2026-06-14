import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

/**
 * Create a signed token carrying the user's id and role.
 * The frontend stores this and sends it back on every request.
 */
export const signToken = (payload) =>
  jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

/**
 * Verify a token and return its payload.
 * Throws if the token is invalid or expired.
 */
export const verifyToken = (token) => jwt.verify(token, env.jwtSecret);
