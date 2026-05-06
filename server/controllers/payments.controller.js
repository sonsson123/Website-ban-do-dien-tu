'use strict';

const PaymentService = require('../services/PaymentService');
const ApiResponse = require('../utils/ApiResponse');

const createIntent = async (req, res, next) => {
  try {
    const { orderId, method } = req.body;
    const result = await PaymentService.createIntentForOrder({ orderId, method });
    res.status(201).json(
      ApiResponse.created(
        result.paymentIntent,
        'Payment intent created'
      )
    );
  } catch (err) {
    next(err);
  }
};

const webhook = async (req, res, next) => {
  try {
    const provider = (req.query.provider || req.body.provider || 'unknown').toString();
    await PaymentService.handleWebhook(provider, req.body);
    res.status(200).send('OK');
  } catch (err) {
    next(err);
  }
};

const payosReturn = async (req, res, next) => {
  try {
    const result = await PaymentService.handleReturn('payos', req.query);
    const baseUrl = process.env.CLIENT_APP_URL || 'http://localhost:5173';
    const target = new URL('/payment-result', baseUrl);
    target.searchParams.set('provider', 'payos');
    target.searchParams.set('success', result.success ? 'true' : 'false');
    if (result.orderId) target.searchParams.set('orderId', result.orderId);

    res.redirect(target.toString());
  } catch (err) {
    next(err);
  }
};

module.exports = { createIntent, webhook, payosReturn };
