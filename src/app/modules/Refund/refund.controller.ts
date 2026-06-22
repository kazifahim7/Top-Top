import type { Request, Response } from "express"
import catchAsync from "../../utils/catcgAsync.js"
import { refundService } from "./refund.service.js"

const sendRefundRequest = catchAsync(async (req: Request, res: Response) => {
     const userId = req.user.id
     const data =req.body
     data.playerId=userId
     const result = await refundService.sendRefundRequest(data)
     res.status(200).json({
          success: true,
          message: "Refund Request send successfully ",
          data: result
     })
})
const allRefundRequest = catchAsync(async (req: Request, res: Response) => {
    
     const result = await refundService.allRefundRequest()
     res.status(200).json({
          success: true,
          message: " All Refund Request retrieved successfully ",
          data: result
     })
})
const acceptRefundRequest = catchAsync(async (req: Request, res: Response) => {
    
     const result = await refundService.acceptRefundRequest(req.body)
     res.status(200).json({
          success: true,
          message: " Refund Request accept successfully ",
          data: result
     })
})

const exit_lobby = catchAsync(async (req: Request, res: Response) => {
     const id =req?.user?.id;
    
     const result = await refundService.exit_lobby(req.body,id)
     res.status(200).json({
          success: true,
          message: "  Accept successfully ",
          data: result
     })
})
const leave_lobby = catchAsync(async (req: Request, res: Response) => {
     const id = req?.user?.id;

     const result = await refundService.leave_lobby(req.body, id)
     res.status(200).json({
          success: true,
          message: result.message,
          data: result
     })
})
const exit_lobby_organizer = catchAsync(async (req: Request, res: Response) => {
     const id =req?.user?.id;

    
     const result = await refundService.exit_lobby_organizer(req.body,id)
     res.status(200).json({
          success: true,
          message: "  Accept successfully ",
          data: result
     })
})


export const refundController ={
     sendRefundRequest,
     allRefundRequest,
     acceptRefundRequest,
     leave_lobby,
     exit_lobby,
     exit_lobby_organizer
}
