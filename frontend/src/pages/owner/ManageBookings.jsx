// src/pages/owner/ManageBookings.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiCheck, FiX, FiCalendar, FiClock, FiUsers } from "react-icons/fi";
import { fetchMyRestaurants } from "../../features/restaurant/restaurantSlice";
import {
  fetchRestaurantBookings,
  approveBooking,
  rejectBooking,
  updateBookingStatus,
} from "../../features/booking/bookingSlice";

const statusColors = {
  pending: "bg-[#B8863B]/15 text-[#B8863B]",
  confirmed: "bg-[#3F6B4F]/15 text-[#3F6B4F]",
  completed: "bg-[#5C5C54]/15 text-[#5C5C54]",
  cancelled: "bg-[#A63D2F]/15 text-[#A63D2F]",
};

const ManageBookings = () => {
  const dispatch = useDispatch();
  const { myRestaurants } = useSelector((state) => state.restaurant);
  const { restaurantBookings, restaurantBookingsLoading, ownerActionLoading } = useSelector(
    (state) => state.booking
  );
  const [statusFilter, setStatusFilter] = useState("pending");

  const restaurant = myRestaurants?.[0];

  useEffect(() => {
    dispatch(fetchMyRestaurants());
  }, [dispatch]);

  useEffect(() => {
    if (restaurant?._id) {
      dispatch(
        fetchRestaurantBookings({
          restaurantId: restaurant._id,
          queryParams: statusFilter ? { status: statusFilter } : {},
        })
      );
    }
  }, [dispatch, restaurant?._id, statusFilter]);

  const handleReject = (id) => {
    const reason = window.prompt("Reason for declining (optional):");
    dispatch(rejectBooking({ id, rejectionReason: reason || "" }));
  };

  const handleMarkCompleted = (id) => {
    dispatch(updateBookingStatus({ id, status: "completed" }));
  };

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF6] px-5">
        <p className="text-[#5C5C54] text-[15px]" style={{ fontFamily: "'Inter', sans-serif" }}>
          You need to list a restaurant before you can manage bookings.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#FDFBF6] min-h-screen" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-4xl mx-auto px-5 py-12">
        <h1
          className="text-[32px] text-[#16281F] mb-1"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          Bookings
        </h1>
        <p className="text-[14px] text-[#5C5C54] mb-8">{restaurant.name}</p>

        <div className="flex gap-2 mb-8">
          {["pending", "confirmed", "completed", "cancelled"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-[12px] px-3.5 py-1.5 rounded-full font-medium capitalize transition-colors ${
                statusFilter === s
                  ? "bg-[#16281F] text-[#FDFBF6]"
                  : "text-[#5C5C54] hover:bg-[#E7E2D6]/50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {restaurantBookingsLoading ? (
          <p className="text-center text-[#B0AA9C] py-16">Loading...</p>
        ) : restaurantBookings.length === 0 ? (
          <p className="text-center text-[#B0AA9C] py-16">
            No {statusFilter} bookings right now
          </p>
        ) : (
          <div className="space-y-4">
            {restaurantBookings.map((booking) => (
              <div key={booking._id} className="bg-white border border-[#E7E2D6] rounded-xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-[16px] text-[#16281F] font-medium">
                      {booking.user?.name}
                    </h3>
                    <p className="text-[13px] text-[#B0AA9C]">
                      {booking.contactPhone} · {booking.contactEmail}
                    </p>
                  </div>
                  <span
                    className={`text-[11px] font-medium px-2.5 py-1 rounded-full capitalize shrink-0 ${statusColors[booking.status]}`}
                  >
                    {booking.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-[13px] text-[#5C5C54] mb-3">
                  <span className="flex items-center gap-1.5">
                    <FiCalendar className="text-[#B8863B]" />
                    {new Date(booking.bookingDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FiClock className="text-[#B8863B]" /> {booking.bookingTime}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FiUsers className="text-[#B8863B]" /> {booking.guests}
                  </span>
                </div>

                {booking.occasion && (
                  <p className="text-[13px] text-[#5C5C54] mb-1">
                    <span className="text-[#B0AA9C]">Occasion:</span> {booking.occasion}
                  </p>
                )}
                {booking.specialRequests && (
                  <p className="text-[13px] text-[#5C5C54] mb-3">
                    <span className="text-[#B0AA9C]">Request:</span> {booking.specialRequests}
                  </p>
                )}

                {booking.status === "pending" && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => dispatch(approveBooking(booking._id))}
                      disabled={ownerActionLoading}
                      className="flex items-center gap-1.5 text-[13px] font-medium px-4 py-2 rounded-full bg-[#3F6B4F]/15 text-[#3F6B4F] hover:bg-[#3F6B4F] hover:text-white transition-colors disabled:opacity-50"
                    >
                      <FiCheck /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(booking._id)}
                      disabled={ownerActionLoading}
                      className="flex items-center gap-1.5 text-[13px] font-medium px-4 py-2 rounded-full bg-[#A63D2F]/15 text-[#A63D2F] hover:bg-[#A63D2F] hover:text-white transition-colors disabled:opacity-50"
                    >
                      <FiX /> Decline
                    </button>
                  </div>
                )}

                {booking.status === "confirmed" && (
                  <button
                    onClick={() => handleMarkCompleted(booking._id)}
                    disabled={ownerActionLoading}
                    className="mt-3 text-[13px] font-medium px-4 py-2 rounded-full border border-[#E7E2D6] text-[#16281F] hover:bg-[#E7E2D6]/30 transition-colors disabled:opacity-50"
                  >
                    Mark completed
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageBookings;