// src/components/Footer.js
import { NavLink } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8 z-10">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Store Info */}
        <div>
          <h3 className="text-xl font-bold mb-4">My Shoe Store</h3>
          <p className="text-gray-400">
            Your one-stop shop for stylish and affordable footwear.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-bold mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li>
              <NavLink to="/products" className="hover:text-yellow-400 transition">
                Products
              </NavLink>
            </li>
            <li>
              <NavLink to="/cart" className="hover:text-yellow-400 transition">
                Cart
              </NavLink>
            </li>
            <li>
              <NavLink to="/order-history" className="hover:text-yellow-400 transition">
                Order History
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-xl font-bold mb-4">Contact Us</h3>
          <p className="text-gray-400">Email: support@myshoestore.com</p>
          <p className="text-gray-400">Phone: (123) 456-7890</p>
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center mt-8 text-gray-500">
        &copy; {new Date().getFullYear()} My Shoe Store. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;