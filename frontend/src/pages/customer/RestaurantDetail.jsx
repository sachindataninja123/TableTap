import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { FiStar, FiMapPin, FiClock, FiPhone } from "react-icons/fi";
import {
  fetchRestaurantBySlug,
  fetchRestaurantAvailability,
  clearCurrentRestaurant,
} from "../../features/restaurant/restaurantSlice";

const RestaurantDetail = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const { currentRestaurant, detailLoading, availability, availabilityLoading } = useSelector(
    (state) => state.restaurant
  );

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    dispatch(fetchRestaurantBySlug(slug));
    return () => dispatch(clearCurrentRestaurant());
  }, [dispatch, slug]);

  useEffect(() => {
    if (currentRestaurant?._id) {
      dispatch(
        fetchRestaurantAvailability({ id: currentRestaurant._id, date: selectedDate })
      );
    }
  }, [dispatch, currentRestaurant?._id, selectedDate]);

  if (detailLoading || !currentRestaurant) {
    return (
      <div className="min-h-screen bg-[#FDFBF6] flex items-center justify-center">
        <p className="text-[#B0AA9C]">Loading...</p>
      </div>
    );
  }

  const r = currentRestaurant;

  return (
    <div className="bg-[#FDFBF6] min-h-screen" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Hero image */}
      <div className="h-70 md:h-95 bg-[#E7E2D6] relative">
        {r.image?.url ? (
          <img src={r.image.url} alt={r.name} className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-[#B0AA9C] text-[24px]"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            {r.name}
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-[#16281F]/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 max-w-6xl mx-auto px-5 pb-6 w-full">
          <p className="text-[13px] uppercase tracking-[0.15em] text-[#B8863B] font-medium mb-2">
            {r.cuisine} · {r.priceRange}
          </p>
          <h1
            className="text-[32px] md:text-[44px] text-white leading-tight"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            {r.name}
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 py-10 grid md:grid-cols-3 gap-10">
        {/* Left — details */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-4 mb-6 text-[14px] text-[#5C5C54]">
            <span className="flex items-center gap-1.5">
              <FiStar className="text-[#B8863B]" /> {r.rating || "New"} ({r.reviewCount || 0})
            </span>
            <span className="flex items-center gap-1.5">
              <FiMapPin className="text-[#B8863B]" /> {r.location}
            </span>
            <span className="flex items-center gap-1.5">
              <FiClock className="text-[#B8863B]" /> {r.openingTime} – {r.closingTime}
            </span>
          </div>

          <h2
            className="text-[22px] text-[#16281F] mb-3"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            About
          </h2>
          <p className="text-[15px] text-[#5C5C54] leading-relaxed mb-8">{r.description}</p>

          <h2
            className="text-[22px] text-[#16281F] mb-3"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Details
          </h2>
          <div className="grid grid-cols-2 gap-4 text-[14px] mb-8">
            <div>
              <p className="text-[#B0AA9C] mb-1">Chef</p>
              <p className="text-[#16281F]">{r.chef}</p>
            </div>
            <div>
              <p className="text-[#B0AA9C] mb-1">Phone</p>
              <p className="text-[#16281F] flex items-center gap-1.5">
                <FiPhone className="text-[#B8863B]" /> {r.phone}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-[#B0AA9C] mb-1">Address</p>
              <p className="text-[#16281F]">
                {r.address?.street}, {r.address?.city}, {r.address?.state} {r.address?.pincode}
              </p>
            </div>
          </div>

          {r.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {r.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[12px] px-3 py-1.5 rounded-full bg-[#E7E2D6]/50 text-[#5C5C54]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right — availability / booking card */}
        <div>
          <div className="sticky top-24 bg-white border border-[#E7E2D6] rounded-xl p-6">
            <h3
              className="text-[18px] text-[#16281F] mb-4"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Check availability
            </h3>

            <label className="block text-[13px] font-medium text-[#16281F] mb-1.5">Date</label>
            <input
              type="date"
              value={selectedDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-[#E7E2D6] text-[14px] text-[#16281F] mb-5 focus:outline-none focus:ring-2 focus:ring-[#B8863B]/40"
            />

            {availabilityLoading ? (
              <p className="text-[13px] text-[#B0AA9C] text-center py-4">Checking slots...</p>
            ) : availability?.availability?.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 mb-2">
                {availability.availability.map((slot) => (
                  <Link
                    key={slot.slot}
                    to={slot.isAvailable ? `/book/${r._id}?date=${selectedDate}&time=${encodeURIComponent(slot.slot)}` : "#"}
                    className={`text-center py-2.5 rounded-lg text-[13px] font-medium border transition-colors ${
                      slot.isAvailable
                        ? "border-[#B8863B] text-[#16281F] hover:bg-[#B8863B] hover:text-white cursor-pointer"
                        : "border-[#E7E2D6] text-[#B0AA9C] cursor-not-allowed"
                    }`}
                    onClick={(e) => !slot.isAvailable && e.preventDefault()}
                  >
                    {slot.slot}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-[#B0AA9C] text-center py-4">
                No slots configured for this restaurant yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetail;