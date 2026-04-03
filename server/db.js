const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const path = require('path');

const DB_PATH = path.join(__dirname, 'pharmacy.db');
const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ─── Create Tables ───────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'fa-solid fa-box'
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    category_id INTEGER,
    stock INTEGER NOT NULL DEFAULT 0,
    image_icon TEXT DEFAULT 'fa-solid fa-box-open',
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    address TEXT,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    total REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    delivery_address TEXT NOT NULL,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price_at_time REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );
`);

// ─── Seed Data ────────────────────────────────────────────────────────────────

const seedCategories = db.prepare(`INSERT OR IGNORE INTO categories (id, name, icon) VALUES (?, ?, ?)`);
const seedProduct = db.prepare(`INSERT OR IGNORE INTO products (id, name, description, price, category_id, stock, image_icon) VALUES (?, ?, ?, ?, ?, ?, ?)`);
const seedAdmin = db.prepare(`INSERT OR IGNORE INTO users (id, name, phone, address, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)`);

const seedAll = db.transaction(async () => {
  // Categories
  seedCategories.run(1, 'أجهزة قياس', 'fa-solid fa-gauge');
  seedCategories.run(2, 'أجهزة تنفسية', 'fa-solid fa-lungs');
  seedCategories.run(3, 'أجهزة العلاج', 'fa-solid fa-bolt');
  seedCategories.run(4, 'مستلزمات طبية', 'fa-solid fa-kit-medical');

  // Products
  seedProduct.run(1, 'جهاز قياس السكر - Clever Chek', 'جهاز دقيق وسريع لقياس نسبة السكر في الدم بالمنزل مع سهولة الاستخدام للمرضى وكبار السن.', 250, 1, 50, 'fa-solid fa-droplet');
  seedProduct.run(2, 'جهاز قياس ضغط الدم - Rossmax', 'جهاز آلي لقياس ضغط الدم بدقة عالية والنبض، موثوق ومناسب للاستخدام المنزلي واليومي.', 550, 1, 30, 'fa-solid fa-heart-pulse');
  seedProduct.run(3, 'ترمومتر رقمي', 'ترمومتر ديجيتال دقيق وسريع لقياس درجة حرارة الجسم للكبار والأطفال مع شاشة واضحة.', 80, 4, 100, 'fa-solid fa-temperature-half');
  seedProduct.run(4, 'جهاز استنشاق البخار - Nebulizer', 'جهاز فعّال لعلاج أزمات الربو والجهاز التنفسي وتحويل الدواء السائل إلى رذاذ للاستنشاق.', 650, 2, 20, 'fa-solid fa-mask-ventilator');
  seedProduct.run(5, 'جهاز قياس أكسجين الدم - Pulse Oximeter', 'مقياس صغير يُوضع في الإصبع لمتابعة نسبة الأكسجين في الدم ومعدل ضربات القلب بدقة.', 180, 1, 60, 'fa-solid fa-lungs');
  seedProduct.run(6, 'ميزان وزن رقمي', 'ميزان حمام رقمي دقيق لمتابعة الوزن بانتظام، مزود بشاشة إلكترونية واضحة وتصميم عصري.', 200, 4, 40, 'fa-solid fa-scale-balanced');
  seedProduct.run(7, 'جهاز العلاج بالموجات الكهربائية - TENS', 'جهاز لتخفيف الألم وعلاج الآلام المزمنة باستخدام نبضات كهربائية خفيفة آمنة.', 380, 3, 15, 'fa-solid fa-bolt');
  seedProduct.run(8, 'مقعد حمام طبي', 'مقعد حمام للمرضى وكبار السن من إنتاج طبي معتمد مع حوامل آمنة وقابلية للتعديل.', 450, 4, 10, 'fa-solid fa-chair');

  // Admin user
  const existingAdmin = db.prepare('SELECT id FROM users WHERE phone = ?').get('admin');
  if (!existingAdmin) {
    const hash = await bcrypt.hash('Admin@1234', 12);
    seedAdmin.run(1, 'مدير النظام', 'admin', 'صيدلية عزت، أم دومة', hash, 'admin');
  }
});

seedAll().then(() => {
  console.log('✅ Database initialized and seeded successfully.');
}).catch(err => {
  console.error('❌ Failed to seed database:', err);
});

module.exports = db;
