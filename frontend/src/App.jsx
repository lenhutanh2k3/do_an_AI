import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginPage from './pages/LoginPages';
import Home from './pages/Home';
import RegisterPage from './pages/RegisterPage';
import ProductDetailPage from './pages/ProductDetail';
import CartPage from './pages/CartPage';
import OrderPage from './pages/OrderPage';
import NotFound from './pages/NotFound';
import Mystore from './pages/Mystore';
import AdminDashboard from './pages/Admin/HomeAdmin';
import UsersManagement from './pages/Admin/UserManager';
import LoginAdmin from './pages/Admin/LoginAdmin';
import ProtectedRoute from './components/ProtectedRoute';
import { useDispatch } from 'react-redux';
import { loadUser } from './features/auth/authSlice';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/order" element={<OrderPage />} />
            <Route path="/mystore" element={<Mystore />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/admin/login" element={<LoginAdmin />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            >
              <Route path="users" element={<UsersManagement />} />
              <Route path="dashboard" element={<AdminDashboard />} />
            </Route>
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;