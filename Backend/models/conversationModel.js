const pool = require('../config/db');

module.exports = {
  pool,
  async create(userId, role, message) {
    const query = 'INSERT INTO conversations (userId, role, message) VALUES ($1, $2, $3) RETURNING *';
    const values = [userId, role, message];
    const res = await pool.query(query, values);
    return res.rows[0];
  },
  async findByUserId(userId) {
    const query = 'SELECT * FROM conversations WHERE userId = $1 ORDER BY createdAt ASC';
    const res = await pool.query(query, [userId]);
    return res.rows;
  },
};