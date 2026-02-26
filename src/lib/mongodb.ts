import mongoose from "mongoose";

// Cache connection across HMR reloads in development
const globalWithMongoose = globalThis as typeof globalThis & {
  _mongoosePromise?: Promise<typeof mongoose>;
};

export function connectDB(): Promise<typeof mongoose> {
  if (globalWithMongoose._mongoosePromise) {
    return globalWithMongoose._mongoosePromise;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not defined");
  }

  globalWithMongoose._mongoosePromise = mongoose.connect(uri);

  return globalWithMongoose._mongoosePromise;
}
