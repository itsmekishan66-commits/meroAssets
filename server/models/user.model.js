const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, default: '' },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  encryptionKey: { type: String, required: true },
  emailCode: { type: String },
  emailCodeExpiry: { type: Date },
  emailCodeAttempts: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
