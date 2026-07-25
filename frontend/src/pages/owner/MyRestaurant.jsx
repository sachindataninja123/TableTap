import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineClock,
  HiOutlineArrowLeft,
  HiOutlineLocationMarker,
  HiOutlineTrash,
  HiOutlineX,
} from "react-icons/hi";
import {
  fetchMyRestaurants,
  createRestaurant,
  updateRestaurant,
  uploadRestaurantImage,
  setOpeningHours,
  deleteRestaurant, // Ensure this thunk exists in your restaurantSlice
} from "../../features/restaurant/restaurantSlice";

const statusColors = {
  pending: "bg-[#B8863B]/15 text-[#B8863B]",
  approved: "bg-[#3F6B4F]/15 text-[#3F6B4F]",
  rejected: "bg-[#A63D2F]/15 text-[#A63D2F]",
};

const MyRestaurant = () => {
  const dispatch = useDispatch();
  const { myRestaurants, myRestaurantsLoading, actionLoading } = useSelector(
    (state) => state.restaurant,
  );

  // View state: null = grid view, "new" = create form, "restaurantId" = edit existing form
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const [activeTab, setActiveTab] = useState("details"); // "details" | "hours"
  const [slotsInput, setSlotsInput] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  // Delete modal state
  const [deletingRestaurant, setDeletingRestaurant] = useState(null); // holds restaurant object to delete

  const { register, handleSubmit, reset } = useForm();

  // Selected restaurant object (if editing)
  const selectedRestaurant = myRestaurants?.find(
    (r) => r._id === selectedRestaurantId,
  );

  useEffect(() => {
    dispatch(fetchMyRestaurants());
  }, [dispatch]);

  // Sync React Hook Form whenever selected restaurant changes
  useEffect(() => {
    if (selectedRestaurant) {
      reset({
        name: selectedRestaurant.name || "",
        description: selectedRestaurant.description || "",
        cuisine: selectedRestaurant.cuisine || "",
        priceRange: selectedRestaurant.priceRange || "",
        location: selectedRestaurant.location || "",
        street: selectedRestaurant.address?.street || "",
        city: selectedRestaurant.address?.city || "",
        state: selectedRestaurant.address?.state || "",
        pincode: selectedRestaurant.address?.pincode || "",
        chef: selectedRestaurant.chef || "",
        phone: selectedRestaurant.phone || "",
        email: selectedRestaurant.email || "",
        website: selectedRestaurant.website || "",
        openingTime: selectedRestaurant.openingTime || "",
        closingTime: selectedRestaurant.closingTime || "",
      });
      setSlotsInput((selectedRestaurant.availableSlots || []).join(", "));
      setTagsInput((selectedRestaurant.tags || []).join(", "));
    } else if (selectedRestaurantId === "new") {
      reset({
        name: "",
        description: "",
        cuisine: "",
        priceRange: "",
        location: "",
        street: "",
        city: "",
        state: "",
        pincode: "",
        chef: "",
        phone: "",
        email: "",
        website: "",
        openingTime: "",
        closingTime: "",
      });
      setSlotsInput("");
      setTagsInput("");
    }
  }, [selectedRestaurant, selectedRestaurantId, reset]);

  // Submit Details (Create or Update)
  const onSubmitDetails = (data) => {
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

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
      tags
    };

    if (selectedRestaurant) {
      dispatch(
        updateRestaurant({ id: selectedRestaurant._id, formData: payload }),
      );
    } else {
      dispatch(createRestaurant(payload))
        .unwrap()
        .then(() => setSelectedRestaurantId(null));
    }
  };

  // Submit Hours & Slots
  const onSubmitHours = (data) => {
    if (!selectedRestaurant) return;

    const availableSlots = slotsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    dispatch(
      setOpeningHours({
        id: selectedRestaurant._id,
        hoursData: {
          openingTime: data.openingTime,
          closingTime: data.closingTime,
          availableSlots,
        },
      }),
    );
  };

  // Image Upload
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file && selectedRestaurant) {
      dispatch(uploadRestaurantImage({ id: selectedRestaurant._id, file }));
    }
  };

  // Delete Action Handler
  const handleConfirmDelete = () => {
    if (!deletingRestaurant) return;
    dispatch(deleteRestaurant(deletingRestaurant._id))
      .unwrap()
      .then(() => {
        setDeletingRestaurant(null);
        if (selectedRestaurantId === deletingRestaurant._id) {
          setSelectedRestaurantId(null);
        }
      })
      .catch(() => {});
  };

  if (myRestaurantsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#B0AA9C]">
        Loading your restaurants...
      </div>
    );
  }

  return (
    <div
      className="bg-[#FDFBF6] min-h-screen pb-16"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="max-w-4xl mx-auto px-5 py-12">
        {/* ================= VIEW 1: RESTAURANT LIST GRID ================= */}
        {selectedRestaurantId === null && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-[13px] uppercase tracking-[0.15em] text-[#B8863B] font-medium mb-1">
                  Owner Dashboard
                </p>
                <h1
                  className="text-[32px] text-[#16281F]"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  My Restaurants
                </h1>
              </div>

              <button
                onClick={() => setSelectedRestaurantId("new")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#16281F] text-[#FDFBF6] text-[13px] font-medium hover:bg-[#3F6B4F] transition-colors"
              >
                <HiOutlinePlus className="text-base" />
                List New Restaurant
              </button>
            </div>

            {myRestaurants?.length === 0 ? (
              <div className="text-center py-20 border border-[#E7E2D6] rounded-2xl bg-white p-8">
                <h2
                  className="text-[22px] text-[#16281F] mb-2"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  No restaurants registered yet
                </h2>
                <p className="text-[14px] text-[#5C5C54] mb-6">
                  Get started by listing your first restaurant location.
                </p>
                <button
                  onClick={() => setSelectedRestaurantId("new")}
                  className="px-6 py-3 rounded-full bg-[#B8863B] text-[#FDFBF6] text-[14px] font-medium hover:bg-[#a3762f] transition-colors"
                >
                  List your restaurant
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-6">
                {myRestaurants.map((res) => (
                  <div
                    key={res._id}
                    className="bg-white border border-[#E7E2D6] rounded-xl overflow-hidden hover:shadow-[0_16px_40px_-20px_rgba(22,40,31,0.2)] transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      {/* Cover Photo */}
                      <div className="aspect-video bg-[#E7E2D6] relative overflow-hidden">
                        {res.image?.url ? (
                          <img
                            src={res.image.url}
                            alt={res.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center text-[#B0AA9C] text-[13px]"
                            style={{ fontFamily: "'Fraunces', serif" }}
                          >
                            {res.name}
                          </div>
                        )}

                        {/* Status Badge */}
                        <div className="absolute top-3 right-3">
                          <span
                            className={`text-[11px] font-medium px-2.5 py-1 rounded-full capitalize shadow-sm ${
                              statusColors[res.status] ||
                              "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {res.status}
                          </span>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-5">
                        <div className="flex items-baseline justify-between mb-1">
                          <h3
                            className="text-[18px] text-[#16281F]"
                            style={{ fontFamily: "'Fraunces', serif" }}
                          >
                            {res.name}
                          </h3>
                          <span className="text-[12px] font-medium text-[#B8863B]">
                            {res.priceRange}
                          </span>
                        </div>

                        <p className="text-[13px] text-[#5C5C54] mb-3">
                          {res.cuisine}
                        </p>

                        <div className="flex items-center text-[#B0AA9C] text-[12px]">
                          <HiOutlineLocationMarker className="text-[#B8863B] shrink-0 mr-1" />
                          <span className="truncate">{res.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Action Footer */}
                    <div className="p-4 bg-[#FDFBF6] border-t border-[#E7E2D6] flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedRestaurantId(res._id);
                          setActiveTab("details");
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[13px] font-medium text-[#16281F] border border-[#E7E2D6] rounded-full hover:bg-[#E7E2D6]/40 transition-colors"
                      >
                        <HiOutlinePencil className="text-sm" />
                        Edit
                      </button>

                      <button
                        onClick={() => {
                          setSelectedRestaurantId(res._id);
                          setActiveTab("hours");
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[13px] font-medium text-[#B8863B] border border-[#B8863B]/30 rounded-full hover:bg-[#B8863B]/10 transition-colors"
                      >
                        <HiOutlineClock className="text-sm" />
                        Slots
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => setDeletingRestaurant(res)}
                        className="w-9 h-9 text.red-600 hover:text-red-700 border border-red-200 hover:bg-red-50 rounded-full transition-colors flex items-center justify-center"
                        title="Delete Restaurant"
                      >
                        <HiOutlineTrash
                          size={18}
                          className="text-base text-red-600"
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= VIEW 2: FORM / EDITOR VIEW ================= */}
        {selectedRestaurantId !== null && (
          <div className="max-w-3xl mx-auto">
            {/* Top Navigation */}
            <button
              onClick={() => setSelectedRestaurantId(null)}
              className="inline-flex items-center gap-2 text-[13px] font-medium text-[#5C5C54] hover:text-[#16281F] mb-6 transition-colors"
            >
              <HiOutlineArrowLeft /> Back to all restaurants
            </button>

            <div className="flex items-center justify-between mb-8">
              <h1
                className="text-[32px] text-[#16281F]"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                {selectedRestaurant
                  ? selectedRestaurant.name
                  : "List new restaurant"}
              </h1>

              <div className="flex items-center gap-3">
                {selectedRestaurant && (
                  <>
                    <span
                      className={`text-[12px] font-medium px-3 py-1.5 rounded-full capitalize ${
                        statusColors[selectedRestaurant.status]
                      }`}
                    >
                      {selectedRestaurant.status}
                    </span>

                    {/* Delete button inside edit view */}
                    <button
                      onClick={() => setDeletingRestaurant(selectedRestaurant)}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-red-200 text-red-600 text-[12px] font-medium hover:bg-red-50 transition-colors"
                    >
                      <HiOutlineTrash className="text-sm" />
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Sub-navigation tabs (if editing existing) */}
            {selectedRestaurant && (
              <div className="flex border-b border-[#E7E2D6] mb-8 gap-6">
                <button
                  onClick={() => setActiveTab("details")}
                  className={`pb-3 text-[14px] font-medium transition-colors border-b-2 ${
                    activeTab === "details"
                      ? "border-[#B8863B] text-[#16281F]"
                      : "border-transparent text-[#5C5C54] hover:text-[#16281F]"
                  }`}
                >
                  Restaurant Details
                </button>
                <button
                  onClick={() => setActiveTab("hours")}
                  className={`pb-3 text-[14px] font-medium transition-colors border-b-2 ${
                    activeTab === "hours"
                      ? "border-[#B8863B] text-[#16281F]"
                      : "border-transparent text-[#5C5C54] hover:text-[#16281F]"
                  }`}
                >
                  Hours & Booking Slots
                </button>
              </div>
            )}

            {/* Photo Section */}
            {selectedRestaurant && activeTab === "details" && (
              <div className="mb-8">
                <div className="aspect-3/1 bg-[#E7E2D6] rounded-xl overflow-hidden mb-3">
                  {selectedRestaurant.image?.url && (
                    <img
                      src={selectedRestaurant.image.url}
                      alt={selectedRestaurant.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <label className="inline-block text-[13px] font-medium text-[#16281F] border border-[#E7E2D6] bg-white rounded-full px-4 py-2 cursor-pointer hover:bg-[#E7E2D6]/30 transition-colors">
                  {actionLoading ? "Uploading..." : "Change photo"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                    disabled={actionLoading}
                  />
                </label>
              </div>
            )}

            {/* FORM TAB 1: DETAILS */}
            {(activeTab === "details" || selectedRestaurantId === "new") && (
              <form
                onSubmit={handleSubmit(onSubmitDetails)}
                className="space-y-4"
              >
                <input
                  {...register("name", { required: true })}
                  placeholder="Restaurant name"
                  className="w-full px-4 py-3 rounded-lg border border-[#E7E2D6] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#B8863B]/40"
                />
                <textarea
                  {...register("description", { required: true })}
                  placeholder="Description"
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-[#E7E2D6] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#B8863B]/40"
                />

                <div className="grid grid-cols-2 gap-3">
                  <input
                    {...register("cuisine", { required: true })}
                    placeholder="Cuisine (e.g. Italian, Japanese)"
                    className="px-4 py-3 rounded-lg border border-[#E7E2D6] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#B8863B]/40"
                  />
                  <select
                    {...register("priceRange", { required: true })}
                    className="px-4 py-3 rounded-lg border border-[#E7E2D6] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#B8863B]/40"
                  >
                    <option value="">Price range</option>
                    {["$", "$$", "$$$", "$$$$"].map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <input
                  {...register("location", { required: true })}
                  placeholder="Location / neighborhood"
                  className="w-full px-4 py-3 rounded-lg border border-[#E7E2D6] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#B8863B]/40"
                />

                <div className="grid grid-cols-2 gap-3">
                  <input
                    {...register("street", { required: true })}
                    placeholder="Street"
                    className="px-4 py-3 rounded-lg border border-[#E7E2D6] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#B8863B]/40"
                  />
                  <input
                    {...register("city", { required: true })}
                    placeholder="City"
                    className="px-4 py-3 rounded-lg border border-[#E7E2D6] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#B8863B]/40"
                  />
                  <input
                    {...register("state", { required: true })}
                    placeholder="State"
                    className="px-4 py-3 rounded-lg border border-[#E7E2D6] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#B8863B]/40"
                  />
                  <input
                    {...register("pincode", { required: true })}
                    placeholder="Pincode"
                    className="px-4 py-3 rounded-lg border border-[#E7E2D6] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#B8863B]/40"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    {...register("chef", { required: true })}
                    placeholder="Head chef"
                    className="px-4 py-3 rounded-lg border border-[#E7E2D6] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#B8863B]/40"
                  />
                  <input
                    {...register("phone", { required: true })}
                    placeholder="Phone"
                    className="px-4 py-3 rounded-lg border border-[#E7E2D6] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#B8863B]/40"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    {...register("email")}
                    placeholder="Email (optional)"
                    className="px-4 py-3 rounded-lg border border-[#E7E2D6] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#B8863B]/40"
                  />
                  <input
                    {...register("website")}
                    placeholder="Website (optional)"
                    className="px-4 py-3 rounded-lg border border-[#E7E2D6] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#B8863B]/40"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#16281F] mb-1.5">
                    Tags{" "}
                    <span className="text-[#B0AA9C] font-normal">
                      (comma-separated)
                    </span>
                  </label>
                  <input
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="Rooftop, Live music, Pet-friendly, Vegan options"
                    className="w-full px-4 py-3 rounded-lg border border-[#E7E2D6] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#B8863B]/40"
                  />
                  {tagsInput && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {tagsInput
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean)
                        .map((tag, i) => (
                          <span
                            key={i}
                            className="text-[11px] px-2.5 py-1 rounded-full bg-[#E7E2D6]/50 text-[#5C5C54]"
                          >
                            {tag}
                          </span>
                        ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full py-3 rounded-full bg-[#16281F] text-[#FDFBF6] text-[14px] font-medium hover:bg-[#3F6B4F] transition-colors disabled:opacity-60 mt-4"
                >
                  {actionLoading
                    ? "Saving..."
                    : selectedRestaurant
                      ? "Save changes"
                      : "Submit for approval"}
                </button>
              </form>
            )}

            {/* FORM TAB 2: HOURS & SLOTS */}
            {selectedRestaurant && activeTab === "hours" && (
              <form
                onSubmit={handleSubmit(onSubmitHours)}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] uppercase tracking-wider text-[#5C5C54] font-medium mb-1.5">
                      Opening Time
                    </label>
                    <input
                      {...register("openingTime")}
                      placeholder="e.g. 09:00 AM"
                      className="w-full px-4 py-3 rounded-lg border border-[#E7E2D6] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#B8863B]/40"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] uppercase tracking-wider text-[#5C5C54] font-medium mb-1.5">
                      Closing Time
                    </label>
                    <input
                      {...register("closingTime")}
                      placeholder="e.g. 11:00 PM"
                      className="w-full px-4 py-3 rounded-lg border border-[#E7E2D6] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#B8863B]/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#16281F] mb-1.5">
                    Available booking slots (comma-separated)
                  </label>
                  <input
                    value={slotsInput}
                    onChange={(e) => setSlotsInput(e.target.value)}
                    placeholder="12:00 PM, 1:00 PM, 7:00 PM, 8:00 PM"
                    className="w-full px-4 py-3 rounded-lg border border-[#E7E2D6] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#B8863B]/40"
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
        )}
      </div>

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      <AnimatePresence>
        {deletingRestaurant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#E7E2D6] rounded-2xl max-w-md w-full p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setDeletingRestaurant(null)}
                className="absolute top-4 right-4 text-[#B0AA9C] hover:text-[#16281F]"
              >
                <HiOutlineX className="text-xl" />
              </button>

              <h3
                className="text-[22px] text-[#16281F] mb-2"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Delete Restaurant?
              </h3>
              <p className="text-[14px] text-[#5C5C54] mb-6 leading-relaxed">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-[#16281F]">
                  "{deletingRestaurant.name}"
                </span>
                ? This will permanently remove its listings, menu data, and
                booking slots.
              </p>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeletingRestaurant(null)}
                  className="px-5 py-2.5 rounded-full border border-[#E7E2D6] text-[13px] font-medium text-[#5C5C54] hover:text-[#16281F]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-full bg-red-600 text-white text-[13px] font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? "Deleting..." : "Yes, Delete Restaurant"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyRestaurant;
