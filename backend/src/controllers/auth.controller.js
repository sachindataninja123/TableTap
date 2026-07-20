import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateToken } from "../utils/generateToken.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password || !phone) {
      throw new ApiError(400, "Pleae enter all required fields!");
    }

    const isUser = await User.findOne({ email });
    if (isUser) {
      throw new ApiError(404, "User already exists!");
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role,
    });

    const safeUser = await User.findById(user._id).select("-password");

    return res
      .status(200)
      .json(new ApiResponse(201, safeUser, "User registered successfully!"));
  } catch (error) {
    console.error("register Controller Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, "Pleae enter all required fields!");
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(400, "User does'nt exist!");
    }

    const isValidUser = await user.comparePassword(password);
    if (!isValidUser) {
      throw new ApiError(400, "Invalid credientials!");
    }

    const token = await generateToken(user);

    const safeUser = await User.findById(user._id).select("-password");

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true in production
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    return res
      .status(200)
      .cookie("token", token, cookieOptions)
      .json(
        new ApiResponse(
          200,
            safeUser,
          "user login successfully",
        ),
      );
  } catch (error) {
    console.error("login Controller Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const getMe = async (req, res) => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Not authorized");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, req.user, "User fetched successfully!"));
  } catch (error) {
    console.error("getMe Controller Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const logOutUser = async (req, res) => {
  try {
    return res
      .clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      })
      .status(200)
      .json(new ApiResponse(200, null, "User logged out successfully"));
      
  } catch (error) {
    console.error("logout Controller Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
