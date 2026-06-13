import React, { Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import AuthProvider from "./context/AuthContext";
import CartProvider from "./context/CartContext";
import OrdersProvider from "./context/OrdersContext";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import PageTransition from "./components/PageTransition";
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
  const location = useLocation();

  return (
    <AuthProvider>
      <CartProvider>
        <OrdersProvider>
          <Navbar />
          <div className="flex flex-col min-h-screen">
            <Suspense
              fallback={<div className="p-8 text-center"><div className="animate-pulse h-10 w-10 bg-coral-500 rounded-full mx-auto shadow-lg shadow-coral-500/20" /></div>}
            >
              <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                  <Route path="/" element={<PageTransition><Home /></PageTransition>} />
                  <Route path="/menu" element={<PageTransition><Menu /></PageTransition>} />
                  <Route path="/cart" element={<PageTransition><Cart /></PageTransition>} />
                  <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
                  <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
                  <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
                  <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
                  <Route path="/verify-email" element={<PageTransition><VerifyEmail /></PageTransition>} />
                  <Route path="/orders" element={<PageTransition><OrderTracking /></PageTransition>} />
                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute>
                        <PageTransition><Checkout /></PageTransition>
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/admin"
                    element={
                      <AdminRoute>
                        <PageTransition><Admin /></PageTransition>
                      </AdminRoute>
                    }
                  />
                </Routes>
              </AnimatePresence>
            </Suspense>
          </div>
          <Footer />
          <Toaster position="top-right" />
        </OrdersProvider>
      </CartProvider>
    </AuthProvider>
  );
}
