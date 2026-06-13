import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { API_BASE_URL } from "../config/api";

const CATEGORIES = ["Pizza", "Burger", "Snacks", "Drinks", "South Indian", "Chinese", "Sandwich", "Rolls", "Dessert"];

const authHeader = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
});

const emptyForm = { name: "", description: "", category: "Pizza", price: "", image: "", isVeg: true, preparationTime: 15 };

export default function Admin() {
  const { user } = useAuth();
  const [tab, setTab] = useState("users");

  // ── USERS ──
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // ── ORDERS ──
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersLastUpdated, setOrdersLastUpdated] = useState(null);
  const [ordersCountdown, setOrdersCountdown] = useState(10);

  // ── MENU ──
  const [menu, setMenu] = useState([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  // ──────── API CALLS (hooks must be before any early return) ────────

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users`, { headers: authHeader() });
      const data = await res.json();
      if (data.success) setUsers(data.data);
      else toast.error(data.message || "Failed to load users");
    } catch {
      toast.error("Network error loading users");
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const loadOrders = useCallback(async (isBackground = false) => {
    if (!isBackground) setOrdersLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/orders`, { headers: authHeader() });
      const data = await res.json();
      if (data.success) {
        const sorted = (data.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(sorted);
        setOrdersLastUpdated(new Date());
        setOrdersCountdown(10);
      } else if (!isBackground) toast.error(data.message || "Failed to load orders");
    } catch {
      if (!isBackground) toast.error("Network error loading orders");
    } finally {
      if (!isBackground) setOrdersLoading(false);
    }
  }, []);

  const loadMenu = useCallback(async () => {
    setMenuLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/menu`);
      const data = await res.json();
      if (data.success) setMenu(data.data);
      else toast.error(data.message || "Failed to load menu");
    } catch {
      toast.error("Network error loading menu");
    } finally {
      setMenuLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "users") loadUsers();
    if (tab === "orders") loadOrders(false);
    if (tab === "menu") loadMenu();
  }, [tab, loadUsers, loadOrders, loadMenu]);

  // Auto-refresh orders every 10s when on the orders tab
  useEffect(() => {
    if (tab !== "orders") return;
    const interval = setInterval(() => loadOrders(true), 10_000);
    return () => clearInterval(interval);
  }, [tab, loadOrders]);

  // Countdown ticker for orders tab
  useEffect(() => {
    if (tab !== "orders") return;
    const tick = setInterval(() => setOrdersCountdown((c) => (c > 0 ? c - 1 : 10)), 1000);
    return () => clearInterval(tick);
  }, [tab]);

  // ── GUARD (after all hooks) ──
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen pt-28 pb-20 px-4 relative flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-dark-bg">
        {/* Background Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-coral-400/10 dark:bg-coral-900/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen -z-10" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-400/10 dark:bg-amber-900/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen -z-10" />

        <div className="text-center glass-card p-10 max-w-sm relative z-10 border border-white/50 dark:border-dark-border">
          <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-white dark:ring-[#18181A]">
            <span className="text-4xl">🔒</span>
          </div>
          <h2 className="text-2xl font-extrabold font-display text-red-700 dark:text-red-400 mb-2 tracking-tight">Access Denied</h2>
          <p className="text-red-600 dark:text-red-300 font-medium mb-4">Admin privileges required to view this page.</p>
        </div>
      </div>
    );
  }

  const handleChangeOrderStatus = async (id, newStatus) => {
    // Optimistic update
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    try {
      const res = await fetch(`${API_BASE_URL}/admin/orders/${id}/status`, {
        method: "PATCH",
        headers: authHeader(),
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Order status → ${newStatus} ✅`);
      } else {
        toast.error(data.message || "Failed to update status");
        loadOrders(); // revert on failure
      }
    } catch {
      toast.error("Network error");
      loadOrders();
    }
  };

  // ──────── USER ACTIONS ────────

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Remove user "${name}"? This is permanent.`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
        method: "DELETE",
        headers: authHeader(),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("User removed ✅");
        setUsers((prev) => prev.filter((u) => u.id !== id));
      } else toast.error(data.message || "Failed to delete user");
    } catch {
      toast.error("Network error");
    }
  };

  const handleChangeRole = async (id, newRole) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${id}/role`, {
        method: "PUT",
        headers: authHeader(),
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Role changed to ${newRole} ✅`);
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role: newRole } : u)));
      } else toast.error(data.message || "Failed to change role");
    } catch {
      toast.error("Network error");
    }
  };

  // ──────── MENU ACTIONS ────────

  const handleSaveMenuItem = async () => {
    if (!form.name.trim() || !form.category || !form.price || Number(form.price) <= 0) {
      toast.error("Name, category and valid price are required");
      return;
    }
    setSaving(true);
    try {
      const url = editingId ? `${API_BASE_URL}/menu/${editingId}` : `${API_BASE_URL}/menu`;
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: authHeader(),
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          preparationTime: Number(form.preparationTime),
          isAvailable: true,
          rating: 4.5,
          reviewCount: 0,
          soldCount: 0,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(editingId ? "Item updated ✅" : "Item added ✅");
        setForm(emptyForm);
        setEditingId(null);
        loadMenu();
      } else toast.error(data.message || "Failed to save item");
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  };

  const handleEditMenuItem = (item) => {
    setForm({
      name: item.name || "",
      description: item.description || "",
      category: item.category || "Pizza",
      price: String(item.price || ""),
      image: item.image || "",
      isVeg: item.isVeg ?? true,
      preparationTime: item.preparationTime || 15,
    });
    setEditingId(item.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteMenuItem = async (id, name) => {
    if (!window.confirm(`Remove "${name}" from menu? This is permanent.`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/menu/${id}`, {
        method: "DELETE",
        headers: authHeader(),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Item removed ✅");
        setMenu((prev) => prev.filter((it) => it.id !== id));
      } else toast.error(data.message || "Failed to delete item");
    } catch {
      toast.error("Network error");
    }
  };

  // ──────── RENDER ────────

  const tabBtn = (key, label, icon) => (
    <button
      onClick={() => setTab(key)}
      className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest transition-all ${
        tab === key
          ? "bg-coral-500 text-white shadow-lg shadow-coral-500/30 border border-coral-400"
          : "bg-white/50 dark:bg-dark-bg/50 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-dark-border hover:border-coral-300 dark:hover:border-coral-900 hover:text-coral-500 dark:hover:text-coral-400 backdrop-blur-md"
      }`}
    >
      <span className="text-lg leading-none">{icon}</span> {label}
    </button>
  );

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 relative overflow-hidden bg-gray-50 dark:bg-dark-bg">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-coral-400/10 dark:bg-coral-900/10 rounded-full blur-[150px] mix-blend-multiply dark:mix-blend-screen -z-10" />
      <div className="absolute bottom-0 left-0 w-[60%] h-[60%] bg-amber-400/10 dark:bg-amber-900/10 rounded-full blur-[150px] mix-blend-multiply dark:mix-blend-screen -z-10" />

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold font-display text-gray-900 dark:text-white tracking-tight mb-3">🛠️ Admin Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">Manage users, orders and menu items</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 flex-wrap justify-center md:justify-start">
          {tabBtn("users", "Users", "👥")}
          {tabBtn("orders", "Orders", "📦")}
          {tabBtn("menu", "Menu", "🍔")}
        </div>

        {/* ── ORDERS TAB ── */}
        {tab === "orders" && (
          <div className="glass-card shadow-sm border border-white/50 dark:border-dark-border p-0 overflow-hidden">
            <div className="px-6 md:px-8 py-6 border-b border-gray-100 dark:border-dark-border bg-white/30 dark:bg-black/10 flex justify-between items-center flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-extrabold font-display text-gray-900 dark:text-white tracking-tight">
                  All Orders
                  <span className="ml-3 text-sm font-bold bg-coral-100 text-coral-600 dark:bg-coral-900/30 dark:text-coral-400 px-3 py-1 rounded-full">{orders.length}</span>
                </h2>
                {ordersLastUpdated && (
                  <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 dark:text-gray-500 mt-2">
                    <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-coral-500 animate-pulse mr-1"></span>
                    Refreshing in <span className="font-mono text-coral-500 ml-0.5">{ordersCountdown}S</span>
                    <span className="opacity-50 mx-2">|</span>
                    Updated {ordersLastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </p>
                )}
              </div>
              <button onClick={() => loadOrders(false)} className="flex items-center gap-2 px-5 py-2.5 glass-card border border-white/50 dark:border-dark-border rounded-xl text-xs font-bold tracking-widest uppercase text-gray-600 dark:text-gray-300 hover:text-coral-600 transition-colors shadow-sm">
                ↻ Refresh
              </button>
            </div>
            {ordersLoading ? (
              <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-4 border-coral-500 border-t-transparent rounded-full shadow-lg shadow-coral-500/20" /></div>
            ) : orders.length === 0 ? (
              <p className="text-center py-20 text-gray-400 font-medium">No orders yet.</p>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-dark-border">
                {orders.map((o) => (
                  <div key={o.id} className="px-6 md:px-8 py-5 hover:bg-white/40 dark:hover:bg-black/20 transition-colors">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      {/* Left: order info */}
                      <div>
                        <div className="flex items-center gap-3 flex-wrap mb-1.5">
                          <span className="font-extrabold font-display text-gray-900 dark:text-white text-lg tracking-tight">
                            #{o.orderNumber || o.id?.slice(-8).toUpperCase()}
                          </span>
                          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                            {o.createdAt ? new Date(o.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : ""}
                          </span>
                        </div>
                        <div className="text-sm font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-2 mb-1.5">
                          <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-500">👤 {o.customerInfo?.name || "—"}</span>
                          <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-500">📞 {o.customerInfo?.phone || "—"}</span>
                        </div>
                        <div className="text-xs font-bold uppercase tracking-widest text-coral-500 dark:text-coral-400">
                          {o.items?.length || 0} item(s) <span className="text-gray-300 dark:text-gray-600 mx-1">•</span> ₹{Number(o.finalAmount || o.totalAmount || 0).toFixed(2)}
                        </div>
                      </div>
                      {/* Right: status selector */}
                      {o.status === "cancelled" ? (
                        <span className="px-4 py-2 rounded-xl text-xs uppercase tracking-widest font-bold border-2 bg-red-50 border-red-300 text-red-700 flex items-center gap-2 shadow-sm select-none">
                          <span className="text-base">🔒</span> Cancelled
                        </span>
                      ) : o.status === "completed" ? (
                        <span className="px-4 py-2 rounded-xl text-xs uppercase tracking-widest font-bold border-2 bg-gray-50 border-gray-300 text-gray-600 flex items-center gap-2 shadow-sm select-none">
                          <span className="text-base">🏁</span> Completed
                        </span>
                      ) : (
                      <select
                        value={o.status || "pending"}
                        onChange={(e) => handleChangeOrderStatus(o.id, e.target.value)}
                        className={`px-4 py-2 rounded-xl text-xs uppercase tracking-widest font-bold border-2 cursor-pointer transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-dark-bg focus:ring-coral-500 appearance-none bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%20%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%208l5%205%205-5z%22%20fill%3D%22%239CA3AF%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[position:right_8px_center] pr-10 ${
                          o.status === "pending"   ? "bg-blue-50/80 border-blue-300 text-blue-700 hover:bg-blue-100"
                          : o.status === "confirmed" ? "bg-indigo-50/80 border-indigo-300 text-indigo-700 hover:bg-indigo-100"
                          : o.status === "preparing" ? "bg-amber-50/80 border-amber-300 text-amber-700 hover:bg-amber-100"
                          : o.status === "ready"     ? "bg-green-50/80 border-green-300 text-green-700 hover:bg-green-100"
                          : o.status === "completed" ? "bg-gray-100/80 border-gray-300 text-gray-600 hover:bg-gray-200"
                          : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {["pending","confirmed","preparing","ready","completed","cancelled"].map(s => (
                          <option key={s} value={s}>{s.toUpperCase()}</option>
                        ))}
                      </select>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── USERS TAB ── */}
        {tab === "users" && (
          <div className="glass-card shadow-sm border border-white/50 dark:border-dark-border p-0 overflow-hidden">
            <div className="px-6 md:px-8 py-6 border-b border-gray-100 dark:border-dark-border bg-white/30 dark:bg-black/10 flex justify-between items-center">
              <h2 className="text-2xl font-extrabold font-display text-gray-900 dark:text-white tracking-tight">Registered Users</h2>
              <button onClick={loadUsers} className="flex items-center gap-2 px-4 py-2 glass-card border border-white/50 dark:border-dark-border rounded-xl text-xs font-bold tracking-widest uppercase text-gray-600 dark:text-gray-300 hover:text-coral-600 transition-colors shadow-sm">↻ Refresh</button>
            </div>
            {usersLoading ? (
              <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-4 border-coral-500 border-t-transparent rounded-full shadow-lg shadow-coral-500/20" /></div>
            ) : users.length === 0 ? (
              <p className="text-center py-20 text-gray-400 font-medium">No users found.</p>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-dark-border">
                {users.map((u) => (
                  <div key={u.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 md:px-8 py-5 hover:bg-white/40 dark:hover:bg-black/20 transition-colors">
                    <div>
                      <div className="font-extrabold font-display text-lg tracking-tight text-gray-900 dark:text-white mb-1">{u.name}</div>
                      <div className="text-sm font-medium text-gray-500 mb-2">{u.email} {u.phone && <span className="text-gray-400 dark:text-gray-600">| 📞 {u.phone}</span>}</div>
                      <div className="flex gap-2">
                        <span className={`text-[10px] uppercase tracking-widest px-2.5 py-1 rounded border shadow-sm font-bold ${u.role === "admin" ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}>
                          {u.role}
                        </span>
                        <span className={`text-[10px] uppercase tracking-widest px-2.5 py-1 rounded border shadow-sm font-bold ${u.isEmailVerified ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                          {u.isEmailVerified ? "Verified" : "Unverified"}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-3 shrink-0">
                      {u.role !== "admin" ? (
                        <button onClick={() => handleChangeRole(u.id, "admin")}
                          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white text-xs tracking-widest uppercase rounded-xl font-bold transition shadow-sm hover:shadow-md">
                          Promote
                        </button>
                      ) : (
                        <button onClick={() => handleChangeRole(u.id, "user")}
                          className="px-4 py-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300 text-xs tracking-widest uppercase rounded-xl font-bold transition shadow-sm">
                          Demote
                        </button>
                      )}
                      <button onClick={() => handleDeleteUser(u.id, u.name)}
                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white text-xs tracking-widest uppercase rounded-xl font-bold transition shadow-sm hover:shadow-md">
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── MENU TAB ── */}
        {tab === "menu" && (
          <div className="space-y-8">
            {/* Form Card */}
            <div className="glass-card shadow-lg shadow-coral-500/5 border border-white/50 dark:border-dark-border p-8 md:p-10">
              <h2 className="text-2xl font-extrabold font-display text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-dark-border pb-4 tracking-tight">
                {editingId ? "✏️ Edit Menu Item" : "✨ Add Menu Item"}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2">Item Name *</label>
                  <input className="input-field"
                    placeholder="E.g. Margherita Pizza" value={form.name} onChange={e => setForm(s => ({ ...s, name: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2">Category *</label>
                  <select className="input-field cursor-pointer appearance-none bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%20%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%208l5%205%205-5z%22%20fill%3D%22%239CA3AF%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[position:right_12px_center] pr-10"
                    value={form.category} onChange={e => setForm(s => ({ ...s, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2">Price (₹) *</label>
                  <input className="input-field"
                    placeholder="0.00" type="number" min="1" value={form.price} onChange={e => setForm(s => ({ ...s, price: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2">Prep Time (min)</label>
                  <input className="input-field"
                    placeholder="15" type="number" value={form.preparationTime} onChange={e => setForm(s => ({ ...s, preparationTime: e.target.value }))} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2">Description</label>
                  <input className="input-field"
                    placeholder="Freshly baked with extra cheese..." value={form.description} onChange={e => setForm(s => ({ ...s, description: e.target.value }))} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2">Image URL</label>
                  <input className="input-field"
                    placeholder="https://example.com/image.jpg" value={form.image} onChange={e => setForm(s => ({ ...s, image: e.target.value }))} />
                </div>
                <div className="flex flex-col gap-2 sm:col-span-2 mt-2">
                  <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Dietary Type</span>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setForm(s => ({ ...s, isVeg: true }))}
                      className={`flex-1 flex justify-center items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all border-2 ${
                        form.isVeg
                          ? "bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/30"
                          : "bg-white/50 dark:bg-dark-bg/50 border-gray-200 dark:border-dark-border text-gray-500 hover:border-green-300 dark:hover:border-green-800 backdrop-blur-sm"
                      }`}
                    >
                      <span className="text-lg leading-none">🥬</span> Veg
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm(s => ({ ...s, isVeg: false }))}
                      className={`flex-1 flex justify-center items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all border-2 ${
                        !form.isVeg
                          ? "bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/30"
                          : "bg-white/50 dark:bg-dark-bg/50 border-gray-200 dark:border-dark-border text-gray-500 hover:border-red-300 dark:hover:border-red-800 backdrop-blur-sm"
                      }`}
                    >
                      <span className="text-lg leading-none">🍗</span> Non-Veg
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <button onClick={handleSaveMenuItem} disabled={saving}
                  className={`flex-1 justify-center py-3.5 text-sm uppercase tracking-widest shadow-lg transition-all ${saving ? 'bg-gray-400 cursor-wait text-white rounded-xl font-bold' : 'btn-primary shadow-coral-500/30'}`}>
                  {saving ? "Saving..." : editingId ? "Save Changes" : "Add Item to Menu"}
                </button>
                {editingId && (
                  <button onClick={() => { setForm(emptyForm); setEditingId(null); }}
                    className="flex-1 justify-center py-3.5 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold uppercase tracking-widest rounded-xl hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm">
                    Cancel Edit
                  </button>
                )}
              </div>
            </div>

            {/* Menu List */}
            <div className="glass-card shadow-sm border border-white/50 dark:border-dark-border p-0 overflow-hidden">
              <div className="px-6 md:px-8 py-6 border-b border-gray-100 dark:border-dark-border bg-white/30 dark:bg-black/10 flex justify-between items-center">
                <h2 className="text-2xl font-extrabold font-display text-gray-900 dark:text-white tracking-tight">Menu Items</h2>
                <button onClick={loadMenu} className="flex items-center gap-2 px-4 py-2 glass-card border border-white/50 dark:border-dark-border rounded-xl text-xs font-bold tracking-widest uppercase text-gray-600 dark:text-gray-300 hover:text-coral-600 transition-colors shadow-sm">↻ Refresh</button>
              </div>
              {menuLoading ? (
                <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-4 border-coral-500 border-t-transparent rounded-full shadow-lg shadow-coral-500/20" /></div>
              ) : menu.length === 0 ? (
                <p className="text-center py-20 text-gray-400 font-medium">No menu items found.</p>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-dark-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1">
                  {menu.map((item) => (
                    <div key={item.id} className="flex flex-col lg:flex-row lg:items-center gap-5 px-6 md:px-8 py-6 hover:bg-white/40 dark:hover:bg-black/20 transition-colors">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-16 h-16 rounded-2xl object-cover shrink-0 shadow-sm border border-white dark:border-gray-700" />
                        ) : (
                          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 border border-white dark:border-gray-700">
                            <span className="text-2xl">🍔</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-extrabold font-display text-lg tracking-tight text-gray-900 dark:text-white truncate mb-1">{item.name}</div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold uppercase tracking-widest bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-500">{item.category}</span>
                            <span className="text-sm font-extrabold text-coral-500 dark:text-coral-400">₹{item.price}</span>
                            <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded border font-bold ${item.isVeg ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                              {item.isVeg ? "Veg" : "Non-Veg"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3 shrink-0 lg:ml-auto">
                        <button onClick={() => handleEditMenuItem(item)}
                          className="flex-1 lg:flex-none px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white text-xs tracking-widest uppercase rounded-xl font-bold transition shadow-sm hover:shadow-md text-center">
                          Edit
                        </button>
                        <button onClick={() => handleDeleteMenuItem(item.id, item.name)}
                          className="flex-1 lg:flex-none px-4 py-2 bg-white dark:bg-gray-800 border-2 border-red-100 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 text-xs tracking-widest uppercase rounded-xl font-bold transition shadow-sm hover:shadow-md text-center">
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
