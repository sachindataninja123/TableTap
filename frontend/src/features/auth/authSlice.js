import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import toast from "react-hot-toast";

// ===== THUNKS =====

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/auth/register", formData);

      return res.data;
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      return rejectWithValue(message);
    }
  },
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/auth/login", formData);

      return res.data;
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      return rejectWithValue(message);
    }
  },
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.post("/auth/logout");
      return true;
    } catch (error) {
      const message = error.response?.data?.message || "Logout failed";
      return rejectWithValue(message);
    }
  },
);

export const getMe = createAsyncThunk(
  "auth/getMe",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/auth/get-me");
      return res.data;
    } catch (error) {
      const message = error.response?.data?.message || "Not authenticated";
      return rejectWithValue(message);
    }
  },
);

// ===== SLICE ======

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  checkingSession: false,
  error: null,
  authChecked: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      //registerUser
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        toast.success("Registration successful! Please login.");
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      //login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        ((state.isAuthenticated = true),
          toast.success("Logged in successfully"));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      //logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        toast.success("Logged out successfully");
      })
      .addCase(logoutUser.rejected, (state, action) => {
        toast.error(action.payload);
      })

      //get current user
      .addCase(getMe.pending, (state) => {
        state.checkingSession = true;
      })
      .addCase(getMe.fulfilled, (state) => {
        ((state.loading = false), (state.user = null));
        state.checkingSession = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.authChecked = true;
      })
      .addCase(getMe.rejected, (state) => {
        state.checkingSession = false;
        state.user = null;
        state.isAuthenticated = false;
        state.authChecked = true;
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
