const crypto = require('crypto');

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
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
  },
};
