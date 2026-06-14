import pool, { getClient } from "../../config/db.js";
import { hashPassword } from "../../utils/password.js";

/**
 * Seeds demo data that mirrors the frontend screenshots:
 *   - Categories: Tailoring, Hairdresser, Handcraft, Catering
 *   - Providers:  Uwase Clarisse (94), Mukamana Diane (88), Ingabire Alice (91)
 *   - Customer:   Niyomugaba Jean
 *   - Admin:      admin@inzira.works
 *   - Bookings & reviews seen on the dashboards
 *
 * Every account password is: Password123
 */
async function seed() {
  const client = await getClient();
  try {
    await client.query("BEGIN");

    // Wipe existing rows (children first via CASCADE on users/categories)
    await client.query("TRUNCATE users, categories RESTART IDENTITY CASCADE");

    const pw = await hashPassword("Password123");

    // ── Categories ──────────────────────────────────────────
    const categories = [
      ["Tailoring", "tailoring", "scissors"],
      ["Hairdresser", "hairdresser", "comb"],
      ["Handcraft", "handcraft", "basket"],
      ["Catering", "catering", "utensils"],
    ];
    const catIds = {};
    for (const [name, slug, icon] of categories) {
      const { rows } = await client.query(
        `INSERT INTO categories (name, slug, icon) VALUES ($1,$2,$3) RETURNING id`,
        [name, slug, icon]
      );
      catIds[slug] = rows[0].id;
    }

    // ── Admin ───────────────────────────────────────────────
    await client.query(
      `INSERT INTO users (full_name, email, phone, password_hash, role)
       VALUES ($1,$2,$3,$4,'admin')`,
      ["Platform Admin", "admin@inzira.works", "0780000000", pw]
    );

    // ── Customer: Niyomugaba Jean ───────────────────────────
    const { rows: custRows } = await client.query(
      `INSERT INTO users (full_name, email, phone, password_hash, role, district)
       VALUES ($1,$2,$3,$4,'customer',$5) RETURNING id`,
      ["Niyomugaba Jean", "jean@example.com", "0781111111", pw, "Gasabo"]
    );
    const customerId = custRows[0].id;

    // ── Provider factory ────────────────────────────────────
    async function createProvider(p) {
      const { rows: uRows } = await client.query(
        `INSERT INTO users (full_name, email, phone, password_hash, role, district)
         VALUES ($1,$2,$3,$4,'provider',$5) RETURNING id`,
        [p.fullName, p.email, p.phone, pw, p.district]
      );
      const userId = uRows[0].id;

      const { rows: pRows } = await client.query(
        `INSERT INTO provider_profiles
           (user_id, headline, bio, district, avg_response_minutes,
            response_rate, repeat_rate, verification_status, verified_at,
            profile_completeness, trust_score)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8, now(), $9, $10)
         RETURNING id`,
        [
          userId, p.headline, p.bio, p.district, p.avgResponseMinutes,
          p.responseRate, p.repeatRate, p.verificationStatus,
          p.profileCompleteness, p.trustScore,
        ]
      );
      const profileId = pRows[0].id;

      await client.query(
        `INSERT INTO provider_categories (provider_id, category_id) VALUES ($1,$2)`,
        [profileId, catIds[p.categorySlug]]
      );

      for (const label of p.specialties) {
        await client.query(
          `INSERT INTO provider_specialties (provider_id, label) VALUES ($1,$2)`,
          [profileId, label]
        );
      }

      return { userId, profileId };
    }

    const clarisse = await createProvider({
      fullName: "Uwase Clarisse",
      email: "clarisse@example.com",
      phone: "0782222222",
      district: "Gasabo",
      headline: "Tailor & Fashion Designer",
      bio: "Experienced tailor specializing in dresses, uniforms, and alterations.",
      categorySlug: "tailoring",
      specialties: ["Dresses", "Uniforms", "Alterations"],
      avgResponseMinutes: 60,
      responseRate: 95,
      repeatRate: 78,
      verificationStatus: "verified",
      profileCompleteness: 85,
      trustScore: 94,
    });

    const diane = await createProvider({
      fullName: "Mukamana Diane",
      email: "diane@example.com",
      phone: "0783333333",
      district: "Kicukiro",
      headline: "Professional Hairdresser",
      bio: "Braiding, natural hair care, and styling.",
      categorySlug: "hairdresser",
      specialties: ["Braiding", "Natural Hair", "Styling"],
      avgResponseMinutes: 90,
      responseRate: 90,
      repeatRate: 70,
      verificationStatus: "verified",
      profileCompleteness: 80,
      trustScore: 88,
    });

    const alice = await createProvider({
      fullName: "Ingabire Alice",
      email: "alice@example.com",
      phone: "0784444444",
      district: "Nyarugenge",
      headline: "Handcraft & Basket Weaving",
      bio: "Agaseke and sisal crafts made for export quality.",
      categorySlug: "handcraft",
      specialties: ["Agaseke", "Sisal Crafts", "Export Quality"],
      avgResponseMinutes: 120,
      responseRate: 88,
      repeatRate: 65,
      verificationStatus: "verified",
      profileCompleteness: 82,
      trustScore: 91,
    });

    // ── Bookings (mirrors provider + customer dashboards) ───
    // Customer Jean ↔ Provider Clarisse: pending wedding dress alteration
    await client.query(
      `INSERT INTO bookings (customer_id, provider_id, title, status, scheduled_date, amount)
       VALUES ($1,$2,$3,'pending','2026-06-14', 30000)`,
      [customerId, clarisse.userId, "Wedding Dress Alteration"]
    );

    // A completed booking so reviews/ratings have something to attach to
    const { rows: doneRows } = await client.query(
      `INSERT INTO bookings (customer_id, provider_id, title, status, scheduled_date, amount, responded_at)
       VALUES ($1,$2,$3,'completed','2026-06-10', 45000, now()) RETURNING id`,
      [customerId, clarisse.userId, "Dress (Traditional)"]
    );

    await client.query(
      `INSERT INTO reviews (booking_id, customer_id, provider_id, rating, comment)
       VALUES ($1,$2,$3,5,$4)`,
      [
        doneRows[0].id, customerId, clarisse.userId,
        "Inzira Works helped me reach customers I never could before.",
      ]
    );

    // ── Saved providers (customer dashboard shows 5; seed a few) ─
    for (const prov of [clarisse, diane, alice]) {
      await client.query(
        `INSERT INTO saved_providers (customer_id, provider_id) VALUES ($1,$2)`,
        [customerId, prov.userId]
      );
    }

    await client.query("COMMIT");
    console.log("✅ Seed complete.");
    console.log("   Login with any of these (password: Password123):");
    console.log("   • admin@inzira.works     (admin)");
    console.log("   • jean@example.com       (customer)");
    console.log("   • clarisse@example.com   (provider, trust 94)");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Seed failed:", err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
