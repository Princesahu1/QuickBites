import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import FoodCard from "../components/FoodCard";
import Footer from "../components/Footer";
import { menuService } from "../services/menuService";

export default function Home() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        const response = await menuService.getAllItems();
        
        if (response.success && response.data) {
          setMenuItems(response.data);
        } else {
          setError("Failed to load menu items");
        }
      } catch (err) {
        console.error("Error fetching menu:", err);
        setError("Failed to load menu items");
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  return (
    <>
      {/* 🏠 HERO SECTION */}
      <section className="bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 pt-20">
        <div className="max-w-6xl mx-auto px-4 py-20 grid md:grid-cols-2 gap-10 items-center">

          {/* ✨ HERO TEXT */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white leading-tight">
              Fast, Tasty & On-Time{" "}
              <span className="text-red-600">QuickBite!</span>
            </h1>
            <p className="mt-4 text-gray-600 dark:text-gray-300 text-lg">
              Order your favorite canteen meals and pick them up hot & fresh.
            </p>

            <div className="mt-6 flex gap-4">
              <Link
                to="/menu"
                className="bg-gradient-to-r from-red-500 to-orange-400 text-white px-6 py-3 rounded-xl shadow hover:from-red-600 hover:to-orange-500 transition"
              >
                Browse Menu
              </Link>

              <a
                href="#popular"
                className="border border-gray-300 dark:border-gray-700 px-6 py-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                Popular
              </a>
            </div>
          </motion.div>

          {/* 🖼️ HERO LOGO */}
          <div className="relative hidden md:flex items-center justify-center">
            {/* Outer glow ring */}
            <motion.div
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-80 h-80 rounded-full bg-gradient-to-br from-red-400/30 to-orange-300/20 blur-3xl"
            />

            {/* Logo SVG — large hero version */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="relative z-10 drop-shadow-2xl"
            >
              <svg width="320" height="320" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="heroGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#ef4444"/>
                    <stop offset="100%" stopColor="#f97316"/>
                  </linearGradient>
                  <filter id="shadow">
                    <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#ef444440"/>
                  </filter>
                </defs>
                {/* Plate / circle base */}
                <circle cx="100" cy="100" r="95" fill="url(#heroGrad)" filter="url(#shadow)"/>
                <circle cx="100" cy="100" r="85" fill="none" stroke="white" strokeWidth="2" opacity="0.2"/>

                {/* Bun top */}
                <ellipse cx="100" cy="72" rx="48" ry="18" fill="#FDE68A"/>
                <ellipse cx="100" cy="65" rx="48" ry="12" fill="#FBBF24"/>
                {/* Sesame seeds */}
                <ellipse cx="90" cy="62" rx="4" ry="2.5" fill="#F59E0B" transform="rotate(-20 90 62)"/>
                <ellipse cx="105" cy="60" rx="4" ry="2.5" fill="#F59E0B" transform="rotate(10 105 60)"/>
                <ellipse cx="118" cy="63" rx="4" ry="2.5" fill="#F59E0B" transform="rotate(-15 118 63)"/>

                {/* Patty */}
                <rect x="52" y="85" width="96" height="14" rx="5" fill="#92400E"/>
                <rect x="52" y="85" width="96" height="7" rx="3" fill="#A16207"/>

                {/* Cheese */}
                <rect x="48" y="98" width="104" height="8" rx="2" fill="#FCD34D"/>
                <polygon points="48,106 44,112 52,106" fill="#FCD34D"/>
                <polygon points="152,106 156,112 148,106" fill="#FCD34D"/>

                {/* Lettuce */}
                <path d="M52 107 Q65 113 78 107 Q91 113 104 107 Q117 113 130 107 Q143 113 148 107" stroke="#4ADE80" strokeWidth="5" fill="none" strokeLinecap="round"/>

                {/* Tomato */}
                <rect x="55" y="114" width="90" height="8" rx="3" fill="#F87171"/>

                {/* Bun bottom */}
                <ellipse cx="100" cy="128" rx="50" ry="10" fill="#FBBF24"/>
                <ellipse cx="100" cy="133" rx="50" ry="9" fill="#F59E0B"/>

                {/* Lightning bolt */}
                <path d="M108 54L90 90H104L96 126L116 82H102L108 54Z" fill="white" opacity="0.35"/>
              </svg>
            </motion.div>

            {/* Floating label badge */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 shadow-xl rounded-2xl px-4 py-2 z-20 flex items-center gap-2"
            >
              <span className="text-2xl">⚡</span>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Ready in</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">15 mins</p>
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* 🍕 POPULAR SECTION */}
      <section id="popular" className="w-full bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
            Popular Dishes
          </h2>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 bg-red-500 text-white px-6 py-2 rounded-xl hover:bg-red-600 transition"
            >
              Retry
            </button>
          </div>
        ) : menuItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 dark:text-gray-400">No menu items available</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {menuItems.slice(0, 8).map((food) => (
              <FoodCard key={food._id} food={food} />
            ))}
          </div>
        )}
        </div>
      </section>

      <Footer />

      {/* ── ABOUT US ─────────────────────────────────────────────── */}
      <section id="about" className="bg-gradient-to-br from-gray-50 via-white to-orange-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-20 px-4">
        <div className="max-w-6xl mx-auto">

          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="inline-block bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              Our Story
            </span>
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              About <span className="text-red-600">QuickBite</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              We're on a mission to make campus dining effortless — fresh, hot meals
              ready when you are, without the wait.
            </p>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
          >
            {[
              { value: "100+", label: "Menu Items",   emoji: "🍽️" },
              { value: "500+", label: "Happy Students", emoji: "😊" },
              { value: "15 min", label: "Avg. Ready Time", emoji: "⚡" },
              { value: "9+",   label: "Categories",   emoji: "🗂️" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center shadow-md border border-gray-100 dark:border-gray-700"
              >
                <div className="text-3xl mb-2">{stat.emoji}</div>
                <div className="text-3xl font-extrabold text-red-600 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Mission + Image side by side */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            {/* Text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Why QuickBite?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                Born in a college campus, QuickBite was built to solve one simple problem — 
                long canteen queues eating into your break time. We built a seamless digital 
                ordering system so you can order, pay, and pick up — all in minutes.
              </p>
              <ul className="space-y-3">
                {[
                  { icon: "🚀", title: "Lightning Fast",  desc: "Order in seconds, pick up in minutes" },
                  { icon: "🥗", title: "Fresh & Hygienic", desc: "Made to order, never sitting for hours" },
                  { icon: "💳", title: "Cashless & Easy",  desc: "No queues, no cash, no hassle" },
                  { icon: "📱", title: "Real-time Tracking", desc: "Know exactly when your food is ready" },
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <span className="text-2xl mt-0.5">{item.icon}</span>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{item.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Visual card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-red-500 to-orange-400 rounded-3xl p-8 text-white shadow-2xl">
                <div className="text-6xl mb-4">🍔</div>
                <h4 className="text-2xl font-bold mb-2">Our Promise</h4>
                <p className="text-red-100 mb-6 leading-relaxed">
                  Every meal is prepared fresh with quality ingredients. We partner with 
                  the best canteen chefs to bring you authentic flavors you love.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: "✅", text: "Fresh ingredients" },
                    { icon: "✅", text: "Zero wait queues" },
                    { icon: "✅", text: "Affordable prices" },
                    { icon: "✅", text: "Student-friendly" },
                  ].map((p, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span>{p.icon}</span>
                      <span className="text-red-100">{p.text}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Decorative floating badge */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 shadow-xl rounded-2xl px-4 py-2 flex items-center gap-2"
              >
                <span className="text-yellow-500 text-xl">⭐</span>
                <div>
                  <p className="text-xs text-gray-500">Student Rating</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">4.8 / 5.0</p>
                </div>
              </motion.div>
            </motion.div>
          </div>

        </div>
      </section>
    </>
  );
}