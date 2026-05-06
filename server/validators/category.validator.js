'use strict';

const { body, param } = require('express-validator');

const createCategoryValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('parent')
    .optional()
    .isMongoId()
    .withMessage('Parent must be a valid MongoDB ObjectId'),
  body('image')
    .optional()
    .isURL()
    .withMessage('Image must be a valid URL')
];

const updateCategoryValidator = [
  param('id')
    .notEmpty()
    .withMessage('Category ID is required')
    .isMongoId()
    .withMessage('Invalid category ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('parent')
    .optional()
    .custom((value) => {
      // Cho phép null hoặc MongoDB ObjectId
      if (value === null || value === '') {
        return true;
      }
      // Kiểm tra format MongoDB ObjectId
      const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
      if (!mongoIdRegex.test(value)) {
        throw new Error('Parent must be a valid MongoDB ObjectId or null');
      }
      return true;
    }),
  body('image')
    .optional()
    .isURL()
    .withMessage('Image must be a valid URL')
];

const getCategoryByIdValidator = [
  param('id')
    .notEmpty()
    .withMessage('Category ID is required')
    .isMongoId()
    .withMessage('Invalid category ID')
];

const deleteCategoryValidator = [
  param('id')
    .notEmpty()
    .withMessage('Category ID is required')
    .isMongoId()
    .withMessage('Invalid category ID')
];

module.exports = {
  createCategoryValidator,
  updateCategoryValidator,
  getCategoryByIdValidator,
  deleteCategoryValidator
};


