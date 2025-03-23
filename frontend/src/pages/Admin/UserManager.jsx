// src/pages/UsersManagement.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);

  // Giả lập dữ liệu hoặc gọi API
  useEffect(() => {
    // Thay bằng API thực tế của bạn
    const fetchUsers = async () => {
      try {
        const response = await axios.get('https://jsonplaceholder.typicode.com/users'); // API mẫu
        setUsers(response.data);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Users Management</h2>
      <button className="bg-blue-500 text-white px-4 py-2 rounded mb-4 hover:bg-blue-600">
        Thêm người dùng mới
      </button>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-3 px-4 text-left text-gray-600 font-semibold">ID</th>
              <th className="py-3 px-4 text-left text-gray-600 font-semibold">Tên</th>
              <th className="py-3 px-4 text-left text-gray-600 font-semibold">Email</th>
              <th className="py-3 px-4 text-left text-gray-600 font-semibold">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{user.id}</td>
                <td className="py-3 px-4">{user.name}</td>
                <td className="py-3 px-4">{user.email}</td>
                <td className="py-3 px-4 flex space-x-2">
                  <button className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">
                    Sửa
                  </button>
                  <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersManagement;