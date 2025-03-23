// src/pages/ProductDetailPage.js
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { addToCartAsync } from '../features/cart/cartSlice';
import { useState } from 'react';

const ProductDetailPage = () => {
  const { id } = useParams();
  const product = useSelector((state) =>
    state.product.products.find((p) => p._id === id) // Sử dụng _id theo model mongoose
  );
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

  if (!product) {
    return <div className="text-center py-16">Không tìm thấy sản phẩm</div>;
  }

  const handleAddToCart = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      alert('Vui lòng chọn kích thước.');
      return;
    }
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      alert('Vui lòng chọn màu sắc.');
      return;
    }
    dispatch(addToCartAsync({ ...product, quantity, selectedSize, selectedColor }));
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
          {/* Hình ảnh sản phẩm */}
          <div>
            <img
              src={product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/400'} // Hiển thị ảnh đầu tiên hoặc placeholder
              alt={product.name}
              className="w-full h-auto object-cover rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
            />
            {/* Thêm gallery ảnh nhỏ hơn nếu có nhiều ảnh */}
            {product.images && product.images.length > 1 && (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {product.images.slice(1).map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`${product.name} - ${index + 1}`}
                    className="w-full h-24 object-cover rounded-md cursor-pointer hover:opacity-90"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Thông tin chi tiết sản phẩm */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
            <div className="flex items-center mb-4">
              <span className="text-gray-700 mr-2">Thương hiệu:</span>
              <span className="font-semibold">{product.brand}</span>
            </div>
            <div className="mb-4">
              <span className="text-gray-700 mr-2">Giá:</span>
              <span className="text-2xl font-semibold text-green-600">
                {product.price?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
              </span>
              {product.discount && (
                <span className="ml-2 text-red-500 line-through">
                  {(product.price * (1 + product.discount.amount / 100))?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                </span>
              )}
              {product.discount && (
                <span className="ml-2 text-sm bg-red-100 text-red-500 px-2 py-1 rounded-full">
                  Giảm {product.discount.amount}%
                </span>
              )}
            </div>
            <p className="text-gray-600 mb-6">{product.description}</p>

            {/* Chọn kích thước */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Kích thước:</label>
                <div className="flex items-center space-x-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      className={`px-4 py-2 rounded-md border border-gray-400 text-gray-700 hover:border-blue-500 hover:text-blue-500 focus:outline-none ${selectedSize === size ? 'bg-blue-500 text-white border-blue-500' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chọn màu sắc */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Màu sắc:</label>
                <div className="flex items-center space-x-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full cursor-pointer shadow-md focus:outline-none ${selectedColor === color ? 'ring-2 ring-blue-500' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                    ></button>
                  ))}
                </div>
              </div>
            )}

            {/* Số lượng */}
            <div className="mb-6">
              <label htmlFor="quantity" className="block text-gray-700 text-sm font-bold mb-2">Số lượng:</label>
              <div className="flex items-center space-x-3">
                <button
                  className="px-3 py-2 border rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none"
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                >
                  -
                </button>
                <input
                  type="number"
                  id="quantity"
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="w-16 text-center border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                />
                <button
                  className="px-3 py-2 border rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none"
                  onClick={() => setQuantity(prev => prev + 1)}
                >
                  +
                </button>
              </div>
            </div>

            {/* Nút thêm vào giỏ hàng */}
            <button
              onClick={handleAddToCart}
              className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Thêm vào giỏ hàng
            </button>

            {/* Link quay lại trang sản phẩm */}
            <div className="mt-6">
              <Link to="/products" className="text-blue-500 hover:underline">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                </svg>
                Quay lại trang sản phẩm
              </Link>
            </div>
          </div>
        </div>

        {/* Mô tả chi tiết sản phẩm (có thể đặt bên dưới grid hoặc trong tab) */}
        <div className="p-8 border-t border-gray-200 mt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Mô tả sản phẩm</h3>
          <p className="text-gray-700">{product.description}</p>
          {product.material && (
            <p className="text-gray-700 mt-2">Chất liệu: {product.material}</p>
          )}
          {product.stockQuantity !== undefined && (
            <p className={`mt-2 font-semibold ${product.stockQuantity > 0 ? 'text-green-500' : 'text-red-500'}`}>
              Tình trạng: {product.stockQuantity > 0 ? 'Còn hàng' : 'Hết hàng'}
            </p>
          )}
        </div>

        {/* Sản phẩm liên quan (tùy chọn) */}
        {/* <div className="py-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Lặp qua các sản phẩm liên quan */}
        {/* </div>
        </div> */}
      </div>
    </div>
  );
};

export default ProductDetailPage;