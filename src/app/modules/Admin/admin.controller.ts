import type { Request, Response } from "express";
import catchAsync from "../../utils/catcgAsync.js";
import { adminService } from "./admin.services.js";

const adminData = catchAsync(async (req: Request, res: Response) => {

     const result = await adminService.adminData()
     
     res.status(200).json({
          success: true,
          message: "system overview is retrieved successfully",
          data: result
     })

})



export const adminController ={
     adminData
}