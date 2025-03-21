import mongoose from 'mongoose';

const CartSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
    products: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, 
            quantity: { type: Number, required: true, min: 1 },
        }
    ],
    totalAmount: { type: Number, required: true, min: 0 }, 
},
    { timestamps: true } 
);

// Tính tổng số tiền của giỏ hàng dựa trên số lượng và giá sản phẩm
CartSchema.methods.calculateTotalAmount = function () {
    this.totalAmount = this.products.reduce((total, item) => {
        return total + item.product.price * item.quantity; 
    }, 0);
};

const Cart = mongoose.model('Cart', CartSchema);
export default Cart;
