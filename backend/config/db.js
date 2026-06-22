const mongoose = require('mongoose');

// Connect to MongoDB if a URI is configured. The app still boots without one
// so we can develop/demo the pipeline before the Atlas cluster is wired up.
let connected = false;

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('[db] MONGODB_URI not set — running without persistence (in-memory only).');
    return false;
  }
  try {
    await mongoose.connect(uri);
    connected = true;
    console.log('[db] MongoDB connected');
    return true;
  } catch (err) {
    console.error('[db] MongoDB connection error:', err.message);
    console.warn('[db] Continuing without persistence.');
    return false;
  }
}

function isConnected() {
  return connected;
}

module.exports = { connectDB, isConnected };
