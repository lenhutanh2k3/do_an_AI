// src/pages/admin/OrderManagement.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NavLink, useNavigate } from 'react-router-dom';


const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/order/`, {
                    withCredentials: true
                });
                setOrders(response.data.data.orders);
            } catch (error) {
                console.error('Lỗi khi lấy dữ liệu đơn hàng:', error);
            }
        };
        fetchOrders();
    }, []);

    const handleDelete = async (orderId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) {
            try {
                await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/order/${orderId}`, {
                    withCredentials: true
                });
                setOrders(orders.filter(order => order._id !== orderId));
            } catch (error) {
                console.error('Lỗi khi xóa đơn hàng:', error);
            }
        }
    };

    const handleEdit = (orderId) => {
        navigate(`/admin/form-order/${orderId}`);
    };

    const handleViewDetail = (orderId) => {
        navigate(`/admin/order-detail/${orderId}`); 
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Quản lý đơn hàng</h2>
            <NavLink to="/admin/form-order">
                <button className="bg-blue-500 text-white px-4 py-2 rounded mb-4 hover:bg-blue-600">
                    Thêm đơn hàng mới
                </button>
            </NavLink>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white shadow-md rounded-lg">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="py-3 px-4 text-left text-gray-600 font-semibold">STT</th>
                            <th className="py-3 px-4 text-left text-gray-600 font-semibold">Khách hàng</th>
                            <th className="py-3 px-4 text-left text-gray-600 font-semibold">Tổng tiền</th>
                            <th className="py-3 px-4 text-left text-gray-600 font-semibold">Trạng thái</th>
                            <th className="py-3 px-4 text-left text-gray-600 font-semibold">Ngày tạo</th>
                            <th className="py-3 px-4 text-left text-gray-600 font-semibold">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order, index) => (
                            <tr key={order._id} className="border-b hover:bg-gray-50">
                                <td className="py-3 px-4">{index + 1}</td>
                                <td className="py-3 px-4">{order.shippingAddress.split(',')[0] || 'Không xác định'}</td>
                                <td className="py-3 px-4">{(order.totalAmount).toLocaleString()} VNĐ</td>
                                <td className="py-3 px-4">{order.status}</td>
                                <td className="py-3 px-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td className="py-3 px-4 flex space-x-2">
                                    <button
                                        onClick={() => handleViewDetail(order._id)}
                                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                    >
                                        Xem
                                    </button>
                                    <button
                                        onClick={() => handleEdit(order._id)}
                                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        onClick={() => handleDelete(order._id)}
                                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                    >
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrderManagement;