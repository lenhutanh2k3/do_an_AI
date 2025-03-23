import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { fetchCart, removeFromCartAsync, updateQuantityAsync } from '../features/cart/cartSlice';
import { Link } from 'react-router-dom';

const CartPage = () => {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const { items, status, error } = cart;

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleRemove = (id) => {
    dispatch(removeFromCartAsync(id)).then(() => dispatch(fetchCart())); // Làm mới giỏ hàng
  };

  const handleQuantityChange = (id, quantity) => {
    const parsedQuantity = parseInt(quantity, 10);
    if (!isNaN(parsedQuantity) && parsedQuantity > 0) {
      dispatch(updateQuantityAsync({ id, quantity: parsedQuantity })).then(() => dispatch(fetchCart())); // Làm mới giỏ hàng
    }
  };

  if (status === 'loading') return <div>Đang tải giỏ hàng...</div>;
  if (status === 'failed') return <div>Lỗi: {error}</div>;

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="bg-gray-100 py-8">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Giỏ hàng của bạn</h2>
        </div>
        <div className="p-6">
          {items.length === 0 ? (
            <div className="text-center py-10">
              <p className="mt-1 text-lg font-medium text-gray-600">Giỏ hàng trống.</p>
              <Link to="/" className="mt-4 inline-block bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded">
                Tiếp tục mua sắm
              </Link>
            </div>
          ) : (
            <>
              <ul className="divide-y divide-gray-200">
                {items.map((item) => (
                  <li key={item.product._id} className="py-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <img
                        src={item.product.images && item.product.images[0] ? item.product.images[0] : 'default-image.jpg'}
                        alt={item.product.name}
                        className="w-20 h-20 mr-4 rounded-md"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{item.product.name}</h3>
                        <p className="text-gray-600">{item.product.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.product._id, e.target.value)}
                        className="w-20 text-center py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                      />
                      <button onClick={() => handleRemove(item.product._id)} className="ml-4 text-red-500 hover:text-red-700">
                        Xóa
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-6 py-4 px-4 sm:px-6 bg-gray-50 border-t border-gray-200">
                <div className="flex justify-between text-gray-700">
                  <span>Tổng cộng:</span>
                  <span className="font-semibold">{total.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>
                </div>
                <Link to="/order" className="mt-4 block bg-green-500 hover:bg-green-700 text-white font-semibold py-3 rounded-md text-center">
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