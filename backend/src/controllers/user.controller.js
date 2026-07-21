import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import fs from "fs";

// @desc    Update a user profile
// @route   PATCH /api/users/update-profile
export const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name && !phone) {
      throw new ApiError(400, "Please provide at least one field to update");
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          name,
          phone,
        },
      },
      { new: true, runValidators: true },
    ).select("-password");

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, user, "Profile updated successfully"));
  } catch (error) {
    console.error("updateProfile Controller Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// @desc    Chnage Password of user
// @route   PATCH /api/users/change-password
export const changePassword = async (req, res) => {
  try {
    const { oldPass, newPass } = req.body;

    if (!oldPass || !newPass) {
      throw new ApiError(400, "Please provide old and new password");
    }

    if (newPass < 6) {
      throw new ApiError(400, "New password must be at least 6 characters");
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const isMatch = await user.comparePassword(oldPass);
    if (!isMatch) {
      throw new ApiError(400, "Old password is incorrect");
    }

    user.password = newPass;
    user.save();

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Password changed successfully"));
  } catch (error) {
    console.error("changePassword Controller Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// @desc    Update-image a user profile
// @route   PATCH /api/users/update-avatar
export const updateProfileImage = async (req, res) => {
  try {
    // console.log("req.file:", req.file);

    if (!req.file) {
      throw new ApiError(400, "Please upload an image");
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      fs.unlinkSync(req.file.path);
      throw new ApiError(404, "User not found");
    }

    if (user?.avatar?.public_id) {
      await deleteFromCloudinary(user.avatar.public_id);
    }

    const uploaded = await uploadOnCloudinary(req.file.path);

    if (!uploaded) {
      throw new ApiError(500, "Failed to upload image");
    }

    user.avatar = {
      url: uploaded.secure_url,
      public_id: uploaded.public_id,
    };

    await user.save();

    const safeUser = await User.findById(user._id).select("-password");

    return res
      .status(200)
      .json(
        new ApiResponse(200, safeUser, "Profile image updated successfully"),
      );
  } catch (error) {
    console.error("updateProfileImage Controller Error:", error);

    // ensure temp file is removed even on failure
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// @desc    Delete a user profile
// @route   Delete /api/users/delete-account
export const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (user?.avatar?.public_id) {
      await deleteFromCloudinary(user.avatar.public_id);
    }

    await User.findByIdAndDelete(req.user._id);

    return res
      .status(200)
      .clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      })
      .json(new ApiResponse(200, null, "Account deleted successfully"));
  } catch (error) {
    console.error("deleteAccount Controller Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
