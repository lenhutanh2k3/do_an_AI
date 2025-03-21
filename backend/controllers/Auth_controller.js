import bcrypt from 'bcrypt';
import User from '../models/user_model.js';
import response from '../utils/response.js';
import jwt from 'jsonwebtoken';

const AuthController = {

    // Login function
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email });
            if (!user) return response(res, 401, "User not found");

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return response(res, 401, "Password does not match");

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

            await User.findByIdAndUpdate(user._id, { refreshToken: refresh_token });

            res.cookie('access_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
            });

            res.cookie('refresh_token', refresh_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
            });

            response(res, 200, "Login successful", { token, refresh_token });

        } catch (error) {
            console.error(error);
            return response(res, 500, "Internal server error");
        }
    },

    // Register function
    register: async (req, res) => {
        try {
            const { username, email, password, firstName, lastName } = req.body;

            // Kiểm tra nếu email đã tồn tại
            const existingUser = await User.findOne({ email });
            if (existingUser) return response(res, 400, "Email is already registered");

            // Băm mật khẩu
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Tạo user mới
            const newUser = new User({
                username,
                email,
                password: hashedPassword,
                firstName,
                lastName
            });

            // Lưu user vào cơ sở dữ liệu
            await newUser.save();

            // Tạo token
            const token = jwt.sign(
                { id: newUser._id, email: newUser.email, role: newUser.role },
                process.env.SECRET_KEY,
                { expiresIn: "1h" }
            );

            const refresh_token = jwt.sign(
                { id: newUser._id, email: newUser.email, role: newUser.role },
                process.env.REFRESH_KEY,
                { expiresIn: '7d' }
            );

            // Cập nhật refresh token vào user
            await User.findByIdAndUpdate(newUser._id, { refreshToken: refresh_token });

            // Set cookie
            res.cookie('access_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
            });

            res.cookie('refresh_token', refresh_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
            });

            response(res, 201, "Registration successful", { token, refresh_token });

        } catch (error) {
            console.error(error);
            return response(res, 500, "Internal server error");
        }
    },

    // Logout function
    logout: async (req, res) => {
        try {
            // Xóa cookie chứa access_token và refresh_token
            res.clearCookie('access_token');
            res.clearCookie('refresh_token');

            response(res, 200, "Logout successful");

        } catch (error) {
            console.error(error);
            return response(res, 500, "Internal server error");
        }
    }

}

export default AuthController;
