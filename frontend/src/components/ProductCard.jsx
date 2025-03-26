import React from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { addToCartLocal } from '../features/cart/cartSlice';
import { toast } from 'react-toastify';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const serverDomain = 'http://localhost:5000'; 

  const handleAddToCart = () => {
    dispatch(addToCartLocal({ product, quantity: 1 }));
    toast.success('Đã thêm vào giỏ hàng thành công!');
  };

  // Tính giá sau giảm giá nếu có
  const discountedPrice = product.discount
    ? product.price * (1 - product.discount.amount / 100)
    : product.price;

  // Lấy đường dẫn ảnh đầu tiên hoặc ảnh mặc định
  const imageUrl = product.images && product.images[0]
    ? `${serverDomain}${product.images[0]}`
    : `${serverDomain}/uploads/default-image.jpg`; // Đảm bảo có ảnh mặc định trong thư mục uploads

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md transition transform hover:scale-102 hover:shadow-xl duration-300 ease-in-out">
      <Link to={`/products/${product._id}`}>
        <div className="relative">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-56 object-cover rounded-t-xl"
          />
          {product.discount && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
              {product.discount.amount}% OFF
            </span>
          )}
        </div>
      </Link>
      <div className="p-4 space-y-2">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
        <div className="flex items-center justify-between">
          <div>
            {product.discount ? (
              <>
                <p className="text-sm text-gray-500 line-through">
                  {product.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                </p>
                <p className="text-lg font-bold text-green-600">
                  {discountedPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                </p>
              </>
            ) : (
              <p className="text-lg font-bold text-green-600">
                {product.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;