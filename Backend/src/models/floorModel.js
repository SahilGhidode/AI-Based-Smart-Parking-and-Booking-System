import pool from "../config/db.js";

const Floor = {
  getBySpaceId: async (space_id) => {
    const { rows } = await pool.query(
      "SELECT * FROM floors WHERE space_id = $1 ORDER BY floor_number",
      [space_id]
    );
    return rows;
  },
};

export default Floor;
