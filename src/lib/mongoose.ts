// This approach is taken from https://github.com/vercel/next.js/tree/canary/examples/with-mongodb-mongoose
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
import { log } from "next-axiom";

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    if (!MONGODB_URI) {
      throw new Error(
        "Please define the MONGODB_URI environment variable inside .env.local"
      );
    }

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        return mongoose;
      })
      .catch((error) => {
        log.error("Failed to connect to MongoDB", { error, uri: MONGODB_URI });
        throw error;
      });
  }
  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    log.error("Error resolving MongoDB connection promise", { error });
    throw error;
  }
}

export default dbConnect;
