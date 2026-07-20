import Booking from "../models/booking.model.js";
import Restaurant from "../models/restaurant.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const checkSlotAvailability = async (
  restaurantId,
  bookingDate,
  bookingTime,
  guests,
) => {
  const restaurant = await Restaurant.findById(restaurantId);

  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found!");
  }

  if (restaurant.status !== "approved") {
    throw new ApiError(400, "Restaurant is not accepting bookings");
  }

  if (!restaurant.availableSlots.includes(bookingTime)) {
    throw new ApiError(400, "Selected time slot is not available");
  }

  const startDate = new Date(bookingDate);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(bookingDate);
  endDate.setHours(23, 59, 59, 999);

  const existingBookings = await Booking.find({
    restaurant: restaurantId,
    bookingDate: { $gte: startDate, $lte: endDate },
    bookingTime,
    status: "confirmed",
  });

  const bookedSeats = existingBookings.reduce((sum, b) => sum + b.guests, 0);
  const availableSeats = restaurant.totalSeats - bookedSeats;

  if (guests > availableSeats) {
    throw new ApiError(
      400,
      `Only ${Math.max(availableSeats, 0)} seats available for this slot`,
    );
  }

  return restaurant;
};

export const createBooking = async (req, res) => {
  try {
    const {
      restaurant,
      bookingDate,
      bookingTime,
      guests,
      occasion,
      specialRequests,
      contactName,
      contactEmail,
      contactPhone,
    } = req.body;

    if (
      !restaurant ||
      !bookingDate ||
      !bookingTime ||
      !guests ||
      !contactName
    ) {
      throw new ApiError(400, "Please provide all required booking details");
    }

    // Prevent booking in the past
    const requestedDate = new Date(bookingDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (requestedDate < now) {
      throw new ApiError(400, "Cannot book a date in the past");
    }

    // Validate availability BEFORE creating — this is the check
    // that prevents overbooking
    await checkSlotAvailability(restaurant, bookingDate, bookingTime, guests);

    const booking = await Booking.create({
      user: req.user._id,
      restaurant,
      bookingDate: requestedDate,
      bookingTime,
      guests,
      occasion,
      specialRequests,
      contactName,
      contactPhone,
      contactEmail,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, booking, "Booking created successfully"));
  } catch (error) {
    console.error("Create Booking Controller Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const bookings = await Booking.find(filter)
      .populate("restaurant", "name slug image location")
      .sort({ bookingDate: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Booking.countDocuments(filter);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          bookings,
          currentPage: Number(page),
          totalPages: Math.ceil(total / limit),
          totalBookings: total,
        },
        "Bookings fetched successfully",
      ),
    );
  } catch (error) {
    console.error("getmyBookings Controller Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const getBookingsById = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate("restaurant", "name slug image location owner")
      .populate("user", "name email phone");

    if (!booking) {
      throw new ApiError(404, "Booking not found");
    }

    const isBookingOwner =
      booking.user._id.toString() === req.user._id.toString();
    const isRestaurantOwner =
      booking.restaurant.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isBookingOwner && !isRestaurantOwner && !isAdmin) {
      throw new ApiError(403, "Access denied");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, booking, "Booking fetched successfully"));
  } catch (error) {
    console.error("getBookingsById Controller Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;

    const booking = await Booking.findById(id);

    if (!booking) {
      throw new ApiError(404, "Booking not found");
    }

    const isBookingOwner = booking.user.toString() === req.user._id.toString();
    if (!isBookingOwner && req.user.role !== "admin") {
      throw new ApiError(403, "Access denied");
    }

    if (booking.status === "cancelled") {
      throw new ApiError(400, "Booking is already cancelled");
    }

    if (booking.status === "completed") {
      throw new ApiError(400, "Cannot cancel a completed booking");
    }

    booking.status = "cancelled";
    booking.cancelledAt = new Date();
    booking.cancellationReason = cancellationReason || "";

    await booking.save();

    return res
      .status(200)
      .json(new ApiResponse(200, booking, "Booking cancelled successfully"));
  } catch (error) {
    console.error("Cancel Booking Controller Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const getRestaurantBookings = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { status, date, page = 1, limit = 10 } = req.query;

    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      throw new ApiError(404, "Restaurant not found");
    }

    const isOwner = restaurant.owner.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      throw new ApiError(403, "Access denied");
    }

    const filter = { restaurant: restaurantId };
    if (status) filter.status = status;

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      filter.bookingDate = { $gte: startDate, $lte: endDate };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const bookings = await Booking.find(filter)
      .populate("user", "name email phone")
      .sort({ bookingDate: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Booking.countDocuments(filter);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          bookings,
          currentPage: Number(page),
          totalPages: Math.ceil(total / limit),
          totalBookings: total,
        },
        "Restaurant bookings fetched successfully",
      ),
    );
  } catch (error) {
    console.error("getRestaurantBookings Controller Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["confirmed", "completed", "cancelled"];
    if (!status || !allowedStatuses.includes(status)) {
      throw new ApiError(400, "Please provide a valid status");
    }

    const booking = await Booking.findById(id).populate("restaurant", "owner");

    if (!booking) {
      throw new ApiError(404, "Booking not found");
    }

    const isOwner =
      booking.restaurant.owner.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      throw new ApiError(403, "Access denied");
    }

    booking.status = status;

    if (status === "cancelled") {
      booking.cancelledAt = new Date();
    }

    await booking.save();

    return res
      .status(200)
      .json(
        new ApiResponse(200, booking, "Booking status updated successfully"),
      );
  } catch (error) {
    console.error("updateBookingStatus Controller Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
