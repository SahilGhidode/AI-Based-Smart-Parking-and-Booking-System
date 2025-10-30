// src/testInsert.js
import pool from "./config/db.js";

async function testInsert() {
  try {
    // Create a table (only once)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(200) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Table 'users' is ready!");

    // Insert sample data
    const insertResult = await pool.query(
      `INSERT INTO users (username, email, password)
       VALUES ($1, $2, $3)
       RETURNING *;`,
      ["TestUser", "test@example.com", "hashedpassword123"]
    );

    console.log("✅ Inserted user:", insertResult.rows[0]);

    // Fetch all users
    const result = await pool.query("SELECT * FROM users;");
    console.log("📋 All Users:");
    console.table(result.rows);
  } catch (err) {
    console.error("❌ Error inserting/fetching data:", err);
  } finally {
    pool.end(); // close connection
  }
}

testInsert();
