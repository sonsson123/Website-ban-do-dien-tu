'use strict';

const { uploadToCloudinary, uploadMultiple, deleteFromCloudinary } = require('../config/cloudinary');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');
const fs = require('fs');

/**
 * Upload ảnh lên Cloudinary
 * POST /api/uploads/images
 */
const uploadImage = catchAsync(async (req, res, next) => {
  if (!req.file) {
    throw ApiError.badRequest('No image file provided');
  }

  try {
    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file, 'uploads');

    // Clean up temp file
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(200).json(
      ApiResponse.success(
        {
          url: result.url,
          publicId: result.publicId
        },
        'Image uploaded successfully'
      )
    );
  } catch (error) {
    // Clean up temp file on error
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    throw ApiError.internal(`Failed to upload image: ${error.message}`);
  }
});

/**
 * Upload ảnh danh mục (single)
 * POST /api/uploads/categories
 */
const uploadCategoryImage = catchAsync(async (req, res, next) => {
  if (!req.file) {
    throw ApiError.badRequest('No image file provided');
  }

  try {
    const result = await uploadToCloudinary(req.file, 'categories');

    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(200).json(
      ApiResponse.success(
        {
          image: {
            url: result.url,
            publicId: result.publicId
          }
        },
        'Category image uploaded successfully'
      )
    );
  } catch (error) {
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    throw ApiError.internal(`Failed to upload category image: ${error.message}`);
  }
});

/**
 * Upload nhiều ảnh lên Cloudinary
 * POST /api/uploads/images (multiple files)
 */
const uploadImages = catchAsync(async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    throw ApiError.badRequest('No image files provided');
  }

  try {
    // Upload to Cloudinary
    const results = await uploadMultiple(req.files, 'uploads');

    // Clean up temp files
    req.files.forEach(file => {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    });

    res.status(200).json(
      ApiResponse.success(
        {
          images: results.map(result => ({
            url: result.url,
            publicId: result.publicId
          }))
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
 * Xóa ảnh khỏi Cloudinary
 * DELETE /api/uploads/:publicId
 */
const deleteImage = catchAsync(async (req, res, next) => {
  const { publicId } = req.params;

  if (!publicId) {
    throw ApiError.badRequest('Public ID is required');
  }

  try {
    // Decode publicId nếu bị encode trong URL
    const decodedPublicId = decodeURIComponent(publicId);

    await deleteFromCloudinary(decodedPublicId);

    res.status(200).json(
      ApiResponse.success(
        {
          publicId: decodedPublicId,
          deleted: true
        },
        'Image deleted successfully'
      )
    );
  } catch (error) {
    throw ApiError.internal(`Failed to delete image: ${error.message}`);
  }
});

module.exports = {
  uploadImage,
  uploadImages,
  uploadCategoryImage,
  deleteImage
};

