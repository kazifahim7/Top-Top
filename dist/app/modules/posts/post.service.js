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
import { ProductModel } from "./post.model.js";
import AppError from "../../Error/AppError.js";
import path from "path";
import fs from "fs";
import config from "../../config/index.js";
const UPLOAD_DIR = path.join(process.cwd(), "uploads");
const createProduct = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield ProductModel.create(payload);
    return result;
});
const getAllProduct = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const productQuery = new QueryBuilder(ProductModel.find(), query).filter().sort().paginate();
    const result = yield productQuery.modelQuery;
    const meta = yield productQuery.countTotal();
    return {
        meta,
        result
    };
});
const getSingleProduct = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield ProductModel.findById(id);
    return result;
});
export const updateSingleProduct = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { body, files } = req;
        const product = yield ProductModel.findById(id);
        if (!product)
            throw new AppError(404, "Product not found");
        const updateData = {};
        // ---------- Normal fields ----------
        const normalFields = ["title", "description", "originalPrice", "salesPrice", "category"];
        normalFields.forEach(field => {
            if (body[field] !== undefined)
                updateData[field] = body[field];
        });
        // ---------- Images ($set) ----------
        if (files && files.images && files.images.length > 0) {
            const newImages = files.images.map((file) => `http://localhost:${config.port}/uploads/${file.filename}`);
            // old images delete (optional)
            // product.images.forEach(img => {
            //      const filename = path.basename(img);
            //      fs.unlink(path.join(UPLOAD_DIR, filename), () => { });
            // });
            updateData.images = newImages;
        }
        // ---------- Video ----------
        if (files && files.video && files.video.length > 0) {
            const videoUrl = `http://localhost:${config.port}/uploads/${files.video[0].filename}`;
            updateData.video = videoUrl;
        }
        else if (body.replaceVideo) {
            updateData.video = "";
        }
        // ---------- Array fields ($set) ----------
        const arrayFields = ["carats", "size"];
        arrayFields.forEach(field => {
            if (body[field] !== undefined) {
                const newValues = typeof body[field] === "string"
                    ? body[field].split(",").map((s) => s.trim())
                    : body[field];
                updateData[field] = newValues;
            }
        });
        // ---------- Update in DB ----------
        const result = yield ProductModel.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
        return result;
    }
    catch (error) {
        console.log(error);
        throw new AppError(500, "Something went wrong");
    }
});
const deleteProduct = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isProductExists = yield ProductModel.findById(id);
    if (!isProductExists) {
        throw new AppError(404, "this product are not available");
    }
    const result = yield ProductModel.findByIdAndDelete(id);
    return result;
});
export const ProductServices = {
    createProduct,
    getAllProduct,
    getSingleProduct,
    updateSingleProduct,
    deleteProduct
};
//# sourceMappingURL=post.service.js.map