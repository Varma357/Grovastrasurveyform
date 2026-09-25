import mongoose from 'mongoose';
import dns from 'node:dns';

// DNS SRV resolution for local Windows development environments
if (typeof window === 'undefined' && process.platform === 'win32') {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (e) {}
}

const MONGODB_URI =
  process.env.MONGODB_URI ||
  process.env.NEXT_PUBLIC_MONGODB_URI ||
  'mongodb+srv://penumatcha03_db_user:GBz0PQU5DBXCM4nr@grovastrasurveyform.yyadyo2.mongodb.net/grovastra?appName=GrovastraSurveyform';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 15000,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        console.log('✅ Connected to MongoDB Production Cluster');
        return mongooseInstance;
      })
      .catch((err) => {
        console.error('❌ MongoDB Connection Error:', err);
        cached.promise = null;
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
