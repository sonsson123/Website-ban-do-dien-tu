'use strict';

const { PayOS } = require('@payos/node');

let cachedClient = null;

function getPayOSClient() {
  if (cachedClient) return cachedClient;

  const { PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY, PAYOS_API_BASE_URL } = process.env;

  if (!PAYOS_CLIENT_ID || !PAYOS_API_KEY || !PAYOS_CHECKSUM_KEY) {
    throw new Error('PayOS environment variables are not fully configured');
  }

  cachedClient = new PayOS({
    clientId: PAYOS_CLIENT_ID,
    apiKey: PAYOS_API_KEY,
    checksumKey: PAYOS_CHECKSUM_KEY,
    baseURL: PAYOS_API_BASE_URL || undefined
  });

  return cachedClient;
}

function toOrderCode(orderNumber) {
  const digits = String(orderNumber || '').replace(/\D/g, '');
  if (digits) {
    // PayOS expects a number; slice to avoid exceeding safe integer length.
    return Number(digits.slice(-12));
  }

  return Date.now();
}

function normalizeAmount(amount) {
  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error('Invalid PayOS amount');
  }
  return Math.round(value);
}

function ensureUrlsConfigured() {
  const { PAYOS_RETURN_URL, PAYOS_CANCEL_URL } = process.env;
  if (!PAYOS_RETURN_URL || !PAYOS_CANCEL_URL) {
    throw new Error('PayOS return/cancel URLs are not configured');
  }
  return { returnUrl: PAYOS_RETURN_URL, cancelUrl: PAYOS_CANCEL_URL };
}

async function createIntent({ orderNumber, amount }) {
  const payos = getPayOSClient();
  const { returnUrl, cancelUrl } = ensureUrlsConfigured();

  const payload = {
    orderCode: toOrderCode(orderNumber),
    amount: normalizeAmount(amount),
    description: `DH ${String(orderNumber || '').slice(-6)}`,
    returnUrl,
    cancelUrl
  };

  const response = await payos.paymentRequests.create(payload);

  return {
    gateway: 'payos',
    amount: payload.amount,
    redirectUrl: response.checkoutUrl,
    transactionCode: String(response.orderCode),
    rawResponse: response
  };
}

function interpretReturnQuery(query = {}) {
  const code = String(query.code || '').trim();
  const status = String(query.status || '').toUpperCase();
  const cancel = String(query.cancel || '').toLowerCase();

  const success = code === '00' && status === 'PAID' && cancel !== 'true';

  return {
    success,
    transactionCode: query.orderCode ? String(query.orderCode) : null,
    rawResponse: query
  };
}

async function verifyReturn(query) {
  return interpretReturnQuery(query);
}

async function verifyWebhook(payload) {
  const payos = getPayOSClient();
  const data = await payos.webhooks.verify(payload);

  const status = String(data.status || '').toUpperCase();
  const success = status === 'PAID';

  return {
    success,
    transactionCode: data.orderCode ? String(data.orderCode) : null,
    rawResponse: payload
  };
}

module.exports = { createIntent, verifyReturn, verifyWebhook };
