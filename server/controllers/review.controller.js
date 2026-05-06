'use strict';

const { Review, Product } = require('../models');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');
const { paginate, getPaginationMeta } = require('../utils/pagination');

/**
 * Lấy danh sách review của sản phẩm
 * GET /api/products/:productId/reviews
 */
const getProductReviews = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const { page, limit } = req.query;

  // Kiểm tra product tồn tại
  const product = await Product.findOne({ _id: productId, isDeleted: false });
  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  // Build query
  const query = { product: productId, isDeleted: false };

  // Get total count
  const total = await Review.countDocuments(query);

  // Paginate và sort (mới nhất trước)
  const { query: paginatedQuery, page: currentPage, limit: currentLimit } = paginate(
    Review.find(query)
      .populate('user', 'fullName username avatar')
      .sort({ createdAt: -1 }),
    { page, limit }
  );

  const reviews = await paginatedQuery;

  res.status(200).json(
    ApiResponse.success(
      {
        reviews,
        pagination: getPaginationMeta(total, currentPage, currentLimit)
      },
      'Reviews retrieved successfully'
    )
  );
});

/**
 * Tạo review mới
 * POST /api/products/:productId/reviews
 */
const createReview = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const { rating, comment, images } = req.body;
  const userId = req.user._id;

  // Kiểm tra product tồn tại
  const product = await Product.findOne({ _id: productId, isDeleted: false });
  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  // Tạo review
  const review = await Review.create({
    product: productId,
    user: userId,
    rating: parseInt(rating),
    comment,
    images: images || [],
    isVerifiedPurchase: true
  });

  // Populate user và product
  await review.populate('user', 'fullName username avatar');
  await review.populate('product', 'name slug');

  // Average rating sẽ được tự động cập nhật qua post hook

  res.status(201).json(
    ApiResponse.created(
      { review },
      'Review created successfully'
    )
  );
});

/**
 * Cập nhật review
 * PATCH /api/reviews/:id
 */
const updateReview = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { rating, comment, images } = req.body;
  const userId = req.user._id;
  const userRole = req.user.role;

  const review = await Review.findOne({ _id: id, isDeleted: false });

  if (!review) {
    throw ApiError.notFound('Review not found');
  }

  // Kiểm tra quyền: chỉ owner hoặc admin mới được sửa
  if (review.user.toString() !== userId.toString() && userRole !== 'admin') {
    throw ApiError.forbidden('You do not have permission to update this review');
  }

  // Cập nhật các trường
  if (rating !== undefined) review.rating = parseInt(rating);
  if (comment !== undefined) review.comment = comment;
  if (images !== undefined) review.images = images;

  await review.save();

  // Populate user và product
  await review.populate('user', 'fullName username avatar');
  await review.populate('product', 'name slug');

  // Average rating sẽ được tự động cập nhật qua post hook

  res.status(200).json(
    ApiResponse.success(
      { review },
      'Review updated successfully'
    )
  );
});

/**
 * Xóa review (soft delete)
 * DELETE /api/reviews/:id
 */
const deleteReview = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;
  const userRole = req.user.role;

  const review = await Review.findOne({ _id: id, isDeleted: false });

  if (!review) {
    throw ApiError.notFound('Review not found');
  }

  // Kiểm tra quyền: chỉ owner hoặc admin mới được xóa
  if (review.user.toString() !== userId.toString() && userRole !== 'admin') {
    throw ApiError.forbidden('You do not have permission to delete this review');
  }

  // Soft delete
  review.isDeleted = true;
  await review.save();

  // Average rating sẽ được tự động cập nhật qua post hook

  res.status(200).json(
    ApiResponse.success(
      null,
      'Review deleted successfully'
    )
  );
});

module.exports = {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview
};

