// AdminDashboard.js
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/admin/login');
  };

  return (
    <div className="flex min-h-screen  bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/5 bg-gray-800 text-white p-4 fixed h-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Admin Dashboard</h2>
          
        </div>
        <nav>
          <ul>
            <li className="mb-4">
              <NavLink
                to="dashboard"
                className={({ isActive }) =>
                  isActive ? 'text-blue-300' : 'hover:text-gray-300'
                }
              >
                Dashboard
              </NavLink>
            </li>
            <li className="mb-4">
              <NavLink
                to="users"
                className={({ isActive }) =>
                  isActive ? 'text-blue-300' : 'hover:text-gray-300'
                }
              >
                Customers
              </NavLink>
            </li>
            <li className="mb-4">
              <NavLink
                to="products"
                className={({ isActive }) =>
                  isActive ? 'text-blue-300' : 'hover:text-gray-300'
                }
              >
                Products
              </NavLink>
            </li>
            <li className="mb-4">
              <NavLink
                to="orders"
                className={({ isActive }) =>
                  isActive ? 'text-blue-300' : 'hover:text-gray-300'
                }
              >
                Orders
              </NavLink>
            </li>
            {/* Add more navigation links as needed */}
          </ul>
        </nav>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Đăng xuất
        </button>
      </div>

      {/* Main Content */}
      <div className="w-4/5 ml-[20%] p-8">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminDashboard;
