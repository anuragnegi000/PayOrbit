import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || "mongodb+srv://payorbit000_db_user:payorbit000@cluster0.jwghkkw.mongodb.net/payorbit";

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected successfully");
    console.log(`📊 Database: ${mongoose.connection.name}`);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1); 
  }
};
