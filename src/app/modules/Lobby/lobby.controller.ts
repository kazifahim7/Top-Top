import type { Request, Response } from "express";
import catchAsync from "../../utils/catcgAsync.js";
import { lobbyService } from "./lobby.services.js";

const createMatch = catchAsync(async (req: Request, res: Response) => {
     const data = req.body;
     const id = req.user?.id
     const result = await lobbyService.createMatch(data, id)
     res.status(200).json({
          success: true,
          message: "Lobby created created successfully",
          data: result
     })
})
const allMatch = catchAsync(async (req: Request, res: Response) => {
   
     const query = req.query
     const result = await lobbyService.allMatch(query)
     res.status(200).json({
          success: true,
          message: "All lobby successfully",
          data: result
     })
})




export const lobbyController={
     createMatch,
     allMatch
}