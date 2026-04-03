const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const db = require('../db');
const { JWT_SECRET, authenticate } = require('../middleware/auth');

// Rate limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { error: 'تجاوزت الحد الأقصى من المحاولات. يرجى المحاولة بعد 15 دقيقة.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Register ─────────────────────────────────────────────────────────────────
router.post('/register', authLimiter, [
  body('name').trim().notEmpty().withMessage('الاسم مطلوب').isLength({ min: 2, max: 100 }),
  body('phone').trim().notEmpty().withMessage('رقم الهاتف مطلوب').matches(/^[0-9]{10,15}$/).withMessage('رقم هاتف غير صالح'),
  body('password').isLength({ min: 6 }).withMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  body('address').trim().optional(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { name, phone, password, address } = req.body;

  try {
    // Check if phone already exists
    const existing = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone);
    if (existing) {
      return res.status(409).json({ error: 'رقم الهاتف مسجل مسبقاً.' });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const result = db.prepare(
      'INSERT INTO users (name, phone, address, password_hash, role) VALUES (?, ?, ?, ?, ?)'
    ).run(name, phone, address || '', password_hash, 'customer');

    const token = jwt.sign(
      { id: result.lastInsertRowid, name, phone, role: 'customer' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ message: 'تم التسجيل بنجاح.', user: { id: result.lastInsertRowid, name, phone, role: 'customer' } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'حدث خطأ في الخادم. يرجى المحاولة لاحقاً.' });
  }
});

// ─── Login ────────────────────────────────────────────────────────────────────
router.post('/login', authLimiter, [
  body('phone').trim().notEmpty().withMessage('رقم الهاتف مطلوب'),
  body('password').notEmpty().withMessage('كلمة المرور مطلوبة'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { phone, password } = req.body;

  try {
    const user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);
    if (!user) {
      return res.status(401).json({ error: 'رقم الهاتف أو كلمة المرور غير صحيحة.' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'رقم الهاتف أو كلمة المرور غير صحيحة.' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, phone: user.phone, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ message: 'تم تسجيل الدخول بنجاح.', user: { id: user.id, name: user.name, phone: user.phone, role: user.role } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'حدث خطأ في الخادم.' });
  }
});

// ─── Logout ───────────────────────────────────────────────────────────────────
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'تم تسجيل الخروج بنجاح.' });
});

// ─── Get Current User ─────────────────────────────────────────────────────────
router.get('/me', authenticate, (req, res) => {
  const user = db.prepare('SELECT id, name, phone, address, role, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'المستخدم غير موجود.' });
  res.json({ user });
});

module.exports = router;
