import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import pool from "../config/db.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function run() {
  const sql = readFileSync(join(__dirname, "schema.sql"), "utf-8");
  try {
    await pool.query(sql);
    console.log("✅ Schema applied successfully.");
  } catch (err) {
    console.error("❌ Failed to apply schema:", err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

run();
