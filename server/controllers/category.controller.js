'use strict';

const { Category } = require('../models');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

/**
 * Lấy danh sách category (flat)
 * GET /api/categories
 */
const getCategories = catchAsync(async (req, res, next) => {
  const categories = await Category.find({ isDeleted: false })
    .populate('parent', 'name slug')
    .sort({ level: 1, name: 1 });

  res.status(200).json(
    ApiResponse.success(
      { categories },
      'Categories retrieved successfully'
    )
  );
});

/**
 * Lấy cây danh mục (parent/child)
 * GET /api/categories/tree
 */
const getCategoryTree = catchAsync(async (req, res, next) => {
  const tree = await Category.getTree();

  res.status(200).json(
    ApiResponse.success(
      { categories: tree },
      'Category tree retrieved successfully'
    )
  );
});

/**
 * Lấy chi tiết category
 * GET /api/categories/:id
 */
const getCategoryById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const category = await Category.findOne({ _id: id, isDeleted: false })
    .populate('parent', 'name slug level');

  if (!category) {
    throw ApiError.notFound('Category not found');
  }

  res.status(200).json(
    ApiResponse.success(
      { category },
      'Category retrieved successfully'
    )
  );
});

/**
 * Tạo category mới (admin only)
 * POST /api/categories
 */
const createCategory = catchAsync(async (req, res, next) => {
  const { name, description, parent, image } = req.body;

  // Kiểm tra name unique
  const existingCategory = await Category.findOne({ name, isDeleted: false });
  if (existingCategory) {
    throw ApiError.conflict('Category name already exists');
  }

  // Kiểm tra parent nếu có
  if (parent) {
    const parentCategory = await Category.findOne({ _id: parent, isDeleted: false });
    if (!parentCategory) {
      throw ApiError.notFound('Parent category not found');
    }
  }

  const category = await Category.create({
    name,
    description,
    parent: parent || null,
    image
  });

  // Populate parent để trả về
  await category.populate('parent', 'name slug level');

  res.status(201).json(
    ApiResponse.created(
      { category },
      'Category created successfully'
    )
  );
});

/**
 * Cập nhật category (admin only)
 * PATCH /api/categories/:id
 */
const updateCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { name, description, parent, image } = req.body;

  const category = await Category.findOne({ _id: id, isDeleted: false });

  if (!category) {
    throw ApiError.notFound('Category not found');
  }

  // Kiểm tra name unique nếu có thay đổi
  if (name && name !== category.name) {
    const existingCategory = await Category.findOne({ 
      name, 
      _id: { $ne: id },
      isDeleted: false 
    });
    if (existingCategory) {
      throw ApiError.conflict('Category name already exists');
    }
    category.name = name;
    // Slug sẽ được tự động cập nhật trong pre-save hook
  }

  // Kiểm tra parent nếu có thay đổi
  if (parent !== undefined) {
    if (parent === null) {
      category.parent = null;
      category.level = 0;
    } else {
      // Không cho phép set parent là chính nó
      if (parent === id) {
        throw ApiError.badRequest('Category cannot be its own parent');
      }

      // Không cho phép set parent là con của nó (tránh circular reference)
      const isDescendant = await checkIfDescendant(id, parent);
      if (isDescendant) {
        throw ApiError.badRequest('Cannot set a descendant category as parent');
      }

      const parentCategory = await Category.findOne({ _id: parent, isDeleted: false });
      if (!parentCategory) {
        throw ApiError.notFound('Parent category not found');
      }
      category.parent = parent;
      // Level sẽ được tự động cập nhật trong pre-save hook
    }
  }

  if (description !== undefined) category.description = description;
  if (image !== undefined) category.image = image;

  await category.save();
  await category.populate('parent', 'name slug level');

  res.status(200).json(
    ApiResponse.success(
      { category },
      'Category updated successfully'
    )
  );
});

/**
 * Soft delete category (admin only)
 * DELETE /api/categories/:id
 */
const deleteCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const category = await Category.findOne({ _id: id, isDeleted: false });

  if (!category) {
    throw ApiError.notFound('Category not found');
  }

  // Kiểm tra xem category có con không
  const hasChildren = await Category.findOne({ 
    parent: id, 
    isDeleted: false 
  });

  if (hasChildren) {
    throw ApiError.badRequest('Cannot delete category with child categories. Please delete or move child categories first.');
  }

  // Kiểm tra xem có sản phẩm nào đang sử dụng category này không
  const { Product } = require('../models');
  const hasProducts = await Product.findOne({ 
    category: id, 
    isDeleted: false 
  });

  if (hasProducts) {
    throw ApiError.badRequest('Cannot delete category that has products. Please remove or reassign products first.');
  }

  category.isDeleted = true;
  await category.save();

  res.status(200).json(
    ApiResponse.success(
      null,
      'Category deleted successfully'
    )
  );
});

/**
 * Helper function: Kiểm tra xem một category có phải là con cháu của category khác không
 */
const checkIfDescendant = async (ancestorId, descendantId) => {
  let currentId = descendantId;
  const maxDepth = 10; // Giới hạn độ sâu để tránh vòng lặp vô hạn
  let depth = 0;

  while (currentId && depth < maxDepth) {
    const category = await Category.findById(currentId).select('parent');
    if (!category || !category.parent) {
      return false;
    }
    if (String(category.parent) === String(ancestorId)) {
      return true;
    }
    currentId = category.parent;
    depth++;
  }

  return false;
};

module.exports = {
  getCategories,
  getCategoryTree,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};


