import React from "react";
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";
import { toast } from "react-hot-toast";

const fallbackByCategory = {
  Pizza: "https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_1280.jpg",
  Burger: "https://cdn.pixabay.com/photo/2014/10/23/18/05/burger-500054_1280.jpg",
  Snacks: "https://cdn.pixabay.com/photo/2016/03/05/19/02/french-fries-1238255_1280.jpg",
  Drinks: "https://cdn.pixabay.com/photo/2016/03/23/22/21/coffee-1276778_1280.jpg",
  "South Indian": "https://cdn.pixabay.com/photo/2022/06/10/05/32/food-7253916_1280.jpg",
  Chinese: "https://cdn.pixabay.com/photo/2020/10/05/19/55/hamburger-5630646_1280.jpg",
  Sandwich: "https://cdn.pixabay.com/photo/2017/05/07/08/56/pancakes-2291908_1280.jpg",
  Rolls: "https://cdn.pixabay.com/photo/2017/06/29/20/09/mexican-2456038_1280.jpg",
  Dessert: "https://media.istockphoto.com/id/1424509973/photo/gulab-jamun-an-indian-dessert.jpg?s=612x612&w=0&k=20&c=nNXYGIMY7z4bBq6sRBlgoHbAJN5p75GhW0hVZ8uWhAM=",
  Default: "https://cdn.pixabay.com/photo/2016/03/05/19/02/hamburger-1238246_1280.jpg",
};

export default function FoodCard({ food }) {
  const { add } = useCart();

  const handleAdd = () => {
    add(food);
    toast.success(`${food.name} added to cart! 🛒`, {
      style: { borderRadius: "10px", background: "#333", color: "#fff" },
      iconTheme: { primary: "#ef4444", secondary: "#fff" },
    });
  };

  const fallbackSrc =
    fallbackByCategory[food.category] || fallbackByCategory.Default;

  // Backend uses 'image', local data uses 'img' - handle both
  const imageSource = food.image || food.img || fallbackSrc;

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-2xl transition overflow-hidden border border-gray-100 dark:border-gray-700"
    >
      <img
        src={imageSource}
        onError={(e) => {
          e.currentTarget.src = fallbackSrc;
        }}
        loading="lazy"
        alt={food.name}
        className="h-44 w-full object-cover rounded-t-2xl bg-gray-100 dark:bg-gray-800"
      />

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 flex-1">
            {food.name}
          </h3>
          {food.isVeg !== undefined && (
            <span
              className={`ml-2 text-xs px-2 py-1 rounded ${
                food.isVeg
                  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                  : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
              }`}
            >
              {food.isVeg ? "🟢 Veg" : "🔴 Non-Veg"}
            </span>
          )}
        </div>

        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {food.category}
        </p>

        {food.description && (
          <p className="text-gray-600 dark:text-gray-400 text-xs mt-1 line-clamp-2">
            {food.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-3">
          <p className="text-red-600 font-semibold text-lg">₹{food.price}</p>
          {food.preparationTime && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ⏱️ {food.preparationTime} min
            </span>
          )}
        </div>

        {food.rating > 0 && (
          <div className="flex items-center gap-1 mt-2">
            <span className="text-yellow-500">⭐</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {food.rating.toFixed(1)}
            </span>
            {food.reviewCount > 0 && (
              <span className="text-xs text-gray-500 dark:text-gray-500">
                ({food.reviewCount})
              </span>
            )}
          </div>
        )}

        <button
          onClick={handleAdd}
          disabled={food.isAvailable === false}
          className={`mt-3 w-full py-2 rounded-xl font-medium transition ${
            food.isAvailable === false
              ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-red-500 to-orange-400 text-white hover:from-red-600 hover:to-orange-500"
          }`}
        >
          {food.isAvailable === false ? "Not Available" : "Add to Cart"}
        </button>
      </div>
    </motion.div>
  );
}