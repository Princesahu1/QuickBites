import { useEffect, useRef, useCallback } from "react";
import { toast } from "react-hot-toast";
import { API_BASE_URL } from "../config/api";

const POLL_INTERVAL_MS = 30_000; // 30 seconds
const STORAGE_KEY = "qb_admin_last_order_count";

/**
 * Polls GET /api/admin/orders every 30s when the user is an admin.
 * Shows a browser notification + toast when new orders arrive.
 */
export default function useAdminOrderNotifications(user) {
    const isAdmin = user?.role === "admin";
    const lastCountRef = useRef(null); // null = first load (no notification)

    // Request browser notification permission once
    useEffect(() => {
        if (!isAdmin) return;
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }
    }, [isAdmin]);

    const checkForNewOrders = useCallback(async () => {
        if (!isAdmin) return;
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        try {
            const res = await fetch(`${API_BASE_URL}/admin/orders`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok) return;
            const data = await res.json();
            if (!data.success) return;

            const orders = data.data || [];
            const currentCount = orders.length;

            // Count only orders that are "pending" (newly arrived)
            const pendingOrders = orders.filter((o) => o.status === "pending");

            if (lastCountRef.current === null) {
                // First load — just record count, don't notify
                lastCountRef.current = currentCount;
                return;
            }

            const newOrderCount = currentCount - lastCountRef.current;
            if (newOrderCount > 0) {
                lastCountRef.current = currentCount;

                // Toast notification
                toast(
                    (t) => (
                        <div
                            onClick={() => {
                                toast.dismiss(t.id);
                                window.location.href = "/admin";
                            }}
                            className="cursor-pointer"
                        >
                            <p className="font-bold text-gray-900">
                                🛎️ {newOrderCount} New Order{newOrderCount > 1 ? "s" : ""}!
                            </p>
                            <p className="text-sm text-gray-500">
                                {pendingOrders.length} order{pendingOrders.length !== 1 ? "s" : ""} waiting. Click to manage.
                            </p>
                        </div>
                    ),
                    {
                        duration: 8000,
                        style: {
                            background: "#fff",
                            border: "2px solid #ef4444",
                            borderRadius: "12px",
                            padding: "12px 16px",
                        },
                    }
                );

                // Browser notification (works even if tab is not focused)
                if ("Notification" in window && Notification.permission === "granted") {
                    const notif = new Notification("🍔 Quick Bite — New Order!", {
                        body: `${newOrderCount} new order${newOrderCount > 1 ? "s" : ""} arrived. Tap to open Admin.`,
                        icon: "/favicon.ico",
                        tag: "new-order", // replaces previous notification instead of stacking
                    });
                    notif.onclick = () => {
                        window.focus();
                        window.location.href = "/admin";
                        notif.close();
                    };
                }
            } else {
                lastCountRef.current = currentCount;
            }
        } catch {
            // Silently ignore network errors in background poll
        }
    }, [isAdmin]);

    useEffect(() => {
        if (!isAdmin) return;

        // Run immediately, then every POLL_INTERVAL_MS
        checkForNewOrders();
        const interval = setInterval(checkForNewOrders, POLL_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [isAdmin, checkForNewOrders]);
}
