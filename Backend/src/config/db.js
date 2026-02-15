// src/config/db.js
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER || "smart_user",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "smart_parking",
  password: process.env.DB_PASSWORD || "smart_password",
  port: process.env.DB_PORT || 5432,
  ssl: { rejectUnauthorized: false }
});

// ✅ Test connection
(async () => {
  try {
    const client = await pool.connect();
    console.log("✅ PostgreSQL Database connected successfully!");
    client.release();
  } catch (err) {
    console.error("❌ PostgreSQL connection error:", err.message);
  }
})();

export default pool;
