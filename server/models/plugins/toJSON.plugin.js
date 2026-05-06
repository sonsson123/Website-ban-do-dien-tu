'use strict';

const toJSON = (schema) => {
  schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
      delete ret.__v;
      if (ret.password) delete ret.password;
      if (ret.refreshToken) delete ret.refreshToken;
      if (ret.resetPasswordToken) delete ret.resetPasswordToken;
      return ret;
    }
  });
};

module.exports = toJSON;
