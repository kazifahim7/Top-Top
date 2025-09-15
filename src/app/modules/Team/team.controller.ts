import type { Request, Response } from "express";
import catchAsync from "../../utils/catcgAsync.js";
import { getLocalImageURL } from "../../utils/multer.js";
import { teamsService } from "./teams.service.js";

const createTeam = catchAsync(async (req: Request, res: Response) => {
     const data = req.body;
     const id = req.user?.id
     const imageFiles = (req.files as any).images || [];
     for (const file of imageFiles) {
          const url = getLocalImageURL(file.filename);
          data.image = url
     }
     const result = await teamsService.createTeam(data,id)

     res.status(200).json({
          success: true,
          message: "Teams created successfully",
          data: result
     })


})
const updateTeam = catchAsync(async (req: Request, res: Response) => {
     const data = req.body;
     const id = req.params?.id
     const imageFiles = (req.files as any).images || [];
     for (const file of imageFiles) {
          const url = getLocalImageURL(file.filename);
          data.image = url
     }
     const result = await teamsService.updateTeam(data,id!)

     res.status(200).json({
          success: true,
          message: "Teams updated successfully",
          data: result
     })


})
const allTeams = catchAsync(async (req: Request, res: Response) => {
    
     const result = await teamsService.allTeams()

     res.status(200).json({
          success: true,
          message: "All Teams landed  successfully",
          data: result
     })


})
const myTeam = catchAsync(async (req: Request, res: Response) => {
     const id = req.user.id
 
    
     const result = await teamsService.myTeam(id)

     res.status(200).json({
          success: true,
          message: "My Teams landed  successfully",
          data: result
     })


})
const assignCaptain = catchAsync(async (req: Request, res: Response) => {
     const ownerId = req.user.id
     const teamId = req.params?.teamId 
     const { captainId } = req?.body
 
    
     const result = await teamsService.assignCaptain(ownerId, teamId!, captainId)

     res.status(200).json({
          success: true,
          message: "Captain assigned successfully",
          data: result
     })


})
const removePlayer = catchAsync(async (req: Request, res: Response) => {
     const ownerId = req.user.id
     const teamId = req.params?.teamId 
     const { playerId } = req?.body
 
    
     const result = await teamsService.removePlayer(ownerId, teamId!, playerId)

     res.status(200).json({
          success: true,
          message: "player remove successfully successfully",
          data: result
     })


})


export const TeamController ={
     createTeam,
     updateTeam,
     allTeams,
     myTeam,
     assignCaptain,
     removePlayer
}