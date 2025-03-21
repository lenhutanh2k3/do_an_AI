import jwt from 'jsonwebtoken';
import response from '../utils/response.js';

// Middleware: Xác thực token
export const verifyToken = (req, res, next) => {
    const token = req.cookies.access_token;  // Lấy token từ cookie

    if (!token) {
        response(res,401,"You are not authenticated");
        
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            response(res,403,"Token is not valid");
        }
        req.user = user;  // Gán thông tin người dùng vào request
        next();
    });
};

// Middleware: Xác thực người dùng (đảm bảo chỉ chính người dùng hoặc admin mới có thể thực hiện hành động)
export const verifyUser = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.id === req.params.id || req.user.role === 'admin') {
            next(); 
        } else {
            response(res,403,"You are not allowed to do this");          
        }
    });
};
