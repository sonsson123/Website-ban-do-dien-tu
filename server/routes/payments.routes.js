'use strict';

const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const ctrl = require('../controllers/payments.controller');
const validate = require('../middlewares/validate.middleware');
const { body } = require('express-validator');

router.post(
  '/create-intent',
  protect,
  [
    body('orderId').isMongoId().withMessage('orderId is required'),
    body('method').isString().withMessage('method is required')
  ],
  validate,
  ctrl.createIntent
);
router.post('/webhook', ctrl.webhook);
router.get('/payos/return', ctrl.payosReturn);

module.exports = router;
