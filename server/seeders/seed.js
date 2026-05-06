'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const slugify = require('slugify');
const connectDB = require('../config/db');
const { User, Category, Product, Coupon, Review, Cart, Order, OrderItem, Payment } = require('../models');

// ==================== SEED USERS ====================
const seedUsers = async () => {
  const users = [
    // Admins
    {
      email: 'admin@it4409.com',
      password: 'admin123',
      fullName: 'Nguyễn Văn Admin',
      username: 'admin',
      phone: '0123456789',
      role: 'admin',
      isEmailVerified: true,
      addresses: [{
        fullName: 'Nguyễn Văn Admin',
        phone: '0123456789',
        street: '144 Xuân Thủy',
        ward: 'Dịch Vọng Hậu',
        district: 'Cầu Giấy',
        city: 'Hà Nội',
        isDefault: true
      }]
    },
    {
      email: 'admin2@it4409.com',
      password: 'admin123',
      fullName: 'Trần Thị Quản Trị',
      username: 'admin2',
      phone: '0123456788',
      role: 'admin',
      isEmailVerified: true
    },
    // Customers
    {
      email: 'customer1@it4409.com',
      password: 'customer123',
      fullName: 'Phạm Minh Tuấn',
      username: 'minhtuan',
      phone: '0987654321',
      role: 'customer',
      isEmailVerified: true,
      addresses: [{
        fullName: 'Phạm Minh Tuấn',
        phone: '0987654321',
        street: '268 Tô Hiệu',
        ward: 'Hà Cầu',
        district: 'Hà Đông',
        city: 'Hà Nội',
        isDefault: true
      }]
    },
    {
      email: 'customer2@it4409.com',
      password: 'customer123',
      fullName: 'Hoàng Thị Lan',
      username: 'thilan',
      phone: '0987654322',
      role: 'customer',
      isEmailVerified: true,
      addresses: [{
        fullName: 'Hoàng Thị Lan',
        phone: '0987654322',
        street: '91 Chùa Láng',
        ward: 'Láng Thượng',
        district: 'Đống Đa',
        city: 'Hà Nội',
        isDefault: true
      }]
    },
    {
      email: 'customer3@it4409.com',
      password: 'customer123',
      fullName: 'Vũ Quang Huy',
      username: 'quanghuy',
      phone: '0987654323',
      role: 'customer',
      isEmailVerified: true
    },
    {
      email: 'customer4@it4409.com',
      password: 'customer123',
      fullName: 'Đỗ Thu Hương',
      username: 'thuhuong',
      phone: '0987654324',
      role: 'customer',
      isEmailVerified: false
    },
    {
      email: 'customer5@it4409.com',
      password: 'customer123',
      fullName: 'Bùi Văn Nam',
      username: 'vannam',
      phone: '0987654325',
      role: 'customer',
      isEmailVerified: true
    }
  ];

  // Use .save() instead of insertMany to trigger pre-save hook for password hashing
  const createdUsers = [];
  for (const userData of users) {
    const user = new User(userData);
    await user.save();
    createdUsers.push(user);
  }
  console.log(`✓ ${createdUsers.length} Users seeded`);
  return createdUsers;
};

// ==================== SEED CATEGORIES ====================
const seedCategories = async () => {
  const categories = [
    // Level 1 - Main categories
    { name: 'Laptop', description: 'Máy tính xách tay', level: 1 },
    { name: 'Điện thoại', description: 'Điện thoại thông minh', level: 1 },
    { name: 'Tablet', description: 'Máy tính bảng', level: 1 },
    { name: 'Đồng hồ thông minh', description: 'Smartwatch & Wearables', level: 1 },
    { name: 'Tai nghe', description: 'Tai nghe & Loa', level: 1 },
    { name: 'PC & Màn hình', description: 'Máy tính để bàn và màn hình', level: 1 },
    { name: 'Gaming', description: 'Thiết bị chơi game', level: 1 },
    { name: 'Phụ kiện', description: 'Phụ kiện công nghệ', level: 1 }
  ];

  const categoriesWithSlug = categories.map(c => ({
    ...c,
    slug: slugify(c.name, { lower: true, strict: true, locale: 'vi' })
  }));

  const createdCategories = await Category.insertMany(categoriesWithSlug);
  console.log(`✓ ${createdCategories.length} Categories seeded`);
  return createdCategories;
};

// ==================== SEED PRODUCTS ====================
const seedProducts = async (categories) => {
  const laptopCat = categories.find(c => c.name === 'Laptop');
  const phoneCat = categories.find(c => c.name === 'Điện thoại');
  const tabletCat = categories.find(c => c.name === 'Tablet');
  const watchCat = categories.find(c => c.name === 'Đồng hồ thông minh');
  const audioCat = categories.find(c => c.name === 'Tai nghe');
  const gamingCat = categories.find(c => c.name === 'Gaming');
  const accessoryCat = categories.find(c => c.name === 'Phụ kiện');

  const products = [
    // === SMARTPHONES ===
    {
      name: 'iPhone 15 Pro Max',
      description: 'iPhone 15 Pro Max 256GB - Titan Tự Nhiên, chip A17 Pro, camera 48MP',
      price: 34990000,
      discount: 3,
      stock: 20,
      category: phoneCat._id,
      brand: 'Apple',
      images: [
        'https://cdn.tgdd.vn/Products/Images/42/305658/iphone-15-pro-max-gold-thumbnew-600x600.jpg',
        'https://cdn.tgdd.vn/Products/Images/42/305658/iphone-15-pro-max-1-1.jpg'
      ],
      specifications: {
        'Chip': 'Apple A17 Pro',
        'RAM': '8GB',
        'Storage': '256GB',
        'Display': '6.7 inch Super Retina XDR',
        'Camera': 'Main 48MP, Ultra Wide 12MP, Telephoto 12MP',
        'Battery': '4422 mAh'
      },
      isActive: true
    },
    {
      name: 'Samsung Galaxy S24 Ultra',
      description: 'Samsung Galaxy S24 Ultra 12GB/256GB - Flagship Android với bút S Pen',
      price: 29990000,
      discount: 8,
      stock: 18,
      category: phoneCat._id,
      brand: 'Samsung',
      images: ['https://cdn.tgdd.vn/Products/Images/42/307174/samsung-galaxy-s24-ultra-grey-thumbnew-600x600.jpg'],
      specifications: {
        'Chip': 'Snapdragon 8 Gen 3 for Galaxy',
        'RAM': '12GB',
        'Storage': '256GB',
        'Display': '6.8 inch Dynamic AMOLED 2X, 120Hz',
        'Camera': 'Main 200MP, Ultra Wide 12MP, Telephoto 50MP + 10MP'
      },
      isActive: true
    },
    {
      name: 'Samsung Galaxy A55',
      description: 'Samsung Galaxy A55 5G 8GB/256GB - Trung cấp giá tốt',
      price: 11490000,
      discount: 10,
      stock: 40,
      category: phoneCat._id,
      brand: 'Samsung',
      images: ['https://cdn.tgdd.vn/Products/Images/42/322096/samsung-galaxy-a55-5g-xanh-thumb-1-600x600.jpg'],
      specifications: {
        'Chip': 'Exynos 1480',
        'RAM': '8GB',
        'Storage': '256GB',
        'Display': '6.6 inch Super AMOLED',
        'Camera': 'Main 50MP'
      },
      isActive: true
    }
  ];

  const productsWithSlug = products.map(p => ({
    ...p,
    slug: slugify(p.name, { lower: true, strict: true, locale: 'vi' })
  }));

  const createdProducts = await Product.insertMany(productsWithSlug);
  console.log(`✓ ${createdProducts.length} Products seeded`);
  return createdProducts;
};

// ==================== SEED COUPONS ====================
const seedCoupons = async () => {
  const coupons = [
    {
      code: 'DISCOUNT10',
      name: 'Discount 10%',
      description: '10% discount on all items',
      discountType: 'percentage',
      discountValue: 10,
      usageLimit: 100,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true
    },
    {
      code: 'SAVE500K',
      name: 'Save 500K',
      description: 'Save 500,000 VND on orders over 2,000,000 VND',
      discountType: 'fixed',
      discountValue: 500000,
      minimumOrderAmount: 2000000,
      usageLimit: 50,
      startDate: new Date(),
      endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      isActive: true
    },
    {
      code: 'FREESHIP',
      name: 'Free Shipping',
      description: 'Free shipping for orders over 1,000,000 VND',
      discountType: 'fixed',
      discountValue: 0,
      minimumOrderAmount: 1000000,
      usageLimit: 200,
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      isActive: true
    },
    {
      code: 'WELCOME20',
      name: 'Welcome 20%',
      description: '20% discount for new users',
      discountType: 'percentage',
      discountValue: 20,
      usageLimit: 1000,
      applicableToUsers: 'first_time',
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      isActive: true
    },
    {
      code: 'SUMMER50K',
      name: 'Summer 50K',
      description: '50,000 VND off',
      discountType: 'fixed',
      discountValue: 50000,
      usageLimit: 500,
      startDate: new Date(),
      endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      isActive: true
    }
  ];

  const couponCodes = coupons.map(c => ({
    ...c,
    slug: slugify(c.code, { lower: true, strict: true })
  }));

  const createdCoupons = await Coupon.insertMany(couponCodes);
  console.log(`✓ ${createdCoupons.length} Coupons seeded`);
  return createdCoupons;
};

// ==================== SEED REVIEWS ====================
const seedReviews = async (users, products) => {
  const reviews = [
    {
      product: products[0]._id,
      user: users[2]._id,
      rating: 5,
      comment: 'Chất lượng rất tốt, đáp ứng mọi nhu cầu của tôi',
      isVerifiedPurchase: true
    },
    {
      product: products[1]._id,
      user: users[3]._id,
      rating: 4,
      comment: 'Sản phẩm tốt nhưng giao hàng hơi chậm',
      isVerifiedPurchase: true
    },
    {
      product: products[2]._id,
      user: users[4]._id,
      rating: 5,
      comment: 'Vượt quá kỳ vọng của tôi',
      isVerifiedPurchase: true
    }
  ];

  const createdReviews = await Review.insertMany(reviews);
  console.log(`✓ ${createdReviews.length} Reviews seeded`);
  return createdReviews;
};

// ==================== SEED CARTS ====================
const seedCarts = async (users, products) => {
  const carts = [
    {
      user: users[2]._id,
      items: [
        {
          product: products[0]._id,
          quantity: 1,
          priceAtAdd: products[0].price
        }
      ]
    },
    {
      user: users[3]._id,
      items: [
        {
          product: products[1]._id,
          quantity: 2,
          priceAtAdd: products[1].price
        },
        {
          product: products[2]._id,
          quantity: 1,
          priceAtAdd: products[2].price
        }
      ]
    },
    {
      user: users[4]._id,
      items: [
        {
          product: products[0]._id,
          quantity: 1,
          priceAtAdd: products[0].price
        }
      ]
    }
  ];

  const createdCarts = await Cart.insertMany(carts);
  console.log(`✓ ${createdCarts.length} Carts seeded`);
  return createdCarts;
};

// ==================== SEED ORDERS ====================
const seedOrders = async (users, products) => {
  const shippingAddressTemplate = {
    fullName: 'Nguyễn Văn A',
    phone: '0987654321',
    street: '123 Đường ABC',
    ward: 'Phường 1',
    district: 'Quận 1',
    city: 'Hồ Chí Minh'
  };

  const orders = [
    {
      user: users[2]._id,
      orderNumber: 'ORD20250131001',
      shippingAddress: shippingAddressTemplate,
      subtotal: products[0].price,
      totalAmount: products[0].price,
      orderStatus: 'completed',
      paymentStatus: 'paid'
    },
    {
      user: users[3]._id,
      orderNumber: 'ORD20250131002',
      shippingAddress: shippingAddressTemplate,
      subtotal: products[1].price * 2,
      totalAmount: products[1].price * 2,
      orderStatus: 'processing',
      paymentStatus: 'pending'
    },
    {
      user: users[4]._id,
      orderNumber: 'ORD20250131003',
      shippingAddress: shippingAddressTemplate,
      subtotal: products[2].price,
      totalAmount: products[2].price,
      orderStatus: 'completed',
      paymentStatus: 'paid'
    }
  ];

  const createdOrders = await Order.insertMany(orders);
  
  // Create OrderItems for each order
  const orderItems = [];
  createdOrders.forEach((order, index) => {
    const productIndex = index % products.length;
    const quantity = index === 1 ? 2 : 1;
    orderItems.push({
      order: order._id,
      product: products[productIndex]._id,
      productName: products[productIndex].name,
      price: products[productIndex].price,
      quantity: quantity,
      subtotal: products[productIndex].price * quantity
    });
  });

  await OrderItem.insertMany(orderItems);
  console.log(`✓ ${createdOrders.length} Orders seeded`);
  return createdOrders;
};

// ==================== SEED PAYMENTS ====================
const seedPayments = async (orders) => {
  const payments = [
    {
      order: orders[0]._id,
      method: 'payos',
      amount: orders[0].totalAmount,
      transactionCode: 'TXN20250131001',
      status: 'completed',
      paidAt: new Date()
    },
    {
      order: orders[2]._id,
      method: 'payos',
      amount: orders[2].totalAmount,
      transactionCode: 'TXN20250131002',
      status: 'completed',
      paidAt: new Date()
    }
  ];

  const createdPayments = await Payment.insertMany(payments);
  console.log(`✓ ${createdPayments.length} Payments seeded`);
  return createdPayments;
};

// ==================== MAIN SEED FUNCTION ====================
const runSeed = async () => {
  try {
    await connectDB();

    // Clear all collections
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Coupon.deleteMany({}),
      Review.deleteMany({}),
      Cart.deleteMany({}),
      Order.deleteMany({}),
      Payment.deleteMany({})
    ]);

    // Seed data
    const users = await seedUsers();
    const categories = await seedCategories();
    const products = await seedProducts(categories);
    const coupons = await seedCoupons();
    const reviews = await seedReviews(users, products);
    const carts = await seedCarts(users, products);
    const orders = await seedOrders(users, products);
    const payments = await seedPayments(orders);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

runSeed();
