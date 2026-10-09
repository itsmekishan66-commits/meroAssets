const mongoose = require('mongoose');

// Audit log entry. Records who did what (logins, credential changes, admin
// actions) so the admin panel can show an activity feed. Deliberately stores
// metadata only — never passwords or secrets.
const activitySchema = new mongoose.Schema({
  email: { type: String, default: '' },
  action: { type: String, required: true },
  detail: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now, index: true },
});

module.exports = mongoose.model('Activity', activitySchema);