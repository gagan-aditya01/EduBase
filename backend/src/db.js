const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/mydatabase';
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`\n❌ MongoDB Connection Failed: ${error.message}`);
    console.error(`\n📌 FIX INSTRUCTIONS:`);
    console.error(`1. Log into your MongoDB Atlas Dashboard (https://cloud.mongodb.com).`);
    console.error(`2. Navigate to Security -> Network Access -> Add IP Address.`);
    console.error(`3. Click 'ALLOW ACCESS FROM ANYWHERE' (0.0.0.0/0) or add current IP (104.28.220.175).\n`);
  }
};

module.exports = connectDB;
