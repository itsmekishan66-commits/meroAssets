const rateLimit = require('express-rate-limit');

// Rate limiting for OTP request/verify endpoints.
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many OTP attempts. Try again later.' },
});

module.exports = { otpLimiter };
