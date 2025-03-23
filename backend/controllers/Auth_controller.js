import bcrypt from 'bcrypt';
import User from '../models/user_model.js';
import response from '../utils/response.js';
import jwt from 'jsonwebtoken';

const AuthController = {
    // Login function
    // Login function
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            // Check if user exists
            const user = await User.findOne({ email });
            if (!user) {
                return response(res, 401, "Email không tồn tại");
            }

            // Compare password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return response(res, 401, "Mật khẩu không đúng");
            }

            // Generate tokens
            const token = jwt.sign(
                { id: user._id, email: user.email, role: user.role },
                process.env.SECRET_KEY,
                { expiresIn: "1h" }
            );

            const refresh_token = jwt.sign(
                { id: user._id, email: user.email, role: user.role },
                process.env.REFRESH_KEY,
                { expiresIn: '7d' }
            );

            // Update refresh token in database
            await User.findByIdAndUpdate(user._id, { refreshToken: refresh_token });

            // Set cookies
            res.cookie('access_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 3600000 // 1 hour
            });

            res.cookie('refresh_token', refresh_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 604800000 // 7 days
            });

            const { password: _, ...userData } = user.toObject();
            return response(res, 200, "Đăng nhập thành công", { user: userData });

        } catch (error) {
            console.error('Login error:', error);
            return response(res, 500, "Lỗi server nội bộ");
        }
    },

    // Register function
    register: async (req, res) => {
        try {
            const { username, email, password } = req.body;

            // Validate input
            if (!username || !email || !password) {
                return response(res, 400, "Vui lòng điền đầy đủ thông tin");
            }

            // Check existing user
            const existingUser = await User.findOne({ $or: [{ email }, { username }] });
            if (existingUser) {
                if (existingUser.email === email) return response(res, 400, "Email đã được đăng ký");
                if (existingUser.username === username) return response(res, 400, "Tên người dùng đã được sử dụng");
            }

        
            // Create new user
            const newUser = new User({
                username,
                email,
                password
            });

            await newUser.save();

            return response(res, 201, "Đăng ký thành công", { username, email });

        } catch (error) {
            console.error('Register error:', error);
            return response(res, 500, "Lỗi server nội bộ");
        }
    },

    // Logout function
    logout: async (req, res) => {
        try {
            // Clear refresh token in database
            await User.findByIdAndUpdate(req.user?.id, { refreshToken: null });

            // Clear cookies
            res.clearCookie('access_token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            });
            res.clearCookie('refresh_token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            });

            return response(res, 200, "Đăng xuất thành công");
        } catch (error) {
            console.error('Logout error:', error);
            return response(res, 500, "Lỗi server nội bộ");
        }
    },

    // Refresh token function
    // Refresh token function
    refreshToken: async (req, res) => {
        try {
            const refreshToken = req.cookies.refresh_token;
            if (!refreshToken) {
                return response(res, 401, "Không có refresh token");
            }

            const user = await User.findOne({ refreshToken });
            if (!user) {
                return response(res, 403, "Refresh token không hợp lệ");
            }

            // Verify refresh token
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_KEY);

            // Generate new access token
            const newAccessToken = jwt.sign(
                { id: user._id, email: user.email, role: user.role },
                process.env.SECRET_KEY,
                { expiresIn: "1h" }
            );

            res.cookie('access_token', newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 3600000
            });

            return response(res, 200, "Làm mới token thành công");

        } catch (error) {
            console.error('Refresh token error:', error);
            return response(res, 403, "Refresh token không hợp lệ");
        }
    },
    // Trong AuthController
    getCurrentUser: async (req, res) => {
        try {
            const token = req.cookies.access_token;
            if (!token) {
                return response(res, 401, "Không có token");
            }

            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                return response(res, 404, "Không tìm thấy người dùng");
            }

            return response(res, 200, "Lấy thông tin user thành công", { user });
        } catch (error) {
            console.error('Get current user error:', error);
            return response(res, 401, "Token không hợp lệ");
        }
    }
};

export default AuthController;