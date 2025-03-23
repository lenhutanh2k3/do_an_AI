import Discount from '../models/discount_model.js';
import response from '../utils/response.js';

const DiscountController = {
    // Lấy tất cả khuyến mãi
    getAllDiscounts: async (req, res) => {
        try {
            const data = await Discount.find().populate('applicableProducts applicableCategories');
            if (!data || data.length === 0) {
                return response(res, 404, "Không tìm thấy khuyến mãi");
            }
            response(res, 200, "Lấy danh sách khuyến mãi thành công", data);
        } catch (error) {
            console.error(error);
            response(res, 500, "Lỗi máy chủ nội bộ");
        }
    },

    // Tạo khuyến mãi mới
    createDiscount: async (req, res) => {
        try {
            const { code, description, discountType, amount, validFrom, validUntil, applicableProducts, applicableCategories } = req.body;

            // Kiểm tra mã trùng
            const existingDiscount = await Discount.findOne({ code });
            if (existingDiscount) {
                return response(res, 400, "Mã khuyến mãi đã tồn tại");
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

            // Kiểm tra danh mục áp dụng
            if (applicableCategories && applicableCategories.length > 0) {
                const validCategories = await Category.find({ _id: { $in: applicableCategories } });
                if (validCategories.length !== applicableCategories.length) {
                    return response(res, 400, "Một số danh mục không tồn tại");
                }
            }

            const discount = new Discount({
                code,
                description,
                discountType,
                amount,
                validFrom,
                validUntil,
                applicableProducts,
                applicableCategories
            });
            await discount.save();
            response(res, 201, "Tạo khuyến mãi thành công", discount);
        } catch (error) {
            console.error(error);
            response(res, 500, "Lỗi máy chủ nội bộ");
        }
    },

    // Xóa khuyến mãi
    deleteDiscount: async (req, res) => {
        try {
            const { id } = req.params;
            const discount = await Discount.findByIdAndDelete(id);
            if (!discount) {
                return response(res, 404, "Khuyến mãi không tồn tại");
            }
            response(res, 200, "Xóa khuyến mãi thành công");
        } catch (error) {
            console.error(error);
            response(res, 500, "Lỗi máy chủ nội bộ");
        }
    },

    // Cập nhật khuyến mãi
    updateDiscount: async (req, res) => {
        try {
            const { id } = req.params;
            const { code, validFrom, validUntil, discountType, amount } = req.body;

            if (code) {
                const existingDiscount = await Discount.findOne({ code, _id: { $ne: id } });
                if (existingDiscount) {
                    return response(res, 400, "Mã khuyến mãi đã tồn tại");
                }
            }

            if (validFrom && validUntil && new Date(validFrom) >= new Date(validUntil)) {
                return response(res, 400, "Ngày bắt đầu phải trước ngày kết thúc");
            }

            if (discountType === 'percentage' && (amount < 0 || amount > 100)) {
                return response(res, 400, "Giá trị phần trăm phải từ 0 đến 100");
            }

            const discountUpdate = await Discount.findByIdAndUpdate(id, req.body, { new: true });
            if (!discountUpdate) {
                return response(res, 404, "Khuyến mãi không tồn tại");
            }
            response(res, 200, "Cập nhật khuyến mãi thành công", discountUpdate);
        } catch (error) {
            console.error(error);
            response(res, 500, "Lỗi máy chủ nội bộ");
        }
    },

    // Lấy chi tiết khuyến mãi
    getDiscountById: async (req, res) => {
        try {
            const { id } = req.params;
            const discount = await Discount.findById(id).populate('applicableProducts applicableCategories');
            if (!discount) {
                return response(res, 404, "Khuyến mãi không tồn tại");
            }
            response(res, 200, "Lấy thông tin khuyến mãi thành công", discount);
        } catch (error) {
            console.error(error);
            response(res, 500, "Lỗi máy chủ nội bộ");
        }
    }
};

export default DiscountController;