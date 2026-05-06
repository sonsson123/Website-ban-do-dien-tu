'use strict';

const { body, param, query } = require('express-validator');

const createProductValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Product name must be between 3 and 200 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Product description is required')
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters long'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('discount')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Discount must be between 0 and 100'),
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isMongoId()
    .withMessage('Invalid category ID'),
  body('brand')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Brand name must not exceed 100 characters'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  body('specifications')
    .optional()
    .isObject()
    .withMessage('Specifications must be an object')
];

const updateProductValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid product ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Product name must be between 3 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters long'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('discount')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Discount must be between 0 and 100'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  body('category')
    .optional()
    .isMongoId()
    .withMessage('Invalid category ID'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

const getProductValidator = [
  param('slug')
    .trim()
    .notEmpty()
    .withMessage('Product slug is required')
];

const deleteProductValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid product ID')
];

const queryProductsValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Min price must be a positive number'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Max price must be a positive number'),
  query('category')
    .optional()
    .isMongoId()
    .withMessage('Invalid category ID'),
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Search query must be between 1 and 200 characters'),
  query('sort')
    .optional()
    .isIn(['price', '-price', 'createdAt', '-createdAt', 'averageRating', '-averageRating', 'name', '-name'])
    .withMessage('Invalid sort field')
];

const uploadImageValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid product ID')
];

const deleteImageValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid product ID'),
  param('publicId')
    .trim()
    .notEmpty()
    .withMessage('Public ID or image URL is required')
];

module.exports = {
  createProductValidator,
  updateProductValidator,
  getProductValidator,
  deleteProductValidator,
  queryProductsValidator,
  uploadImageValidator,
  deleteImageValidator
};
