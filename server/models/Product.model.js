'use strict';

const mongoose = require('mongoose');
const slugify = require('slugify');
const toJSON = require('./plugins/toJSON.plugin');
const softDelete = require('./plugins/softDelete.plugin');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: 0,
    default: 0
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  brand: {
    type: String,
    trim: true
  },
  images: [{
    type: String
  }],
  specifications: {
    type: Map,
    of: String
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numReviews: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

productSchema.plugin(toJSON);
productSchema.plugin(softDelete);

// Indexes
productSchema.index({ category: 1 });
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ averageRating: -1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });

productSchema.virtual('priceAfterDiscount').get(function() {
  return this.price * (1 - this.discount / 100);
});

productSchema.virtual('inStock').get(function() {
  return this.stock > 0;
});

productSchema.pre('save', async function(next) {
  if (this.isModified('name')) {
    const baseSlug = slugify(this.name, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;
    
    while (await this.constructor.findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    this.slug = slug;
  }
  next();
});

productSchema.statics.calcAverageRating = async function(productId) {
  const Review = mongoose.model('Review');
  const stats = await Review.aggregate([
    { $match: { product: productId, isDeleted: false } },
    {
      $group: {
        _id: '$product',
        avgRating: { $avg: '$rating' },
        numReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await this.findByIdAndUpdate(productId, {
      averageRating: Math.round(stats[0].avgRating * 10) / 10,
      numReviews: stats[0].numReviews
    });
  } else {
    await this.findByIdAndUpdate(productId, {
      averageRating: 0,
      numReviews: 0
    });
  }
};

module.exports = mongoose.model('Product', productSchema);
