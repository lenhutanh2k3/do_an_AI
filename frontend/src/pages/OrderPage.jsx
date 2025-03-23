// src/pages/OrderPage.js
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { placeOrder } from '../features/order/orderSlice';
import { useNavigate } from 'react-router-dom';

const OrderPage = () => {
  const cartItems = useSelector((state) => state.cart.items);
  const [shippingInfo, setShippingInfo] = useState({ address: '', city: '', zip: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const subtotal = calculateSubtotal();
  const shippingFee = 30000; // Placeholder shipping fee
  const discount = 0; // Placeholder discount
  const total = subtotal + shippingFee - discount;

  const handleSubmit = (e) => {
    e.preventDefault();
    const order = {
      items: cartItems.map(item => ({ id: item.id, quantity: item.quantity })),
      shipping: shippingInfo,
      total: total,
    };
    dispatch(placeOrder(order))
      .unwrap()
      .then(() => navigate('/order-history'))
      .catch((error) => console.error('Đặt hàng thất bại:', error));
  };

  return (
    <div className="bg-gray-100 py-8">
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Column: Shipping Information */}
          <div className="p-6 border-r border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Thông tin giao hàng</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="address" className="block text-gray-700 text-sm font-bold mb-2">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={shippingInfo.address}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="city" className="block text-gray-700 text-sm font-bold mb-2">
                  Thành phố
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={shippingInfo.city}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="zip" className="block text-gray-700 text-sm font-bold mb-2">
                  Mã bưu điện
                </label>
                <input
                  type="text"
                  id="zip"
                  name="zip"
                  value={shippingInfo.zip}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
            </form>
          </div>

          {/* Right Column: Order Summary */}
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Đơn hàng của bạn</h2>
            {cartItems.length === 0 ? (
              <p className="text-gray-600">Giỏ hàng trống.</p>
            ) : (
              <ul className="divide-y divide-gray-200 mb-4">
                {cartItems.map((item) => (
                  <li key={item.id} className="py-3 flex items-center justify-between">
                    <div className="flex-grow">
                      <h6 className="font-semibold text-gray-700">{item.name}</h6>
                      <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                    </div>
                    <span className="font-medium text-gray-700">{(item.price * item.quantity).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Order Summary Details */}
            <div className="bg-gray-50 rounded-md p-4">
              <div className="flex justify-between text-gray-600 mb-2">
                <span>Tổng tiền hàng:</span>
                <span>{subtotal.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>
              </div>
              <div className="flex justify-between text-gray-600 mb-2">
                <span>Phí giao hàng:</span>
                <span>{shippingFee.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600 mb-2">
                  <span>Giảm giá:</span>
                  <span>-{discount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold text-gray-800">
                <span>Tổng cộng:</span>
                <span>{total.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Phương thức thanh toán</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="radio" name="payment" value="cod" className="form-radio h-5 w-5 text-blue-600" />
                  <span className="ml-2 text-gray-700">Thanh toán khi nhận hàng (COD)</span>
                </label>
                <label className="flex items-center">
                  <input type="radio" name="payment" value="online" className="form-radio h-5 w-5 text-blue-600" />
                  <span className="ml-2 text-gray-700">Thanh toán trực tuyến</span>
                </label>
                {/* Add more payment methods here */}
              </div>
            </div>

            <button
              type="submit"
              className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              onClick={handleSubmit}
            >
              Đặt hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;