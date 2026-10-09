const express = require('express');
const controller = require('./credential.controller');
const { validateCreate, validateUpdate } = require('./credential.validation');
const { authenticate } = require('../../middleware/authentication');

const router = express.Router();

router.get('/', authenticate, controller.list);
router.get('/:id/reveal', authenticate, controller.reveal);
router.post('/', authenticate, validateCreate, controller.create);
router.put('/:id', authenticate, validateUpdate, controller.update);
router.delete('/:id', authenticate, controller.remove);

module.exports = router;
