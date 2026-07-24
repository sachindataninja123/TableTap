import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FiCalendar, FiClock, FiUsers, FiMapPin } from "react-icons/fi";
import { fetchMyBookings, cancelBooking } from "../../features/booking/bookingSlice";

const statusColors = {
  pending: "bg-[#B8863B]/15 text-[#B8863B]",
  confirmed: "bg-[#3F6B4F]/15 text-[#3F6B4F]",
  completed: "bg-[#5C5C54]/15 text-[#5C5C54]",
  cancelled: "bg-[#A63D2F]/15 text-[#A63D2F]",
};

const MyBookings = () => {
  const dispatch = useDispatch();
  const { myBookings, myBookingsLoading, cancelLoading } = useSelector((state) => state.booking);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    dispatch(fetchMyBookings(statusFilter ? { status: statusFilter } : {}));
  }, [dispatch, statusFilter]);

  const handleCancel = (id) => {
    if (window.confirm("Cancel this booking?")) {
      dispatch(cancelBooking({ id, cancellationReason: "Cancelled by customer" }));
    }
  };

  return (
    <div className="bg-[#FDFBF6] min-h-screen" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-3xl mx-auto px-5 py-12">
        <h1
          className="text-[32px] text-[#16281F] mb-8"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          My bookings
        </h1>

        <div className="flex gap-2 mb-8">
          {["", "pending", "confirmed", "completed", "cancelled"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-[12px] px-3.5 py-1.5 rounded-full font-medium capitalize transition-colors ${
                statusFilter === s
                  ? "bg-[#16281F] text-[#FDFBF6]"
                  : "text-[#5C5C54] hover:bg-[#E7E2D6]/50"
              }`}
            >
              {s || "All"}
            </button>
          ))}
        </div>

        {myBookingsLoading ? (
          <p className="text-center text-[#B0AA9C] py-16">Loading...</p>
        ) : myBookings.length === 0 ? (
          <div className="text-center py-16">
            <p
              className="text-[20px] text-[#16281F] mb-2"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              No bookings yet
            </p>
            <p className="text-[14px] text-[#5C5C54] mb-6">
              Find a table and send your first request
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
                className="bg-white border border-[#E7E2D6] rounded-xl p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3
                      className="text-[18px] text-[#16281F]"
                      style={{ fontFamily: "'Fraunces', serif" }}
                    >
                      {booking.restaurant?.name}
                    </h3>
                    {booking.restaurant?.location && (
                      <p className="text-[13px] text-[#B0AA9C] flex items-center gap-1.5 mt-1">
                        <FiMapPin className="text-[#B8863B]" /> {booking.restaurant.location}
                      </p>
                    )}
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

                {booking.status === "cancelled" && booking.cancellationReason && (
                  <p className="text-[13px] text-[#A63D2F] mt-2">
                    {booking.cancellationReason}
                  </p>
                )}

                {(booking.status === "pending" || booking.status === "confirmed") && (
                  <button
                    onClick={() => handleCancel(booking._id)}
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
    </div>
  );
};

export default MyBookings;