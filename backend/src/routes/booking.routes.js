import express from "express";
import { isAuth, ownerOnly } from "../middlewares/isAuth.middleware.js";

import {
  createBooking,
  getMyBookings,
  cancelBooking,
  getRestaurantBookings,
  updateBookingStatus,
  getBookingsById,
} from "../controllers/booking.controller.js";

const bookingRouter = express.Router();

// Customer routes
bookingRouter.post("/", isAuth, createBooking);
bookingRouter.get("/my-bookings", isAuth, getMyBookings);
bookingRouter.patch("/:id/cancel", isAuth, cancelBooking);

// Owner/admin routes
bookingRouter.get(
  "/restaurant/:restaurantId",
  isAuth,
  ownerOnly,
  getRestaurantBookings,
);
bookingRouter.patch("/:id/status", isAuth, ownerOnly, updateBookingStatus);

// Shared 
bookingRouter.get("/:id", isAuth, getBookingsById);

export default bookingRouter;
