const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

// Initialize database (runs schema + seed)
require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Security Middlewares ─────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // Allow CDN scripts in frontend
}));

app.use(cors({
  origin: function (origin, callback) {
    if (process.env.NODE_ENV === 'production') {
      callback(null, 'https://yourdomain.com');
    } else {
      // Allow localhost, 127.0.0.1, or local file execution (origin is undefined/null)
      callback(null, true);
    }
  },
  credentials: true,
}));

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Serve Static Frontend ────────────────────────────────────────────────────
// In development, use python http.server for frontend and this server for API only
// In production, serve the static files from the parent directory
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..')));
}

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/products', require('./routes/products')); // includes /categories at same level
app.use('/api/categories', (req, res) => {
  const db = require('./db');
  const categories = db.prepare('SELECT * FROM categories ORDER BY name').all();
  res.json({ categories });
});
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'المسار غير موجود.' });
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'حدث خطأ داخلي في الخادم.' });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🏥 صيدلية عزت API is running on http://localhost:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`\nAPI Endpoints:`);
  console.log(`  POST /api/auth/register`);
  console.log(`  POST /api/auth/login`);
  console.log(`  GET  /api/products`);
  console.log(`  GET  /api/categories`);
  console.log(`  POST /api/orders/checkout`);
  console.log(`  GET  /api/admin/stats\n`);
});

module.exports = app;
