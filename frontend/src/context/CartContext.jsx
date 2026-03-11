import React, { createContext, useContext, useMemo, useState, useEffect } from "react";

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

export default function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("qb_cart");
      if (saved) setItems(JSON.parse(saved));
    } catch (e) {
      console.warn("Failed to load cart from storage:", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("qb_cart", JSON.stringify(items));
    } catch (e) {
      console.warn("Failed to save cart to storage:", e);
    }
  }, [items]);

  const add = (food) => {
    setItems((prev) => {
      const i = prev.findIndex((p) => p.id === food.id);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], qty: next[i].qty + 1 };
        return next;
      }
      return [...prev, { ...food, qty: 1 }];
    });
  };

  const remove = (id) => setItems((prev) => prev.filter((p) => p.id !== id));
  const dec = (id) =>
    setItems((prev) =>
      prev.flatMap((p) =>
        p.id !== id ? [p] : p.qty > 1 ? [{ ...p, qty: p.qty - 1 }] : []
      )
    );

  const clear = () => setItems([]);
  const count = items.reduce((s, p) => s + p.qty, 0);
  const total = items.reduce((s, p) => s + p.qty * p.price, 0);

  const value = useMemo(
    () => ({ items, add, remove, dec, clear, count, total }),
    [items, total, count]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
