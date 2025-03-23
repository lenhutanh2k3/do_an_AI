import multer from 'multer';
import path from 'path';

// Cấu hình lưu trữ file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Thư mục lưu trữ file ảnh
    },
    filename: function (req, file, cb) {
        // Đặt tên file bao gồm thời gian hiện tại để tránh trùng lặp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // Giữ nguyên đuôi file ảnh
    }
});

// Kiểm tra định dạng file (chỉ cho phép ảnh)
const fileFilter = (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Chỉ cho phép tải lên các file ảnh (jpeg, jpg, png, gif)'));
    }
};

// Cấu hình upload với multer
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn kích thước file (5MB)
    fileFilter: fileFilter
});

export default upload;
