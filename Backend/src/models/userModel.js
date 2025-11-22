import pool from "../config/db.js";

// ✅ Create Normal User (Email + Password)
export const createUser = async (username, email, password, role = "user") => {
  const result = await pool.query(
    `INSERT INTO users (username, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [username, email, password, role]
  );
  return result.rows[0];
};

// ✅ Get user by Email
export const findUserByEmail = async (email) => {
  const result = await pool.query(
    `SELECT * FROM users WHERE email=$1`,
    [email]
  );
  return result.rows[0];
};

// ✅ Get user by Google ID
export const findUserByGoogleId = async (googleId) => {
  const result = await pool.query(
    `SELECT * FROM users WHERE google_id=$1`,
    [googleId]
  );
  return result.rows[0];
};

// ✅ Create Google User
export const createGoogleUser = async (username, email, googleId, avatar) => {
  const result = await pool.query(
    `INSERT INTO users (username, email, google_id, avatar, role)
     VALUES ($1, $2, $3, $4, 'user')
     RETURNING *`,
    [username, email, googleId, avatar]
  );
  return result.rows[0];
};

// ✅ Get user by ID (optional for protected routes)
export const findUserById = async (id) => {
  const result = await pool.query(
    `SELECT * FROM users WHERE id=$1`,
    [id]
  );
  return result.rows[0];
};
