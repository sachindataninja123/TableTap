import cron from "node-cron";
import Booking from "../models/booking.model.js";

export const startExpireBookingsJob = () => {
  // Runs every 5 minutes
  cron.schedule("*/5 * * * *", async () => {
    try {
      const result = await Booking.updateMany(
        {
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

      if (result.modifiedCount > 0) {
        console.log(`Auto-cancelled ${result.modifiedCount} expired pending booking(s)`);
      }
    } catch (error) {
      console.error("Expire Bookings Job Error:", error);
    }
  });
};