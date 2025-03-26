// src/pages/ProductManagement.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NavLink, useNavigate } from 'react-router-dom';

const serverDomain = 'http://localhost:5000'; // Đảm bảo serverDomain trỏ đúng đến server backend

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const navigate = useNavigate();

    // Lấy dữ liệu sản phẩm từ API
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(`${serverDomain}/api/product/`);
                console.log(response.data.data.products);
                setProducts(response.data.data.products);
            } catch (error) {
                console.error('Lỗi khi lấy dữ liệu:', error);
            }
        };
        fetchProducts();
    }, []);

    // Hàm xử lý xóa sản phẩm
    const handleDelete = async (productId) => {
        try {
            await axios.delete(`${serverDomain}/api/product/${productId}`);
            // Cập nhật lại danh sách sản phẩm sau khi xóa
            setProducts(products.filter(product => product._id !== productId));
        } catch (error) {
            console.error('Lỗi khi xóa sản phẩm:', error);
        }
    };

    // Hàm xử lý sửa sản phẩm
    const handleEdit = (productId) => {
        navigate(`/admin/form-product/${productId}`); 
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Product Management</h2>
            <NavLink to="/admin/form-product">
                <button className="bg-blue-500 text-white px-4 py-2 rounded mb-4 hover:bg-blue-600">
                    Thêm sản phẩm mới
                </button>
            </NavLink>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white shadow-md rounded-lg">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="py-3 px-4 text-left text-gray-600 font-semibold">STT</th>
                            <th className="py-3 px-4 text-left text-gray-600 font-semibold">Tên sản phẩm</th>
                            <th className="py-3 px-4 text-left text-gray-600 font-semibold">Số lượng</th>
                            <th className="py-3 px-4 text-left text-gray-600 font-semibold">Hình ảnh</th>
                            <th className="py-3 px-4 text-left text-gray-600 font-semibold">Giá</th>
                            <th className="py-3 px-4 text-left text-gray-600 font-semibold">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product, index) => {
                            const imageUrl = product.images && product.images[0]
                                ? `${serverDomain}${product.images[0]}`
                                : `${serverDomain}/uploads/default-image.jpg`;

                            return (
                                <tr key={product._id} className="border-b hover:bg-gray-50">
                                    <td className="py-3 px-4">{index + 1}</td>
                                    <td className="py-3 px-4">{product.name}</td>
                                    <td className="py-3 px-4">{product.stockQuantity}</td>
                                    {/* Hiển thị hình ảnh sản phẩm */}
                                    <td className="py-3 px-4">
                                        <img
                                            src={imageUrl}
                                            alt={product.name}
                                            className="h-16 w-16 object-cover"
                                        />
                                    </td>
                                    <td className="py-3 px-4">{product.price} VNĐ</td>
                                    <td className="py-3 px-4 flex space-x-2">
                                        <button
                                            onClick={() => handleEdit(product._id)}
                                            className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product._id)}
                                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProductManagement;
