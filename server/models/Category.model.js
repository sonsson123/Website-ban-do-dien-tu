'use strict';

const mongoose = require('mongoose');
const slugify = require('slugify');
const toJSON = require('./plugins/toJSON.plugin');
const softDelete = require('./plugins/softDelete.plugin');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    unique: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    trim: true
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  level: {
    type: Number,
    default: 0
  },
  image: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

categorySchema.plugin(toJSON);
categorySchema.plugin(softDelete);

categorySchema.index({ parent: 1 });

categorySchema.pre('save', async function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  
  if (this.isModified('parent') && this.parent) {
    const parentCat = await this.constructor.findById(this.parent);
    if (parentCat) {
      this.level = parentCat.level + 1;
    }
  }
  
  next();
});

categorySchema.statics.getTree = async function() {
  const categories = await this.find({ isDeleted: false }).lean();
  
  const buildTree = (parentId = null) => {
    return categories
      .filter(cat => String(cat.parent || null) === String(parentId))
      .map(cat => ({
        ...cat,
        children: buildTree(cat._id)
      }));
  };
  
  return buildTree();
};

module.exports = mongoose.model('Category', categorySchema);
