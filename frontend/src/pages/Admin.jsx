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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 pt-20">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center max-w-md">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-2">Access Denied</h2>
          <p className="text-red-600 dark:text-red-300">Admin privileges required to view this page.</p>
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
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
        tab === key
          ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
          : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-red-300"
      }`}
    >
      {icon} {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 pt-24 pb-12">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">🛠️ Admin Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage users, orders and menu items</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-8 flex-wrap">
          {tabBtn("users", "Users", "👥")}
          {tabBtn("orders", "Orders", "📦")}
          {tabBtn("menu", "Menu", "🍔")}
        </div>

        {/* ── ORDERS TAB ── */}
        {tab === "orders" && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center flex-wrap gap-2">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  All Orders
                  <span className="ml-2 text-sm font-normal text-gray-400">({orders.length})</span>
                </h2>
                {ordersLastUpdated && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    🔄 Refreshing in <span className="font-mono font-bold text-red-500">{ordersCountdown}s</span>
                    {" · "}Last updated {ordersLastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </p>
                )}
              </div>
              <button onClick={() => loadOrders(false)} className="text-sm text-red-500 hover:underline">↻ Refresh now</button>
            </div>
            {ordersLoading ? (
              <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-red-500 border-t-transparent rounded-full" /></div>
            ) : orders.length === 0 ? (
              <p className="text-center py-12 text-gray-400">No orders yet</p>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {orders.map((o) => (
                  <div key={o.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      {/* Left: order info */}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-gray-900 dark:text-white text-sm">
                            #{o.orderNumber || o.id?.slice(-8).toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-400">
                            {o.createdAt ? new Date(o.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : ""}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          👤 {o.customerInfo?.name || "—"} &nbsp;•&nbsp; 📞 {o.customerInfo?.phone || "—"}
                        </div>
                        <div className="text-sm text-gray-500 mt-0.5">
                          {o.items?.length || 0} item(s) &nbsp;•&nbsp; ₹{Number(o.finalAmount || o.totalAmount || 0).toFixed(2)}
                        </div>
                      </div>
                      {/* Right: status selector */}
                      {o.status === "cancelled" ? (
                        <span className="px-3 py-1.5 rounded-lg text-sm font-semibold border-2 bg-red-50 border-red-300 text-red-700 flex items-center gap-1.5 select-none">
                          🔒 Cancelled
                        </span>
                      ) : o.status === "completed" ? (
                        <span className="px-3 py-1.5 rounded-lg text-sm font-semibold border-2 bg-gray-100 border-gray-300 text-gray-600 flex items-center gap-1.5 select-none">
                          🔒 Completed
                        </span>
                      ) : (
                      <select
                        value={o.status || "pending"}
                        onChange={(e) => handleChangeOrderStatus(o.id, e.target.value)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-semibold border-2 cursor-pointer transition focus:outline-none ${
                          o.status === "pending"   ? "bg-blue-50 border-blue-300 text-blue-700"
                          : o.status === "confirmed" ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                          : o.status === "preparing" ? "bg-orange-50 border-orange-300 text-orange-700"
                          : o.status === "ready"     ? "bg-green-50 border-green-300 text-green-700"
                          : o.status === "completed" ? "bg-gray-100 border-gray-300 text-gray-600"
                          : "bg-gray-50 border-gray-300 text-gray-600"
                        }`}
                      >
                        {["pending","confirmed","preparing","ready","completed","cancelled"].map(s => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
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
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Registered Users</h2>
              <button onClick={loadUsers} className="text-sm text-red-500 hover:underline">↻ Refresh</button>
            </div>
            {usersLoading ? (
              <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-red-500 border-t-transparent rounded-full" /></div>
            ) : users.length === 0 ? (
              <p className="text-center py-12 text-gray-400">No users found</p>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {users.map((u) => (
                  <div key={u.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">{u.name}</div>
                      <div className="text-sm text-gray-500">{u.email} {u.phone && `• 📞 ${u.phone}`}</div>
                      <div className="mt-1 flex gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                          {u.role}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.isEmailVerified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                          {u.isEmailVerified ? "Verified" : "Unverified"}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {u.role !== "admin" ? (
                        <button onClick={() => handleChangeRole(u.id, "admin")}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-lg font-medium transition">
                          Promote
                        </button>
                      ) : (
                        <button onClick={() => handleChangeRole(u.id, "user")}
                          className="px-3 py-1.5 bg-gray-400 hover:bg-gray-500 text-white text-xs rounded-lg font-medium transition">
                          Demote
                        </button>
                      )}
                      <button onClick={() => handleDeleteUser(u.id, u.name)}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg font-medium transition">
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
          <div className="space-y-6">
            {/* Form Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                {editingId ? "✏️ Edit Menu Item" : "➕ Add Menu Item"}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Item name *" value={form.name} onChange={e => setForm(s => ({ ...s, name: e.target.value }))} />
                <select className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={form.category} onChange={e => setForm(s => ({ ...s, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Price (₹) *" type="number" min="1" value={form.price} onChange={e => setForm(s => ({ ...s, price: e.target.value }))} />
                <input className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Prep time (minutes)" type="number" value={form.preparationTime} onChange={e => setForm(s => ({ ...s, preparationTime: e.target.value }))} />
                <input className="sm:col-span-2 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Description" value={form.description} onChange={e => setForm(s => ({ ...s, description: e.target.value }))} />
                <input className="sm:col-span-2 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Image URL (optional)" value={form.image} onChange={e => setForm(s => ({ ...s, image: e.target.value }))} />
                <div className="flex items-center gap-2 sm:col-span-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-medium mr-1">Type:</span>
                  <button
                    type="button"
                    onClick={() => setForm(s => ({ ...s, isVeg: true }))}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border-2 transition ${
                      form.isVeg
                        ? "bg-green-500 border-green-500 text-white"
                        : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-green-400"
                    }`}
                  >
                    🟢 Veg
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(s => ({ ...s, isVeg: false }))}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border-2 transition ${
                      !form.isVeg
                        ? "bg-red-500 border-red-500 text-white"
                        : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-red-400"
                    }`}
                  >
                    🔴 Non-Veg
                  </button>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={handleSaveMenuItem} disabled={saving}
                  className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-orange-400 text-white font-semibold rounded-xl hover:from-red-600 hover:to-orange-500 transition disabled:opacity-50">
                  {saving ? "Saving..." : editingId ? "Save Changes" : "Add Item"}
                </button>
                {editingId && (
                  <button onClick={() => { setForm(emptyForm); setEditingId(null); }}
                    className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-300 transition">
                    Cancel
                  </button>
                )}
              </div>
            </div>

            {/* Menu List */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Menu Items ({menu.length})</h2>
                <button onClick={loadMenu} className="text-sm text-red-500 hover:underline">↻ Refresh</button>
              </div>
              {menuLoading ? (
                <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-red-500 border-t-transparent rounded-full" /></div>
              ) : menu.length === 0 ? (
                <p className="text-center py-12 text-gray-400">No menu items</p>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {menu.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition">
                      {item.image && <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 dark:text-white truncate">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.category} • ₹{item.price} • {item.isVeg ? "🟢 Veg" : "🔴 Non-Veg"}</div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => handleEditMenuItem(item)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg font-medium transition">
                          Edit
                        </button>
                        <button onClick={() => handleDeleteMenuItem(item.id, item.name)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg font-medium transition">
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
