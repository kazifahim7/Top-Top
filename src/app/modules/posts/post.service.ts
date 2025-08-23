import type { Request } from "express";
import QueryBuilder from "../../builder/QueryBuilder.js";
import type { TProduct } from "./post.interface.js";
import { ProductModel } from "./post.model.js";
import AppError from "../../Error/AppError.js";
import path from "path";
import fs from "fs";
import config from "../../config/index.js";


const UPLOAD_DIR = path.join(process.cwd(), "uploads");

const createProduct = async (payload: TProduct) => {
     const result = await ProductModel.create(payload)
     return result
}

const getAllProduct = async(query : Record<string,unknown>)=>{
     const productQuery = new QueryBuilder(ProductModel.find(),query).filter().sort().paginate()
     const result = await productQuery.modelQuery
     const meta = await productQuery.countTotal()
     return {
          meta,
          result
     }
}

const getSingleProduct = async(id:string)=>{
     const result = await ProductModel.findById(id)
     return result
}

export const updateSingleProduct = async (req: Request) => {
     try {
          const { id } = req.params;
          const { body, files } = req;

          const product = await ProductModel.findById(id);
          if (!product) throw new AppError(404, "Product not found");

          const updateData: any = {};

          // ---------- Normal fields ----------
          const normalFields = ["title", "description", "originalPrice", "salesPrice", "category"];
          normalFields.forEach(field => {
               if (body[field] !== undefined) updateData[field] = body[field];
          });

          // ---------- Images ($set) ----------
          if (files && (files as any).images && (files as any).images.length > 0) {
               const newImages = (files as any).images.map(
                    (file: Express.Multer.File) => `http://localhost:${config.port}/uploads/${file.filename}`
               );

               // old images delete (optional)
               // product.images.forEach(img => {
               //      const filename = path.basename(img);
               //      fs.unlink(path.join(UPLOAD_DIR, filename), () => { });
               // });

               updateData.images = newImages;
          }

          // ---------- Video ----------
          if (files && (files as any).video && (files as any).video.length > 0) {
               const videoUrl = `http://localhost:${config.port}/uploads/${(files as any).video[0].filename}`;
               updateData.video = videoUrl;
          } else if (body.replaceVideo) {
               updateData.video = "";
          }

          // ---------- Array fields ($set) ----------
          const arrayFields = ["carats", "size"];
          arrayFields.forEach(field => {
               if (body[field] !== undefined) {
                    const newValues = typeof body[field] === "string"
                         ? body[field].split(",").map((s: string) => s.trim())
                         : body[field];
                    updateData[field] = newValues;
               }
          });

          // ---------- Update in DB ----------
          const result = await ProductModel.findByIdAndUpdate(
               id,
               { $set: updateData },
               { new: true, runValidators: true }
          );

          return result;
     } catch (error) {
          console.log(error);
          throw new AppError(500, "Something went wrong");
     }
};
 
 
 


const deleteProduct = async (id:string)=>{
     const isProductExists = await ProductModel.findById(id)
     if(!isProductExists){
          throw new AppError(404,"this product are not available");
          
     }
     const result = await ProductModel.findByIdAndDelete(id)
     return result
}






export const ProductServices = {
     createProduct,
     getAllProduct,
     getSingleProduct,
     updateSingleProduct,
     deleteProduct
}