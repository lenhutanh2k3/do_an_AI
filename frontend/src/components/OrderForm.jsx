// src/components/OrderForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const OrderForm = ({ orderId, onSuccess }) => {
    const [orderData, setOrderData] = useState({
        status: 'Pending'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const isEditMode = !!orderId;

    useEffect(() => {
        if (isEditMode) {
            const fetchOrder = async () => {
                try {
                    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/order/${orderId}`, {
                        withCredentials: true
                    });
                    const order = response.data.data;
                    setOrderData({
                        status: order.status
                    });
                } catch (err) {
                    setError('Không thể tải dữ liệu đơn hàng');
                    console.error('Fetch error:', err);
                }
            };
            fetchOrder();
        }
    }, [orderId, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setOrderData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const url = isEditMode
                ? `${import.meta.env.VITE_BACKEND_URL}/api/order/${orderId}`
                : `${import.meta.env.VITE_BACKEND_URL}/api/order`;

            const response = isEditMode
                ? await axios.put(url, { status: orderData.status }, {
                    withCredentials: true,
                    headers: { 'Content-Type': 'application/json' }
                })
                : await axios.post(url, orderData, { // Tạm thời để trống, cần thêm logic tạo đơn hàng
                    withCredentials: true,
                    headers: { 'Content-Type': 'application/json' }
                });

            if (response.status === 200 || response.status === 201) {
                onSuccess?.(response.data);
                alert(`Thao tác ${isEditMode ? 'cập nhật' : 'thêm'} thành công!`);
            }
        } catch (err) {
            const serverError = err.response?.data?.message || 'Lỗi máy chủ';
            setError(serverError);
            console.error('Submit error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6">
                {isEditMode ? 'Cập nhật trạng thái đơn hàng' : 'Thêm đơn hàng mới'}
            </h2>

            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Trạng thái *</label>
                    <select
                        name="status"
                        value={orderData.status}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2 px-4 rounded text-white font-medium ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                    {loading ? 'Đang xử lý...' : (isEditMode ? 'Cập nhật' : 'Thêm mới')}
                </button>
            </form>
        </div>
    );
};

export default OrderForm;