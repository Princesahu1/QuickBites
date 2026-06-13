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
    `px-3 py-2 rounded-xl transition-all duration-300 ${
      isActive
        ? "bg-coral-50 dark:bg-dark-border text-coral-600 dark:text-coral-400 font-semibold"
        : "text-gray-600 dark:text-gray-300 hover:text-coral-500 dark:hover:text-coral-400 hover:bg-gray-50 dark:hover:bg-gray-800"
    }`;

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 w-full glass z-50 transition-all duration-300"
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="hover:scale-105 transition-transform flex items-center gap-2 group"
          >
            <div className="bg-coral-50 dark:bg-dark-card p-1.5 rounded-xl border border-coral-200 dark:border-dark-border group-hover:shadow-lg transition-shadow">
              <span className="text-2xl font-extrabold bg-gradient-to-r from-coral-400 to-coral-600 bg-clip-text text-transparent tracking-tight">
                QB.
              </span>
            </div>
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
              className="text-gray-600 dark:text-gray-300 hover:text-coral-500 dark:hover:text-coral-400 transition-colors font-medium cursor-pointer"
            >
              About
            </a>

            {isAuthenticated ? (
              <div className="flex items-center gap-4 border-l border-gray-200 dark:border-gray-700 pl-4 ml-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                  Hi, {user?.name || "User"}
                </span>
                {user?.role === "admin" && (
                  <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                      `px-3 py-1.5 rounded-lg text-sm font-bold transition-all shadow-sm ${
                        isActive
                          ? "bg-purple-600 text-white shadow-purple-500/30"
                          : "bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white dark:bg-purple-900/30 dark:text-purple-400"
                      }`
                    }
                  >
                    Admin
                  </NavLink>
                )}
                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-red-500 transition-colors font-medium text-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 border-l border-gray-200 dark:border-gray-700 pl-4 ml-2">
                <Link 
                  to="/login" 
                  className="text-gray-600 dark:text-gray-300 hover:text-coral-500 transition-colors font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm py-1.5 px-4"
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
              className="relative p-2 text-gray-700 dark:text-gray-200 hover:bg-coral-50 dark:hover:bg-gray-800 rounded-full transition-colors group"
            >
              <ShoppingCart size={22} className="group-hover:text-coral-500 transition-colors" />
              {count > 0 && (
                <span className="absolute 0 right-0 top-0 bg-coral-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full shadow-md animate-bounce">
                  {count}
                </span>
              )}
            </button>

            <button
              className="md:hidden p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              onClick={() => setMobile((m) => !m)}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobile && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-dark-card border-t border-gray-100 dark:border-dark-border"
          >
            <div className="flex flex-col gap-3 font-medium p-4">
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
                className="text-gray-600 dark:text-gray-300 hover:text-coral-500 transition-colors py-2"
              >
                About
              </a>

              <div className="pt-3 mt-2 border-t border-gray-100 dark:border-dark-border flex flex-col gap-3">
                {isAuthenticated ? (
                  <>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-xl text-center">
                      Hi, {user?.name || "User"}
                    </span>
                    {user?.role === "admin" && (
                      <NavLink
                        to="/admin"
                        onClick={() => setMobile(false)}
                        className="btn-secondary text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900 border"
                      >
                        Admin Dashboard
                      </NavLink>
                    )}
                    <button
                      onClick={handleLogout}
                      className="btn-primary flex-1"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Link 
                      to="/login" 
                      onClick={() => setMobile(false)}
                      className="btn-secondary text-center"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobile(false)}
                      className="btn-primary text-center"
                    >
                      Register
                    </Link>
                  </div>
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