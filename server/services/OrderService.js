'use strict';

const mongoose = require('mongoose');
const { Cart, Product, Order, OrderItem, Coupon } = require('../models');
const { ORDER_STATUS, DEFAULT_SHIPPING_FEE, DEFAULT_TAX_RATE } = require('../constants/orders');
const { PAYMENT_METHOD } = require('../constants/payments');
const ApiError = require('../utils/ApiError');

async function createFromCart(userId, { shippingAddress, paymentMethod, couponCode, note }) {
  if (!userId) throw ApiError.badRequest('Missing user');
  if (!shippingAddress) throw ApiError.badRequest('Missing shippingAddress');
  if (!paymentMethod) throw ApiError.badRequest('Missing paymentMethod');

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const cart = await Cart.findOne({ user: userId }).populate('items.product').session(session);
    if (!cart || cart.items.length === 0) throw ApiError.badRequest('Cart is empty');

    // Build order items snapshot and check stock
    const itemsData = [];
    let subtotal = 0;

    for (const ci of cart.items) {
      const p = await Product.findById(ci.product._id).session(session);
      if (!p || p.isDeleted) throw ApiError.badRequest('Product not available');
      if (p.stock < ci.quantity) throw ApiError.badRequest(`Insufficient stock for ${p.name}`);

      const priceAtOrder = Math.round(p.price * (1 - (p.discount || 0) / 100));
      const subtotalItem = priceAtOrder * ci.quantity;
      subtotal += subtotalItem;

      itemsData.push({
        product: p._id,
        productName: p.name,
        productImage: (p.images && p.images[0]) || null,
        price: priceAtOrder,
        quantity: ci.quantity,
        subtotal: subtotalItem
      });
    }

    // Coupon
    let discountAmount = 0;
    let shippingFee = DEFAULT_SHIPPING_FEE;

    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.trim().toUpperCase(),
        isDeleted: false
      });

      if (!coupon) {
        throw ApiError.badRequest('Coupon not found');
      }

      const productIds = cart.items.map(ci => ci.product._id);
      const validation = await coupon.isValid(userId, subtotal, productIds);

      if (!validation.valid) {
        throw ApiError.badRequest(validation.message || 'Coupon is not valid');
      }

      discountAmount = coupon.calculateDiscount(subtotal);

      if (coupon.code === 'FREESHIP') {
        shippingFee = 0;
      }
    }

    const taxAmount = Math.round(subtotal * DEFAULT_TAX_RATE);
    const totalAmount = Math.max(0, subtotal + shippingFee + taxAmount - discountAmount);

    // Set initial statuses
    const methodUpper = String(paymentMethod).toUpperCase();
    const isCOD = methodUpper === PAYMENT_METHOD.COD;

    const order = await Order.create([{
      user: userId,
      shippingAddress,
      paymentMethod: isCOD ? PAYMENT_METHOD.COD : paymentMethod,
      paymentStatus: 'pending',
      orderStatus: isCOD ? ORDER_STATUS.PROCESSING : ORDER_STATUS.PENDING,
      subtotal,
      shippingFee,
      taxAmount,
      discountAmount,
      totalAmount,
      notes: note || ''
    }], { session });

    const createdOrder = order[0];

    // Create order items
    const oiDocs = itemsData.map(it => ({ ...it, order: createdOrder._id }));
    await OrderItem.insertMany(oiDocs, { session });

    // Decrement stock
    for (const it of itemsData) {
      const res = await Product.updateOne(
        { _id: it.product, stock: { $gte: it.quantity } },
        { $inc: { stock: -it.quantity } },
        { session }
      );
      if (res.modifiedCount !== 1) throw ApiError.badRequest('Failed to update stock');
    }

    // Clear cart
    cart.items = [];
    await cart.save({ session });

    await session.commitTransaction();

    return { order: createdOrder };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

async function cancelOrder(userId, orderId, reason = '') {
  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) throw ApiError.notFound('Order not found');

  if ([ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED].includes(order.orderStatus)) {
    throw ApiError.badRequest('Order cannot be cancelled');
  }

  order.orderStatus = ORDER_STATUS.CANCELLED;
  order.cancellationReason = reason;
  order.cancelledAt = new Date();
  await order.save();

  // TODO: restore stock if needed
  return { order };
}

module.exports = { createFromCart, cancelOrder };
