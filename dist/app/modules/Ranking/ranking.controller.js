import catchAsync from "../../utils/catcgAsync.js";
import { playerRankingService } from "./ranking.services.js";
const playerRanking = catchAsync(async (req, res) => {
    const result = await playerRankingService.playerRanking(req.body);
    res.status(200).json({
        success: true,
        message: "Player Ranking retrieved successfully ",
        data: result
    });
});
const teamRanking = catchAsync(async (req, res) => {
    const result = await playerRankingService.teamRanking(req.body);
    res.status(200).json({
        success: true,
        message: "Team Ranking retrieved successfully ",
        data: result
    });
});
export const playerRankingController = {
    playerRanking,
    teamRanking
};
//# sourceMappingURL=ranking.controller.js.map