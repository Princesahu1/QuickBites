import React, { useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { ShoppingCart, Menu } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import CartDrawer from "./CartDrawer";
import ThemeToggle from "./ThemeToggle";
import useAdminOrderNotifications from "../hooks/useAdminOrderNotifications";

export default function Navbar() {
  const { count } = useCart();
  const { user, isAuthenticated, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToAbout = (e) => {
    e.preventDefault();
    if (location.pathname === "/") {
      document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/");
      setTimeout(() => {
        document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
      }, 400);
    }
    setMobile(false);
  };

  // Background polling — notifies admin when new orders arrive
  useAdminOrderNotifications(user);

  const [open, setOpen] = useState(false);
  const [mobile, setMobile] = useState(false);

  // Wait until auth is restored
  if (loading) return null;

  // Dynamic navLinks
  const isAdmin = user?.role === "admin";
  const navLinks = [
    { name: "Home", to: "/" },
    { name: "Menu", to: "/menu" },
    // Customer-only links — hidden for admins
    ...(isAuthenticated && !isAdmin ? [
      { name: "My Orders", to: "/orders" },
      { name: "Checkout", to: "/checkout" },
    ] : []),
  ];

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/");
      setMobile(false);
    } catch {
      toast.error("Logout failed");
    }
  };

  const linkClass = ({ isActive }) =>
    `hover:text-red-600 transition ${
      isActive
        ? "text-red-600 font-semibold"
        : "text-gray-700 dark:text-gray-200"
    }`;

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 w-full bg-white/80 dark:bg-gray-900/70 backdrop-blur-lg shadow-sm z-50"
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="hover:scale-105 transition flex items-center gap-2"
          >
            {/* Inline SVG logo — no external file needed */}
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ef4444"/>
                  <stop offset="100%" stopColor="#f97316"/>
                </linearGradient>
              </defs>
              {/* Circle background */}
              <circle cx="18" cy="18" r="18" fill="url(#bgGrad)"/>
              {/* Burger bun top */}
              <path d="M9 13C9 11.3 13 10 18 10C23 10 27 11.3 27 13H9Z" fill="white" opacity="0.95"/>
              {/* Burger layers */}
              <rect x="9" y="14" width="18" height="3" rx="1" fill="#fbbf24"/>
              <rect x="9" y="18" width="18" height="2.5" rx="1" fill="#84cc16"/>
              <rect x="9" y="21" width="18" height="2.5" rx="1" fill="#ef4444"/>
              {/* Burger bun bottom */}
              <path d="M9 24H27C27 25.7 23 27 18 27C13 27 9 25.7 9 24Z" fill="white" opacity="0.95"/>
              {/* Lightning bolt overlay */}
              <path d="M20 10L15 19H19L17 27L23 17H19L20 10Z" fill="white" opacity="0.3"/>
            </svg>
            <span className="text-xl font-extrabold bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent tracking-tight">
              QuickBite
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 font-medium">
            {navLinks.map((link) => (
              <NavLink key={link.name} to={link.to} className={linkClass}>
                {link.name}
              </NavLink>
            ))}
            <a
              href="/#about"
              onClick={scrollToAbout}
              className="hover:text-red-600 transition text-gray-700 dark:text-gray-200 font-medium cursor-pointer"
            >
              About
            </a>

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700 dark:text-gray-200">
                  Hi, {user?.name || "User"}
                </span>
                {user?.role === "admin" && (
                  <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                      `px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                        isActive
                          ? "bg-purple-600 text-white"
                          : "bg-purple-100 text-purple-700 hover:bg-purple-600 hover:text-white dark:bg-purple-900/40 dark:text-purple-300"
                      }`
                    }
                  >
                    🛠️ Admin
                  </NavLink>
                )}
                <button
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 transition font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link 
                  to="/login" 
                  className="text-gray-700 dark:text-gray-200 hover:text-red-600 transition font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            <button
              onClick={() => setOpen(true)}
              className="relative bg-gradient-to-r from-red-500 to-orange-400 text-white px-3 py-2 rounded-xl shadow hover:from-red-600 hover:to-orange-500"
            >
              <ShoppingCart size={20} />
              {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-xs px-1.5 py-0.5 rounded-full">
                  {count}
                </span>
              )}
            </button>

            <button
              className="md:hidden text-gray-700 dark:text-gray-200"
              onClick={() => setMobile((m) => !m)}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobile && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white dark:bg-gray-900 shadow-inner p-4 border-t dark:border-gray-800"
          >
            <div className="flex flex-col gap-3 font-medium">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.to}
                  onClick={() => setMobile(false)}
                  className={linkClass}
                >
                  {link.name}
                </NavLink>
              ))}
              <a
                href="/#about"
                onClick={scrollToAbout}
                className="hover:text-red-600 transition text-gray-700 dark:text-gray-200 font-medium cursor-pointer"
              >
                About
              </a>

              <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex flex-col gap-3">
                {isAuthenticated ? (
                  <>
                    <span className="text-sm text-gray-700 dark:text-gray-200">
                      Hi, {user?.name || "User"}
                    </span>
                    {user?.role === "admin" && (
                      <NavLink
                        to="/admin"
                        onClick={() => setMobile(false)}
                        className={({ isActive }) =>
                          `px-4 py-2 rounded-xl text-sm font-semibold text-center transition ${
                            isActive
                              ? "bg-purple-600 text-white"
                              : "bg-purple-100 text-purple-700 hover:bg-purple-600 hover:text-white dark:bg-purple-900/40 dark:text-purple-300"
                          }`
                        }
                      >
                        🛠️ Admin Dashboard
                      </NavLink>
                    )}
                    <button
                      onClick={handleLogout}
                      className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-xl hover:from-orange-600 hover:to-red-600 transition font-medium shadow text-center"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/login" 
                      onClick={() => setMobile(false)}
                      className="text-gray-700 dark:text-gray-200 hover:text-red-600 transition"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobile(false)}
                      className="bg-red-500 text-white px-4 py-2 rounded-xl text-center hover:bg-red-600 transition font-medium"
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </motion.nav>

      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}