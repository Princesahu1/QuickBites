import React from "react";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";

export default function CartDrawer({ open, onClose }) {
  const { items, add, dec, remove, total, clear } = useCart();
  return (
    <div className={`fixed inset-0 z-50 ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
      {/* backdrop */}
      <div onClick={onClose} className={`absolute inset-0 bg-black/30 transition ${open ? "opacity-100" : "opacity-0"}`} />
      {/* panel */}
      <aside className={`absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl p-4 transition-transform ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Your Cart</h3>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white">✕</button>
        </div>

        {items.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">Your cart is empty.</p>
        ) : (
          <div className="space-y-3">
            {items.map((it) => (
              <div key={it.id} className="flex gap-3 items-center">
                <img src={it.img} alt="" className="h-14 w-14 rounded object-cover" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-gray-100">{it.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">₹{it.price} × {it.qty}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <button onClick={() => dec(it.id)} className="px-2 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">-</button>
                    <button onClick={() => add(it)} className="px-2 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">+</button>
                    <button onClick={() => remove(it.id)} className="ml-2 text-sm text-red-600 dark:text-red-400">remove</button>
                  </div>
                </div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">₹{it.qty * it.price}</div>
              </div>
            ))}
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between font-semibold">
              <span className="text-gray-900 dark:text-gray-100">Total</span>
              <span className="text-gray-900 dark:text-gray-100">₹{total}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={clear} className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700">Clear</button>
              <Link to="/checkout" onClick={onClose} className="flex-1 text-center bg-red-500 text-white py-2 rounded-xl hover:bg-red-600">
                Checkout
              </Link>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
