import User from '../models/user_model.js';
import response from '../utils/response.js';

const UserController = {
    // Lấy danh sách người dùng với chức năng phân trang
    getAllUsers: async (req, res) => {
        try {
            const { page = 1, limit = 10, search = '' } = req.query;
            const query = search ? { username: { $regex: search, $options: 'i' } } : {};

            const users = await User.find(query)
                .skip((page - 1) * limit)
                .limit(parseInt(limit))
                .exec();

            const total = await User.countDocuments(query);

            response(res, 200, "", {
                users,
                total,
                currentPage: page,
                totalPages: Math.ceil(total / limit)
            });
        } catch (error) {
            console.error(error);
            response(res, 500, "Internal Server Error");
        }
    },

    // Tạo mới một người dùng
    createUser: async (req, res) => {
        try {
            const { username, email, password } = req.body;
            const newUser = new User({ username, email, password });

            await newUser.save();
            response(res, 201, "User created successfully", newUser);
        } catch (error) {
            console.error(error);
            response(res, 500, "Internal Server Error");
        }
    },

    // Cập nhật thông tin người dùng
    updateUser: async (req, res) => {
        try {
            const { id } = req.params;
            const data = req.body;

            const updatedUser = await User.findByIdAndUpdate(id, data, { new: true });
            if (!updatedUser) {
                response(res, 404, "User not found");
            } else {
                response(res, 200, "User updated successfully", updatedUser);
            }
        } catch (error) {
            console.error(error);
            response(res, 500, "Internal Server Error");
        }
    },

    // Xóa người dùng
    deleteUser: async (req, res) => {
        try {
            const { id } = req.params;

            const deletedUser = await User.findByIdAndDelete(id);
            if (!deletedUser) {
                response(res, 404, "User not found");
            } else {
                response(res, 200, "User deleted successfully");
            }
        } catch (error) {
            console.error(error);
            response(res, 500, "Internal Server Error");
        }
    }
};

export default UserController;
