'use strict';

const ApiError = require('../utils/ApiError');

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Not authenticated'));
    }

    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have permission to perform this action'));
    }

    next();
  };
};

const isAdmin = restrictTo('admin');

module.exports = { restrictTo, isAdmin };
