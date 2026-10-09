const { MASKED_PASSWORD } = require('../../shared/constants');

const LIMITS = {
  site: 120,
  url: 2048,
  username: 200,
  email: 200,
  notes: 5000,
  category: 60,
  password: 500,
};

const STRING_FIELDS = ['site', 'url', 'username', 'email', 'notes', 'category', 'password'];

const isNonEmptyString = (value) =>
  typeof value === 'string' && value.trim().length > 0;

// Normalize a URL to an http(s) address. Returns the normalized string, '' when
// blank, or null when the value is not a valid http(s) URL.
const normalizeUrl = (url) => {
  if (url === undefined || url === null || url === '') return '';
  if (typeof url !== 'string') return null;

  const trimmed = url.trim();
  if (!trimmed) return '';

  const hasScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed);
  let parsed;
  try {
    parsed = new URL(hasScheme ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
  return parsed.toString();
};

// Shared type/length/URL checks for every credential field. Returns an error
// message, or null when the payload is valid. Normalizes body.url in place.
const checkFields = (body) => {
  if (body.favorite !== undefined && typeof body.favorite !== 'boolean') {
    return 'Favorite must be true or false';
  }

  for (const field of STRING_FIELDS) {
    const value = body[field];
    if (value === undefined || value === null) continue;
    if (typeof value !== 'string') return `${field} must be text`;
    if (value.length > LIMITS[field]) {
      return `${field} is too long (max ${LIMITS[field]} characters)`;
    }
  }

  if (body.url !== undefined) {
    const normalized = normalizeUrl(body.url);
    if (normalized === null) return 'URL must be a valid http(s) address';
    body.url = normalized;
  }

  return null;
};

const validateCreate = (req, res, next) => {
  const body = req.body || {};
  const { site, password } = body;

  if (!isNonEmptyString(site)) {
    return res.status(400).json({ error: 'Site name is required' });
  }
  if (!isNonEmptyString(password)) {
    return res.status(400).json({ error: 'Password is required' });
  }

  const error = checkFields(body);
  if (error) return res.status(400).json({ error });

  next();
};

const validateUpdate = (req, res, next) => {
  const body = req.body || {};
  const { site, password } = body;

  if (site !== undefined && !isNonEmptyString(site)) {
    return res.status(400).json({ error: 'Site name cannot be empty' });
  }
  // The masked placeholder means "keep the current password".
  if (password !== undefined && password !== MASKED_PASSWORD && !isNonEmptyString(password)) {
    return res.status(400).json({ error: 'Password cannot be empty' });
  }

  const error = checkFields(body);
  if (error) return res.status(400).json({ error });

  next();
};

module.exports = { validateCreate, validateUpdate };
