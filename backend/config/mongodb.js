const mongoose = require('mongoose');

const connectMongoDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crimepilot');
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    // Don't crash process so fallback database remains online
  }
};

module.exports = connectMongoDB;
