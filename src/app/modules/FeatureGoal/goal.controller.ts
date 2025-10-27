import type { Request, Response } from "express";
import catchAsync from "../../utils/catcgAsync.js";
import { goalServices } from "./goal.service.js";

const createGoal = catchAsync(async (req: Request, res: Response) => {
     const result = await goalServices.createGoal(req.body)
     res.status(201).json({
          success: true,
          message: "Goal created successfully",
          data: result,
     });
})



const allGoal = catchAsync(async (req: Request, res: Response) => {
     const result = await goalServices.allGoal()
     res.status(201).json({
          success: true,
          message: "All Goals are retrieved successfully",
          data: result,
     });
})
const deleteGoal = catchAsync(async (req: Request, res: Response) => {
     const result = await goalServices.deleteGoal(req.params.id!)
     res.status(201).json({
          success: true,
          message: "delete successfully",
          data: result,
     });
})




export const goalController = {
     createGoal,
     allGoal,
     deleteGoal
}