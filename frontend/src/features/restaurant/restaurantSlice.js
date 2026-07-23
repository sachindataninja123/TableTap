import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import toast from "react-hot-toast";

// ===== PUBLIC/CUSTOMER THUNKS ======

export const fetchRestaurants = createAsyncThunk(
  "restaurant/fetchRestaurants",
  async (queryParams = {}, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/restaurants", {
        params: queryParams,
      });

      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch restaurants",
      );
    }
  },
);

export const fetchFeaturedRestaurants = createAsyncThunk(
  "restaurant/fetchFeaturedRestaurants",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/restaurants/featured");

      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch featured restaurants",
      );
    }
  },
);

export const fetchRestaurantBySlug = createAsyncThunk(
  "restaurant/fetchRestaurantBySlug",
  async (slug, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/restaurants/${slug}`);

      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Restaurant not found",
      );
    }
  },
);

export const fetchRestaurantAvailability = createAsyncThunk(
  "restaurant/fetchRestaurantAvailability",
  async ({ id, date }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/restaurants/${id}/availability`, {
        params: { date },
      });

      return res.data;

      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch availability",
      );
    }
  },
);

// ====== OWNER THUNKS =======

export const createRestaurant = createAsyncThunk(
  "restaurant/createRestaurant",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/restaurants/create", formData);

      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create restaurant",
      );
    }
  },
);

export const updateRestaurant = createAsyncThunk(
  "restaurant/updateRestaurant",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.patch(`/restaurants/${id}`, formData);

      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update restaurant",
      );
    }
  },
);

export const deleteRestaurant = createAsyncThunk(
  "restaurant/deleteRestaurant",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.delete(`/restaurants/${id}`);

      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to set delete restaurant",
      );
    }
  },
);

export const fetchMyRestaurants = createAsyncThunk(
  "restaurant/fetchMyRestaurants",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/restaurants/my-restaurants");

      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get my restaurant",
      );
    }
  },
);

export const uploadRestaurantImage = createAsyncThunk(
  "restaurant/uploadRestaurantImage",
  async ({ id, file }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await axiosInstance.patch(
        `/restaurants/${id}/image`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to upload image",
      );
    }
  },
);

export const setOpeningHours = createAsyncThunk(
  "restaurant/setOpeningHours",
  async ({ id, hoursData }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.patch(
        `/restaurants/${id}/hours`,
        hoursData,
      );

      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update opening hours",
      );
    }
  },
);

// ====== ADMIN THUNKS =======

export const fetchAllRestaurantsAdmin = createAsyncThunk(
  "restaurant/fetchAllRestaurantsAdmin",
  async (queryParams = {}, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/restaurants/admin/all", {
        params: queryParams,
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch restaurants",
      );
    }
  },
);

export const approveRestaurant = createAsyncThunk(
  "restaurant/approveRestaurant",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.patch(`/restaurants/${id}/approve`);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to approve restaurant",
      );
    }
  },
);

export const rejectRestaurant = createAsyncThunk(
  "restaurant/rejectRestaurant",
  async ({ id, rejectionReason }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.patch(`/restaurants/${id}/reject`, {
        rejectionReason,
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to reject restaurant",
      );
    }
  },
);

export const toggleFeaturedStatus = createAsyncThunk(
  "restaurant/toggleFeaturedStatus",
  async ({ id, featured }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.patch(`/restaurants/${id}/featured`, {
        featured,
      });
      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update featured status",
      );
    }
  },
);

export const toggleExclusiveStatus = createAsyncThunk(
  "restaurant/toggleExclusiveStatus",
  async ({ id, exclusive }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.patch(`/restaurants/${id}/exclusive`, {
        exclusive,
      });
      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update exclusive status",
      );
    }
  },
);

// ===== SLICE ======

const initialState = {
  // public
  restaurants: [],
  currentPage: 1,
  totalPages: 1,
  totalRestaurants: 0,
  fetchLoading: false,

  featured: [],
  featuredLoading: false,

  currentRestaurant: null,
  detailLoading: false,

  availability: null,
  availabilityLoading: false,

  // owner
  myRestaurants: [],
  myRestaurantsLoading: false,
  actionLoading: false,

  // admin
  adminRestaurants: [],
  adminCurrentPage: 1,
  adminTotalPages: 1,
  adminLoading: false,
  adminActionLoading: false,

  error: null,
};

const restaurantSlice = createSlice({
  name: "restaurant",
  initialState,
  reducers: {
    clearRestaurantError: (state) => {
      state.error = null;
    },
    clearCurrentRestaurant: (state) => {
      state.currentRestaurant = null;
      state.availability = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ---- fetchRestaurants ----
      .addCase(fetchRestaurants.pending, (state) => {
        state.fetchLoading = true;
        state.error = null;
      })
      .addCase(fetchRestaurants.fulfilled, (state, action) => {
        state.fetchLoading = false;
        state.restaurants = action.payload.restaurants;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
        state.totalRestaurants = action.payload.totalRestaurants;
      })
      .addCase(fetchRestaurants.rejected, (state, action) => {
        state.fetchLoading = false;
        state.error = action.payload;
      })

      // ---- fetchFeaturedRestaurants ----
      .addCase(fetchFeaturedRestaurants.pending, (state) => {
        state.featuredLoading = true;
      })
      .addCase(fetchFeaturedRestaurants.fulfilled, (state, action) => {
        state.featuredLoading = false;
        state.featured = action.payload;
      })
      .addCase(fetchFeaturedRestaurants.rejected, (state, action) => {
        state.featuredLoading = false;
        state.error = action.payload;
      })

      // ---- fetchRestaurantBySlug ----
      .addCase(fetchRestaurantBySlug.pending, (state) => {
        state.detailLoading = true;
        state.currentRestaurant = null;
      })
      .addCase(fetchRestaurantBySlug.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.currentRestaurant = action.payload;
      })
      .addCase(fetchRestaurantBySlug.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // ---- fetchRestaurantAvailability ----
      .addCase(fetchRestaurantAvailability.pending, (state) => {
        state.availabilityLoading = true;
      })
      .addCase(fetchRestaurantAvailability.fulfilled, (state, action) => {
        state.availabilityLoading = false;
        state.availability = action.payload;
      })
      .addCase(fetchRestaurantAvailability.rejected, (state, action) => {
        state.availabilityLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // ---- createRestaurant ----
      .addCase(createRestaurant.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(createRestaurant.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.myRestaurants.unshift(action.payload);
        toast.success("Restaurant submitted for approval");
      })
      .addCase(createRestaurant.rejected, (state, action) => {
        state.actionLoading = false;
        toast.error(action.payload);
      })

      // ---- updateRestaurant ----
      .addCase(updateRestaurant.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(updateRestaurant.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.myRestaurants.findIndex(
          (r) => r._id === action.payload._id,
        );
        if (index !== -1) state.myRestaurants[index] = action.payload;
        if (state.currentRestaurant?._id === action.payload._id) {
          state.currentRestaurant = action.payload;
        }
        toast.success("Restaurant updated");
      })
      .addCase(updateRestaurant.rejected, (state, action) => {
        state.actionLoading = false;
        toast.error(action.payload);
      })

      // ---- deleteRestaurant ----
      .addCase(deleteRestaurant.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(deleteRestaurant.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.myRestaurants = state.myRestaurants.filter(
          (r) => r._id !== action.payload,
        );
        toast.success("Restaurant deleted");
      })
      .addCase(deleteRestaurant.rejected, (state, action) => {
        state.actionLoading = false;
        toast.error(action.payload);
      })

      // ---- uploadRestaurantImage ----
      .addCase(uploadRestaurantImage.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(uploadRestaurantImage.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.myRestaurants.findIndex(
          (r) => r._id === action.payload._id,
        );
        if (index !== -1) state.myRestaurants[index] = action.payload;
        toast.success("Image updated");
      })
      .addCase(uploadRestaurantImage.rejected, (state, action) => {
        state.actionLoading = false;
        toast.error(action.payload);
      })

      // ---- setOpeningHours ----
      .addCase(setOpeningHours.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(setOpeningHours.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.myRestaurants.findIndex(
          (r) => r._id === action.payload._id,
        );
        if (index !== -1) state.myRestaurants[index] = action.payload;
        toast.success("Opening hours updated");
      })
      .addCase(setOpeningHours.rejected, (state, action) => {
        state.actionLoading = false;
        toast.error(action.payload);
      })

      // ---- fetchMyRestaurants ----
      .addCase(fetchMyRestaurants.pending, (state) => {
        state.myRestaurantsLoading = true;
      })
      .addCase(fetchMyRestaurants.fulfilled, (state, action) => {
        state.myRestaurantsLoading = false;
        state.myRestaurants = action.payload;
      })
      .addCase(fetchMyRestaurants.rejected, (state, action) => {
        state.myRestaurantsLoading = false;
        state.error = action.payload;
      })

      // ---- fetchAllRestaurantsAdmin ----
      .addCase(fetchAllRestaurantsAdmin.pending, (state) => {
        state.adminLoading = true;
      })
      .addCase(fetchAllRestaurantsAdmin.fulfilled, (state, action) => {
        state.adminLoading = false;
        state.adminRestaurants = action.payload.restaurants;
        state.adminCurrentPage = action.payload.currentPage;
        state.adminTotalPages = action.payload.totalPages;
      })
      .addCase(fetchAllRestaurantsAdmin.rejected, (state, action) => {
        state.adminLoading = false;
        state.error = action.payload;
      })

      // ---- approveRestaurant ----
      .addCase(approveRestaurant.pending, (state) => {
        state.adminActionLoading = true;
      })
      .addCase(approveRestaurant.fulfilled, (state, action) => {
        state.adminActionLoading = false;
        const index = state.adminRestaurants.findIndex(
          (r) => r._id === action.payload._id,
        );
        if (index !== -1) state.adminRestaurants[index] = action.payload;
        toast.success("Restaurant approved");
      })
      .addCase(approveRestaurant.rejected, (state, action) => {
        state.adminActionLoading = false;
        toast.error(action.payload);
      })

      // ---- rejectRestaurant ----
      .addCase(rejectRestaurant.pending, (state) => {
        state.adminActionLoading = true;
      })
      .addCase(rejectRestaurant.fulfilled, (state, action) => {
        state.adminActionLoading = false;
        const index = state.adminRestaurants.findIndex(
          (r) => r._id === action.payload._id,
        );
        if (index !== -1) state.adminRestaurants[index] = action.payload;
        toast.success("Restaurant rejected");
      })
      .addCase(rejectRestaurant.rejected, (state, action) => {
        state.adminActionLoading = false;
        toast.error(action.payload);
      })

      // ---- toggleFeaturedStatus ----
      .addCase(toggleFeaturedStatus.pending, (state) => {
        state.adminActionLoading = true;
      })
      .addCase(toggleFeaturedStatus.fulfilled, (state, action) => {
        state.adminActionLoading = false;
        const index = state.adminRestaurants.findIndex(
          (r) => r._id === action.payload._id,
        );
        if (index !== -1) state.adminRestaurants[index] = action.payload;
        toast.success(
          action.payload.featured
            ? "Marked as featured"
            : "Removed from featured",
        );
      })
      .addCase(toggleFeaturedStatus.rejected, (state, action) => {
        state.adminActionLoading = false;
        toast.error(action.payload);
      })

      // ---- toggleExclusiveStatus ----
      .addCase(toggleExclusiveStatus.pending, (state) => {
        state.adminActionLoading = true;
      })
      .addCase(toggleExclusiveStatus.fulfilled, (state, action) => {
        state.adminActionLoading = false;
        const index = state.adminRestaurants.findIndex(
          (r) => r._id === action.payload._id,
        );
        if (index !== -1) state.adminRestaurants[index] = action.payload;
        toast.success(
          action.payload.exclusive
            ? "Marked as exclusive"
            : "Removed from exclusive",
        );
      })
      .addCase(toggleExclusiveStatus.rejected, (state, action) => {
        state.adminActionLoading = false;
        toast.error(action.payload);
      });
  },
});

export const { clearRestaurantError, clearCurrentRestaurant } =
  restaurantSlice.actions;
export default restaurantSlice.reducer;
