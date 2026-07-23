import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";
import { FiStar, FiSearch } from "react-icons/fi";
import { fetchRestaurants } from "../../features/restaurant/restaurantSlice";

const cuisines = [
  "Italian",
  "Japanese",
  "Indian",
  "Mexican",
  "Modern European",
  "Coastal Indian",
];
const priceRanges = ["$", "$$", "$$$", "$$$$"];

const RestaurantList = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const {
    restaurants,
    fetchLoading,
    currentPage,
    totalPages,
    totalRestaurants,
  } = useSelector((state) => state.restaurant);

  const [filters, setFilters] = useState({
    search: "",
    location: searchParams.get("location") || "",
    cuisine: "",
    priceRange: "",
    sort: "newest",
    page: 1,
  });

  useEffect(() => {
    dispatch(fetchRestaurants(filters));
  }, [dispatch, filters]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  return (
    <div
      className="min-h-screen bg-[#FDFBF6]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="max-w-6xl mx-auto px-5 py-12">
        {/* Header */}
        <div className="mb-8">
          <p className="text-[13px] uppercase tracking-[0.15em] text-[#B8863B] font-medium mb-2">
            {totalRestaurants} places
          </p>
          <h1
            className="text-[32px] md:text-[40px] text-[#16281F]"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Find your table
          </h1>
        </div>

        {/* Filters */}
        <div className="bg-white border border-[#E7E2D6] rounded-xl p-4 mb-8">
          <div className="grid md:grid-cols-5 gap-3">
            <div className="md:col-span-2 flex items-center gap-2 border border-[#E7E2D6] rounded-lg px-3 py-2.5">
              <FiSearch className="text-[#B0AA9C] shrink-0" />
              <input
                type="text"
                placeholder="Search by name"
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
                className="w-full text-[14px] text-[#16281F] placeholder:text-[#B0AA9C] focus:outline-none"
              />
            </div>

            <input
              type="text"
              placeholder="Location"
              value={filters.location}
              onChange={(e) => updateFilter("location", e.target.value)}
              className="border border-[#E7E2D6] rounded-lg px-3 py-2.5 text-[14px] text-[#16281F] placeholder:text-[#B0AA9C] focus:outline-none focus:ring-2 focus:ring-[#B8863B]/40"
            />

            <select
              value={filters.cuisine}
              onChange={(e) => updateFilter("cuisine", e.target.value)}
              className="border border-[#E7E2D6] rounded-lg px-3 py-2.5 text-[14px] text-[#16281F] focus:outline-none focus:ring-2 focus:ring-[#B8863B]/40"
            >
              <option value="">Any cuisine</option>
              {cuisines.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={filters.priceRange}
              onChange={(e) => updateFilter("priceRange", e.target.value)}
              className="border border-[#E7E2D6] rounded-lg px-3 py-2.5 text-[14px] text-[#16281F] focus:outline-none focus:ring-2 focus:ring-[#B8863B]/40"
            >
              <option value="">Any price</option>
              {priceRanges.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#E7E2D6]">
            <div className="flex gap-2">
              {["newest", "rating", "name"].map((s) => (
                <button
                  key={s}
                  onClick={() => updateFilter("sort", s)}
                  className={`text-[12px] px-3 py-1.5 rounded-full font-medium capitalize transition-colors ${
                    filters.sort === s
                      ? "bg-[#16281F] text-[#FDFBF6]"
                      : "text-[#5C5C54] hover:bg-[#E7E2D6]/50"
                  }`}
                >
                  {s === "rating" ? "Top rated" : s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        {fetchLoading ? (
          <div className="text-center py-20 text-[#B0AA9C]">
            Loading tables...
          </div>
        ) : restaurants?.length === 0 ? (
          <div className="text-center py-20">
            <p
              className="text-[20px] text-[#16281F] mb-2"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              No tables match that search
            </p>
            <p className="text-[14px] text-[#5C5C54]">
              Try clearing a filter or two
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants?.map((restaurant) => (
              <Link
                key={restaurant._id}
                to={`/restaurants/${restaurant.slug}`}
                className="group block bg-white border border-[#E7E2D6] rounded-xl overflow-hidden hover:shadow-[0_16px_40px_-20px_rgba(22,40,31,0.3)] transition-shadow"
              >
                <div className="aspect-4/3 bg-[#E7E2D6] relative overflow-hidden">
                  {restaurant.image?.url ? (
                    <img
                      src={restaurant.image.url}
                      alt={restaurant.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-[#B0AA9C] text-[13px]"
                      style={{ fontFamily: "'Fraunces', serif" }}
                    >
                      {restaurant.name}
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full flex items-center gap-1">
                    <FiStar className="text-[#B8863B] text-[12px]" />
                    <span className="text-[12px] font-medium text-[#16281F]">
                      {restaurant.rating || "New"}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3
                    className="text-[17px] text-[#16281F] mb-1"
                    style={{ fontFamily: "'Fraunces', serif" }}
                  >
                    {restaurant.name}
                  </h3>
                  <p className="text-[13px] text-[#5C5C54]">
                    {restaurant.cuisine} · {restaurant.priceRange}
                  </p>
                  <p className="text-[13px] text-[#B0AA9C] mt-1">
                    {restaurant.location}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => updateFilter("page", page)}
                className={`w-9 h-9 rounded-full text-[13px] font-medium transition-colors ${
                  currentPage === page
                    ? "bg-[#16281F] text-[#FDFBF6]"
                    : "text-[#5C5C54] hover:bg-[#E7E2D6]/50"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantList;
