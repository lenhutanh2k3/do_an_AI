import bcrypt from 'bcrypt'
import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
    {
        username: { 
            type: String, 
            required: [true, 'Tên người dùng là bắt buộc'], 
            trim: true, 
            unique: true,
            minlength: [3, 'Tên người dùng phải có ít nhất 3 ký tự'],
            maxlength: [30, 'Tên người dùng không được vượt quá 30 ký tự']
        },
        email: { 
            type: String, 
            required: [true, 'Email là bắt buộc'], 
            trim: true, 
            unique: true,
            lowercase: true,
            match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Email không hợp lệ']
        },
        password: { 
            type: String, 
            required: [true, 'Mật khẩu là bắt buộc'],
            minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự']
        },
        firstName: { 
            type: String, 
            trim: true,
            maxlength: [30, 'Tên không được vượt quá 30 ký tự']
        },
        lastName: { 
            type: String, 
            trim: true,
            maxlength: [30, 'Họ không được vượt quá 30 ký tự']
        },
        address: { 
            type: String, 
            trim: true,
            maxlength: [200, 'Địa chỉ không được vượt quá 200 ký tự']
        },
        role: { 
            type: String, 
            enum: ['customer', 'admin'], 
            default: 'customer' 
        },
        refreshToken: { type: String },
        isActive: { 
            type: Boolean, 
            default: true 
        }
    },
    { 
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
)

// Virtual for full name
userSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`.trim();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile
userSchema.methods.getPublicProfile = function() {
    const userObject = this.toObject();
    delete userObject.password;
    delete userObject.refreshToken;
    return userObject;
};



const User = mongoose.model('User', userSchema)

export default User;