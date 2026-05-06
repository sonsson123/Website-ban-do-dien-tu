'use strict';

const express = require('express');
const router = express.Router();

// Import với error handling
let adminController;
let orderController;
let orderValidator;
let validate;
let protect;
let isAdmin;

try {
  adminController = require('../controllers/admin.controller');
  console.log('✓ Admin controller loaded');
} catch (error) {
  console.error('✗ Error loading admin controller:', error);
  throw error;
}

try {
  orderController = require('../controllers/order.controller');
  console.log('✓ Order controller (admin) loaded');
} catch (error) {
  console.error('✗ Error loading order controller for admin routes:', error);
  throw error;
}

try {
  orderValidator = require('../validators/order.validator');
  console.log('✓ Order validators (admin) loaded');
} catch (error) {
  console.error('✗ Error loading order validators for admin routes:', error);
  throw error;
}

try {
  validate = require('../middlewares/validate.middleware');
  const authMiddleware = require('../middlewares/auth.middleware');
  const roleMiddleware = require('../middlewares/role.middleware');
  protect = authMiddleware.protect;
  isAdmin = roleMiddleware.isAdmin;
  console.log('✓ Admin middlewares loaded');
} catch (error) {
  console.error('✗ Error loading middlewares:', error);
  throw error;
}

/**
 * @route   GET /api/admin/stats
 * @desc    Lấy thống kê tổng quan (admin only)
 * @access  Private/Admin
 */
router.get(
  '/stats',
  protect,
  isAdmin,
  adminController.getStats
);

/**
 * @route   GET /api/admin/orders
 * @desc    Lấy danh sách đơn hàng (admin)
 * @access  Private/Admin
 */
router.get(
  '/orders',
  protect,
  isAdmin,
  orderValidator.adminGetOrdersValidator,
  validate,
  orderController.getAdminOrders
);

/**
 * @route   PATCH /api/admin/orders/:id/status
 * @desc    Cập nhật trạng thái đơn hàng (admin)
 * @access  Private/Admin
 */
router.patch(
  '/orders/:id/status',
  protect,
  isAdmin,
  orderValidator.updateOrderStatusValidator,
  validate,
  orderController.updateOrderStatus
);

module.exports = router;

