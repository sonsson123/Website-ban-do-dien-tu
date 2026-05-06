'use strict';

const mongoose = require('mongoose');
const toJSON = require('./plugins/toJSON.plugin');

const orderItemSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  productImage: {
    type: String
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  subtotal: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

orderItemSchema.plugin(toJSON);

orderItemSchema.index({ order: 1 });
orderItemSchema.index({ product: 1 });

orderItemSchema.pre('save', function(next) {
  this.subtotal = this.price * this.quantity;
  next();
});

module.exports = mongoose.model('OrderItem', orderItemSchema);
