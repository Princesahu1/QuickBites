import React, { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import { toast } from "react-hot-toast";

// ── Status config ──────────────────────────────────────────────
const STATUS_STEPS = [
  { key: "pending",    label: "Order Placed",   icon: "🛒", color: "blue"   },
  { key: "confirmed", label: "Confirmed",       icon: "✅", color: "indigo" },
  { key: "preparing", label: "Preparing",       icon: "👨‍🍳", color: "orange" },
  { key: "ready",     label: "Ready",           icon: "🎉", color: "green"  },
  { key: "completed", label: "Completed",       icon: "🏁", color: "gray"   },
];

const STATUS_CANCELLED = { key: "cancelled", label: "Cancelled", icon: "❌", color: "red" };

const STATUS_BADGE = {
  pending:   "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  confirmed: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  preparing: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  ready:     "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  completed: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

const authHeader = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
});

// ── Helpers ────────────────────────────────────────────────────
function fmtDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function fmtCurrency(n) {
  return `₹${Number(n || 0).toFixed(2)}`;
}

function getStepIndex(status) {
  const idx = STATUS_STEPS.findIndex((s) => s.key === status);
  return idx === -1 ? 0 : idx;
}

// ── Status Timeline ────────────────────────────────────────────
function StatusTimeline({ status }) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-3 py-2 px-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
        <span className="text-2xl">❌</span>
        <div>
          <p className="font-semibold text-red-700 dark:text-red-400">Order Cancelled</p>
          <p className="text-sm text-red-500">This order has been cancelled.</p>
        </div>
      </div>
    );
  }

  const currentIdx = getStepIndex(status);

  return (
    <div className="flex items-start gap-0 overflow-x-auto py-2">
      {STATUS_STEPS.map((step, idx) => {
        const done    = idx < currentIdx;
        const active  = idx === currentIdx;
        const future  = idx > currentIdx;
        return (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center min-w-[72px]">
              {/* Circle */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold border-2 transition-all ${
                  done   ? "bg-green-500 border-green-500 text-white"
                  : active ? "bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/40 scale-110"
                  : "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400"
                }`}
              >
                {done ? "✓" : step.icon}
              </div>
              {/* Label */}
              <p className={`mt-1.5 text-xs font-medium text-center leading-tight ${
                active ? "text-red-600 dark:text-red-400"
                : done  ? "text-green-600 dark:text-green-400"
                : "text-gray-400 dark:text-gray-500"
              }`}>
                {step.label}
              </p>
            </div>
            {/* Connector line */}
            {idx < STATUS_STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mt-5 mx-1 rounded transition-all ${
                idx < currentIdx ? "bg-green-400" : "bg-gray-200 dark:bg-gray-700"
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Countdown hook ─────────────────────────────────────────────
function useCountdown(targetIso) {
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    if (!targetIso) return;
    const tick = () => {
      const diff = Math.max(0, new Date(targetIso) - Date.now());
      setRemaining(diff);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  return remaining;
}

function CountdownBadge({ pickupTime, status }) {
  const remaining = useCountdown(pickupTime);
  if (!pickupTime || ["completed", "cancelled"].includes(status)) return null;
  if (remaining === null) return null;

  const totalSec = Math.floor(remaining / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  const isDue = remaining === 0;

  return (
    <div className={`mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold ${
      isDue
        ? "bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-400"
        : "bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400"
    }`}>
      <span className="text-lg">{isDue ? "🎉" : "⏱️"}</span>
      <span>
        {isDue
          ? "Your order is due now!"
          : `Ready in ${min > 0 ? `${min} min ` : ""}${sec} sec`}
      </span>
    </div>
  );
}

// ── Order Card ─────────────────────────────────────────────────
function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 dark:border-gray-700">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-gray-900 dark:text-white text-sm">
              #{order.orderNumber || order.id?.slice(-8).toUpperCase()}
            </span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${STATUS_BADGE[order.status] || STATUS_BADGE.pending}`}>
              {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || "Pending"}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">{fmtDate(order.createdAt)}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-gray-900 dark:text-white">{fmtCurrency(order.finalAmount || order.totalAmount)}</p>
          <p className="text-xs text-gray-400">{order.paymentMethod || "Cash"} • {order.paymentStatus || "pending"}</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="px-6 py-4">
        <StatusTimeline status={order.status} />
        {/* Live countdown for takeaway orders */}
        <CountdownBadge pickupTime={order.pickupTime} status={order.status} />
      </div>

      {/* Toggle items */}
      <div className="px-6 pb-4">
        <button
          onClick={() => setExpanded((e) => !e)}
          className="text-sm text-red-500 hover:text-red-600 font-medium transition"
        >
          {expanded ? "▲ Hide items" : `▼ Show ${order.items?.length || 0} item(s)`}
        </button>

        {expanded && (
          <div className="mt-3 space-y-2">
            {(order.items || []).map((item, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-700 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {item.menuItem?.name || item.name || `Item ${i + 1}`}
                  </p>
                  <p className="text-xs text-gray-400">Qty: {item.quantity || item.qty || 1}</p>
                </div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {fmtCurrency((item.price || 0) * (item.quantity || item.qty || 1))}
                </p>
              </div>
            ))}

            {/* Totals */}
            <div className="pt-2 space-y-1 text-sm">
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span><span>- {fmtCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-gray-900 dark:text-white pt-1 border-t border-gray-100 dark:border-gray-700">
                <span>Total</span>
                <span>{fmtCurrency(order.finalAmount || order.totalAmount)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {order.notes && (
          <p className="mt-3 text-xs text-gray-500 italic bg-gray-50 dark:bg-gray-700/40 px-3 py-2 rounded-lg">
            📝 {order.notes}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function OrderTracking() {
  const { user } = useAuth();
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);   // only true on first load
  const [error, setError]       = useState(null);
  const [filter, setFilter]     = useState("all");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [countdown, setCountdown]    = useState(10);

  // Track previous statuses to detect changes
  const prevStatusesRef = useRef({});  // { orderId: status }

  const STATUS_LABELS = {
    pending:   "Order Placed",
    confirmed: "Confirmed ✅",
    preparing: "Being Prepared 👨‍🍳",
    ready:     "Ready for Pickup 🎉",
    completed: "Completed 🏁",
    cancelled: "Cancelled ❌",
  };

  const fetchOrders = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`${API_BASE_URL}/orders/my-orders`, { headers: authHeader() });
      const data = await res.json();
      if (data.success) {
        const sorted = (data.data || []).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        // Detect status changes and notify
        const prev = prevStatusesRef.current;
        const isFirstLoad = Object.keys(prev).length === 0;

        if (!isFirstLoad) {
          sorted.forEach((order) => {
            const oldStatus = prev[order.id];
            if (oldStatus && oldStatus !== order.status) {
              const label = STATUS_LABELS[order.status] || order.status;
              const orderNum = order.orderNumber || `#${order.id?.slice(-6).toUpperCase()}`;
              toast.success(
                `Order ${orderNum}: ${label}`,
                { duration: 6000, icon: "📦" }
              );
            }
          });
        }

        // Update tracked statuses
        const newStatuses = {};
        sorted.forEach((o) => { newStatuses[o.id] = o.status; });
        prevStatusesRef.current = newStatuses;

        setOrders(sorted);
        setLastUpdated(new Date());
        setCountdown(10);
      } else {
        setError(data.message || "Failed to load orders");
      }
    } catch {
      if (!isBackground) setError("Could not connect to server. Is the backend running?");
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchOrders(false);
  }, [fetchOrders]);

  // Background auto-refresh every 10s
  useEffect(() => {
    const interval = setInterval(() => fetchOrders(true), 10_000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // Countdown ticker
  useEffect(() => {
    const tick = setInterval(() => setCountdown((c) => (c > 0 ? c - 1 : 10)), 1000);
    return () => clearInterval(tick);
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 px-4">
        <div className="text-center bg-white dark:bg-gray-800 rounded-2xl p-10 shadow border border-gray-200 dark:border-gray-700 max-w-sm">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Login Required</h2>
          <p className="text-gray-500 mb-6">Please login to see your orders.</p>
          <Link to="/login" className="bg-red-500 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-red-600 transition">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const FILTERS = ["all", "pending", "confirmed", "preparing", "ready", "completed", "cancelled"];
  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);
  const activeCount = orders.filter((o) => !["completed", "cancelled"].includes(o.status)).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📦 My Orders</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {activeCount > 0
                ? `${activeCount} active order${activeCount > 1 ? "s" : ""} in progress`
                : "Track all your past and current orders"}
            </p>
            {lastUpdated && (
              <p className="text-xs text-gray-400 mt-1">
                🔄 Auto-refreshing in <span className="font-mono font-bold text-red-500">{countdown}s</span>
                {" · "}
                Last updated {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </p>
            )}
          </div>
          <button
            onClick={() => { fetchOrders(false); }}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:border-red-400 transition"
          >
            ↻ Refresh now
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                filter === f
                  ? "bg-red-500 text-white shadow"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-red-300"
              }`}
            >
              {f === "all" ? `All (${orders.length})` : f}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-12 w-12 rounded-full border-4 border-red-500 border-t-transparent" />
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="text-red-700 dark:text-red-400 font-medium">{error}</p>
            <button onClick={fetchOrders} className="mt-4 text-sm text-red-500 hover:underline">Try again</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="text-5xl mb-4">🛍️</div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No orders found</h3>
            <p className="text-gray-500 mb-6">
              {filter === "all" ? "You haven't placed any orders yet." : `No ${filter} orders.`}
            </p>
            <Link
              to="/menu"
              className="bg-gradient-to-r from-red-500 to-orange-400 text-white px-6 py-2.5 rounded-xl font-semibold hover:from-red-600 hover:to-orange-500 transition"
            >
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
