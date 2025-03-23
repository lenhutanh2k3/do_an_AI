import bcrypt  from 'bcrypt'
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
UserShema.pre('save', async function (next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});
export default mongoose.model('User',UserShema)