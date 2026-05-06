'use strict';

const ApiError = require('../utils/ApiError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return ApiError.badRequest(message);
};

const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `Duplicate field value: ${field} = '${value}'. Please use another value`;
  return ApiError.conflict(message);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return ApiError.badRequest(message);
};

const handleJWTError = () => ApiError.unauthorized('Invalid token. Please log in again');

const handleJWTExpiredError = () => ApiError.unauthorized('Your token has expired. Please log in again');

const sendErrorDev = (err, res) => {
  const response = {
    success: false,
    status: err.statusCode,
    message: err.message,
    error: err,
    stack: err.stack
  };
  if (err.data) {
    response.data = err.data;
  }
  res.status(err.statusCode).json(response);
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    const response = {
      success: false,
      status: err.statusCode,
      message: err.message
    };
    if (err.data) {
      response.data = err.data;
    }
    res.status(err.statusCode).json(response);
  } else {
    console.error('ERROR 💥', err);
    res.status(500).json({
      success: false,
      status: 500,
      message: 'Something went wrong'
    });
  }
};

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

const notFound = (req, res, next) => {
  const error = ApiError.notFound(`Route ${req.originalUrl} not found`);
  next(error);
};

module.exports = { errorHandler, notFound };
