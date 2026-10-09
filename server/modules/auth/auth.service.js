const CryptoJS = require('crypto-js');
const { AppError } = require('../../shared/errors');
const { createSessionToken } = require('../../shared/utils/session');
const { OTP_TTL_MS, MAX_OTP_ATTEMPTS } = require('../../shared/constants');
const otpService = require('../otp/otp.service');
const User = require('../../models/user.model');
const activity = require('../activity/activity.service');

const normalizeEmail = (email) => String(email).trim().toLowerCase();

const getUserByEmail = (email) => User.findOne({ email: normalizeEmail(email) });

const makeEncryptionKey = () => CryptoJS.lib.WordArray.random(32).toString();

// Store a fresh email code on the user and deliver it.
const issueEmailCode = async (user) => {
  const code = otpService.generateEmailCode();
  user.emailCode = code;
  user.emailCodeExpiry = new Date(Date.now() + OTP_TTL_MS);
  user.emailCodeAttempts = 0;
  await user.save();

  await otpService.sendEmailCode(user.email, code);
  return user;
};

// Register a new account (name + address + email) and send a verification code.
const registerUser = async ({ name, phone, address, email }) => {
  const normalized = normalizeEmail(email);

  const existing = await User.findOne({ email: normalized });
  if (existing) {
    throw new AppError('An account with this email already exists. Please sign in.', 409);
  }

  const user = await User.create({
    name: String(name).trim(),
    phone: String(phone).trim(),
    address: String(address || '').trim(),
    email: normalized,
    encryptionKey: makeEncryptionKey(),
  });

  activity.logActivity(normalized, 'auth.register', { email: normalized });
  return issueEmailCode(user);
};

// Sign in / recover an existing account. Never auto-registers; new users
// must go through registerUser first.
const startAuth = async (email) => {
  const user = await getUserByEmail(email);
  if (!user) {
    throw new AppError('No account found for this email. Please register first.', 404);
  }

  activity.logActivity(user.email, 'auth.code_requested', { email: user.email });
  return issueEmailCode(user);
};

// Verify code and return the authenticated user
const verifyEmailCode = async (email, code) => {
  const user = await getUserByEmail(email);
  if (!user) throw new AppError('User not found', 401);

  if (user.emailCodeExpiry && Date.now() > new Date(user.emailCodeExpiry).getTime()) {
    throw new AppError('Code expired. Request a new one.', 401);
  }

  if (user.emailCode !== code) {
    user.emailCodeAttempts = (user.emailCodeAttempts || 0) + 1;

    // Lock the code after too many wrong guesses; a fresh code must be requested.
    if (user.emailCodeAttempts >= MAX_OTP_ATTEMPTS) {
      user.emailCode = null;
      user.emailCodeExpiry = null;
      user.emailCodeAttempts = 0;
      await user.save();
      throw new AppError('Too many incorrect attempts. Request a new code.', 429);
    }

    await user.save();
    throw new AppError('Invalid code', 401);
  }

  user.emailCode = null;
  user.emailCodeExpiry = null;
  user.emailCodeAttempts = 0;
  await user.save();

  activity.logActivity(user.email, 'auth.login', { email: user.email });
  return user;
};

const issueSessionToken = (user) => createSessionToken(user.email);

module.exports = { getUserByEmail, registerUser, startAuth, verifyEmailCode, issueSessionToken };
