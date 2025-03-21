import mongoose from "mongoose";

const CategoryShema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
}, { timestamps: true })

export default mongoose.model('Category',CategoryShema);