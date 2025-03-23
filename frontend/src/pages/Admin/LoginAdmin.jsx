// AdminLoginPage.js
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user, status, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      navigate('/admin/dashboard');
    } else if (isAuthenticated && user?.role !== 'admin') {
      setLoginError('Bạn không có quyền truy cập vào trang admin.');
    } else if (error) {
      setLoginError('Đăng nhập thất bại: ' + error);
    }
  }, [isAuthenticated, user, navigate, error]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoginError(null);
    dispatch(login({ email, password }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Đăng nhập Admin</h2>
        {loginError && <p className="text-red-500 text-sm mb-4">{loginError}</p>}
        {status === 'loading' && <p className="text-gray-500 text-sm mb-4">Đang đăng nhập...</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
              Mật khẩu
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={status === 'loading'}
          >
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;