'use strict';

const { body, param, query } = require('express-validator');

const validateCouponValidator = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Coupon code is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Coupon code must be between 3 and 50 characters'),
  body('orderAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Order amount must be a positive number'),
  body('productIds')
    .optional()
    .isArray()
    .withMessage('Product IDs must be an array'),
  body('productIds.*')
    .optional()
    .isMongoId()
    .withMessage('Each product ID must be a valid MongoDB ObjectId'),
  body('userId')
    .optional()
    .isMongoId()
    .withMessage('User ID must be a valid MongoDB ObjectId')
];

const getCouponsValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('isActive')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('isActive must be true or false'),
  query('code')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Code search term must be between 1 and 50 characters')
];

const createCouponValidator = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Coupon code is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Coupon code must be between 3 and 50 characters'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Coupon name is required')
    .isLength({ max: 200 })
    .withMessage('Coupon name must not exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('discountType')
    .notEmpty()
    .withMessage('Discount type is required')
    .isIn(['percentage', 'fixed'])
    .withMessage('Discount type must be percentage or fixed'),
  body('discountValue')
    .notEmpty()
    .withMessage('Discount value is required')
    .isFloat({ min: 0 })
    .withMessage('Discount value must be a positive number'),
  body('minimumOrderAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum order amount must be a positive number'),
  body('maximumDiscountAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum discount amount must be a positive number'),
  body('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  body('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  body('usageLimit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Usage limit must be a positive integer'),
  body('usageLimitPerUser')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Usage limit per user must be a positive integer'),
  body('applicableTo')
    .optional()
    .isIn(['all', 'categories', 'products'])
    .withMessage('Applicable to must be all, categories, or products'),
  body('categories')
    .optional()
    .isArray()
    .withMessage('Categories must be an array'),
  body('categories.*')
    .optional()
    .isMongoId()
    .withMessage('Each category ID must be a valid MongoDB ObjectId'),
  body('products')
    .optional()
    .isArray()
    .withMessage('Products must be an array'),
  body('products.*')
    .optional()
    .isMongoId()
    .withMessage('Each product ID must be a valid MongoDB ObjectId'),
  body('applicableToUsers')
    .optional()
    .isIn(['all', 'specific', 'first_time'])
    .withMessage('Applicable to users must be all, specific, or first_time'),
  body('specificUsers')
    .optional()
    .isArray()
    .withMessage('Specific users must be an array'),
  body('specificUsers.*')
    .optional()
    .isMongoId()
    .withMessage('Each user ID must be a valid MongoDB ObjectId'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

const updateCouponValidator = [
  param('id')
    .notEmpty()
    .withMessage('Coupon ID is required')
    .isMongoId()
    .withMessage('Invalid coupon ID'),
  body('code')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Coupon code must be between 3 and 50 characters'),
  body('name')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Coupon name must not exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('discountType')
    .optional()
    .isIn(['percentage', 'fixed'])
    .withMessage('Discount type must be percentage or fixed'),
  body('discountValue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount value must be a positive number'),
  body('minimumOrderAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum order amount must be a positive number'),
  body('maximumDiscountAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum discount amount must be a positive number'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  body('usageLimit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Usage limit must be a positive integer'),
  body('usageLimitPerUser')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Usage limit per user must be a positive integer'),
  body('applicableTo')
    .optional()
    .isIn(['all', 'categories', 'products'])
    .withMessage('Applicable to must be all, categories, or products'),
  body('categories')
    .optional()
    .isArray()
    .withMessage('Categories must be an array'),
  body('categories.*')
    .optional()
    .isMongoId()
    .withMessage('Each category ID must be a valid MongoDB ObjectId'),
  body('products')
    .optional()
    .isArray()
    .withMessage('Products must be an array'),
  body('products.*')
    .optional()
    .isMongoId()
    .withMessage('Each product ID must be a valid MongoDB ObjectId'),
  body('applicableToUsers')
    .optional()
    .isIn(['all', 'specific', 'first_time'])
    .withMessage('Applicable to users must be all, specific, or first_time'),
  body('specificUsers')
    .optional()
    .isArray()
    .withMessage('Specific users must be an array'),
  body('specificUsers.*')
    .optional()
    .isMongoId()
    .withMessage('Each user ID must be a valid MongoDB ObjectId'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

const deleteCouponValidator = [
  param('id')
    .notEmpty()
    .withMessage('Coupon ID is required')
    .isMongoId()
    .withMessage('Invalid coupon ID')
];

module.exports = {
  validateCouponValidator,
  getCouponsValidator,
  createCouponValidator,
  updateCouponValidator,
  deleteCouponValidator
};

