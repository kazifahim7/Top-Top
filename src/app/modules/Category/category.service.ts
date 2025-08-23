import QueryBuilder from "../../builder/QueryBuilder.js";
import AppError from "../../Error/AppError.js";
import type { TCategory } from "./category.interface.js";
import { CategoryModel } from "./category.model.js";

const createCategory = async (payload: TCategory) => {
     const result = await CategoryModel.create(payload)
     return result
}

const getAllCategory = async (query: Record<string, unknown>) => {
     const categoryQuery = new QueryBuilder(CategoryModel.find(), query).paginate().filter().search(["category"])
     const result = await categoryQuery.modelQuery
     const meta = await categoryQuery.countTotal()


     return {
          result,
          meta
     }
}

const getSingleCategory = async (id: string) => {
     const result = await CategoryModel.findById(id)
     return result
}
const deleteCategory = async (id: string) => {
     const result = await CategoryModel.findByIdAndDelete(id)
     return result
}
const updateCategory = async (id: string, payload: Partial<TCategory>) => {

     const existingCategory = await CategoryModel.findById(id);
     if (!existingCategory) {
          throw new AppError(404, "This category not found");
     }


     const updateData: any = {};


     if (payload.category) {
          updateData.category = payload.category;
     }


     if (payload.subCategory && payload.subCategory.length > 0) {
          updateData.$addToSet = {
               subCategory: { $each: payload.subCategory }
          };
     }


     const updatedCategory = await CategoryModel.findByIdAndUpdate(
          id,
          updateData,
          { new: true, runValidators: true }
     );

     return updatedCategory;
};



export const categoryService = {
     createCategory,
     getAllCategory,
     getSingleCategory,
     deleteCategory,
     updateCategory
}
