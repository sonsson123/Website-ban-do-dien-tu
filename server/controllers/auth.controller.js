'use strict';

const jwt = require('jsonwebtoken');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

const resolveCookieSameSite = () => {
  if (process.env.COOKIE_SAMESITE) {
    return process.env.COOKIE_SAMESITE;
  }
  return process.env.CORS_ORIGIN ? 'none' : 'lax';
};

const getCookieOptions = () => {
  const sameSite = resolveCookieSameSite();
  const baseSecure = process.env.NODE_ENV === 'production';
  const secure = sameSite === 'none' ? true : baseSecure;

  return {
    expires: new Date(Date.now() + COOKIE_MAX_AGE),
    httpOnly: true,
    secure,
    sameSite
  };
};

const clearCookieOptions = () => {
  const sameSite = resolveCookieSameSite();
  const baseSecure = process.env.NODE_ENV === 'production';
  const secure = sameSite === 'none' ? true : baseSecure;

  return {
    httpOnly: true,
    secure,
    sameSite
  };
};

const attachAuthCookies = (res, accessToken, refreshToken) => {
  const cookieOptions = getCookieOptions();
  res.cookie('accessToken', accessToken, cookieOptions);
  res.cookie('refreshToken', refreshToken, cookieOptions);
};

const clearAuthCookies = (res) => {
  const options = clearCookieOptions();
  res.clearCookie('accessToken', options);
  res.clearCookie('refreshToken', options);
};

const verifyToken = (token, secret, expiredMessage = 'Token expired', invalidMessage = 'Invalid token') => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw ApiError.unauthorized(expiredMessage);
    }
    throw ApiError.unauthorized(invalidMessage);
  }
};

const buildAuthResponse = (user, accessToken, refreshToken) => ({
  user: user.toJSON(),
  tokens: {
    accessToken,
    refreshToken
  }
});

/**
 * Đăng ký tài khoản mới
 * POST /api/auth/register
 */
const register = catchAsync(async (req, res, next) => {
  const { email, password, fullName, phone, username } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw ApiError.conflict('Email already exists');
  }

  if (username) {
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      throw ApiError.conflict('Username already exists');
    }
  }

  const user = await User.create({
    email,
    password,
    fullName,
    phone,
    username
  });

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  attachAuthCookies(res, accessToken, refreshToken);

  res.status(201).json(
    ApiResponse.created(
      buildAuthResponse(user, accessToken, refreshToken),
      'Registration successful'
    )
  );
});

/**
 * Đăng nhập
 * POST /api/auth/login
 */
const login = catchAsync(async (req, res, next) => {
  const { email: loginInput, password } = req.body;
  const identifier = (loginInput || '').trim();

  const lookupQuery = {
    $or: [
      { email: identifier.toLowerCase() },
      { username: identifier }
    ]
  };

  const user = await User.findOne(lookupQuery).select('+password');

  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (user.isDeleted) {
    throw ApiError.unauthorized('Account has been deleted');
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  attachAuthCookies(res, accessToken, refreshToken);

  res.status(200).json(
    ApiResponse.success(
      buildAuthResponse(user, accessToken, refreshToken),
      'Login successful'
    )
  );
});

/**
 * Đăng xuất
 * POST /api/auth/logout
 */
const logout = catchAsync(async (req, res, next) => {
  const incomingRefreshToken = req.body.refreshToken || (req.cookies && req.cookies.refreshToken);

  if (incomingRefreshToken) {
    const user = await User.findOne({ refreshToken: incomingRefreshToken }).select('+refreshToken');
    if (user) {
      user.refreshToken = undefined;
      await user.save({ validateBeforeSave: false });
    }
  }

  clearAuthCookies(res);

  res.status(200).json(
    ApiResponse.success(null, 'Logout successful')
  );
});

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
const refreshTokens = catchAsync(async (req, res, next) => {
  const incomingRefreshToken = req.body.refreshToken || (req.cookies && req.cookies.refreshToken);

  if (!incomingRefreshToken) {
    throw ApiError.badRequest('Refresh token is required');
  }

  const decoded = verifyToken(
    incomingRefreshToken,
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    'Refresh token expired',
    'Invalid refresh token'
  );

  const user = await User.findById(decoded.id).select('+refreshToken');

  if (!user || user.refreshToken !== incomingRefreshToken) {
    throw ApiError.unauthorized('Invalid refresh token');
  }

  if (user.isDeleted) {
    throw ApiError.unauthorized('User account has been deleted');
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  attachAuthCookies(res, accessToken, refreshToken);

  res.status(200).json(
    ApiResponse.success(
      buildAuthResponse(user, accessToken, refreshToken),
      'Token refreshed successfully'
    )
  );
});

/**
 * Quên mật khẩu
 * POST /api/auth/forgot-password
 */
const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user || user.isDeleted) {
    // Tránh lộ thông tin tài khoản
    return res.status(200).json(
      ApiResponse.success(null, 'If the email exists, a reset link has been sent')
    );
  }

  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const clientUrl = process.env.CLIENT_URL || process.env.APP_URL || 'http://localhost:3000';
  const resetUrl = `${clientUrl.replace(/\/+$/, '')}/reset-password?token=${resetToken}`;

  // TODO: tích hợp dịch vụ email thực tế
  console.info(`[AUTH] Password reset link for ${user.email}: ${resetUrl}`);

  res.status(200).json(
    ApiResponse.success(
      process.env.NODE_ENV !== 'production'
        ? { resetUrl }
        : null,
      'Password reset instructions have been sent'
    )
  );
});

/**
 * Đặt lại mật khẩu
 * POST /api/auth/reset-password
 */
const resetPassword = catchAsync(async (req, res, next) => {
  const { token, password } = req.body;

  if (!token) {
    throw ApiError.badRequest('Reset token is required');
  }

  verifyToken(token, process.env.JWT_SECRET, 'Reset token expired', 'Invalid reset token');

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpire: { $gt: Date.now() }
  }).select('+password +refreshToken');

  if (!user) {
    throw ApiError.unauthorized('Invalid or expired reset token');
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save();

  attachAuthCookies(res, accessToken, refreshToken);

  res.status(200).json(
    ApiResponse.success(
      buildAuthResponse(user, accessToken, refreshToken),
      'Password reset successful'
    )
  );
});

/**
 * Đổi mật khẩu
 * POST /api/auth/change-password
 */
const changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password +refreshToken');

  if (!user) {
    throw ApiError.unauthorized('User not found');
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw ApiError.unauthorized('Current password is incorrect');
  }

  user.password = newPassword;

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save();

  attachAuthCookies(res, accessToken, refreshToken);

  res.status(200).json(
    ApiResponse.success(
      buildAuthResponse(user, accessToken, refreshToken),
      'Password changed successfully'
    )
  );
});

/**
 * Lấy thông tin user hiện tại
 * GET /api/auth/me
 */
const getMe = catchAsync(async (req, res, next) => {
  const user = req.user;

  res.status(200).json(
    ApiResponse.success(
      { user },
      'User information retrieved successfully'
    )
  );
});

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  changePassword,
  getMe
};