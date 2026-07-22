import express from "express";
import { adminOnly, isAuth } from "../middlewares/isAuth.middleware.js";
import {
  deleteUser,
  demoteAdmin,
  getAllUsers,
  getPlatformStats,
  getUserById,
  promoteToAdmin,
  toggleBanUser,
} from "../controllers/admin.controller.js";

const adminRouter = express.Router();

adminRouter.get("/users", isAuth, adminOnly, getAllUsers);
adminRouter.get("/users/:id", isAuth, adminOnly, getUserById);
adminRouter.delete("/users/:id", isAuth, adminOnly, deleteUser);
adminRouter.patch("/users/:id/ban", isAuth, adminOnly, toggleBanUser);
adminRouter.patch("/users/:id/promote", isAuth, adminOnly, promoteToAdmin);
adminRouter.patch("/users/:id/demote", isAuth, adminOnly, demoteAdmin);
adminRouter.get("/stats", isAuth, adminOnly, getPlatformStats);

export default adminRouter;
