'use strict';

const PaymentGatewayMock = require('./PaymentGatewayMock');
const PayOSGateway = require('./PayOSGateway');

const MODE = (process.env.PAYMENT_GATEWAY_MODE || 'mock').toLowerCase();

function isMockMode() {
  return MODE === 'mock';
}

async function createIntent({ orderNumber, amount, method }) {
  if (isMockMode()) {
    return PaymentGatewayMock.createIntent({ orderNumber, amount, method });
  }

  const m = String(method || '').toLowerCase();

  if (m === 'payos') {
    return PayOSGateway.createIntent({ orderNumber, amount });
  }

  // Fallback to mock if method is unknown
  return PaymentGatewayMock.createIntent({ orderNumber, amount, method });
}

async function verifyReturn(provider, query) {
  if (isMockMode()) {
    return PaymentGatewayMock.verifyReturn(query);
  }

  const p = String(provider || '').toLowerCase();

  if (p === 'payos') {
    return PayOSGateway.verifyReturn(query);
  }

  return PaymentGatewayMock.verifyReturn(query);
}

async function verifyWebhook(provider, payload) {
  if (isMockMode()) {
    return PaymentGatewayMock.verifyWebhook(payload);
  }

  const p = String(provider || '').toLowerCase();

  if (p === 'payos') {
    return PayOSGateway.verifyWebhook(payload);
  }

  return PaymentGatewayMock.verifyWebhook(payload);
}

module.exports = { createIntent, verifyReturn, verifyWebhook };
