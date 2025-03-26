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
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DashboardOverview from './components/DashboardOverview';
import ProductManagement from './pages/Admin/ProductManager';
import FormProduct from './pages/Admin/FormProduct';
import OrderManagement from './pages/Admin/OrderManager';
import FormOrder from './pages/Admin/FormOrder';
import OrderDetailPage from './pages/Admin/OrderDetail';
function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  return (
    <Router>
      <ToastContainer />
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
              <Route path="dashboard" element={<DashboardOverview />} />
              <Route path="users" element={<UsersManagement />} />
              <Route path="products" element={<ProductManagement />}>
              </Route>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="form-product/:id" element={<FormProduct />} />
              <Route path="form-product" element={<FormProduct />} />
              <Route path="orders" element={<OrderManagement />} />
              <Route path="form-order/:id" element={<FormOrder />} />
              <Route path="form-order" element={<FormOrder />} />
              <Route path="order-detail/:id" element={<OrderDetailPage />} />
            </Route>
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;