import React from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

const SearchPage = () => {
    const location = useLocation();
    const searchQuery = new URLSearchParams(location.search).get('query') || '';
    const products = useSelector((state) => state.product.products) || [];

    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-4">Kết quả tìm kiếm cho "{searchQuery}"</h2>
            {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            ) : (
                <p>Không tìm thấy sản phẩm nào.</p>
            )}
        </div>
    );
};

export default SearchPage;