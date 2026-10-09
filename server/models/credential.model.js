const mongoose = require('mongoose');

const credentialSchema = new mongoose.Schema({
  userEmail: { type: String, required: true, index: true },
  site: { type: String, required: true },
  url: { type: String, default: '' },
  username: { type: String, default: '' },
  email: { type: String, default: '' },
  encryptedPassword: { type: String, required: true },
  notes: { type: String, default: '' },
  category: { type: String, default: 'General' },
  favorite: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Credential', credentialSchema);
