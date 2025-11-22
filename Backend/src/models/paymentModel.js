import pool from "../config/db.js";

const Payment = {
  async create(booking_id, amount, payment_status) {
    const res = await pool.query(
      `INSERT INTO payments (booking_id, amount, payment_status)
       VALUES ($1, $2, $3) RETURNING *`,
      [booking_id, amount, payment_status]
    );
    return res.rows[0];
  },

  async getByBooking(booking_id) {
    const res = await pool.query(
      `SELECT * FROM payments WHERE booking_id = $1`,
      [booking_id]
    );
    return res.rows;
  },
};

export default Payment;
