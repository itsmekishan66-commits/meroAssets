const crypto = require('crypto');
const path = require('path');
const dotenv = require('dotenv');

// The admin allow-list lives in client/.env, deliberately without a VITE_
// prefix so it is never bundled into the browser (see client/.env).
// server/.env is loaded first by index.js; dotenv does not overwrite keys
// that are already set, so server/.env always wins for shared vars.
dotenv.config({ path: path.join(__dirname, '../../client/.env') });

// Comma-separated list, normalized for case-insensitive comparison.
const adminEmails = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

if (adminEmails.length === 0) {
  console.warn('⚠️  ADMIN_EMAILS not set in client/.env — the /admin panel will reject every session.');
}

const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',')
  : ['http://localhost:5173', 'http://localhost:5000'];

let sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  sessionSecret = crypto.randomBytes(32).toString('hex');
  console.warn('⚠️  SESSION_SECRET not set in .env. Using ephemeral key — all sessions invalidated on restart.');
  console.warn('   Generate one: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
}

module.exports = {
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/meroAssets',
  sessionSecret,
  allowedOrigins,
  adminEmails,
  isAdminEmail: (email) =>
    Boolean(email) && adminEmails.includes(String(email).trim().toLowerCase()),
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
  },
};
