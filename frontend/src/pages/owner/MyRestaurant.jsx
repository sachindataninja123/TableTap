import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMyRestaurants,
  createRestaurant,
  updateRestaurant,
  uploadRestaurantImage,
  setOpeningHours,
} from "../../features/restaurant/restaurantSlice";

const statusColors = {
  pending: "bg-[#B8863B]/15 text-[#B8863B]",
  approved: "bg-[#3F6B4F]/15 text-[#3F6B4F]",
  rejected: "bg-[#A63D2F]/15 text-[#A63D2F]",
};

const MyRestaurant = () => {
  const dispatch = useDispatch();
  const { myRestaurants, myRestaurantsLoading, actionLoading } = useSelector(
    (state) => state.restaurant
  );
  const { register, handleSubmit, reset } = useForm();
  const [slotsInput, setSlotsInput] = useState("");

  const restaurant = myRestaurants?.[0]; // assuming one restaurant per owner

  useEffect(() => {
    dispatch(fetchMyRestaurants());
  }, [dispatch]);

  useEffect(() => {
    if (restaurant) {
      reset({
        name: restaurant.name,
        description: restaurant.description,
        cuisine: restaurant.cuisine,
        priceRange: restaurant.priceRange,
        location: restaurant.location,
        street: restaurant.address?.street,
        city: restaurant.address?.city,
        state: restaurant.address?.state,
        pincode: restaurant.address?.pincode,
        chef: restaurant.chef,
        phone: restaurant.phone,
        email: restaurant.email,
        website: restaurant.website,
        openingTime: restaurant.openingTime,
        closingTime: restaurant.closingTime,
      });
      setSlotsInput((restaurant.availableSlots || []).join(", "));
    }
  }, [restaurant, reset]);

  const onSubmitDetails = (data) => {
    const payload = {
      name: data.name,
      description: data.description,
      cuisine: data.cuisine,
      priceRange: data.priceRange,
      location: data.location,
      address: {
        street: data.street,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
      },
      chef: data.chef,
      phone: data.phone,
      email: data.email,
      website: data.website,
    };

    if (restaurant) {
      dispatch(updateRestaurant({ id: restaurant._id, formData: payload }));
    } else {
      dispatch(createRestaurant(payload));
    }
  };

  const onSubmitHours = (data) => {
    const availableSlots = slotsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    dispatch(
      setOpeningHours({
        id: restaurant._id,
        hoursData: {
          openingTime: data.openingTime,
          closingTime: data.closingTime,
          availableSlots,
        },
      })
    );
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file && restaurant) {
      dispatch(uploadRestaurantImage({ id: restaurant._id, file }));
    }
  };

  if (myRestaurantsLoading) {
    return <div className="min-h-screen flex items-center justify-center text-[#B0AA9C]">Loading...</div>;
  }

  return (
    <div className="bg-[#FDFBF6] min-h-screen" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-3xl mx-auto px-5 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-[32px] text-[#16281F]" style={{ fontFamily: "'Fraunces', serif" }}>
            {restaurant ? "My restaurant" : "List your restaurant"}
          </h1>
          {restaurant && (
            <span className={`text-[12px] font-medium px-3 py-1.5 rounded-full capitalize ${statusColors[restaurant.status]}`}>
              {restaurant.status}
            </span>
          )}
        </div>

        {/* Image */}
        {restaurant && (
          <div className="mb-8">
            <div className="aspect-3/1 bg-[#E7E2D6] rounded-xl overflow-hidden mb-3">
              {restaurant.image?.url && (
                <img src={restaurant.image.url} alt={restaurant.name} className="w-full h-full object-cover" />
              )}
            </div>
            <label className="inline-block text-[13px] font-medium text-[#16281F] border border-[#E7E2D6] rounded-full px-4 py-2 cursor-pointer hover:bg-[#E7E2D6]/30 transition-colors">
              Change photo
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          </div>
        )}

        {/* Details form */}
        <form onSubmit={handleSubmit(onSubmitDetails)} className="space-y-4 mb-10">
          <h2 className="text-[18px] text-[#16281F]" style={{ fontFamily: "'Fraunces', serif" }}>
            Details
          </h2>

          <input {...register("name", { required: true })} placeholder="Restaurant name" className="w-full px-4 py-3 rounded-lg border border-[#E7E2D6] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#B8863B]/40" />
          <textarea {...register("description", { required: true })} placeholder="Description" rows={3} className="w-full px-4 py-3 rounded-lg border border-[#E7E2D6] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#B8863B]/40" />

          <div className="grid grid-cols-2 gap-3">
            <input {...register("cuisine", { required: true })} placeholder="Cuisine" className="px-4 py-3 rounded-lg border border-[#E7E2D6] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#B8863B]/40" />
            <select {...register("priceRange", { required: true })} className="px-4 py-3 rounded-lg border border-[#E7E2D6] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#B8863B]/40">
              <option value="">Price range</option>
              {["$", "$$", "$$$", "$$$$"].map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <input {...register("location", { required: true })} placeholder="Location / neighborhood" className="w-full px-4 py-3 rounded-lg border border-[#E7E2D6] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#B8863B]/40" />

          <div className="grid grid-cols-2 gap-3">
            <input {...register("street", { required: true })} placeholder="Street" className="px-4 py-3 rounded-lg border border-[#E7E2D6] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#B8863B]/40" />
            <input {...register("city", { required: true })} placeholder="City" className="px-4 py-3 rounded-lg border border-[#E7E2D6] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#B8863B]/40" />
            <input {...register("state", { required: true })} placeholder="State" className="px-4 py-3 rounded-lg border border-[#E7E2D6] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#B8863B]/40" />
            <input {...register("pincode", { required: true })} placeholder="Pincode" className="px-4 py-3 rounded-lg border border-[#E7E2D6] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#B8863B]/40" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input {...register("chef", { required: true })} placeholder="Head chef" className="px-4 py-3 rounded-lg border border-[#E7E2D6] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#B8863B]/40" />
            <input {...register("phone", { required: true })} placeholder="Phone" className="px-4 py-3 rounded-lg border border-[#E7E2D6] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#B8863B]/40" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input {...register("email")} placeholder="Email (optional)" className="px-4 py-3 rounded-lg border border-[#E7E2D6] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#B8863B]/40" />
            <input {...register("website")} placeholder="Website (optional)" className="px-4 py-3 rounded-lg border border-[#E7E2D6] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#B8863B]/40" />
          </div>

          <button
            type="submit"
            disabled={actionLoading}
            className="w-full py-3 rounded-full bg-[#16281F] text-[#FDFBF6] text-[14px] font-medium hover:bg-[#3F6B4F] transition-colors disabled:opacity-60"
          >
            {actionLoading ? "Saving..." : restaurant ? "Save changes" : "Submit for approval"}
          </button>
        </form>

        {/* Opening hours — only once restaurant exists */}
        {restaurant && (
          <form onSubmit={handleSubmit(onSubmitHours)} className="space-y-4 pt-8 border-t border-[#E7E2D6]">
            <h2 className="text-[18px] text-[#16281F]" style={{ fontFamily: "'Fraunces', serif" }}>
              Hours & booking slots
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <input {...register("openingTime")} placeholder="Opening time (e.g. 09:00 AM)" className="px-4 py-3 rounded-lg border border-[#E7E2D6] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#B8863B]/40" />
              <input {...register("closingTime")} placeholder="Closing time (e.g. 11:00 PM)" className="px-4 py-3 rounded-lg border border-[#E7E2D6] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#B8863B]/40" />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#16281F] mb-1.5">
                Available booking slots (comma-separated)
              </label>
              <input
                value={slotsInput}
                onChange={(e) => setSlotsInput(e.target.value)}
                placeholder="12:00 PM, 1:00 PM, 7:00 PM, 8:00 PM"
                className="w-full px-4 py-3 rounded-lg border border-[#E7E2D6] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#B8863B]/40"
              />
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="w-full py-3 rounded-full bg-[#B8863B] text-white text-[14px] font-medium hover:bg-[#a3762f] transition-colors disabled:opacity-60"
            >
              {actionLoading ? "Saving..." : "Update hours & slots"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default MyRestaurant;