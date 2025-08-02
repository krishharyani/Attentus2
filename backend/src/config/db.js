import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables from root .env
dotenv.config({ path: '../.env' });

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};
