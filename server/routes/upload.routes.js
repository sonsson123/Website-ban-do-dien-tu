'use strict';

const express = require('express');
const router = express.Router();
const upload = require('../config/multer');

// Import với error handling
let uploadController;
let protect;
let isAdmin;

try {
  uploadController = require('../controllers/upload.controller');
  console.log('✓ Upload controller loaded');
} catch (error) {
  console.error('✗ Error loading upload controller:', error);
  throw error;
}

try {
  const authMiddleware = require('../middlewares/auth.middleware');
  const roleMiddleware = require('../middlewares/role.middleware');
  protect = authMiddleware.protect;
  isAdmin = roleMiddleware.isAdmin;
  console.log('✓ Upload middlewares loaded');
} catch (error) {
  console.error('✗ Error loading middlewares:', error);
  throw error;
}

/**
 * @route   POST /api/uploads/images
 * @desc    Upload ảnh lên Cloudinary (single hoặc multiple)
 * @access  Private (có thể thay đổi thành public nếu cần)
 */
router.post(
  '/images',
  protect,
  upload.array('images', 10), // Tối đa 10 ảnh, field name: 'images'
  uploadController.uploadImages
);

/**
 * Upload ảnh danh mục
 */
router.post(
  '/categories',
  protect,
  isAdmin,
  upload.single('image'),
  uploadController.uploadCategoryImage
);

/**
 * @route   DELETE /api/uploads/:publicId
 * @desc    Xóa ảnh khỏi Cloudinary
 * @access  Private
 */
router.delete(
  '/:publicId',
  protect,
  uploadController.deleteImage
);

module.exports = router;

