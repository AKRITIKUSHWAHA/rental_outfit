import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import MyBookings from './pages/MyBookings';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminBookings from './pages/AdminBookings';
import AdminInventory from './pages/AdminInventory';
import AdminCustomers from './pages/AdminCustomers';
import AdminWhatsApp from './pages/AdminWhatsApp';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Protected Route Guard for logged in users
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Admin Route Guard
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return isAdmin ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow pt-16">
            <Routes>
              {/* Customer Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/outfit/:id" element={<ProductDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route path="/checkout" element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              } />
              
              <Route path="/my-bookings" element={
                <ProtectedRoute>
                  <MyBookings />
                </ProtectedRoute>
              } />

              {/* Admin Routes */}
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/dashboard" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />
              <Route path="/admin/bookings" element={
                <AdminRoute>
                  <AdminBookings />
                </AdminRoute>
              } />
              <Route path="/admin/inventory" element={
                <AdminRoute>
                  <AdminInventory />
                </AdminRoute>
              } />
              <Route path="/admin/customers" element={
                <AdminRoute>
                  <AdminCustomers />
                </AdminRoute>
              } />
              <Route path="/admin/whatsapp" element={
                <AdminRoute>
                  <AdminWhatsApp />
                </AdminRoute>
              } />
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
