import React from "react";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";

export default function CartDrawer({ open, onClose }) {
  const { items, add, dec, remove, total, clear } = useCart();
  return (
    <div className={`fixed inset-0 z-50 ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
      {/* backdrop */}
      <div onClick={onClose} className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} />
      {/* panel */}
      <aside className={`absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-dark-card shadow-2xl p-6 transition-transform duration-300 ease-in-out border-l border-gray-100 dark:border-dark-border ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-gray-100">Your Cart</h3>
          <button onClick={onClose} className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition">✕</button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center gap-4">
            <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <span className="text-4xl text-gray-300 dark:text-gray-600">🛍️</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Your cart is feeling a bit empty.</p>
          </div>
        ) : (
          <div className="flex flex-col h-[calc(100vh-120px)]">
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {items.map((it) => (
                <div key={it.id} className="flex gap-4 items-center bg-gray-50 dark:bg-[#1f1f22] p-3 rounded-2xl border border-gray-100 dark:border-dark-border group">
                  <img src={it.img} alt="" className="h-20 w-20 rounded-xl object-cover shadow-sm bg-white dark:bg-dark-bg" />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-gray-100">{it.name}</div>
                    <div className="text-sm font-medium text-coral-500 dark:text-coral-400 mb-2">₹{it.price}</div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg shadow-sm">
                        <button onClick={() => dec(it.id)} className="px-2.5 py-1 text-gray-500 hover:text-coral-500 transition-colors">-</button>
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100 w-4 text-center">{it.qty}</span>
                        <button onClick={() => add(it)} className="px-2.5 py-1 text-gray-500 hover:text-coral-500 transition-colors">+</button>
                      </div>
                      <button onClick={() => remove(it.id)} className="text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-wider">Remove</button>
                    </div>
                  </div>
                  <div className="font-bold text-gray-900 dark:text-gray-100 text-lg">₹{it.qty * it.price}</div>
                </div>
              ))}
            </div>
            
            <div className="pt-6 mt-4 border-t border-gray-100 dark:border-dark-border">
              <div className="flex justify-between font-bold text-xl mb-6">
                <span className="text-gray-900 dark:text-gray-100">Total</span>
                <span className="text-coral-500 dark:text-coral-400">₹{total}</span>
              </div>
              <div className="flex gap-3">
                <button onClick={clear} className="btn-secondary flex-1 py-3 text-sm">Clear Cart</button>
                <Link to="/checkout" onClick={onClose} className="btn-primary flex-[2] py-3 shadow-coral-500/30 text-base">
                  Checkout Now
                </Link>
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
