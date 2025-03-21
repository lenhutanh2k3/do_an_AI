import mongoose from "mongoose";

const OrderShema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: [
        {
            product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true, min: 1 },
            // Lưu lại giá tại thời điểm đặt hàng (tránh thay đổi khi giá sản phẩm thay đổi sau này)
            price: { type: Number, required: true, min: 0 },
        },
    ],
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending',
    },
    shippingAddress: { type: String, required: true },
    discount: { type: Schema.Types.ObjectId, ref: 'Discount' },
},
    { timestamps: true }
)