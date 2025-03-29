import Order from '../models/order_model.js';
import Product from '../models/product_model.js';
import Discount from '../models/discount_model.js';
import response from '../utils/response.js';
import User from '../models/user_model.js';
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
            console.log(orders);
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
            const { items, shippingAddress, paymentMethod, note, totalAmount, shippingFee } = req.body;

            // Kiểm tra req.user
            if (!req.user || !req.user.id) {
                return response(res, 401, "Không thể xác thực người dùng");
            }
            const userId = req.user.id;
            console.log("User ID from token:", userId);

            // Kiểm tra items
            if (!items || !Array.isArray(items) || items.length === 0) {
                return response(res, 400, "Đơn hàng phải có ít nhất một sản phẩm");
            }

            // Kiểm tra paymentMethod
            if (!['COD', 'MOMO', 'BANK'].includes(paymentMethod)) {
                return response(res, 400, "Phương thức thanh toán không hợp lệ");
            }

            // Kiểm tra shippingAddress
            if (!shippingAddress || typeof shippingAddress !== 'object') {
                return response(res, 400, "Địa chỉ giao hàng không hợp lệ");
            }
            const shippingAddressString = `${shippingAddress.fullName}, ${shippingAddress.address}, ${shippingAddress.ward}, ${shippingAddress.district}, ${shippingAddress.city}, ${shippingAddress.phone}`;

            // Kiểm tra sản phẩm
            const validProducts = await Product.find({
                _id: { $in: items.map(item => item.product) }
            });

            if (validProducts.length !== items.length) {
                return response(res, 400, "Một số sản phẩm không tồn tại");
            }

            // Kiểm tra stock, size, color
            for (const item of items) {
                const product = validProducts.find(p => p._id.toString() === item.product);
                if (!product) {
                    return response(res, 400, `Không tìm thấy sản phẩm`);
                }
                if (product.stockQuantity < item.quantity) {
                    return response(res, 400, `Sản phẩm ${product.name} chỉ còn ${product.stockQuantity} trong kho`);
                }
                if (!product.sizes.includes(item.selectedSize)) {
                    return response(res, 400, `Size ${item.selectedSize} không có sẵn cho sản phẩm ${product.name}`);
                }
                if (!product.colors.includes(item.selectedColor)) {
                    return response(res, 400, `Màu ${item.selectedColor} không có sẵn cho sản phẩm ${product.name}`);
                }
            }

            // Chuẩn bị dữ liệu products từ items
            const products = items.map(item => ({
                product: item.product,
                quantity: item.quantity,
                price: item.price
            }));

            // Tạo đơn hàng mới
            const order = new Order({
                user: userId,
                products,
                shippingAddress: shippingAddressString,
                paymentMethod,
                note,
                totalAmount,
                shippingFee,
                status: 'Pending' // Khớp với enum
            });

            await order.save();

            // Cập nhật số lượng tồn kho
            for (const item of items) {
                await Product.findByIdAndUpdate(
                    item.product,
                    { $inc: { stockQuantity: -item.quantity } }
                );
            }

            // Populate thông tin chi tiết đơn hàng
            await order.populate('products.product', 'name images price sizes colors brand');

            return response(res, 201, "Đặt hàng thành công", { order });
        } catch (error) {
            console.error('Create order error:', error);
            return response(res, 500, "Lỗi server khi tạo đơn hàng", { error: error.message });
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
    },
    countOrder: async (req, res) => {
        try {
            // Đếm số lượng Category trong cơ sở dữ liệu
            const OrderCount = await Order.countDocuments();

            // Trả về kết quả
            res.status(200).json({
                success: true,
                count: OrderCount,
                message: 'Số lượng Order được tính thành công!'
            });
        } catch (error) {
            // Xử lý lỗi
            console.error(error);
            res.status(500).json({
                success: false,
                message: 'Có lỗi xảy ra khi tính số lượng order'
            });
        }
    }
};

export default OrderController;