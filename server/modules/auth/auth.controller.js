const { decodeSessionToken, isSessionExpired } = require('../../shared/utils/session');
const { SESSION_HEADER } = require('../../shared/constants');
const authService = require('./auth.service');
const { hasEmail, hasEmailAndCode, validateRegistration } = require('./auth.validation');
const { isValidEmailCode } = require('../otp/otp.validation');

// Check auth status
const status = async (req, res) => {
  try {
    const token = req.headers[SESSION_HEADER];
    if (!token) return res.json({ authenticated: false });

    const decoded = decodeSessionToken(token);

    const user = await authService.getUserByEmail(decoded.email);
    if (!user) return res.json({ authenticated: false });

    if (isSessionExpired(decoded)) {
      return res.json({ authenticated: false });
    }

    res.json({ authenticated: true, email: user.email });
  } catch {
    res.json({ authenticated: false });
  }
};

// Get current user info
const me = (req, res) => {
  res.json({ email: req.userEmail });
};

// Register a new account (name + address + email) and send a code
const register = async (req, res, next) => {
  try {
    const { name, email, phone, address } = req.body;
    const errors = validateRegistration({ name, email, phone });
    if (Object.keys(errors).length) {
      return res.status(400).json({ error: 'Please fix the highlighted fields', errors });
    }

    await authService.registerUser({ name, email, phone, address });
    res.json({ success: true, message: 'Account created. Code sent to your email' });
  } catch (err) {
    next(err);
  }
};

// Request an OTP code to sign in an existing account
const requestCode = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!hasEmail(email)) {
      return res.status(400).json({ error: 'Email address required' });
    }

    await authService.startAuth(email);
    res.json({ success: true, message: 'Code sent to your email' });
  } catch (err) {
    next(err);
  }
};

// Verify the OTP code and issue a session token
const verifyCode = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    if (!hasEmailAndCode(email, code)) {
      return res.status(400).json({ error: 'Email and code required' });
    }
    if (!isValidEmailCode(code)) {
      return res.status(401).json({ error: 'Invalid code' });
    }

    const user = await authService.verifyEmailCode(email, code);
    const sessionToken = authService.issueSessionToken(user);
    res.json({ success: true, sessionToken, email: user.email });
  } catch (err) {
    next(err);
  }
};

module.exports = { status, me, register, requestCode, verifyCode };
