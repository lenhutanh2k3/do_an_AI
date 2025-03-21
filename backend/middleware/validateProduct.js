
import { body, validationResult } from 'express-validator';

const validateProduct = [
    body('name')
        .notEmpty().withMessage('Tên sản phẩm không được bỏ trống')
        .isString().withMessage('Tên sản phẩm phải là chuỗi'),
    body('price')
        .notEmpty().withMessage('Giá sản phẩm không được bỏ trống')
        .isFloat({ min: 0 }).withMessage('Giá sản phẩm phải là số và lớn hơn hoặc bằng 0'),
    body('category')
        .notEmpty().withMessage('Danh mục không được bỏ trống')
        .isMongoId().withMessage('ID danh mục không hợp lệ'),
    body('sizes')
        .isArray({ min: 1 }).withMessage('Phải có ít nhất một kích cỡ'),
    body('colors')
        .isArray({ min: 1 }).withMessage('Phải có ít nhất một màu'),
    body('images')
        .isArray({ min: 1 }).withMessage('Phải có ít nhất một hình ảnh'),
    // Các validate khác nếu cần
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        next();
    }
];

export  default validateProduct;
