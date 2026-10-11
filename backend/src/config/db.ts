import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lms_db';
    console.log(`[DB] Connecting to MongoDB at ${connStr.replace(/\/\/.*@/, '//***@')}`);
    
    await mongoose.connect(connStr, { dbName: 'lms_db' });
    console.log('[DB] MongoDB Connected Successfully to lms_db');
  } catch (error) {
    console.error('[DB] Connection Error:', error);
    // Don't crash process completely if DB connection fails on cold start, retry or allow local mock fallback
  }
};
