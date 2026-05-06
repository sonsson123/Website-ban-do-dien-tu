'use strict';

const express = require('express');
const router = express.Router();

// Import với error handling
let reviewController;
let reviewValidator;
let validate;
let protect;
let isAdmin;

try {
  reviewController = require('../controllers/review.controller');
  console.log('✓ Review controller loaded');
} catch (error) {
  console.error('✗ Error loading review controller:', error);
  throw error;
}

try {
  reviewValidator = require('../validators/review.validator');
  console.log('✓ Review validators loaded');
} catch (error) {
  console.error('✗ Error loading review validators:', error);
  throw error;
}

try {
  validate = require('../middlewares/validate.middleware');
  const authMiddleware = require('../middlewares/auth.middleware');
  const roleMiddleware = require('../middlewares/role.middleware');
  protect = authMiddleware.protect;
  isAdmin = roleMiddleware.isAdmin;
  console.log('✓ Review middlewares loaded');
} catch (error) {
  console.error('✗ Error loading middlewares:', error);
  throw error;
}

/**
 * @route   GET /api/products/:productId/reviews
 * @desc    Lấy danh sách review của sản phẩm
 * @access  Public
 */
router.get(
  '/products/:productId/reviews',
  reviewValidator.getProductReviewsValidator,
  validate,
  reviewController.getProductReviews
);

/**
 * @route   POST /api/products/:productId/reviews
 * @desc    Tạo review mới (chỉ user đã mua hàng)
 * @access  Private
 */
router.post(
  '/products/:productId/reviews',
  protect,
  reviewValidator.createReviewValidator,
  validate,
  reviewController.createReview
);

/**
 * @route   PATCH /api/reviews/:id
 * @desc    Cập nhật review (owner/admin only)
 * @access  Private
 */
router.patch(
  '/reviews/:id',
  protect,
  reviewValidator.updateReviewValidator,
  validate,
  reviewController.updateReview
);

/**
 * @route   DELETE /api/reviews/:id
 * @desc    Xóa review (owner/admin only)
 * @access  Private
 */
router.delete(
  '/reviews/:id',
  protect,
  reviewValidator.deleteReviewValidator,
  validate,
  reviewController.deleteReview
);

module.exports = router;

