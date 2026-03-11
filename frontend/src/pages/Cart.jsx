import React from "react";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";

export default function Cart() {
  const { items, add, dec, remove, total } = useCart();
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">Your Cart</h2>
      {items.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">Cart is empty. <Link to="/menu" className="text-red-600">Go to menu</Link></p>
      ) : (
        <>
          <div className="space-y-3">
            {items.map(it => (
              <div key={it.id} className="flex items-center gap-4 border border-gray-200 dark:border-gray-700 rounded-xl p-3 bg-white dark:bg-gray-900">
                <img src={it.img} className="h-16 w-16 rounded object-cover" alt="" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-gray-100">{it.name}</div>
                  <div className="text-gray-600 dark:text-gray-400">₹{it.price}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <button onClick={() => dec(it.id)} className="px-2 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">-</button>
                    <span className="text-gray-900 dark:text-gray-100">{it.qty}</span>
                    <button onClick={() => add(it)} className="px-2 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">+</button>
                    <button onClick={() => remove(it.id)} className="ml-3 text-sm text-red-600 dark:text-red-400">remove</button>
                  </div>
                </div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">₹{it.qty * it.price}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between items-center">
            <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">Total: ₹{total}</div>
            <Link to="/checkout" className="bg-red-500 text-white px-5 py-3 rounded-xl hover:bg-red-600">Proceed</Link>
          </div>
        </>
      )}
    </div>
  );
}
