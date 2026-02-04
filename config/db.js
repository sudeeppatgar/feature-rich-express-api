import mongoose from "mongoose";
import { config } from "./index.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(config.dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Database connected successfully");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
