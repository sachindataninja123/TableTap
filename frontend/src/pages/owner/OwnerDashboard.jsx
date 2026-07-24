import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FiCalendar, FiClock, FiCheckCircle } from "react-icons/fi";
import { fetchMyRestaurants } from "../../features/restaurant/restaurantSlice";
import { fetchRestaurantBookings } from "../../features/booking/bookingSlice";

const statusColors = {
  pending: "bg-[#B8863B]/15 text-[#B8863B]",
  approved: "bg-[#3F6B4F]/15 text-[#3F6B4F]",
  rejected: "bg-[#A63D2F]/15 text-[#A63D2F]",
};

const OwnerDashboard = () => {
  const dispatch = useDispatch();
  const { myRestaurants } = useSelector((state) => state.restaurant);
  const { restaurantBookings } = useSelector((state) => state.booking);
  const restaurant = myRestaurants?.[0];

  useEffect(() => {
    dispatch(fetchMyRestaurants());
  }, [dispatch]);

  useEffect(() => {
    if (restaurant?._id) {
      dispatch(fetchRestaurantBookings({ restaurantId: restaurant._id, queryParams: {} }));
    }
  }, [dispatch, restaurant?._id]);

  const pendingCount = restaurantBookings.filter((b) => b.status === "pending").length;
  const confirmedCount = restaurantBookings.filter((b) => b.status === "confirmed").length;
  const completedCount = restaurantBookings.filter((b) => b.status === "completed").length;

  if (!restaurant) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFBF6] px-5 text-center">
        <p
          className="text-[24px] text-[#16281F] mb-3"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          You haven't listed a restaurant yet
        </p>
        <Link
          to="/owner/restaurant"
          className="mt-3 px-6 py-2.5 rounded-full bg-[#16281F] text-[#FDFBF6] text-[14px] font-medium hover:bg-[#3F6B4F] transition-colors"
        >
          List your restaurant
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#FDFBF6] min-h-screen" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-4xl mx-auto px-5 py-12">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-[32px] text-[#16281F]" style={{ fontFamily: "'Fraunces', serif" }}>
            {restaurant.name}
          </h1>
          <span className={`text-[12px] font-medium px-3 py-1.5 rounded-full capitalize ${statusColors[restaurant.status]}`}>
            {restaurant.status}
          </span>
        </div>
        <p className="text-[14px] text-[#5C5C54] mb-10">{restaurant.location}</p>

        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-white border border-[#E7E2D6] rounded-xl p-5">
            <FiClock className="text-[#B8863B] text-xl mb-2" />
            <p className="text-[28px] text-[#16281F]" style={{ fontFamily: "'Fraunces', serif" }}>
              {pendingCount}
            </p>
            <p className="text-[13px] text-[#5C5C54]">Awaiting response</p>
          </div>
          <div className="bg-white border border-[#E7E2D6] rounded-xl p-5">
            <FiCalendar className="text-[#3F6B4F] text-xl mb-2" />
            <p className="text-[28px] text-[#16281F]" style={{ fontFamily: "'Fraunces', serif" }}>
              {confirmedCount}
            </p>
            <p className="text-[13px] text-[#5C5C54]">Confirmed</p>
          </div>
          <div className="bg-white border border-[#E7E2D6] rounded-xl p-5">
            <FiCheckCircle className="text-[#5C5C54] text-xl mb-2" />
            <p className="text-[28px] text-[#16281F]" style={{ fontFamily: "'Fraunces', serif" }}>
              {completedCount}
            </p>
            <p className="text-[13px] text-[#5C5C54]">Completed</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            to="/owner/bookings"
            className="px-5 py-2.5 rounded-full bg-[#16281F] text-[#FDFBF6] text-[13px] font-medium hover:bg-[#3F6B4F] transition-colors"
          >
            Manage bookings
          </Link>
          <Link
            to="/owner/restaurant"
            className="px-5 py-2.5 rounded-full border border-[#E7E2D6] text-[#16281F] text-[13px] font-medium hover:bg-[#E7E2D6]/30 transition-colors"
          >
            Edit restaurant
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;