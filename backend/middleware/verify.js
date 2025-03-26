import jwt from 'jsonwebtoken';
import response from '../utils/response.js';



export const verifyToken = (req, res, next) => {
    console.log('Cookies received:', req.cookies); // Debug
    const token = req.cookies.access_token;
    console.log('Token from cookie:', token);
    if (!token) {
        return res.status(401).json({ message: 'Không tìm thấy token trong cookie' });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded;
        console.log('Decoded token:', decoded);
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Token không hợp lệ' });
    }
};

// Middleware: Xác thực người dùng
export const verifyUser = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.id === req.params.id || req.user.role === 'admin') {
            next();
        } else {
            response(res, 403, "Bạn không có quyền thực hiện hành động này");
        }
    });
};

// Middleware: Xác thực admin
export const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role === 'admin') {
            next();
        } else {
            response(res, 403, "Bạn không có quyền thực hiện hành động này");
        }
    });
};

// Middleware: Xác thực cập nhật người dùng
export const verifyUpdateUser = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role === 'admin' || req.user.id === req.params.id) {
            next();
        } else {
            response(res, 403, "Bạn không có quyền cập nhật người dùng này");
        }
    });
};

// Middleware: Xác thực customer hoặc admin
export const verifyCustomerOrAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        console.log("req.user in verifyCustomerOrAdmin:", req.user);
        if (req.user.role === 'admin' || req.user.role === 'customer') {
            next();
        } else {
            response(res, 403, "Bạn không có quyền thực hiện hành động này");
        }
    });
};