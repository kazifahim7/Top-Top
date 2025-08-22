var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import catchAsync from "../../utils/catcgAsync.js";
import { categoryService } from "./category.service.js";
const createCategory = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    const result = yield categoryService.createCategory(data);
    res.status(200).json({
        success: true,
        message: "Category created successfully",
        data: result
    });
}));
const getAllCategory = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield categoryService.getAllCategory(req.query);
    res.status(200).json({
        success: true,
        message: "User registered successfully",
        data: result
    });
}));
const getSingleCategory = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield categoryService.getSingleCategory(req.params.id);
    res.status(200).json({
        success: true,
        message: "Category updated successfully",
        data: result
    });
}));
const deleteCategory = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield categoryService.deleteCategory(req.params.id);
    res.status(200).json({
        success: true,
        message: "Category deleted successfully",
        data: result
    });
}));
const updateCategory = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield categoryService.updateCategory(req.params.id, req.body);
    res.status(200).json({
        success: true,
        message: "Category updated successfully",
        data: result
    });
}));
export const categoryController = {
    createCategory,
    getAllCategory,
    getSingleCategory,
    deleteCategory,
    updateCategory
};
//# sourceMappingURL=category.controller.js.map