import mongoose from 'mongoose';

export async function connectDb(uri) {
  const mongoUri =
    uri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dishdetail';

  if (mongoose.connection.readyState === 1) return mongoose.connection;

  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri);
  return mongoose.connection;
}
