
import mongoose from 'mongoose'
const UserShema = new mongoose.Schema(
    {
        username: { type: String, required: true, trim: true, unique: true },
        email: { type: String, required: true, trim: true, unique: true },
        password: { type: String, required: true }, // mật khẩu đã được băm
        firstName: { type: String, trim: true },
        lastName: { type: String, trim: true },
        address: { type: String, trim: true },
        role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
        refreshToken:{type:String}
    },
    { timestamps: true }
)
export default mongoose.model('User',UserShema)