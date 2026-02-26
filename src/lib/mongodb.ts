import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not defined");
}

// Cache connection across HMR reloads in development
const globalWithMongoose = globalThis as typeof globalThis & {
  _mongoosePromise?: Promise<typeof mongoose>;
};

export function connectDB(): Promise<typeof mongoose> {
  if (globalWithMongoose._mongoosePromise) {
    return globalWithMongoose._mongoosePromise;
  }

  globalWithMongoose._mongoosePromise = mongoose.connect(MONGODB_URI);

  return globalWithMongoose._mongoosePromise;
}
