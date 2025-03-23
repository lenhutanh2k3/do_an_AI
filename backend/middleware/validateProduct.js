import { body, validationResult } from 'express-validator';

const validateProduct = [
    body('name').notEmpty().withMessage('Tên sản phẩm không được bỏ trống').isString().withMessage('Tên sản phẩm phải là chuỗi'),
    body('price').notEmpty().withMessage('Giá sản phẩm không được bỏ trống').isFloat({ min: 0 }).withMessage('Giá sản phẩm phải là số và lớn hơn hoặc bằng 0'),
    body('category').notEmpty().withMessage('Danh mục không được bỏ trống').isMongoId().withMessage('ID danh mục không hợp lệ'),
    body('sizes').isArray({ min: 1 }).withMessage('Phải có ít nhất một kích cỡ'),
    body('colors').isArray({ min: 1 }).withMessage('Phải có ít nhất một màu'),
    body('images').isArray({ min: 1 }).withMessage('Phải có ít nhất một hình ảnh'),
    body('brand').notEmpty().withMessage('Thương hiệu không được bỏ trống').isString().withMessage('Thương hiệu phải là chuỗi'),
    body('material').notEmpty().withMessage('Chất liệu không được bỏ trống').isString().withMessage('Chất liệu phải là chuỗi'),
    body('stockQuantity').notEmpty().withMessage('Số lượng tồn kho không được bỏ trống').isInt({ min: 0 }).withMessage('Số lượng tồn kho phải là số nguyên không âm'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        next();
    }
];

export default validateProduct;