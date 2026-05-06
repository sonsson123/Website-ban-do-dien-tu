'use strict';

const mongoose = require('mongoose');
const toJSON = require('./plugins/toJSON.plugin');
const softDelete = require('./plugins/softDelete.plugin');

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: [true, 'Comment is required'],
    trim: true,
    maxlength: 1000
  },
  images: [{
    type: String
  }],
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },
  helpfulCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

reviewSchema.plugin(toJSON);
reviewSchema.plugin(softDelete);

reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ user: 1 });

reviewSchema.statics.checkVerifiedPurchase = async function(userId, productId) {
  const Order = mongoose.model('Order');
  const OrderItem = mongoose.model('OrderItem');
  
  const orders = await Order.find({
    user: userId,
    orderStatus: 'completed',
    isDeleted: false
  }).select('_id');
  
  const orderIds = orders.map(o => o._id);
  
  const orderItem = await OrderItem.findOne({
    order: { $in: orderIds },
    product: productId
  });
  
  return !!orderItem;
};

reviewSchema.post('save', async function() {
  const Product = mongoose.model('Product');
  await Product.calcAverageRating(this.product);
});

reviewSchema.post('remove', async function() {
  const Product = mongoose.model('Product');
  await Product.calcAverageRating(this.product);
});

reviewSchema.post('findOneAndUpdate', async function(doc) {
  if (doc) {
    const Product = mongoose.model('Product');
    await Product.calcAverageRating(doc.product);
  }
});

module.exports = mongoose.model('Review', reviewSchema);
