const repository = require('./activity.repository');

// Audit logging is best-effort: it must never block or fail the main request.
// Passwords are never logged; only metadata (ids, emails, site names).
const logActivity = (email, action, detail = {}) => {
  repository.create({ email: email || '', action, detail }).catch(() => {});
};

const listRecent = (limit = 50) => repository.findRecent(limit);

module.exports = { logActivity, listRecent };