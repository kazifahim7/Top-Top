import { model, Schema } from "mongoose";
const productSchema = new Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    originalPrice: { type: Number, required: true, default: 0 },
    salesPrice: { type: Number, required: true },
    images: { type: [String], required: true, default: [] },
    video: { type: String, default: "" },
    carats: { type: [String], default: [] },
    size: { type: [String], default: [] }
}, {
    timestamps: true
});
export const ProductModel = model("Product", productSchema);
//# sourceMappingURL=post.model.js.map