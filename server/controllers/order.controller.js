'use strict';

const { Order, OrderItem } = require('../models');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');
const { paginate, getPaginationMeta } = require('../utils/pagination');
const OrderService = require('../services/OrderService');
const PaymentService = require('../services/PaymentService');

const ORDER_STATUSES = ['pending', 'processing', 'completed', 'cancelled'];
const ADMIN_UPDATABLE_STATUSES = ['processing', 'completed', 'cancelled'];

const buildOrderItemsMap = async (orderIds) => {
  if (!orderIds || orderIds.length === 0) {
    return {};
  }

  const orderItems = await OrderItem.find({ order: { $in: orderIds } })
    .populate({
      path: 'product',
      select: 'name slug images price discount stock category',
      populate: {
        path: 'category',
        select: 'name'
      }
    })
    .lean();

  return orderItems.reduce((acc, item) => {
    const key = item.order.toString();
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});
};

const attachItems = (orders, itemsMap) => {
  return orders.map(order => ({
    ...order,
    items: itemsMap[order._id.toString()] || []
  }));
};

/**
 * Lấy danh sách đơn hàng của user hiện tại
 * GET /api/orders
 */
const getMyOrders = catchAsync(async (req, res) => {
  const { status, page, limit } = req.query;

  const filter = {
    user: req.user._id,
    isDeleted: false
  };

  if (status) {
    filter.orderStatus = status.toLowerCase();
  }

  const total = await Order.countDocuments(filter);

  const {
    query: paginatedQuery,
    page: currentPage,
    limit: currentLimit
  } = paginate(
    Order.find(filter)
      .sort({ createdAt: -1 }),
    { page, limit }
  );

  const orders = await paginatedQuery.lean();
  const itemsMap = await buildOrderItemsMap(orders.map(order => order._id));
  const ordersWithItems = attachItems(orders, itemsMap);

  res.status(200).json(
    ApiResponse.success(
      {
        orders: ordersWithItems,
        pagination: getPaginationMeta(total, currentPage, currentLimit)
      },
      'Orders retrieved successfully'
    )
  );
});

/**
 * Lấy chi tiết đơn hàng của user hiện tại
 * GET /api/orders/:id
 */
const getOrderById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const order = await Order.findOne({
    _id: id,
    user: req.user._id,
    isDeleted: false
  }).lean();

  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  const itemsMap = await buildOrderItemsMap([order._id]);
  const orderWithItems = attachItems([order], itemsMap)[0];

  res.status(200).json(
    ApiResponse.success(
      { order: orderWithItems },
      'Order retrieved successfully'
    )
  );
});

/**
 * Lấy danh sách tất cả đơn hàng (admin)
 * GET /api/admin/orders
 */
const getAdminOrders = catchAsync(async (req, res) => {
  const { status, startDate, endDate, user, paymentStatus, orderNumber, page, limit } = req.query;

  const filter = { isDeleted: false };

  if (status) {
    filter.orderStatus = status.toLowerCase();
  }

  if (paymentStatus) {
    filter.paymentStatus = paymentStatus.toLowerCase();
  }

  if (user) {
    filter.user = user;
  }

  if (orderNumber) {
    filter.orderNumber = { $regex: orderNumber, $options: 'i' };
  }

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) {
      filter.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      filter.createdAt.$lte = new Date(endDate);
    }
  }

  const total = await Order.countDocuments(filter);

  const {
    query: paginatedQuery,
    page: currentPage,
    limit: currentLimit
  } = paginate(
    Order.find(filter)
      .populate('user', 'fullName email phone role')
      .sort({ createdAt: -1 }),
    { page, limit }
  );

  const orders = await paginatedQuery.lean();
  const itemsMap = await buildOrderItemsMap(orders.map(order => order._id));
  const ordersWithItems = attachItems(orders, itemsMap);

  res.status(200).json(
    ApiResponse.success(
      {
        orders: ordersWithItems,
        pagination: getPaginationMeta(total, currentPage, currentLimit)
      },
      'Admin orders retrieved successfully'
    )
  );
});

/**
 * Cập nhật trạng thái đơn hàng (admin)
 * PATCH /api/admin/orders/:id/status
 */
const updateOrderStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status, reason } = req.body;
  const normalizedStatus = status.toLowerCase();

  if (!ADMIN_UPDATABLE_STATUSES.includes(normalizedStatus)) {
    throw ApiError.badRequest('Status is not allowed to be updated');
  }

  const order = await Order.findOne({
    _id: id,
    isDeleted: false
  }).populate('user', 'fullName email phone');

  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  order.orderStatus = normalizedStatus;

  if (normalizedStatus === 'completed') {
    order.deliveredAt = new Date();
    order.cancelledAt = undefined;
    order.cancellationReason = undefined;
  } else if (normalizedStatus === 'cancelled') {
    order.cancelledAt = new Date();
    if (reason) {
      order.cancellationReason = reason;
    }
    order.deliveredAt = undefined;
  } else {
    order.deliveredAt = undefined;
    order.cancelledAt = undefined;
    order.cancellationReason = undefined;
  }

  await order.save();

  const itemsMap = await buildOrderItemsMap([order._id]);
  const orderWithItems = attachItems([order.toJSON()], itemsMap)[0];

  res.status(200).json(
    ApiResponse.success(
      { order: orderWithItems },
      'Order status updated successfully'
    )
  );
});

/**
 * Tạo đơn hàng mới từ giỏ hàng (user)
 * POST /api/orders
 */
const createOrder = catchAsync(async (req, res) => {
  const { shippingAddress, paymentMethod, couponCode, note } = req.body;
  const { order } = await OrderService.createFromCart(req.user._id, {
    shippingAddress,
    paymentMethod,
    couponCode,
    note
  });

  let paymentIntent = null;
  if (String(paymentMethod).toUpperCase() !== 'COD') {
    const intent = await PaymentService.createIntentForOrder({ orderId: order._id, method: paymentMethod });
    paymentIntent = intent.paymentIntent;
  }

  res.status(201).json(
    ApiResponse.created(
      { order, paymentIntent },
      'Order created successfully'
    )
  );
});

/**
 * Hủy đơn hàng (user)
 * PATCH /api/orders/:id/cancel
 */
const cancelOrder = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { order } = await OrderService.cancelOrder(req.user._id, id, req.body.reason || '');
  
  res.status(200).json(
    ApiResponse.success(
      { order },
      'Order cancelled successfully'
    )
  );
});

module.exports = {
  createOrder,
  cancelOrder,
  getMyOrders,
  getOrderById,
  getAdminOrders,
  updateOrderStatus
};



