import express from "express";
import { isAuth } from "../middlewares/isAuth.middleware.js";
import {
  changePassword,
  deleteAccount,
  updateProfile,
  updateProfileImage,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const userRouter = express.Router();

userRouter.patch("/update-profile", isAuth, updateProfile);
userRouter.patch("/change-password", isAuth, changePassword);
userRouter.patch(
  "/update-avatar",
  isAuth,
  upload.single("avatar"),
  updateProfileImage,
);
userRouter.delete("/delete-account", isAuth, deleteAccount);

export default userRouter;
