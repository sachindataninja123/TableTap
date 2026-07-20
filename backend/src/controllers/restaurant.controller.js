import Restaurant from "../models/restaurant.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const getRestaurants = async (req, res) => {
  try {
    const {
      search,
      location,
      cuisine,
      priceRange,
      rating,
      sort,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    // Search by restaurant name
    if (search) {
      filter.name = {
        $regex: search,
        $options: "i",
      };
    }

    // Filter by cuisine
    if (cuisine) {
      filter.cuisine = {
        $regex: cuisine,
        $options: "i",
      };
    }

    // Filter by location
    if (location) {
      filter.location = {
        $regex: location,
        $options: "i",
      };
    }

    // Filter by price range
    if (priceRange) {
      filter.priceRange = priceRange;
    }

    // Minimum rating
    if (rating) {
      filter.rating = {
        $gte: Number(rating),
      };
    }

    // Show only approved restaurants
    filter.status = "approved";

    // Sorting
    let sortOption = {};

    switch (sort) {
      case "rating":
        sortOption = { rating: -1 };
        break;

      case "newest":
        sortOption = { createdAt: -1 };
        break;

      case "oldest":
        sortOption = { createdAt: 1 };
        break;

      case "name":
        sortOption = { name: 1 };
        break;

      default:
        sortOption = { createdAt: -1 };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const restaurants = await Restaurant.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit))
      .populate("owner", "name email");

    const totalRestaurants = await Restaurant.countDocuments(filter);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          restaurants,
          currentPage: Number(page),
          totalPages: Math.ceil(totalRestaurants / limit),
          totalRestaurants,
        },
        "Restaurants fetched successfully",
      ),
    );
  } catch (error) {
    console.error("Get Restaurant Controller Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const getFeaturedRestaurants = async (req, res) => {
  try {
    const featured = await Restaurant.find({
      status: "approved",
      $or: [{ featured: true }, { exclusive: true }],
    }).limit(6);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          featured,
          "featured restaurants fetched successfully!",
        ),
      );
  } catch (error) {
    console.error("getFeaturedRestaurants Controller Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const getRestaurantBySlug = async (req, res) => {
  try {
  } catch (error) {
    console.error("getRestaurantBySlug Controller Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const getRestaurantAvailability = async (req, res) => {
  try {
  } catch (error) {
    console.error("getRestaurantAvailability Controller Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
