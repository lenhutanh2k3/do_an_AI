import React, { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { fetchProducts } from '../features/product/productSlice';

const Mystore = () => {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.products.products) || [];

  const [searchParams] = useSearchParams();

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // Nếu có query parameter "query", set giá trị tìm kiếm mặc định
  const initialSearch = searchParams.get('query') || '';
  const [searchQuery, setSearchQuery] = useState(initialSearch);

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
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  // Nếu query parameter "category" có trong URL, set filter danh mục
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setFilters((prev) => ({ ...prev, category: [categoryParam] }));
      setCurrentPage(1);
    }
  }, [searchParams]);

  // Handle thay đổi ô tìm kiếm
  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  // Handle thay đổi các bộ lọc checkbox / button
  const handleFilterChange = (type, value) => {
    setFilters((prev) => {
      const currentValues = prev[type];
      return {
        ...prev,
        [type]: currentValues.includes(value)
          ? currentValues.filter((v) => v !== value)
          : [...currentValues, value],
      };
    });
    setCurrentPage(1);
  };

  // Handle thay đổi khoảng giá
  const handlePriceRangeChange = (type, value) => {
    setFilters((prev) => ({
      ...prev,
      priceRange: {
        ...prev.priceRange,
        [type]: value === '' ? (type === 'min' ? 0 : Infinity) : parseInt(value, 10),
      },
    }));
    setCurrentPage(1);
  };

  // Hàm reset bộ lọc về trạng thái ban đầu
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
    setCurrentPage(1);
  };

  // Lọc sản phẩm dựa trên search query và các bộ lọc đã chọn
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchTextMatch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const categoryMatch =
        filters.category.length === 0 ||
        filters.category.includes(product.category?._id);
      const sizeMatch =
        filters.sizes.length === 0 ||
        filters.sizes.some((size) => product.sizes?.includes(parseInt(size)));
      const colorMatch =
        filters.colors.length === 0 ||
        filters.colors.some((color) => product.colors?.includes(color));
      const brandMatch =
        filters.brand.length === 0 || filters.brand.includes(product.brand);
      const materialMatch =
        filters.material.length === 0 || filters.material.includes(product.material);
      const statusMatch =
        filters.status.length === 0 || filters.status.includes(product.status);
      const priceMatch =
        product.price >= filters.priceRange.min && product.price <= filters.priceRange.max;
      const discountMatch = !filters.discount || product.discount;

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

  // Lấy các giá trị duy nhất cho các bộ lọc
  const categoryMap = {};
  products.forEach((p) => {
    if (p.category) categoryMap[p.category._id] = p.category.name;
  });
  const uniqueCategories = [...new Set(products.map((p) => p.category?._id).filter(Boolean))];
  const uniqueSizes = [...new Set(products.flatMap((p) => p.sizes || []).sort((a, b) => a - b))];
  const uniqueColors = [...new Set(products.flatMap((p) => p.colors || []))];
  const uniqueBrands = [...new Set(products.map((p) => p.brand).filter(Boolean))];
  const uniqueMaterials = [...new Set(products.map((p) => p.material).filter(Boolean))];
  const uniqueStatuses = [...new Set(products.map((p) => p.status).filter(Boolean))];
  console.log(uniqueColors);
  // Phân trang
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

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
            className="w-full p-3 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar bộ lọc */}
          <aside className="md:col-span-1 bg-white p-4 rounded-md shadow-md space-y-6">
            <h3 className="text-lg font-semibold">Bộ lọc</h3>
            {/* Bộ lọc theo danh mục */}
            {uniqueCategories.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Danh mục</h4>
                {uniqueCategories.map((categoryId) => (
                  <div key={categoryId} className="flex items-center mb-1">
                    <input
                      type="checkbox"
                      id={`category-${categoryId}`}
                      value={categoryId}
                      checked={filters.category.includes(categoryId)}
                      onChange={() => handleFilterChange('category', categoryId)}
                      className="form-checkbox h-4 w-4 text-blue-600"
                    />
                    <label htmlFor={`category-${categoryId}`} className="ml-2 text-sm text-gray-700">
                      {categoryMap[categoryId] || 'Unknown'}
                    </label>
                  </div>
                ))}
              </div>
            )}
            {/* Các bộ lọc khác: kích thước, màu sắc, thương hiệu, chất liệu, trạng thái, giá, giảm giá */}
            {uniqueSizes.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Kích thước</h4>
                <div className="flex flex-wrap gap-2">
                  {uniqueSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => handleFilterChange('sizes', size.toString())}
                      className={`px-2 py-1 border rounded-md text-sm ${filters.sizes.includes(size.toString())
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-blue-100'
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {uniqueColors.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Màu sắc</h4>
                <div className="flex flex-wrap gap-2">
                  {uniqueColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleFilterChange('colors', color)}
                      className={`w-6 h-6 rounded-full shadow-md ${filters.colors.includes(color) ? 'ring-2 ring-blue-500' : ''
                        }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}
            {uniqueBrands.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Thương hiệu</h4>
                {uniqueBrands.map((brand) => (
                  <div key={brand} className="flex items-center mb-1">
                    <input
                      type="checkbox"
                      id={`brand-${brand}`}
                      value={brand}
                      checked={filters.brand.includes(brand)}
                      onChange={() => handleFilterChange('brand', brand)}
                      className="form-checkbox h-4 w-4 text-blue-600"
                    />
                    <label htmlFor={`brand-${brand}`} className="ml-2 text-sm text-gray-700">
                      {brand}
                    </label>
                  </div>
                ))}
              </div>
            )}
            {uniqueMaterials.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Chất liệu</h4>
                {uniqueMaterials.map((material) => (
                  <div key={material} className="flex items-center mb-1">
                    <input
                      type="checkbox"
                      id={`material-${material}`}
                      value={material}
                      checked={filters.material.includes(material)}
                      onChange={() => handleFilterChange('material', material)}
                      className="form-checkbox h-4 w-4 text-blue-600"
                    />
                    <label htmlFor={`material-${material}`} className="ml-2 text-sm text-gray-700">
                      {material}
                    </label>
                  </div>
                ))}
              </div>
            )}
            {uniqueStatuses.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Trạng thái</h4>
                {uniqueStatuses.map((status) => (
                  <div key={status} className="flex items-center mb-1">
                    <input
                      type="checkbox"
                      id={`status-${status}`}
                      value={status}
                      checked={filters.status.includes(status)}
                      onChange={() => handleFilterChange('status', status)}
                      className="form-checkbox h-4 w-4 text-blue-600"
                    />
                    <label htmlFor={`status-${status}`} className="ml-2 text-sm text-gray-700">
                      {status}
                    </label>
                  </div>
                ))}
              </div>
            )}
            <div>
              <h4 className="font-medium mb-2">Giá</h4>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Từ"
                  value={filters.priceRange.min === 0 ? '' : filters.priceRange.min}
                  onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                  className="w-1/2 p-2 border rounded-md text-sm"
                  min="0"
                />
                <input
                  type="number"
                  placeholder="Đến"
                  value={filters.priceRange.max === Infinity ? '' : filters.priceRange.max}
                  onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                  className="w-1/2 p-2 border rounded-md text-sm"
                  min="0"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="discount"
                  checked={filters.discount}
                  onChange={() => setFilters((prev) => ({ ...prev, discount: !prev.discount }))}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                <label htmlFor="discount" className="ml-2 text-sm text-gray-700">
                  Chỉ sản phẩm giảm giá
                </label>
              </div>
            </div>
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
                  className="w-full mt-4 py-2 text-gray-600 border rounded-md hover:bg-gray-100 text-sm"
                >
                  Xóa bộ lọc
                </button>
              )}
          </aside>
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
                {currentProducts.length > 0 ? (
                  currentProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))
                ) : (
                  <p className="text-gray-600 col-span-full text-center">
                    Không tìm thấy sản phẩm phù hợp.
                  </p>
                )}
              </div>
            )}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center space-x-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-4 py-2 rounded-md transition ${currentPage === i + 1
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border'
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Mystore;
