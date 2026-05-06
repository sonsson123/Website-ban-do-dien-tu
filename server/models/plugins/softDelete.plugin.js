'use strict';

const softDelete = (schema) => {
  schema.add({
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    },
    deletedAt: {
      type: Date,
      default: null
    }
  });

  schema.pre(/^find/, function(next) {
    if (!this.getOptions().includeDeleted) {
      this.where({ isDeleted: false });
    }
    next();
  });

  schema.methods.softDelete = function() {
    this.isDeleted = true;
    this.deletedAt = new Date();
    return this.save();
  };

  schema.methods.restore = function() {
    this.isDeleted = false;
    this.deletedAt = null;
    return this.save();
  };

  schema.statics.findDeleted = function() {
    return this.find({ isDeleted: true });
  };

  schema.statics.findWithDeleted = function() {
    return this.find().setOptions({ includeDeleted: true });
  };
};

module.exports = softDelete;
