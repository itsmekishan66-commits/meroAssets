const SESSION_TTL_MS = 5 * 60 * 1000;
const OTP_TTL_MS = 5 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;
const MASKED_PASSWORD = '••••••••';
const SESSION_HEADER = 'x-session-token';
const CLIENT_HEADER = 'x-meroassets-client';

module.exports = {
  SESSION_TTL_MS,
  OTP_TTL_MS,
  MAX_OTP_ATTEMPTS,
  MASKED_PASSWORD,
  SESSION_HEADER,
  CLIENT_HEADER,
};
