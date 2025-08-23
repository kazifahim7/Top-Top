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
import { ProductServices } from "./post.service.js";
import { getLocalImageURL } from "../../utils/multer.js";
// import fs from "fs";
// import path from "path";
// const UPLOAD_DIR = path.join(process.cwd(), "uploads");
const createProduct = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const imageFiles = req.files.images || [];
    const videoFiles = req.files.video || [];
    const images = [];
    let video = "";
    // ইমেজ ফাইল প্রসেস
    for (const file of imageFiles) {
        const url = getLocalImageURL(file.filename);
        images.push(url);
        // ফাইল ডিলিট (লোকাল থেকে)
        // fs.unlink(path.join(UPLOAD_DIR, file.filename), (err) => {
        //      if (err) console.error("Delete error:", err);
        // });
    }
    // ভিডিও ফাইল প্রসেস
    if (videoFiles.length > 0) {
        const videoFile = videoFiles[0];
        video = getLocalImageURL(videoFile.filename);
        // fs.unlink(path.join(UPLOAD_DIR, videoFile.filename), (err) => {
        //      if (err) console.error("Delete error:", err);
        // });
    }
    if (images.length > 0) {
        req.body.images = images;
    }
    if (video) {
        req.body.video = video;
    }
    const data = req.body;
    const result = yield ProductServices.createProduct(data);
    res.status(200).json({
        success: true,
        message: "Product created successfully",
        data: result
    });
}));
const getAllProduct = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield ProductServices.getAllProduct(req.query);
    res.status(200).json({
        success: true,
        message: "All Product retrieved successfully",
        data: result
    });
}));
const getSingleProduct = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield ProductServices.getSingleProduct(req.params.id);
    res.status(200).json({
        success: true,
        message: " Product retrieved successfully",
        data: result
    });
}));
const deleteProduct = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield ProductServices.deleteProduct(req.params.id);
    res.status(200).json({
        success: true,
        message: " Product Deleted successfully",
        data: result
    });
}));
const updateSingleProduct = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield ProductServices.updateSingleProduct(req);
    res.status(200).json({
        success: true,
        message: " Product updated successfully",
        data: result
    });
}));
export const productController = {
    createProduct,
    getAllProduct,
    getSingleProduct,
    updateSingleProduct,
    deleteProduct
};
//# sourceMappingURL=post.controller.js.map