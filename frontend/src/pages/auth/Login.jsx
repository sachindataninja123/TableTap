// src/pages/auth/Login.jsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { loginUser } from "../../features/auth/authSlice";

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, isAuthenticated } = useSelector((state) => state.auth);

  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const onSubmit = (data) => {
    dispatch(loginUser(data));
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#FDFBF6] flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-100">
        {/* Header */}
        <div className="mb-10 text-center">
          <p
            className="text-[13px] uppercase tracking-[0.15em] text-[#B8863B] font-medium mb-2"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Welcome back
          </p>
          <h1
            className="text-[32px] text-[#16281F] leading-tight"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Sign in to your <span className="italic text-[#B8863B]">table</span>
          </h1>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
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
              <p className="mt-1.5 text-[13px] text-[#A63D2F]">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-[13px] font-medium text-[#16281F] mb-1.5">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              {...register("password", {
                required: "Password is required",
              })}
              className="w-full px-4 py-3 rounded-lg border border-[#E7E2D6] bg-white text-[15px] text-[#16281F] placeholder:text-[#B0AA9C] focus:outline-none focus:ring-2 focus:ring-[#B8863B]/40 focus:border-[#B8863B] transition"
            />
            {errors.password && (
              <p className="mt-1.5 text-[13px] text-[#A63D2F]">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-[#16281F] text-[#FDFBF6] text-[15px] font-medium hover:bg-[#3F6B4F] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-8 text-center text-[14px] text-[#5C5C54]" style={{ fontFamily: "'Inter', sans-serif" }}>
          New to TableTap?{" "}
          <Link to="/register" className="text-[#B8863B] font-medium hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;