import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import userRouter from "./routes/user.routes.js";

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Server is live!");
});

app.use("/api/v1/users", userRouter);

export default app;
