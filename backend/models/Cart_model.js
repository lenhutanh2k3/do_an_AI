import mongoose from 'mongoose';

const CartSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true, min: 1 },
        },
    ],
    totalAmount: { type: Number, default: 0 }, // Không bắt buộc, mặc định là 0
}, { timestamps: true });


const Cart = mongoose.model('Cart', CartSchema);
export default Cart;
