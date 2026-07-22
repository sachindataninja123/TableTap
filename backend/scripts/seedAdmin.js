import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../src/models/user.model.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existingAdmin = await User.findOne({ role: "admin" });

    if (existingAdmin) {
      console.log("An admin already exists:", existingAdmin.email);
      process.exit(0);
    }

    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
      console.error(
        "Please set ADMIN_EMAIL and ADMIN_PASSWORD in your .env file",
      );
      process.exit(1);
    }

    const admin = await User.create({
      name: "Sachin",
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      phone: "7033450312",
      role: "admin",
    });

    process.exit(0);
  } catch (error) {
    console.error("Seed Admin Error:", error);
    process.exit(1);
  }
};

seedAdmin();
