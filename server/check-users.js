require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User.model.js');

async function checkUsers() {
  try {
    const uri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB_NAME;
    console.log('Connecting to:', uri, 'with db:', dbName);
    await mongoose.connect(uri, { dbName });
    const users = await User.find().select('+password');
    console.log('Total users:', users.length);
    users.forEach((u, i) => {
      console.log(`User ${i+1}: email=${u.email}, hasPassword=${!!u.password}, password="${u.password}"`);
    });
    process.exit(0);
  } catch(e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}

checkUsers();
