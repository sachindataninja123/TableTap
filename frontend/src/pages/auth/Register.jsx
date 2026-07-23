// src/pages/auth/Register.jsx
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../../features/auth/authSlice";

const Register = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: { role: "user" } });

  const [selectedRole, setSelectedRole] = useState("user");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const password = watch("password");

  const onSubmit = async (data) => {
    const result = await dispatch(registerUser(data));
    if (registerUser.fulfilled.match(result)) {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#FDFBF6] flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-105">
        {/* Header */}
        <div className="mb-8 text-center">
          <p
            className="text-[13px] uppercase tracking-[0.15em] text-[#B8863B] font-medium mb-2"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Join TableTap
          </p>
          <h1
            className="text-[32px] text-[#16281F] leading-tight"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Reserve your <span className="italic text-[#B8863B]">seat</span>
          </h1>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {/* Role toggle — signature element: seating chart style selector */}
          <div>
            <label className="block text-[13px] font-medium text-[#16281F] mb-2">
              I'm joining as
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#E7E2D6]/50 rounded-xl">
              {[
                { value: "user", label: "Diner" },
                { value: "owner", label: "Restaurant Owner" },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`text-center py-2.5 rounded-lg text-[14px] font-medium cursor-pointer transition-all ${
                    selectedRole === option.value
                      ? "bg-[#16281F] text-[#FDFBF6] shadow-sm"
                      : "text-[#5C5C54] hover:text-[#16281F]"
                  }`}
                >
                  <input
                    type="radio"
                    value={option.value}
                    {...register("role")}
                    onChange={() => setSelectedRole(option.value)}
                    checked={selectedRole === option.value}
                    className="sr-only"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-[13px] font-medium text-[#16281F] mb-1.5">
              Full name
            </label>
            <input
              type="text"
              placeholder="Jordan Rivera"
              {...register("name", { required: "Name is required" })}
              className="w-full px-4 py-3 rounded-lg border border-[#E7E2D6] bg-white text-[15px] text-[#16281F] placeholder:text-[#B0AA9C] focus:outline-none focus:ring-2 focus:ring-[#B8863B]/40 focus:border-[#B8863B] transition"
            />
            {errors.name && (
              <p className="mt-1.5 text-[13px] text-[#A63D2F]">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-[13px] font-medium text-[#16281F] mb-1.5">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email",
                },
              })}
              className="w-full px-4 py-3 rounded-lg border border-[#E7E2D6] bg-white text-[15px] text-[#16281F] placeholder:text-[#B0AA9C] focus:outline-none focus:ring-2 focus:ring-[#B8863B]/40 focus:border-[#B8863B] transition"
            />
            {errors.email && (
              <p className="mt-1.5 text-[13px] text-[#A63D2F]">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-[13px] font-medium text-[#16281F] mb-1.5">
              Phone number
            </label>
            <input
              type="tel"
              placeholder="9876543210"
              {...register("phone", {
                required: "Phone number is required",
                minLength: { value: 10, message: "Enter a valid phone number" },
              })}
              className="w-full px-4 py-3 rounded-lg border border-[#E7E2D6] bg-white text-[15px] text-[#16281F] placeholder:text-[#B0AA9C] focus:outline-none focus:ring-2 focus:ring-[#B8863B]/40 focus:border-[#B8863B] transition"
            />
            {errors.phone && (
              <p className="mt-1.5 text-[13px] text-[#A63D2F]">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-[13px] font-medium text-[#16281F] mb-1.5">
              Password
            </label>
            <input
              type="password"
              placeholder="At least 6 characters"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              className="w-full px-4 py-3 rounded-lg border border-[#E7E2D6] bg-white text-[15px] text-[#16281F] placeholder:text-[#B0AA9C] focus:outline-none focus:ring-2 focus:ring-[#B8863B]/40 focus:border-[#B8863B] transition"
            />
            {errors.password && (
              <p className="mt-1.5 text-[13px] text-[#A63D2F]">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label className="block text-[13px] font-medium text-[#16281F] mb-1.5">
              Confirm password
            </label>
            <input
              type="password"
              placeholder="Re-enter password"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === password || "Passwords do not match",
              })}
              className="w-full px-4 py-3 rounded-lg border border-[#E7E2D6] bg-white text-[15px] text-[#16281F] placeholder:text-[#B0AA9C] focus:outline-none focus:ring-2 focus:ring-[#B8863B]/40 focus:border-[#B8863B] transition"
            />
            {errors.confirmPassword && (
              <p className="mt-1.5 text-[13px] text-[#A63D2F]">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-[#16281F] text-[#FDFBF6] text-[15px] font-medium hover:bg-[#3F6B4F] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p
          className="mt-8 text-center text-[14px] text-[#5C5C54]"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#B8863B] font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
