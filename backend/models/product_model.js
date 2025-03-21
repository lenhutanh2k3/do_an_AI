import mongoose  from "mongoose";

// Định nghĩa schema cho sản phẩm giày
const productSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    sizes: {
        type: [Number],
        required: true,
        validate: [arrayLimit, '{PATH} must have at least one size'],
    },
    colors: {
        type: [String],
        required: true,
        validate: [arrayLimit, '{PATH} must have at least one color'],
    },
    images: {
        type: [String],
        required: true,
        validate: [arrayLimit, '{PATH} must have at least one image'],
    },
    brand: { type: String, required: true, trim: true },
    material: { type: String, required: true, trim: true },
    stockQuantity: { type: Number, required: true, min: 0 },
    status: {
        type: String,
        enum: ['In Stock', 'Out of Stock', 'Pre-order'],
        default: 'In Stock',
    },
    // Liên kết tới model Discount nếu sản phẩm có giảm giá áp dụng
    discount: { type: mongoose.Schema.Types.ObjectId, ref: 'Discount' },
    
}, { timestamps: true });

// Hàm validate để đảm bảo rằng mảng không rỗng
function arrayLimit(val) {
    return val.length > 0;
}
const Product = mongoose.model('Product', productSchema);
export default Product;
