'use strict';

const { Product, Category } = require('../models');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');
const { paginate, getPaginationMeta } = require('../utils/pagination');
const { uploadToCloudinary, uploadMultiple, deleteFromCloudinary } = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

const UPLOAD_DRIVER = (
  process.env.UPLOAD_DRIVER || (process.env.NODE_ENV === 'production' ? 'cloudinary' : 'local')
).toLowerCase();

const uploadsRootDir = path.join(__dirname, '..', 'uploads');
const productUploadsDir = path.join(uploadsRootDir, 'products');
fs.mkdirSync(productUploadsDir, { recursive: true });

const hasCloudinaryConfig = () =>
  Boolean(process.env.CLOUDINARY_URL) ||
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );

const buildBaseUrl = (req) => `${req.protocol}://${req.get('host')}`;

const getPathnameFromUrl = (value) => {
  try {
    return new URL(value).pathname;
  } catch {
    return value;
  }
};

const isLocalUploadUrl = (value) => {
  if (!value || typeof value !== 'string') return false;
  const pathname = getPathnameFromUrl(value);
  return typeof pathname === 'string' && pathname.startsWith('/uploads/');
};

const getLocalFilePathFromUrl = (value) => {
  const pathname = getPathnameFromUrl(value);
  if (!pathname || typeof pathname !== 'string' || !pathname.startsWith('/uploads/')) return null;
  const relPath = pathname.replace(/^\/+/, '');
  return path.join(__dirname, '..', relPath);
};

/**
 * Lấy danh sách sản phẩm với filter, sort, pagination
 * GET /api/products
 */
const getProducts = catchAsync(async (req, res, next) => {
  const { q, search, category, minPrice, maxPrice, sort, page, limit } = req.query;

  // Build query
  const query = { isDeleted: false };

  // Search by query string (q)
  const searchTerm = (search || q || '').trim();
  if (searchTerm) {
    query.$or = [
      { name: { $regex: searchTerm, $options: 'i' } },
      { brand: { $regex: searchTerm, $options: 'i' } }
    ];
  }

  // Filter by category
  if (category) {
    query.category = category;
  }

  // Filter by price range
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) {
      query.price.$gte = parseFloat(minPrice);
    }
    if (maxPrice) {
      query.price.$lte = parseFloat(maxPrice);
    }
  }

  // Build sort
  let sortOption = { createdAt: -1 }; // Default sort by newest
  if (sort) {
    if (sort.startsWith('-')) {
      sortOption = { [sort.substring(1)]: -1 };
    } else {
      sortOption = { [sort]: 1 };
    }
  }

  // Get total count
  const total = await Product.countDocuments(query);

  // Paginate
  const { query: paginatedQuery, page: currentPage, limit: currentLimit } = paginate(
    Product.find(query)
      .populate('category', 'name slug')
      .sort(sortOption),
    { page, limit }
  );

  const products = await paginatedQuery;

  res.status(200).json(
    ApiResponse.success(
      {
        products,
        pagination: getPaginationMeta(total, currentPage, currentLimit)
      },
      'Products retrieved successfully'
    )
  );
});

/**
 * Lấy chi tiết sản phẩm theo slug
 * GET /api/products/:slug
 */
const getProductBySlug = catchAsync(async (req, res, next) => {
  const { slug } = req.params;

  const product = await Product.findOne({ slug, isDeleted: false })
    .populate('category', 'name slug level');

  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  res.status(200).json(
    ApiResponse.success(
      { product },
      'Product retrieved successfully'
    )
  );
});

/**
 * Tạo sản phẩm mới (admin only)
 * POST /api/products
 */
const createProduct = catchAsync(async (req, res, next) => {
  const { name, description, price, discount, stock, category, brand, images, specifications, isActive } = req.body;

  // Kiểm tra category tồn tại
  const categoryDoc = await Category.findOne({ _id: category, isDeleted: false });
  if (!categoryDoc) {
    throw ApiError.notFound('Category not found');
  }

  // Xử lý images nếu có
  let imageUrls = [];
  if (images && Array.isArray(images)) {
    imageUrls = images; // Nếu là URLs
  }

  // Xử lý specifications
  let specsMap = new Map();
  if (specifications && typeof specifications === 'object') {
    Object.entries(specifications).forEach(([key, value]) => {
      specsMap.set(key, String(value));
    });
  }

  const product = await Product.create({
    name,
    description,
    price: parseFloat(price),
    discount: discount ? parseFloat(discount) : 0,
    stock: parseInt(stock),
    category,
    brand: brand || undefined,
    images: imageUrls,
    specifications: specsMap,
    isActive: isActive !== undefined ? isActive : true
  });

  await product.populate('category', 'name slug level');

  res.status(201).json(
    ApiResponse.created(
      { product },
      'Product created successfully'
    )
  );
});

/**
 * Cập nhật sản phẩm (admin only)
 * PATCH /api/products/:id
 */
const updateProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { name, description, price, discount, stock, category, brand, images, specifications, isActive } = req.body;

  const product = await Product.findOne({ _id: id, isDeleted: false });

  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  // Kiểm tra category nếu có thay đổi
  if (category) {
    const categoryDoc = await Category.findOne({ _id: category, isDeleted: false });
    if (!categoryDoc) {
      throw ApiError.notFound('Category not found');
    }
    product.category = category;
  }

  // Cập nhật các trường
  if (name !== undefined) product.name = name;
  if (description !== undefined) product.description = description;
  if (price !== undefined) product.price = parseFloat(price);
  if (discount !== undefined) product.discount = parseFloat(discount);
  if (stock !== undefined) product.stock = parseInt(stock);
  if (brand !== undefined) product.brand = brand;
  if (isActive !== undefined) product.isActive = isActive;

  // Cập nhật images nếu có
  if (images !== undefined && Array.isArray(images)) {
    product.images = images;
  }

  // Cập nhật specifications nếu có
  if (specifications !== undefined && typeof specifications === 'object') {
    const specsMap = new Map();
    Object.entries(specifications).forEach(([key, value]) => {
      specsMap.set(key, String(value));
    });
    product.specifications = specsMap;
  }

  await product.save();
  await product.populate('category', 'name slug level');

  res.status(200).json(
    ApiResponse.success(
      { product },
      'Product updated successfully'
    )
  );
});

/**
 * Soft delete sản phẩm (admin only)
 * DELETE /api/products/:id
 */
const deleteProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const product = await Product.findOne({ _id: id, isDeleted: false });

  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  product.isDeleted = true;
  await product.save();

  res.status(200).json(
    ApiResponse.success(
      null,
      'Product deleted successfully'
    )
  );
});

/**
 * Upload ảnh bổ sung cho sản phẩm (admin only)
 * POST /api/products/:id/images
 */
const uploadProductImages = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!req.files || req.files.length === 0) {
    throw ApiError.badRequest('No images provided');
  }

  const product = await Product.findOne({ _id: id, isDeleted: false });

  if (!product) {
    // Clean up uploaded files if product not found
    req.files.forEach(file => {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    });
    throw ApiError.notFound('Product not found');
  }

  try {
    let newImages = [];
    let publicIds = [];

    if (UPLOAD_DRIVER === 'cloudinary') {
      if (!hasCloudinaryConfig()) {
        throw new Error('Cloudinary is not configured');
      }

      const uploadResults = await uploadMultiple(req.files, 'products');
      newImages = uploadResults.map(result => result.url);
      publicIds = uploadResults.map(result => result.publicId);

      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    } else {
      const baseUrl = buildBaseUrl(req);
      req.files.forEach(file => {
        const filename = path.basename(file.path);
        const destPath = path.join(productUploadsDir, filename);
        fs.renameSync(file.path, destPath);
        newImages.push(`${baseUrl}/uploads/products/${filename}`);
        publicIds.push(`products/${filename}`);
      });
    }

    // Add to product images array
    product.images = [...newImages, ...product.images];
    await product.save();

    res.status(200).json(
      ApiResponse.success(
        {
          images: newImages,
          publicIds,
          totalImages: product.images.length
        },
        'Images uploaded successfully'
      )
    );
  } catch (error) {
    // Clean up temp files on error
    req.files.forEach(file => {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    });
    throw ApiError.internal(`Failed to upload images: ${error.message}`);
  }
});

/**
 * Xóa ảnh từ sản phẩm (admin only)
 * DELETE /api/products/:id/images/:publicId
 */
const deleteProductImage = catchAsync(async (req, res, next) => {
  const { id, publicId } = req.params;

  const product = await Product.findOne({ _id: id, isDeleted: false });

  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  // Tìm image URL từ publicId
  // publicId có thể là URL hoặc publicId
  let imageUrl = null;
  let actualPublicId = publicId;

  // Nếu publicId là URL Cloudinary, extract publicId từ URL
  if (publicId.startsWith('http')) {
    imageUrl = product.images.find(img => img === publicId);
    
    if (imageUrl) {
      // Extract publicId from Cloudinary URL
      // Format: https://res.cloudinary.com/{cloud_name}/image/upload/{folder}/{public_id}.{ext}
      try {
        const urlParts = publicId.split('/');
        const uploadIndex = urlParts.findIndex(part => part === 'upload');
        if (uploadIndex !== -1 && uploadIndex < urlParts.length - 1) {
          // Get everything after 'upload'
          const afterUpload = urlParts.slice(uploadIndex + 1);
          // Remove version if exists (v1234567890)
          const withoutVersion = afterUpload.filter(part => !part.match(/^v\d+$/));
          // Join and remove extension
          const pathWithExt = withoutVersion.join('/');
          actualPublicId = pathWithExt.substring(0, pathWithExt.lastIndexOf('.'));
        }
      } catch (error) {
        // If extraction fails, try to use the URL as-is
        actualPublicId = publicId;
      }
    }
  } else {
    // Nếu là publicId, tìm image URL tương ứng
    // Tìm image có chứa publicId trong path
    imageUrl = product.images.find(img => {
      try {
        const urlParts = img.split('/');
        const uploadIndex = urlParts.findIndex(part => part === 'upload');
        if (uploadIndex !== -1) {
          const afterUpload = urlParts.slice(uploadIndex + 1);
          const withoutVersion = afterUpload.filter(part => !part.match(/^v\d+$/));
          const pathWithExt = withoutVersion.join('/');
          const pathWithoutExt = pathWithExt.substring(0, pathWithExt.lastIndexOf('.'));
          return pathWithoutExt === publicId || pathWithoutExt.includes(publicId);
        }
        return false;
      } catch {
        return false;
      }
    });
    
    if (imageUrl) {
      actualPublicId = publicId;
    }
  }

  if (!imageUrl) {
    throw ApiError.notFound('Image not found in product');
  }

  try {
    if (isLocalUploadUrl(imageUrl)) {
      const filePath = getLocalFilePathFromUrl(imageUrl);
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      product.images = product.images.filter(img => img !== imageUrl);
      await product.save();

      res.status(200).json(
        ApiResponse.success(
          {
            deletedImage: imageUrl,
            remainingImages: product.images.length
          },
          'Image deleted successfully'
        )
      );
      return;
    }

    if (imageUrl.includes('cloudinary.com') && hasCloudinaryConfig()) {
      await deleteFromCloudinary(actualPublicId);
    }

    // Remove from product images array
    product.images = product.images.filter(img => img !== imageUrl);
    await product.save();

    res.status(200).json(
      ApiResponse.success(
        {
          deletedImage: imageUrl,
          remainingImages: product.images.length
        },
        'Image deleted successfully'
      )
    );
  } catch (error) {
    throw ApiError.internal(`Failed to delete image: ${error.message}`);
  }
});

module.exports = {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  deleteProductImage
};

