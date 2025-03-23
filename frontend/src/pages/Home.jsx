import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import CategoryList from '../components/CategoryList';
import DiscountBanner from '../components/DiscountBanner';
import { fetchProducts, selectFeaturedProducts } from '../features/product/productSlice';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import banner_2 from '../assets/images/banner_2.webp';
import banner_3 from '../assets/images/banner_3.webp';

const Home = () => {
  const dispatch = useDispatch();
  const featuredProducts = useSelector(selectFeaturedProducts);
  const activeDiscount = useSelector((state) => state.discount?.active); // Thêm kiểm tra state.discount
  const [bannerImages] = useState([
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1470&q=80',
    banner_2,
    banner_3,
  ]);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const bannerSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    pauseOnHover: true,
  };

  return (
    <div className="container mx-auto">
      {/* Banner Slider */}
      <section className="mb-8">
        <Slider {...bannerSettings}>
          {bannerImages.map((image, index) => (
            <div key={index} className="relative w-full h-[450px] bg-cover bg-center rounded-lg overflow-hidden shadow-lg">
              <img src={image} alt={`Banner ${index + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-opacity-30 flex flex-col justify-center items-center text-center text-white p-8">
                <h2 className="text-3xl font-bold mb-2">Khám Phá Bộ Sưu Tập Mới Nhất</h2>
                <p className="text-lg mb-4">Ưu đãi đặc biệt cho các sản phẩm mới ra mắt.</p>
                <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded-full transition duration-300 cursor-pointer">
                  Xem ngay
                </button>
              </div>
            </div>
          ))}
        </Slider>
      </section>

      {/* Danh sách danh mục */}
      <section className="my-8 bg-gray-50 py-6 rounded-lg shadow-md">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">Danh Mục Sản Phẩm</h2>
          <CategoryList />
        </div>
      </section>

      {/* Sản phẩm nổi bật */}
      <section className="py-8">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Sản phẩm nổi bật</h2>
          {featuredProducts && featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600">Đang tải sản phẩm nổi bật...</p>
          )}
        </div>
      </section>

      {/* Banner Giảm Giá */}
      {activeDiscount && (
        <section className="my-8">
          <DiscountBanner discount={activeDiscount} />
        </section>
      )}

      {/* Thêm một banner quảng cáo khác */}
      <section className="my-8">
        <div className="relative w-full h-[300px] bg-cover bg-center rounded-lg overflow-hidden shadow-lg">
          <img
            src="https://images.unsplash.com/photo-1544006659-f0b21884ce1d?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1470&q=80"
            alt="Ưu đãi đặc biệt"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-center text-center text-white p-8">
            <h2 className="text-3xl font-bold mb-2">Ưu Đãi Mùa Hè</h2>
            <p className="text-lg mb-4">Giảm giá sốc cho nhiều mặt hàng trong mùa hè này!</p>
            <button className="bg-red-400 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-full transition duration-300 cursor-pointer">
              Xem ngay
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;