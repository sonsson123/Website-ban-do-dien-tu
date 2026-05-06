'use strict';

const mongoose = require('mongoose');
const toJSON = require('./plugins/toJSON.plugin');

const paymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  method: {
    type: String,
    enum: ['COD', 'cod', 'payos'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionCode: {
    type: String,
    unique: true,
    sparse: true
  },
  gatewayResponse: {
    type: mongoose.Schema.Types.Mixed
  },
  paidAt: Date,
  refundedAt: Date,
  refundAmount: {
    type: Number,
    default: 0
  },
  refundReason: String
}, {
  timestamps: true
});

paymentSchema.plugin(toJSON);

paymentSchema.index({ order: 1 });
paymentSchema.index({ status: 1 });

paymentSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'completed' && !this.paidAt) {
    this.paidAt = new Date();
  }
  if (this.isModified('status') && this.status === 'refunded' && !this.refundedAt) {
    this.refundedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
