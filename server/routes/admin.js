const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin);

// ─── GET /api/admin/orders ────────────────────────────────────────────────────
router.get('/orders', (req, res) => {
  try {
    const status = req.query.status;
    let query = `
      SELECT o.*, u.name as customer_name, u.phone as customer_phone,
        GROUP_CONCAT(
          json_object(
            'product_name', p.name,
            'quantity', oi.quantity,
            'price_at_time', oi.price_at_time
          )
        ) as items_json
      FROM orders o
      JOIN users u ON u.id = o.user_id
      LEFT JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN products p ON p.id = oi.product_id
    `;
    const params = [];
    if (status) {
      query += ' WHERE o.status = ?';
      params.push(status);
    }
    query += ' GROUP BY o.id ORDER BY o.created_at DESC';

    const orders = db.prepare(query).all(...params);
    const result = orders.map(o => ({
      ...o,
      items: o.items_json ? JSON.parse(`[${o.items_json}]`) : [],
      items_json: undefined,
    }));

    res.json({ orders: result });
  } catch (err) {
    console.error('Admin get orders error:', err);
    res.status(500).json({ error: 'حدث خطأ في الخادم.' });
  }
});

// ─── PATCH /api/admin/orders/:id/status ──────────────────────────────────────
router.patch('/orders/:id/status', [
  body('status').isIn(['pending', 'confirmed', 'delivered', 'cancelled']).withMessage('حالة الطلب غير صالحة'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'معرف الطلب غير صالح.' });

    const result = db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(req.body.status, id);
    if (result.changes === 0) return res.status(404).json({ error: 'الطلب غير موجود.' });

    res.json({ message: 'تم تحديث حالة الطلب بنجاح.' });
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ error: 'حدث خطأ في الخادم.' });
  }
});

// ─── GET /api/admin/products ──────────────────────────────────────────────────
router.get('/products', (req, res) => {
  try {
    const products = db.prepare(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.id DESC
    `).all();
    res.json({ products });
  } catch (err) {
    res.status(500).json({ error: 'حدث خطأ في الخادم.' });
  }
});

// ─── POST /api/admin/products ─────────────────────────────────────────────────
router.post('/products', [
  body('name').trim().notEmpty().withMessage('اسم المنتج مطلوب'),
  body('price').isFloat({ min: 0 }).withMessage('السعر يجب أن يكون رقماً موجباً'),
  body('stock').isInt({ min: 0 }).withMessage('المخزون يجب أن يكون عدداً صحيحاً'),
  body('category_id').isInt({ min: 1 }).withMessage('الفئة مطلوبة'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  try {
    const { name, description, price, category_id, stock, image_icon } = req.body;
    const result = db.prepare(
      'INSERT INTO products (name, description, price, category_id, stock, image_icon) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(name, description || '', price, category_id, stock, image_icon || 'fa-solid fa-box-open');

    res.status(201).json({ message: 'تم إضافة المنتج بنجاح.', id: result.lastInsertRowid });
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ error: 'حدث خطأ في الخادم.' });
  }
});

// ─── PUT /api/admin/products/:id ──────────────────────────────────────────────
router.put('/products/:id', [
  body('name').trim().notEmpty().withMessage('اسم المنتج مطلوب'),
  body('price').isFloat({ min: 0 }).withMessage('السعر يجب أن يكون رقماً موجباً'),
  body('stock').isInt({ min: 0 }).withMessage('المخزون يجب أن يكون عدداً صحيحاً'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'معرف المنتج غير صالح.' });

    const { name, description, price, category_id, stock, image_icon, is_active } = req.body;
    const result = db.prepare(`
      UPDATE products SET name=?, description=?, price=?, category_id=?, stock=?, image_icon=?, is_active=?
      WHERE id=?
    `).run(name, description || '', price, category_id, stock, image_icon || 'fa-solid fa-box-open', is_active !== undefined ? is_active : 1, id);

    if (result.changes === 0) return res.status(404).json({ error: 'المنتج غير موجود.' });
    res.json({ message: 'تم تحديث المنتج بنجاح.' });
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ error: 'حدث خطأ في الخادم.' });
  }
});

// ─── GET /api/admin/stats ─────────────────────────────────────────────────────
router.get('/stats', (req, res) => {
  try {
    const totalOrders = db.prepare("SELECT COUNT(*) as count FROM orders").get().count;
    const pendingOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'").get().count;
    const totalRevenue = db.prepare("SELECT COALESCE(SUM(total), 0) as revenue FROM orders WHERE status != 'cancelled'").get().revenue;
    const totalProducts = db.prepare("SELECT COUNT(*) as count FROM products WHERE is_active = 1").get().count;
    const totalCustomers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'customer'").get().count;
    const lowStockProducts = db.prepare("SELECT * FROM products WHERE stock <= 5 AND is_active = 1").all();

    res.json({ totalOrders, pendingOrders, totalRevenue, totalProducts, totalCustomers, lowStockProducts });
  } catch (err) {
    res.status(500).json({ error: 'حدث خطأ في الخادم.' });
  }
});

module.exports = router;
