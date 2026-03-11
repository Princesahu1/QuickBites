// src/App.jsx
import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import AuthProvider from "./context/AuthContext";
import CartProvider from "./context/CartContext";
import OrdersProvider from "./context/OrdersContext";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import OrderTracking from "./pages/OrderTracking";
import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <OrdersProvider>
          <Navbar />
          <main className="min-h-screen">
            <Suspense
              fallback={<div className="p-8 text-center">Loading…</div>}
            >
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/orders" element={<OrderTracking />} />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <Admin />
                    </AdminRoute>
                  }
                />
              </Routes>
            </Suspense>
          </main>
          <Footer />
          <Toaster position="top-right" />
        </OrdersProvider>
      </CartProvider>
    </AuthProvider>
  );
}
