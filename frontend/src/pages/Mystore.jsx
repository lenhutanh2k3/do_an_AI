import React, { useState, useMemo } from 'react';
import ProductCard from '../components/ProductCard';
import { useSelector } from 'react-redux';

const Mystore = () => {
  const products = useSelector((state) => state.product.products) || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: [],
    sizes: [],
    colors: [],
    brand: [],
    material: [],
    status: [],
    priceRange: { min: 0, max: Infinity },
    discount: false,
  });

  // Xử lý thay đổi ô tìm kiếm
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Xử lý thay đổi bộ lọc (checkbox hoặc button)
  const handleFilterChange = (type, value) => {
    setFilters((prevFilters) => {
      const currentValues = prevFilters[type];
      if (currentValues.includes(value)) {
        return { ...prevFilters, [type]: currentValues.filter((v) => v !== value) };
      } else {
        return { ...prevFilters, [type]: [...currentValues, value] };
      }
    });
  };

  // Xử lý thay đổi khoảng giá
  const handlePriceRangeChange = (type, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      priceRange: {
        ...prevFilters.priceRange,
        [type]: value === '' ? (type === 'min' ? 0 : Infinity) : parseInt(value, 10),
      },
    }));
  };

  // Lọc sản phẩm dựa trên tìm kiếm và bộ lọc (dùng useMemo để tối ưu)
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchTextMatch =
        (product.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (product.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());

      const categoryMatch = filters.category.length === 0 || filters.category.includes(product.category?._id);
      const sizeMatch = filters.sizes.length === 0 || filters.sizes.some((size) => product.sizes?.includes(parseInt(size)));
      const colorMatch = filters.colors.length === 0 || filters.colors.some((color) => product.colors?.includes(color));
      const brandMatch = filters.brand.length === 0 || filters.brand.includes(product.brand);
      const materialMatch = filters.material.length === 0 || filters.material.includes(product.material);
      const statusMatch = filters.status.length === 0 || filters.status.includes(product.status);
      const priceMatch = (product.price || 0) >= filters.priceRange.min && (product.price || 0) <= filters.priceRange.max;
      const discountMatch = !filters.discount || product.discount > 0;

      return (
        searchTextMatch &&
        categoryMatch &&
        sizeMatch &&
        colorMatch &&
        brandMatch &&
        materialMatch &&
        statusMatch &&
        priceMatch &&
        discountMatch
      );
    });
  }, [products, searchQuery, filters]);

  // Lấy danh sách giá trị duy nhất cho bộ lọc
  const uniqueCategories = [...new Set(products.map((p) => p.category?.name).filter(Boolean))];
  const uniqueSizes = [...new Set(products.flatMap((p) => p.sizes || []).sort((a, b) => a - b))];
  const uniqueColors = [...new Set(products.flatMap((p) => p.colors || []))];
  const uniqueBrands = [...new Set(products.map((p) => p.brand).filter(Boolean))];
  const uniqueMaterials = [...new Set(products.map((p) => p.material).filter(Boolean))];
  const uniqueStatuses = [...new Set(products.map((p) => p.status).filter(Boolean))];

  // Reset tất cả bộ lọc
  const resetFilters = () => {
    setFilters({
      category: [],
      sizes: [],
      colors: [],
      brand: [],
      material: [],
      status: [],
      priceRange: { min: 0, max: Infinity },
      discount: false,
    });
    setSearchQuery('');
  };

  return (
    <div className="bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        {/* Thanh tìm kiếm */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full p-3 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Bộ lọc bên trái */}
          <aside className="md:col-span-1 bg-white p-4 rounded-md shadow-md">
            <h3 className="text-lg font-semibold mb-3">Bộ lọc</h3>

            {/* Lọc theo danh mục */}
            {uniqueCategories.length > 0 && (
              <div className="mb-4">
                <h4 className="text-md font-semibold mb-2">Danh mục</h4>
                {uniqueCategories.map((category) => (
                  <div key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`category-${category}`}
                      value={category}
                      checked={filters.category.includes(category)}
                      onChange={() => handleFilterChange('category', category)}
                      className="form-checkbox h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`category-${category}`} className="ml-2 text-gray-700 text-sm">
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            )}

            {/* Lọc theo kích thước */}
            {uniqueSizes.length > 0 && (
              <div className="mb-4">
                <h4 className="text-md font-semibold mb-2">Kích thước</h4>
                <div className="flex flex-wrap gap-2">
                  {uniqueSizes.map((size) => (
                    <button
                      key={size}
                      className={`px-2 py-1 border rounded-md text-sm ${
                        filters.sizes.includes(size.toString())
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500 hover:text-blue-500'
                      }`}
                      onClick={() => handleFilterChange('sizes', size.toString())}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Lọc theo màu sắc */}
            {uniqueColors.length > 0 && (
              <div className="mb-4">
                <h4 className="text-md font-semibold mb-2">Màu sắc</h4>
                <div className="flex flex-wrap gap-2">
                  {uniqueColors.map((color) => (
                    <button
                      key={color}
                      className={`w-6 h-6 rounded-full shadow-md cursor-pointer ${
                        filters.colors.includes(color) ? 'ring-2 ring-blue-500' : ''
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleFilterChange('colors', color)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Lọc theo thương hiệu */}
            {uniqueBrands.length > 0 && (
              <div className="mb-4">
                <h4 className="text-md font-semibold mb-2">Thương hiệu</h4>
                {uniqueBrands.map((brand) => (
                  <div key={brand} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`brand-${brand}`}
                      value={brand}
                      checked={filters.brand.includes(brand)}
                      onChange={() => handleFilterChange('brand', brand)}
                      className="form-checkbox h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`brand-${brand}`} className="ml-2 text-gray-700 text-sm">
                      {brand}
                    </label>
                  </div>
                ))}
              </div>
            )}

            {/* Lọc theo chất liệu */}
            {uniqueMaterials.length > 0 && (
              <div className="mb-4">
                <h4 className="text-md font-semibold mb-2">Chất liệu</h4>
                {uniqueMaterials.map((material) => (
                  <div key={material} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`material-${material}`}
                      value={material}
                      checked={filters.material.includes(material)}
                      onChange={() => handleFilterChange('material', material)}
                      className="form-checkbox h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`material-${material}`} className="ml-2 text-gray-700 text-sm">
                      {material}
                    </label>
                  </div>
                ))}
              </div>
            )}

            {/* Lọc theo trạng thái */}
            {uniqueStatuses.length > 0 && (
              <div className="mb-4">
                <h4 className="text-md font-semibold mb-2">Trạng thái</h4>
                {uniqueStatuses.map((status) => (
                  <div key={status} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`status-${status}`}
                      value={status}
                      checked={filters.status.includes(status)}
                      onChange={() => handleFilterChange('status', status)}
                      className="form-checkbox h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`status-${status}`} className="ml-2 text-gray-700 text-sm">
                      {status}
                    </label>
                  </div>
                ))}
              </div>
            )}

            {/* Lọc theo giá */}
            <div className="mb-4">
              <h4 className="text-md font-semibold mb-2">Giá</h4>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Từ"
                  value={filters.priceRange.min === 0 ? '' : filters.priceRange.min}
                  onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                  className="w-1/2 p-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  min="0"
                />
                <input
                  type="number"
                  placeholder="Đến"
                  value={filters.priceRange.max === Infinity ? '' : filters.priceRange.max}
                  onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                  className="w-1/2 p-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  min="0"
                />
              </div>
            </div>

            {/* Chỉ hiển thị sản phẩm giảm giá */}
            <div className="mb-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="discount"
                  checked={filters.discount}
                  onChange={() => setFilters((prev) => ({ ...prev, discount: !prev.discount }))}
                  className="form-checkbox h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="discount" className="ml-2 text-gray-700 text-sm">
                  Chỉ sản phẩm giảm giá
                </label>
              </div>
            </div>

            {/* Nút xóa bộ lọc */}
            {(filters.category.length > 0 ||
              filters.sizes.length > 0 ||
              filters.colors.length > 0 ||
              filters.brand.length > 0 ||
              filters.material.length > 0 ||
              filters.status.length > 0 ||
              filters.priceRange.min !== 0 ||
              filters.priceRange.max !== Infinity ||
              filters.discount) && (
              <button
                onClick={resetFilters}
                className="w-full py-2 text-center text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm"
              >
                Xóa bộ lọc
              </button>
            )}
          </aside>

          {/* Danh sách sản phẩm */}
          <main className="md:col-span-3">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Sản phẩm</h2>
              <p className="text-gray-600 text-sm">
                {filteredProducts.length} sản phẩm được tìm thấy
              </p>
            </div>

            {products.length === 0 ? (
              <p className="text-gray-600">Hiện tại chưa có sản phẩm nào trong cửa hàng.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))
                ) : (
                  <p className="text-gray-600">Không tìm thấy sản phẩm phù hợp.</p>
                )}
              </div>
            )}

            {/* Phân trang (tùy chọn, bạn có thể thêm logic sau) */}
            <div className="mt-6">
              <button className="px-4 py-2 bg-white text-gray-700 border rounded-md mr-2">Trước</button>
              <button className="px-4 py-2 bg-white text-gray-700 border rounded-md">Sau</button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Mystore;