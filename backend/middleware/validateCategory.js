import { body, validationResult } from 'express-validator';

const validateCategory = [
    body('name')
        .notEmpty().withMessage('Tên danh mục không được bỏ trống')
        .isString().withMessage('Tên danh mục phải là chuỗi'),
    body('description')
        .optional()
        .isString().withMessage('Mô tả phải là chuỗi'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        next();
    }
];

export default validateCategory;