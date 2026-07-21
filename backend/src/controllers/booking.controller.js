import Booking from "../models/booking.model.js";
import Restaurant from "../models/restaurant.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { expireStaleBookings } from "../utils/expireStaleBookings.js";

// Shared helper: checks if a restaurant has enough free seats
// for a given date/time/guest count. Reused by createBooking.
const checkSlotAvailability = async (
  restaurantId,
  bookingDate,
  bookingTime,
  guests,
) => {
  await expireStaleBookings({ restaurant: restaurantId });

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
    status: { $in: ["pending", "confirmed"] },
  });

  const bookedSeats = existingBookings.reduce((sum, b) => sum + b.guests, 0);
  const availableSeats = restaurant.totalSeats - bookedSeats;

  console.log("Restaurant totalSeats:", restaurant.totalSeats);
  console.log("Guests requested:", guests);
  console.log("Already booked:", bookedSeats);
  console.log("Available seats:", availableSeats);
  console.log("Guests type:", typeof guests);

  if (guests > availableSeats) {
    throw new ApiError(
      400,
      `Only ${Math.max(availableSeats, 0)} seats available for this slot`,
    );
  }

  return restaurant;
};

// @desc    Create a new booking
// @route   POST /api/bookings
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
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 min
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

// @desc    Get logged-in user's bookings
// @route   GET /api/bookings/my-bookings
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

// @desc    Get a single booking by ID
// @route   GET /api/bookings/:id
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

// @desc    Cancel a booking (customer)
// @route   PATCH /api/bookings/:id/cancel
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

// @desc    Get all bookings for restaurant(s) owned by logged-in owner
// @route   GET /api/bookings/restaurant/:restaurantId
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

// @desc    Owner approves a pending booking request
// @route   PATCH /api/bookings/:id/approve
export const approveBooking = async (req, res) => {
  try {
    const { id } = req.params;

    await expireStaleBookings({ restaurant: id });

    const booking = await Booking.findById(id).populate(
      "restaurant",
      "owner totalSeats",
    );

    if (!booking) {
      throw new ApiError(404, "Booking not found");
    }

    const isOwner =
      booking.restaurant.owner.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      throw new ApiError(403, "Access denied");
    }

    if (booking.status !== "pending") {
      throw new ApiError(
        400,
        `Cannot approve a booking with status "${booking.status}"`,
      );
    }

    // Re-validate seats are still available at approval time —
    // protects against the case where OTHER pending requests for the
    // same slot got approved first and seats are now gone
    const startDate = new Date(booking.bookingDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(booking.bookingDate);
    endDate.setHours(23, 59, 59, 999);

    const confirmedBookings = await Booking.find({
      _id: { $ne: booking._id },
      restaurant: booking.restaurant._id,
      bookingDate: { $gte: startDate, $lte: endDate },
      bookingTime: booking.bookingTime,
      status: "confirmed",
    });

    const bookedSeats = confirmedBookings.reduce((sum, b) => sum + b.guests, 0);
    const availableSeats = booking.restaurant.totalSeats - bookedSeats;

    if (booking.guests > availableSeats) {
      throw new ApiError(
        400,
        `Cannot approve — only ${Math.max(availableSeats, 0)} seat(s) left for this slot`,
      );
    }

    booking.status = "confirmed";
    await booking.save();

    return res
      .status(200)
      .json(new ApiResponse(200, booking, "Booking approved successfully"));
  } catch (error) {
    console.error("approveBooking Controller Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// @desc    Owner rejects a pending booking request
// @route   PATCH /api/bookings/:id/reject
export const rejectBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    const booking = await Booking.findById(id).populate("restaurant", "owner");

    if (!booking) {
      throw new ApiError(404, "Booking not found");
    }

    const isOwner =
      booking.restaurant.owner.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      throw new ApiError(403, "Access denied");
    }

    if (booking.status !== "pending") {
      throw new ApiError(
        400,
        `Cannot reject a booking with status "${booking.status}"`,
      );
    }

    booking.status = "cancelled";
    booking.cancelledAt = new Date();
    booking.cancellationReason = rejectionReason || "Rejected by restaurant";

    await booking.save();

    return res
      .status(200)
      .json(new ApiResponse(200, booking, "Booking rejected"));
  } catch (error) {
    console.error("rejectBooking Controller Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// @desc    Update booking status — for marking completed only
// @route   PATCH /api/bookings/:id/status
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // "confirmed" intentionally excluded — must go through approveBooking
    // so the seat-availability re-check always runs
    const allowedStatuses = ["completed", "cancelled"];
    if (!status || !allowedStatuses.includes(status)) {
      throw new ApiError(
        400,
        `Please provide a valid status. To confirm a pending booking, use the approve endpoint instead.`,
      );
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

    // Only a confirmed booking can be marked completed —
    // doesn't make sense to "complete" something still pending
    if (status === "completed" && booking.status !== "confirmed") {
      throw new ApiError(
        400,
        "Only confirmed bookings can be marked as completed",
      );
    }

    if (booking.status === "cancelled" || booking.status === "completed") {
      throw new ApiError(
        400,
        `Booking is already ${booking.status}, cannot update further`,
      );
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
