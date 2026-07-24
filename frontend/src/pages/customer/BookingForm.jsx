// src/pages/customer/BookingForm.jsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { FiCalendar, FiClock, FiUsers } from "react-icons/fi";
import { fetchRestaurantBySlug } from "../../features/restaurant/restaurantSlice";
import { createBooking } from "../../features/booking/bookingSlice";

const BookingForm = () => {
  const { restaurantId } = useParams();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const date = searchParams.get("date");
  const time = searchParams.get("time");

  const { user } = useSelector((state) => state.auth);
  const { createLoading } = useSelector((state) => state.booking);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      guests: 2,
      contactName: user?.name || "",
      contactEmail: user?.email || "",
      contactPhone: user?.phone || "",
    },
  });

  useEffect(() => {
    // Redirect back if someone lands here without a valid slot selected
    if (!date || !time) {
      navigate(-1);
    }
  }, [date, time, navigate]);

  const onSubmit = async (data) => {
    const payload = {
      restaurant: restaurantId,
      bookingDate: date,
      bookingTime: time,
      guests: Number(data.guests),
      occasion: data.occasion,
      specialRequests: data.specialRequests,
      contactName: data.contactName,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
    };

    const result = await dispatch(createBooking(payload));
    if (createBooking.fulfilled.match(result)) {
      navigate("/my-bookings");
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF6] flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-120">
        <div className="mb-8">
          <p
            className="text-[13px] uppercase tracking-[0.15em] text-[#B8863B] font-medium mb-2"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Confirm your request
          </p>
          <h1
            className="text-[32px] text-[#16281F] leading-tight"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Reserve your <span className="italic text-[#B8863B]">table</span>
          </h1>
        </div>

        {/* Slot summary strip */}
        <div className="flex items-center gap-4 bg-white border border-[#E7E2D6] rounded-xl px-5 py-4 mb-6 text-[13px] text-[#5C5C54]">
          <span className="flex items-center gap-1.5">
            <FiCalendar className="text-[#B8863B]" /> {date}
          </span>
          <span className="flex items-center gap-1.5">
            <FiClock className="text-[#B8863B]" /> {time}
          </span>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {/* Guests */}
          <div>
            <label className="block text-[13px] font-medium text-[#16281F] mb-1.5">
              Number of guests
            </label>
            <div className="flex items-center gap-2 border border-[#E7E2D6] rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-[#B8863B]/40 focus-within:border-[#B8863B] transition">
              <FiUsers className="text-[#B8863B] shrink-0" />
              <select
                {...register("guests", { required: true })}
                className="w-full text-[14px] text-[#16281F] bg-transparent focus:outline-none"
              >
                {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "guest" : "guests"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Occasion */}
          <div>
            <label className="block text-[13px] font-medium text-[#16281F] mb-1.5">
              Occasion <span className="text-[#B0AA9C] font-normal">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="Birthday, anniversary..."
              {...register("occasion")}
              className="w-full px-4 py-3 rounded-lg border border-[#E7E2D6] text-[14px] text-[#16281F] placeholder:text-[#B0AA9C] focus:outline-none focus:ring-2 focus:ring-[#B8863B]/40 focus:border-[#B8863B] transition"
            />
          </div>

          {/* Special requests */}
          <div>
            <label className="block text-[13px] font-medium text-[#16281F] mb-1.5">
              Special requests <span className="text-[#B0AA9C] font-normal">(optional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="Window seat, allergies, etc."
              {...register("specialRequests")}
              className="w-full px-4 py-3 rounded-lg border border-[#E7E2D6] text-[14px] text-[#16281F] placeholder:text-[#B0AA9C] focus:outline-none focus:ring-2 focus:ring-[#B8863B]/40 focus:border-[#B8863B] transition resize-none"
            />
          </div>

          <div className="h-px bg-[#E7E2D6] my-2" />

          <p className="text-[13px] font-medium text-[#16281F]">Contact details</p>

          {/* Contact name */}
          <div>
            <input
              type="text"
              placeholder="Full name"
              {...register("contactName", { required: "Name is required" })}
              className="w-full px-4 py-3 rounded-lg border border-[#E7E2D6] text-[14px] text-[#16281F] placeholder:text-[#B0AA9C] focus:outline-none focus:ring-2 focus:ring-[#B8863B]/40 focus:border-[#B8863B] transition"
            />
            {errors.contactName && (
              <p className="mt-1.5 text-[13px] text-[#A63D2F]">{errors.contactName.message}</p>
            )}
          </div>

          {/* Contact email + phone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="email"
                placeholder="Email"
                {...register("contactEmail", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Invalid email",
                  },
                })}
                className="w-full px-4 py-3 rounded-lg border border-[#E7E2D6] text-[14px] text-[#16281F] placeholder:text-[#B0AA9C] focus:outline-none focus:ring-2 focus:ring-[#B8863B]/40 focus:border-[#B8863B] transition"
              />
              {errors.contactEmail && (
                <p className="mt-1.5 text-[13px] text-[#A63D2F]">{errors.contactEmail.message}</p>
              )}
            </div>
            <div>
              <input
                type="tel"
                placeholder="Phone"
                {...register("contactPhone", {
                  required: "Phone is required",
                  minLength: { value: 10, message: "Invalid phone" },
                })}
                className="w-full px-4 py-3 rounded-lg border border-[#E7E2D6] text-[14px] text-[#16281F] placeholder:text-[#B0AA9C] focus:outline-none focus:ring-2 focus:ring-[#B8863B]/40 focus:border-[#B8863B] transition"
              />
              {errors.contactPhone && (
                <p className="mt-1.5 text-[13px] text-[#A63D2F]">{errors.contactPhone.message}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={createLoading}
            className="w-full py-3 rounded-full bg-[#16281F] text-[#FDFBF6] text-[15px] font-medium hover:bg-[#3F6B4F] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {createLoading ? "Sending request..." : "Request reservation"}
          </button>

          <p className="text-[12px] text-[#B0AA9C] text-center leading-relaxed">
            This holds your seat while the restaurant confirms. If they don't respond in time,
            it's automatically released.
          </p>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;