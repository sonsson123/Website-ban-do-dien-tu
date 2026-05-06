'use strict';

const { Payment } = require('../models');
const { PAYMENT_STATUS } = require('../constants/payments');
const { ORDER_STATUS } = require('../constants/orders');
const ApiError = require('../utils/ApiError');
const PaymentGateway = require('./PaymentGateway');
const Order = require('../models/Order.model');

async function createIntentForOrder({ orderId, method }) {
  const order = await Order.findById(orderId);
  if (!order) throw ApiError.notFound('Order not found');
  if (order.totalAmount <= 0) throw ApiError.badRequest('Invalid order total');

  const normMethod = String(method).toLowerCase();

  if (normMethod === 'cod') {
    return { paymentIntent: { gateway: 'cod', amount: order.totalAmount, redirectUrl: null, transactionCode: null } };
  }

  const intent = await PaymentGateway.createIntent({
    orderNumber: order.orderNumber,
    amount: order.totalAmount,
    method: normMethod
  });

  const payment = await Payment.findOneAndUpdate(
    { order: order._id },
    {
      order: order._id,
      method: normMethod,
      amount: order.totalAmount,
      status: PAYMENT_STATUS.PENDING,
      transactionCode: intent.transactionCode,
      gatewayResponse: intent.rawResponse || undefined
    },
    { new: true, upsert: true }
  );

  return { paymentIntent: intent, payment };
}

async function handleReturn(provider, query) {
  const result = await PaymentGateway.verifyReturn(provider, query);
  const payment = await Payment.findOne({ transactionCode: result.transactionCode }).populate('order');
  if (!payment) return { success: false };

  if (result.success && payment.status !== PAYMENT_STATUS.COMPLETED) {
    payment.status = PAYMENT_STATUS.COMPLETED;
    payment.paidAt = new Date();
    await payment.save();

    if (payment.order) {
      await Order.findByIdAndUpdate(payment.order._id, {
        paymentStatus: 'paid',
        orderStatus: payment.order.orderStatus === ORDER_STATUS.PENDING ? ORDER_STATUS.PROCESSING : payment.order.orderStatus
      });
    }
  }
  return { success: true, orderId: payment.order ? payment.order._id : null };
}

async function handleWebhook(provider, payload) {
  const result = await PaymentGateway.verifyWebhook(provider, payload);
  const payment = await Payment.findOne({ transactionCode: result.transactionCode }).populate('order');
  if (!payment) return { ok: true };

  if (result.success && payment.status !== PAYMENT_STATUS.COMPLETED) {
    payment.status = PAYMENT_STATUS.COMPLETED;
    payment.paidAt = new Date();
    await payment.save();

    if (payment.order) {
      await Order.findByIdAndUpdate(payment.order._id, {
        paymentStatus: 'paid',
        orderStatus: payment.order.orderStatus === ORDER_STATUS.PENDING ? ORDER_STATUS.PROCESSING : payment.order.orderStatus
      });
    }
  } else if (!result.success) {
    if (payment.status !== PAYMENT_STATUS.COMPLETED) {
      payment.status = PAYMENT_STATUS.FAILED;
      await payment.save();
      if (payment.order) {
        await Order.findByIdAndUpdate(payment.order._id, { paymentStatus: 'failed' });
      }
    }
  }

  return { ok: true };
}

module.exports = { createIntentForOrder, handleReturn, handleWebhook };
