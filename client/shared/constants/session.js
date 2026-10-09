// Session storage keys and lifetime shared across the client.
// Keep these in sync with the server's SESSION_TTL_MS (server/shared/constants).
export const SESSION_TOKEN_KEY = 'meroassets_session';
export const SESSION_EXPIRES_KEY = 'meroassets_session_expires';
export const SESSION_TTL_MS = 5 * 60 * 1000;
