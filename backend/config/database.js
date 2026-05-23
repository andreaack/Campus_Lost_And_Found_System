const mongoose = require('mongoose');

// Cache connection for serverless (Vercel)
let cached = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('[DB] MONGODB_URI is not defined in .env');
    return;
  }

  // Return cached connection if available
  if (cached.conn) {
    console.log('[DB] Using cached MongoDB connection');
    return cached.conn;
  }

  // Create new connection if not cached
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      bufferCommands: false,
    }).then((conn) => {
      console.log(`[DB] MongoDB Connected: ${conn.connection.host}`);
      return conn;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    console.error('[DB] MongoDB connection FAILED.');
    console.error('[DB] Error name:', error.name);
    console.error('[DB] Error message:', error.message);

    if (error.message.includes('EBADNAME') || error.message.includes('querySrv')) {
      console.error('[DB] ⚠ SRV lookup failed. Your network may block DNS SRV records (common on campus/corporate networks).');
      console.error('[DB] FIX: Switch from mongodb+srv:// to mongodb:// in your connection string.');
    }

    if (error.message.includes('IP') || error.message.includes('whitelist') || error.message.includes('not whitelisted')) {
      console.error('[DB] ⚠ Your current IP is not whitelisted in MongoDB Atlas.');
      console.error('[DB] FIX: Go to Atlas → Network Access → Add IP Address → 0.0.0.0/0 (Allow from Anywhere).');
    }

    if (error.name === 'MongoServerSelectionError') {
      console.error('[DB] ⚠ Could not reach any MongoDB server within 10s.');
      console.error('[DB] Possible causes: firewall blocking port 27017, wrong credentials, or Atlas cluster is paused.');
    }

    throw error;
  }
};

module.exports = connectDB;
