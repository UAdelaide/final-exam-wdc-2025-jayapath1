const express = require('express');
const path = require('path');
const session = require('express-session'); // ✅ Add this
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // ✅ To handle form POST data (from login form)

// ✅ Session middleware setup
app.use(session({
  secret: 'yourSecretKey', // Changed this to a secure key in production
  resave: false,
  saveUninitialized: false
}));

// Serve static files
app.use(express.static(path.join(__dirname, '/public')));

// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);
app.use('/', userRoutes); // ✅ Ensure /login POST can be accessed from the form

// Export the app instead of listening here
module.exports = app;
