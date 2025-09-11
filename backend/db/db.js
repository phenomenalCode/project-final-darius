import mongoose from "mongoose";

export const connectDB = async () => {
  const mongoUrl = process.env.MONGO_URI || "mongodb://localhost:27017/task-manager";

  try {
    await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      
    });
    console.log("✅ MongoDB connected:", mongoUrl);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1); // exit process if DB connection fails
  }

  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️ MongoDB disconnected!");
  });
};
