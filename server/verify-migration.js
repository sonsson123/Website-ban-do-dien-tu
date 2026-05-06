const mysql = require('mysql2/promise');

async function verifyMigration() {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'techshop',
      password: '0123456789',
      database: 'techshop'
    });

    console.log('✅ Connected to MySQL\n');

    // Check counts
    const tables = ['users', 'categories', 'products', 'coupons', 'reviews', 'carts', 'orders', 'orderItems', 'payments'];
    
    console.log('📊 Data counts:');
    for (const table of tables) {
      const [rows] = await conn.execute(`SELECT COUNT(*) as count FROM ${table}`);
      console.log(`   ${table}: ${rows[0].count}`);
    }

    console.log('\n🔍 Sample data:');
    
    // Show sample users
    const [users] = await conn.execute('SELECT id, email, username, role FROM users LIMIT 2');
    console.log('\nUsers:');
    users.forEach(u => console.log(`   - ${u.email} (${u.role})`));

    // Show sample products
    const [products] = await conn.execute('SELECT id, name, price, stock FROM products LIMIT 2');
    console.log('\nProducts:');
    products.forEach(p => console.log(`   - ${p.name} (Price: ${p.price}, Stock: ${p.stock})`));

    // Show sample orders
    const [orders] = await conn.execute('SELECT id, orderNumber, totalAmount FROM orders LIMIT 2');
    console.log('\nOrders:');
    orders.forEach(o => console.log(`   - Order #${o.orderNumber} (Total: ${o.totalAmount})`));

    await conn.end();
    console.log('\n✅ Verification complete!');
  } catch(e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
}

verifyMigration();
