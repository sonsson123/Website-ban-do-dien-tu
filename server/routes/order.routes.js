'use strict';

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const orderValidator = require('../validators/order.validator');
const validate = require('../middlewares/validate.middleware');
const { protect } = require('../middlewares/auth.middleware');

/**
 * @route   POST /api/orders
 * @desc    Tạo đơn hàng mới từ giỏ hàng hiện tại
 * @access  Private
 */
router.post(
  '/',
  protect,
  orderController.createOrder
);

/**
 * @route   GET /api/orders
 * @desc    Lấy danh sách đơn hàng của user hiện tại
 * @access  Private
 */
router.get(
  '/',
  protect,
  orderValidator.getMyOrdersValidator,
  validate,
  orderController.getMyOrders
);

/**
 * @route   GET /api/orders/:id
 * @desc    Lấy chi tiết đơn hàng của user hiện tại
 * @access  Private
 */
router.get(
  '/:id',
  protect,
  orderValidator.getOrderByIdValidator,
  validate,
  orderController.getOrderById
);

/**
 * @route   PATCH /api/orders/:id/cancel
 * @desc    Người dùng huỷ đơn của chính mình
 * @access  Private
 */
router.patch(
  '/:id/cancel',
  protect,
  orderController.cancelOrder
);

module.exports = router;



