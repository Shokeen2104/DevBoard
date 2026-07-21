const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;
    
    // For local dev without Docker, fallback to memory server
    if (process.env.NODE_ENV !== 'production' && (uri.includes('localhost') || uri.includes('127.0.0.1') || uri.includes('mongo:27017'))) {
      console.log('Using MongoDB Memory Server for local development...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
    }

    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Error connecting to MongoDB: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
