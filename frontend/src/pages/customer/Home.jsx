// src/pages/customer/Home.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { HiOutlineLocationMarker, HiOutlineCalendar, HiOutlineUserGroup } from "react-icons/hi";
import { FiStar } from "react-icons/fi";

// TEMP mock data — swap for a real dispatch(getFeaturedRestaurants())
// once restaurantSlice is wired up
const mockFeatured = [
  {
    _id: "1",
    slug: "the-copper-pot",
    name: "The Copper Pot",
    cuisine: "Modern European",
    priceRange: "$$$",
    rating: 4.7,
    location: "Bandra, Mumbai",
    image: { url: "" },
  },
  {
    _id: "2",
    slug: "sakura-house",
    name: "Sakura House",
    cuisine: "Japanese",
    priceRange: "$$$$",
    rating: 4.9,
    location: "Indiranagar, Bengaluru",
    image: { url: "" },
  },
  {
    _id: "3",
    slug: "amara",
    name: "Amara",
    cuisine: "Coastal Indian",
    priceRange: "$$",
    rating: 4.5,
    location: "Koramangala, Bengaluru",
    image: { url: "" },
  },
];

const steps = [
  {
    number: "01",
    title: "Search",
    desc: "Filter by cuisine, location, or the night you have in mind.",
  },
  {
    number: "02",
    title: "Reserve",
    desc: "Pick a real open slot — seats update the moment someone books.",
  },
  {
    number: "03",
    title: "Arrive",
    desc: "Your table's held. Just show up and give your name.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const Home = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState({ location: "", date: "", guests: "2" });

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.location) params.set("location", search.location);
    if (search.date) params.set("date", search.date);
    if (search.guests) params.set("guests", search.guests);
    navigate(`/restaurants?${params.toString()}`);
  };

  return (
    <div className="bg-[#FDFBF6]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* ================= HERO ================= */}
      <section className="max-w-6xl mx-auto px-5 pt-16 md:pt-24 pb-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[13px] uppercase tracking-[0.15em] text-[#B8863B] font-medium mb-4">
              Table booking, made honest
            </p>
            <h1
              className="text-[40px] md:text-[56px] leading-[1.05] text-[#16281F] mb-6"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Good tables
              <br />
              don't <span className="italic text-[#B8863B]">wait.</span>
            </h1>
            <p className="text-[16px] text-[#5C5C54] leading-relaxed max-w-md mb-8">
              Real-time availability from restaurants that actually update their
              books. No phone calls, no "let me check."
            </p>
            <Link
              to="/restaurants"
              className="inline-block text-[14px] font-medium text-[#16281F] border-b-2 border-[#B8863B] pb-0.5 hover:text-[#3F6B4F] transition-colors"
            >
              Browse all restaurants →
            </Link>
          </motion.div>

          {/* Signature element — the reservation card */}
          <motion.div
            initial={{ opacity: 0, y: 24, rotate: -1 }}
            animate={{ opacity: 1, y: 0, rotate: -1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="bg-white border border-[#E7E2D6] rounded-2xl shadow-[0_20px_50px_-20px_rgba(22,40,31,0.25)] p-7"
          >
            <p
              className="text-[12px] uppercase tracking-[0.15em] text-[#B8863B] font-medium mb-1"
            >
              Find a table
            </p>
            <h2
              className="text-[22px] text-[#16281F] mb-6"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Tonight, or any night
            </h2>

            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex items-center gap-3 border border-[#E7E2D6] rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-[#B8863B]/40 focus-within:border-[#B8863B] transition">
                <HiOutlineLocationMarker className="text-[#B8863B] text-lg shrink-0" />
                <input
                  type="text"
                  placeholder="City or neighborhood"
                  value={search.location}
                  onChange={(e) => setSearch({ ...search, location: e.target.value })}
                  className="w-full text-[14px] text-[#16281F] placeholder:text-[#B0AA9C] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 border border-[#E7E2D6] rounded-lg px-3 py-3 focus-within:ring-2 focus-within:ring-[#B8863B]/40 focus-within:border-[#B8863B] transition">
                  <HiOutlineCalendar className="text-[#B8863B] text-lg shrink-0" />
                  <input
                    type="date"
                    value={search.date}
                    onChange={(e) => setSearch({ ...search, date: e.target.value })}
                    className="w-full text-[13px] text-[#16281F] focus:outline-none bg-transparent"
                  />
                </div>
                <div className="flex items-center gap-2 border border-[#E7E2D6] rounded-lg px-3 py-3 focus-within:ring-2 focus-within:ring-[#B8863B]/40 focus-within:border-[#B8863B] transition">
                  <HiOutlineUserGroup className="text-[#B8863B] text-lg shrink-0" />
                  <select
                    value={search.guests}
                    onChange={(e) => setSearch({ ...search, guests: e.target.value })}
                    className="w-full text-[13px] text-[#16281F] focus:outline-none bg-transparent"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? "guest" : "guests"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-full bg-[#16281F] text-[#FDFBF6] text-[14px] font-medium hover:bg-[#3F6B4F] transition-colors"
              >
                Search tables
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="border-y border-[#E7E2D6] bg-white">
        <div className="max-w-6xl mx-auto px-5 py-16 md:py-20">
          <div className="grid md:grid-cols-3 gap-10">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={fadeUp}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <p
                  className="text-[13px] text-[#B8863B] mb-3"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  {step.number}
                </p>
                <h3
                  className="text-[20px] text-[#16281F] mb-2"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  {step.title}
                </h3>
                <p className="text-[14px] text-[#5C5C54] leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FEATURED RESTAURANTS ================= */}
      <section className="max-w-6xl mx-auto px-5 py-16 md:py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[13px] uppercase tracking-[0.15em] text-[#B8863B] font-medium mb-2">
              Handpicked
            </p>
            <h2
              className="text-[28px] md:text-[32px] text-[#16281F]"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Featured this week
            </h2>
          </div>
          <Link
            to="/restaurants"
            className="hidden md:block text-[14px] font-medium text-[#5C5C54] hover:text-[#16281F] transition-colors"
          >
            View all →
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockFeatured.map((restaurant, i) => (
            <motion.div
              key={restaurant._id}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={fadeUp}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <Link
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
                    <FiStar className="text-[#B8863B] text-[12px] fill-[#B8863B]" />
                    <span className="text-[12px] font-medium text-[#16281F]">
                      {restaurant.rating}
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
                  <p className="text-[13px] text-[#B0AA9C] mt-1">{restaurant.location}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <Link
          to="/restaurants"
          className="md:hidden mt-8 block text-center text-[14px] font-medium text-[#16281F] border border-[#E7E2D6] rounded-full py-3"
        >
          View all restaurants
        </Link>
      </section>

      {/* ================= OWNER CTA ================= */}
      <section className="bg-[#16281F]">
        <div className="max-w-6xl mx-auto px-5 py-16 md:py-20 text-center">
          <p className="text-[13px] uppercase tracking-[0.15em] text-[#B8863B] font-medium mb-4">
            Run a restaurant?
          </p>
          <h2
            className="text-[28px] md:text-[36px] text-[#FDFBF6] mb-6 max-w-xl mx-auto leading-tight"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Fill more tables, <span className="italic text-[#B8863B]">answer fewer calls.</span>
          </h2>
          <Link
            to="/register"
            className="inline-block px-7 py-3 rounded-full bg-[#B8863B] text-[#16281F] text-[14px] font-medium hover:bg-[#a3762f] transition-colors"
          >
            List your restaurant
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;