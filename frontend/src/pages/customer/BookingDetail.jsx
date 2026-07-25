import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCalendar,
  FiClock,
  FiUsers,
  FiMapPin,
  FiArrowLeft,
  FiX,
  FiAlertTriangle,
} from "react-icons/fi";
import {
  fetchBookingById,
  clearCurrentBooking,
  cancelBooking,
} from "../../features/booking/bookingSlice";

const statusColors = {
  pending: "bg-[#B8863B]/15 text-[#B8863B]",
  confirmed: "bg-[#3F6B4F]/15 text-[#3F6B4F]",
  completed: "bg-[#5C5C54]/15 text-[#5C5C54]",
  cancelled: "bg-[#A63D2F]/15 text-[#A63D2F]",
};

const BookingDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentBooking, bookingDetailLoading, cancelLoading } = useSelector(
    (state) => state.booking
  );

  // Modal State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");

  useEffect(() => {
    dispatch(fetchBookingById(id));
    return () => dispatch(clearCurrentBooking());
  }, [dispatch, id]);

  const handleConfirmCancel = () => {
    dispatch(
      cancelBooking({
        id,
        cancellationReason: cancellationReason.trim() || "Cancelled by customer",
      })
    )
      .unwrap()
      .then(() => {
        setShowCancelModal(false);
        setCancellationReason("");
      })
      .catch(() => {});
  };

  if (bookingDetailLoading || !currentBooking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF6]">
        <p className="text-[#B0AA9C]">Loading...</p>
      </div>
    );
  }

  const b = currentBooking;

  return (
    <div
      className="bg-[#FDFBF6] min-h-screen relative"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="max-w-lg mx-auto px-5 py-12">
        <Link
          to="/my-bookings"
          className="inline-flex items-center gap-1.5 text-[13px] text-[#5C5C54] hover:text-[#16281F] mb-8 transition-colors"
        >
          <FiArrowLeft /> Back to bookings
        </Link>

        <div className="bg-white border border-[#E7E2D6] rounded-xl p-6 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[13px] uppercase tracking-[0.15em] text-[#B8863B] font-medium mb-2">
                Reservation
              </p>
              <h1
                className="text-[26px] text-[#16281F] leading-tight"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                {b.restaurant?.name}
              </h1>
              {b.restaurant?.location && (
                <p className="text-[13px] text-[#B0AA9C] flex items-center gap-1.5 mt-1">
                  <FiMapPin className="text-[#B8863B]" />{" "}
                  {b.restaurant.location}
                </p>
              )}
            </div>
            <span
              className={`text-[11px] font-medium px-2.5 py-1 rounded-full capitalize shrink-0 ${statusColors[b.status]}`}
            >
              {b.status}
            </span>
          </div>

          <div className="h-px bg-[#E7E2D6] my-5" />

          <div className="space-y-3 text-[14px]">
            <div className="flex items-center gap-2 text-[#16281F]">
              <FiCalendar className="text-[#B8863B]" />
              {new Date(b.bookingDate).toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
            <div className="flex items-center gap-2 text-[#16281F]">
              <FiClock className="text-[#B8863B]" /> {b.bookingTime}
            </div>
            <div className="flex items-center gap-2 text-[#16281F]">
              <FiUsers className="text-[#B8863B]" /> {b.guests}{" "}
              {b.guests === 1 ? "guest" : "guests"}
            </div>
          </div>

          {(b.occasion || b.specialRequests) && (
            <>
              <div className="h-px bg-[#E7E2D6] my-5" />
              {b.occasion && (
                <p className="text-[14px] text-[#5C5C54] mb-2">
                  <span className="text-[#B0AA9C]">Occasion:</span> {b.occasion}
                </p>
              )}
              {b.specialRequests && (
                <p className="text-[14px] text-[#5C5C54]">
                  <span className="text-[#B0AA9C]">Request:</span>{" "}
                  {b.specialRequests}
                </p>
              )}
            </>
          )}

          <div className="h-px bg-[#E7E2D6] my-5" />

          <p className="text-[12px] text-[#B0AA9C] mb-1">Booking reference</p>
          <p className="text-[14px] text-[#16281F] font-mono">{b.bookingId}</p>

          {b.status === "cancelled" && b.cancellationReason && (
            <div className="mt-4 p-3.5 bg-[#A63D2F]/10 border border-[#A63D2F]/20 rounded-lg">
              <p className="text-[12px] uppercase tracking-wider text-[#A63D2F] font-medium mb-0.5">
                Cancellation Details
              </p>
              <p className="text-[13px] text-[#A63D2F]">
                {b.cancellationReason}
              </p>
            </div>
          )}

          {(b.status === "pending" || b.status === "confirmed") && (
            <button
              onClick={() => setShowCancelModal(true)}
              disabled={cancelLoading}
              className="mt-6 w-full py-3 rounded-full border border-[#A63D2F]/30 text-[#A63D2F] text-[14px] font-medium hover:bg-[#A63D2F]/10 transition-colors disabled:opacity-50"
            >
              Cancel booking
            </button>
          )}
        </div>
      </div>

      {/* ================= CANCELLATION MODAL ================= */}
      <AnimatePresence>
        {showCancelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="bg-white border border-[#E7E2D6] rounded-2xl max-w-md w-full p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setShowCancelModal(false)}
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
                  {b.restaurant?.name}
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
                  onClick={() => setShowCancelModal(false)}
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

export default BookingDetail;