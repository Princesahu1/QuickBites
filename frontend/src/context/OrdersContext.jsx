
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const OrdersContext = createContext(null);
export const useOrders = () => useContext(OrdersContext);

const ORDERS_KEY = "qb_orders";

export default function OrdersProvider({ children }) {
  const [orders, setOrders] = useState([]); // {id,userId,items,total,status,createdAt}

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ORDERS_KEY);
      if (raw) setOrders(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(ORDERS_KEY, JSON.stringify(orders)); } catch {}
  }, [orders]);

  const createOrder = (order) => {
    const o = { id: `order-${Date.now()}`, status: "pending", createdAt: Date.now(), ...order };
    setOrders(prev => [o, ...prev]);
    return o;
  };

  const updateOrderStatus = (id, status) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const removeOrder = (id) => setOrders(prev => prev.filter(o => o.id !== id));

  const value = useMemo(() => ({ orders, createOrder, updateOrderStatus, removeOrder }), [orders]);

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}
