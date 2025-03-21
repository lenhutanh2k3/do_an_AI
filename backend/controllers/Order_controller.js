import Order from '../models/order_model.js';
import response from '../utils/response.js';

const OrderController = {
    // Lấy tất cả các đơn hàng có phân trang
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
            response(res, 500, "Internal Server Error");
        }
    },

    // Tạo đơn hàng mới
    createOrder: async (req, res) => {
        try {
            const { user, products, totalAmount, shippingAddress, discount } = req.body;

            const newOrder = new Order({
                user,
                products,
                totalAmount,
                shippingAddress,
                discount,
            });

            await newOrder.save();
            response(res, 201, "Order created successfully", newOrder);
        } catch (error) {
            console.error(error);
            response(res, 500, "Internal Server Error");
        }
    },

    // Cập nhật trạng thái đơn hàng
    updateOrderStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const updatedOrder = await Order.findByIdAndUpdate(
                id,
                { status },
                { new: true }
            ).populate('user').populate('products.product');

            if (!updatedOrder) {
                response(res, 404, "Order not found");
            } else {
                response(res, 200, "Order status updated successfully", updatedOrder);
            }
        } catch (error) {
            console.error(error);
            response(res, 500, "Internal Server Error");
        }
    },

    // Xóa đơn hàng
    deleteOrder: async (req, res) => {
        try {
            const { id } = req.params;

            const deletedOrder = await Order.findByIdAndDelete(id);
            if (!deletedOrder) {
                response(res, 404, "Order not found");
            } else {
                response(res, 200, "Order deleted successfully");
            }
        } catch (error) {
            console.error(error);
            response(res, 500, "Internal Server Error");
        }
    },

    // Lấy chi tiết đơn hàng theo ID
    getOrderById: async (req, res) => {
        try {
            const { id } = req.params;

            const order = await Order.findById(id)
                .populate('user')
                .populate('products.product')
                .populate('discount');

            if (!order) {
                response(res, 404, "Order not found");
            } else {
                response(res, 200, "", order);
            }
        } catch (error) {
            console.error(error);
            response(res, 500, "Internal Server Error");
        }
    }
};

export default OrderController;
