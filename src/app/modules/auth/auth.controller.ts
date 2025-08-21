import { type Request, type Response } from "express";
import catchAsync from "../../utils/catcgAsync.js";
import { authService } from "./auth.services.js";


const createUser = catchAsync(async (req: Request, res: Response) => {
     const data = req.body;
     const result = await authService.createUserIntoDB(data)

     res.status(200).json({
          success: true,
          message: "User registered successfully",
          data: {
               _id: result?._id,
               firstName: result?.firstName,
               LastName: result?.lastName,
               email: result?.email
          }
     })


})
const logInUser = catchAsync(async (req: Request, res: Response) => {
     const data = req.body;
     const result = await authService.loginUser(data)

     res.status(200).json({
          success: true,
          message: "User login successfully",
          data: result
     })


})
const resetRequest = catchAsync(async (req: Request, res: Response) => {
     const data = req.body;
     const result = await authService.resetRequest(data)

     res.status(200).json({
          success: true,
          message: "Check your Email",
          data: result
     })


})
const updateStatus = catchAsync(async (req: Request, res: Response) => {
     const id = req.params.id;
     const data = req.body
     const result = await authService.updateStatusInDB(id!, data)

     res.status(200).json({
          success: true,
          message: "User status update successfully successfully",
          data: result
     })


})
const updateProfile = catchAsync(async (req: Request, res: Response) => {
     const id = req.params?.email;
     const data = req.body
     const result = await authService.updateProfileInDB(id!, data)

     res.status(200).json({
          success: true,
          message: "User  update successfully ",
          data: result
     })


})
const allUsers = catchAsync(async (req: Request, res: Response) => {

     const result = await authService.allStudentFromDB()

     res.status(200).json({
          success: true,
          message: "User is retrieved successfully ",
          data: result
     })


})
const singleUser = catchAsync(async (req: Request, res: Response) => {

     const result = await authService.getSingleUser(req?.params?.email!)

     res.status(200).json({
          success: true,
          message: "User is retrieved successfully ",
          data: result
     })


})
const resetPassword = catchAsync(async (req: Request, res: Response) => {

     const result = await authService.resetPassword(req?.body)

     res.status(200).json({
          success: true,
          message: "Password successfully updated ",
          data: result
     })


})



export const authController = {
     createUser,
     logInUser,
     updateStatus,
     updateProfile,
     allUsers,
     singleUser,
     resetRequest,
     resetPassword
}