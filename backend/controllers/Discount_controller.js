import Discount from '../models/discount_model.js';
import Product from '../models/product_model.js'; // Giả sử có model Product
import Category from '../models/category_model.js'; // Giả sử có model Category
import response from '../utils/response.js'; // Giả sử có util trả về response

const DiscountController = {
    // Lấy tất cả mã giảm giá
    getAllDiscounts: async (req, res) => {
        try {
            const discounts = await Discount.find()
                .populate('applicableProducts applicableCategories');
            if (!discounts || discounts.length === 0) {
                return response(res, 404, "Không tìm thấy mã giảm giá");
            }
            response(res, 200, "Lấy danh sách mã giảm giá thành công", discounts);
        } catch (error) {
            console.error(error);
            response(res, 500, "Lỗi máy chủ nội bộ");
        }
    },

    // Tạo mã giảm giá mới
    createDiscount: async (req, res) => {
        try {
            const {
                code,
                type,
                value,
                minOrderValue,
                maxDiscount,
                startDate,
                endDate,
                maxUses,
                products
            } = req.body;

            // Kiểm tra mã giảm giá đã tồn tại
            const existingDiscount = await Discount.findOne({
                code: { $regex: new RegExp(`^${code}$`, 'i') }
            });

            if (existingDiscount) {
                return response(res, 400, "Mã giảm giá đã tồn tại");
            }

            // Kiểm tra ngày hợp lệ
            if (new Date(validFrom) >= new Date(validUntil)) {
                return response(res, 400, "Ngày bắt đầu phải trước ngày kết thúc");
            }

            // Kiểm tra giá trị phần trăm
            if (discountType === 'percentage' && (amount < 0 || amount > 100)) {
                return response(res, 400, "Giá trị phần trăm phải từ 0 đến 100");
            }

            // Kiểm tra sản phẩm áp dụng
            if (applicableProducts && applicableProducts.length > 0) {
                const validProducts = await Product.find({ _id: { $in: applicableProducts } });
                if (validProducts.length !== applicableProducts.length) {
                    return response(res, 400, "Một số sản phẩm không tồn tại");
                }
            }

            const discount = new Discount({
                code: code.toUpperCase(),
                type,
                value,
                minOrderValue,
                maxDiscount,
                startDate,
                endDate,
                maxUses,
                products,
                createdBy: req.user._id
            });

            await discount.save();
            return response(res, 201, "Tạo mã giảm giá thành công", discount);
        } catch (error) {
            console.error('Create discount error:', error);
            return response(res, 500, "Lỗi server");
        }
    },

    // Lấy danh sách mã giảm giá
    getDiscounts: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const status = req.query.status; // active, expired, upcoming

            let query = {};
            const currentDate = new Date();

            // Lọc theo trạng thái
            if (status === 'active') {
                query = {
                    startDate: { $lte: currentDate },
                    endDate: { $gte: currentDate },
                    usedCount: { $lt: '$maxUses' }
                };
            } else if (status === 'expired') {
                query = {
                    $or: [
                        { endDate: { $lt: currentDate } },
                        { usedCount: { $gte: '$maxUses' } }
                    ]
                };
            } else if (status === 'upcoming') {
                query = { startDate: { $gt: currentDate } };
            }

            const discounts = await Discount.find(query)
                .sort('-createdAt')
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('products', 'name')
                .populate('createdBy', 'username');

            const total = await Discount.countDocuments(query);

            return response(res, 200, "Lấy danh sách mã giảm giá thành công", {
                discounts,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Get discounts error:', error);
            return response(res, 500, "Lỗi server");
        }
    },

    // Kiểm tra và áp dụng mã giảm giá
    validateDiscount: async (req, res) => {
        try {
            const { code, products, totalAmount } = req.body;

            const discount = await Discount.findOne({
                code: code.toUpperCase(),
                startDate: { $lte: new Date() },
                endDate: { $gte: new Date() },
                usedCount: { $lt: '$maxUses' }
            });

            if (!discount) {
                return response(res, 404, "Mã giảm giá không hợp lệ hoặc đã hết hạn");
            }

            // Kiểm tra giá trị đơn hàng tối thiểu
            if (discount.minOrderValue && totalAmount < discount.minOrderValue) {
                return response(res, 400, `Giá trị đơn hàng tối thiểu là ${discount.minOrderValue}`);
            }

            // Kiểm tra sản phẩm áp dụng
            if (discount.products && discount.products.length > 0) {
                const validProducts = products.every(p => 
                    discount.products.includes(p.productId)
                );
                if (!validProducts) {
                    return response(res, 400, "Mã giảm giá không áp dụng cho một số sản phẩm");
                }
            }

            // Tính giá trị giảm
            let discountAmount = 0;
            if (discount.type === 'percentage') {
                discountAmount = totalAmount * (discount.value / 100);
                if (discount.maxDiscount) {
                    discountAmount = Math.min(discountAmount, discount.maxDiscount);
                }
            } else {
                discountAmount = discount.value;
            }

            return response(res, 200, "Áp dụng mã giảm giá thành công", {
                discount: discountAmount,
                finalAmount: totalAmount - discountAmount
            });
        } catch (error) {
            console.error('Validate discount error:', error);
            return response(res, 500, "Lỗi server");
        }
    },

    // Cập nhật mã giảm giá
    updateDiscount: async (req, res) => {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const discount = await Discount.findById(id);
            if (!discount) {
                return response(res, 404, "Không tìm thấy mã giảm giá");
            }

            // Không cho phép cập nhật một số trường
            delete updateData.code;
            delete updateData.usedCount;
            delete updateData.createdBy;

            // Validate sản phẩm mới nếu có
            if (updateData.products) {
                const validProducts = await Product.find({
                    _id: { $in: updateData.products }
                });

                if (validProducts.length !== updateData.products.length) {
                    return response(res, 400, "Một số sản phẩm không tồn tại");
                }
            }

            Object.assign(discount, updateData);
            await discount.save();

            return response(res, 200, "Cập nhật mã giảm giá thành công", discount);
        } catch (error) {
            console.error('Update discount error:', error);
            return response(res, 500, "Lỗi server");
        }
    },

    // Xóa mã giảm giá
    deleteDiscount: async (req, res) => {
        try {
            const { id } = req.params;

            const discount = await Discount.findById(id);
            if (!discount) {
                return response(res, 404, "Không tìm thấy mã giảm giá");
            }

            // Kiểm tra xem mã giảm giá đã được sử dụng chưa
            if (discount.usedCount > 0) {
                return response(res, 400, "Không thể xóa mã giảm giá đã được sử dụng");
            }

            await discount.remove();
            return response(res, 200, "Xóa mã giảm giá thành công");
        } catch (error) {
            console.error('Delete discount error:', error);
            return response(res, 500, "Lỗi server");
        }
    },

    // Lấy chi tiết mã giảm giá
    getDiscountById: async (req, res) => {
        try {
            const { id } = req.params;
            const discount = await Discount.findById(id)
                .populate('applicableProducts applicableCategories');
            if (!discount) {
                return response(res, 404, "Mã giảm giá không tồn tại");
            }
            response(res, 200, "Lấy thông tin mã giảm giá thành công", discount);
        } catch (error) {
            console.error(error);
            response(res, 500, "Lỗi máy chủ nội bộ");
        }
    },
};

export default DiscountController;