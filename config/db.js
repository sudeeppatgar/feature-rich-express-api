import mongoose from "mongoose";
import { config } from "./index.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(config.dbUri);
    console.log("Database connected successfully");
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};
