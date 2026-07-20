import express from "express";
import {
  getMe,
  loginUser,
  logOutUser,
  registerUser,
} from "../controllers/auth.controller.js";
import { isAuth } from "../middlewares/isAuth.middleware.js";

const authRouter = express.Router();

authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);
authRouter.get("/get-me", isAuth, getMe);
authRouter.post("/logout", isAuth, logOutUser);

export default authRouter;
