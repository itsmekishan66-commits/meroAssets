import {
  SESSION_TOKEN_KEY,
  SESSION_EXPIRES_KEY,
  SESSION_TTL_MS,
} from '../constants/session.js';

// Read the raw session token from sessionStorage.
export const getSessionToken = () => sessionStorage.getItem(SESSION_TOKEN_KEY);

// Read the session expiry timestamp (ms since epoch), or 0 when absent.
export const getSessionExpiry = () =>
  Number(sessionStorage.getItem(SESSION_EXPIRES_KEY)) || 0;

// A session is valid only when a token exists and has not expired yet.
export const isSessionValid = (now = Date.now()) => {
  const token = getSessionToken();
  const expires = getSessionExpiry();
  return Boolean(token) && expires > now;
};

// Persist a freshly issued session token with its expiry.
export const saveSession = (token, ttlMs = SESSION_TTL_MS) => {
  sessionStorage.setItem(SESSION_TOKEN_KEY, token);
  sessionStorage.setItem(SESSION_EXPIRES_KEY, String(Date.now() + ttlMs));
};

// Remove the session entirely (lock / logout).
export const clearSession = () => {
  sessionStorage.removeItem(SESSION_TOKEN_KEY);
  sessionStorage.removeItem(SESSION_EXPIRES_KEY);
};
