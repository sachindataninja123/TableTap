import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
// import restaurantReducer from "../features/restaurant/restaurantSlice";
// import bookingReducer from "../features/booking/bookingSlice";
// import adminReducer from "../features/admin/adminSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // restaurant: restaurantReducer,
    // booking: bookingReducer,
    // admin: adminReducer,
  },
});