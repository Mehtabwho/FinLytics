const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Warning: Could not connect to MongoDB: ${error.message}`);
    console.log('Server will continue to run, but some features may be limited.');
    // process.exit(1);
  }
};

module.exports = connectDB;
