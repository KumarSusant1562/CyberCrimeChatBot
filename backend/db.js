// db.js
require('dotenv').config();
const mongoose = require('mongoose');
const net = require('net');

const connectDB = async () => {
  let uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI not set in .env');
    process.exit(1);
  }

  // Auto-fix common URI issues
  uri = uri.trim();
  
  // Check for invalid scheme (typos like mmongodb)
  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    console.error('❌ Invalid MONGODB_URI scheme. Must start with "mongodb://" or "mongodb+srv://"');
    console.error('Current value:', uri);
    process.exit(1);
  }

  // Ensure database name is present (add default if missing)
  if (!uri.includes('mongodb.net/') || uri.endsWith('mongodb.net/')) {
    console.warn('⚠️  No database name in MONGODB_URI. Adding default: cybercrime-db');
    uri = uri.replace(/\/$/, '') + '/cybercrime-db';
  }

  // Ensure connection parameters exist
  if (!uri.includes('?')) {
    console.warn('⚠️  Adding recommended connection parameters');
    uri += '?retryWrites=true&w=majority';
  }

  console.log('📡 Connecting to MongoDB...');
  
  // Use recommended options and a reasonable server selection timeout
  const opts = {
    serverSelectionTimeoutMS: 10000, // 10 second timeout
    // Prefer IPv4 to avoid potential IPv6 localhost resolution issues on some Windows setups
    family: 4,
    // Mongoose recommended options
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  try {
    await mongoose.connect(uri, opts);
    console.log('✅ MongoDB connected successfully');
    console.log('📊 Database:', mongoose.connection.name);
  } catch (err) {
    console.error('❌ MongoDB Atlas connection failed:', err.message);
    
    // Give helpful hints based on error type
    if (err.name === 'MongooseServerSelectionError') {
      console.error('\n🚨 CONNECTION FAILED - ACTION REQUIRED 🚨');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('\n📍 MOST LIKELY ISSUE: Your IP is not whitelisted in MongoDB Atlas');
      console.error('\n✅ SOLUTION - Follow these steps:');
      console.error('   1. Go to: https://cloud.mongodb.com');
      console.error('   2. Click on your cluster → Network Access');
      console.error('   3. Click "Add IP Address"');
      console.error('   4. Click "Add Current IP Address" OR');
      console.error('   5. Enter 0.0.0.0/0 (allows all IPs - FOR TESTING ONLY)');
      console.error('   6. Click "Confirm"');
      console.error('   7. Wait 2-3 minutes for changes to apply');
      console.error('   8. Restart this server');
      console.error('\n🌐 Your current IP address:');
      console.error('   Run this command: (Invoke-WebRequest -Uri "https://api.ipify.org").Content');
      console.error('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('\n⚠️  Other possible issues:');
      console.error('   • Wrong username/password in MONGODB_URI');
      console.error('   • Cluster is paused or deleted');
      console.error('   • Network/firewall blocking connection');
    } else if (err.name === 'MongoParseError') {
      console.error('\n💡 Your MONGODB_URI format is invalid.');
      console.error('Expected format: mongodb+srv://username:password@cluster.mongodb.net/database');
      console.error('Current URI:', process.env.MONGODB_URI);
    }
    // If configured, attempt a local MongoDB fallback before giving up, but only if reachable
    const tryLocal = process.env.ENABLE_LOCAL_DB_FALLBACK === 'true';
    if (tryLocal) {
      const localUri = process.env.LOCAL_MONGODB_URI || 'mongodb://127.0.0.1:27017/cybercrime-db';
      console.warn('⚠️ ENABLE_LOCAL_DB_FALLBACK is true — checking local MongoDB at', localUri);

      // Helper: check if local port 27017 is open (quick TCP probe)
      const isLocalUp = await new Promise((resolve) => {
        const socket = new net.Socket();
        const host = '127.0.0.1';
        const port = 27017;
        let settled = false;

        socket.setTimeout(2000);
        socket.on('connect', () => {
          settled = true;
          socket.destroy();
          resolve(true);
        });
        socket.on('timeout', () => {
          if (!settled) { settled = true; socket.destroy(); resolve(false); }
        });
        socket.on('error', () => {
          if (!settled) { settled = true; socket.destroy(); resolve(false); }
        });
        socket.connect(port, host);
      });

      if (isLocalUp) {
        try {
          await mongoose.connect(localUri, opts);
          console.log('✅ MongoDB connected to local fallback');
          return;
        } catch (localErr) {
          console.error('❌ Local MongoDB fallback failed:', localErr && localErr.message ? localErr.message : localErr);
        }
      } else {
        console.warn('⚠️ Local MongoDB not reachable at 127.0.0.1:27017 — skipping local fallback.');
      }
    }

    // Re-throw the original error so caller can decide how to handle shutdown
    throw err;
  }
};

module.exports = connectDB;
