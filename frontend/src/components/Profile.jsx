// ProfilePage.js
import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    if (!isAuthenticated || !user) {
        navigate('/login');
        return null;
    }
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Hồ sơ người dùng</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Tên người dùng:</label>
                        <p className="text-gray-900">{user.username}</p>
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
                        <p className="text-gray-900">{user.email}</p>
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Vai trò:</label>
                        <p className="text-gray-900">{user.role}</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/')}
                    className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
                >
                    Quay lại trang chủ
                </button>
            </div>
        </div>
    );
};

export default ProfilePage;