const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'ezzat_pharmacy_secret_2026_change_in_production';

/**
 * Middleware: Verify JWT from httpOnly cookie.
 * Attaches decoded user to req.user on success.
 */
function authenticate(req, res, next) {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ error: 'غير مصرح. يرجى تسجيل الدخول أولاً.' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.clearCookie('token');
    return res.status(401).json({ error: 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مجدداً.' });
  }
}

/**
 * Middleware: Require admin role.
 * Must be used after authenticate().
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'غير مسموح. هذا الإجراء للمديرين فقط.' });
  }
  next();
}

module.exports = { authenticate, requireAdmin, JWT_SECRET };
