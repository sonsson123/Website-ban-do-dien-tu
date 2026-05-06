'use strict';

const mongoose = require('mongoose');
const toJSON = require('./plugins/toJSON.plugin');
const softDelete = require('./plugins/softDelete.plugin');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  name: {
    type: String,
    required: [true, 'Coupon name is required'],
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: [true, 'Discount type is required'],
    default: 'percentage'
  },
  discountValue: {
    type: Number,
    required: [true, 'Discount value is required'],
    min: 0
  },
  minimumOrderAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  maximumDiscountAmount: {
    type: Number,
    default: null,
    min: 0
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  usageLimit: {
    type: Number,
    default: null, // null = unlimited
    min: 1
  },
  usedCount: {
    type: Number,
    default: 0,
    min: 0
  },
  usageLimitPerUser: {
    type: Number,
    default: 1,
    min: 1
  },
  applicableTo: {
    type: String,
    enum: ['all', 'categories', 'products'],
    default: 'all'
  },
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  applicableToUsers: {
    type: String,
    enum: ['all', 'specific', 'first_time'],
    default: 'all'
  },
  specificUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

couponSchema.plugin(toJSON);
couponSchema.plugin(softDelete);

couponSchema.index({ startDate: 1, endDate: 1 });
couponSchema.index({ isActive: 1, isDeleted: 1 });

/**
 * Kiểm tra coupon có hợp lệ không
 */
couponSchema.methods.isValid = async function(userId = null, orderAmount = 0, productIds = []) {
  const now = new Date();

  // Kiểm tra active và không bị xóa
  if (!this.isActive || this.isDeleted) {
    return { valid: false, message: 'Coupon is not active' };
  }

  // Kiểm tra thời gian
  if (now < this.startDate) {
    return { valid: false, message: 'Coupon has not started yet' };
  }

  if (now > this.endDate) {
    return { valid: false, message: 'Coupon has expired' };
  }

  // Kiểm tra usage limit
  if (this.usageLimit && this.usedCount >= this.usageLimit) {
    return { valid: false, message: 'Coupon usage limit has been reached' };
  }

  // Kiểm tra minimum order amount
  if (orderAmount < this.minimumOrderAmount) {
    return { 
      valid: false, 
      message: `Minimum order amount is ${this.minimumOrderAmount.toLocaleString('vi-VN')} VND` 
    };
  }

  // Kiểm tra applicable to products/categories
  if (this.applicableTo === 'products' && productIds.length > 0 && this.products.length > 0) {
    const applicableProductIds = this.products.map(p => {
      // Handle both ObjectId and populated object
      return p._id ? p._id.toString() : p.toString();
    });
    const hasApplicableProduct = productIds.some(id => applicableProductIds.includes(id.toString()));
    if (!hasApplicableProduct) {
      return { valid: false, message: 'Coupon is not applicable to selected products' };
    }
  }

  if (this.applicableTo === 'categories' && this.categories.length > 0 && productIds.length > 0) {
    const Product = mongoose.model('Product');
    const products = await Product.find({
      _id: { $in: productIds },
      isDeleted: false
    }).select('category');

    const couponCategoryIds = this.categories.map(cat => (cat._id ? cat._id.toString() : cat.toString()));
    const hasEligibleProduct = products.some(product => {
      if (!product.category) return false;
      return couponCategoryIds.includes(product.category.toString());
    });

    if (!hasEligibleProduct) {
      return { valid: false, message: 'Coupon is not applicable to selected products' };
    }
  }

  // Kiểm tra user restrictions
  if (userId) {
    if (this.applicableToUsers === 'specific' && this.specificUsers.length > 0) {
      const specificUserIds = this.specificUsers.map(u => {
        // Handle both ObjectId and populated object
        return u._id ? u._id.toString() : u.toString();
      });
      if (!specificUserIds.includes(userId.toString())) {
        return { valid: false, message: 'Coupon is not applicable to your account' };
      }
    }

    if (this.applicableToUsers === 'first_time') {
      // Cần check user đã từng đặt hàng chưa (sẽ implement sau nếu cần)
      // Tạm thời bỏ qua check này
    }
  }

  return { valid: true, message: 'Coupon is valid' };
};

/**
 * Tính discount amount
 */
couponSchema.methods.calculateDiscount = function(orderAmount) {
  let discountAmount = 0;

  if (this.discountType === 'percentage') {
    discountAmount = (orderAmount * this.discountValue) / 100;
    
    // Áp dụng maximum discount nếu có
    if (this.maximumDiscountAmount && discountAmount > this.maximumDiscountAmount) {
      discountAmount = this.maximumDiscountAmount;
    }
  } else if (this.discountType === 'fixed') {
    discountAmount = this.discountValue;
    
    // Không được vượt quá order amount
    if (discountAmount > orderAmount) {
      discountAmount = orderAmount;
    }
  }

  return Math.round(discountAmount);
};

/**
 * Tăng used count
 */
couponSchema.methods.incrementUsage = async function() {
  this.usedCount += 1;
  await this.save();
};

module.exports = mongoose.model('Coupon', couponSchema);

