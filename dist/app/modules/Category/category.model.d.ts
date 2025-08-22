import mongoose from "mongoose";
import type { TCategory } from "./category.interface.js";
export declare const CategoryModel: mongoose.Model<TCategory, {}, {}, {}, mongoose.Document<unknown, {}, TCategory, {}, {}> & TCategory & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>;
//# sourceMappingURL=category.model.d.ts.map