import { userModel } from "../auth/auth.model.js";
import { TeamModel } from "../Team/team.model.js";
const playerRanking = async (options) => {
    const { filterBy = "all", sortField = "rating", sortOrder = "desc", matchField, matchValue } = options;
    const now = new Date();
    let startDate;
    if (filterBy === "weekly") {
        startDate = new Date();
        startDate.setDate(now.getDate() - 7);
    }
    else if (filterBy === "monthly") {
        startDate = new Date();
        startDate.setMonth(now.getMonth() - 1);
    }
    const matchStage = {
        match: { $gte: 2 }
    };
    // date filter
    if (filterBy !== "all" && startDate) {
        matchStage.createdAt = { $gte: startDate, $lte: now };
    }
    if (matchField && matchValue !== undefined) {
        matchStage[matchField] = matchValue;
    }
    // sort order
    const sortDirection = sortOrder === "asc" ? 1 : -1;
    const result = await userModel.aggregate([
        { $match: matchStage },
        { $sort: { [sortField]: sortDirection } }
    ]);
    return result;
};
const teamRanking = async (options) => {
    const { filterBy = "all", sortField = "avgRating", sortOrder = "desc", matchField, matchValue } = options;
    const now = new Date();
    let startDate;
    if (filterBy === "weekly") {
        startDate = new Date();
        startDate.setDate(now.getDate() - 7);
    }
    else if (filterBy === "monthly") {
        startDate = new Date();
        startDate.setMonth(now.getMonth() - 1);
    }
    const matchStage = {};
    if (filterBy !== "all" && startDate) {
        matchStage.createdAt = { $gte: startDate, $lte: now };
    }
    if (matchField && matchValue !== undefined) {
        matchStage[matchField] = matchValue;
    }
    const sortDirection = sortOrder === "asc" ? 1 : -1;
    const result = await TeamModel.aggregate([
        {
            $lookup: {
                from: "players",
                localField: "players",
                foreignField: "_id",
                as: "playersData"
            }
        },
        {
            $match: {
                "playersData.0": { $exists: true },
                ...matchStage
            }
        },
        {
            $addFields: {
                avgRating: { $avg: "$playersData.rating" }
            }
        },
        {
            $sort: { [sortField]: sortDirection }
        }
    ]);
    return result;
};
export const playerRankingService = {
    playerRanking,
    teamRanking
};
//# sourceMappingURL=ranking.services.js.map