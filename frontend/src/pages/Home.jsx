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
    <main className="min-h-screen bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-gray-100">
      {/* 🏠 HERO SECTION */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Decorative Blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[50%] bg-coral-400/20 dark:bg-coral-900/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen" />
          <div className="absolute top-[20%] right-[-10%] w-[50%] h-[60%] bg-yellow-400/20 dark:bg-amber-900/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen" />
        </div>

        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          {/* ✨ HERO TEXT */}
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="z-10"
          >
            <div className="inline-block px-4 py-1.5 rounded-full bg-coral-50 dark:bg-dark-card border border-coral-200 dark:border-dark-border mb-6 shadow-sm">
              <span className="text-sm font-bold text-coral-600 dark:text-coral-400 tracking-wide uppercase">⚡ The Ultimate Dining Experience</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold font-display leading-[1.1] mb-6 tracking-tight text-gray-900 dark:text-white">
              Crave it? <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-coral-400 to-coral-600">Click it.</span> <br/>
              Devour it.
            </h1>
            <p className="mb-8 text-gray-600 dark:text-gray-400 text-lg md:text-xl font-medium max-w-lg leading-relaxed">
              Skip the line and order your favorite campus meals with ease. Fresh, hot, and ready when you are.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/menu" className="btn-primary text-lg py-3.5 px-8 shadow-coral-500/40">
                Explore Menu
              </Link>
              <a href="#popular" className="btn-secondary text-lg py-3.5 px-8">
                Popular Dishes
              </a>
            </div>
            
            <div className="mt-10 flex items-center gap-4 text-sm font-semibold text-gray-500 dark:text-gray-400">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`w-10 h-10 rounded-full border-2 border-white dark:border-dark-bg bg-gray-200 dark:bg-gray-800 flex items-center justify-center font-bold text-xs ${i===4 ? 'bg-coral-50 text-coral-600' : ''}`}>
                    {i===4 ? '5k+' : '👤'}
                  </div>
                ))}
              </div>
              <p>Trusted by <span className="text-gray-900 dark:text-white font-bold">5,000+</span> hungry students</p>
            </div>
          </motion.div>

          {/* 🖼️ HERO VISUAL */}
          <div className="relative hidden md:flex items-center justify-center h-[500px]">
             {/* Center visual elements */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative z-10 w-[380px] h-[380px] rounded-full glass flex items-center justify-center shadow-2xl p-8 border border-white/40 dark:border-white/10"
              >
                  {/* Decorative Burger SVG inside Glass Circle */}
                  <img 
                    src="/hero-burger.png" 
                    alt="Premium Delicious Burger" 
                    className="w-full h-full object-cover rounded-full drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                  />
              </motion.div>

              {/* Floating logic */}
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 glass-card px-6 py-4 rounded-2xl z-20 flex items-center gap-3 backdrop-blur-xl"
              >
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 text-xl">
                  🍃
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Freshness</p>
                  <p className="text-sm font-extrabold text-gray-900 dark:text-white">100% Guaranteed</p>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [10, -10, 10] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-10 -left-10 glass-card px-6 py-4 rounded-2xl z-20 flex items-center gap-3 backdrop-blur-xl"
              >
                <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600 dark:text-yellow-400 text-xl">
                  ⚡
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Speed</p>
                  <p className="text-sm font-extrabold text-gray-900 dark:text-white">Under 15 Mins</p>
                </div>
              </motion.div>
          </div>
        </div>
      </section>

      {/* 🍕 POPULAR SECTION */}
      <section id="popular" className="w-full py-24 relative">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <span className="text-coral-500 font-bold tracking-wider uppercase text-sm mb-2 block">Trending</span>
              <h2 className="text-4xl md:text-5xl font-display font-extrabold text-gray-900 dark:text-white tracking-tight">
                Most Popular Dishes
              </h2>
            </div>
            <Link to="/menu" className="group flex items-center gap-2 text-coral-500 font-bold hover:text-coral-600 transition-colors">
              View Full Menu 
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-coral-200 border-t-coral-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20 glass-card max-w-lg mx-auto">
            <p className="text-red-500 dark:text-red-400 font-bold mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="btn-primary mx-auto"
            >
              Retry Connection
            </button>
          </div>
        ) : menuItems.length === 0 ? (
          <div className="text-center py-20 glass-card">
            <p className="text-gray-500 font-medium text-lg">No menu items available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {menuItems.slice(0, 8).map((food, index) => (
              <motion.div 
                key={food._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {/* Food Card map below */}
                <FoodCard food={food} />
              </motion.div>
            ))}
          </div>
        )}
        </div>
      </section>

      {/* ── ABOUT US ─────────────────────────────────────────────── */}
      <section id="about" className="py-24 bg-white dark:bg-[#111113] relative overflow-hidden border-t border-gray-100 dark:border-dark-border">
        
        {/* Background gradient circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-coral-50/50 dark:bg-coral-900/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 relative z-10">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <span className="text-coral-500 font-bold tracking-wider uppercase text-sm mb-3 block">Our Story</span>
            <h2 className="text-4xl md:text-5xl font-extrabold font-display text-gray-900 dark:text-white mb-6">
              Reimagining Campus Dining
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-medium">
              We're on a mission to make campus food effortless — bringing you premium, hot meals without the endless queues.
            </p>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24"
          >
            {[
              { value: "100+", label: "Menu Items",   emoji: "🍽️" },
              { value: "5k+",  label: "Happy Students", emoji: "🎓" },
              { value: "15m",  label: "Prep Time", emoji: "⏱️" },
              { value: "100%", label: "Fresh Daily",   emoji: "🥬" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="glass-card p-8 text-center"
              >
                <div className="text-4xl mb-4">{stat.emoji}</div>
                <div className="text-4xl font-extrabold font-display text-gray-900 dark:text-white mb-2">{stat.value}</div>
                <div className="text-sm text-coral-500 font-bold uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Mission Content */}
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-square rounded-[3rem] bg-gradient-to-br from-coral-400 to-coral-600 p-1 flex items-center justify-center relative overflow-hidden shadow-2xl shadow-coral-500/20">
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                 <div className="text-[150px] drop-shadow-2xl relative z-10 z-[1] transform hover:scale-110 transition-transform duration-500">
                    👨‍🍳
                 </div>
              </div>
              
              <div className="absolute -bottom-8 -right-8 glass-card p-6 rounded-3xl w-64 backdrop-blur-xl border border-white/20">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-coral-100 dark:bg-coral-900/30 rounded-2xl flex items-center justify-center text-coral-500 text-xl">⭐</div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">Premium Quality</h4>
                    <p className="text-xs text-gray-500">Rated 4.9/5</p>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-coral-500 w-[95%]"></div>
                </div>
              </div>
            </motion.div>

            {/* Text */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-6">
                Why Choose QuickBite?
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed text-lg">
                Born on campus, built for students. We replace long frustrating queues with a seamless digital experience. Order ahead, pay securely, and pick up your meal piping hot.
              </p>
              
              <div className="space-y-6">
                {[
                  { icon: "🚀", title: "Lightning Fast Ordering", desc: "A few taps and your order is sent straight to the kitchen." },
                  { icon: "✨", title: "Premium App Aesthetics", desc: "A beautiful, fluid experience that feels like a modern 5-star app." },
                  { icon: "💳", title: "Seamless Payments", desc: "Integrated checkout means no fumbling for cash at the counter." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-5">
                    <div className="w-14 h-14 shrink-0 rounded-2xl bg-coral-50 dark:bg-dark-card border border-coral-100 dark:border-dark-border flex items-center justify-center text-2xl shadow-sm">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-1">{item.title}</h4>
                      <p className="text-gray-500 dark:text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

    </main>
  );
}