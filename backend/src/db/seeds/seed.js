import pool, { getClient } from "../../config/db.js";
import { hashPassword } from "../../utils/password.js";
 
/**
 * Seeds demo data that mirrors the frontend screens:
 *   - Categories: Tailoring, Hairdresser, Handcraft, Catering
 *   - Providers:  Uwase Clarisse (94), Mukamana Diane (88), Ingabire Alice (91)
 *                 each with specialties, services, and portfolio items
 *   - Customers:  Niyomugaba Jean, Habimana Eric
 *   - Admin:      admin@inzira.works
 *   - Bookings & reviews seen on the dashboards and profile pages
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
 
    // ── Customers ───────────────────────────────────────────
    const { rows: custRows } = await client.query(
      `INSERT INTO users (full_name, email, phone, password_hash, role, district)
       VALUES ($1,$2,$3,$4,'customer',$5) RETURNING id`,
      ["Niyomugaba Jean", "jean@example.com", "0781111111", pw, "Gasabo"]
    );
    const customerId = custRows[0].id;
 
    const { rows: cust2Rows } = await client.query(
      `INSERT INTO users (full_name, email, phone, password_hash, role, district)
       VALUES ($1,$2,$3,$4,'customer',$5) RETURNING id`,
      ["Habimana Eric", "eric@example.com", "0785555555", pw, "Kicukiro"]
    );
    const customer2Id = cust2Rows[0].id;
 
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
      const categoryId = catIds[p.categorySlug];
 
      await client.query(
        `INSERT INTO provider_categories (provider_id, category_id) VALUES ($1,$2)`,
        [profileId, categoryId]
      );
 
      for (const label of p.specialties) {
        await client.query(
          `INSERT INTO provider_specialties (provider_id, label) VALUES ($1,$2)`,
          [profileId, label]
        );
      }
 
      // Services
      for (const s of p.services || []) {
        await client.query(
          `INSERT INTO services (provider_id, category_id, title, description, price, price_type)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [profileId, categoryId, s.title, s.description, s.price, s.priceType]
        );
      }
 
      // Portfolio
      for (const item of p.portfolio || []) {
        await client.query(
          `INSERT INTO portfolio_items (provider_id, image_url, caption)
           VALUES ($1,$2,$3)`,
          [profileId, item.imageUrl, item.caption]
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
      bio: "Experienced tailor based in Gasabo specializing in dresses, uniforms, and alterations, with a focus on traditional Rwandan attire and wedding wear. Known for attention to detail and on-time delivery.",
      categorySlug: "tailoring",
      specialties: ["Dresses", "Uniforms", "Alterations"],
      avgResponseMinutes: 60,
      responseRate: 95,
      repeatRate: 78,
      verificationStatus: "verified",
      profileCompleteness: 85,
      trustScore: 94,
      services: [
        { title: "Dress Alteration", description: "Hemming, resizing, and repairs", price: 10000, priceType: "starting" },
        { title: "Custom Wedding Dress", description: "Bespoke bridal gown, made to measure", price: 120000, priceType: "starting" },
        { title: "School Uniform (per set)", description: "Complete uniform set", price: 8000, priceType: "fixed" },
      ],
      portfolio: [
        { imageUrl: "/portfolio/clarisse-1.jpg", caption: "Wedding dress collection" },
        { imageUrl: "/portfolio/clarisse-2.jpg", caption: "School uniforms batch" },
        { imageUrl: "/portfolio/clarisse-3.jpg", caption: "Traditional imishanana" },
      ],
    });
 
    const diane = await createProvider({
      fullName: "Mukamana Diane",
      email: "diane@example.com",
      phone: "0783333333",
      district: "Kicukiro",
      headline: "Professional Hairdresser",
      bio: "Hairdresser with 5+ years of experience specializing in braiding, natural hair care, and styling. Works from a home salon in Niboye and offers mobile services for weddings and events.",
      categorySlug: "hairdresser",
      specialties: ["Braiding", "Natural Hair", "Styling"],
      avgResponseMinutes: 90,
      responseRate: 90,
      repeatRate: 70,
      verificationStatus: "verified",
      profileCompleteness: 80,
      trustScore: 88,
      services: [
        { title: "Box Braids", description: "Knotless or classic box braids", price: 12000, priceType: "starting" },
        { title: "Natural Hair Treatment", description: "Deep conditioning and scalp care", price: 5000, priceType: "fixed" },
        { title: "Bridal Hair Styling", description: "Wedding and special-event styling", price: 30000, priceType: "starting" },
      ],
      portfolio: [
        { imageUrl: "/portfolio/diane-1.jpg", caption: "Box braids styles" },
        { imageUrl: "/portfolio/diane-2.jpg", caption: "Bridal hair" },
        { imageUrl: "/portfolio/diane-3.jpg", caption: "Natural hair care" },
      ],
    });
 
    const alice = await createProvider({
      fullName: "Ingabire Alice",
      email: "alice@example.com",
      phone: "0784444444",
      district: "Nyarugenge",
      headline: "Handcraft & Basket Weaving",
      bio: "Handcraft artisan creating agaseke peace baskets and sisal crafts made to export quality. Each piece is handwoven using traditional Rwandan techniques.",
      categorySlug: "handcraft",
      specialties: ["Agaseke", "Sisal Crafts", "Export Quality"],
      avgResponseMinutes: 120,
      responseRate: 88,
      repeatRate: 65,
      verificationStatus: "verified",
      profileCompleteness: 82,
      trustScore: 91,
      services: [
        { title: "Agaseke Peace Basket", description: "Traditional handwoven basket", price: 15000, priceType: "starting" },
        { title: "Sisal Home Decor Set", description: "Decorative woven home pieces", price: 25000, priceType: "starting" },
        { title: "Export Bulk Order", description: "Export-quality craft batches", price: 50000, priceType: "starting" },
      ],
      portfolio: [
        { imageUrl: "/portfolio/alice-1.jpg", caption: "Agaseke baskets" },
        { imageUrl: "/portfolio/alice-2.jpg", caption: "Sisal crafts" },
        { imageUrl: "/portfolio/alice-3.jpg", caption: "Export collection" },
      ],
    });
 
    // ── A pending booking (mirrors provider + customer dashboards) ─
    await client.query(
      `INSERT INTO bookings (customer_id, provider_id, title, status, scheduled_date, amount)
       VALUES ($1,$2,$3,'pending','2026-06-14', 30000)`,
      [customerId, clarisse.userId, "Wedding Dress Alteration"]
    );
 
    // ── Completed bookings + reviews ────────────────────────
    // Each review needs a completed booking to attach to.
    async function addReview({ customerId, providerUserId, title, amount, date, rating, comment }) {
      const { rows } = await client.query(
        `INSERT INTO bookings (customer_id, provider_id, title, status, scheduled_date, amount, responded_at)
         VALUES ($1,$2,$3,'completed',$4,$5, now()) RETURNING id`,
        [customerId, providerUserId, title, date, amount]
      );
      await client.query(
        `INSERT INTO reviews (booking_id, customer_id, provider_id, rating, comment)
         VALUES ($1,$2,$3,$4,$5)`,
        [rows[0].id, customerId, providerUserId, rating, comment]
      );
    }
 
    // Clarisse — 3 reviews from 2 customers
    await addReview({
      customerId, providerUserId: clarisse.userId,
      title: "Traditional Dress", amount: 45000, date: "2026-06-10",
      rating: 5, comment: "The dress she made was perfect — exactly as described and delivered on time.",
    });
    await addReview({
      customerId: customer2Id, providerUserId: clarisse.userId,
      title: "Office Suit", amount: 60000, date: "2026-05-28",
      rating: 5, comment: "Professional, punctual, and great attention to detail. Highly recommended.",
    });
    await addReview({
      customerId, providerUserId: clarisse.userId,
      title: "School Uniforms", amount: 32000, date: "2026-05-15",
      rating: 4, comment: "Beautiful uniforms. Slight delay on delivery but the quality made up for it.",
    });
 
    // Diane — 1 review
    await addReview({
      customerId: customer2Id, providerUserId: diane.userId,
      title: "Box Braids", amount: 14000, date: "2026-06-05",
      rating: 5, comment: "My braids came out amazing and lasted for weeks. Will book again.",
    });
 
    // Alice — 1 review
    await addReview({
      customerId, providerUserId: alice.userId,
      title: "Agaseke Baskets", amount: 30000, date: "2026-05-30",
      rating: 5, comment: "Stunning agaseke baskets, exactly what I wanted for gifts. True craftsmanship.",
    });
 
    // ── Saved providers (customer dashboard bookmarks) ──────
    for (const prov of [clarisse, diane, alice]) {
      await client.query(
        `INSERT INTO saved_providers (customer_id, provider_id) VALUES ($1,$2)`,
        [customerId, prov.userId]
      );
    }
 
    await client.query("COMMIT");
    console.log(" Seed complete.");
    console.log("   Login with any of these (password: Password123):");
    console.log("   • admin@inzira.works     (admin)");
    console.log("   • jean@example.com       (customer)");
    console.log("   • eric@example.com       (customer)");
    console.log("   • clarisse@example.com   (provider, trust 94)");
    console.log("   • diane@example.com      (provider, trust 88)");
    console.log("   • alice@example.com      (provider, trust 91)");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(" Seed failed:", err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}
 
seed();