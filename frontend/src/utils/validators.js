// Pure functions extracted from SignupPage.jsx and ProviderProfilePage.jsx
// for unit testing. No React, no Supabase imports — plain JS only.

/**
 * Computes password strength score 0–4.
 * Mirrors the PasswordStrength component in SignupPage.jsx (lines 50-58).
 *   1 = length >= 8
 *   2 = + uppercase letter
 *   3 = + digit
 *   4 = + special character
 */
export function passwordScore(password) {
  if (!password) return 0;
  let s = 0;
  if (password.length >= 8)        s++;
  if (/[A-Z]/.test(password))      s++;
  if (/[0-9]/.test(password))      s++;
  if (/[^A-Za-z0-9]/.test(password)) s++;
  return s;
}

export const PASSWORD_LABELS = ["", "Weak", "Fair", "Good", "Strong"];

/**
 * Returns true if the phone number is a valid Rwandan number.
 * Regex from SignupPage.jsx validate() line 100:
 *   /^(\+?250)?0?7[2-9]\d{7}$/
 * Accepts: 0781234567 | 250781234567 | +250781234567 | 781234567
 * Rejects: international non-250, too short, wrong prefix (70, 71)
 */
export function isValidRwandanPhone(phone) {
  return /^(\+?250)?0?7[2-9]\d{7}$/.test((phone || "").replace(/\s/g, ""));
}

/**
 * Normalises a Rwandan phone number to international format (250XXXXXXXXX).
 * Mirrors openWhatsApp() in ProviderProfilePage.jsx (lines 117-123).
 */
export function normalisePhone(phone) {
  let n = (phone || "").replace(/\D/g, "");
  if (n.startsWith("0"))               n = "250" + n.slice(1);
  else if (n && !n.startsWith("250"))  n = "250" + n;
  return n;
}

/**
 * Formats a number as a RWF currency string.
 * Mirrors the .toLocaleString() calls in ProviderDashboard AnalyticsTab.
 */
export function formatRWF(amount) {
  return `RWF ${Number(amount).toLocaleString()}`;
}

/**
 * Computes the Trust Score (0–100) from the four weighted factors.
 * Mirrors recalculate_provider_scores() in supabase/trust_score_triggers.sql.
 *
 * Formula:
 *   ratingScore  = (avgRating / 5) * 100          → weight 40%
 *   bookingScore = min(completedJobs / 50, 1) * 100 → weight 30%
 *   completeness                                   → weight 20%
 *   responseRate                                   → weight 10%
 *
 * Score is capped at 100.
 */
export function computeTrustScore({ avgRating = 0, completedJobs = 0, profileCompleteness = 0, responseRate = 0 }) {
  const ratingScore  = (avgRating  / 5.0) * 100.0;
  const bookingScore = Math.min(completedJobs / 50.0, 1.0) * 100.0;
  const raw =
    (ratingScore         * 0.40) +
    (bookingScore        * 0.30) +
    (profileCompleteness * 0.20) +
    (responseRate        * 0.10);
  return Math.min(Math.round(raw), 100);
}

/**
 * Computes the average rating from an array of integer ratings.
 * Mirrors SQL: ROUND(AVG(rating::NUMERIC), 1) in get_providers / get_provider_detail.
 */
export function averageRating(ratings = []) {
  if (!ratings.length) return 0;
  const sum = ratings.reduce((acc, r) => acc + r, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
}
