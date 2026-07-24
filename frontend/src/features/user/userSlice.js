import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import toast from "react-hot-toast";

// ====== THUNKS ======

export const updateProfile = createAsyncThunk(
  "user/updateProfile",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.patch("/users/update-profile", formData);
      return res.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to update profile";
      return rejectWithValue(message);
    }
  },
);

export const changePassword = createAsyncThunk(
  "user/changePassword",
  async (passwords, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.patch(
        "/users/change-password",
        passwords,
      );
      return res.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to change password";
      return rejectWithValue(message);
    }
  },
);

export const updateAvatar = createAsyncThunk(
  "user/updateAvatar",
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await axiosInstance.patch("/users/update-avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to upload avatar";
      return rejectWithValue(message);
    }
  },
);

export const deleteAccount = createAsyncThunk(
  "user/deleteAccount",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.delete("/users/delete-account");
      return res.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to delete account";
      return rejectWithValue(message);
    }
  },
);

// ==========================================
// SLICE
// ==========================================

const initialState = {
  loading: false,
  avatarLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ===== UPDATE PROFILE =====
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        toast.success(
          action.payload?.message || "Profile updated successfully!",
        );
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // ===== CHANGE PASSWORD =====
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.loading = false;
        toast.success(
          action.payload?.message || "Password changed successfully!",
        );
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // ===== UPDATE AVATAR =====
      .addCase(updateAvatar.pending, (state) => {
        state.avatarLoading = true;
        state.error = null;
      })
      .addCase(updateAvatar.fulfilled, (state, action) => {
        state.avatarLoading = false;
        toast.success(
          action.payload?.message || "Avatar updated successfully!",
        );
      })
      .addCase(updateAvatar.rejected, (state, action) => {
        state.avatarLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // ===== DELETE ACCOUNT =====
      .addCase(deleteAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAccount.fulfilled, (state, action) => {
        state.loading = false;
        toast.success(
          action.payload?.message || "Account deleted successfully",
        );
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });
  },
});

export const { clearUserError } = userSlice.actions;
export default userSlice.reducer;
