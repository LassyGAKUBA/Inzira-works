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