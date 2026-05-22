const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User registration, login, and session management
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:     { type: string, example: 'Juan dela Cruz' }
 *               email:    { type: string, format: email, example: 'juan@example.com' }
 *               password: { type: string, minLength: 8, example: 'SecurePass1!' }
 *               role:     { type: string, enum: [student, admin], default: student }
 *     responses:
 *       201:
 *         description: Registration successful
 *       400:
 *         description: Email already taken
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, studentId, adminSecret } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, error: { code: 'EMAIL_TAKEN', message: 'Email already taken' } });
    }
    const role = (adminSecret && adminSecret === process.env.ADMIN_SECRET) ? 'admin' : 'student';
    const user = await User.create({ name, email, passwordHash: password, studentId, role });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
    res.status(201).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role, studentId: user.studentId } });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login and receive access token
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string, example: 'juan@example.com' }
 *               password: { type: string, example: 'SecurePass1!' }
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' } });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get currently authenticated user
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Current user data
 *       401:
 *         description: Not authenticated
 */
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, data: req.user });
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout and clear refresh token cookie
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out' });
});

module.exports = router;
