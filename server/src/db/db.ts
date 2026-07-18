import mongoose from "mongoose";

const connecToDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in the .env file");
    }

    const connectionInstance = await mongoose.connect(process.env.MONGO_URI);

    console.log(
      `MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`,
    );
  } catch (error) {
    console.log("Database connection error :", error);
    process.exit(1);
  }
};

export default connecToDB;
