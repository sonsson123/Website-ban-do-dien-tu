'use strict';

const express = require('express');
const router = express.Router();

// Import với error handling
let register, login, logout, refreshTokens, forgotPassword, resetPassword, changePassword, getMe;
let registerValidator, loginValidator, forgotPasswordValidator, resetPasswordValidator, changePasswordValidator;
let validate;
let protect;

try {
  const authController = require('../controllers/auth.controller');
  register = authController.register;
  login = authController.login;
  logout = authController.logout;
  refreshTokens = authController.refreshTokens;
  forgotPassword = authController.forgotPassword;
  resetPassword = authController.resetPassword;
  changePassword = authController.changePassword;
  getMe = authController.getMe;
  console.log('✓ Auth controller loaded');
} catch (error) {
  console.error('✗ Error loading auth controller:', error);
  throw error;
}

try {
  const authValidator = require('../validators/auth.validator');
  registerValidator = authValidator.registerValidator;
  loginValidator = authValidator.loginValidator;
  forgotPasswordValidator = authValidator.forgotPasswordValidator;
  resetPasswordValidator = authValidator.resetPasswordValidator;
  changePasswordValidator = authValidator.changePasswordValidator;
  console.log('✓ Auth validators loaded');
} catch (error) {
  console.error('✗ Error loading auth validators:', error);
  throw error;
}

try {
  validate = require('../middlewares/validate.middleware');
  const authMiddleware = require('../middlewares/auth.middleware');
  protect = authMiddleware.protect;
  console.log('✓ Auth middlewares loaded');
} catch (error) {
  console.error('✗ Error loading middlewares:', error);
  throw error;
}

/**
 * @route   POST /api/auth/register
 * @desc    Đăng ký tài khoản mới
 * @access  Public
 */
router.post('/register', registerValidator, validate, register);

/**
 * @route   POST /api/auth/login
 * @desc    Đăng nhập
 * @access  Public
 */
router.post('/login', loginValidator, validate, login);

/**
 * @route   POST /api/auth/logout
 * @desc    Đăng xuất
 * @access  Private
 */
router.post('/logout', protect, logout);

/**
 * @route   POST /api/auth/refresh
 * @desc    Cấp lại access token từ refresh token
 * @access  Public
 */
router.post('/refresh', refreshTokens);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Gửi email đặt lại mật khẩu
 * @access  Public
 */
router.post('/forgot-password', forgotPasswordValidator, validate, forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Đặt lại mật khẩu bằng reset token
 * @access  Public
 */
router.post('/reset-password', resetPasswordValidator, validate, resetPassword);

/**
 * @route   POST /api/auth/change-password
 * @desc    Người dùng đổi mật khẩu
 * @access  Private
 */
router.post('/change-password', protect, changePasswordValidator, validate, changePassword);

/**
 * @route   GET /api/auth/me
 * @desc    Lấy thông tin user hiện tại
 * @access  Private
 */
router.get('/me', protect, getMe);

module.exports = router;