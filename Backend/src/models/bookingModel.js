import pool from "../config/db.js";

const Booking = {
  async create(user_id, spot_id, start_time, end_time, status = "active") {
    const res = await pool.query(
      `INSERT INTO bookings (user_id, spot_id, start_time, end_time, status)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [user_id, spot_id, start_time, end_time, status]
    );
    return res.rows[0];
  },

  async getByUser(user_id) {
    const res = await pool.query(
      `SELECT * FROM bookings WHERE user_id = $1`,
      [user_id]
    );
    return res.rows;
  },
};

export default Booking;
