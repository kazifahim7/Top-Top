var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import QueryBuilder from "../../builder/QueryBuilder.js";
import AppError from "../../Error/AppError.js";
import { CategoryModel } from "./category.model.js";
const createCategory = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield CategoryModel.create(payload);
    return result;
});
const getAllCategory = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const categoryQuery = new QueryBuilder(CategoryModel.find(), query).paginate().filter().search(["category"]);
    const result = yield categoryQuery.modelQuery;
    return {
        meta: {
            totalData: categoryQuery.countTotal,
            limit: 10
        },
        result
    };
});
const getSingleCategory = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield CategoryModel.findById(id);
    return result;
});
const deleteCategory = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield CategoryModel.findByIdAndDelete(id);
    return result;
});
const updateCategory = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingCategory = yield CategoryModel.findById(id);
    if (!existingCategory) {
        throw new AppError(404, "This category not found");
    }
    const updateData = {};
    if (payload.category) {
        updateData.category = payload.category;
    }
    if (payload.subCategory && payload.subCategory.length > 0) {
        updateData.$addToSet = {
            subCategory: { $each: payload.subCategory }
        };
    }
    const updatedCategory = yield CategoryModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    return updatedCategory;
});
export const categoryService = {
    createCategory,
    getAllCategory,
    getSingleCategory,
    deleteCategory,
    updateCategory
};
//# sourceMappingURL=category.service.js.map