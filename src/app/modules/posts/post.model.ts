import { model, Schema } from "mongoose";
import type { TProduct } from "./post.interface.js";

const productSchema = new Schema<TProduct>(
     {
          title: { type: String, required: true, trim: true },
          description: { type: String, required: true },
          category: { type: String, required: true },
          originalPrice: { type: Number, required: true, default: 0 },
          salesPrice: { type: Number, required: true },
          images: { type: [String], required: true, default: [] },
          video: { type: String, default: "" },
          carats: { type: [String], default: [] },
          size: { type: [String], default: [] }
     },
     {
          timestamps: true
     }
);

export const ProductModel = model<TProduct>("Product", productSchema);