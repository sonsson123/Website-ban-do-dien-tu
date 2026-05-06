'use strict';

const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');
const { paginate, getPaginationMeta } = require('../utils/pagination');

/**
 * Lấy thông tin người dùng hiện tại
 * GET /api/users/me
 */
const getCurrentUser = catchAsync(async (req, res, next) => {
  const user = req.user;

  res.status(200).json(
    ApiResponse.success(
      { user: user.toJSON() },
      'User information retrieved successfully'
    )
  );
});


/**
 * Cập nhật hồ sơ người dùng hiện tại
 * PATCH /api/users/me
 */
const updateCurrentUser = catchAsync(async (req, res, next) => {
    const { fullName, phone, avatar, username } = req.body;
    const user = req.user;
  
    // Kiểm tra username unique nếu có thay đổi
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username, _id: { $ne: user._id } });
      if (existingUser) {
        throw ApiError.conflict('Username already exists');
      }
      user.username = username;
    }
  
    if (fullName !== undefined) user.fullName = fullName;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;
  
    await user.save();

    res.status(200).json(
        ApiResponse.success(
          { user: user.toJSON() },
          'Profile updated successfully'
        )
      );
    });

   /**
 * Lấy danh sách địa chỉ giao hàng
 * GET /api/users/me/addresses
 */
const getMyAddresses = catchAsync(async (req, res, next) => {
    const user = req.user;
  
    res.status(200).json(
      ApiResponse.success(
        { addresses: user.addresses || [] },
        'Addresses retrieved successfully'
      )
    );
  }); 


  /**
 * Thêm địa chỉ giao hàng
 * POST /api/users/me/addresses
 */
const addAddress = catchAsync(async (req, res, next) => {
    const { fullName, phone, street, ward, district, city, isDefault } = req.body;
    const user = req.user;
  
    const newAddress = {
      fullName,
      phone,
      street,
      ward,
      district,
      city,
      isDefault: isDefault || false
    };
  

    // Nếu đặt làm mặc định, bỏ mặc định của các địa chỉ khác
  if (isDefault) {
    user.addresses.forEach(addr => {
      addr.isDefault = false;
    });
  }

  user.addresses.push(newAddress);
  await user.save();

  const addedAddress = user.addresses[user.addresses.length - 1];

  res.status(201).json(
    ApiResponse.created(
      { address: addedAddress },
      'Address added successfully'
    )
  );
});


/**
 * Cập nhật địa chỉ
 * PATCH /api/users/me/addresses/:addressId
 */
const updateAddress = catchAsync(async (req, res, next) => {
    const { addressId } = req.params;
    const { fullName, phone, street, ward, district, city, isDefault } = req.body;
    const user = req.user;
  
    const address = user.addresses.id(addressId);
    if (!address) {
      throw ApiError.notFound('Address not found');
    }
  
    if (fullName !== undefined) address.fullName = fullName;
    if (phone !== undefined) address.phone = phone;
    if (street !== undefined) address.street = street;
    if (ward !== undefined) address.ward = ward;
    if (district !== undefined) address.district = district;
    if (city !== undefined) address.city = city;

    // Nếu đặt làm mặc định, bỏ mặc định của các địa chỉ khác
  if (isDefault !== undefined) {
    if (isDefault) {
      user.addresses.forEach(addr => {
        if (addr._id.toString() !== addressId) {
          addr.isDefault = false;
        }
      });
    }
    address.isDefault = isDefault;
  }

  await user.save();

  res.status(200).json(
    ApiResponse.success(
      { address },
      'Address updated successfully'
    )
  );
});

/**
 * Xóa địa chỉ
 * DELETE /api/users/me/addresses/:addressId
 */
const deleteAddress = catchAsync(async (req, res, next) => {
    const { addressId } = req.params;
    const user = req.user;
  
    const address = user.addresses.id(addressId);
    if (!address) {
      throw ApiError.notFound('Address not found');
    }
  
    user.addresses.pull(addressId);
    await user.save();
  
    res.status(200).json(
      ApiResponse.success(
        null,
        'Address deleted successfully'
      )
    );
  });


  /**
 * Lấy danh sách users (admin only)
 * GET /api/users
 */
const getUsers = catchAsync(async (req, res, next) => {
    const { page, limit, role, search, isDeleted } = req.query;
  
    // Build query
    const query = {};
    let includeDeleted = false;
  
    if (role) {
      query.role = role;
    }
  
    if (isDeleted !== undefined) {
      query.isDeleted = isDeleted === 'true';
      includeDeleted = true;
    }
  
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count
  const total = await User.countDocuments(query);

  // Paginate
  let baseQuery = User.find(query).select('-password -refreshToken').sort({ createdAt: -1 });
  if (includeDeleted) {
    baseQuery = baseQuery.setOptions({ includeDeleted: true });
  }
  const { query: paginatedQuery, page: currentPage, limit: currentLimit } = paginate(
    baseQuery,
    { page, limit }
  );

  const users = await paginatedQuery;

  res.status(200).json(
    ApiResponse.success(
      {
        users,
        pagination: getPaginationMeta(total, currentPage, currentLimit)
      },
      'Users retrieved successfully'
    )
  );
});


/**
 * Cập nhật user (admin only)
 * PATCH /api/users/:id
 */
const updateUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { role, isDeleted, fullName, phone, avatar, username } = req.body;

  const user = await User.findById(id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Kiểm tra username unique nếu có thay đổi
  if (username && username !== user.username) {
    const existingUser = await User.findOne({ username, _id: { $ne: user._id } });
    if (existingUser) {
      throw ApiError.conflict('Username already exists');
    }
    user.username = username;
  }

  if (role !== undefined) {
    if (!['customer', 'admin'].includes(role)) {
      throw ApiError.badRequest('Invalid role');
    }
    user.role = role;
  }

  if (isDeleted !== undefined) {
    user.isDeleted = isDeleted;
  }

  if (fullName !== undefined) user.fullName = fullName;
  if (phone !== undefined) user.phone = phone;
  if (avatar !== undefined) user.avatar = avatar;

  await user.save();

  res.status(200).json(
    ApiResponse.success(
      { user: user.toJSON() },
      'User updated successfully'
    )
  );
});


/**
 * Soft delete user (admin only)
 * DELETE /api/users/:id
 */
const deleteUser = catchAsync(async (req, res, next) => {
    const { id } = req.params;
  
    const user = await User.findById(id);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
  
    // Không cho phép xóa chính mình
    if (user._id.toString() === req.user._id.toString()) {
      throw ApiError.badRequest('You cannot delete your own account');
    }
  
    user.isDeleted = true;
    await user.save();
  
    res.status(200).json(
      ApiResponse.success(
        null,
        'User deleted successfully'
      )
    );
  });


  module.exports = {
    getCurrentUser,
    updateCurrentUser,
    getMyAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    getUsers,
    updateUser,
    deleteUser
  };
  
