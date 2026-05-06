'use strict';

const express = require('express');
const router = express.Router();
const upload = require('../config/multer');

// Import với error handling
let productController;
let productValidator;
let validate;
let protect;
let isAdmin;

try {
  productController = require('../controllers/product.controller');
  console.log('✓ Product controller loaded');
} catch (error) {
  console.error('✗ Error loading product controller:', error);
  throw error;
}

try {
  productValidator = require('../validators/product.validator');
  console.log('✓ Product validators loaded');
} catch (error) {
  console.error('✗ Error loading product validators:', error);
  throw error;
}

try {
  validate = require('../middlewares/validate.middleware');
  const authMiddleware = require('../middlewares/auth.middleware');
  const roleMiddleware = require('../middlewares/role.middleware');
  protect = authMiddleware.protect;
  isAdmin = roleMiddleware.isAdmin;
  console.log('✓ Product middlewares loaded');
} catch (error) {
  console.error('✗ Error loading middlewares:', error);
  throw error;
}

/**
 * @route   GET /api/products
 * @desc    Lấy danh sách sản phẩm với filter, sort, pagination
 * @access  Public
 */
router.get(
  '/',
  productValidator.queryProductsValidator,
  validate,
  productController.getProducts
);

/**
 * @route   GET /api/products/:slug
 * @desc    Lấy chi tiết sản phẩm theo slug
 * @access  Public
 */
router.get(
  '/:slug',
  productValidator.getProductValidator,
  validate,
  productController.getProductBySlug
);

/**
 * @route   POST /api/products
 * @desc    Tạo sản phẩm mới (admin only)
 * @access  Private/Admin
 */
router.post(
  '/',
  protect,
  isAdmin,
  productValidator.createProductValidator,
  validate,
  productController.createProduct
);

/**
 * @route   PATCH /api/products/:id
 * @desc    Cập nhật sản phẩm (admin only)
 * @access  Private/Admin
 */
router.patch(
  '/:id',
  protect,
  isAdmin,
  productValidator.updateProductValidator,
  validate,
  productController.updateProduct
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Soft delete sản phẩm (admin only)
 * @access  Private/Admin
 */
router.delete(
  '/:id',
  protect,
  isAdmin,
  productValidator.deleteProductValidator,
  validate,
  productController.deleteProduct
);

/**
 * @route   POST /api/products/:id/images
 * @desc    Upload ảnh bổ sung cho sản phẩm (admin only)
 * @access  Private/Admin
 */
router.post(
  '/:id/images',
  protect,
  isAdmin,
  productValidator.uploadImageValidator,
  validate,
  upload.array('images', 10), // Tối đa 10 ảnh
  productController.uploadProductImages
);

/**
 * @route   DELETE /api/products/:id/images/:publicId
 * @desc    Xóa ảnh từ sản phẩm (admin only)
 * @access  Private/Admin
 */
router.delete(
  '/:id/images/:publicId',
  protect,
  isAdmin,
  productValidator.deleteImageValidator,
  validate,
  productController.deleteProductImage
);

module.exports = router;


