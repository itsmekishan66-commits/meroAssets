const isValidEmailCode = (code) => typeof code === 'string' && /^\d{6}$/.test(code);

module.exports = { isValidEmailCode };
