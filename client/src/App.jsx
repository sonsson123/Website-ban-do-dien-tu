import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import AdminLayout from "./layouts/Adminlayout.jsx";
import LoginPage from "./page-ui/LoginPage";
import RegisterPage from "./page-ui/RegisterPage";
import HomePage from "./page-ui/HomePageAPI";
import ProductsPage from "./pages/ProductsPage";
import ProductDetail from "./pages/ProductDetail";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderHistory from "./pages/OrderHistory";
import PaymentResult from "./pages/PaymentResult";
import ProtectedRoute from "./components/ProtectedRoute";

// Root App
export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public user-facing routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/category/:categorySlug" element={<ProductsPage />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected user routes */}
          <Route 
            path="/cart" 
            element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/checkout" 
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/orders" 
            element={
              <ProtectedRoute>
                <OrderHistory />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/payment-result" 
            element={
              <ProtectedRoute>
                <PaymentResult />
              </ProtectedRoute>
            }
          />
          
          {/* Protected Admin routes - must have /admin prefix */}
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          />

          {/* Fallback for unknown routes */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}