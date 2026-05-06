'use strict';

const { Coupon, Product, Category } = require('../models');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');
const { paginate, getPaginationMeta } = require('../utils/pagination');

/**
 * Kiểm tra mã giảm giá
 * POST /api/coupons/validate
 */
const validateCoupon = catchAsync(async (req, res, next) => {
  const { code, orderAmount, productIds, userId } = req.body;

  if (!code) {
    throw ApiError.badRequest('Coupon code is required');
  }

  const coupon = await Coupon.findOne({ 
    code: code.toUpperCase(), 
    isDeleted: false 
  })
    .populate('categories', 'name slug')
    .populate('products', 'name slug')
    .populate('specificUsers', 'fullName email');

  if (!coupon) {
    throw ApiError.notFound('Coupon not found');
  }

  // Validate coupon
  const validation = await coupon.isValid(userId || null, orderAmount || 0, productIds || []);

  if (!validation.valid) {
    return res.status(200).json(
      ApiResponse.success(
        {
          valid: false,
          message: validation.message,
          coupon: null
        },
        'Coupon validation failed'
      )
    );
  }

  // Tính discount amount nếu có orderAmount
  let discountAmount = 0;
  if (orderAmount) {
    discountAmount = coupon.calculateDiscount(orderAmount);
  }

  // Trả về thông tin coupon (không bao gồm sensitive data)
  const couponInfo = coupon.toJSON();
  delete couponInfo.specificUsers; // Không trả về danh sách users

  res.status(200).json(
    ApiResponse.success(
      {
        valid: true,
        message: 'Coupon is valid',
        coupon: couponInfo,
        discountAmount: orderAmount ? discountAmount : null,
        finalAmount: orderAmount ? orderAmount - discountAmount : null
      },
      'Coupon validated successfully'
    )
  );
});

/**
 * Lấy danh sách coupon (admin only)
 * GET /api/coupons
 */
const getCoupons = catchAsync(async (req, res, next) => {
  const { page, limit, isActive, code } = req.query;

  // Build query
  const query = { isDeleted: false };

  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  if (code) {
    query.code = { $regex: code.toUpperCase(), $options: 'i' };
  }

  // Get total count
  const total = await Coupon.countDocuments(query);

  // Paginate
  const { query: paginatedQuery, page: currentPage, limit: currentLimit } = paginate(
    Coupon.find(query)
      .populate('categories', 'name slug')
      .populate('products', 'name slug')
      .sort({ createdAt: -1 }),
    { page, limit }
  );

  const coupons = await paginatedQuery;

  res.status(200).json(
    ApiResponse.success(
      {
        coupons,
        pagination: getPaginationMeta(total, currentPage, currentLimit)
      },
      'Coupons retrieved successfully'
    )
  );
});

/**
 * Tạo coupon mới (admin only)
 * POST /api/coupons
 */
const createCoupon = catchAsync(async (req, res, next) => {
  const {
    code,
    name,
    description,
    discountType,
    discountValue,
    minimumOrderAmount,
    maximumDiscountAmount,
    startDate,
    endDate,
    usageLimit,
    usageLimitPerUser,
    applicableTo,
    categories,
    products,
    applicableToUsers,
    specificUsers,
    isActive
  } = req.body;

  // Kiểm tra code unique
  const existingCoupon = await Coupon.findOne({ 
    code: code.toUpperCase(), 
    isDeleted: false 
  });
  if (existingCoupon) {
    throw ApiError.conflict('Coupon code already exists');
  }

  // Kiểm tra dates
  if (new Date(startDate) >= new Date(endDate)) {
    throw ApiError.badRequest('End date must be after start date');
  }

  // Kiểm tra categories nếu applicableTo = 'categories'
  if (applicableTo === 'categories' && categories && categories.length > 0) {
    const categoryDocs = await Category.find({ 
      _id: { $in: categories }, 
      isDeleted: false 
    });
    if (categoryDocs.length !== categories.length) {
      throw ApiError.badRequest('Some categories not found');
    }
  }

  // Kiểm tra products nếu applicableTo = 'products'
  if (applicableTo === 'products' && products && products.length > 0) {
    const productDocs = await Product.find({ 
      _id: { $in: products }, 
      isDeleted: false 
    });
    if (productDocs.length !== products.length) {
      throw ApiError.badRequest('Some products not found');
    }
  }

  // Kiểm tra discount value
  if (discountType === 'percentage' && discountValue > 100) {
    throw ApiError.badRequest('Percentage discount cannot exceed 100%');
  }

  const coupon = await Coupon.create({
    code: code.toUpperCase(),
    name,
    description,
    discountType,
    discountValue,
    minimumOrderAmount: minimumOrderAmount || 0,
    maximumDiscountAmount: maximumDiscountAmount || null,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    usageLimit: usageLimit || null,
    usageLimitPerUser: usageLimitPerUser || 1,
    applicableTo: applicableTo || 'all',
    categories: categories || [],
    products: products || [],
    applicableToUsers: applicableToUsers || 'all',
    specificUsers: specificUsers || [],
    isActive: isActive !== undefined ? isActive : true
  });

  await coupon.populate('categories', 'name slug');
  await coupon.populate('products', 'name slug');

  res.status(201).json(
    ApiResponse.created(
      { coupon },
      'Coupon created successfully'
    )
  );
});

/**
 * Cập nhật coupon (admin only)
 * PATCH /api/coupons/:id
 */
const updateCoupon = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const {
    code,
    name,
    description,
    discountType,
    discountValue,
    minimumOrderAmount,
    maximumDiscountAmount,
    startDate,
    endDate,
    usageLimit,
    usageLimitPerUser,
    applicableTo,
    categories,
    products,
    applicableToUsers,
    specificUsers,
    isActive
  } = req.body;

  const coupon = await Coupon.findOne({ _id: id, isDeleted: false });

  if (!coupon) {
    throw ApiError.notFound('Coupon not found');
  }

  // Kiểm tra code unique nếu có thay đổi
  if (code && code.toUpperCase() !== coupon.code) {
    const existingCoupon = await Coupon.findOne({ 
      code: code.toUpperCase(), 
      _id: { $ne: id },
      isDeleted: false 
    });
    if (existingCoupon) {
      throw ApiError.conflict('Coupon code already exists');
    }
    coupon.code = code.toUpperCase();
  }

  // Kiểm tra dates nếu có thay đổi
  const newStartDate = startDate ? new Date(startDate) : coupon.startDate;
  const newEndDate = endDate ? new Date(endDate) : coupon.endDate;
  if (newStartDate >= newEndDate) {
    throw ApiError.badRequest('End date must be after start date');
  }

  // Cập nhật các trường
  if (name !== undefined) coupon.name = name;
  if (description !== undefined) coupon.description = description;
  if (discountType !== undefined) coupon.discountType = discountType;
  if (discountValue !== undefined) {
    if (discountType === 'percentage' && discountValue > 100) {
      throw ApiError.badRequest('Percentage discount cannot exceed 100%');
    }
    coupon.discountValue = discountValue;
  }
  if (minimumOrderAmount !== undefined) coupon.minimumOrderAmount = minimumOrderAmount;
  if (maximumDiscountAmount !== undefined) coupon.maximumDiscountAmount = maximumDiscountAmount;
  if (startDate !== undefined) coupon.startDate = new Date(startDate);
  if (endDate !== undefined) coupon.endDate = new Date(endDate);
  if (usageLimit !== undefined) coupon.usageLimit = usageLimit;
  if (usageLimitPerUser !== undefined) coupon.usageLimitPerUser = usageLimitPerUser;
  if (applicableTo !== undefined) coupon.applicableTo = applicableTo;
  if (applicableToUsers !== undefined) coupon.applicableToUsers = applicableToUsers;
  if (isActive !== undefined) coupon.isActive = isActive;

  // Cập nhật categories
  if (categories !== undefined) {
    if (coupon.applicableTo === 'categories' && categories.length > 0) {
      const categoryDocs = await Category.find({ 
        _id: { $in: categories }, 
        isDeleted: false 
      });
      if (categoryDocs.length !== categories.length) {
        throw ApiError.badRequest('Some categories not found');
      }
    }
    coupon.categories = categories;
  }

  // Cập nhật products
  if (products !== undefined) {
    if (coupon.applicableTo === 'products' && products.length > 0) {
      const productDocs = await Product.find({ 
        _id: { $in: products }, 
        isDeleted: false 
      });
      if (productDocs.length !== products.length) {
        throw ApiError.badRequest('Some products not found');
      }
    }
    coupon.products = products;
  }

  // Cập nhật specificUsers
  if (specificUsers !== undefined) {
    coupon.specificUsers = specificUsers;
  }

  await coupon.save();
  await coupon.populate('categories', 'name slug');
  await coupon.populate('products', 'name slug');

  res.status(200).json(
    ApiResponse.success(
      { coupon },
      'Coupon updated successfully'
    )
  );
});

/**
 * Xóa coupon (admin only)
 * DELETE /api/coupons/:id
 */
const deleteCoupon = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const coupon = await Coupon.findOne({ _id: id, isDeleted: false });

  if (!coupon) {
    throw ApiError.notFound('Coupon not found');
  }

  // Soft delete
  coupon.isDeleted = true;
  await coupon.save();

  res.status(200).json(
    ApiResponse.success(
      null,
      'Coupon deleted successfully'
    )
  );
});

module.exports = {
  validateCoupon,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon
};

