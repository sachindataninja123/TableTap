import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken"
import User from "../models/user.model.js"

export const isAuth = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new ApiError(401, "Token is required");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      throw new ApiError(401, "User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("isAuth Middleware Error:", error);

    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    throw new ApiError(403, "Access Denied, admin role only!");
  }
};

export const ownerOnly = (req, res, next) => {
  if ((req.user && req.user.role === "admin") || req.user.role === "owner") {
    next();
  } else {
    throw new ApiError(403, "Access Denied, admin or owner role only!");
  }
};
