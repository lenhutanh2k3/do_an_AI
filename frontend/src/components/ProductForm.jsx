import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
const ProductForm = ({ productId, onSuccess }) => {
    const [productData, setProductData] = useState({
        name: '',
        price: '',
        category: '',
        sizes: '',
        colors: '',
        brand: '',
        material: '',
        stockQuantity: '',
        images: [], 
        discount: '',
        description: ''
    });

    const [categories, setCategories] = useState([]);
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const isEditMode = !!productId;

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [categoriesRes, discountsRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/category`),
                    axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/discount`)
                ]);

                setCategories(categoriesRes.data.data);
                setDiscounts(discountsRes.data.data);

                if (isEditMode) {
                    const productRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/product/${productId}`);
                    const product = productRes.data.data;
                    console.log(product);
                    setProductData({
                        ...product,
                        sizes: product.sizes.join(', '),
                        colors: product.colors.join(', '),
                        discount: product.discount?._id || '',
                        images: product.images || [] ,
                        category:product.category?._id || ''
                    });
                }
            } catch (err) {
                setError('Không thể tải dữ liệu khởi tạo');
                console.error('Fetch error:', err);
            }
        };

        fetchInitialData();
    }, [productId, isEditMode]);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setProductData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files); // Lấy danh sách file từ input
        setProductData(prev => ({
            ...prev,
            images: files // Lưu file trực tiếp vào state
        }));
    };

    const validateForm = () => {
        const requiredFields = ['name', 'price', 'category', 'stockQuantity'];
        const missingFields = requiredFields.filter(field => !productData[field]);

        if (missingFields.length > 0) {
            setError(`Vui lòng điền các trường bắt buộc: ${missingFields.join(', ')}`);
            return false;
        }

        if (isNaN(productData.price) || isNaN(productData.stockQuantity)) {
            setError('Giá và số lượng phải là số');
            return false;
        }

        if (!isEditMode && productData.images.length === 0) {
            setError('Vui lòng upload ít nhất một ảnh');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        console.log(productData);
        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('name', productData.name);
            formData.append('price', productData.price);
            formData.append('category', productData.category);
            formData.append('sizes', productData.sizes);
            formData.append('colors', productData.colors);
            formData.append('brand', productData.brand);
            formData.append('material', productData.material);
            formData.append('stockQuantity', productData.stockQuantity);
            formData.append('description', productData.description);
            if (productData.discount) {
                formData.append('discount', productData.discount);
            }

            // Thêm file ảnh vào FormData nếu có (cả chế độ thêm mới và chỉnh sửa)
            if (productData.images.length > 0 && productData.images[0] instanceof File) {
                productData.images.forEach((file) => {
                    formData.append('images', file);
                });
            }
            for (let [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }
            const url = isEditMode
                ? `${import.meta.env.VITE_BACKEND_URL}/api/product/${productId}`
                : `${import.meta.env.VITE_BACKEND_URL}/api/product`;

            console.log(url);
            const response = isEditMode
                ? await axios.put(url, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
                : await axios.post(url, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

            if (response.status === 200 || response.status === 201) {
                onSuccess?.(response.data);
                alert(`Thao tác ${isEditMode ? 'cập nhật' : 'thêm'} thành công!`);
                if (!isEditMode) {
                    setProductData({
                        name: '',
                        price: '',
                        category: '',
                        sizes: '',
                        colors: '',
                        brand: '',
                        material: '',
                        stockQuantity: '',
                        images: [], // Reset về mảng rỗng
                        discount: '',
                        description: ''
                    });
                }
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
                {isEditMode ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
            </h2>

            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Tên sản phẩm */}
                <div>
                    <label className="block text-sm font-medium mb-1">Tên sản phẩm *</label>
                    <input
                        type="text"
                        name="name"
                        value={productData.name}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>

                {/* Giá và Số lượng */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Giá *</label>
                        <input
                            type="number"
                            name="price"
                            value={productData.price}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            min="0"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Số lượng *</label>
                        <input
                            type="number"
                            name="stockQuantity"
                            value={productData.stockQuantity}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            min="0"
                            required
                        />
                    </div>
                </div>

                {/* Danh mục và Giảm giá */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Danh mục *</label>
                        <select
                            name="category"
                            value={productData.category}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            required
                        >
                            <option value="">Chọn danh mục</option>
                            {categories.map(category => (
                                <option key={category._id} value={category._id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Giảm giá</label>
                        <select
                            name="discount"
                            value={productData.discount}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        >
                            <option value="">Không áp dụng</option>
                            {discounts.map(discount => (
                                <option key={discount._id} value={discount._id}>
                                    {discount.code} ({discount.amount}%)
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Kích thước và Màu sắc */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Kích thước (cách nhau bằng dấu phẩy)</label>
                        <input
                            type="text"
                            name="sizes"
                            value={productData.sizes}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Màu sắc (cách nhau bằng dấu phẩy)</label>
                        <input
                            type="text"
                            name="colors"
                            value={productData.colors}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                </div>

                {/* Thương hiệu và Chất liệu */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Thương hiệu</label>
                        <input
                            type="text"
                            name="brand"
                            value={productData.brand}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Chất liệu</label>
                        <input
                            type="text"
                            name="material"
                            value={productData.material}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                </div>

                {/* Mô tả */}
                <div>
                    <label className="block text-sm font-medium mb-1">Mô tả</label>
                    <textarea
                        name="description"
                        value={productData.description}
                        onChange={handleChange}
                        rows="4"
                        className="w-full p-2 border rounded"
                    />
                </div>

                {/* Hình ảnh */}
                <div>
                    <label className="block text-sm font-medium mb-1">Hình ảnh</label>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="w-full p-2 border rounded"
                    />
                    {isEditMode && productData.images.length > 0 && (
                        <div className="flex space-x-2 mt-2">
                            {productData.images.map((img, index) => (
                                <img
                                    key={index}
                                    src={`${img}`} // Đường dẫn ảnh từ server
                                    alt={`Preview ${index + 1}`}
                                    className="h-32 object-cover rounded"
                                />
                            ))}
                        </div>
                    )}
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

export default ProductForm;