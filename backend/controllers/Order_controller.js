import Order from '../models/order_model.js';
import Product from '../models/product_model.js';
import Discount from '../models/discount_model.js';
import response from '../utils/response.js';

const OrderController = {
    getAllOrders: async (req, res) => {
        try {
            const { page = 1, limit = 10 } = req.query;
            const orders = await Order.find()
                .populate('user')
                .populate('products.product')
                .populate('discount')
                .skip((page - 1) * limit)
                .limit(parseInt(limit))
                .exec();
            const total = await Order.countDocuments();
            response(res, 200, "", {
                orders,
                total,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
            });
        } catch (error) {
            console.error(error);
            response(res, 500, "Lỗi máy chủ nội bộ");
        }
    },
    createOrder: async (req, res) => {
        try {
            const { user, products, discount, status } = req.body;

            // Kiểm tra nếu người dùng tồn tại
            const existingUser = await User.findById(user);
            if (!existingUser) {
                return response(res, 400, "Người dùng không tồn tại");
            }

            // Kiểm tra sản phẩm hợp lệ
            const validProducts = await Product.find({ _id: { $in: products.map(p => p.product) } });
            if (validProducts.length !== products.length) {
                return response(res, 400, "Một số sản phẩm không tồn tại");
            }

            // Kiểm tra mã khuyến mãi
            let appliedDiscount = null;
            if (discount) {
                appliedDiscount = await Discount.findById(discount);
                if (!appliedDiscount) {
                    return response(res, 400, "Mã khuyến mãi không hợp lệ");
                }
            }

            const order = new Order({
                user,
                products,
                discount: appliedDiscount,
                status,
            });

            await order.save();
            response(res, 201, "Tạo đơn hàng thành công", order);
        } catch (error) {
            console.error(error);
            response(res, 500, "Lỗi máy chủ nội bộ");
        }
    },
    updateOrderStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const updatedOrder = await Order.findByIdAndUpdate(id, { status }, { new: true })
                .populate('user')
                .populate('products.product');
            if (!updatedOrder) {
                return response(res, 404, "Đơn hàng không tồn tại");
            }
            if (status === 'Shipped' || status === 'Delivered') {
                for (let item of updatedOrder.products) {
                    await Product.findByIdAndUpdate(item.product, { $inc: { stockQuantity: -item.quantity } });
                }
            }
            response(res, 200, "Cập nhật trạng thái đơn hàng thành công", updatedOrder);
        } catch (error) {
            console.error(error);
            response(res, 500, "Lỗi máy chủ nội bộ");
        }
    },
    deleteOrder: async (req, res) => {
        try {
            const { id } = req.params;
            const deletedOrder = await Order.findByIdAndDelete(id);
            if (!deletedOrder) {
                return response(res, 404, "Đơn hàng không tồn tại");
            }
            response(res, 200, "Xóa đơn hàng thành công");
        } catch (error) {
            console.error(error);
            response(res, 500, "Lỗi máy chủ nội bộ");
        }
    },
    getOrderById: async (req, res) => {
        try {
            const { id } = req.params;
            const order = await Order.findById(id)
                .populate('user')
                .populate('products.product')
                .populate('discount');
            if (!order) {
                return response(res, 404, "Đơn hàng không tồn tại");
            }
            response(res, 200, "", order);
        } catch (error) {
            console.error(error);
            response(res, 500, "Lỗi máy chủ nội bộ");
        }
    }
};

export default OrderController;