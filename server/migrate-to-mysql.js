require('dotenv').config();
const mysql = require('mysql2/promise');
const mongoose = require('mongoose');
const { User, Category, Product, Coupon, Review, Cart, Order, OrderItem, Payment } = require('./models');

async function migrateToMySQL() {
  let mysqlConn;
  
  try {
    // Connect to MongoDB
    console.log('📚 Connecting to MongoDB...');
    const uri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB_NAME;
    await mongoose.connect(uri, { dbName });
    console.log('✅ MongoDB connected');

    // Connect to MySQL
    console.log('🗄️  Connecting to MySQL...');
    mysqlConn = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'techshop',
      password: '0123456789',
      database: 'techshop'
    });
    console.log('✅ MySQL connected');

    // Drop existing tables if needed
    console.log('\n🧹 Cleaning up existing tables...');
    await mysqlConn.execute('SET FOREIGN_KEY_CHECKS = 0');
    const tables = ['payments', 'orderItems', 'orders', 'carts', 'reviews', 'coupons', 'products', 'categories', 'users'];
    for (const table of tables) {
      try {
        await mysqlConn.execute(`DROP TABLE IF EXISTS ${table}`);
      } catch (err) {
        // ignore
      }
    }
    await mysqlConn.execute('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Cleaned up');

    // Create tables
    console.log('\n📋 Creating tables...');
    
    const createUserTable = `
      CREATE TABLE users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        username VARCHAR(50),
        fullName VARCHAR(255),
        phone VARCHAR(20),
        role ENUM('customer', 'admin', 'staff') DEFAULT 'customer',
        isEmailVerified BOOLEAN DEFAULT false,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    await mysqlConn.execute(createUserTable);
    console.log('✅ users table created');

    const createCategoryTable = `
      CREATE TABLE categories (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        level INT DEFAULT 1,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    await mysqlConn.execute(createCategoryTable);
    console.log('✅ categories table created');

    const createProductTable = `
      CREATE TABLE products (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT NOT NULL,
        price DECIMAL(15, 2) NOT NULL,
        discount INT DEFAULT 0,
        stock INT DEFAULT 0,
        categoryId VARCHAR(36),
        brand VARCHAR(100),
        images JSON,
        specifications JSON,
        averageRating DECIMAL(3, 2) DEFAULT 0,
        numReviews INT DEFAULT 0,
        isActive BOOLEAN DEFAULT true,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (categoryId) REFERENCES categories(id),
        INDEX idx_slug (slug),
        INDEX idx_category (categoryId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    await mysqlConn.execute(createProductTable);
    console.log('✅ products table created');

    const createCouponTable = `
      CREATE TABLE coupons (
        id VARCHAR(36) PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        discountType ENUM('percentage', 'fixed') DEFAULT 'percentage',
        discountValue DECIMAL(10, 2) NOT NULL,
        minOrderValue DECIMAL(15, 2),
        maxUsageCount INT,
        usageCount INT DEFAULT 0,
        isActive BOOLEAN DEFAULT true,
        startDate DATETIME,
        endDate DATETIME,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_code (code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    await mysqlConn.execute(createCouponTable);
    console.log('✅ coupons table created');

    const createReviewTable = `
      CREATE TABLE reviews (
        id VARCHAR(36) PRIMARY KEY,
        userId VARCHAR(36),
        productId VARCHAR(36),
        rating INT NOT NULL,
        comment TEXT,
        isVerifiedPurchase BOOLEAN DEFAULT false,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (productId) REFERENCES products(id),
        INDEX idx_product (productId),
        INDEX idx_user (userId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    await mysqlConn.execute(createReviewTable);
    console.log('✅ reviews table created');

    const createCartTable = `
      CREATE TABLE carts (
        id VARCHAR(36) PRIMARY KEY,
        userId VARCHAR(36),
        items JSON,
        totalItems INT DEFAULT 0,
        totalPrice DECIMAL(15, 2) DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id),
        UNIQUE KEY unique_user (userId),
        INDEX idx_user (userId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    await mysqlConn.execute(createCartTable);
    console.log('✅ carts table created');

    const createOrderTable = `
      CREATE TABLE orders (
        id VARCHAR(36) PRIMARY KEY,
        orderNumber VARCHAR(50) UNIQUE NOT NULL,
        userId VARCHAR(36),
        shippingAddress JSON,
        paymentMethod ENUM('COD', 'payos') DEFAULT 'COD',
        paymentStatus ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
        orderStatus ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
        subtotal DECIMAL(15, 2) NOT NULL,
        shippingFee DECIMAL(10, 2) DEFAULT 0,
        taxAmount DECIMAL(10, 2) DEFAULT 0,
        discountAmount DECIMAL(10, 2) DEFAULT 0,
        totalAmount DECIMAL(15, 2) NOT NULL,
        notes TEXT,
        trackingNumber VARCHAR(100),
        paidAt DATETIME,
        deliveredAt DATETIME,
        cancelledAt DATETIME,
        cancellationReason TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id),
        INDEX idx_user (userId),
        INDEX idx_orderNumber (orderNumber),
        INDEX idx_orderStatus (orderStatus)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    await mysqlConn.execute(createOrderTable);
    console.log('✅ orders table created');

    const createOrderItemTable = `
      CREATE TABLE orderItems (
        id VARCHAR(36) PRIMARY KEY,
        orderId VARCHAR(36),
        productId VARCHAR(36),
        productName VARCHAR(255),
        price DECIMAL(15, 2),
        quantity INT NOT NULL,
        subtotal DECIMAL(15, 2),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (orderId) REFERENCES orders(id),
        FOREIGN KEY (productId) REFERENCES products(id),
        INDEX idx_order (orderId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    await mysqlConn.execute(createOrderItemTable);
    console.log('✅ orderItems table created');

    const createPaymentTable = `
      CREATE TABLE payments (
        id VARCHAR(36) PRIMARY KEY,
        orderId VARCHAR(36),
        method ENUM('COD', 'payos') NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        status ENUM('pending', 'processing', 'completed', 'failed', 'refunded') DEFAULT 'pending',
        transactionCode VARCHAR(100) UNIQUE,
        paidAt DATETIME,
        refundedAt DATETIME,
        refundAmount DECIMAL(15, 2) DEFAULT 0,
        refundReason TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (orderId) REFERENCES orders(id),
        INDEX idx_order (orderId),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    await mysqlConn.execute(createPaymentTable);
    console.log('✅ payments table created');

    // Migrate data
    console.log('\n📤 Migrating data from MongoDB to MySQL...');

    // Users
    console.log('  → Migrating users...');
    const users = await User.find().select('+password');
    for (const user of users) {
      const userData = user.toObject ? user.toObject() : user;
      const sql = `
        INSERT INTO users 
        (id, email, password, username, fullName, phone, role, isEmailVerified, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [
        userData._id ? userData._id.toString() : null,
        userData.email || null,
        userData.password || null,
        userData.username || null,
        userData.fullName || null,
        userData.phone || null,
        userData.role || 'customer',
        userData.isEmailVerified ? 1 : 0,
        userData.createdAt || new Date(),
        userData.updatedAt || new Date()
      ];
      // Ensure no undefined values
      const safeValues = values.map(v => v === undefined ? null : v);
      await mysqlConn.execute(sql, safeValues);
    }
    console.log(`    ✅ ${users.length} users migrated`);

    // Categories
    console.log('  → Migrating categories...');
    const categories = await Category.find();
    for (const category of categories) {
      const catData = category.toObject ? category.toObject() : category;
      const sql = `
        INSERT INTO categories
        (id, name, slug, description, level, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [
        catData._id ? catData._id.toString() : null,
        catData.name || null,
        catData.slug || null,
        catData.description || null,
        catData.level || 1,
        catData.createdAt || new Date(),
        catData.updatedAt || new Date()
      ];
      const safeValues = values.map(v => v === undefined ? null : v);
      await mysqlConn.execute(sql, safeValues);
    }
    console.log(`    ✅ ${categories.length} categories migrated`);

    // Products
    console.log('  → Migrating products...');
    const products = await Product.find();
    for (const product of products) {
      const prodData = product.toObject ? product.toObject() : product;
      const sql = `
        INSERT INTO products
        (id, name, slug, description, price, discount, stock, categoryId, brand, images, specifications, averageRating, numReviews, isActive, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [
        prodData._id ? prodData._id.toString() : null,
        prodData.name || null,
        prodData.slug || null,
        prodData.description || null,
        prodData.price || 0,
        prodData.discount || 0,
        prodData.stock || 0,
        prodData.category ? prodData.category.toString() : null,
        prodData.brand || null,
        JSON.stringify(prodData.images || []),
        JSON.stringify(prodData.specifications || {}),
        prodData.averageRating || 0,
        prodData.numReviews || 0,
        prodData.isActive !== false ? 1 : 0,
        prodData.createdAt || new Date(),
        prodData.updatedAt || new Date()
      ];
      const safeValues = values.map(v => v === undefined ? null : v);
      await mysqlConn.execute(sql, safeValues);
    }
    console.log(`    ✅ ${products.length} products migrated`);

    // Coupons
    console.log('  → Migrating coupons...');
    const coupons = await Coupon.find();
    for (const coupon of coupons) {
      const couponData = coupon.toObject ? coupon.toObject() : coupon;
      const sql = `
        INSERT INTO coupons
        (id, code, description, discountType, discountValue, minOrderValue, maxUsageCount, usageCount, isActive, startDate, endDate, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [
        couponData._id ? couponData._id.toString() : null,
        couponData.code || null,
        couponData.description || null,
        couponData.discountType || 'percentage',
        couponData.discountValue || 0,
        couponData.minOrderValue || null,
        couponData.maxUsageCount || null,
        couponData.usageCount || 0,
        couponData.isActive !== false ? 1 : 0,
        couponData.startDate || null,
        couponData.endDate || null,
        couponData.createdAt || new Date(),
        couponData.updatedAt || new Date()
      ];
      const safeValues = values.map(v => v === undefined ? null : v);
      await mysqlConn.execute(sql, safeValues);
    }
    console.log(`    ✅ ${coupons.length} coupons migrated`);

    // Reviews
    console.log('  → Migrating reviews...');
    const reviews = await Review.find();
    for (const review of reviews) {
      const reviewData = review.toObject ? review.toObject() : review;
      const sql = `
        INSERT INTO reviews
        (id, userId, productId, rating, comment, isVerifiedPurchase, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [
        reviewData._id ? reviewData._id.toString() : null,
        reviewData.user ? reviewData.user.toString() : null,
        reviewData.product ? reviewData.product.toString() : null,
        reviewData.rating || 0,
        reviewData.comment || null,
        reviewData.isVerifiedPurchase ? 1 : 0,
        reviewData.createdAt || new Date(),
        reviewData.updatedAt || new Date()
      ];
      const safeValues = values.map(v => v === undefined ? null : v);
      await mysqlConn.execute(sql, safeValues);
    }
    console.log(`    ✅ ${reviews.length} reviews migrated`);

    // Carts
    console.log('  → Migrating carts...');
    const carts = await Cart.find();
    for (const cart of carts) {
      const cartData = cart.toObject ? cart.toObject() : cart;
      const sql = `
        INSERT INTO carts
        (id, userId, items, totalItems, totalPrice, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [
        cartData._id ? cartData._id.toString() : null,
        cartData.user ? cartData.user.toString() : null,
        JSON.stringify(cartData.items || []),
        cartData.totalItems || 0,
        cartData.totalPrice || 0,
        cartData.createdAt || new Date(),
        cartData.updatedAt || new Date()
      ];
      const safeValues = values.map(v => v === undefined ? null : v);
      await mysqlConn.execute(sql, safeValues);
    }
    console.log(`    ✅ ${carts.length} carts migrated`);

    // Orders
    console.log('  → Migrating orders...');
    const orders = await Order.find();
    for (const order of orders) {
      const orderData = order.toObject ? order.toObject() : order;
      const sql = `
        INSERT INTO orders
        (id, orderNumber, userId, shippingAddress, paymentMethod, paymentStatus, orderStatus, subtotal, shippingFee, taxAmount, discountAmount, totalAmount, notes, trackingNumber, paidAt, deliveredAt, cancelledAt, cancellationReason, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [
        orderData._id ? orderData._id.toString() : null,
        orderData.orderNumber || null,
        orderData.user ? orderData.user.toString() : null,
        JSON.stringify(orderData.shippingAddress || {}),
        orderData.paymentMethod || 'COD',
        orderData.paymentStatus || 'pending',
        orderData.orderStatus || 'pending',
        orderData.subtotal || 0,
        orderData.shippingFee || 0,
        orderData.taxAmount || 0,
        orderData.discountAmount || 0,
        orderData.totalAmount || 0,
        orderData.notes || null,
        orderData.trackingNumber || null,
        orderData.paidAt || null,
        orderData.deliveredAt || null,
        orderData.cancelledAt || null,
        orderData.cancellationReason || null,
        orderData.createdAt || new Date(),
        orderData.updatedAt || new Date()
      ];
      const safeValues = values.map(v => v === undefined ? null : v);
      await mysqlConn.execute(sql, safeValues);
    }
    console.log(`    ✅ ${orders.length} orders migrated`);

    // Order Items
    console.log('  → Migrating order items...');
    const orderItems = await OrderItem.find();
    for (const item of orderItems) {
      const itemData = item.toObject ? item.toObject() : item;
      const sql = `
        INSERT INTO orderItems
        (id, orderId, productId, productName, price, quantity, subtotal, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [
        itemData._id ? itemData._id.toString() : null,
        itemData.order ? itemData.order.toString() : null,
        itemData.product ? itemData.product.toString() : null,
        itemData.productName || null,
        itemData.price || 0,
        itemData.quantity || 1,
        itemData.subtotal || 0,
        itemData.createdAt || new Date()
      ];
      const safeValues = values.map(v => v === undefined ? null : v);
      await mysqlConn.execute(sql, safeValues);
    }
    console.log(`    ✅ ${orderItems.length} order items migrated`);

    // Payments
    console.log('  → Migrating payments...');
    const payments = await Payment.find();
    for (const payment of payments) {
      const paymentData = payment.toObject ? payment.toObject() : payment;
      const sql = `
        INSERT INTO payments
        (id, orderId, method, amount, status, transactionCode, paidAt, refundedAt, refundAmount, refundReason, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [
        paymentData._id ? paymentData._id.toString() : null,
        paymentData.order ? paymentData.order.toString() : null,
        paymentData.method || 'COD',
        paymentData.amount || 0,
        paymentData.status || 'pending',
        paymentData.transactionCode || null,
        paymentData.paidAt || null,
        paymentData.refundedAt || null,
        paymentData.refundAmount || 0,
        paymentData.refundReason || null,
        paymentData.createdAt || new Date(),
        paymentData.updatedAt || new Date()
      ];
      const safeValues = values.map(v => v === undefined ? null : v);
      await mysqlConn.execute(sql, safeValues);
    }
    console.log(`    ✅ ${payments.length} payments migrated`);

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Categories: ${categories.length}`);
    console.log(`   Products: ${products.length}`);
    console.log(`   Coupons: ${coupons.length}`);
    console.log(`   Reviews: ${reviews.length}`);
    console.log(`   Carts: ${carts.length}`);
    console.log(`   Orders: ${orders.length}`);
    console.log(`   Order Items: ${orderItems.length}`);
    console.log(`   Payments: ${payments.length}`);

    await mysqlConn.end();
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    process.exit(1);
  }
}

migrateToMySQL();
