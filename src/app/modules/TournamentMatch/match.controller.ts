import catchAsync from "../../utils/catcgAsync.js";
import { uploadToS3 } from "../../utils/multer.js";
import { tournamentMatchService } from "./match.service.js";

const createMatch = catchAsync(async (req, res) => {
     const result = await tournamentMatchService.createMatch(req.body, req?.user?.id)
     res.status(200).json({
          success: true,
          message: "Match created successfully",
          data: result
     })
})

const allMatch = catchAsync(async (req, res) => {
     const result = await tournamentMatchService.allMatch(req?.params?.id!)
     res.status(200).json({
          success: true,
          message: "All tournament matches retrieved successfully",
          data: result
     })
})

const countryMatch = catchAsync(async (req, res) => {
     const result = await tournamentMatchService.countryMatch(req.params.countryCode!)
     res.status(200).json({
          success: true,
          message: "Country tournament matches retrieved successfully",
          data: result
     })
})

const myCountryTournamentMatches = catchAsync(async (req, res) => {
     const result = await tournamentMatchService.myCountryTournamentMatches(req.user.id, req.params.tournamentId!)
     res.status(200).json({
          success: true,
          message: "My country tournament matches retrieved successfully",
          data: result
     })
})

const singleMatch = catchAsync(async (req, res) => {
     const result = await tournamentMatchService.singleMatch(req.params.id!)
     res.status(200).json({
          success: true,
          message: "Tournament match retrieved successfully",
          data: result
     })
})

const myCountrySingleMatch = catchAsync(async (req, res) => {
     const result = await tournamentMatchService.myCountrySingleMatch(req.user.id, req.params.id!)
     res.status(200).json({
          success: true,
          message: "My country tournament match retrieved successfully",
          data: result
     })
})

const deleteMatch = catchAsync(async (req, res) => {
     await tournamentMatchService.deleteMatch(
          req.params.id!,
          req.user.id          // ← pass requester identity for ownership check
     )
     res.status(200).json({
          success: true,
          message: "Match deleted successfully",
          data: {}
     })
})

const updateMatch = catchAsync(async (req, res) => {
     const id = req.params?.id;
     const data = req.body;

     const imageFiles = (req.files as any).images || [];
     const uploadedUrls = await Promise.all(imageFiles.map((file: any) => uploadToS3(file)));

     if (uploadedUrls.length > 0) {
          if (!data.media) {
               data.media = [];
          }
          data.media.push(...uploadedUrls);
     }

     const updatedMatch = await tournamentMatchService.updateMatchAndStanding(
          id!,
          data,
          req.user.id          // ← pass requester identity for ownership check
     );

     res.status(200).json({
          success: true,
          message: "Match updated successfully",
          data: updatedMatch
     })
})

const addPlayers = catchAsync(async (req, res) => {
     const { matchId } = req.params;
     const data = req.body;
     const userId = req.user.id;

     const updatedMatch = await tournamentMatchService.addPlayers(matchId!, data, userId);
     res.status(200).json({
          success: true,
          message: "Player(s) & match format added successfully",
          data: updatedMatch
     })
})

const removePlayerFromMatch = catchAsync(async (req, res) => {
     const { matchId } = req.params;
     const data = req.body;
     const userId = req.user.id;

     const updatedMatch = await tournamentMatchService.removePlayerFromMatch(matchId!, data, userId);
     res.status(200).json({
          success: true,
          message: "Player removed successfully",
          data: updatedMatch
     })
})

const updatePlayerState = catchAsync(async (req, res) => {
     const data = req.body;
     data.matchId = req.params?.matchId;
     const result = await tournamentMatchService.updatePlayerStats(data);
     res.status(200).json({
          success: true,
          message: "Updated successfully",
          data: result
     })
})

export const tournamentMatchController = {
     createMatch,
     deleteMatch,
     allMatch,
     countryMatch,
     myCountryTournamentMatches,
     singleMatch,
     myCountrySingleMatch,
     updateMatch,
     updatePlayerState,
     addPlayers,
     removePlayerFromMatch
}
