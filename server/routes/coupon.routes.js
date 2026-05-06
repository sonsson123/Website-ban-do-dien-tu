'use strict';

const express = require('express');
const router = express.Router();

// Import với error handling
let couponController;
let couponValidator;
let validate;
let protect;
let isAdmin;

try {
  couponController = require('../controllers/coupon.controller');
  console.log('✓ Coupon controller loaded');
} catch (error) {
  console.error('✗ Error loading coupon controller:', error);
  throw error;
}

try {
  couponValidator = require('../validators/coupon.validator');
  console.log('✓ Coupon validators loaded');
} catch (error) {
  console.error('✗ Error loading coupon validators:', error);
  throw error;
}

try {
  validate = require('../middlewares/validate.middleware');
  const authMiddleware = require('../middlewares/auth.middleware');
  const roleMiddleware = require('../middlewares/role.middleware');
  protect = authMiddleware.protect;
  isAdmin = roleMiddleware.isAdmin;
  console.log('✓ Coupon middlewares loaded');
} catch (error) {
  console.error('✗ Error loading middlewares:', error);
  throw error;
}

/**
 * @route   POST /api/coupons/validate
 * @desc    Kiểm tra mã giảm giá
 * @access  Public (có thể thêm protect nếu muốn)
 */
router.post(
  '/validate',
  couponValidator.validateCouponValidator,
  validate,
  couponController.validateCoupon
);

/**
 * @route   GET /api/coupons
 * @desc    Lấy danh sách coupon (admin only)
 * @access  Private/Admin
 */
router.get(
  '/',
  protect,
  isAdmin,
  couponValidator.getCouponsValidator,
  validate,
  couponController.getCoupons
);

/**
 * @route   POST /api/coupons
 * @desc    Tạo coupon mới (admin only)
 * @access  Private/Admin
 */
router.post(
  '/',
  protect,
  isAdmin,
  couponValidator.createCouponValidator,
  validate,
  couponController.createCoupon
);

/**
 * @route   PATCH /api/coupons/:id
 * @desc    Cập nhật coupon (admin only)
 * @access  Private/Admin
 */
router.patch(
  '/:id',
  protect,
  isAdmin,
  couponValidator.updateCouponValidator,
  validate,
  couponController.updateCoupon
);

/**
 * @route   DELETE /api/coupons/:id
 * @desc    Xóa coupon (admin only)
 * @access  Private/Admin
 */
router.delete(
  '/:id',
  protect,
  isAdmin,
  couponValidator.deleteCouponValidator,
  validate,
  couponController.deleteCoupon
);

module.exports = router;

