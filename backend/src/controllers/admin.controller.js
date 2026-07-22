import Booking from "../models/booking.model.js";
import Restaurant from "../models/restaurant.model.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// @desc    Get all users (with role filter + search)
// @route   GET /api/admin/users
export const getAllUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 10 } = req.query;

    const filter = {};

    if (role) filter.role = role;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(filter);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          users,
          currentPage: Number(page),
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
        },
        "Users fetched successfully",
      ),
    );
  } catch (error) {
    console.error("getAllUsers Controller Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// @desc    Get a single user by ID (admin)
// @route   GET /api/admin/users/:id
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password");

    if (!user) {
      throw new ApiError(404, "User not found!");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, user, "User fetched successfully"));
  } catch (error) {
    console.error("getUserById Controller Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// @desc    Delete a user (admin)
// @route   DELETE /api/admin/users/:id
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      throw new ApiError(404, "User not found!");
    }

    //prevent an admin don't delete his own account
    if (user._id.toString() === req.user._id.toString()) {
      throw new ApiError(400, "You cannot delete your own account from here");
    }

    //prevent to delete another admin account
    if (user.role === "admin") {
      throw new ApiError(403, "Cannot delete another admin account");
    }

    // If deleting an owner, decide policy on their restaurants.
    // Safer default: block deletion if they own restaurants with
    // upcoming confirmed bookings, same rule as deleteRestaurant.
    if (user.role === "owner") {
      const ownedRestaurants = await Restaurant.find({ owner: user._id });
      const restaurantIds = ownedRestaurants.map((r) => r._id);

      const upcomingBookings = await Booking.countDocuments({
        restaurant: { $in: restaurantIds },
        status: "confirmed",
        bookingDate: { $gte: new Date() },
      });

      if (upcomingBookings > 0) {
        throw new ApiError(
          400,
          `Cannot delete this owner — they have ${upcomingBookings} upcoming booking(s) across their restaurant(s)`,
        );
      }
    }

    await User.findByIdAndDelete(id);

    return res
      .status(200)
      .json(new ApiResponse(200, null, "User deleted successfully"));
  } catch (error) {
    console.error("deleteUser Controller Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// @desc    Ban / unban a user (admin) — soft alternative to deleting
// @route   PATCH /api/admin/users/:id/ban
export const toggleBanUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { banned } = req.body;

    if (typeof banned !== "boolean") {
      throw new ApiError(400, "Banned must be true or false");
    }

    const user = await User.findById(id);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (req.user._id.toString() === user._id.toString()) {
      throw new ApiError("400", "You cannot ban your own account");
    }

    if (user.role === "admin") {
      throw new ApiError(403, "Cannot ban another admin account");
    }

    user.isBanned = banned;
    await user.save();

    const safeUser = await User.findById(user._id).select("-password");

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          safeUser,
          `User ${banned ? "banned" : "unbanned"} successfully`,
        ),
      );
  } catch (error) {
    console.error("toggleBanUser Controller Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// @desc    Promote a user to admin
// @route   PATCH /api/admin/users/:id/promote
export const promoteToAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      throw new ApiError(404, "User not found!");
    }

    if (user.role === "admin") {
      throw new ApiError(400, "User is already an admin");
    }

    user.role = "admin";
    await user.save();

    const safeUser = await User.findById(user._id).select("-password");

    return res
      .status(200)
      .json(
        new ApiResponse(200, safeUser, "User promoted to admin successfully!"),
      );
  } catch (error) {
    console.error("promoteToAdmin Controller Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// @desc    Platform-wide statistics for admin dashboard
// @route   GET /api/admin/stats
export const getPlatformStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalOwners,
      totalCustomers,
      totalRestaurants,
      pendingRestaurants,
      approvedRestaurants,
      rejectedRestaurants,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "owner" }),
      User.countDocuments({ role: "user" }),
      Restaurant.countDocuments(),
      Restaurant.countDocuments({ status: "pending" }),
      Restaurant.countDocuments({ status: "approved" }),
      Restaurant.countDocuments({ status: "rejected" }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: "pending" }),
      Booking.countDocuments({ status: "confirmed" }),
      Booking.countDocuments({ status: "completed" }),
      Booking.countDocuments({ status: "cancelled" }),
    ]);

    // Bookings created in the last 7 days — simple growth signal
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentBookings = await Booking.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          users: {
            total: totalUsers,
            owners: totalOwners,
            customers: totalCustomers,
          },
          restaurants: {
            total: totalRestaurants,
            pending: pendingRestaurants,
            approved: approvedRestaurants,
            rejected: rejectedRestaurants,
          },
          bookings: {
            total: totalBookings,
            pending: pendingBookings,
            confirmed: confirmedBookings,
            completed: completedBookings,
            cancelled: cancelledBookings,
            last7Days: recentBookings,
          },
        },
        "Platform stats fetched successfully",
      ),
    );
  } catch (error) {
    console.error("getPlatformStats Controller Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
