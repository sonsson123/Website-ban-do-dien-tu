'use strict';

const express = require('express');
const router = express.Router();

// Import với error handling
let categoryController;
let categoryValidator;
let validate;
let protect;
let isAdmin;

try {
  categoryController = require('../controllers/category.controller');
  console.log('✓ Category controller loaded');
} catch (error) {
  console.error('✗ Error loading category controller:', error);
  throw error;
}

try {
  categoryValidator = require('../validators/category.validator');
  console.log('✓ Category validators loaded');
} catch (error) {
  console.error('✗ Error loading category validators:', error);
  throw error;
}

try {
  validate = require('../middlewares/validate.middleware');
  const authMiddleware = require('../middlewares/auth.middleware');
  const roleMiddleware = require('../middlewares/role.middleware');
  protect = authMiddleware.protect;
  isAdmin = roleMiddleware.isAdmin;
  console.log('✓ Category middlewares loaded');
} catch (error) {
  console.error('✗ Error loading middlewares:', error);
  throw error;
}

/**
 * @route   GET /api/categories
 * @desc    Lấy danh sách category (flat)
 * @access  Public
 */
router.get('/', categoryController.getCategories);

/**
 * @route   GET /api/categories/tree
 * @desc    Lấy cây danh mục (parent/child)
 * @access  Public
 */
router.get('/tree', categoryController.getCategoryTree);

/**
 * @route   GET /api/categories/:id
 * @desc    Lấy chi tiết category
 * @access  Public
 */
router.get(
  '/:id',
  categoryValidator.getCategoryByIdValidator,
  validate,
  categoryController.getCategoryById
);

/**
 * @route   POST /api/categories
 * @desc    Tạo category mới (admin only)
 * @access  Private/Admin
 */
router.post(
  '/',
  protect,
  isAdmin,
  categoryValidator.createCategoryValidator,
  validate,
  categoryController.createCategory
);

/**
 * @route   PATCH /api/categories/:id
 * @desc    Cập nhật category (admin only)
 * @access  Private/Admin
 */
router.patch(
  '/:id',
  protect,
  isAdmin,
  categoryValidator.updateCategoryValidator,
  validate,
  categoryController.updateCategory
);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Soft delete category (admin only)
 * @access  Private/Admin
 */
router.delete(
  '/:id',
  protect,
  isAdmin,
  categoryValidator.deleteCategoryValidator,
  validate,
  categoryController.deleteCategory
);

module.exports = router;


