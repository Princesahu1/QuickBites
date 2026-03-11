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
    <section className="pt-24 pb-16 px-4 bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8">
          Explore Our Delicious Menu
        </h1>

        <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-8">
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search dishes..."
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full md:w-1/3 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
          />

          {/* Veg/Non-Veg Toggle */}
          <div className="flex bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setFilterType("all")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${filterType === "all" ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType("veg")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${filterType === "veg" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"}`}
            >
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Veg
            </button>
            <button
              onClick={() => setFilterType("non-veg")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${filterType === "non-veg" ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" : "text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"}`}
            >
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              Non-Veg
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full font-medium text-sm transition ${
                activeCategory === cat
                  ? "bg-gradient-to-r from-red-500 to-orange-400 text-white shadow"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Food Grid */}
        <motion.div
          layout
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          <AnimatePresence>
            {filteredMenu.map((food) => (
              <motion.div
                key={food._id || food.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <FoodCard food={food} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredMenu.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400 mt-10">
            No items found matching your search 🍽️
          </p>
        )}
      </div>
    </section>
  );
}