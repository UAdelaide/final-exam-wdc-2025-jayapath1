const express = require('express');
const router = express.Router();
const db = require('../models/db');

// GET all users (for admin/testing)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT user_id, username, email, role FROM Users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST a new user (simple signup)
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const [result] = await db.query(`
      INSERT INTO Users (username, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `, [username, email, password, role]);

    res.status(201).json({ message: 'User registered', user_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  res.json(req.session.user);
});

// POST login (updated version with session + redirect)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query(`
      SELECT user_id, username, role FROM Users
      WHERE email = ? AND password_hash = ?
    `, [email, password]);

    if (rows.length === 0) {
      return res.status(401).send('Invalid credentials');
    }

    const user = rows[0];

    // Save user info in session
    req.session.user = {
      id: user.user_id,
      username: user.username,
      role: user.role
    };

    // Redirect user based on role
    if (user.role === 'owner') {
      return res.redirect('/owner-dashboard.html');
    } else if (user.role === 'walker') {
      return res.redirect('/walker-dashboard.html');
    } else {
      return res.status(403).send('Unauthorized role');
    }

  } catch (error) {
    console.error(error);
    res.status(500).send('Login failed');
  }
});

// GET logout route
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('Logout failed');
    }

    // Clear the cookie and redirect to login form
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
});

module.exports = router;
