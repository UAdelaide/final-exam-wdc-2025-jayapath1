const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

// Configure your MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'your_mysql_user',        // replace with your DB user
  password: 'your_mysql_password',// replace with your DB password
  database: 'DogWalkService',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// GET /api/dogs
router.get('/dogs', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT d.name AS dog_name, d.size, u.username AS owner_username
      FROM Dogs d
      JOIN Users u ON d.owner_id = u.user_id
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/walkrequests/open
router.get('/walkrequests/open', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT wr.request_id, d.name AS dog_name, wr.requested_time, wr.duration_minutes, wr.location, u.username AS owner_username
      FROM WalkRequests wr
      JOIN Dogs d ON wr.dog_id = d.dog_id
      JOIN Users u ON d.owner_id = u.user_id
      WHERE wr.status = 'open'
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/walkers/summary
router.get('/walkers/summary', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        u.username AS walker_username,
        COUNT(wr.rating) AS total_ratings,
        AVG(wr.rating) AS average_rating,
        COUNT(DISTINCT wr.request_id) AS completed_walks
      FROM Users u
      LEFT JOIN WalkRatings wr ON u.user_id = wr.walker_id
      WHERE u.role = 'walker'
      GROUP BY u.user_id
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;