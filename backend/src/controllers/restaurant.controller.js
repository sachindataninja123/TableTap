import Restaurant from "../models/restaurant.model.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import Booking from "../models/booking.model.js";

export const getRestaurants = async (req, res) => {
  try {
    const {
      search,
      location,
      cuisine,
      priceRange,
      rating,
      sort,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    // Search by restaurant name
    if (search) {
      filter.name = {
        $regex: search,
        $options: "i",
      };
    }

    // Filter by cuisine
    if (cuisine) {
      filter.cuisine = {
        $regex: cuisine,
        $options: "i",
      };
    }

    // Filter by location
    if (location) {
      filter.location = {
        $regex: location,
        $options: "i",
      };
    }

    // Filter by price range
    if (priceRange) {
      filter.priceRange = priceRange;
    }

    // Minimum rating
    if (rating) {
      filter.rating = {
        $gte: Number(rating),
      };
    }

    // Show only approved restaurants
    filter.status = "approved";

    // Sorting
    let sortOption = {};

    switch (sort) {
      case "rating":
        sortOption = { rating: -1 };
        break;

      case "newest":
        sortOption = { createdAt: -1 };
        break;

      case "oldest":
        sortOption = { createdAt: 1 };
        break;

      case "name":
        sortOption = { name: 1 };
        break;

      default:
        sortOption = { createdAt: -1 };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const restaurants = await Restaurant.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit))
      .populate("owner", "name email");

    const totalRestaurants = await Restaurant.countDocuments(filter);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          restaurants,
          currentPage: Number(page),
          totalPages: Math.ceil(totalRestaurants / limit),
          totalRestaurants,
        },
        "Restaurants fetched successfully",
      ),
    );
  } catch (error) {
    console.error("Get Restaurant Controller Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const getFeaturedRestaurants = async (req, res) => {
  try {
    const featured = await Restaurant.find({
      status: "approved",
      $or: [{ featured: true }, { exclusive: true }],
    }).limit(6);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          featured,
          "featured restaurants fetched successfully!",
        ),
      );
  } catch (error) {
    console.error("getFeaturedRestaurants Controller Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const getRestaurantBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const restaurant = await Restaurant.findOne({ slug });

    if (!restaurant) {
      throw new ApiError(404, "Restaurant not found!");
    }

    if (restaurant.status !== "approved") {
      if (!req.user) {
        throw new ApiError(404, "Restaurant not found!");
      }

      const isOwner = restaurant.owner.toString() === req.user._id.toString();

      if (req.user.role !== "admin" && !isOwner) {
        throw new ApiError(403, "Access denied!");
      }
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, restaurant, "Restaurant fetched successfully"),
      );
  } catch (error) {
    console.error("Get Restaurant By Slug Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getRestaurantAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!date) {
      throw new ApiError(400, "Please provide a booking date!");
    }

    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      throw new ApiError(404, "Restaurant not found!");
    }

    // Start & End of selected date
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const bookings = await Booking.find({
      restaurant: id,
      bookingDate: {
        $gte: startDate,
        $lte: endDate,
      },
      status: "confirmed",
    });

    const availability = restaurant.availableSlots.map((slot) => {
      const slotBookings = bookings.filter(
        (booking) => booking.bookingTime === slot,
      );

      const bookedSeats = slotBookings.reduce(
        (total, booking) => total + booking.guests,
        0,
      );

      const availableSeats = Math.max(restaurant.totalSeats - bookedSeats, 0);

      return {
        slot,
        totalSeats: restaurant.totalSeats,
        bookedSeats,
        availableSeats,
        isAvailable: availableSeats > 0,
      };
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          restaurant: restaurant.name,
          date,
          availability,
        },
        "Availability fetched successfully",
      ),
    );
  } catch (error) {
    console.error("getRestaurantAvailability Controller Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
