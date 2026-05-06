'use strict';

const PAYMENT_METHOD = Object.freeze({
  COD: 'COD',
  PAYOS: 'payos'
});

const PAYMENT_STATUS = Object.freeze({
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded'
});

module.exports = { PAYMENT_METHOD, PAYMENT_STATUS };
