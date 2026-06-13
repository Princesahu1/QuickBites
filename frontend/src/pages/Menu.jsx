import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FoodCard from "../components/FoodCard";
import { menuService } from "../services/menuService";
import { toast } from "react-hot-toast";

export default function Menu() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [filterType, setFilterType] = useState("all"); // 'all', 'veg', 'non-veg'
  const [query, setQuery] = useState("");

  const categories = [
    "All",
    "Pizza",
    "Burger",
    "Snacks",
    "Drinks",
    "South Indian",
    "Chinese",
    "Sandwich",
    "Rolls",
    "Dessert",
  ];

  // Fetch menu from backend
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const result = await menuService.getAllItems();
        if (result.success) {
          setMenu(result.data);
        } else {
          toast.error("Failed to load menu");
        }
      } catch (error) {
        console.error("Error fetching menu:", error);
        toast.error("Error loading menu");
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  const debounce = (fn, delay = 300) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };

  const handleSearch = useMemo(
    () =>
      debounce((val) => {
        setQuery(val.toLowerCase());
      }, 300),
    []
  );

  const filteredMenu = useMemo(() => {
    let items = menu;

    // 1. Category Filter
    if (activeCategory !== "All") {
      items = items.filter((item) => item.category === activeCategory);
    }

    // 2. Veg/Non-Veg Filter
    if (filterType === "veg") {
      items = items.filter((item) => item.isVeg);
    } else if (filterType === "non-veg") {
      items = items.filter((item) => !item.isVeg);
    }

    // 3. Search Filter
    if (query) {
      items = items.filter((item) =>
        item.name.toLowerCase().includes(query)
      );
    }
    return items;
  }, [activeCategory, query, menu, filterType]);

  if (loading) {
    return (
      <section className="pt-24 pb-16 px-4 bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 min-h-screen">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8">
            Loading Menu... 🍽️
          </h1>
        </div>
      </section>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-dark-bg pt-28 pb-20 px-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-coral-50/50 dark:from-coral-900/10 to-transparent -z-10" />

      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-coral-500 font-bold tracking-widest uppercase text-sm mb-3 block">Discover Flavors</span>
          <h1 className="text-5xl md:text-6xl font-extrabold font-display text-gray-900 dark:text-white mb-6 tracking-tight">
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-coral-400 to-coral-600">Menu</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            From quick snacks to hearty meals, find exactly what you're craving. 
            Freshly prepared and ready to pick up.
          </p>
        </motion.div>

        {/* Filters & Search */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-12 glass-card p-4 rounded-[2rem]"
        >
          {/* Search Bar */}
          <div className="relative w-full lg:w-[400px]">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search for dishes, snacks, drinks..."
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-100 dark:border-dark-border shadow-sm focus:outline-none focus:ring-2 focus:ring-coral-400 focus:border-transparent bg-white dark:bg-[#18181A] text-gray-900 dark:text-gray-100 placeholder-gray-400 transition-all font-medium"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-hide shrink-0">
             {/* Veg/Non-Veg Toggle */}
            <div className="flex bg-gray-100 dark:bg-[#18181A] rounded-xl p-1.5 border border-gray-200 dark:border-dark-border min-w-max">
              <button
                onClick={() => setFilterType("all")}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-sm ${filterType === "all" ? "bg-white dark:bg-dark-card text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white shadow-none"}`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType("veg")}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 shadow-sm ${filterType === "veg" ? "bg-green-50 dark:bg-[#18281d] text-green-700 dark:text-green-400" : "text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 shadow-none"}`}
              >
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Veg
              </button>
              <button
                onClick={() => setFilterType("non-veg")}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 shadow-sm ${filterType === "non-veg" ? "bg-red-50 dark:bg-[#2e1a1a] text-red-700 dark:text-red-400" : "text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 shadow-none"}`}
              >
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                Non-Veg
              </button>
            </div>
          </div>
        </motion.div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-16 px-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 shadow-sm ${
                activeCategory === cat
                  ? "bg-coral-500 text-white shadow-coral-500/40 transform scale-105"
                  : "bg-white dark:bg-dark-card text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-dark-border hover:border-coral-300 dark:hover:border-coral-700 hover:text-coral-500 dark:hover:text-coral-400 hover:shadow-md"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Food Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        >
          <AnimatePresence>
            {filteredMenu.map((food) => (
              <motion.div
                key={food._id || food.id}
                layout
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
                className="h-full"
              >
                <FoodCard food={food} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredMenu.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center glass-card max-w-2xl mx-auto mt-10"
          >
            <div className="w-24 h-24 bg-coral-50 dark:bg-dark-border rounded-full flex items-center justify-center text-4xl mb-6">
              🕵️‍♂️
            </div>
            <h3 className="text-2xl font-bold font-display text-gray-900 dark:text-white mb-2">No matching dishes</h3>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              We couldn't find any items matching "{query}" in {activeCategory}.<br/>
              Try tweaking your search or filters!
            </p>
            <button 
              onClick={() => {
                setQuery("");
                setActiveCategory("All");
                setFilterType("all");
              }}
              className="mt-8 btn-secondary"
            >
              Clear Filters
            </button>
          </motion.div>
        )}
      </div>
    </main>
  );
}