'use strict';

const express = require('express');
const router = express.Router();

// Import với error handling
let userController;
let userValidator;
let validate;
let protect;
let isAdmin;

try {
  userController = require('../controllers/user.controller');
  console.log('✓ User controller loaded');
} catch (error) {
  console.error('✗ Error loading user controller:', error);
  throw error;
}

try {
  userValidator = require('../validators/user.validator');
  console.log('✓ User validators loaded');
} catch (error) {
  console.error('✗ Error loading user validators:', error);
  throw error;
}

try {
    validate = require('../middlewares/validate.middleware');
    const authMiddleware = require('../middlewares/auth.middleware');
    const roleMiddleware = require('../middlewares/role.middleware');
    protect = authMiddleware.protect;
    isAdmin = roleMiddleware.isAdmin;
    console.log('✓ User middlewares loaded');
  } catch (error) {
    console.error('✗ Error loading middlewares:', error);
    throw error;
  }
  
  /**
   * @route   GET /api/users/me
   * @desc    Lấy thông tin người dùng hiện tại
   * @access  Private
   */
  router.get('/me', protect, userController.getCurrentUser);

  /**
 * @route   PATCH /api/users/me
 * @desc    Cập nhật hồ sơ người dùng hiện tại
 * @access  Private
 */
router.patch(
    '/me',
    protect,
    userValidator.updateProfileValidator,
    validate,
    userController.updateCurrentUser
  );
  

  /**
 * @route   GET /api/users/me/addresses
 * @desc    Lấy danh sách địa chỉ giao hàng
 * @access  Private
 */
router.get('/me/addresses', protect, userController.getMyAddresses);

/**
 * @route   POST /api/users/me/addresses
 * @desc    Thêm địa chỉ giao hàng
 * @access  Private
 */
router.post(
  '/me/addresses',
  protect,
  userValidator.addAddressValidator,
  validate,
  userController.addAddress
);

/**
 * @route   PATCH /api/users/me/addresses/:addressId
 * @desc    Cập nhật địa chỉ
 * @access  Private
 */
router.patch(
    '/me/addresses/:addressId',
    protect,
    userValidator.updateAddressValidator,
    validate,
    userController.updateAddress
  );

  
  /**
 * @route   DELETE /api/users/me/addresses/:addressId
 * @desc    Xóa địa chỉ
 * @access  Private
 */
router.delete(
    '/me/addresses/:addressId',
    protect,
    userValidator.deleteAddressValidator,
    validate,
    userController.deleteAddress
  );

  /**
 * @route   GET /api/users
 * @desc    Lấy danh sách users (admin only)
 * @access  Private/Admin
 */
router.get(
    '/',
    protect,
    isAdmin,
    userValidator.getUsersValidator,
    validate,
    userController.getUsers
  );

  
  /**
 * @route   PATCH /api/users/:id
 * @desc    Cập nhật user (admin only)
 * @access  Private/Admin
 */
router.patch(
    '/:id',
    protect,
    isAdmin,
    userValidator.updateUserValidator,
    validate,
    userController.updateUser
  );

  /**
 * @route   DELETE /api/users/:id
 * @desc    Soft delete user (admin only)
 * @access  Private/Admin
 */
router.delete(
    '/:id',
    protect,
    isAdmin,
    userValidator.deleteUserValidator,
    validate,
    userController.deleteUser
  );
  
  module.exports = router;

  
  
