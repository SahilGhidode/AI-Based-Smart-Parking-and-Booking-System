import pool from "../config/db.js";

const Vehicle = {
  async create(userId, vehicle_number, vehicle_type) {
    const result = await pool.query(
      `INSERT INTO vehicles (user_id, vehicle_number, vehicle_type)
       VALUES ($1, $2, $3) RETURNING *`,
      [userId, vehicle_number, vehicle_type]
    );
    return result.rows[0];
  },

  async getByUser(userId) {
    const result = await pool.query(
      `SELECT * FROM vehicles WHERE user_id = $1`,
      [userId]
    );
    return result.rows;
  },
};

export default Vehicle;