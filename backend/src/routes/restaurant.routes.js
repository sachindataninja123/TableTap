import express, { Router } from "express";
import {
  adminOnly,
  isAuth,
  ownerOnly,
} from "../middlewares/isAuth.middleware.js";
import {
  // public/customer
  getRestaurants,
  getFeaturedRestaurants,
  getRestaurantBySlug,
  getRestaurantAvailability,
  // owner
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  uploadRestaurantImage,
  setOpeningHours,
  getMyRestaurants,
  // admin
  approveRestaurant,
  rejectRestaurant,
  getAllRestaurantsAdmin,
} from "../controllers/restaurant.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const restaurantRouter = express.Router();

// ========== PUBLIC ROUTES ==========
restaurantRouter.get("/", getRestaurants);
restaurantRouter.get("/featured", getFeaturedRestaurants);

// ========== OWNER ROUTES ==========
restaurantRouter.post("/create", isAuth, ownerOnly, createRestaurant);
restaurantRouter.get("/my-restaurants", isAuth, ownerOnly, getMyRestaurants);
restaurantRouter.patch("/:id", isAuth, ownerOnly, updateRestaurant);
restaurantRouter.delete("/:id", isAuth, ownerOnly, deleteRestaurant);
restaurantRouter.patch(
  "/:id/image",
  isAuth,
  ownerOnly,
  upload.single("image"),
  uploadRestaurantImage,
);
restaurantRouter.patch("/:id/hours", isAuth, ownerOnly, setOpeningHours);

// ========== ADMIN ROUTES ==========
restaurantRouter.get("/admin/all", isAuth, adminOnly, getAllRestaurantsAdmin);
restaurantRouter.patch("/:id/approve", isAuth, adminOnly, approveRestaurant);
restaurantRouter.patch("/:id/reject", isAuth, adminOnly, rejectRestaurant);

// ========== PUBLIC ROUTES (dynamic, must come LAST) ==========
restaurantRouter.get("/:slug", getRestaurantBySlug);
restaurantRouter.get("/:id/availability", getRestaurantAvailability);

export default restaurantRouter;
