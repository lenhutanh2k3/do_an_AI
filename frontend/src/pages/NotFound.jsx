import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-6xl font-bold text-gray-800">404</h1>
      <p className="text-2xl text-gray-600 mt-4">Oops! Trang bạn tìm kiếm không tồn tại.</p>
      <Link 
        to="/" 
        className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
      >
        Về trang chủ
      </Link>
    </div>
  );
};

export default NotFound;
