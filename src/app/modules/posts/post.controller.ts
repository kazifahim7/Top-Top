import type { Request, Response } from "express";
import catchAsync from "../../utils/catcgAsync.js";
import { ProductServices } from "./post.service.js";
import { getLocalImageURL } from "../../utils/multer.js";
// import fs from "fs";
// import path from "path";



// const UPLOAD_DIR = path.join(process.cwd(), "uploads");

const createProduct = catchAsync(async (req: Request, res: Response) => {


     const imageFiles = (req.files as any).images || [];
     const videoFiles = (req.files as any).video || [];

     const images: string[] = [];
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


     if(images.length > 0){
          req.body.images=images
     }
     if (video){
          req.body.video = video
     }



     const data = req.body;
     const result = await ProductServices.createProduct(data)

     res.status(200).json({
          success: true,
          message: "Product created successfully",
          data: result
     })


})

const getAllProduct = catchAsync(async (req: Request, res: Response) => {
  
     const result = await ProductServices.getAllProduct(req.query)

     res.status(200).json({
          success: true,
          message: "All Product retrieved successfully",
          data: result
     })


})

const getSingleProduct = catchAsync(async (req: Request, res: Response) => {
  
     const result = await ProductServices.getSingleProduct(req.params.id!)

     res.status(200).json({
          success: true,
          message: " Product retrieved successfully",
          data: result
     })


})
const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  
     const result = await ProductServices.deleteProduct(req.params.id!)

     res.status(200).json({
          success: true,
          message: " Product Deleted successfully",
          data: result
     })


})
const updateSingleProduct = catchAsync(async (req: Request, res: Response) => {
  
     const result = await ProductServices.updateSingleProduct(req)

     res.status(200).json({
          success: true,
          message: " Product updated successfully",
          data: result
     })


})



export const productController = {
     createProduct,
     getAllProduct,
     getSingleProduct,
     updateSingleProduct,
     deleteProduct
}






