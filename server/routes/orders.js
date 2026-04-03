const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../db');
const { authenticate } = require('../middleware/auth');

// ─── GET /api/orders/my-orders ────────────────────────────────────────────────
router.get('/my-orders', authenticate, (req, res) => {
  try {
    const orders = db.prepare(`
      SELECT o.*, GROUP_CONCAT(
        json_object(
          'id', oi.id,
          'product_id', oi.product_id,
          'product_name', p.name,
          'quantity', oi.quantity,
          'price_at_time', oi.price_at_time
        )
      ) as items_json
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN products p ON p.id = oi.product_id
      WHERE o.user_id = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `).all(req.user.id);

    const result = orders.map(o => ({
      ...o,
      items: o.items_json ? JSON.parse(`[${o.items_json}]`) : [],
    }));
    delete result.items_json;

    res.json({ orders: result });
  } catch (err) {
    console.error('Get my-orders error:', err);
    res.status(500).json({ error: 'حدث خطأ في الخادم.' });
  }
});

// ─── POST /api/orders/checkout ────────────────────────────────────────────────
router.post('/checkout', authenticate, [
  body('delivery_address').trim().notEmpty().withMessage('عنوان التوصيل مطلوب'),
  body('items').isArray({ min: 1 }).withMessage('يجب أن تحتوي السلة على منتج واحد على الأقل'),
  body('items.*.product_id').isInt({ min: 1 }).withMessage('معرف المنتج غير صالح'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('الكمية يجب أن تكون أكبر من صفر'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { delivery_address, notes, items } = req.body;

  try {
    // Validate products and compute total
    let total = 0;
    const enrichedItems = [];

    for (const item of items) {
      const product = db.prepare('SELECT * FROM products WHERE id = ? AND is_active = 1').get(item.product_id);
      if (!product) {
        return res.status(400).json({ error: `المنتج رقم ${item.product_id} غير متاح.` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `الكمية المطلوبة من "${product.name}" أكبر من المخزون المتاح (${product.stock}).` });
      }
      total += product.price * item.quantity;
      enrichedItems.push({ ...item, price: product.price, name: product.name });
    }

    // Create order and items in a transaction
    const createOrder = db.transaction(() => {
      const orderResult = db.prepare(
        'INSERT INTO orders (user_id, total, status, delivery_address, notes) VALUES (?, ?, ?, ?, ?)'
      ).run(req.user.id, total, 'pending', delivery_address, notes || '');

      const orderId = orderResult.lastInsertRowid;
      const insertItem = db.prepare(
        'INSERT INTO order_items (order_id, product_id, quantity, price_at_time) VALUES (?, ?, ?, ?)'
      );
      const updateStock = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');

      for (const item of enrichedItems) {
        insertItem.run(orderId, item.product_id, item.quantity, item.price);
        updateStock.run(item.quantity, item.product_id);
      }

      return orderId;
    });

    const orderId = createOrder();
    res.status(201).json({ message: 'تم تقديم طلبك بنجاح! سيتم التواصل معك قريباً.', order_id: orderId, total });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: 'حدث خطأ أثناء معالجة الطلب.' });
  }
});

module.exports = router;
