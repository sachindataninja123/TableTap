import express from "express";
import { isAuth } from "../middlewares/isAuth.middleware.js";
import {
  getFeaturedRestaurants,
  getRestaurantAvailability,
  getRestaurantBySlug,
  getRestaurants,
} from "../controllers/restaurant.controller.js";

const restaurantRouter = express.Router();

restaurantRouter.get("/", getRestaurants);
restaurantRouter.get("/featured", getFeaturedRestaurants);
restaurantRouter.get("/:slug", getRestaurantBySlug);
restaurantRouter.get("/:id/availability", getRestaurantAvailability);

export default restaurantRouter;
