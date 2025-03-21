// middlewares/validateProduct.js
import { body, validationResult } from 'express-validator';

const validateCategory = [
    body('name')
        .notEmpty().withMessage('Tên sản phẩm không được bỏ trống')
        .isString().withMessage('Tên sản phẩm phải là chuỗi'),
    body('description')
        .notEmpty().withMessage('Không được bỏ trống')
        .isString().withMessage('Mô ta là chuỗi'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        next();
    }
];

export default validateCategory;
