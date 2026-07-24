import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import toast from "react-hot-toast";

// ========== CUSTOMER THUNKS ==========

export const createBooking = createAsyncThunk(
  "booking/createBooking",
  async (bookingData, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/bookings/create", bookingData);
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create booking");
    }
  }
);

export const fetchMyBookings = createAsyncThunk(
  "booking/fetchMyBookings",
  async (queryParams = {}, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/bookings/my-bookings", { params: queryParams });
      return res.data.data; 
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch bookings");
    }
  }
);

export const cancelBooking = createAsyncThunk(
  "booking/cancelBooking",
  async ({ id, cancellationReason }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.patch(`/bookings/${id}/cancel`, { cancellationReason });
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to cancel booking");
    }
  }
);

export const fetchBookingById = createAsyncThunk(
  "booking/fetchBookingById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/bookings/${id}`);
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Booking not found");
    }
  }
);

// ========== OWNER THUNKS ==========

export const fetchRestaurantBookings = createAsyncThunk(
  "booking/fetchRestaurantBookings",
  async ({ restaurantId, queryParams = {} }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/bookings/restaurant/${restaurantId}`, {
        params: queryParams,
      });
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch bookings");
    }
  }
);

export const approveBooking = createAsyncThunk(
  "booking/approveBooking",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.patch(`/bookings/${id}/approve`);
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to approve booking");
    }
  }
);

export const rejectBooking = createAsyncThunk(
  "booking/rejectBooking",
  async ({ id, rejectionReason }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.patch(`/bookings/${id}/reject`, { rejectionReason });
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to reject booking");
    }
  }
);

export const updateBookingStatus = createAsyncThunk(
  "booking/updateBookingStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.patch(`/bookings/${id}/status`, { status });
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update booking status");
    }
  }
);

// ========== SLICE ==========

const initialState = {
  // customer
  myBookings: [],
  myBookingsCurrentPage: 1,
  myBookingsTotalPages: 1,
  myBookingsLoading: false,

  createLoading: false,

  currentBooking: null,
  bookingDetailLoading: false,

  cancelLoading: false,

  // owner
  restaurantBookings: [],
  restaurantBookingsCurrentPage: 1,
  restaurantBookingsTotalPages: 1,
  restaurantBookingsLoading: false,

  ownerActionLoading: false, 

  error: null,
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    clearBookingError: (state) => {
      state.error = null;
    },
    clearCurrentBooking: (state) => {
      state.currentBooking = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ---- createBooking ----
      .addCase(createBooking.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.createLoading = false;
        state.myBookings.unshift(action.payload);
        toast.success("Booking request sent — waiting for the restaurant to confirm");
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // ---- fetchMyBookings ----
      .addCase(fetchMyBookings.pending, (state) => {
        state.myBookingsLoading = true;
      })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.myBookingsLoading = false;
        state.myBookings = action.payload.bookings;
        state.myBookingsCurrentPage = action.payload.currentPage;
        state.myBookingsTotalPages = action.payload.totalPages;
      })
      .addCase(fetchMyBookings.rejected, (state, action) => {
        state.myBookingsLoading = false;
        state.error = action.payload;
      })

      // ---- cancelBooking ----
      .addCase(cancelBooking.pending, (state) => {
        state.cancelLoading = true;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.cancelLoading = false;
        const index = state.myBookings.findIndex((b) => b._id === action.payload._id);
        if (index !== -1) state.myBookings[index] = action.payload;
        toast.success("Booking cancelled");
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.cancelLoading = false;
        toast.error(action.payload);
      })

      // ---- fetchBookingById ----
      .addCase(fetchBookingById.pending, (state) => {
        state.bookingDetailLoading = true;
      })
      .addCase(fetchBookingById.fulfilled, (state, action) => {
        state.bookingDetailLoading = false;
        state.currentBooking = action.payload;
      })
      .addCase(fetchBookingById.rejected, (state, action) => {
        state.bookingDetailLoading = false;
        state.error = action.payload;
      })

      // ---- fetchRestaurantBookings ----
      .addCase(fetchRestaurantBookings.pending, (state) => {
        state.restaurantBookingsLoading = true;
      })
      .addCase(fetchRestaurantBookings.fulfilled, (state, action) => {
        state.restaurantBookingsLoading = false;
        state.restaurantBookings = action.payload.bookings;
        state.restaurantBookingsCurrentPage = action.payload.currentPage;
        state.restaurantBookingsTotalPages = action.payload.totalPages;
      })
      .addCase(fetchRestaurantBookings.rejected, (state, action) => {
        state.restaurantBookingsLoading = false;
        state.error = action.payload;
      })

      // ---- approveBooking ----
      .addCase(approveBooking.pending, (state) => {
        state.ownerActionLoading = true;
      })
      .addCase(approveBooking.fulfilled, (state, action) => {
        state.ownerActionLoading = false;
        const index = state.restaurantBookings.findIndex((b) => b._id === action.payload._id);
        if (index !== -1) state.restaurantBookings[index] = action.payload;
        toast.success("Booking approved");
      })
      .addCase(approveBooking.rejected, (state, action) => {
        state.ownerActionLoading = false;
        toast.error(action.payload);
      })

      // ---- rejectBooking ----
      .addCase(rejectBooking.pending, (state) => {
        state.ownerActionLoading = true;
      })
      .addCase(rejectBooking.fulfilled, (state, action) => {
        state.ownerActionLoading = false;
        const index = state.restaurantBookings.findIndex((b) => b._id === action.payload._id);
        if (index !== -1) state.restaurantBookings[index] = action.payload;
        toast.success("Booking rejected");
      })
      .addCase(rejectBooking.rejected, (state, action) => {
        state.ownerActionLoading = false;
        toast.error(action.payload);
      })

      // ---- updateBookingStatus (mark completed / cancel from owner side) ----
      .addCase(updateBookingStatus.pending, (state) => {
        state.ownerActionLoading = true;
      })
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        state.ownerActionLoading = false;
        const index = state.restaurantBookings.findIndex((b) => b._id === action.payload._id);
        if (index !== -1) state.restaurantBookings[index] = action.payload;
        toast.success("Booking updated");
      })
      .addCase(updateBookingStatus.rejected, (state, action) => {
        state.ownerActionLoading = false;
        toast.error(action.payload);
      });
  },
});

export const { clearBookingError, clearCurrentBooking } = bookingSlice.actions;
export default bookingSlice.reducer;