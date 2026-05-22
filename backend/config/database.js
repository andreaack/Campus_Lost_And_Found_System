const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('[DB] MONGODB_URI is not defined in .env');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
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

    process.exit(1);
  }
};

module.exports = connectDB;
