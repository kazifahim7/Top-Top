import catchAsync from "../../utils/catcgAsync.js";
import { uploadToS3 } from "../../utils/multer.js";
import { TournamentService } from "./Tournament.service.js";

const createTournament = catchAsync(async (req, res) => {
     const data = req.body;
     const imageFiles = (req.files as any).images || [];
     for (const file of imageFiles) {
          const url = await uploadToS3(file);
          data.imageUrl = url;
     }
     const result = await TournamentService.createTournament(data);
     res.status(200).json({ success: true, message: "Tournament created successfully", data: result });
});

const singleTournament = catchAsync(async (req, res) => {
     const result = await TournamentService.singleTournament(req.params.id!);
     res.status(200).json({ success: true, message: "Tournament retrieved successfully", data: result });
});

const allTournament = catchAsync(async (req, res) => {
     const result = await TournamentService.allTournament();
     res.status(200).json({ success: true, message: "Tournament retrieved successfully", data: result });
});

const countryTournament = catchAsync(async (req, res) => {
     const result = await TournamentService.countryTournament(req.params.countryCode!);
     res.status(200).json({ success: true, message: "Country tournaments retrieved successfully", data: result });
});

const myCountryTournament = catchAsync(async (req, res) => {
     const result = await TournamentService.myCountryTournament(req.user.id);
     res.status(200).json({ success: true, message: "My country tournaments retrieved successfully", data: result });
});

const myCountrySingleTournament = catchAsync(async (req, res) => {
     const result = await TournamentService.myCountrySingleTournament(req.user.id, req.params.id!);
     res.status(200).json({ success: true, message: "My country tournament retrieved successfully", data: result });
});

const organizerTournament = catchAsync(async (req, res) => {
     const result = await TournamentService.organizerTournament(req.user.id);
     res.status(200).json({ success: true, message: "Tournament retrieved successfully", data: result });
});

const updateTournament = catchAsync(async (req, res) => {
     const data = req.body;
     const imageFiles = (req.files as any).images || [];
     for (const file of imageFiles) {
          const url = await uploadToS3(file);
          data.imageUrl = url;
     }

     // F-05 FIX: callerId ও callerRole service-এ পাঠানো হচ্ছে ownership check-এর জন্য
     const result = await TournamentService.updateTournament(
          req.params.id!,
          data,
          req.user.id,
          req.user.role
     );
     res.status(200).json({ success: true, message: "Tournament updated successfully", data: result });
});

const deleteTournament = catchAsync(async (req, res) => {
     // F-05 FIX: callerId ও callerRole service-এ পাঠানো হচ্ছে ownership check-এর জন্য
     await TournamentService.deleteTournament(
          req.params.id!,
          req.user.id,
          req.user.role
     );
     res.status(200).json({ success: true, message: "Tournament deleted successfully", data: {} });
});

const qualifyTeamsController = catchAsync(async (req, res) => {
     const { tournamentId } = req.params;
     const { teamIds } = req.body;

     if (!teamIds || !Array.isArray(teamIds)) {
          return res.status(400).json({ message: "teamIds must be an array" });
     }

     // F-05 FIX: callerId ও callerRole service-এ পাঠানো হচ্ছে ownership check-এর জন্য
     await TournamentService.qualifyTeamsService(
          tournamentId!,
          teamIds,
          req.user.id,
          req.user.role
     );
     res.status(200).json({ success: true, message: "Teams qualified successfully", data: {} });
});

const getTopPlayers = catchAsync(async (req, res) => {
     const result = await TournamentService.getTopPlayers(req.params.tournamentId!);
     res.status(200).json({ success: true, message: "Tournament top players retrieved successfully", data: result });
});

export const TournamentController = {
     createTournament,
     singleTournament,
     updateTournament,
     deleteTournament,
     allTournament,
     qualifyTeamsController,
     getTopPlayers,
     organizerTournament,
     countryTournament,
     myCountryTournament,
     myCountrySingleTournament,
};
