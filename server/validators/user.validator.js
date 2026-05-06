'use strict';

const { body, param, query } = require('express-validator');

const updateProfileValidator = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('phone')
    .optional()
    .isMobilePhone('vi-VN')
    .withMessage('Please provide a valid Vietnamese phone number'),
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL'),
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores')
];

const addAddressValidator = [
    body('fullName')
      .trim()
      .notEmpty()
      .withMessage('Full name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Full name must be between 2 and 100 characters'),
    body('phone')
      .trim()
      .notEmpty()
      .withMessage('Phone is required')
      .isMobilePhone('vi-VN')
      .withMessage('Please provide a valid Vietnamese phone number'),
    body('street')
      .trim()
      .notEmpty()
      .withMessage('Street is required')
      .isLength({ min: 5, max: 200 })
      .withMessage('Street must be between 5 and 200 characters'),
    body('ward')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Ward must not exceed 100 characters'),
    body('district')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('District must not exceed 100 characters'),
    body('city')
      .trim()
      .notEmpty()
      .withMessage('City is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('City must be between 2 and 100 characters'),
    body('isDefault')
      .optional()
      .isBoolean()
      .withMessage('isDefault must be a boolean')
  ];

  const updateAddressValidator = [
    param('addressId')
      .notEmpty()
      .withMessage('Address ID is required')
      .isMongoId()
      .withMessage('Invalid address ID'),
    body('fullName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Full name must be between 2 and 100 characters'),
    body('phone')
      .optional()
      .isMobilePhone('vi-VN')
      .withMessage('Please provide a valid Vietnamese phone number'),
    body('street')
      .optional()
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage('Street must be between 5 and 200 characters'),
    body('ward')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Ward must not exceed 100 characters'),
    body('district')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('District must not exceed 100 characters'),
    body('city')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('City must be between 2 and 100 characters'),
    body('isDefault')
      .optional()
      .isBoolean()
      .withMessage('isDefault must be a boolean')
  ];

  const deleteAddressValidator = [
    param('addressId')
      .notEmpty()
      .withMessage('Address ID is required')
      .isMongoId()
      .withMessage('Invalid address ID')
  ];

  const getUsersValidator = [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('role')
      .optional()
      .isIn(['customer', 'admin'])
      .withMessage('Role must be one of: customer, admin'),
    query('isDeleted')
      .optional()
      .isIn(['true', 'false'])
      .withMessage('isDeleted must be true or false'),
    query('search')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Search term must be between 1 and 100 characters')
  ];

  const updateUserValidator = [
    param('id')
      .notEmpty()
      .withMessage('User ID is required')
      .isMongoId()
      .withMessage('Invalid user ID'),
    body('role')
      .optional()
      .isIn(['customer', 'admin'])
      .withMessage('Role must be one of: customer, admin'),
    body('isDeleted')
      .optional()
      .isBoolean()
      .withMessage('isDeleted must be a boolean'),
    body('fullName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Full name must be between 2 and 100 characters'),
    body('phone')
      .optional()
      .isMobilePhone('vi-VN')
      .withMessage('Please provide a valid Vietnamese phone number'),
    body('avatar')
      .optional()
      .isURL()
      .withMessage('Avatar must be a valid URL'),
    body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores')
];

const deleteUserValidator = [
    param('id')
      .notEmpty()
      .withMessage('User ID is required')
      .isMongoId()
      .withMessage('Invalid user ID')
  ];
  
  module.exports = {
    updateProfileValidator,
    addAddressValidator,
    updateAddressValidator,
    deleteAddressValidator,
    getUsersValidator,
    updateUserValidator,
    deleteUserValidator
  };
  