import type { Request, Response } from "express";
import catchAsync from "../../utils/catcgAsync.js";
import { lobbyService } from "./lobby.services.js";
import { getLocalImageURL, uploadToS3 } from "../../utils/multer.js";
import { LobbyModel } from "./lobby.model.js";
import AppError from "../../Error/AppError.js";

const createMatch = catchAsync(async (req: Request, res: Response) => {
     const data = req.body;
     const id = req.user?.id
     const role = req.user?.role
     const result = await lobbyService.createMatch(data, id, role)
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
const organizerMatch = catchAsync(async (req: Request, res: Response) => {

     const query = req.query
     const orgId=req?.user?.id
     console.log(orgId)
     const result = await lobbyService.organizerMatch(query, orgId)
     res.status(200).json({
          success: true,
          message: "All lobby successfully",
          data: result
     })
})
const singlelobby = catchAsync(async (req: Request, res: Response) => {
   
     const query = req.params?.id
     const result = await lobbyService.singlelobby(query!)
     res.status(200).json({
          success: true,
          message: "single lobby successfully",
          data: result
     })
})
const updatePlayerState = catchAsync(async (req: Request, res: Response) => {
   
     const data = req.body
     data.lobbyId = req.params?.lobbyId
     const result = await lobbyService.updatePlayerStats(data)
     res.status(200).json({
          success: true,
          message: "updated successfully",
          data: result
     })
})


const lobbyInFo = catchAsync(async (req: Request, res: Response) => {
     const id = req.params?.lobbyId;
     const requesterId = req.user?.id;
     const requesterRole = req.user?.role;

     const lobby = await LobbyModel.findById(id).select("organizer lobbyStatus");
     if (!lobby) throw new AppError(404, "Lobby not found");

     if (requesterRole === "organizer") {
          if (String(lobby.organizer) !== String(requesterId)) {
               throw new AppError(403, "You are not authorised to update this lobby");
          }
     } else if (requesterRole !== "admin") {
          throw new AppError(403, "You are not authorised to update this lobby");
     }

     const data = req.body;

     // Handle image uploads
     const imageFiles = ((req.files as any)?.images) || [];
     const uploadedUrls = await Promise.all(
          imageFiles.map((file: any) => uploadToS3(file))
     );
     if (uploadedUrls.length > 0) {
          if (!data.media) data.media = [];
          data.media.push(...uploadedUrls);
     }

     const result = await lobbyService.updateLobbyInfo(id!, data);

     res.status(200).json({
          success: true,
          message: "Lobby updated successfully",
          data: result,
     });
});
const deleteLobby = catchAsync(async (req: Request, res: Response) => {
     const id = req.params?.id;
    

     
     const result = await lobbyService.deleteLobby(id!)

     res.status(200).json({
          success: true,
          message: "lobby  delete successfully ",
          data: result
     })


})
const myUpcomingLobby = catchAsync(async (req: Request, res: Response) => {
     const id = req.user?.id;
     console.log(id)
     const result = await lobbyService.myUpcomingLobby(id!)

     res.status(200).json({
          success: true,
          message: "My upcoming lobby retrieved successfully",
          data: result
     })


})
const organizerLobby = catchAsync(async (req: Request, res: Response) => {
     const id = req.params?.id;

     const result = await lobbyService.organizerLobby(id!)

     res.status(200).json({
          success: true,
          message: "Organizer upcoming lobby retrieved successfully",
          data: result
     })


})
const assignLobby = catchAsync(async (req: Request, res: Response) => {
     const id = req.params?.id;
     const data=req.body
     const adminId=req.user.id

     const result = await lobbyService.assignLobby(id!, data, adminId)

     res.status(200).json({
          success: true,
          message: "Assign Lobby successfully",
          data: result
     })


})
const assigntournament = catchAsync(async (req: Request, res: Response) => {
     const id = req.params?.id;
     const data=req.body
     const adminId = req.user.id
     const result = await lobbyService.assigntournament(id!, data, adminId)

     res.status(200).json({
          success: true,
          message: "Assign Tournament successfully",
          data: result
     })


})




export const lobbyController={
     createMatch,
     allMatch,
     updatePlayerState,
     lobbyInFo,
     deleteLobby,
     singlelobby,
     myUpcomingLobby,
     organizerLobby,
     assignLobby,
     assigntournament,
     organizerMatch
}