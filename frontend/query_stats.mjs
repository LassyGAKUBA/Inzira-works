// Platform statistics query script
// Run: node query_stats.mjs
// Uses the existing @supabase/supabase-js package already in node_modules.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL     = "https://yhuijpkpjpqbyvoyfwxu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlodWlqcGtwanBxYnl2b3lmd3h1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMDkxMjksImV4cCI6MjA5Nzg4NTEyOX0.bkNTEWchzbyYAL6kpLHMaC5fWEYWKMEE_eb219f7Sf0";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  console.log("=".repeat(60));
  console.log("INZIRA WORKS — LIVE DATABASE STATISTICS");
  console.log("Queried at:", new Date().toISOString());
  console.log("=".repeat(60));

  // ── 1. Users by role ──────────────────────────────────────
  console.log("\n[1] USERS BY ROLE");
  const { data: users, error: uErr } = await supabase
    .from("users")
    .select("id, role, created_at");
  if (uErr) { console.log("  ERROR:", uErr.message); }
  else {
    const byRole = users.reduce((acc, u) => {
      acc[u.role] = (acc[u.role] || 0) + 1;
      return acc;
    }, {});
    console.log("  Total users:", users.length);
    console.log("  By role:", JSON.stringify(byRole));
  }

  // ── 2. Providers by district ──────────────────────────────
  console.log("\n[2] PROVIDER PROFILES BY DISTRICT");
  const { data: profiles, error: pErr } = await supabase
    .from("provider_profiles")
    .select("id, district, verification_status, trust_score, profile_completeness, user_id");
  if (pErr) { console.log("  ERROR:", pErr.message); }
  else {
    const byDistrict = profiles.reduce((acc, p) => {
      const d = p.district || "Not set";
      acc[d] = (acc[d] || 0) + 1;
      return acc;
    }, {});
    const byVerif = profiles.reduce((acc, p) => {
      acc[p.verification_status] = (acc[p.verification_status] || 0) + 1;
      return acc;
    }, {});
    console.log("  Total provider profiles:", profiles.length);
    console.log("  By district:", JSON.stringify(byDistrict));
    console.log("  By verification status:", JSON.stringify(byVerif));
    // Trust score distribution
    const bands = { "0-20": 0, "21-40": 0, "41-60": 0, "61-80": 0, "81-100": 0 };
    const scores = profiles.map(p => Number(p.trust_score) || 0);
    scores.forEach(s => {
      if      (s <= 20) bands["0-20"]++;
      else if (s <= 40) bands["21-40"]++;
      else if (s <= 60) bands["41-60"]++;
      else if (s <= 80) bands["61-80"]++;
      else              bands["81-100"]++;
    });
    const min = scores.length ? Math.min(...scores) : 0;
    const max = scores.length ? Math.max(...scores) : 0;
    const mean = scores.length ? (scores.reduce((a,b) => a+b, 0) / scores.length) : 0;
    console.log("  Trust Score — min:", min, "max:", max, "mean:", mean.toFixed(1));
    console.log("  Trust Score bands:", JSON.stringify(bands));
    // Profile completeness
    const completeness = profiles.map(p => Number(p.profile_completeness) || 0);
    const avgComplete = completeness.length
      ? (completeness.reduce((a,b) => a+b, 0) / completeness.length).toFixed(1)
      : 0;
    console.log("  Avg profile completeness:", avgComplete + "%");
    console.log("  All completeness scores:", completeness.join(", "));
    console.log("  All trust scores:", scores.join(", "));
  }

  // ── 3. Providers by category ─────────────────────────────
  console.log("\n[3] PROVIDERS BY SERVICE CATEGORY");
  const { data: cats, error: cErr } = await supabase
    .from("provider_categories")
    .select("provider_id, categories(name)");
  if (cErr) { console.log("  ERROR:", cErr.message); }
  else {
    const byCat = cats.reduce((acc, c) => {
      const name = c.categories?.name || "Unknown";
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});
    console.log("  Provider-category assignments:", cats.length);
    console.log("  By category:", JSON.stringify(byCat));
  }

  // ── 4. Bookings by status ─────────────────────────────────
  console.log("\n[4] BOOKINGS BY STATUS");
  const { data: bookings, error: bErr } = await supabase
    .from("bookings")
    .select("id, status");
  if (bErr) { console.log("  ERROR:", bErr.message); }
  else if (!bookings || bookings.length === 0) {
    console.log("  Result: 0 rows returned (RLS blocks anonymous reads — anon key has no auth.uid())");
  } else {
    const byStatus = bookings.reduce((acc, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1;
      return acc;
    }, {});
    console.log("  Total bookings visible:", bookings.length);
    console.log("  By status:", JSON.stringify(byStatus));
  }

  // ── 5. Reviews and star distribution ──────────────────────
  console.log("\n[5] REVIEWS & STAR RATING DISTRIBUTION");
  const { data: reviews, error: rErr } = await supabase
    .from("reviews")
    .select("id, rating");
  if (rErr) { console.log("  ERROR:", rErr.message); }
  else {
    const byStar = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(r => { byStar[r.rating] = (byStar[r.rating] || 0) + 1; });
    const avgRating = reviews.length
      ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(2)
      : 0;
    console.log("  Total reviews:", reviews.length);
    console.log("  Average rating:", avgRating);
    console.log("  By star:", JSON.stringify(byStar));
  }

  // ── 6. Portfolio items ────────────────────────────────────
  console.log("\n[6] PORTFOLIO ITEMS");
  const { data: portfolio, error: ptErr } = await supabase
    .from("portfolio_items")
    .select("id, provider_id");
  if (ptErr) { console.log("  ERROR:", ptErr.message); }
  else {
    const providerCount = new Set(portfolio.map(p => p.provider_id)).size;
    console.log("  Total portfolio items:", portfolio.length);
    console.log("  Providers who have uploaded at least one item:", providerCount);
  }

  // ── 7. Services ───────────────────────────────────────────
  console.log("\n[7] SERVICES LISTED");
  const { data: services, error: sErr } = await supabase
    .from("services")
    .select("id, is_active, price");
  if (sErr) { console.log("  ERROR:", sErr.message); }
  else {
    const active = services.filter(s => s.is_active).length;
    const priced = services.filter(s => s.price !== null).length;
    console.log("  Total services:", services.length);
    console.log("  Active:", active, "/ Inactive:", services.length - active);
    console.log("  With price set:", priced, "/ Price not set:", services.length - priced);
  }

  // ── 8. Provider specialties ───────────────────────────────
  console.log("\n[8] PROVIDER SPECIALTIES (TAGS)");
  const { data: specs, error: spErr } = await supabase
    .from("provider_specialties")
    .select("label");
  if (spErr) { console.log("  ERROR:", spErr.message); }
  else {
    const byLabel = specs.reduce((acc, s) => {
      acc[s.label] = (acc[s.label] || 0) + 1;
      return acc;
    }, {});
    const sorted = Object.entries(byLabel).sort((a, b) => b[1] - a[1]).slice(0, 10);
    console.log("  Total specialty tags:", specs.length);
    console.log("  Top 10 tags:", JSON.stringify(Object.fromEntries(sorted)));
  }

  // ── 9. Saved providers ────────────────────────────────────
  console.log("\n[9] SAVED PROVIDERS");
  const { data: saved, error: svErr } = await supabase
    .from("saved_providers")
    .select("customer_id, provider_profile_id");
  if (svErr) { console.log("  ERROR:", svErr.message); }
  else {
    console.log("  Total saved-provider records:", saved.length);
  }

  console.log("\n" + "=".repeat(60));
  console.log("END OF STATISTICS");
  console.log("=".repeat(60));
}

run().catch(console.error);
