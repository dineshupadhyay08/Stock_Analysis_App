import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

declare global {
  var mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

export const connectToDatabase = async () => {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI must be set within .env (or .env.local)");
  }

  if (cached.conn) return cached.conn;

  // If a connection is in-flight, reuse the same promise.
  if (!cached.promise) {
    // NOTE: do not use NEXT_PUBLIC_* here; this must stay server-side.
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    cached.conn = null;
    throw err;
  }

  // Avoid logging the full URI (may contain credentials)
  const uriForLog = MONGODB_URI.replace(/:\/\/.*@/, "://***@");
  console.log(`Connected to MongoDB (${process.env.NODE_ENV}) - ${uriForLog}`);

  return cached.conn;
};

