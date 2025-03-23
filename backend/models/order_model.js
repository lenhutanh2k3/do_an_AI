import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: {
        type: [
            {
                product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
                quantity: { type: Number, required: true, min: 1 },
                price: { type: Number, required: true, min: 0 },
            },
        ],
        validate: [arrayLimit, 'Đơn hàng phải có ít nhất một sản phẩm'],
    },
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending',
    },
    shippingAddress: { type: String, required: true },
    discount: { type: mongoose.Schema.Types.ObjectId, ref: 'Discount' },
}, { timestamps: true });

function arrayLimit(val) {
    return val.length > 0;
}

const Order = mongoose.model('Order', OrderSchema);
export default Order;