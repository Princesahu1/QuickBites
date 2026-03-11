import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FoodCard from "../components/FoodCard";
import { menuService } from "../services/menuService";
import { toast } from "react-hot-toast";

export default function Menu() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
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
        
        // Handle the response - menuService returns the full response
        if (result.success && result.data) {
          setMenu(result.data);
        } else if (Array.isArray(result)) {
          // Fallback if response structure is different
          setMenu(result);
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
    let items =
      activeCategory === "All"
        ? menu
        : menu.filter((item) => item.category === activeCategory);
    if (query) {
      items = items.filter((item) =>
        item.name.toLowerCase().includes(query)
      );
    }
    return items;
  }, [activeCategory, query, menu]);

  if (loading) {
    return (
      <section className="pt-24 pb-16 px-4 bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 min-h-screen">
        <div className="max-w-6xl mx-auto text-center flex flex-col items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Loading Menu... 🍽️
          </h1>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-24 pb-16 px-4 bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8 text-center">
          Explore Our Delicious Menu
        </h1>

        {/* Search Bar */}
        <div className="flex justify-center mb-8">
          <input
            type="text"
            placeholder="Search dishes..."
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full md:w-1/2 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full font-medium text-sm transition ${
                activeCategory === cat
                  ? "bg-gradient-to-r from-red-500 to-orange-400 text-white shadow-lg"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results Count */}
        {menu.length > 0 && (
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            Showing {filteredMenu.length} of {menu.length} items
          </p>
        )}

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
        {filteredMenu.length === 0 && !loading && (
          <div className="text-center py-20">
            <p className="text-gray-500 dark:text-gray-400 text-xl mb-4">
              No items found matching your search 🍽️
            </p>
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  setActiveCategory("All");
                }}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}