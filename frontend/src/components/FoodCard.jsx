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
      whileHover={{ y: -8 }}
      className="bg-white dark:bg-dark-card rounded-[2rem] shadow-sm hover:shadow-2xl hover:shadow-coral-500/10 transition-all duration-300 overflow-hidden border border-gray-100 dark:border-dark-border group flex flex-col h-full"
    >
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={imageSource}
          onError={(e) => {
            e.currentTarget.src = fallbackSrc;
          }}
          loading="lazy"
          alt={food.name}
          className="w-full h-full object-cover bg-gray-50 dark:bg-gray-800 transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {food.isVeg !== undefined && (
          <div className="absolute top-4 right-4 glass px-3 py-1.5 rounded-xl shadow-sm backdrop-blur-md flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${food.isVeg ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"}`}></span>
            <span className={`text-xs font-bold tracking-wider uppercase ${food.isVeg ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}>
              {food.isVeg ? "Veg" : "Non-Veg"}
            </span>
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-display font-bold text-xl text-gray-900 dark:text-white leading-tight line-clamp-1 group-hover:text-coral-500 transition-colors">
            {food.name}
          </h3>
          <p className="text-coral-500 font-extrabold text-xl shrink-0">₹{food.price}</p>
        </div>

        <p className="text-coral-400 dark:text-coral-500 text-xs font-bold uppercase tracking-wider mb-3">
          {food.category}
        </p>

        {food.description && (
          <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-4 leading-relaxed mix-blend-normal">
            {food.description}
          </p>
        )}
        
        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-dark-border flex items-center justify-between">
          <div className="flex flex-col gap-1">
            {food.rating > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-yellow-400 text-sm">★</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {food.rating.toFixed(1)}
                </span>
                {food.reviewCount > 0 && (
                  <span className="text-xs text-gray-400 font-medium">
                    ({food.reviewCount})
                  </span>
                )}
              </div>
            )}
            
            {food.preparationTime && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
                <span className="text-gray-300 dark:text-gray-600">⏱</span>
                {food.preparationTime} mins
              </div>
            )}
          </div>

          <button
            onClick={handleAdd}
            disabled={food.isAvailable === false}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm active:scale-95 ${
              food.isAvailable === false
                ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                : "bg-coral-50 dark:bg-coral-900/20 text-coral-600 dark:text-coral-400 hover:bg-coral-500 hover:text-white dark:hover:bg-coral-500 hover:shadow-coral-500/30"
            }`}
          >
            {food.isAvailable === false ? "Out" : "Add +"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}