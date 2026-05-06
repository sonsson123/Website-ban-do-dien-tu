'use strict';

const { Order, OrderItem, Product, User, Coupon } = require('../models');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

/**
 * Lấy thống kê tổng quan (admin only)
 * GET /api/admin/stats
 */
const getStats = catchAsync(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  // Build date filter
  const dateFilter = { isDeleted: false };
  if (startDate || endDate) {
    dateFilter.createdAt = {};
    if (startDate) {
      dateFilter.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.createdAt.$lte = new Date(endDate);
    }
  }

  // 1. Doanh thu (tổng totalAmount của các đơn đã thanh toán)
  const revenueStats = await Order.aggregate([
    {
      $match: {
        ...dateFilter,
        paymentStatus: 'paid',
        orderStatus: { $ne: 'cancelled' }
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalAmount' },
        totalOrders: { $sum: 1 },
        averageOrderValue: { $avg: '$totalAmount' }
      }
    }
  ]);

  const revenue = revenueStats.length > 0 ? revenueStats[0] : {
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0
  };

  // 2. Số đơn theo trạng thái
  const orderStatusStats = await Order.aggregate([
    {
      $match: dateFilter
    },
    {
      $group: {
        _id: '$orderStatus',
        count: { $sum: 1 }
      }
    }
  ]);

  const orderStatusCounts = {
    pending: 0,
    processing: 0,
    completed: 0,
    cancelled: 0
  };

  orderStatusStats.forEach(stat => {
    if (orderStatusCounts.hasOwnProperty(stat._id)) {
      orderStatusCounts[stat._id] = stat.count;
    }
  });

  // 3. Top sản phẩm bán chạy (theo số lượng đã bán)
  const topProducts = await OrderItem.aggregate([
    {
      $lookup: {
        from: 'orders',
        localField: 'order',
        foreignField: '_id',
        as: 'orderInfo'
      }
    },
    {
      $unwind: '$orderInfo'
    },
    {
      $match: {
        'orderInfo.isDeleted': false,
        'orderInfo.orderStatus': { $ne: 'cancelled' },
        ...(startDate || endDate ? {
          'orderInfo.createdAt': {
            ...(startDate ? { $gte: new Date(startDate) } : {}),
            ...(endDate ? { $lte: new Date(endDate) } : {})
          }
        } : {})
      }
    },
    {
      $group: {
        _id: '$product',
        totalQuantity: { $sum: '$quantity' },
        totalRevenue: { $sum: '$subtotal' },
        orderCount: { $sum: 1 }
      }
    },
    {
      $sort: { totalQuantity: -1 }
    },
    {
      $limit: 10
    },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'productInfo'
      }
    },
    {
      $unwind: {
        path: '$productInfo',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        productId: '$_id',
        productName: '$productInfo.name',
        productSlug: '$productInfo.slug',
        productImage: { $arrayElemAt: ['$productInfo.images', 0] },
        totalQuantity: 1,
        totalRevenue: 1,
        orderCount: 1
      }
    }
  ]);

  // 4. Tổng số users
  const totalUsers = await User.countDocuments({ isDeleted: false });

  // 5. Tổng số products
  const totalProducts = await Product.countDocuments({ isDeleted: false, isActive: true });

  // 6. Tổng số coupons active
  const totalCoupons = await Coupon.countDocuments({ isDeleted: false, isActive: true });

  // 7. Tổng số đơn hàng
  const totalOrders = await Order.countDocuments(dateFilter);

  // 8. Doanh thu theo tháng (nếu có date range)
  let monthlyRevenue = [];
  if (startDate && endDate) {
    monthlyRevenue = await Order.aggregate([
      {
        $match: {
          ...dateFilter,
          paymentStatus: 'paid',
          orderStatus: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      },
      {
        $project: {
          _id: 0,
          period: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              { $toString: { $cond: [{ $lt: ['$_id.month', 10] }, { $concat: ['0', { $toString: '$_id.month' }] }, { $toString: '$_id.month' }] } }
            ]
          },
          revenue: 1,
          orderCount: 1
        }
      }
    ]);
  }

  res.status(200).json(
    ApiResponse.success(
      {
        revenue: {
          total: revenue.totalRevenue,
          averageOrderValue: Math.round(revenue.averageOrderValue || 0),
          totalPaidOrders: revenue.totalOrders
        },
        orders: {
          total: totalOrders,
          byStatus: orderStatusCounts
        },
        topProducts,
        summary: {
          totalUsers,
          totalProducts,
          totalCoupons,
          totalOrders
        },
        monthlyRevenue: monthlyRevenue.length > 0 ? monthlyRevenue : null,
        period: {
          startDate: startDate || null,
          endDate: endDate || null
        }
      },
      'Statistics retrieved successfully'
    )
  );
});

module.exports = {
  getStats
};

