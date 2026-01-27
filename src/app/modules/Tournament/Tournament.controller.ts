import catchAsync from "../../utils/catcgAsync.js";
import { getLocalImageURL, uploadToS3 } from "../../utils/multer.js";
import { TournamentModel } from "./Tournament.model.js";
import { TournamentService } from "./Tournament.service.js";

const createTournament = catchAsync(async (req, res) => {
     const data = req.body

     const imageFiles = (req.files as any).images || [];
     for (const file of imageFiles) {
          // const url = getLocalImageURL(file.filename);
          const url = await uploadToS3(file);
          data.imageUrl = url
     }
     const result = await TournamentService.createTournament(data)
     res.status(200).json({
          success: true,
          message: "Tournament created successfully",
          data: result
     })
})
const singleTournament = catchAsync(async (req, res) => {
     const result = await TournamentService.singleTournament(req.params.id!)
     res.status(200).json({
          success: true,
          message: "Tournament retrieved successfully",
          data: result
     })
})
const allTournament = catchAsync(async (req, res) => {
     const result = await TournamentService.allTournament()
     res.status(200).json({
          success: true,
          message: "Tournament retrieved successfully",
          data: result
     })
})
const organizerTournament = catchAsync(async (req, res) => {
     const id =req.user.id
     const result = await TournamentService.organizerTournament(id)
     res.status(200).json({
          success: true,
          message: "Tournament retrieved successfully",
          data: result
     })
})

const updateTournament = catchAsync(async (req, res) => {

     const data = req.body

     const imageFiles = (req.files as any).images || [];
     for (const file of imageFiles) {
          // const url = getLocalImageURL(file.filename);
          const url = await uploadToS3(file);
          data.imageUrl = url
     }
     const result = await TournamentService.updateTournament(req.params.id!, data)
     res.status(200).json({
          success: true,
          message: "Tournament updated successfully",
          data: result
     })
})
const deleteTournament = catchAsync(async (req, res) => {
     const result = await TournamentService.deleteTournament(req.params.id!)
     res.status(200).json({
          success: true,
          message: "Tournament deleted successfully",
          data: {}
     })
})
const qualifyTeamsController = catchAsync(async (req, res) => {

     const { tournamentId } = req.params;
     const { teamIds } = req.body;

     if (!teamIds || !Array.isArray(teamIds)) {
          return res.status(400).json({ message: "teamIds must be an array" });
     }


     const result = await TournamentService.qualifyTeamsService(tournamentId!, teamIds)
     res.status(200).json({
          success: true,
          message: "Tournament deleted successfully",
          data: {}
     })
})
const getTopPlayers = catchAsync(async (req, res) => {

     const { tournamentId } = req.params;
     const result = await TournamentService.getTopPlayers(tournamentId!)
     res.status(200).json({
          success: true,
          message: "Tournament Top player coming successfully",
          data: {}
     })
})








export const TournamentController = {
     createTournament,
     singleTournament,
     updateTournament,
     deleteTournament,
     allTournament,
     qualifyTeamsController,
     getTopPlayers,
     organizerTournament
}



