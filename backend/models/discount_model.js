import mongoose from "mongoose";

const DiscountShema = new mongoose({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
    },
    description: { type: String, trim: true },
    discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
    amount: { type: Number, required: true, min: 0 },
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    // Tùy chọn: Áp dụng giảm giá cho các sản phẩm hoặc danh mục cụ thể
    applicableProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    applicableCategories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
},
    { timestamps: true }
)
export default mongoose.model('Discount',DiscountShema)