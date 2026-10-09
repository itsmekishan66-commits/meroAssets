const express = require('express');
const controller = require('./admin.controller');
const { authenticate } = require('../../middleware/authentication');
const { requireAdmin } = require('../../middleware/authorization');

const router = express.Router();

// Every admin endpoint needs a valid session AND an email listed in
// ADMIN_EMAILS (client/.env).
router.use(authenticate, requireAdmin);

router.get('/overview', controller.overview);
router.get('/users', controller.listUsers);
router.get('/users/:id', controller.getUserDetail);
router.put('/users/:id', controller.updateUser);
router.delete('/users/:id', controller.deleteUser);
router.get('/credentials', controller.listCredentials);
router.get('/activity', controller.listActivity);
router.get('/settings', controller.settings);
router.get('/admins', controller.listAdmins);

module.exports = router;