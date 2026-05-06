'use strict';

const { Cart, Product } = require('../models');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

/**
 * Lấy giỏ hàng của user
 * GET /api/cart
 */
const getCart = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  let cart = await Cart.findOne({ user: userId }).populate('items.product', 'name slug price discount images isActive stock');

  // Nếu chưa có cart, tạo cart rỗng
  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: []
    });
  }

  // Lọc bỏ các sản phẩm đã bị xóa hoặc không active
  const validItems = cart.items.filter(item => {
    if (!item.product) return false;
    return item.product.isActive && !item.product.isDeleted;
  });

  // Nếu có items không hợp lệ, cập nhật cart
  if (validItems.length !== cart.items.length) {
    cart.items = validItems;
    await cart.save();
  }

  // Populate lại để đảm bảo có đầy đủ thông tin
  await cart.populate('items.product', 'name slug price discount images isActive stock');

  res.status(200).json(
    ApiResponse.success(
      { cart },
      'Cart retrieved successfully'
    )
  );
});

/**
 * Thêm hoặc tăng qty của item trong cart
 * POST /api/cart/items
 */
const addCartItem = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { productId, quantity } = req.body;

  // Kiểm tra product tồn tại và active
  const product = await Product.findOne({ _id: productId, isDeleted: false, isActive: true });
  if (!product) {
    throw ApiError.notFound('Product not found or not available');
  }

  // Kiểm tra stock
  if (product.stock < quantity) {
    throw ApiError.badRequest(`Insufficient stock. Available: ${product.stock}`);
  }

  // Tìm hoặc tạo cart
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: []
    });
  }

  // Tính giá (sau discount)
  const price = product.price * (1 - (product.discount || 0) / 100);

  // Kiểm tra item đã tồn tại chưa
  const existingItem = cart.items.find(item => item.product.toString() === productId.toString());
  
  if (existingItem) {
    // Kiểm tra stock khi tăng quantity
    const newQuantity = existingItem.quantity + quantity;
    if (product.stock < newQuantity) {
      throw ApiError.badRequest(`Insufficient stock. Available: ${product.stock}, Current in cart: ${existingItem.quantity}`);
    }
    existingItem.quantity = newQuantity;
  } else {
    // Thêm item mới
    cart.items.push({
      product: productId,
      quantity,
      priceAtAdd: price,
      addedAt: new Date()
    });
  }

  await cart.save();
  await cart.populate('items.product', 'name slug price discount images isActive stock');

  res.status(200).json(
    ApiResponse.success(
      { cart },
      'Item added to cart successfully'
    )
  );
});

/**
 * Set số lượng chính xác cho item
 * PUT /api/cart/items/:productId
 */
const updateCartItem = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { productId } = req.params;
  const { quantity } = req.body;

  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw ApiError.notFound('Cart not found');
  }

  // Tìm item trong cart
  const item = cart.items.find(item => item.product.toString() === productId.toString());
  if (!item) {
    throw ApiError.notFound('Item not found in cart');
  }

  // Kiểm tra product tồn tại và active
  const product = await Product.findOne({ _id: productId, isDeleted: false, isActive: true });
  if (!product) {
    // Nếu product không tồn tại, xóa item khỏi cart
    cart.items = cart.items.filter(item => item.product.toString() !== productId.toString());
    await cart.save();
    throw ApiError.notFound('Product not found or not available. Item removed from cart');
  }

  // Kiểm tra stock
  if (quantity > product.stock) {
    throw ApiError.badRequest(`Insufficient stock. Available: ${product.stock}`);
  }

  // Cập nhật quantity
  if (quantity <= 0) {
    // Xóa item nếu quantity <= 0
    cart.items = cart.items.filter(item => item.product.toString() !== productId.toString());
  } else {
    item.quantity = quantity;
  }

  await cart.save();
  await cart.populate('items.product', 'name slug price discount images isActive stock');

  res.status(200).json(
    ApiResponse.success(
      { cart },
      'Cart item updated successfully'
    )
  );
});

/**
 * Xóa 1 item khỏi cart
 * DELETE /api/cart/items/:productId
 */
const removeCartItem = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw ApiError.notFound('Cart not found');
  }

  // Tìm item trong cart
  const item = cart.items.find(item => item.product.toString() === productId.toString());
  if (!item) {
    throw ApiError.notFound('Item not found in cart');
  }

  // Xóa item
  cart.items = cart.items.filter(item => item.product.toString() !== productId.toString());
  await cart.save();
  await cart.populate('items.product', 'name slug price discount images isActive stock');

  res.status(200).json(
    ApiResponse.success(
      { cart },
      'Item removed from cart successfully'
    )
  );
});

/**
 * Clear toàn bộ cart
 * DELETE /api/cart
 */
const clearCart = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw ApiError.notFound('Cart not found');
  }

  // Clear all items
  cart.items = [];
  await cart.save();

  res.status(200).json(
    ApiResponse.success(
      { cart },
      'Cart cleared successfully'
    )
  );
});

module.exports = {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart
};

