'use strict';

const ORDER_STATUS = Object.freeze({
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
});

const DEFAULT_SHIPPING_FEE = 0;
const DEFAULT_TAX_RATE = 0;

module.exports = { ORDER_STATUS, DEFAULT_SHIPPING_FEE, DEFAULT_TAX_RATE };
