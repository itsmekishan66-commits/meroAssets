require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const crypto = require('crypto');
const CryptoJS = require('crypto-js');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());
const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',')
  : ['http://localhost:5173', 'http://localhost:5000'];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(null, false);
  },
  credentials: true
}));

// Security Headers ────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '0');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', '');
  next();
});

// Serve built client
app.use(express.static(path.join(__dirname, '../client/dist')));

// API Security Middleware ──────────────────────────────────────────────────
// Blocks requests from non-browser clients (Postman, curl, etc.)
app.use('/api', (req, res, next) => {
  const clientHeader = req.headers['x-meroassets-client'];
  if (clientHeader === 'true' || clientHeader === '1') return next();

  const origin = req.headers['origin'];
  const referer = req.headers['referer'];
  const originOk = origin && allowedOrigins.some(o => origin === o);
  const refererOk = referer && allowedOrigins.some(o => referer.startsWith(o + '/'));
  if (originOk || refererOk) return next();

  return res.status(403).json({ error: 'Access denied' });
});

// Rate limiting for OTP verification
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many OTP attempts. Try again later.' }
});

// MongoDB Models ──────────────────────────────────────────────────────────
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
  updatedAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  encryptionKey: { type: String, required: true },
  emailCode: { type: String },
  emailCodeExpiry: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

const Credential = mongoose.model('Credential', credentialSchema);
const User = mongoose.model('User', userSchema);

// Encryption Helpers ──────────────────────────────────────────────────────
const encryptPassword = (plainText, key) => {
  return CryptoJS.AES.encrypt(plainText, key).toString();
};

const decryptPassword = (cipherText, key) => {
  const bytes = CryptoJS.AES.decrypt(cipherText, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// Server-side session secret ────────────────────────────────────────────────
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
if (!process.env.SESSION_SECRET) {
  console.warn('⚠️  SESSION_SECRET not set in .env. Using ephemeral key — all sessions invalidated on restart.');
  console.warn('   Generate one: node -e "console.log(require(\"crypto\").randomBytes(32).toString(\"hex\"))"');
}

// Email Code Helpers ───────────────────────────────────────────────────────
const generateEmailCode = () => crypto.randomInt(100000, 999999).toString();

let transporter = null;
const getTransporter = () => {
  if (transporter) return transporter;
  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  return transporter;
};

const sendEmailCode = async (email, code) => {
  const t = getTransporter();
  if (t) {
    try {
      await t.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: 'Your MeroAssets verification code',
        text: `Your MeroAssets verification code is: ${code}\n\nThis code expires in 5 minutes.`,
        html: `<p>Your MeroAssets verification code is:</p><h2 style="letter-spacing:4px;font-family:monospace">${code}</h2><p>This code expires in 5 minutes.</p>`
      });
      console.log(`📧 Code ${code} sent via email to ${email}`);
    } catch (err) {
      console.error(`❎ Email send failed: ${err.message}. Falling back to console.`);
      console.log(`Verification code ${code} for ${email}`);
    }
  } else {
    console.log(`Verification code ${code} for ${email}`);
    console.log('⚠️  SMTP not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env for real email delivery.');
  }
};

// Auth Routes ──────────────────────────────────────────────────────────────

// Start auth flow — sign in or sign up by email
app.post('/api/auth/start', otpLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email address required' });

    let user = await User.findOne({ email });

    if (!user) {
      const encryptionKey = CryptoJS.lib.WordArray.random(32).toString();
      user = await User.create({ email, encryptionKey });
    }

    const code = generateEmailCode();
    user.emailCode = code;
    user.emailCodeExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    await sendEmailCode(email, code);
    res.json({ success: true, message: 'Code sent to your email' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify code and get session token
app.post('/api/auth/verify', otpLimiter, async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ error: 'Email and code required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'User not found' });

    if (user.emailCode !== code) return res.status(401).json({ error: 'Invalid code' });
    if (user.emailCodeExpiry && Date.now() > new Date(user.emailCodeExpiry).getTime()) {
      return res.status(401).json({ error: 'Code expired. Request a new one.' });
    }

    user.emailCode = null;
    user.emailCodeExpiry = null;
    await user.save();

    const sessionToken = CryptoJS.AES.encrypt(
      JSON.stringify({ ts: Date.now(), email: user.email }),
      SESSION_SECRET
    ).toString();

    res.json({ success: true, sessionToken, email: user.email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check auth status
app.get('/api/auth/status', async (req, res) => {
  try {
    const token = req.headers['x-session-token'];
    if (!token) return res.json({ authenticated: false });

    const bytes = CryptoJS.AES.decrypt(token, SESSION_SECRET);
    const decoded = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

    const user = await User.findOne({ email: decoded.email });
    if (!user) return res.json({ authenticated: false });

    if (Date.now() - decoded.ts > 5 * 60 * 1000) {
      return res.json({ authenticated: false });
    }

    res.json({ authenticated: true, email: user.email });
  } catch {
    res.json({ authenticated: false });
  }
});

// Get current user info
app.get('/api/auth/me', validateSession, async (req, res) => {
  res.json({ email: req.userEmail });
});

// Session Middleware ────────────────────────────────────────────────────────
async function validateSession(req, res, next) {
  try {
    const token = req.headers['x-session-token'];
    if (!token) return res.status(401).json({ error: 'Session token required' });

    const bytes = CryptoJS.AES.decrypt(token, SESSION_SECRET);
    const decoded = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

    if (Date.now() - decoded.ts > 5 * 60 * 1000) {
      return res.status(401).json({ error: 'Session expired. Re-verify.' });
    }

    const user = await User.findOne({ email: decoded.email });
    if (!user) return res.status(401).json({ error: 'User not found' });

    req.userEmail = user.email;
    req.encryptionKey = user.encryptionKey;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid session token' });
  }
}

// Credential CRUD ─────────────────────────────────────────────────────────

// GET all credentials (passwords masked)
app.get('/api/credentials', validateSession, async (req, res) => {
  try {
    const creds = await Credential.find({ userEmail: req.userEmail }).sort({ updatedAt: -1 });
    res.json(creds.map(c => ({
      _id: c._id,
      site: c.site,
      url: c.url,
      username: c.username,
      email: c.email,
      notes: c.notes,
      category: c.category,
      favorite: c.favorite,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      password: '••••••••'
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single credential with decrypted password
app.get('/api/credentials/:id/reveal', validateSession, async (req, res) => {
  try {
    const cred = await Credential.findOne({ _id: req.params.id, userEmail: req.userEmail });
    if (!cred) return res.status(404).json({ error: 'Not found' });

    const password = decryptPassword(cred.encryptedPassword, req.encryptionKey);
    res.json({
      _id: cred._id,
      site: cred.site,
      url: cred.url,
      username: cred.username,
      email: cred.email,
      password,
      notes: cred.notes,
      category: cred.category,
      favorite: cred.favorite
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create credential
app.post('/api/credentials', validateSession, async (req, res) => {
  try {
    const { site, url, username, email, password, notes, category } = req.body;

    const encryptedPassword = encryptPassword(password, req.encryptionKey);
    const cred = await Credential.create({
      userEmail: req.userEmail,
      site, url, username, email, encryptedPassword, notes,
      category: category || 'General'
    });

    res.status(201).json({
      _id: cred._id, site: cred.site, url: cred.url, username: cred.username,
      email: cred.email, notes: cred.notes, category: cred.category,
      favorite: cred.favorite, createdAt: cred.createdAt, updatedAt: cred.updatedAt,
      password: '••••••••'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update credential
app.put('/api/credentials/:id', validateSession, async (req, res) => {
  try {
    const { site, url, username, email, password, notes, category, favorite } = req.body;
    const cred = await Credential.findOne({ _id: req.params.id, userEmail: req.userEmail });
    if (!cred) return res.status(404).json({ error: 'Not found' });

    if (site !== undefined) cred.site = site;
    if (url !== undefined) cred.url = url;
    if (username !== undefined) cred.username = username;
    if (email !== undefined) cred.email = email;
    if (notes !== undefined) cred.notes = notes;
    if (category !== undefined) cred.category = category;
    if (favorite !== undefined) cred.favorite = favorite;

    if (password && password !== '••••••••') {
      cred.encryptedPassword = encryptPassword(password, req.encryptionKey);
    }

    cred.updatedAt = new Date();
    await cred.save();

    res.json({
      _id: cred._id, site: cred.site, url: cred.url, username: cred.username,
      email: cred.email, notes: cred.notes, category: cred.category,
      favorite: cred.favorite, createdAt: cred.createdAt, updatedAt: cred.updatedAt,
      password: '••••••••'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE credential
app.delete('/api/credentials/:id', validateSession, async (req, res) => {
  try {
    const cred = await Credential.findOneAndDelete({ _id: req.params.id, userEmail: req.userEmail });
    if (!cred) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET stats
app.get('/api/stats', validateSession, async (req, res) => {
  try {
    const total = await Credential.countDocuments({ userEmail: req.userEmail });
    const favorites = await Credential.countDocuments({ userEmail: req.userEmail, favorite: true });
    const categories = await Credential.distinct('category', { userEmail: req.userEmail });
    res.json({ total, favorites, categories: categories.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve React app for all non-API routes ────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Connect & Start ─────────────────────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/meroassets';
const PORT = process.env.PORT || 5000;

const startServer = () => {
  const server = app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❎ Port ${PORT} is already in use. Kill the existing process or use a different port.`);
      process.exit(1);
    }
    console.error('❎ Server error:', err.message);
  });
};

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    startServer();
  })
  .catch(err => {
    console.error('❎ MongoDB connection failed:', err.message);
    console.log('Starting without DB for demo...');
    startServer();
  });
