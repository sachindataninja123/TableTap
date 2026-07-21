import Booking from "../models/booking.model.js";

export const expireStaleBookings = async (filter = {}) => {
  await Booking.updateMany(
    {
      ...filter,
      status: "pending",
      expiresAt: { $lte: new Date() },
    },
    {
      $set: {
        status: "cancelled",
        cancelledAt: new Date(),
        cancellationReason: "Auto-cancelled: owner did not respond within 30 minutes",
      },
    }
  );
};