import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';
import { logout } from '../features/auth/authSlice';

const Header = () => {
    const cartItems = useSelector((state) => state.cart.items || []);
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const handleSearch = () => {
        if (searchQuery.trim()) {
            navigate(`/search?query=${searchQuery}`);
        }
    };

    const handleLogout = async () => {
        if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
            await dispatch(logout());
            navigate('/login');
        }
    };

    return (
        <header className="bg-gray-800 text-white p-4 sticky top-0 z-10 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
                <NavLink to="/" className="text-3xl font-bold">
                    My Shoe Store
                </NavLink>
                <div className="flex items-center space-x-2 bg-gray-700 p-2 rounded-full">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        className="bg-transparent text-white px-4 py-2 rounded-full outline-none placeholder-gray-400"
                        placeholder="Search for products..."
                    />
                    <button onClick={handleSearch} className="bg-yellow-400 text-black px-4 py-2 rounded-full hover:bg-yellow-500 transition">
                        Tìm kiếm
                    </button>
                </div>
                <nav className="flex items-center space-x-6">
                    <NavLink to="/" className={({ isActive }) => (isActive ? 'text-yellow-400 font-semibold' : 'hover:text-yellow-400')}>
                        Home
                    </NavLink>
                    <NavLink to="/mystore" className={({ isActive }) => (isActive ? 'text-yellow-400 font-semibold' : 'hover:text-yellow-400')}>
                        My stores
                    </NavLink>
                    <NavLink to="/cart" className={({ isActive }) => (isActive ? 'text-yellow-400 font-semibold' : 'hover:text-yellow-400 flex text-2xl')}>
                        <FaShoppingCart /> <span className="text-lg">{totalItems}</span>
                    </NavLink>
                    {isAuthenticated && user ? (
                        <>
                            <NavLink to="/profile" className={({ isActive }) => (isActive ? 'text-yellow-400 font-semibold' : 'hover:text-yellow-400 flex items-center space-x-2')}>
                                {user.avatar && <img src={user.avatar} alt={user.username} className="w-8 h-8 rounded-full" />}
                                <span>{user.username}</span>
                            </NavLink>
                            <button onClick={handleLogout} className="hover:text-yellow-400">
                                Đăng xuất
                            </button>
                            {user.role === 'admin' && (
                                <NavLink to="/admin" className={({ isActive }) => (isActive ? 'text-yellow-400 font-semibold' : 'hover:text-yellow-400')}>
                                    Quản trị
                                </NavLink>
                            )}
                        </>
                    ) : (
                        <>
                            <NavLink to="/login" className={({ isActive }) => (isActive ? 'text-yellow-400 font-semibold' : 'hover:text-yellow-400')}>
                                Đăng nhập
                            </NavLink>
                            <NavLink to="/register" className={({ isActive }) => (isActive ? 'text-yellow-400 font-semibold' : 'hover:text-yellow-400')}>
                                Đăng ký
                            </NavLink>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
};
export default Header;