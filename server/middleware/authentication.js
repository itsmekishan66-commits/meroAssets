const { decodeSessionToken, isSessionExpired } = require('../shared/utils/session');
const { SESSION_HEADER } = require('../shared/constants');
const User = require('../models/user.model');

async function authenticate(req, res, next) {
  try {
    const token = req.headers[SESSION_HEADER];
    if (!token) return res.status(401).json({ error: 'Session token required' });

    const decoded = decodeSessionToken(token);
    if (isSessionExpired(decoded)) {
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

module.exports = { authenticate };
