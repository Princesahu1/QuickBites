import React from "react";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";

export default function Cart() {
  const { items, add, dec, remove, total } = useCart();
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-dark-bg pt-28 pb-20 px-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[50%] bg-coral-400/10 dark:bg-coral-900/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen -z-10" />

      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-extrabold font-display text-gray-900 dark:text-white mb-10 tracking-tight">
          Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-coral-400 to-coral-600">Cart</span>
        </h2>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center glass-card">
            <div className="w-32 h-32 bg-coral-50 dark:bg-dark-border rounded-full flex items-center justify-center text-6xl mb-8">
              🛒
            </div>
            <h3 className="text-2xl font-bold font-display text-gray-900 dark:text-white mb-3">Your cart is feeling light!</h3>
            <p className="text-gray-500 dark:text-gray-400 font-medium mb-8">
              Looks like you haven't added any delicious meals yet.
            </p>
            <Link to="/menu" className="btn-primary py-3 px-8 text-lg">
              Explore Our Menu
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              {items.map(it => (
                <div key={it.id} className="flex flex-col sm:flex-row items-center gap-6 glass-card p-4 transition-all hover:shadow-lg">
                  <div className="w-full sm:w-28 h-28 shrink-0 rounded-[1rem] overflow-hidden bg-gray-100 dark:bg-dark-border">
                    <img src={it.img} className="w-full h-full object-cover mix-blend-normal" alt={it.name} />
                  </div>
                  
                  <div className="flex-1 w-full flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-display font-bold text-xl text-gray-900 dark:text-white mb-1">{it.name}</h3>
                        <p className="text-coral-500 font-extrabold text-lg">₹{it.price}</p>
                      </div>
                      <button onClick={() => remove(it.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-1 bg-gray-50 dark:bg-[#18181A] rounded-xl border border-gray-100 dark:border-dark-border p-1">
                        <button onClick={() => dec(it.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-dark-card hover:text-coral-500 hover:shadow-sm transition-all font-bold">
                          -
                        </button>
                        <span className="w-8 text-center font-bold text-gray-900 dark:text-white">
                          {it.qty}
                        </span>
                        <button onClick={() => add(it)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-dark-card hover:text-coral-500 hover:shadow-sm transition-all font-bold">
                          +
                        </button>
                      </div>
                      <div className="font-extrabold text-xl text-gray-900 dark:text-white">
                        ₹{it.qty * it.price}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary sidebar */}
            <div className="lg:col-span-1">
              <div className="glass-card p-6 sticky top-28">
                <h3 className="font-display font-bold text-2xl text-gray-900 dark:text-white mb-6 pb-4 border-b border-gray-100 dark:border-dark-border">
                  Order Summary
                </h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center text-gray-600 dark:text-gray-400 font-medium">
                    <span>Subtotal</span>
                    <span className="text-gray-900 dark:text-white font-bold">₹{total}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600 dark:text-gray-400 font-medium pb-4 border-b border-gray-100 dark:border-dark-border">
                    <span>GST (5%)</span>
                    <span className="text-gray-900 dark:text-white font-bold">₹{(total * 0.05).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xl">
                    <span className="font-extrabold text-gray-900 dark:text-white">Total</span>
                    <span className="font-extrabold text-coral-500">₹{(total * 1.05).toFixed(2)}</span>
                  </div>
                </div>

                <Link to="/checkout" className="btn-primary w-full py-4 text-lg justify-center shadow-coral-500/40 hover:shadow-coral-500/60 mb-4 block text-center">
                  Proceed to Checkout
                </Link>
                <Link to="/menu" className="block text-center text-coral-500 font-bold hover:text-coral-600 transition-colors">
                  ← Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
