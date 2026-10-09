require('dotenv').config();
const app = require('./app');
const { connectDatabase } = require('./config/database');
const { port } = require('./config/env');

const startServer = () => {
  const server = app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❎ Port ${port} is already in use. Kill the existing process or use a different port.`);
      process.exit(1);
    }
    console.error('❎ Server error:', err.message);
  });
};

connectDatabase()
  .then(() => {
    console.log('✅ MongoDB connected');
    startServer();
  })
  .catch(err => {
    console.error('❎ MongoDB connection failed:', err.message);
    process.exit(1);
  });
