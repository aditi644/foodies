import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import RoleSelection from './pages/RoleSelection';
import RoleRegistration from './pages/RoleRegistration';
import RestaurantDashboard from './pages/restaurant/RestaurantDashboard';
import DeliveryDashboard from './pages/delivery/DeliveryDashboard';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import RestaurantDetail from './pages/customer/RestaurantDetail';
import Checkout from './pages/customer/Checkout';
import OrderTracking from './pages/customer/OrderTracking';
import RateOrder from './pages/customer/RateOrder';
import OrderHistory from './pages/customer/OrderHistory';

const App = () => {
  const { initAuth } = useAuthStore();

  useEffect(() => {
    // Initialize Supabase auth on app load
    initAuth();
  }, [initAuth]);

  return (
    <Routes>
      {/* Landing page */}
      <Route path="/" element={<Landing />} />
      
      {/* Authentication pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      {/* Role selection and registration */}
      <Route path="/role-selection" element={<RoleSelection />} />
      <Route path="/register/:role" element={<RoleRegistration />} />
      
      {/* Protected routes - redirects based on role */}
      <Route path="/home" element={<Home />} />
      
      {/* Restaurant Owner Routes */}
      <Route path="/restaurant/dashboard" element={<RestaurantDashboard />} />
      
      {/* Delivery Partner Routes */}
      <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />
      
      {/* Customer Routes */}
      <Route path="/customer/dashboard" element={<CustomerDashboard />} />
      <Route path="/customer/restaurant/:restaurantId" element={<RestaurantDetail />} />
      <Route path="/customer/checkout" element={<Checkout />} />
      <Route path="/customer/order/:orderId" element={<OrderTracking />} />
      <Route path="/customer/rate-order/:orderId" element={<RateOrder />} />
      <Route path="/customer/orders" element={<OrderHistory />} />
    </Routes>
  );
};

export default App;
