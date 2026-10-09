const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s().-]{7,20}$/;

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const isValidName = (name) => isNonEmptyString(name) && name.trim().length >= 2;
const isValidEmail = (email) => isNonEmptyString(email) && EMAIL_RE.test(email.trim());
const isValidPhone = (phone) => {
  if (!isNonEmptyString(phone) || !PHONE_RE.test(phone.trim())) return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
};

// Field-by-field errors for the registration payload. Empty object = valid.
const validateRegistration = ({ name, email, phone } = {}) => {
  const errors = {};
  if (!isValidName(name)) errors.name = 'Enter a valid name (at least 2 characters)';
  if (!isValidEmail(email)) errors.email = 'Enter a valid email address';
  if (!isValidPhone(phone)) errors.phone = 'Enter a valid phone number';
  return errors;
};

const hasEmail = (value) => Boolean(value);
const hasEmailAndCode = (email, code) => Boolean(email && code);
const hasRegistration = ({ name, email, phone } = {}) =>
  Object.keys(validateRegistration({ name, email, phone })).length === 0;

module.exports = {
  isValidName,
  isValidEmail,
  isValidPhone,
  validateRegistration,
  hasEmail,
  hasEmailAndCode,
  hasRegistration,
};
