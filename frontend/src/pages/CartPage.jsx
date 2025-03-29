import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { NavLink, Link } from 'react-router-dom';
import { removeFromCartLocal, updateQuantityLocal, setCart } from '../features/cart/cartSlice';

const CartPage = () => {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.cart);

  // Load giỏ hàng từ localStorage khi component mount
  useEffect(() => {
    const localCart = JSON.parse(localStorage.getItem('cart')) || [];
    dispatch(setCart(localCart));
  }, [dispatch]);

  const handleRemove = (id) => {
    dispatch(removeFromCartLocal(id));
  };

  const handleQuantityChange = (id, quantity) => {
    const parsedQuantity = parseInt(quantity, 10);
    if (!isNaN(parsedQuantity) && parsedQuantity > 0) {
      dispatch(updateQuantityLocal({ id, quantity: parsedQuantity }));
    }
  };

  // Hàm cập nhật lựa chọn (kích thước/màu sắc) của một mặt hàng trong giỏ
  const updateItemOptions = (id, newOptions) => {
    const updatedItems = items.map((item) =>
      item.product._id === id ? { ...item, ...newOptions } : item
    );
    dispatch(setCart(updatedItems));
    localStorage.setItem('cart', JSON.stringify(updatedItems));
  };

  // Hàm tính giá sau discount (nếu có)
  const calculatePrice = (product) => {
    return product.discount
      ? product.price * (1 - product.discount.amount / 100)
      : product.price;
  };

  // Tính tổng tiền
  const total = items.reduce(
    (sum, item) => sum + calculatePrice(item.product) * item.quantity,
    0
  );

  return (
    <div className="bg-gray-100 py-12">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 text-center">Giỏ hàng của bạn</h2>
        </div>
        <div className="p-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl font-medium text-gray-600">Giỏ hàng trống.</p>
              <Link
                to="/"
                className="mt-6 inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-full transition duration-300"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          ) : (
            <>
              <ul className="divide-y divide-gray-200">
                {items.map((item) => (
                  <li key={item.product._id} className="py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        src={
                          item.product.images && item.product.images[0]
                            ? `${import.meta.env.VITE_BACKEND_URL}${item.product.images[0]}`
                            : '/uploads/default-image.jpg'
                        }
                        alt={item.product.name}
                        className="w-24 h-24 object-cover rounded-md"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{item.product.name}</h3>
                        {item.product.discount ? (
                          <>
                            <p className="text-sm text-gray-500 line-through">
                              {item.product.price.toLocaleString('vi-VN', {
                                style: 'currency',
                                currency: 'VND',
                              })}
                            </p>
                            <p className="text-sm font-bold text-green-600">
                              {calculatePrice(item.product).toLocaleString('vi-VN', {
                                style: 'currency',
                                currency: 'VND',
                              })}
                            </p>
                          </>
                        ) : (
                          <p className="text-gray-600">
                            {item.product.price.toLocaleString('vi-VN', {
                              style: 'currency',
                              currency: 'VND',
                            })}
                          </p>
                        )}

                        {/* Hiển thị và cho phép thay đổi lựa chọn kích thước (nếu có) */}
                        {item.product.sizes && item.product.sizes.length > 0 && (
                          <div className="mt-2">
                            <label className="text-sm text-gray-700">Kích thước: </label>
                            <select
                              value={item.selectedSize || ''}
                              onChange={(e) =>
                                updateItemOptions(item.product._id, { selectedSize: e.target.value })
                              }
                              className="p-1 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="" disabled>
                                Chọn kích thước
                              </option>
                              {item.product.sizes.map((size) => (
                                <option key={size} value={size}>
                                  {size}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Hiển thị và cho phép thay đổi lựa chọn màu sắc (nếu có) */}
                        {item.product.colors && item.product.colors.length > 0 && (
                          <div className="mt-2">
                            <label className="text-sm text-gray-700">Màu sắc: </label>
                            <select
                              value={item.selectedColor || ''}
                              onChange={(e) =>
                                updateItemOptions(item.product._id, { selectedColor: e.target.value })
                              }
                              className="p-1 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="" disabled>
                                Chọn màu sắc
                              </option>
                              {item.product.colors.map((color) => (
                                <option key={color} value={color}>
                                  {color}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityChange(item.product._id, e.target.value)
                        }
                        className="w-20 py-2 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                      />
                      <button
                        onClick={() => handleRemove(item.product._id)}
                        className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition duration-200"
                      >
                        Xóa
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-8 py-4 px-6 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center">
                <span className="text-xl font-semibold text-gray-800">
                  Tổng cộng: {total.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                </span>
                <Link
                  to="/order"
                  className="mt-4 sm:mt-0 inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-full transition duration-300"
                >
                  Tiến hành thanh toán
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartPage;
