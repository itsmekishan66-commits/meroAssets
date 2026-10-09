// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Malformed ids/payloads are client errors, not server failures.
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid identifier' });
  }
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: 'Invalid request payload' });
  }

  const statusCode = err.statusCode || 500;

  // Never leak internal error details for unexpected failures.
  if (statusCode >= 500) {
    console.error('Unhandled error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }

  return res.status(statusCode).json({ error: err.message || 'Request failed' });
};

module.exports = errorHandler;
