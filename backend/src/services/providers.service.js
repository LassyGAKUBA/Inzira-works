// src/services/providers.service.js
// Read-side logic for browsing providers.
// Returns a list of provider cards for the public browse page.

import { query } from "../config/db.js";

export const listProviders = async () => {
  const sql = `
    SELECT
      pp.id                        AS provider_id,
      u.id                         AS user_id,
      u.full_name,
      u.avatar_url,
      pp.headline,
      pp.district,
      pp.trust_score,
      pp.verification_status,
      COALESCE(r.avg_rating, 0)    AS avg_rating,
      COALESCE(r.review_count, 0)  AS review_count,
      COALESCE(s.specialties, '{}') AS specialties
    FROM provider_profiles pp
    JOIN users u ON u.id = pp.user_id
    LEFT JOIN (
      SELECT provider_id,
             ROUND(AVG(rating), 1) AS avg_rating,
             COUNT(*)              AS review_count
      FROM reviews
      WHERE moderation_status = 'approved'
      GROUP BY provider_id
    ) r ON r.provider_id = u.id
    LEFT JOIN (
      SELECT provider_id,
             ARRAY_AGG(label) AS specialties
      FROM provider_specialties
      GROUP BY provider_id
    ) s ON s.provider_id = pp.id
    WHERE u.is_active = TRUE
    ORDER BY pp.trust_score DESC;
  `;

  const { rows } = await query(sql);
  return rows;
};

/**
 * Fetch one provider's full detail by their provider_profiles.id.
 * Returns the profile + user fields, plus specialties, services,
 * portfolio, and reviews. Returns null if no such provider exists.
 *
 * Reminder on the two id meanings:
 *   - specialties / services / portfolio  → provider_profiles.id (pp.id)
 *   - reviews / completed bookings        → users.id            (u.id)
 */
export const getProviderById = async (providerId) => {
  // 1) Core profile + user, with aggregated rating, review count, completed jobs.
  const profileSql = `
    SELECT
      pp.id                        AS provider_id,
      u.id                         AS user_id,
      u.full_name,
      u.avatar_url,
      u.created_at                 AS member_since,
      pp.headline,
      pp.bio,
      pp.district,
      pp.cover_image_url,
      pp.avg_response_minutes,
      pp.response_rate,
      pp.repeat_rate,
      pp.profile_completeness,
      pp.trust_score,
      pp.verification_status,
      COALESCE(r.avg_rating, 0)    AS avg_rating,
      COALESCE(r.review_count, 0)  AS review_count,
      COALESCE(b.completed_jobs, 0) AS completed_jobs
    FROM provider_profiles pp
    JOIN users u ON u.id = pp.user_id
    LEFT JOIN (
      SELECT provider_id,
             ROUND(AVG(rating), 1) AS avg_rating,
             COUNT(*)              AS review_count
      FROM reviews
      WHERE moderation_status = 'approved'
      GROUP BY provider_id
    ) r ON r.provider_id = u.id
    LEFT JOIN (
      SELECT provider_id, COUNT(*) AS completed_jobs
      FROM bookings
      WHERE status = 'completed'
      GROUP BY provider_id
    ) b ON b.provider_id = u.id
    WHERE pp.id = $1;
  `;

  const { rows } = await query(profileSql, [providerId]);
  const provider = rows[0];
  if (!provider) return null;

  // 2) Related lists, fetched separately to avoid row fan-out.
  const [specialties, services, portfolio, reviews] = await Promise.all([
    query(
      `SELECT label FROM provider_specialties WHERE provider_id = $1 ORDER BY label`,
      [provider.provider_id]
    ),
    query(
      `SELECT id, title, description, price, price_type
       FROM services
       WHERE provider_id = $1 AND is_active = TRUE
       ORDER BY created_at`,
      [provider.provider_id]
    ),
    query(
      `SELECT id, image_url, caption
       FROM portfolio_items
       WHERE provider_id = $1
       ORDER BY created_at`,
      [provider.provider_id]
    ),
    query(
      `SELECT rv.id, rv.rating, rv.comment, rv.created_at,
              cu.full_name AS customer_name
       FROM reviews rv
       JOIN users cu ON cu.id = rv.customer_id
       WHERE rv.provider_id = $1 AND rv.moderation_status = 'approved'
       ORDER BY rv.created_at DESC`,
      [provider.user_id]
    ),
  ]);

  return {
    ...provider,
    specialties: specialties.rows.map((s) => s.label),
    services: services.rows,
    portfolio: portfolio.rows,
    reviews: reviews.rows,
  };
};