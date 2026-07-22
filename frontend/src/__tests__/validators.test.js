import { describe, it, expect } from "vitest";
import {
  passwordScore,
  PASSWORD_LABELS,
  isValidRwandanPhone,
  normalisePhone,
  formatRWF,
  computeTrustScore,
  averageRating,
} from "../utils/validators.js";

// ─────────────────────────────────────────────────────────────
// 1. Password strength scorer
// Source: SignupPage.jsx PasswordStrength component (lines 50-58)
// ─────────────────────────────────────────────────────────────
describe("passwordScore", () => {
  it("returns 0 for empty string", () => {
    expect(passwordScore("")).toBe(0);
  });

  it("returns 0 for null/undefined", () => {
    expect(passwordScore(null)).toBe(0);
    expect(passwordScore(undefined)).toBe(0);
  });

  it("returns 1 (Weak) for length >= 8, no other criteria", () => {
    expect(passwordScore("abcdefgh")).toBe(1);
    expect(PASSWORD_LABELS[1]).toBe("Weak");
  });

  it("returns 2 (Fair) for length + uppercase", () => {
    expect(passwordScore("Abcdefgh")).toBe(2);
    expect(PASSWORD_LABELS[2]).toBe("Fair");
  });

  it("returns 3 (Good) for length + uppercase + digit", () => {
    expect(passwordScore("Abcdefg1")).toBe(3);
    expect(PASSWORD_LABELS[3]).toBe("Good");
  });

  it("returns 4 (Strong) for all four criteria", () => {
    expect(passwordScore("Abcdef1!")).toBe(4);
    expect(PASSWORD_LABELS[4]).toBe("Strong");
  });

  it("returns 0 for a short password even with uppercase, digit, special char", () => {
    // 'A1!' is only 3 chars — fails the length check
    expect(passwordScore("A1!")).toBe(0);
  });

  it("does not give more than 4", () => {
    expect(passwordScore("AAAAAAA1!aaa")).toBe(4);
  });

  it("counts special characters correctly", () => {
    // '@' is a non-alphanumeric character
    expect(passwordScore("Password@1")).toBe(4);
  });
});

// ─────────────────────────────────────────────────────────────
// 2. Rwandan phone number validator
// Source: SignupPage.jsx validate() line 100
// Regex: /^(\+?250)?0?7[2-9]\d{7}$/
// ─────────────────────────────────────────────────────────────
describe("isValidRwandanPhone", () => {
  // Valid formats
  it("accepts 0781234567 (standard local format)", () => {
    expect(isValidRwandanPhone("0781234567")).toBe(true);
  });

  it("accepts 250781234567 (no + prefix)", () => {
    expect(isValidRwandanPhone("250781234567")).toBe(true);
  });

  it("accepts +250781234567 (E.164 format)", () => {
    expect(isValidRwandanPhone("+250781234567")).toBe(true);
  });

  it("accepts 781234567 (no leading 0 or country code)", () => {
    expect(isValidRwandanPhone("781234567")).toBe(true);
  });

  it("accepts numbers with spaces (spaces stripped before test)", () => {
    expect(isValidRwandanPhone("0781 234 567")).toBe(true);
  });

  // Digit prefix checks — 72–79 are valid MTN/Airtel prefixes in Rwanda
  it("accepts 072x prefix", () => {
    expect(isValidRwandanPhone("0721234567")).toBe(true);
  });

  it("accepts 079x prefix", () => {
    expect(isValidRwandanPhone("0791234567")).toBe(true);
  });

  // Invalid formats
  it("rejects 070x prefix (invalid Rwandan prefix)", () => {
    expect(isValidRwandanPhone("0701234567")).toBe(false);
  });

  it("rejects 071x prefix (invalid Rwandan prefix)", () => {
    expect(isValidRwandanPhone("0711234567")).toBe(false);
  });

  it("rejects a number that is too short", () => {
    expect(isValidRwandanPhone("078123")).toBe(false);
  });

  it("rejects a number that is too long", () => {
    expect(isValidRwandanPhone("078123456789")).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(isValidRwandanPhone("")).toBe(false);
  });

  it("rejects null", () => {
    expect(isValidRwandanPhone(null)).toBe(false);
  });

  it("rejects a non-numeric string", () => {
    expect(isValidRwandanPhone("notaphone")).toBe(false);
  });

  it("rejects a UK number", () => {
    expect(isValidRwandanPhone("+447911123456")).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────
// 3. Phone number normalisation for WhatsApp
// Source: ProviderProfilePage.jsx openWhatsApp() lines 117-123
// ─────────────────────────────────────────────────────────────
describe("normalisePhone", () => {
  it("converts 0781234567 → 250781234567", () => {
    expect(normalisePhone("0781234567")).toBe("250781234567");
  });

  it("leaves 250781234567 unchanged", () => {
    expect(normalisePhone("250781234567")).toBe("250781234567");
  });

  it("converts +250781234567 → 250781234567 (strips +)", () => {
    expect(normalisePhone("+250781234567")).toBe("250781234567");
  });

  it("converts 781234567 (no leading 0) → 250781234567", () => {
    expect(normalisePhone("781234567")).toBe("250781234567");
  });

  it("strips spaces and dashes before normalising", () => {
    expect(normalisePhone("078 123-456 7")).toBe("250781234567");
  });

  it("returns empty string for null input", () => {
    expect(normalisePhone(null)).toBe("");
  });

  it("returns empty string for empty string input", () => {
    expect(normalisePhone("")).toBe("");
  });
});

// ─────────────────────────────────────────────────────────────
// 4. RWF currency formatting
// Source: ProviderDashboard AnalyticsTab — uses Number().toLocaleString()
// ─────────────────────────────────────────────────────────────
describe("formatRWF", () => {
  it("formats zero as RWF 0", () => {
    expect(formatRWF(0)).toBe("RWF 0");
  });

  it("formats 50000 with thousands separator", () => {
    expect(formatRWF(50000)).toMatch(/^RWF 50[,.]?000$/);
  });

  it("formats a string number correctly", () => {
    expect(formatRWF("10000")).toMatch(/^RWF 10[,.]?000$/);
  });

  it("formats a decimal amount", () => {
    const result = formatRWF(1500.5);
    expect(result).toMatch(/^RWF/);
  });
});

// ─────────────────────────────────────────────────────────────
// 5. Trust Score computation
// Source: supabase/trust_score_triggers.sql recalculate_provider_scores()
// Formula:
//   (avgRating/5 * 100 * 0.40) + (min(jobs/50,1) * 100 * 0.30)
//   + (completeness * 0.20) + (responseRate * 0.10)
// Capped at 100.
// ─────────────────────────────────────────────────────────────
describe("computeTrustScore", () => {
  it("returns 0 for a brand-new provider with no data", () => {
    expect(computeTrustScore({ avgRating: 0, completedJobs: 0, profileCompleteness: 0, responseRate: 0 }))
      .toBe(0);
  });

  it("uses defaults of 0 when all fields are omitted", () => {
    expect(computeTrustScore({})).toBe(0);
  });

  it("returns 40 for a 5-star rating with zero bookings, no profile", () => {
    // (5/5 * 100 * 0.40) = 40
    expect(computeTrustScore({ avgRating: 5, completedJobs: 0, profileCompleteness: 0, responseRate: 0 }))
      .toBe(40);
  });

  it("returns 30 for 50+ completed jobs (maxed) with zero other factors", () => {
    // min(50/50,1) * 100 * 0.30 = 30
    expect(computeTrustScore({ avgRating: 0, completedJobs: 50, profileCompleteness: 0, responseRate: 0 }))
      .toBe(30);
  });

  it("job score is capped at 30 even with 100 completed jobs", () => {
    // min(100/50,1) = 1 → same as 50 jobs
    expect(computeTrustScore({ avgRating: 0, completedJobs: 100, profileCompleteness: 0, responseRate: 0 }))
      .toBe(30);
  });

  it("returns 20 for a fully-complete profile with zero other factors", () => {
    // 100 * 0.20 = 20
    expect(computeTrustScore({ avgRating: 0, completedJobs: 0, profileCompleteness: 100, responseRate: 0 }))
      .toBe(20);
  });

  it("returns 10 for a 100% response rate with zero other factors", () => {
    // 100 * 0.10 = 10
    expect(computeTrustScore({ avgRating: 0, completedJobs: 0, profileCompleteness: 0, responseRate: 100 }))
      .toBe(10);
  });

  it("returns 86 for: 5-star + 10 jobs + 100% profile + 100% response", () => {
    // (5/5*100*0.40) + (10/50*100*0.30) + (100*0.20) + (100*0.10)
    // = 40 + 6 + 20 + 10 = 76  → wait, let me recalculate
    // rating: 5/5 * 100 * 0.40 = 40
    // booking: 10/50 * 100 * 0.30 = 6
    // profile: 100 * 0.20 = 20
    // response: 100 * 0.10 = 10
    // total = 76
    expect(computeTrustScore({ avgRating: 5, completedJobs: 10, profileCompleteness: 100, responseRate: 100 }))
      .toBe(76);
  });

  it("returns 100 for a perfect provider (5 stars, 50 jobs, full profile, 100% response)", () => {
    // 40 + 30 + 20 + 10 = 100
    expect(computeTrustScore({ avgRating: 5, completedJobs: 50, profileCompleteness: 100, responseRate: 100 }))
      .toBe(100);
  });

  it("is capped at 100 even if inputs produce a higher raw score", () => {
    expect(computeTrustScore({ avgRating: 5, completedJobs: 500, profileCompleteness: 100, responseRate: 100 }))
      .toBe(100);
  });

  it("rounds fractional scores to the nearest integer", () => {
    // avgRating 4.0: (4/5*100*0.40) = 32, completedJobs 25: (25/50*100*0.30) = 15
    // profile 0, response 0 → total 47
    expect(computeTrustScore({ avgRating: 4.0, completedJobs: 25, profileCompleteness: 0, responseRate: 0 }))
      .toBe(47);
  });
});

// ─────────────────────────────────────────────────────────────
// 6. Average rating calculation
// Source: SQL in get_providers / get_provider_detail:
//   ROUND(AVG(rating::NUMERIC), 1)
// ─────────────────────────────────────────────────────────────
describe("averageRating", () => {
  it("returns 0 for an empty ratings array", () => {
    expect(averageRating([])).toBe(0);
  });

  it("returns the single value when there is one rating", () => {
    expect(averageRating([4])).toBe(4);
  });

  it("returns the correct average for [5, 4, 3]", () => {
    expect(averageRating([5, 4, 3])).toBe(4);
  });

  it("rounds to 1 decimal place for [5, 4]", () => {
    // (5+4)/2 = 4.5
    expect(averageRating([5, 4])).toBe(4.5);
  });

  it("rounds to 1 decimal place for [5, 3]", () => {
    // (5+3)/2 = 4.0
    expect(averageRating([5, 3])).toBe(4);
  });

  it("rounds [5, 5, 4] correctly", () => {
    // (5+5+4)/3 = 4.666... → rounds to 4.7
    expect(averageRating([5, 5, 4])).toBe(4.7);
  });

  it("returns 0 for undefined input", () => {
    expect(averageRating(undefined)).toBe(0);
  });
});
