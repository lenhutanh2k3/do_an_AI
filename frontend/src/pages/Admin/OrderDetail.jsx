// src/pages/admin/OrderDetailPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';



const OrderDetailPage = () => {
    const { id } = useParams(); // Lấy ID đơn hàng từ URL
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Lấy dữ liệu chi tiết đơn hàng từ API
    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/order/${id}`, {
                    withCredentials: true // Gửi cookie để xác thực
                });
                setOrder(response.data.data);
                setLoading(false);
            } catch (err) {
                setError('Không thể tải thông tin đơn hàng');
                setLoading(false);
                console.error('Fetch error:', err);
            }
        };
        fetchOrder();
    }, [id]);

    if (loading) {
        return <div className="text-center py-10">Đang tải...</div>;
    }

    if (error) {
        return (
            <div className="text-center py-10 text-red-500">
                {error}
                <button
                    onClick={() => navigate('/admin/orders')}
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Quay lại
                </button>
            </div>
        );
    }

    if (!order) {
        return <div className="text-center py-10">Không tìm thấy đơn hàng</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Chi tiết đơn hàng #{order._id}</h2>

            {/* Thông tin khách hàng */}
            <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Thông tin khách hàng</h3>
                <p><strong>Tên:</strong> {order.user?.fullName || 'Không xác định'}</p>
                <p><strong>Email:</strong> {order.user?.email || 'Không có'}</p>
            </div>

            {/* Thông tin sản phẩm */}
            <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Sản phẩm</h3>
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="py-2 px-4 text-left">Tên sản phẩm</th>
                            <th className="py-2 px-4 text-left">Hình ảnh</th>
                            <th className="py-2 px-4 text-left">Số lượng</th>
                            <th className="py-2 px-4 text-left">Giá</th>
                            <th className="py-2 px-4 text-left">Tổng</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.products.map((item, index) => (
                            <tr key={item._id} className="border-b">
                                <td className="py-2 px-4">{item.product?.name || 'Không xác định'}</td>
                                <td className="py-2 px-4">
                                    {item.product?.images?.[0] ? (
                                        <img
                                            src={`${import.meta.env.VITE_BACKEND_URL}${item.product.images[0]}`}
                                            alt={item.product.name}
                                            className="h-16 w-16 object-cover rounded"
                                        />
                                    ) : (
                                        'Không có ảnh'
                                    )}
                                </td>
                                <td className="py-2 px-4">{item.quantity}</td>
                                <td className="py-2 px-4">{item.price.toLocaleString()} VNĐ</td>
                                <td className="py-2 px-4">{(item.quantity * item.price).toLocaleString()} VNĐ</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Thông tin giao hàng và thanh toán */}
            <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Thông tin giao hàng</h3>
                <p><strong>Địa chỉ:</strong> {order.shippingAddress}</p>
                <p><strong>Phương thức thanh toán:</strong> {order.paymentMethod || 'Không xác định'}</p>
                <p><strong>Ghi chú:</strong> {order.note || 'Không có'}</p>
            </div>

            {/* Trạng thái và tổng tiền */}
            <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Thông tin đơn hàng</h3>
                <p><strong>Trạng thái:</strong> {order.status}</p>
                <p><strong>Tổng tiền sản phẩm:</strong> {order.totalAmount.toLocaleString()} VNĐ</p>
                {order.shippingFee && (
                    <p><strong>Phí vận chuyển:</strong> {order.shippingFee.toLocaleString()} VNĐ</p>
                )}
                <p><strong>Tổng cộng:</strong> {(order.totalAmount + (order.shippingFee || 0)).toLocaleString()} VNĐ</p>
                <p><strong>Ngày tạo:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                <p><strong>Ngày cập nhật:</strong> {new Date(order.updatedAt).toLocaleString()}</p>
            </div>

            {/* Nút quay lại */}
            <button
                onClick={() => navigate('/admin/orders')}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
                Quay lại danh sách đơn hàng
            </button>
        </div>
    );
};

export default OrderDetailPage;