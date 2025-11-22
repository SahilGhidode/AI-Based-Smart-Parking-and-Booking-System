import pool from "../config/db.js";

const ParkingSpace = {
  getAll: async () => {
    const { rows } = await pool.query("SELECT * FROM parking_spaces ORDER BY space_id");
    return rows;
  },

  getById: async (id) => {
    const { rows } = await pool.query(
      "SELECT * FROM parking_spaces WHERE space_id = $1",
      [id]
    );
    return rows[0];
  },

  create: async (data) => {
    const { name, address, latitude, longitude, number_of_floors } = data;

    const { rows } = await pool.query(
      `INSERT INTO parking_spaces 
       (name, address, latitude, longitude, number_of_floors) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, address, latitude, longitude, number_of_floors]
    );

    return rows[0];
  },
};

export default ParkingSpace;
