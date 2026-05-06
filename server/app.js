'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middlewares/error.middleware');

// Import routes
let authRoutes, userRoutes, categoryRoutes, productRoutes, reviewRoutes, cartRoutes, couponRoutes, uploadRoutes, adminRoutes, orderRoutes, paymentsRoutes;
try {
    authRoutes = require('./routes/auth.routes');
    console.log('✓ Auth routes loaded successfully');
} catch (error) {
    console.error('✗ Error loading auth routes:', error);
    process.exit(1);
}

try {
    userRoutes = require('./routes/user.routes');
    console.log('✓ User routes loaded successfully');
} catch (error) {
    console.error('✗ Error loading user routes:', error);
    process.exit(1);
}

try {
    categoryRoutes = require('./routes/category.routes');
    console.log('✓ Category routes loaded successfully');
} catch (error) {
    console.error('✗ Error loading category routes:', error);
    process.exit(1);
}

try {
    productRoutes = require('./routes/product.routes');
    console.log('✓ Product routes loaded successfully');
} catch (error) {
    console.error('✗ Error loading product routes:', error);
    process.exit(1);
}

try {
    reviewRoutes = require('./routes/review.routes');
    console.log('✓ Review routes loaded successfully');
} catch (error) {
    console.error('✗ Error loading review routes:', error);
    process.exit(1);
}

try {
    cartRoutes = require('./routes/cart.routes');
    console.log('✓ Cart routes loaded successfully');
} catch (error) {
    console.error('✗ Error loading cart routes:', error);
    process.exit(1);
}

try {
    couponRoutes = require('./routes/coupon.routes');
    console.log('✓ Coupon routes loaded successfully');
} catch (error) {
    console.error('✗ Error loading coupon routes:', error);
    process.exit(1);
}

try {
    uploadRoutes = require('./routes/upload.routes');
    console.log('✓ Upload routes loaded successfully');
} catch (error) {
    console.error('✗ Error loading upload routes:', error);
    process.exit(1);
}

try {
    adminRoutes = require('./routes/admin.routes');
    console.log('✓ Admin routes loaded successfully');
} catch (error) {
    console.error('✗ Error loading admin routes:', error);
    process.exit(1);
}

try {
    orderRoutes = require('./routes/order.routes');
    console.log('✓ Order routes loaded successfully');
} catch (error) {
    console.error('✗ Error loading order routes:', error);
    process.exit(1);
}

try {
    paymentsRoutes = require('./routes/payments.routes');
    console.log('✓ Payments routes loaded successfully');
} catch (error) {
    console.error('✗ Error loading payments routes:', error);
    process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1);

// Allow multiple origins for development
const allowedOrigins = [
    'http://localhost:5000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://localhost:5177',
    'http://localhost:5178',
    'http://localhost:5179',
    'http://localhost:5180',
];

app.use(cors({
    origin: function(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// Debug middleware để log tất cả requests
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
        next();
    });
}

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes - Phải đặt TRƯỚC notFound middleware
app.use('/api/auth', authRoutes);
console.log('✓ API routes registered: /api/auth');

app.use('/api/users', userRoutes);
console.log('✓ API routes registered: /api/users');

app.use('/api/categories', categoryRoutes);
console.log('✓ API routes registered: /api/categories');

// Review routes phải đặt trước product routes để tránh conflict
app.use('/api', reviewRoutes);
console.log('✓ API routes registered: /api (reviews)');

app.use('/api/products', productRoutes);
console.log('✓ API routes registered: /api/products');

app.use('/api/cart', cartRoutes);
console.log('✓ API routes registered: /api/cart');

app.use('/api/coupons', couponRoutes);
console.log('✓ API routes registered: /api/coupons');

app.use('/api/uploads', uploadRoutes);
console.log('✓ API routes registered: /api/uploads');

app.use('/api/admin', adminRoutes);
console.log('✓ API routes registered: /api/admin');

app.use('/api/orders', orderRoutes);
console.log('✓ API routes registered: /api/orders');

app.use('/api/payments', paymentsRoutes);
console.log('✓ API routes registered: /api/payments');

// Error handling
app.use(notFound);
app.use(errorHandler);

(async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
})();

module.exports = app;