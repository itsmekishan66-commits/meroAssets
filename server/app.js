const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const { allowedOrigins } = require('./config/env');
const { CLIENT_HEADER } = require('./shared/constants');
const authRoutes = require('./modules/auth/auth.routes');
const credentialRoutes = require('./modules/credentials/credential.routes');
const statsRoutes = require('./modules/credentials/stats.routes');
const notFound = require('./middleware/not-found');
const errorHandler = require('./middleware/error-handler');

const app = express();

app.disable('x-powered-by');

app.use(express.json({ limit: '100kb' }));

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(null, false);
  },
  credentials: true,
}));

// Security Headers. CSP allows the Google Fonts loaded by client/index.html;
// inline styles are required by framer-motion. upgradeInsecureRequests is off
// so the built app still works when served over plain http during local testing.
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: null,
    },
  },
  crossOriginEmbedderPolicy: false,
  frameguard: { action: 'deny' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// Serve built client
app.use(express.static(path.join(__dirname, '../client/dist')));

// API Security Middleware — blocks requests from non-browser clients
app.use('/api', (req, res, next) => {
  const clientHeader = req.headers[CLIENT_HEADER];
  if (clientHeader === 'true' || clientHeader === '1') return next();

  const origin = req.headers['origin'];
  const referer = req.headers['referer'];
  const originOk = origin && allowedOrigins.some(o => origin === o);
  const refererOk = referer && allowedOrigins.some(o => referer.startsWith(o + '/'));
  if (originOk || refererOk) return next();

  return res.status(403).json({ error: 'Access denied' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/credentials', credentialRoutes);
app.use('/api/stats', statsRoutes);

// Fallbacks
app.use(notFound);
app.use(errorHandler);

module.exports = app;
