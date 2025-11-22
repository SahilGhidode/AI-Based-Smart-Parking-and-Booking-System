import pool from "../config/db.js";

const ParkingSlot = {
  // Create slot
  create: async (space_id, floor_id, slot_number, is_occupied = false) => {
    const { rows } = await pool.query(
      `INSERT INTO parking_slots (space_id, floor_id, spot_number, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [space_id, floor_id, slot_number, is_occupied ? "occupied" : "empty"]
    );
    return rows[0];
  },

  // Get all slots for a floor
  getByFloor: async (floor_id) => {
    const { rows } = await pool.query(
      `SELECT * FROM parking_slots
       WHERE floor_id = $1
       ORDER BY spot_number ASC`,
      [floor_id]
    );
    return rows;
  },

  // Update status (Real-time update support)
  updateStatus: async (slot_id, status) => {
    const { rows } = await pool.query(
      `UPDATE parking_slots
       SET status = $1, last_updated = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, slot_id]
    );
    return rows[0];
  },
};

export default ParkingSlot;
