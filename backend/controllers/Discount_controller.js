import Discount from '../models/discount_model.js';
import response from '../utils/reponse.js';

const DiscountController = {
    // Lấy tất cả khuyến mãi
    getAllDiscounts: async (req, res) => {
        try {
            const data = await Discount.find().populate('applicableProducts applicableCategories');
            if (!data || data.length === 0) {
                response(res, 404, "No discounts found");
            }
            response(res, 200, "Discounts retrieved successfully", data);
        } catch (error) {
            console.error(error);
            response(res, 500, "Internal server error");
        }
    },

    // Tạo khuyến mãi mới
    createDiscount: async (req, res) => {
        try {
            const { code, description, discountType, amount, validFrom, validUntil, applicableProducts, applicableCategories } = req.body;

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
            response(res, 201, "Discount created successfully", discount);
        } catch (error) {
            console.error(error);
            response(res, 500, "Internal server error");
        }
    },

    // Xóa khuyến mãi
    deleteDiscount: async (req, res) => {
        try {
            const { id } = req.params;
            const discount = await Discount.findByIdAndDelete(id);

            if (!discount) {
                response(res, 404, "Discount not found");
            }

            response(res, 200, "Discount deleted successfully");
        } catch (error) {
            console.error(error);
            response(res, 500, "Internal server error");
        }
    },

    // Cập nhật khuyến mãi
    updateDiscount: async (req, res) => {
        try {
            const { id } = req.params;
            const data = req.body;
            const discountUpdate = await Discount.findByIdAndUpdate(id, data, { new: true });

            if (!discountUpdate) {
                response(res, 404, "Discount not found");
            }

            response(res, 200, "Discount updated successfully", discountUpdate);
        } catch (error) {
            console.error(error);
            response(res, 500, "Internal server error");
        }
    },

    // Lấy chi tiết khuyến mãi
    getDiscountById: async (req, res) => {
        try {
            const { id } = req.params;
            const discount = await Discount.findById(id).populate('applicableProducts applicableCategories');

            if (!discount) {
                response(res, 404, "Discount not found");
            }

            response(res, 200, "Discount retrieved successfully", discount);
        } catch (error) {
            console.error(error);
            response(res, 500, "Internal server error");
        }
    }
};

export default DiscountController;
