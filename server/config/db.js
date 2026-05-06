'use strict';

const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME;

  if (!uri) {
    console.error('MONGODB_URI is not defined in environment variables');
    process.exit(1);
  }

  const options = {};
  if (dbName) {
    options.dbName = dbName;
  }

  try {
    await mongoose.connect(uri, options);
    console.log(`✓ MongoDB connected${dbName ? ` (db: ${dbName})` : ''}`);
  } catch (error) {
    console.error('✗ MongoDB connection error:', error);
    process.exit(1);
  }
}

module.exports = connectDB;
