const path = require('path');

const notFound = (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Not found' });
  }
  if (req.method === 'GET') {
    return res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
  }
  return res.status(404).json({ error: 'Not found' });
};

module.exports = notFound;
