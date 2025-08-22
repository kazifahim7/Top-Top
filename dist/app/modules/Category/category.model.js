import mongoose, { Schema } from "mongoose";
const schema = new Schema({
    category: { type: String, required: true },
    subCategory: { type: [String], default: [] }
}, { timestamps: true });
export const CategoryModel = mongoose.model('Category', schema);
//# sourceMappingURL=category.model.js.map