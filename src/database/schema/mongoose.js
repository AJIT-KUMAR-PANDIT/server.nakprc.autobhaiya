// ─── demo/db/mongoose.js ──────────────────────────────────────
// Mongoose connection helper — import this once in your entry point

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/autobhaiya', {
      // Modern options — these are the defaults in v7, explicit for clarity
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);

    // Graceful shutdown on signals
    process.on('SIGINT', async () => {
      await mongoose.disconnect();
      console.log('🔌 MongoDB disconnected (SIGINT)');
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await mongoose.disconnect();
      console.log('🔌 MongoDB disconnected (SIGTERM)');
      process.exit(0);
    });

    // Handle connection errors without crashing
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });

  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
