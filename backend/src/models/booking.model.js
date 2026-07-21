import mongoose, { Schema } from "mongoose";
import crypto from "crypto";

const bookingSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    restaurant: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },

    bookingDate: {
      type: Date,
      required: true,
    },

    bookingTime: {
      type: String,
      required: true,
      trim: true,
    },

    guests: {
      type: Number,
      required: true,
      min: 1,
      max: 20,
    },

    occasion: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
      index: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    specialRequests: {
      type: String,
      trim: true,
      default: "",
    },

    contactName: {
      type: String,
      required: true,
      trim: true,
    },

    contactPhone: {
      type: String,
      required: true,
      trim: true,
    },

    contactEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    bookingId: {
      type: String,
      unique: true,
      index: true,
    },

    cancelledAt: {
      type: Date,
    },
    
    expiresAt: {
      type: Date,
    },

    cancellationReason: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

bookingSchema.pre("validate", function (next) {
  if (!this.bookingId) {
    this.bookingId = `AS-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
  }
});

// Helpful indexes — now match the actual field names above
bookingSchema.index({ bookingDate: 1, bookingTime: 1 });
bookingSchema.index({ restaurant: 1, bookingDate: 1 });

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
