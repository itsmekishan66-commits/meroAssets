const CryptoJS = require('crypto-js');
const { sessionSecret } = require('../../config/env');
const { SESSION_TTL_MS } = require('../constants');

const createSessionToken = (email) => {
  return CryptoJS.AES.encrypt(
    JSON.stringify({ ts: Date.now(), email }),
    sessionSecret
  ).toString();
};

const decodeSessionToken = (token) => {
  const bytes = CryptoJS.AES.decrypt(token, sessionSecret);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

const isSessionExpired = (decoded, now = Date.now()) => {
  return now - decoded.ts > SESSION_TTL_MS;
};

module.exports = { createSessionToken, decodeSessionToken, isSessionExpired };
