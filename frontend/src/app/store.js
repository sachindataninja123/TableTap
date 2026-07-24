import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import restaurantReducer from "../features/restaurant/restaurantSlice";
import userReducer from "../features/user/userSlice";
import bookingReducer from "../features/booking/bookingSlice";
// import adminReducer from "../features/admin/adminSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    restaurant: restaurantReducer,
    booking: bookingReducer,
    // admin: adminReducer,
  },
});
