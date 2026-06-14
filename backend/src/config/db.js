import pg from "pg";
import { env } from "./env.js";

const { Pool } = pg;

/**
 * Single shared connection pool for the whole app.
 * Uses DATABASE_URL if provided, otherwise falls back to discrete PG* vars.
 */
const pool = env.databaseUrl
  ? new Pool({ connectionString: env.databaseUrl })
  : new Pool({
      host: env.pg.host,
      port: env.pg.port,
      user: env.pg.user,
      password: env.pg.password,
      database: env.pg.database,
    });

pool.on("error", (err) => {
  console.error("Unexpected error on idle Postgres client", err);
  process.exit(1);
});

/**
 * Run a parameterized query.
 * Always pass values via the params array (never string-concatenate) to
 * stay safe from SQL injection.
 *
 *   const { rows } = await query("SELECT * FROM users WHERE id = $1", [id]);
 */
export const query = (text, params) => pool.query(text, params);

/**
 * Grab a client for a multi-statement transaction.
 * Caller is responsible for client.release().
 *
 *   const client = await getClient();
 *   try {
 *     await client.query("BEGIN");
 *     ...
 *     await client.query("COMMIT");
 *   } catch (e) {
 *     await client.query("ROLLBACK");
 *     throw e;
 *   } finally {
 *     client.release();
 *   }
 */
export const getClient = () => pool.connect();

export default pool;
