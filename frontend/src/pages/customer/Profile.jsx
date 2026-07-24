import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineBadgeCheck,
  HiOutlineShieldCheck,
  HiOutlineLogout,
  HiOutlineCheck,
  HiOutlineLockClosed,
  HiOutlineCamera,
  HiOutlineTrash,
  HiOutlineX,
} from "react-icons/hi";
import { logoutUser } from "../../features/auth/authSlice";
import {
  updateProfile,
  changePassword,
  updateAvatar,
  deleteAccount,
} from "../../features/user/userSlice";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { loading, avatarLoading } = useSelector((state) => state.user);

  // Normalize user object handling state response structure
  const userData = user?.data || user || {};

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // --- React Hook Form: Profile Info ---
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfile,
    formState: { errors: profileErrors, isDirty: isProfileDirty },
  } = useForm({
    defaultValues: {
      name: userData?.name || "",
      email: userData?.email || "",
      phone: userData?.phone || "",
    },
  });

  // --- React Hook Form: Change Password ---
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    watch,
    formState: { errors: passwordErrors },
  } = useForm({
    defaultValues: {
      oldPass: "",
      newPass: "",
      confirmPass: "",
    },
  });

  // Sync profile form defaults when user data changes
  useEffect(() => {
    if (userData) {
      resetProfile({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
      });
    }
  }, [userData, resetProfile]);

  // Handle Profile Details Update (Name & Phone)
  const onProfileSubmit = (data) => {
    // Only send name & phone per backend controller
    dispatch(updateProfile({ name: data.name, phone: data.phone }))
      .unwrap()
      .then(() => setIsEditing(false))
      .catch(() => {});
  };

  // Handle Password Change
  const onPasswordSubmit = (data) => {
    dispatch(
      changePassword({ oldPass: data.oldPass, newPass: data.newPass })
    )
      .unwrap()
      .then(() => resetPassword())
      .catch(() => {});
  };

  // Handle Avatar Image Selection & Upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      dispatch(updateAvatar(file));
    }
  };

  // Handle Account Deletion
  const handleDeleteAccount = () => {
    dispatch(deleteAccount())
      .unwrap()
      .then(() => {
        dispatch(logoutUser());
      })
      .catch(() => {});
  };

  const formattedRole = userData?.role
    ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1)
    : "Member";

  return (
    <div
      className="min-h-screen bg-[#FDFBF6] py-12 md:py-16"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="max-w-4xl mx-auto px-5">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <p className="text-[13px] uppercase tracking-[0.15em] text-[#B8863B] font-medium mb-2">
            Account Management
          </p>
          <h1
            className="text-[36px] md:text-[44px] text-[#16281F] leading-tight"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Your <span className="italic text-[#B8863B]">Profile</span>
          </h1>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* ================= LEFT SIDEBAR ================= */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6"
          >
            {/* Identity & Avatar Card */}
            <div className="bg-white border border-[#E7E2D6] rounded-2xl p-6 shadow-[0_10px_30px_-15px_rgba(22,40,31,0.1)] text-center">
              <div className="relative w-24 h-24 mx-auto mb-4 group">
                {userData?.avatar?.url ? (
                  <img
                    src={userData.avatar.url}
                    alt={userData?.name}
                    className="w-full h-full rounded-full object-cover border-2 border-[#B8863B]"
                  />
                ) : (
                  <div
                    className="w-full h-full rounded-full bg-[#16281F] text-[#FDFBF6] flex items-center justify-center text-[32px] font-medium shadow-sm"
                    style={{ fontFamily: "'Fraunces', serif" }}
                  >
                    {userData?.name ? userData.name.charAt(0).toUpperCase() : "U"}
                  </div>
                )}

                {/* Avatar Overlay Button */}
                <label
                  htmlFor="avatarUpload"
                  className="absolute inset-0 bg-[#16281F]/60 rounded-full flex flex-col items-center justify-center text-white text-[11px] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <HiOutlineCamera className="text-xl mb-0.5" />
                  {avatarLoading ? "Uploading..." : "Change"}
                </label>
                <input
                  type="file"
                  id="avatarUpload"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={avatarLoading}
                />
              </div>

              <h2
                className="text-[20px] text-[#16281F] mb-1 truncate"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                {userData?.name || "Guest User"}
              </h2>
              <p className="text-[13px] text-[#5C5C54] mb-4 truncate">
                {userData?.email || "No email provided"}
              </p>

              {/* Role Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FDFBF6] border border-[#E7E2D6]">
                <HiOutlineShieldCheck className="text-[#B8863B] text-sm" />
                <span className="text-[12px] font-medium text-[#16281F] tracking-wide uppercase">
                  {formattedRole}
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white border border-[#E7E2D6] rounded-2xl p-2 flex flex-col gap-1">
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium transition-colors text-left ${
                  activeTab === "overview"
                    ? "bg-[#16281F] text-[#FDFBF6]"
                    : "text-[#5C5C54] hover:bg-[#FDFBF6] hover:text-[#16281F]"
                }`}
              >
                <HiOutlineUser className="text-lg" />
                Account Overview
              </button>

              <button
                onClick={() => setActiveTab("security")}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium transition-colors text-left ${
                  activeTab === "security"
                    ? "bg-[#16281F] text-[#FDFBF6]"
                    : "text-[#5C5C54] hover:bg-[#FDFBF6] hover:text-[#16281F]"
                }`}
              >
                <HiOutlineLockClosed className="text-lg" />
                Security & Password
              </button>

              <button
                onClick={() => setActiveTab("role")}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium transition-colors text-left ${
                  activeTab === "role"
                    ? "bg-[#16281F] text-[#FDFBF6]"
                    : "text-[#5C5C54] hover:bg-[#FDFBF6] hover:text-[#16281F]"
                }`}
              >
                <HiOutlineBadgeCheck className="text-lg" />
                Account Details & Role
              </button>

              <button
                onClick={() => dispatch(logoutUser())}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium text-red-600 hover:bg-red-50 transition-colors text-left mt-2 border-t border-[#E7E2D6]/60 pt-3"
              >
                <HiOutlineLogout className="text-lg" />
                Sign Out
              </button>
            </div>
          </motion.div>

          {/* ================= RIGHT MAIN CONTENT ================= */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="md:col-span-2"
          >
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="bg-white border border-[#E7E2D6] rounded-2xl p-7 shadow-[0_10px_30px_-15px_rgba(22,40,31,0.08)]">
                <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#E7E2D6]">
                  <div>
                    <h3
                      className="text-[22px] text-[#16281F]"
                      style={{ fontFamily: "'Fraunces', serif" }}
                    >
                      Personal Details
                    </h3>
                    <p className="text-[13px] text-[#5C5C54] mt-0.5">
                      Update your personal information and contact details.
                    </p>
                  </div>
                  {!isEditing ? (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 rounded-full border border-[#B8863B] text-[#B8863B] text-[13px] font-medium hover:bg-[#B8863B] hover:text-white transition-colors"
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        resetProfile();
                      }}
                      className="px-4 py-2 rounded-full border border-[#E7E2D6] text-[#5C5C54] text-[13px] font-medium hover:text-[#16281F] transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="space-y-5">
                  <div>
                    <label className="block text-[12px] uppercase tracking-wider text-[#5C5C54] font-medium mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <HiOutlineUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B8863B] text-lg" />
                      <input
                        type="text"
                        disabled={!isEditing}
                        {...registerProfile("name", {
                          required: "Name is required",
                        })}
                        className="w-full pl-10 pr-4 py-3 text-[14px] text-[#16281F] bg-[#FDFBF6] border border-[#E7E2D6] rounded-xl focus:outline-none focus:border-[#B8863B] disabled:opacity-75 disabled:bg-gray-50/50 transition"
                      />
                    </div>
                    {profileErrors.name && (
                      <p className="text-red-500 text-[12px] mt-1">
                        {profileErrors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[12px] uppercase tracking-wider text-[#5C5C54] font-medium mb-2">
                      Email Address (Read-only)
                    </label>
                    <div className="relative">
                      <HiOutlineMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B0AA9C] text-lg" />
                      <input
                        type="email"
                        disabled
                        {...registerProfile("email")}
                        className="w-full pl-10 pr-4 py-3 text-[14px] text-[#16281F] bg-gray-50/60 border border-[#E7E2D6] rounded-xl cursor-not-allowed opacity-75"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] uppercase tracking-wider text-[#5C5C54] font-medium mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <HiOutlinePhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B8863B] text-lg" />
                      <input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        disabled={!isEditing}
                        {...registerProfile("phone")}
                        className="w-full pl-10 pr-4 py-3 text-[14px] text-[#16281F] bg-[#FDFBF6] border border-[#E7E2D6] rounded-xl focus:outline-none focus:border-[#B8863B] disabled:opacity-75 disabled:bg-gray-50/50 transition"
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="pt-4 flex justify-end">
                      <button
                        type="submit"
                        disabled={loading || !isProfileDirty}
                        className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#16281F] text-[#FDFBF6] text-[14px] font-medium hover:bg-[#3F6B4F] transition-colors disabled:opacity-50"
                      >
                        {loading ? (
                          "Saving..."
                        ) : (
                          <>
                            <HiOutlineCheck className="text-lg" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* SECURITY TAB (CHANGE PASSWORD) */}
            {activeTab === "security" && (
              <div className="bg-white border border-[#E7E2D6] rounded-2xl p-7 shadow-[0_10px_30px_-15px_rgba(22,40,31,0.08)]">
                <div className="pb-6 mb-6 border-b border-[#E7E2D6]">
                  <h3
                    className="text-[22px] text-[#16281F]"
                    style={{ fontFamily: "'Fraunces', serif" }}
                  >
                    Change Password
                  </h3>
                  <p className="text-[13px] text-[#5C5C54] mt-0.5">
                    Ensure your account stays secure with a strong password.
                  </p>
                </div>

                <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-5">
                  <div>
                    <label className="block text-[12px] uppercase tracking-wider text-[#5C5C54] font-medium mb-2">
                      Old Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      {...registerPassword("oldPass", {
                        required: "Old password is required",
                      })}
                      className="w-full px-4 py-3 text-[14px] text-[#16281F] bg-[#FDFBF6] border border-[#E7E2D6] rounded-xl focus:outline-none focus:border-[#B8863B] transition"
                    />
                    {passwordErrors.oldPass && (
                      <p className="text-red-500 text-[12px] mt-1">
                        {passwordErrors.oldPass.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[12px] uppercase tracking-wider text-[#5C5C54] font-medium mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Minimum 6 characters"
                      {...registerPassword("newPass", {
                        required: "New password is required",
                        minLength: {
                          value: 6,
                          message: "Password must be at least 6 characters",
                        },
                      })}
                      className="w-full px-4 py-3 text-[14px] text-[#16281F] bg-[#FDFBF6] border border-[#E7E2D6] rounded-xl focus:outline-none focus:border-[#B8863B] transition"
                    />
                    {passwordErrors.newPass && (
                      <p className="text-red-500 text-[12px] mt-1">
                        {passwordErrors.newPass.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[12px] uppercase tracking-wider text-[#5C5C54] font-medium mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Repeat new password"
                      {...registerPassword("confirmPass", {
                        required: "Please confirm your password",
                        validate: (val) =>
                          val === watch("newPass") || "Passwords do not match",
                      })}
                      className="w-full px-4 py-3 text-[14px] text-[#16281F] bg-[#FDFBF6] border border-[#E7E2D6] rounded-xl focus:outline-none focus:border-[#B8863B] transition"
                    />
                    {passwordErrors.confirmPass && (
                      <p className="text-red-500 text-[12px] mt-1">
                        {passwordErrors.confirmPass.message}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#16281F] text-[#FDFBF6] text-[14px] font-medium hover:bg-[#3F6B4F] transition-colors disabled:opacity-50"
                    >
                      {loading ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ROLE & DANGER ZONE TAB */}
            {activeTab === "role" && (
              <div className="space-y-6">
                <div className="bg-white border border-[#E7E2D6] rounded-2xl p-7 shadow-[0_10px_30px_-15px_rgba(22,40,31,0.08)]">
                  <h3
                    className="text-[22px] text-[#16281F] mb-1"
                    style={{ fontFamily: "'Fraunces', serif" }}
                  >
                    Permissions & Role
                  </h3>
                  <p className="text-[13px] text-[#5C5C54] mb-6">
                    Account identification and system capabilities.
                  </p>

                  <div className="p-5 border border-[#E7E2D6] rounded-xl bg-[#FDFBF6] space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[13px] text-[#5C5C54]">User ID</span>
                      <span className="text-[13px] font-mono text-[#16281F]">
                        {userData?._id || "N/A"}
                      </span>
                    </div>
                    <div className="border-t border-[#E7E2D6]" />
                    <div className="flex justify-between items-center">
                      <span className="text-[13px] text-[#5C5C54]">Current Role</span>
                      <span className="text-[13px] font-medium text-[#B8863B] uppercase">
                        {formattedRole}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-red-50/50 border border-red-200/60 rounded-2xl p-7">
                  <h3
                    className="text-[20px] text-red-900 mb-1"
                    style={{ fontFamily: "'Fraunces', serif" }}
                  >
                    Danger Zone
                  </h3>
                  <p className="text-[13px] text-red-700 mb-5">
                    Deleting your account is permanent. All reservations and personal data will be erased.
                  </p>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-600 text-white text-[13px] font-medium hover:bg-red-700 transition-colors"
                  >
                    <HiOutlineTrash className="text-base" />
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#E7E2D6] rounded-2xl max-w-md w-full p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setShowDeleteModal(false)}
                className="absolute top-4 right-4 text-[#B0AA9C] hover:text-[#16281F]"
              >
                <HiOutlineX className="text-xl" />
              </button>

              <h3
                className="text-[22px] text-[#16281F] mb-2"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Are you absolutely sure?
              </h3>
              <p className="text-[14px] text-[#5C5C54] mb-6 leading-relaxed">
                This action cannot be undone. Your profile, avatars, and history will be deleted immediately.
              </p>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-5 py-2.5 rounded-full border border-[#E7E2D6] text-[13px] font-medium text-[#5C5C54]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className="px-5 py-2.5 rounded-full bg-red-600 text-white text-[13px] font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Deleting..." : "Yes, Delete Account"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;