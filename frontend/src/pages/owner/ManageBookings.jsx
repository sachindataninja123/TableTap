import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCheck,
  FiX,
  FiCalendar,
  FiClock,
  FiUsers,
  FiAlertTriangle,
  FiCheckCircle,
} from "react-icons/fi";
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
  const { myRestaurants, myRestaurantsLoading } = useSelector(
    (state) => state.restaurant
  );
  const { restaurantBookings, restaurantBookingsLoading, ownerActionLoading } =
    useSelector((state) => state.booking);

  const [selectedRestaurantId, setSelectedRestaurantId] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");

  // Modal States
  const [rejectingBooking, setRejectingBooking] = useState(null); // holds booking object
  const [rejectionReason, setRejectionReason] = useState("");

  const [completingBooking, setCompletingBooking] = useState(null); // holds booking object

  // Initial fetch of owned restaurants
  useEffect(() => {
    dispatch(fetchMyRestaurants());
  }, [dispatch]);

  // Set default selected restaurant when list loads
  useEffect(() => {
    if (myRestaurants && myRestaurants.length > 0 && !selectedRestaurantId) {
      setSelectedRestaurantId(myRestaurants[0]._id);
    }
  }, [myRestaurants, selectedRestaurantId]);

  // Fetch bookings whenever selected restaurant or status filter changes
  useEffect(() => {
    if (selectedRestaurantId) {
      dispatch(
        fetchRestaurantBookings({
          restaurantId: selectedRestaurantId,
          queryParams: statusFilter ? { status: statusFilter } : {},
        })
      );
    }
  }, [dispatch, selectedRestaurantId, statusFilter]);

  // Handle Approve
  const handleApprove = (bookingId) => {
    dispatch(approveBooking(bookingId));
  };

  // Handle Confirm Rejection via Modal
  const handleConfirmReject = () => {
    if (!rejectingBooking) return;

    dispatch(
      rejectBooking({
        id: rejectingBooking._id,
        rejectionReason: rejectionReason.trim() || "",
      })
    )
      .unwrap()
      .then(() => {
        setRejectingBooking(null);
        setRejectionReason("");
      })
      .catch(() => {});
  };

  // Handle Confirm Completed via Modal
  const handleConfirmComplete = () => {
    if (!completingBooking) return;

    dispatch(
      updateBookingStatus({ id: completingBooking._id, status: "completed" })
    )
      .unwrap()
      .then(() => {
        setCompletingBooking(null);
      })
      .catch(() => {});
  };

  const selectedRestaurant = myRestaurants?.find(
    (r) => r._id === selectedRestaurantId
  );

  if (myRestaurantsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF6]">
        <p className="text-[#B0AA9C]">Loading venues...</p>
      </div>
    );
  }

  if (!myRestaurants || myRestaurants.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF6] px-5">
        <div className="text-center bg-white border border-[#E7E2D6] rounded-2xl p-8 max-w-md">
          <h2
            className="text-[22px] text-[#16281F] mb-2"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            No Restaurant Listed
          </h2>
          <p
            className="text-[#5C5C54] text-[14px]"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            You need to list a restaurant before you can manage table bookings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-[#FDFBF6] min-h-screen"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="max-w-4xl mx-auto px-5 py-12">
        {/* Header & Restaurant Selector */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1
              className="text-[32px] text-[#16281F] mb-1"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Bookings
            </h1>
            <p className="text-[14px] text-[#5C5C54]">
              {selectedRestaurant?.name || "Manage reservations"}
            </p>
          </div>

          {/* Restaurant Switcher Dropdown if multiple exist */}
          {myRestaurants.length > 1 && (
            <div className="w-full sm:w-auto">
              <label className="block text-[11px] uppercase tracking-wider text-[#5C5C54] font-medium mb-1">
                Select Restaurant
              </label>
              <select
                value={selectedRestaurantId}
                onChange={(e) => setSelectedRestaurantId(e.target.value)}
                className="w-full sm:w-64 px-4 py-2 text-[13px] bg-white border border-[#E7E2D6] rounded-full text-[#16281F] focus:outline-none focus:border-[#B8863B] cursor-pointer"
              >
                {myRestaurants.map((res) => (
                  <option key={res._id} value={res._id}>
                    {res.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1 scrollbar-none">
          {["pending", "confirmed", "completed", "cancelled"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-[12px] px-3.5 py-1.5 rounded-full font-medium capitalize transition-colors whitespace-nowrap ${
                statusFilter === s
                  ? "bg-[#16281F] text-[#FDFBF6]"
                  : "text-[#5C5C54] hover:bg-[#E7E2D6]/50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {restaurantBookingsLoading ? (
          <p className="text-center text-[#B0AA9C] py-16">Loading bookings...</p>
        ) : !restaurantBookings || restaurantBookings.length === 0 ? (
          <div className="text-center py-16 bg-white border border-[#E7E2D6] rounded-2xl p-8">
            <p
              className="text-[18px] text-[#16281F] mb-1"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              No {statusFilter} bookings
            </p>
            <p className="text-[13px] text-[#5C5C54]">
              There are currently no reservations in this category.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {restaurantBookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white border border-[#E7E2D6] rounded-xl p-5 shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-[16px] text-[#16281F] font-medium">
                      {booking.user?.name || "Guest"}
                    </h3>
                    <p className="text-[13px] text-[#B0AA9C]">
                      {booking.contactPhone} · {booking.contactEmail}
                    </p>
                  </div>
                  <span
                    className={`text-[11px] font-medium px-2.5 py-1 rounded-full capitalize shrink-0 ${
                      statusColors[booking.status] || "bg-gray-100 text-gray-700"
                    }`}
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
                    <FiUsers className="text-[#B8863B]" /> {booking.guests}{" "}
                    {booking.guests === 1 ? "guest" : "guests"}
                  </span>
                </div>

                {booking.occasion && (
                  <p className="text-[13px] text-[#5C5C54] mb-1">
                    <span className="text-[#B0AA9C]">Occasion:</span>{" "}
                    {booking.occasion}
                  </p>
                )}
                {booking.specialRequests && (
                  <p className="text-[13px] text-[#5C5C54] mb-3">
                    <span className="text-[#B0AA9C]">Request:</span>{" "}
                    {booking.specialRequests}
                  </p>
                )}

                {/* Actions for Pending */}
                {booking.status === "pending" && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-[#E7E2D6]/60">
                    <button
                      onClick={() => handleApprove(booking._id)}
                      disabled={ownerActionLoading}
                      className="flex items-center gap-1.5 text-[13px] font-medium px-4 py-2 rounded-full bg-[#3F6B4F]/15 text-[#3F6B4F] hover:bg-[#3F6B4F] hover:text-white transition-colors disabled:opacity-50"
                    >
                      <FiCheck /> Approve
                    </button>
                    <button
                      onClick={() => setRejectingBooking(booking)}
                      disabled={ownerActionLoading}
                      className="flex items-center gap-1.5 text-[13px] font-medium px-4 py-2 rounded-full bg-[#A63D2F]/15 text-[#A63D2F] hover:bg-[#A63D2F] hover:text-white transition-colors disabled:opacity-50"
                    >
                      <FiX /> Decline
                    </button>
                  </div>
                )}

                {/* Actions for Confirmed */}
                {booking.status === "confirmed" && (
                  <div className="mt-3 pt-3 border-t border-[#E7E2D6]/60">
                    <button
                      onClick={() => setCompletingBooking(booking)}
                      disabled={ownerActionLoading}
                      className="text-[13px] font-medium px-4 py-2 rounded-full border border-[#E7E2D6] text-[#16281F] hover:bg-[#E7E2D6]/40 transition-colors disabled:opacity-50"
                    >
                      Mark completed
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= REJECT BOOKING MODAL ================= */}
      <AnimatePresence>
        {rejectingBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="bg-white border border-[#E7E2D6] rounded-2xl max-w-md w-full p-6 shadow-2xl relative"
            >
              <button
                onClick={() => {
                  setRejectingBooking(null);
                  setRejectionReason("");
                }}
                className="absolute top-4 right-4 text-[#B0AA9C] hover:text-[#16281F] transition-colors"
                aria-label="Close modal"
              >
                <FiX className="text-xl" />
              </button>

              <div className="w-12 h-12 rounded-full bg-[#A63D2F]/10 flex items-center justify-center text-[#A63D2F] mb-4">
                <FiAlertTriangle className="text-xl" />
              </div>

              <h3
                className="text-[22px] text-[#16281F] mb-2"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Decline Reservation?
              </h3>
              <p className="text-[14px] text-[#5C5C54] mb-4 leading-relaxed">
                Decline reservation for{" "}
                <span className="font-semibold text-[#16281F]">
                  {rejectingBooking.user?.name || "Guest"}
                </span>{" "}
                on {new Date(rejectingBooking.bookingDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })} at {rejectingBooking.bookingTime}.
              </p>

              <div className="mb-6">
                <label className="block text-[12px] uppercase tracking-wider text-[#5C5C54] font-medium mb-1.5">
                  Reason for declining (optional)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Fully booked, private event, kitchen closed..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 text-[13px] text-[#16281F] bg-[#FDFBF6] border border-[#E7E2D6] rounded-xl focus:outline-none focus:border-[#B8863B] transition resize-none placeholder:text-[#B0AA9C]"
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setRejectingBooking(null);
                    setRejectionReason("");
                  }}
                  className="px-5 py-2.5 rounded-full border border-[#E7E2D6] text-[13px] font-medium text-[#5C5C54] hover:text-[#16281F] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  disabled={ownerActionLoading}
                  className="px-5 py-2.5 rounded-full bg-[#A63D2F] text-white text-[13px] font-medium hover:bg-[#883125] transition-colors disabled:opacity-50"
                >
                  {ownerActionLoading ? "Declining..." : "Decline Reservation"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MARK COMPLETED MODAL ================= */}
      <AnimatePresence>
        {completingBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="bg-white border border-[#E7E2D6] rounded-2xl max-w-md w-full p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setCompletingBooking(null)}
                className="absolute top-4 right-4 text-[#B0AA9C] hover:text-[#16281F] transition-colors"
                aria-label="Close modal"
              >
                <FiX className="text-xl" />
              </button>

              <div className="w-12 h-12 rounded-full bg-[#3F6B4F]/10 flex items-center justify-center text-[#3F6B4F] mb-4">
                <FiCheckCircle className="text-xl" />
              </div>

              <h3
                className="text-[22px] text-[#16281F] mb-2"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Mark as Completed?
              </h3>
              <p className="text-[14px] text-[#5C5C54] mb-6 leading-relaxed">
                Confirm that{" "}
                <span className="font-semibold text-[#16281F]">
                  {completingBooking.user?.name || "Guest"}
                </span>{" "}
                arrived and dined at your restaurant.
              </p>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setCompletingBooking(null)}
                  className="px-5 py-2.5 rounded-full border border-[#E7E2D6] text-[13px] font-medium text-[#5C5C54] hover:text-[#16281F] transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleConfirmComplete}
                  disabled={ownerActionLoading}
                  className="px-5 py-2.5 rounded-full bg-[#3F6B4F] text-white text-[13px] font-medium hover:bg-[#2d4d39] transition-colors disabled:opacity-50"
                >
                  {ownerActionLoading ? "Updating..." : "Yes, Mark Completed"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageBookings;