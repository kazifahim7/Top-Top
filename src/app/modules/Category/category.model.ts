import mongoose, { Schema } from "mongoose";
import type { TCategory } from "./category.interface.js";


const schema = new Schema<TCategory>({
     category: { type: String, required: true },
     subCategory: { type: [String], default: [] }

}, { timestamps: true });



export const CategoryModel = mongoose.model<TCategory>('Category', schema);