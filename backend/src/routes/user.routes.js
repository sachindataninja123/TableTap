import express from "express";
import {
  getMe,
  loginUser,
  logOutUser,
  registerUser,
} from "../controllers/user.controller.js";
import { isAuth } from "../middlewares/isAuth.middleware.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/get-me", isAuth, getMe);
userRouter.post("/logout", isAuth, logOutUser);

export default userRouter;
