'use strict';

const express = require('express');
const router = express.Router();

// Import với error handling
let cartController;
let cartValidator;
let validate;
let protect;

try {
  cartController = require('../controllers/cart.controller');
  console.log('✓ Cart controller loaded');
} catch (error) {
  console.error('✗ Error loading cart controller:', error);
  throw error;
}

try {
  cartValidator = require('../validators/cart.validator');
  console.log('✓ Cart validators loaded');
} catch (error) {
  console.error('✗ Error loading cart validators:', error);
  throw error;
}

try {
  validate = require('../middlewares/validate.middleware');
  const authMiddleware = require('../middlewares/auth.middleware');
  protect = authMiddleware.protect;
  console.log('✓ Cart middlewares loaded');
} catch (error) {
  console.error('✗ Error loading middlewares:', error);
  throw error;
}

/**
 * @route   GET /api/cart
 * @desc    Lấy giỏ hàng của user
 * @access  Private
 */
router.get('/', protect, cartController.getCart);

/**
 * @route   POST /api/cart/items
 * @desc    Thêm hoặc tăng qty của item trong cart
 * @access  Private
 */
router.post(
  '/items',
  protect,
  cartValidator.addCartItemValidator,
  validate,
  cartController.addCartItem
);

/**
 * @route   PUT /api/cart/items/:productId
 * @desc    Set số lượng chính xác cho item
 * @access  Private
 */
router.put(
  '/items/:productId',
  protect,
  cartValidator.updateCartItemValidator,
  validate,
  cartController.updateCartItem
);

/**
 * @route   DELETE /api/cart/items/:productId
 * @desc    Xóa 1 item khỏi cart
 * @access  Private
 */
router.delete(
  '/items/:productId',
  protect,
  cartValidator.removeCartItemValidator,
  validate,
  cartController.removeCartItem
);

/**
 * @route   DELETE /api/cart
 * @desc    Clear toàn bộ cart
 * @access  Private
 */
router.delete('/', protect, cartController.clearCart);

module.exports = router;

