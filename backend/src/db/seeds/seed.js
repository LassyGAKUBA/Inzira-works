// Seed script — uses direct pg pool to insert into auth.users (bypasses
// Supabase Auth Admin API which has project-level restrictions).
// The handle_new_user trigger then auto-creates public.users rows.

import pool, { getClient } from "../../config/db.js";
import { createClient } from "@supabase/supabase-js";
import { env } from "../../config/env.js";

const supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const USERS = [
  { email: "admin@inzira.works",   password: "Password123", full_name: "Platform Admin",  phone: "0780000000", role: "admin"    },
  { email: "jean@example.com",     password: "Password123", full_name: "Niyomugaba Jean", phone: "0781111111", role: "customer" },
  { email: "eric@example.com",     password: "Password123", full_name: "Habimana Eric",   phone: "0785555555", role: "customer" },
  { email: "clarisse@example.com", password: "Password123", full_name: "Uwase Clarisse",  phone: "0782222222", role: "provider" },
  { email: "diane@example.com",    password: "Password123", full_name: "Mukamana Diane",  phone: "0783333333", role: "provider" },
  { email: "alice@example.com",    password: "Password123", full_name: "Ingabire Alice",  phone: "0784444444", role: "provider" },
];

// Insert auth users directly into auth.users via pg pool.
// pgcrypto's crypt() creates a bcrypt hash compatible with Supabase Auth.
async function createAuthUsers(client) {
  const ids = {};
  for (const u of USERS) {
    const meta = JSON.stringify({ full_name: u.full_name, phone: u.phone, role: u.role });
    const { rows } = await client.query(
      `INSERT INTO auth.users (
         instance_id, id, aud, role, email, encrypted_password,
         email_confirmed_at, raw_user_meta_data, raw_app_meta_data,
         created_at, updated_at,
         confirmation_token, email_change, email_change_token_new, recovery_token
       ) VALUES (
         '00000000-0000-0000-0000-000000000000',
         gen_random_uuid(),
         'authenticated', 'authenticated',
         $1,
         crypt($2, gen_salt('bf')),
         now(), $3::jsonb,
         '{"provider":"email","providers":["email"]}'::jsonb,
         now(), now(), '', '', '', ''
       )
       RETURNING id`,
      [u.email, u.password, meta]
    );
    if (rows[0]) {
      ids[u.email] = rows[0].id;
      console.log(`  ✓  ${u.email}  (${u.role})`);
    } else {
      console.warn(`  ⚠  ${u.email}: already exists, skipping`);
      // Fetch existing id
      const { rows: ex } = await client.query(`SELECT id FROM auth.users WHERE email = $1`, [u.email]);
      if (ex[0]) ids[u.email] = ex[0].id;
    }
  }
  return ids;
}

async function seedProviderData(ids) {
  const claisseId = ids["clarisse@example.com"];
  const dianeId   = ids["diane@example.com"];
  const aliceId   = ids["alice@example.com"];
  const jeanId    = ids["jean@example.com"];
  const ericId    = ids["eric@example.com"];

  const { data: cats } = await supabase.from("categories").insert([
    { name: "Tailoring & Fashion", slug: "tailoring",  icon: "scissors", is_active: true },
    { name: "Hair & Beauty",       slug: "hair",        icon: "comb",     is_active: true },
    { name: "Handcraft & Weaving", slug: "handcraft",   icon: "basket",   is_active: true },
    { name: "Catering & Food",     slug: "catering",    icon: "utensils", is_active: true },
  ]).select();
  const catMap = Object.fromEntries((cats || []).map((c) => [c.slug, c.id]));

  const { data: profiles, error: ppErr } = await supabase.from("provider_profiles").insert([
    {
      user_id: claisseId, headline: "Tailor & Fashion Designer",
      bio: "Experienced tailor based in Gasabo specialising in dresses, uniforms, and alterations, with a focus on traditional Rwandan attire and wedding wear.",
      district: "Gasabo", avg_response_minutes: 60, response_rate: 95,
      repeat_rate: 78, verification_status: "verified",
      profile_completeness: 85, trust_score: 94,
    },
    {
      user_id: dianeId, headline: "Professional Hairdresser",
      bio: "Hairdresser with 5+ years of experience specialising in braiding, natural hair care, and styling. Works from a home salon in Niboye.",
      district: "Kicukiro", avg_response_minutes: 90, response_rate: 90,
      repeat_rate: 70, verification_status: "verified",
      profile_completeness: 80, trust_score: 88,
    },
    {
      user_id: aliceId, headline: "Handcraft & Basket Weaving",
      bio: "Handcraft artisan creating agaseke peace baskets and sisal crafts made to export quality using traditional Rwandan techniques.",
      district: "Nyarugenge", avg_response_minutes: 120, response_rate: 88,
      repeat_rate: 65, verification_status: "verified",
      profile_completeness: 82, trust_score: 91,
    },
  ]).select();

  if (ppErr) { console.error("provider_profiles error:", ppErr.message); return; }
  const [clarissePP, dianePP, alicePP] = profiles;

  await supabase.from("provider_categories").insert([
    { provider_id: clarissePP.id, category_id: catMap["tailoring"] },
    { provider_id: dianePP.id,   category_id: catMap["hair"]      },
    { provider_id: alicePP.id,   category_id: catMap["handcraft"] },
  ]);

  await supabase.from("provider_specialties").insert([
    { provider_id: clarissePP.id, label: "Dresses"       },
    { provider_id: clarissePP.id, label: "Uniforms"      },
    { provider_id: clarissePP.id, label: "Alterations"   },
    { provider_id: dianePP.id,   label: "Braiding"       },
    { provider_id: dianePP.id,   label: "Natural Hair"   },
    { provider_id: dianePP.id,   label: "Styling"        },
    { provider_id: alicePP.id,   label: "Agaseke"        },
    { provider_id: alicePP.id,   label: "Sisal Crafts"   },
    { provider_id: alicePP.id,   label: "Export Quality" },
  ]);

  await supabase.from("services").insert([
    { provider_id: clarissePP.id, category_id: catMap["tailoring"], title: "Dress Alteration",        description: "Hemming, resizing, and repairs",       price: 10000,  price_type: "starting" },
    { provider_id: clarissePP.id, category_id: catMap["tailoring"], title: "Custom Wedding Dress",    description: "Bespoke bridal gown, made to measure",  price: 120000, price_type: "starting" },
    { provider_id: clarissePP.id, category_id: catMap["tailoring"], title: "School Uniform (set)",    description: "Complete uniform set",                  price: 8000,   price_type: "fixed"    },
    { provider_id: dianePP.id,   category_id: catMap["hair"],       title: "Box Braids",              description: "Knotless or classic box braids",        price: 12000,  price_type: "starting" },
    { provider_id: dianePP.id,   category_id: catMap["hair"],       title: "Natural Hair Treatment",  description: "Deep conditioning and scalp care",      price: 5000,   price_type: "fixed"    },
    { provider_id: dianePP.id,   category_id: catMap["hair"],       title: "Bridal Hair Styling",     description: "Wedding and special-event styling",     price: 30000,  price_type: "starting" },
    { provider_id: alicePP.id,   category_id: catMap["handcraft"],  title: "Agaseke Peace Basket",    description: "Traditional handwoven basket",          price: 15000,  price_type: "starting" },
    { provider_id: alicePP.id,   category_id: catMap["handcraft"],  title: "Sisal Home Decor Set",    description: "Decorative woven home pieces",          price: 25000,  price_type: "starting" },
    { provider_id: alicePP.id,   category_id: catMap["handcraft"],  title: "Export Bulk Order",       description: "Export-quality craft batches",          price: 50000,  price_type: "starting" },
  ]);

  await supabase.from("portfolio_items").insert([
    { provider_id: clarissePP.id, image_url: "/portfolio/clarisse-1.jpg", caption: "Wedding dress collection" },
    { provider_id: clarissePP.id, image_url: "/portfolio/clarisse-2.jpg", caption: "School uniforms batch"    },
    { provider_id: clarissePP.id, image_url: "/portfolio/clarisse-3.jpg", caption: "Traditional imishanana"   },
    { provider_id: dianePP.id,   image_url: "/portfolio/diane-1.jpg",    caption: "Box braids styles"         },
    { provider_id: dianePP.id,   image_url: "/portfolio/diane-2.jpg",    caption: "Bridal hair"               },
    { provider_id: alicePP.id,   image_url: "/portfolio/alice-1.jpg",    caption: "Agaseke baskets"           },
    { provider_id: alicePP.id,   image_url: "/portfolio/alice-2.jpg",    caption: "Sisal crafts"              },
  ]);

  const { data: bookings } = await supabase.from("bookings").insert([
    { customer_id: jeanId, provider_id: claisseId, title: "Traditional Dress",       status: "completed", scheduled_date: "2026-03-10", amount: 45000,  responded_at: new Date().toISOString() },
    { customer_id: ericId, provider_id: claisseId, title: "Office Suit",             status: "completed", scheduled_date: "2026-02-28", amount: 60000,  responded_at: new Date().toISOString() },
    { customer_id: jeanId, provider_id: claisseId, title: "School Uniforms",         status: "completed", scheduled_date: "2026-02-15", amount: 32000,  responded_at: new Date().toISOString() },
    { customer_id: ericId, provider_id: dianeId,   title: "Box Braids",              status: "completed", scheduled_date: "2026-03-05", amount: 14000,  responded_at: new Date().toISOString() },
    { customer_id: jeanId, provider_id: aliceId,   title: "Agaseke Baskets",         status: "completed", scheduled_date: "2026-02-20", amount: 30000,  responded_at: new Date().toISOString() },
    { customer_id: jeanId, provider_id: claisseId, title: "Wedding Dress (pending)", status: "pending",   scheduled_date: "2026-07-14", amount: 120000 },
  ]).select();

  if (!bookings?.length) return;
  const [b1, b2, b3, b4, b5] = bookings;

  await supabase.from("reviews").insert([
    { booking_id: b1.id, customer_id: jeanId, provider_id: claisseId, rating: 5, comment: "The dress she made was perfect — delivered on time and exactly as described.",      moderation_status: "approved" },
    { booking_id: b2.id, customer_id: ericId, provider_id: claisseId, rating: 5, comment: "Professional, punctual, and great attention to detail. Highly recommended.",       moderation_status: "approved" },
    { booking_id: b3.id, customer_id: jeanId, provider_id: claisseId, rating: 4, comment: "Beautiful uniforms. Slight delay on delivery but the quality made up for it.",     moderation_status: "approved" },
    { booking_id: b4.id, customer_id: ericId, provider_id: dianeId,   rating: 5, comment: "My braids came out amazing and lasted for weeks. Will definitely book again.",     moderation_status: "approved" },
    { booking_id: b5.id, customer_id: jeanId, provider_id: aliceId,   rating: 5, comment: "Stunning agaseke baskets — exactly what I wanted for gifts. True craftsmanship.", moderation_status: "approved" },
  ]);

  await supabase.from("saved_providers").insert([
    { customer_id: jeanId, provider_id: claisseId },
    { customer_id: jeanId, provider_id: dianeId   },
    { customer_id: jeanId, provider_id: aliceId   },
  ]);
}

async function main() {
  console.log("🌱 Seeding Supabase...\n");

  const client = await getClient();
  try {
    // Clear existing data
    await client.query("TRUNCATE auth.users CASCADE");

    console.log("Creating auth users (direct SQL)...");
    const ids = await createAuthUsers(client);

    // Wait for handle_new_user trigger to create public.users rows
    await new Promise((r) => setTimeout(r, 1500));

    console.log("\nInserting provider data...");
    await seedProviderData(ids);

    console.log("\n✅ Seed complete.");
    console.log("   Login with any of these (password: Password123):");
    for (const u of USERS) {
      console.log(`   • ${u.email.padEnd(26)} (${u.role})`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
