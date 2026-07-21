import Restaurant from "../models/restaurant.model.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Booking from "../models/booking.model.js";
import crypto from "crypto";
import fs from "fs"
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";

const generateUniqueSlug = async (name) => {
  // Base slug
  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  let slug = baseSlug;
  let exists = await Restaurant.findOne({ slug });

  // Keep generating until unique
  while (exists) {
    const suffix = crypto.randomBytes(2).toString("hex");
    slug = `${baseSlug}-${suffix}`;

    exists = await Restaurant.findOne({ slug });
  }

  return slug;
};

// public/customer side controllers

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

//owner side controllers

// @desc    create restaurant
// @route   POST /api/restaurants/create
export const createRestaurant = async (req, res) => {
  try {
    const {
      name,
      description,
      cuisine,
      priceRange,
      location,
      address,
      chef,
      phone,
      email,
      website,
      tags,
    } = req.body;

    if (
      !name ||
      !description ||
      !cuisine ||
      !priceRange ||
      !location ||
      !address ||
      !chef ||
      !phone
    ) {
      throw new ApiError(400, "All fields are required!");
    }

    const slugName = generateUniqueSlug(name);

    const restaurant = await Restaurant.create({
      owner: req.user._id,
      status: "pending",
      slug: slugName,
      name,
      description,
      cuisine,
      priceRange,
      location,
      address,
      chef,
      phone,
      email,
      website,
      tags,
    });

    return res
      .status(201)
      .json(
        new ApiResponse(201, restaurant, "Restaurant created successfully!"),
      );
  } catch (error) {
    console.error("create Restaurant Controller Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// @desc    Update restaurant details (owner)
// @route   PATCH /api/restaurants/:id
export const updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      throw new ApiError(403, "Restaurant not found!");
    }

    const isOwner = restaurant.owner.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      throw new ApiError(403, "Access denied!");
    }

    const allowedFields = [
      "name",
      "description",
      "cuisine",
      "priceRange",
      "location",
      "address",
      "chef",
      "phone",
      "email",
      "website",
      "tags",
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      throw new ApiError(400, "Please provide at least one field to update");
    }

    const updateRestaurant = await Restaurant.findByIdAndUpdate(
      id,
      {
        $set: updates,
      },
      { new: true, runValidators: true },
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedRestaurant,
          "Restaurant updated successfully",
        ),
      );
  } catch (error) {
    console.error("updateRestaurant Controller Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// @desc    Delete a restaurant (owner/admin)
// @route   DELETE /api/restaurants/:id
export const deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      throw new ApiError(404, "Restaurant not found!");
    }

    const isOwner = restaurant.owner.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      throw new ApiError(403, "Access denied!");
    }

    // Block deletion if there are upcoming confirmed bookings
    const upcomingBookings = await Booking.countDocuments({
      restaurant: id,
      status: "confirmed",
      bookingDate: { $gte: new Date() },
    });

    if (upcomingBookings > 0) {
      throw new ApiError(
        400,
        `Cannot delete restaurant with ${upcomingBookings} upcoming booking(s). Cancel them first.`,
      );
    }

    if (restaurant.image?.public_id) {
      await deleteFromCloudinary(restaurant.image.public_id);
    }

    await Restaurant.findByIdAndDelete(id);

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Restaurant added successfully"));
  } catch (error) {
    console.error("deleteRestaurant Controller Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// @desc    Upload/update restaurant image (owner)
// @route   PATCH /api/restaurants/:id/image
export const uploadRestaurantImage = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      throw new ApiError(400, "Please upload an image!");
    }

    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      fs.unlinkSync(req.file.path);
      throw new ApiError(404, "Restaurant not found!");
    }

    const isOwner = restaurant.owner.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      fs.unlinkSync(req.file.path);
      throw new ApiError(403, "Access denied!");
    }

    if (restaurant.image?.public_id) {
      await deleteFromCloudinary(restaurant.image.public_id);
    }

    const uploaded = await uploadOnCloudinary(req.file.path);

    if (!uploaded) {
      throw new ApiError(500, "Failed to upload image");
    }

    restaurant.image = {
      url: uploaded.secure_url,
      public_id: uploaded.public_id,
    };

    await restaurant.save();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          restaurant,
          "Restaurant image updated successfully",
        ),
      );
  } catch (error) {
    console.error("uploadRestaurantImage Controller Error:", error);

    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
