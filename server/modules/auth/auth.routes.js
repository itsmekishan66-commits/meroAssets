const express = require('express');
const controller = require('./auth.controller');
const { authenticate } = require('../../middleware/authentication');
const { otpLimiter } = require('../../middleware/rate-limit');

const router = express.Router();

// Registration, OTP request/verify endpoints
router.post('/register', otpLimiter, controller.register);
router.post('/start', otpLimiter, controller.requestCode);
router.post('/verify', otpLimiter, controller.verifyCode);

router.get('/status', controller.status);
router.get('/me', authenticate, controller.me);

module.exports = router;
