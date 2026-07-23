import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/common/ProtectedRoute";

// Auth pages
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

// Customer pages
import Home from "../pages/customer/Home";
import RestaurantList from "../pages/customer/RestaurantList";
import RestaurantDetail from "../pages/customer/RestaurantDetail";
import MyBookings from "../pages/customer/MyBookings";
import Profile from "../pages/customer/Profile";

// Owner pages
import OwnerDashboard from "../pages/owner/OwnerDashboard";
import ManageBookings from "../pages/owner/ManageBookings";
import MyRestaurant from "../pages/owner/MyRestaurant";

// Admin pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import ManageRestaurants from "../pages/admin/ManageRestaurants";
import ManageUsers from "../pages/admin/ManageUsers";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/restaurants" element={<RestaurantList />} />
      <Route path="/restaurants/:slug" element={<RestaurantDetail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Customer only */}
      <Route
        path="/my-bookings"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <MyBookings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Owner only */}
      <Route
        path="/owner/dashboard"
        element={
          <ProtectedRoute allowedRoles={["owner"]}>
            <OwnerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/restaurant"
        element={
          <ProtectedRoute allowedRoles={["owner"]}>
            <MyRestaurant />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/bookings"
        element={
          <ProtectedRoute allowedRoles={["owner"]}>
            <ManageBookings />
          </ProtectedRoute>
        }
      />

      {/* Admin only */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/restaurants"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <ManageRestaurants />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <ManageUsers />
          </ProtectedRoute>
        }
      />

      {/* 404 fallback */}
      <Route path="*" element={<div className="p-10 text-center">Page not found</div>} />
    </Routes>
  );
};

export default AppRoutes;