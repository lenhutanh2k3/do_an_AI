// src/components/DiscountBanner.js
import { Link } from 'react-router-dom';

const DiscountBanner = ({ discount }) => {
  return (
    <div className="bg-yellow-400 text-black p-4 flex flex-col md:flex-row items-center justify-between">
      <div className="text-center md:text-left">
        <h2 className="text-2xl font-bold">{discount.title}</h2>
        <p className="mt-2">{discount.description}</p>
      </div>
      <Link
        to="/products"
        className="mt-4 md:mt-0 bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
      >
        Shop Now
      </Link>
    </div>
  );
};

export default DiscountBanner;