import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { HiMenu, HiX } from "react-icons/hi";
import { logoutUser } from "../../features/auth/authSlice";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hovered, setHovered] = useState(null);

  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  console.log(user , isAuthenticated)

  const publicLinks = [{ label: "Restaurants", to: "/restaurants" }];

  const roleLinks = {
    user: [{ label: "My Bookings", to: "/my-bookings" }],
    owner: [
      { label: "Dashboard", to: "/owner/dashboard" },
      { label: "My Restaurant", to: "/owner/restaurant" },
      { label: "Bookings", to: "/owner/bookings" },
    ],
    admin: [
      { label: "Dashboard", to: "/admin/dashboard" },
      { label: "Restaurants", to: "/admin/restaurants" },
      { label: "Users", to: "/admin/users" },
    ],
  };

  const navLinks = [
    ...publicLinks,
    ...(isAuthenticated && user?.role ? roleLinks[user.role] || [] : []),
  ];

  const handleLogout = () => {
    dispatch(logoutUser());
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#FDFBF6]/95 backdrop-blur border-b border-[#E7E2D6]">
      <div className="max-w-6xl mx-auto px-5">
        <div className="flex items-center justify-between h-16">
          {/* Wordmark */}
          <Link
            to="/"
            className="text-[22px] leading-none text-[#16281F]"
            style={{ fontFamily: "'Fraunces', serif" }}
            onClick={() => setIsOpen(false)}
          >
            Table<span className="italic text-[#B8863B]">Tap</span>
          </Link>

          {/* Desktop nav — signature sliding brass indicator */}
          <div
            className="hidden md:flex items-center gap-1 relative"
            style={{ fontFamily: "'Inter', sans-serif" }}
            onMouseLeave={() => setHovered(null)}
          >
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onMouseEnter={() => setHovered(link.to)}
                className={({ isActive }) =>
                  `relative px-4 py-2 text-[13px] font-medium tracking-wide uppercase transition-colors ${
                    isActive
                      ? "text-[#16281F]"
                      : "text-[#5C5C54] hover:text-[#16281F]"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {link.label}
                    {(hovered === link.to ||
                      (isActive && hovered === null)) && (
                      <motion.div
                        layoutId="navIndicator"
                        className="absolute left-3 right-3 -bottom-px h-0.5 bg-[#B8863B]"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* Desktop auth actions */}
          <div
            className="hidden md:flex items-center gap-3"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="text-[13px] font-medium uppercase px-4 py-2 rounded-full hover:bg-[#16281F] text-[#FDFBF6] bg-[#3F6B4F] transition-colors"
                >
                  {user?.name?.split(" ")[0] || "Profile"}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-[13px] font-medium px-4 py-2 rounded-full bg-[#16281F] text-[#FDFBF6] hover:bg-[#3F6B4F] transition-colors"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-[13px] font-medium text-[#5C5C54] hover:text-[#16281F] transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="text-[13px] font-medium px-4 py-2 rounded-full bg-[#B8863B] text-[#FDFBF6] hover:bg-[#a3762f] transition-colors"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-[#16281F] text-2xl"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <HiX /> : <HiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden overflow-hidden bg-[#16281F]"
          >
            <div
              className="px-5 py-4 flex flex-col gap-1"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `py-3 text-[15px] font-medium border-b border-white/10 ${
                      isActive ? "text-[#B8863B]" : "text-[#FDFBF6]/90"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="py-3 text-[15px] font-medium text-[#FDFBF6]/90 border-b border-white/10"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="mt-3 py-3 rounded-full bg-[#B8863B] text-[#16281F] font-medium text-[15px]"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <div className="flex gap-3 mt-3">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 text-center py-3 rounded-full border border-[#FDFBF6]/30 text-[#FDFBF6] text-[15px] font-medium"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 text-center py-3 rounded-full bg-[#B8863B] text-[#16281F] text-[15px] font-medium"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
