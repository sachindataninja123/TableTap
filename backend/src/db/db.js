import mongoose from "mongoose";

const connectToDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(process.env.MONGO_URI);

    console.log(
      `MONGODB CONNECTED !! DB HOST : ${connectionInstance.connection.host}`,
    );
  } catch (error) {
    console.log("MONGODB CONNECTION ERROR:", error);
    process.exit(1);
  }
};

export default connectToDB;
