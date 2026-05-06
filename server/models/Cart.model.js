'use strict';

const mongoose = require('mongoose');
const toJSON = require('./plugins/toJSON.plugin');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  priceAtAdd: {
    type: Number,
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  totalItems: {
    type: Number,
    default: 0
  },
  subtotal: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

cartSchema.plugin(toJSON);

cartSchema.methods.calculateTotals = function() {
  this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
  this.subtotal = this.items.reduce((sum, item) => sum + (item.priceAtAdd * item.quantity), 0);
};

cartSchema.pre('save', function(next) {
  this.calculateTotals();
  next();
});

cartSchema.methods.addItem = async function(productId, quantity, price) {
  const existingItem = this.items.find(item => item.product.toString() === productId.toString());
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.items.push({
      product: productId,
      quantity,
      priceAtAdd: price,
      addedAt: new Date()
    });
  }
  
  return this.save();
};

cartSchema.methods.updateItemQuantity = async function(productId, quantity) {
  const item = this.items.find(item => item.product.toString() === productId.toString());
  
  if (!item) {
    throw new Error('Item not found in cart');
  }
  
  if (quantity <= 0) {
    this.items = this.items.filter(item => item.product.toString() !== productId.toString());
  } else {
    item.quantity = quantity;
  }
  
  return this.save();
};

cartSchema.methods.removeItem = async function(productId) {
  this.items = this.items.filter(item => item.product.toString() !== productId.toString());
  return this.save();
};

cartSchema.methods.clearCart = async function() {
  this.items = [];
  return this.save();
};

module.exports = mongoose.model('Cart', cartSchema);
