import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import restaurantReducer from "../features/restaurant/restaurantSlice";
import userReducer from "../features/user/userSlice";
import bookingReducer from "../features/booking/bookingSlice";

const appReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  restaurant: restaurantReducer,
  booking: bookingReducer,
});

const rootReducer = (state, action) => {
  if (
    action.type === "auth/logoutUser/fulfilled" ||
    action.type === "auth/loginUser/pending"
  ) {
    state = undefined;
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
});
