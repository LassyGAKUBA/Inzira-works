import { query, getClient } from "../config/db.js";

/** Columns safe to send to the client (never the password hash). */
const PUBLIC_COLUMNS = `id, full_name, email, phone, role, district, avatar_url, is_active, created_at`;

export const findByEmail = async (email) => {
  const { rows } = await query(`SELECT * FROM users WHERE email = $1`, [email]);
  return rows[0] || null;
};

export const findById = async (id) => {
  const { rows } = await query(
    `SELECT ${PUBLIC_COLUMNS} FROM users WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
};

/**
 * Create a user. If the role is 'provider', also create an empty
 * provider_profiles row in the same transaction so the two never get
 * out of sync. Returns the public user record.
 */
export const createUser = async ({
  fullName,
  email,
  phone,
  passwordHash,
  role,
  district,
}) => {
  const client = await getClient();
  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      `INSERT INTO users (full_name, email, phone, password_hash, role, district)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING ${PUBLIC_COLUMNS}`,
      [fullName, email, phone, passwordHash, role, district || null]
    );
    const user = rows[0];

    if (role === "provider") {
      await client.query(
        `INSERT INTO provider_profiles (user_id, district) VALUES ($1, $2)`,
        [user.id, district || null]
      );
    }

    await client.query("COMMIT");
    return user;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};
