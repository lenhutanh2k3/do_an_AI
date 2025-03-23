import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { addToCartAsync, fetchCart } from '../features/cart/cartSlice';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();

  const handleAddToCart = async () => {
    try {
      await dispatch(addToCartAsync(product)).unwrap();
      dispatch(fetchCart()); // Làm mới giỏ hàng
      alert('Đã thêm vào giỏ hàng thành công');
    } catch (error) {
      alert(`Không thể thêm vào giỏ hàng: ${error}`);
    }
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md transition transform hover:scale-102 hover:shadow-xl duration-300 ease-in-out">
      <Link to={`/products/${product._id}`}>
        <div className="relative">
          <img
            src={product.images && product.images[0] ? product.images[0] : 'default-image.jpg'}
            alt={product.name}
            className="w-full h-56 object-cover rounded-t-xl"
          />
          {product.discount && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
              Giảm giá
            </span>
          )}
        </div>
      </Link>
      <div className="p-4 space-y-2">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-green-600">
              {product.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
            </p>
          </div>
          <button onClick={handleAddToCart} className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition duration-200">
            <svg className="h-5 w-5 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c–.63.63–.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Thêm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;