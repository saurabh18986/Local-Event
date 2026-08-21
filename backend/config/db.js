const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Attempt connection to configured MONGO_URI
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 2500, // Fast fallback if local daemon is down
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️ Local MongoDB connection failed: ${error.message}`);
    console.log(`🚀 Launching automatic In-Memory MongoDB Server for instant development...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      const conn = await mongoose.connect(mongoUri);
      console.log(`✅ In-Memory MongoDB Connected: ${conn.connection.host}`);
    } catch (memErr) {
      console.error(`❌ Failed to start In-Memory MongoDB: ${memErr.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;

