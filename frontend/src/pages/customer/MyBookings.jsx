import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  FiCalendar,
  FiClock,
  FiUsers,
  FiMapPin,
  FiX,
  FiAlertTriangle,
} from "react-icons/fi";
import {
  fetchMyBookings,
  cancelBooking,
} from "../../features/booking/bookingSlice";
import { AnimatePresence, motion } from "framer-motion";

const statusColors = {
  pending: "bg-[#B8863B]/15 text-[#B8863B]",
  confirmed: "bg-[#3F6B4F]/15 text-[#3F6B4F]",
  completed: "bg-[#5C5C54]/15 text-[#5C5C54]",
  cancelled: "bg-[#A63D2F]/15 text-[#A63D2F]",
};

const MyBookings = () => {
  const dispatch = useDispatch();
  const { myBookings, myBookingsLoading, cancelLoading } = useSelector(
    (state) => state.booking
  );
  const [statusFilter, setStatusFilter] = useState("");

  // Modal State: holds selected booking object or null
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancellationReason, setCancellationReason] = useState("");

  useEffect(() => {
    dispatch(fetchMyBookings(statusFilter ? { status: statusFilter } : {}));
  }, [dispatch, statusFilter]);

  const handleConfirmCancel = () => {
    if (!selectedBooking) return;

    dispatch(
      cancelBooking({
        id: selectedBooking._id,
        cancellationReason:
          cancellationReason.trim() || "Cancelled by customer",
      })
    )
      .unwrap()
      .then(() => {
        setSelectedBooking(null);
        setCancellationReason("");
      })
      .catch(() => {});
  };

  return (
    <div
      className="bg-[#FDFBF6] min-h-screen"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="max-w-3xl mx-auto px-5 py-12">
        <h1
          className="text-[32px] text-[#16281F] mb-8"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          My bookings
        </h1>

        {/* Filter Pills */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1 scrollbar-none">
          {["", "pending", "confirmed", "completed", "cancelled"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-[12px] px-3.5 py-1.5 rounded-full font-medium capitalize transition-colors whitespace-nowrap ${
                statusFilter === s
                  ? "bg-[#16281F] text-[#FDFBF6]"
                  : "text-[#5C5C54] hover:bg-[#E7E2D6]/50"
              }`}
            >
              {s || "All"}
            </button>
          ))}
        </div>

        {/* Content Section */}
        {myBookingsLoading ? (
          <p className="text-center text-[#B0AA9C] py-16">Loading...</p>
        ) : myBookings?.length === 0 ? (
          <div className="text-center py-16 bg-white border border-[#E7E2D6] rounded-xl p-8">
            <p
              className="text-[20px] text-[#16281F] mb-2"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              No bookings found
            </p>
            <p className="text-[14px] text-[#5C5C54] mb-6">
              Find a table and send your first reservation request.
            </p>
            <Link
              to="/restaurants"
              className="inline-block px-6 py-2.5 rounded-full bg-[#16281F] text-[#FDFBF6] text-[14px] font-medium hover:bg-[#3F6B4F] transition-colors"
            >
              Browse restaurants
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {myBookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white border border-[#E7E2D6] rounded-xl p-5 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <Link
                      to={`/my-bookings/${booking._id}`}
                      className="hover:underline"
                    >
                      <h3
                        className="text-[18px] text-[#16281F]"
                        style={{ fontFamily: "'Fraunces', serif" }}
                      >
                        {booking.restaurant?.name}
                      </h3>
                    </Link>
                    {booking.restaurant?.location && (
                      <p className="text-[13px] text-[#B0AA9C] flex items-center gap-1.5 mt-1">
                        <FiMapPin className="text-[#B8863B]" />{" "}
                        {booking.restaurant.location}
                      </p>
                    )}
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

                {booking.status === "cancelled" && booking.cancellationReason && (
                  <p className="text-[13px] text-[#A63D2F] mt-2">
                    Reason: {booking.cancellationReason}
                  </p>
                )}

                {(booking.status === "pending" ||
                  booking.status === "confirmed") && (
                  <button
                    onClick={() => setSelectedBooking(booking)}
                    disabled={cancelLoading}
                    className="mt-3 text-[13px] font-medium text-[#A63D2F] hover:underline disabled:opacity-50"
                  >
                    Cancel booking
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= CANCELLATION MODAL ================= */}
      <AnimatePresence>
        {selectedBooking && (
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
                  setSelectedBooking(null);
                  setCancellationReason("");
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
                Cancel Reservation?
              </h3>
              <p className="text-[14px] text-[#5C5C54] mb-4 leading-relaxed">
                Are you sure you want to cancel your table at{" "}
                <span className="font-semibold text-[#16281F]">
                  {selectedBooking.restaurant?.name || "this restaurant"}
                </span>
                ? This action will release your slot immediately.
              </p>

              {/* Optional Reason Input */}
              <div className="mb-6">
                <label className="block text-[12px] uppercase tracking-wider text-[#5C5C54] font-medium mb-1.5">
                  Reason for cancellation (optional)
                </label>
                <textarea
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="e.g. Plans changed, weather, emergency..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 text-[13px] text-[#16281F] bg-[#FDFBF6] border border-[#E7E2D6] rounded-xl focus:outline-none focus:border-[#B8863B] transition resize-none placeholder:text-[#B0AA9C]"
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBooking(null);
                    setCancellationReason("");
                  }}
                  className="px-5 py-2.5 rounded-full border border-[#E7E2D6] text-[13px] font-medium text-[#5C5C54] hover:text-[#16281F] transition-colors"
                >
                  Keep Reservation
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  disabled={cancelLoading}
                  className="px-5 py-2.5 rounded-full bg-[#A63D2F] text-white text-[13px] font-medium hover:bg-[#883125] transition-colors disabled:opacity-50"
                >
                  {cancelLoading ? "Cancelling..." : "Yes, Cancel Booking"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyBookings;