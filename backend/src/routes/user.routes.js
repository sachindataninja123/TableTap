import express from "express";
import {
  getMe,
  loginUser,
  registerUser,
} from "../controllers/user.controller.js";
import { isAuth } from "../middlewares/isAuth.middleware.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/get-me", isAuth, getMe);

export default userRouter;
