// Node.js built-in test runner (available Node 18+, stable in Node 20+)
// Run with: node --test src/__tests__/run_tests.mjs
// No external dependencies required.

import { describe, it } from "node:test";
import assert from "node:assert/strict";

// ─────────────────────────────────────────────────────────────
// PURE FUNCTIONS (inlined from source — identical logic)
// ─────────────────────────────────────────────────────────────

// Source: SignupPage.jsx PasswordStrength component (lines 50-58)
function passwordScore(password) {
  if (!password) return 0;
  let s = 0;
  if (password.length >= 8)             s++;
  if (/[A-Z]/.test(password))           s++;
  if (/[0-9]/.test(password))           s++;
  if (/[^A-Za-z0-9]/.test(password))   s++;
  return s;
}
const PASSWORD_LABELS = ["", "Weak", "Fair", "Good", "Strong"];

// Source: SignupPage.jsx validate() line 100
function isValidRwandanPhone(phone) {
  return /^(\+?250)?0?7[2-9]\d{7}$/.test((phone || "").replace(/\s/g, ""));
}

// Source: ProviderProfilePage.jsx openWhatsApp() lines 117-123
function normalisePhone(phone) {
  let n = (phone || "").replace(/\D/g, "");
  if (n.startsWith("0"))              n = "250" + n.slice(1);
  else if (n && !n.startsWith("250")) n = "250" + n;
  return n;
}

// Source: ProviderDashboard AnalyticsTab toLocaleString pattern
function formatRWF(amount) {
  return `RWF ${Number(amount).toLocaleString()}`;
}

// Source: supabase/trust_score_triggers.sql recalculate_provider_scores()
function computeTrustScore({ avgRating = 0, completedJobs = 0, profileCompleteness = 0, responseRate = 0 } = {}) {
  const ratingScore  = (avgRating  / 5.0) * 100.0;
  const bookingScore = Math.min(completedJobs / 50.0, 1.0) * 100.0;
  const raw =
    (ratingScore         * 0.40) +
    (bookingScore        * 0.30) +
    (profileCompleteness * 0.20) +
    (responseRate        * 0.10);
  return Math.min(Math.round(raw), 100);
}

// Source: SQL ROUND(AVG(rating::NUMERIC), 1) in get_providers / get_provider_detail
function averageRating(ratings = []) {
  if (!ratings || !ratings.length) return 0;
  const sum = ratings.reduce((acc, r) => acc + r, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
}

// ─────────────────────────────────────────────────────────────
// TEST SUITES
// ─────────────────────────────────────────────────────────────

describe("passwordScore", () => {
  it("returns 0 for empty string", () => {
    assert.equal(passwordScore(""), 0);
  });
  it("returns 0 for null", () => {
    assert.equal(passwordScore(null), 0);
  });
  it("returns 0 for undefined", () => {
    assert.equal(passwordScore(undefined), 0);
  });
  it("returns 1 (Weak) — length >= 8 only", () => {
    assert.equal(passwordScore("abcdefgh"), 1);
    assert.equal(PASSWORD_LABELS[1], "Weak");
  });
  it("returns 2 (Fair) — length + uppercase", () => {
    assert.equal(passwordScore("Abcdefgh"), 2);
    assert.equal(PASSWORD_LABELS[2], "Fair");
  });
  it("returns 3 (Good) — length + uppercase + digit", () => {
    assert.equal(passwordScore("Abcdefg1"), 3);
    assert.equal(PASSWORD_LABELS[3], "Good");
  });
  it("returns 4 (Strong) — all four criteria", () => {
    assert.equal(passwordScore("Abcdef1!"), 4);
    assert.equal(PASSWORD_LABELS[4], "Strong");
  });
  it("KNOWN ISSUE: short password 'A1!' scores 3 (Fair) not 0 — strength bar misleads user", () => {
    // The length check adds 0 points, but uppercase + digit + special each add 1.
    // "A1!" is only 3 chars yet the bar shows "Fair". The form validator (min 8 chars)
    // prevents submission, but the visual indicator is misleading before submit.
    assert.equal(passwordScore("A1!"), 3);  // actual behaviour — documented as a finding
  });
  it("caps at 4", () => {
    assert.equal(passwordScore("AAAAAAA1!aaa"), 4);
  });
  it("recognises @ as a special character", () => {
    assert.equal(passwordScore("Password@1"), 4);
  });
});

describe("isValidRwandanPhone", () => {
  // Valid formats
  it("accepts 0781234567 — standard local format", () => {
    assert.equal(isValidRwandanPhone("0781234567"), true);
  });
  it("accepts 250781234567 — country code without +", () => {
    assert.equal(isValidRwandanPhone("250781234567"), true);
  });
  it("accepts +250781234567 — E.164 format", () => {
    assert.equal(isValidRwandanPhone("+250781234567"), true);
  });
  it("accepts 781234567 — no leading 0 or country code", () => {
    assert.equal(isValidRwandanPhone("781234567"), true);
  });
  it("accepts numbers with spaces stripped", () => {
    assert.equal(isValidRwandanPhone("0781 234 567"), true);
  });
  it("accepts 072x prefix", () => {
    assert.equal(isValidRwandanPhone("0721234567"), true);
  });
  it("accepts 079x prefix", () => {
    assert.equal(isValidRwandanPhone("0791234567"), true);
  });
  // Invalid formats
  it("rejects 070x prefix — invalid Rwandan prefix", () => {
    assert.equal(isValidRwandanPhone("0701234567"), false);
  });
  it("rejects 071x prefix — invalid Rwandan prefix", () => {
    assert.equal(isValidRwandanPhone("0711234567"), false);
  });
  it("rejects too-short number", () => {
    assert.equal(isValidRwandanPhone("078123"), false);
  });
  it("rejects too-long number", () => {
    assert.equal(isValidRwandanPhone("078123456789"), false);
  });
  it("rejects empty string", () => {
    assert.equal(isValidRwandanPhone(""), false);
  });
  it("rejects null", () => {
    assert.equal(isValidRwandanPhone(null), false);
  });
  it("rejects non-numeric string", () => {
    assert.equal(isValidRwandanPhone("notaphone"), false);
  });
  it("rejects a UK number", () => {
    assert.equal(isValidRwandanPhone("+447911123456"), false);
  });
});

describe("normalisePhone", () => {
  it("converts 0781234567 to 250781234567", () => {
    assert.equal(normalisePhone("0781234567"), "250781234567");
  });
  it("leaves 250781234567 unchanged", () => {
    assert.equal(normalisePhone("250781234567"), "250781234567");
  });
  it("strips + from +250781234567", () => {
    assert.equal(normalisePhone("+250781234567"), "250781234567");
  });
  it("converts 781234567 (no leading 0) to 250781234567", () => {
    assert.equal(normalisePhone("781234567"), "250781234567");
  });
  it("strips spaces and dashes before normalising", () => {
    assert.equal(normalisePhone("078 123-456 7"), "250781234567");
  });
  it("returns empty string for null", () => {
    assert.equal(normalisePhone(null), "");
  });
  it("returns empty string for empty string", () => {
    assert.equal(normalisePhone(""), "");
  });
});

describe("formatRWF", () => {
  it("formats 0 as RWF 0", () => {
    assert.equal(formatRWF(0), "RWF 0");
  });
  it("formats a string number", () => {
    const r = formatRWF("10000");
    assert.match(r, /^RWF /);
  });
  it("result starts with RWF prefix", () => {
    assert.match(formatRWF(50000), /^RWF /);
  });
});

describe("computeTrustScore", () => {
  it("returns 0 for a brand-new provider with no data", () => {
    assert.equal(computeTrustScore({ avgRating: 0, completedJobs: 0, profileCompleteness: 0, responseRate: 0 }), 0);
  });
  it("returns 0 when called with empty object (all default to 0)", () => {
    assert.equal(computeTrustScore({}), 0);
  });
  it("returns 40 for 5-star rating only (no other factors)", () => {
    // (5/5 * 100 * 0.40) = 40
    assert.equal(computeTrustScore({ avgRating: 5 }), 40);
  });
  it("returns 30 for 50 completed jobs only", () => {
    // min(50/50,1) * 100 * 0.30 = 30
    assert.equal(computeTrustScore({ completedJobs: 50 }), 30);
  });
  it("caps job score at 30 even for 100 completed jobs", () => {
    assert.equal(computeTrustScore({ completedJobs: 100 }), 30);
  });
  it("returns 20 for fully-complete profile only", () => {
    // 100 * 0.20 = 20
    assert.equal(computeTrustScore({ profileCompleteness: 100 }), 20);
  });
  it("returns 10 for 100% response rate only", () => {
    // 100 * 0.10 = 10
    assert.equal(computeTrustScore({ responseRate: 100 }), 10);
  });
  it("returns 76 for: 5-star + 10 jobs + full profile + 100% response", () => {
    // 40 + 6 + 20 + 10 = 76
    assert.equal(computeTrustScore({ avgRating: 5, completedJobs: 10, profileCompleteness: 100, responseRate: 100 }), 76);
  });
  it("returns 100 for a perfect provider (5-star, 50 jobs, full profile, 100% response)", () => {
    // 40 + 30 + 20 + 10 = 100
    assert.equal(computeTrustScore({ avgRating: 5, completedJobs: 50, profileCompleteness: 100, responseRate: 100 }), 100);
  });
  it("is capped at 100 even with extreme inputs", () => {
    assert.equal(computeTrustScore({ avgRating: 5, completedJobs: 500, profileCompleteness: 100, responseRate: 100 }), 100);
  });
  it("rounds correctly: 4-star + 25 jobs = 47", () => {
    // (4/5*100*0.40) + (25/50*100*0.30) = 32 + 15 = 47
    assert.equal(computeTrustScore({ avgRating: 4, completedJobs: 25 }), 47);
  });
});

describe("averageRating", () => {
  it("returns 0 for empty array", () => {
    assert.equal(averageRating([]), 0);
  });
  it("returns 0 for undefined input", () => {
    assert.equal(averageRating(undefined), 0);
  });
  it("returns single value unchanged", () => {
    assert.equal(averageRating([4]), 4);
  });
  it("[5,4,3] averages to 4.0", () => {
    assert.equal(averageRating([5, 4, 3]), 4);
  });
  it("[5,4] averages to 4.5", () => {
    assert.equal(averageRating([5, 4]), 4.5);
  });
  it("[5,5,4] rounds to 4.7", () => {
    // (5+5+4)/3 = 14/3 = 4.666... → 4.7
    assert.equal(averageRating([5, 5, 4]), 4.7);
  });
  it("[1,1,1,1,5] averages to 1.8", () => {
    // (1+1+1+1+5)/5 = 9/5 = 1.8
    assert.equal(averageRating([1, 1, 1, 1, 5]), 1.8);
  });
});
