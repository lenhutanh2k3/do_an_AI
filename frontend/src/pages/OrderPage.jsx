import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const OrderPage = () => {
  const cartItems = useSelector((state) => state.cart.items);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [orderData, setOrderData] = useState({
    shippingAddress: {
      fullName: '',
      phone: '',
      address: '',
      city: '',
      district: '',
      ward: ''
    },
    paymentMethod: 'COD',
    note: ''
  });

  // Tính toán giá tiền
  const calculatePrice = (product) => {
    return product.discount
      ? product.price * (1 - product.discount.amount / 100)
      : product.price;
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + calculatePrice(item.product) * item.quantity,
    0
  );
  const shippingFee = 30000;
  const total = subtotal + shippingFee;

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setOrderData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setOrderData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Xử lý đặt hàng
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Chuẩn bị dữ liệu đơn hàng
      const orderItems = cartItems.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: calculatePrice(item.product),
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor
      }));

      const orderPayload = {
        items: orderItems,
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod,
        note: orderData.note,
        totalAmount: total,
        shippingFee: shippingFee
      };

      // Gọi API đặt hàng
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/order`, orderPayload, {
        withCredentials: true
      });

      toast.success('Đặt hàng thành công!');
      navigate('/', { 
        state: { orderId: response.data.data._id }
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Form thông tin giao hàng */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6">Thông tin giao hàng</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Họ và tên người nhận
                </label>
                <input
                  type="text"
                  name="shippingAddress.fullName"
                  value={orderData.shippingAddress.fullName}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  name="shippingAddress.phone"
                  value={orderData.shippingAddress.phone}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  name="shippingAddress.address"
                  value={orderData.shippingAddress.address}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tỉnh/Thành phố
                  </label>
                  <input
                    type="text"
                    name="shippingAddress.city"
                    value={orderData.shippingAddress.city}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Quận/Huyện
                  </label>
                  <input
                    type="text"
                    name="shippingAddress.district"
                    value={orderData.shippingAddress.district}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phường/Xã
                  </label>
                  <input
                    type="text"
                    name="shippingAddress.ward"
                    value={orderData.shippingAddress.ward}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Ghi chú
                </label>
                <textarea
                  name="note"
                  value={orderData.note}
                  onChange={handleChange}
                  rows="3"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Phương thức thanh toán
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={orderData.paymentMethod === 'COD'}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2">Thanh toán khi nhận hàng (COD)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="BANK"
                      checked={orderData.paymentMethod === 'BANK'}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2">Chuyển khoản ngân hàng</span>
                  </label>
                </div>
              </div>
            </form>
          </div>

          {/* Thông tin đơn hàng */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6">Chi tiết đơn hàng</h2>
            <div className="space-y-4">
              {cartItems.map((item) => {
                const imageUrl = item.product.images && item.product.images[0]
                  ? `${import.meta.env.VITE_BACKEND_URL}${item.product.images[0]}`
                  : `${import.meta.env.VITE_BACKEND_URL}/uploads/default-image.jpg`;

                return (
                  <div key={`${item.product._id}-${item.selectedSize}-${item.selectedColor}`}
                    className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={imageUrl}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `${import.meta.env.VITE_BACKEND_URL}/uploads/default-image.jpg`;
                        }}
                      />
                      <div>
                        <h3 className="font-medium">{item.product.name}</h3>
                        <p className="text-sm text-gray-500">
                          Size: {item.selectedSize}, Màu: {item.selectedColor}
                        </p>
                        <p className="text-sm text-gray-500">
                          Số lượng: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="font-medium">
                      {(calculatePrice(item.product) * item.quantity).toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                );
              })}

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span>{subtotal.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển:</span>
                  <span>{shippingFee.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Tổng cộng:</span>
                  <span className="text-indigo-600">{total.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading || cartItems.length === 0}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? 'Đang xử lý...' : 'Đặt hàng'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;