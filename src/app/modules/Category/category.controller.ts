import type { Request, Response } from "express";
import catchAsync from "../../utils/catcgAsync.js";
import { categoryService } from "./category.service.js";

const createCategory = catchAsync(async (req: Request, res: Response) => {
     const data = req.body;
     const result = await categoryService.createCategory(data)

     res.status(200).json({
          success: true,
          message: "Category created successfully",
          data: result
     })


})
const getAllCategory = catchAsync(async (req: Request, res: Response) => {

     const result = await categoryService.getAllCategory(req.query)

     res.status(200).json({
          success: true,
          message: "User registered successfully",
          data: result
     })


})
const getSingleCategory = catchAsync(async (req: Request, res: Response) => {

     const result = await categoryService.getSingleCategory(req.params.id!)

     res.status(200).json({
          success: true,
          message: "Category updated successfully",
          data: result
     })


})
const deleteCategory = catchAsync(async (req: Request, res: Response) => {

     const result = await categoryService.deleteCategory(req.params.id!)

     res.status(200).json({
          success: true,
          message: "Category deleted successfully",
          data: result
     })


})
const updateCategory = catchAsync(async (req: Request, res: Response) => {

     const result = await categoryService.updateCategory(req.params.id!, req.body)

     res.status(200).json({
          success: true,
          message: "Category updated successfully",
          data: result
     })


})


export const categoryController = {
     createCategory,
     getAllCategory,
     getSingleCategory,
     deleteCategory,
     updateCategory 
}

