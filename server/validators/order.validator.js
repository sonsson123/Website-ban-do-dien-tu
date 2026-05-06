'use strict';

const { param, query, body } = require('express-validator');

const ORDER_STATUSES = ['pending', 'processing', 'completed', 'cancelled'];
const ADMIN_UPDATABLE_STATUSES = ['pending', 'processing', 'completed', 'cancelled'];
const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];

const paginationValidators = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

const getMyOrdersValidator = [
  ...paginationValidators,
  query('status')
    .optional()
    .isIn(ORDER_STATUSES)
    .withMessage(`Status must be one of: ${ORDER_STATUSES.join(', ')}`)
];

const getOrderByIdValidator = [
  param('id')
    .notEmpty()
    .withMessage('Order ID is required')
    .isMongoId()
    .withMessage('Invalid order ID')
];

const adminGetOrdersValidator = [
  ...paginationValidators,
  query('status')
    .optional()
    .isIn(ORDER_STATUSES)
    .withMessage(`Status must be one of: ${ORDER_STATUSES.join(', ')}`),
  query('paymentStatus')
    .optional()
    .isIn(PAYMENT_STATUSES)
    .withMessage(`Payment status must be one of: ${PAYMENT_STATUSES.join(', ')}`),
  query('user')
    .optional()
    .isMongoId()
    .withMessage('User ID must be a valid Mongo ID'),
  query('orderNumber')
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage('Order number search must be at least 3 characters'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('startDate must be a valid ISO8601 date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('endDate must be a valid ISO8601 date')
];

const updateOrderStatusValidator = [
  param('id')
    .notEmpty()
    .withMessage('Order ID is required')
    .isMongoId()
    .withMessage('Invalid order ID'),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(ADMIN_UPDATABLE_STATUSES)
    .withMessage(`Status must be one of: ${ADMIN_UPDATABLE_STATUSES.join(', ')}`),
  body('reason')
    .optional()
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Reason must be between 5 and 500 characters')
];

module.exports = {
  getMyOrdersValidator,
  getOrderByIdValidator,
  adminGetOrdersValidator,
  updateOrderStatusValidator
};



