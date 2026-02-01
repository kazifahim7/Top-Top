import catchAsync from "../../utils/catcgAsync.js";
import { tournamentMatchService } from "./match.service.js";
const createMatch = catchAsync(async (req, res) => {
    const result = await tournamentMatchService.createMatch(req.body);
    res.status(200).json({
        success: true,
        message: "Match created successfully",
        data: result
    });
});
const allMatch = catchAsync(async (req, res) => {
    const result = await tournamentMatchService.allMatch(req?.params?.id);
    res.status(200).json({
        success: true,
        message: "All TOurnament match are retrieved  successfully",
        data: result
    });
});
const singleMatch = catchAsync(async (req, res) => {
    const result = await tournamentMatchService.singleMatch(req.params.id);
    res.status(200).json({
        success: true,
        message: "  TOurnament match are retrieved  successfully",
        data: result
    });
});
const deleteMatch = catchAsync(async (req, res) => {
    const result = await tournamentMatchService.deleteMatch(req.params.id);
    res.status(200).json({
        success: true,
        message: " match are deleted  successfully",
        data: {}
    });
});
const updateMatch = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { scoreA, scoreB } = req.body;
    if (typeof scoreA !== "number" || typeof scoreB !== "number") {
        return res.status(400).json({ success: false, message: "Invalid scores" });
    }
    const updatedMatch = await tournamentMatchService.updateMatchAndStanding(id, scoreA, scoreB);
    res.status(200).json({
        success: true,
        message: " match are updated  successfully",
        data: updatedMatch
    });
});
const addPlayers = catchAsync(async (req, res) => {
    const { matchId } = req.params;
    const data = req.body;
    const userId = req.user._id;
    const updatedMatch = await tournamentMatchService.addPlayers(matchId, data, userId);
    res.status(200).json({
        success: true,
        message: "Player(s) & match format added successfully",
        data: updatedMatch
    });
});
const removePlayerFromMatch = catchAsync(async (req, res) => {
    const { matchId } = req.params;
    const data = req.body;
    const userId = req.user._id;
    const updatedMatch = await tournamentMatchService.removePlayerFromMatch(matchId, data, userId);
    res.status(200).json({
        success: true,
        message: "Player remove successfully",
        data: updatedMatch
    });
});
export const tournamentMatchController = {
    createMatch,
    deleteMatch,
    allMatch,
    singleMatch,
    updateMatch,
    addPlayers,
    removePlayerFromMatch
};
//# sourceMappingURL=match.controller.js.map