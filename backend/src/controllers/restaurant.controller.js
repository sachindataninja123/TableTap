import Restaurant from "../models/restaurant.model.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Booking from "../models/booking.model.js";
import crypto from "crypto";
import fs from "fs";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { expireStaleBookings } from "../utils/expireStaleBookings.js";

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

// ========== PUBLIC/CUSTOMER CONTROLLERS ===========

// @desc    Get restaurant
// @route   GET /api/restaurants/
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

// @desc    Get featured restaurant
// @route   GET /api/restaurants/featured
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

// @desc    Get restaurant by slug
// @route   GET /api/restaurants/:slug
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

// @desc    Get restaurant availability
// @route   GET /api/restaurants/:id/availability
export const getRestaurantAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    await expireStaleBookings({ restaurant: id });

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
      status: { $in: ["pending", "confirmed"] },
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

// ========== OWNER CONTROLLERS ===========

// @desc    Create restaurant
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

    const slugName = await generateUniqueSlug(name);

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
      throw new ApiError(404, "Restaurant not found!");
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

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
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
      .json(new ApiResponse(200, null, "Restaurant deleted successfully"));
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

// @desc    Set opening hours & available slots (owner)
// @route   PATCH /api/restaurants/:id/hours
export const setOpeningHours = async (req, res) => {
  try {
    const { id } = req.params;
    const { openingTime, closingTime, availableSlots } = req.body;

    if (!openingTime || !closingTime || !Array.isArray(availableSlots)) {
      throw new ApiError(
        400,
        "Please provide openingTime, closingTime, and availableSlots array",
      );
    }

    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      throw new ApiError(404, "Restaurant not found!");
    }

    const isOwner = restaurant.owner.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      throw new ApiError(403, "Access denied!");
    }

    restaurant.openingTime = openingTime;
    restaurant.closingTime = closingTime;
    restaurant.availableSlots = availableSlots;

    await restaurant.save();

    return res
      .status(200)
      .json(
        new ApiResponse(200, restaurant, "Opening hours updated successfully"),
      );
  } catch (error) {
    console.error("setOpeningHours Controller Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// @desc    Get logged-in owner's restaurant(s)
// @route   GET /api/restaurants/my-restaurants
export const getMyRestaurants = async (req, res) => {
  try {
    //owner needs to see pending/rejected too.
    const restaurants = await Restaurant.find({ owner: req.user._id }).sort({
      createdAt: -1,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          restaurants,
          "Your restaurants fetched successfully",
        ),
      );
  } catch (error) {
    console.error("getMyRestaurants Controller Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// ========== ADMIN CONTROLLERS ===========

// @desc    Approve a pending restaurant (admin)
// @route   PATCH /api/restaurants/:id/approve
export const approveRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      throw new ApiError(404, "Restaurant not found!");
    }

    if (restaurant.status === "approved") {
      throw new ApiError(400, "Restaurant is already approved");
    }

    restaurant.status = "approved";
    await restaurant.save();

    return res
      .status(200)
      .json(
        new ApiResponse(200, restaurant, "Restaurant approved successfully"),
      );
  } catch (error) {
    console.error("approveRestaurant Controller Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// @desc    Reject a pending restaurant (admin)
// @route   PATCH /api/restaurants/:id/reject
export const rejectRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      throw new ApiError(404, "Restaurant not found!");
    }

    restaurant.status = "rejected";
    if (rejectionReason) {
      restaurant.rejectionReason = rejectionReason; // requires schema field, see note below
    }

    await restaurant.save();

    return res
      .status(200)
      .json(
        new ApiResponse(200, restaurant, "Restaurant rejected successfully"),
      );
  } catch (error) {
    console.error("rejectRestaurant Controller Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// @desc    Get all restaurants regardless of status (admin moderation view)
// @route   GET /api/restaurants/admin/all
export const getAllRestaurantsAdmin = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (status) filter.status = status; // no forced "approved" filter here

    const skip = (Number(page) - 1) * Number(limit);

    const restaurants = await Restaurant.find(filter)
      .populate("owner", "name email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Restaurant.countDocuments(filter);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          restaurants,
          currentPage: Number(page),
          totalPages: Math.ceil(total / limit),
          totalRestaurants: total,
        },
        "Restaurants fetched successfully",
      ),
    );
  } catch (error) {
    console.error("getAllRestaurantsAdmin Controller Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// @desc    Toggle featured status of a restaurant (admin)
// @route   PATCH /api/restaurants/:id/featured
export const toggleFeaturedStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { featured } = req.body;

    if (typeof featured !== "boolean") {
      throw new ApiError(400, "featured must be true or false");
    }

    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      throw new ApiError(404, "Restaurant not found!");
    }

    // Only approved restaurants should be featurable —
    if (restaurant.status !== "approved") {
      throw new ApiError(400, "Only approved restaurants can be featured");
    }

    restaurant.featured = featured;
    await restaurant.save();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          restaurant,
          `Restaurant ${featured ? "marked as" : "removed from"} featured`,
        ),
      );
  } catch (error) {
    console.error("toggleFeaturedStatus Controller Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// @desc    Toggle exclusive status of a restaurant (admin)
// @route   PATCH /api/restaurants/:id/exclusive
export const toggleExclusiveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { exclusive } = req.body;

    if (typeof exclusive !== "boolean") {
      throw new ApiError(400, "exclusive must be true or false");
    }

    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      throw new ApiError(404, "Restaurant not found!");
    }

    if (restaurant.status !== "approved") {
      throw new ApiError(
        400,
        "Only approved restaurants can be marked exclusive",
      );
    }

    restaurant.exclusive = exclusive;
    await restaurant.save();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          restaurant,
          `Restaurant ${exclusive ? "marked as" : "removed from"} exclusive`,
        ),
      );
  } catch (error) {
    console.error("toggleExclusiveStatus Controller Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
