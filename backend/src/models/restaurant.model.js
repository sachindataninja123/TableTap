import mongoose, { Schema } from "mongoose";

const restaurantSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    cuisine: {
      type: String,
      required: true,
      trim: true,
    },

    priceRange: {
      type: String,
      enum: ["$", "$$", "$$$", "$$$$"],
      required: true,
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    reviewCount: {
      type: Number,
      default: 0,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      pincode: {
        type: String,
        required: true,
        match: [/^\d{6}$/, "Pincode must be 6 digits"],
      },
      country: {
        type: String,
        default: "India",
      },
    },

    coordinates: {
      latitude: Number,
      longitude: Number,
    },

    image: {
      url: {
        type: String,
        default: "",
      },
      public_id: {
        type: String,
        default: "",
      },
    },

    chef: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
    },

    website: {
      type: String,
      default: "",
    },

    openingTime: {
      type: String,
      default: "09:00 AM",
    },

    closingTime: {
      type: String,
      default: "11:00 PM",
    },

    tags: [String],

    availableSlots: [String],

    featured: {
      type: Boolean,
      default: false,
    },

    exclusive: {
      type: Boolean,
      default: false,
    },

    totalSeats: {
      type: Number,
      default: 20,
      min: 1,
    },

    availableSeats: {
      type: Number,
      default: 20,
      min: 0,
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

restaurantSchema.index({ cuisine: 1 });
restaurantSchema.index({ location: 1 });
restaurantSchema.index({ rating: -1 });
restaurantSchema.index({ featured: 1 });
restaurantSchema.index({ exclusive: 1 });

const Restaurant = mongoose.model("Restaurant", restaurantSchema);

export default Restaurant;
