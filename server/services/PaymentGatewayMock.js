'use strict';

const crypto = require('crypto');

function genCode(prefix = 'MOCK') {
  const rand = crypto.randomBytes(4).toString('hex');
  return `${prefix}${Date.now()}${rand}`.toUpperCase();
}

async function createIntent({ orderNumber, amount, method }) {
  if (!method || String(method).toLowerCase() === 'cod') {
    return { gateway: 'cod', amount, redirectUrl: null, transactionCode: null };
  }
  const prefix = String(method).toLowerCase() === 'payos' ? 'PAYOS' : 'PAY';
  const code = genCode(prefix);
  const redirectUrl = `https://example.com/mockpay?method=${method}&order=${encodeURIComponent(
    orderNumber
  )}&amount=${amount}&code=${code}`;
  return { gateway: method, amount, redirectUrl, transactionCode: code };
}

async function verifyReturn(query) {
  return { success: true, transactionCode: query.code || query.transactionCode, amount: Number(query.amount || 0) };
}

async function verifyWebhook(payload) {
  return { success: true, transactionCode: payload.transactionCode, amount: Number(payload.amount || 0) };
}

module.exports = { createIntent, verifyReturn, verifyWebhook };
