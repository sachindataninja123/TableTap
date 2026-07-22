import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "../pages/customer/Home";
import MyBookings from "../pages/customer/MyBookings";
import RestaurantDetail from "../pages/customer/RestaurantDetail";
import RestaurantList from "../pages/customer/RestaurantList";

const AppRoutes = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mybookings" element={<MyBookings />} />
        <Route path="/restaurant-details" element={<RestaurantDetail />} />
        <Route path="/restaurant-list" element={<RestaurantList />} />
      </Routes>
    </>
  );
};

export default AppRoutes;
