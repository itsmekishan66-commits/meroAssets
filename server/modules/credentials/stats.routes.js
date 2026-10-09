const express = require('express');
const controller = require('./credential.controller');
const { authenticate } = require('../../middleware/authentication');

const router = express.Router();

// GET /api/stats — aggregate counts for the signed-in user.
router.get('/', authenticate, controller.getStats);

module.exports = router;
