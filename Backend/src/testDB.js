import pool from "./config/db.js";

try {
  const result = await pool.query("SELECT NOW()");
  console.log("✅ DB Test OK:", result.rows[0]);
  process.exit(0);
} catch (err) {
  console.error("❌ DB Test Failed:", err);
  process.exit(1);
}
