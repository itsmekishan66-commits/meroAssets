const env = require('../config/env');

// Must run AFTER `authenticate` so req.userEmail is populated.
// Admin access is granted by email via ADMIN_EMAILS in
// client/.env — there is deliberately no role stored in the
// database.
const requireAdmin = (req, res, next) => {
  if (env.isAdminEmail(req.userEmail)) return next();
  return res.status(403).json({ error: 'Admin access required' });
};

module.exports = { requireAdmin };