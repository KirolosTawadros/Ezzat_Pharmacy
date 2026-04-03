const express = require('express');
const router = express.Router();
const db = require('../db');

// ─── GET /api/categories ──────────────────────────────────────────────────────
router.get('/categories', (req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM categories ORDER BY name').all();
    res.json({ categories });
  } catch (err) {
    console.error('Get categories error:', err);
    res.status(500).json({ error: 'حدث خطأ في الخادم.' });
  }
});

// ─── GET /api/products ────────────────────────────────────────────────────────
// Query params: ?page=1&limit=12&category=1&search=جهاز
router.get('/', (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 12);
    const offset = (page - 1) * limit;
    const categoryId = req.query.category ? parseInt(req.query.category) : null;
    const search = req.query.search ? `%${req.query.search}%` : null;

    let whereClause = 'WHERE p.is_active = 1';
    const params = [];

    if (categoryId) {
      whereClause += ' AND p.category_id = ?';
      params.push(categoryId);
    }
    if (search) {
      whereClause += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(search, search);
    }

    const countStmt = db.prepare(`SELECT COUNT(*) as total FROM products p ${whereClause}`);
    const { total } = countStmt.get(...params);

    const products = db.prepare(`
      SELECT p.*, c.name as category_name, c.icon as category_icon
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY p.id DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    res.json({
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ error: 'حدث خطأ في الخادم.' });
  }
});

// ─── GET /api/products/:id ────────────────────────────────────────────────────
router.get('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'معرف المنتج غير صالح.' });

    const product = db.prepare(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ? AND p.is_active = 1
    `).get(id);

    if (!product) return res.status(404).json({ error: 'المنتج غير موجود.' });
    res.json({ product });
  } catch (err) {
    console.error('Get product error:', err);
    res.status(500).json({ error: 'حدث خطأ في الخادم.' });
  }
});

module.exports = router;
