import { userModel } from "../auth/auth.model.js";
import { TeamModel } from "../Team/team.model.js";
const playerRanking = async (options) => {
    const { filterBy = "all", sortField = "rating", sortOrder = "desc" } = options;
    const now = new Date();
    let startDate;
    // Date filter only for weekly & monthly
    if (filterBy === "weekly") {
        startDate = new Date();
        startDate.setDate(now.getDate() - 7); // last 7 days
    }
    else if (filterBy === "monthly") {
        startDate = new Date();
        startDate.setMonth(now.getMonth() - 1); // last 1 month
    }
    // Minimum match threshold
    const minMatches = filterBy === "weekly" ? 2 : filterBy === "monthly" ? 4 : 15;
    // Match stage
    const matchStage = {};
    // All-time ranking → only match count
    if (filterBy === "all") {
        matchStage.match = { $gte: minMatches };
    }
    else {
        // Weekly / Monthly → match count AND updatedAt filter
        matchStage.match = { $gte: minMatches };
        if (startDate) {
            matchStage.updatedAt = { $gte: startDate, $lte: now };
        }
    }
    const sortDirection = sortOrder === "asc" ? 1 : -1;
    const result = await userModel.aggregate([
        { $match: matchStage },
        { $sort: { [sortField]: sortDirection } },
    ]);
    return result;
};
const teamRanking = async (options) => {
    const { filterBy = "all", sortField = "win", sortOrder = "desc", matchField, matchValue } = options;
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
        matchStage.updatedAt = { $gte: startDate, $lte: now };
    }
    if (matchField && matchValue !== undefined) {
        matchStage[matchField] = matchValue;
    }
    // ✅ Filter: win must be at least 1
    matchStage.win = { $gte: 1 };
    const sortDirection = sortOrder === "asc" ? 1 : -1;
    const result = await TeamModel.aggregate([
        {
            $match: matchStage
        },
        {
            $lookup: {
                from: "players",
                localField: "players",
                foreignField: "_id",
                as: "playersData"
            }
        },
        {
            $addFields: {
                avgRating: { $avg: "$playersData.rating" },
                winPercentage: {
                    $cond: [
                        { $eq: ["$totalMatch", 0] },
                        0,
                        { $multiply: [{ $divide: ["$win", "$totalMatch"] }, 100] }
                    ]
                },
                goalDifference: { $subtract: ["$goal", "$carryGoal"] }
            }
        },
        {
            $sort: {
                win: sortDirection,
                winPercentage: sortDirection,
                goalDifference: sortDirection,
                goal: sortDirection,
                [sortField]: sortDirection
            }
        },
        {
            $group: {
                _id: null,
                teams: { $push: "$$ROOT" }
            }
        },
        {
            $unwind: {
                path: "$teams",
                includeArrayIndex: "ranking"
            }
        },
        {
            $replaceRoot: {
                newRoot: {
                    $mergeObjects: [
                        "$teams",
                        { ranking: { $add: ["$ranking", 1] } }
                    ]
                }
            }
        },
        {
            $project: {
                _id: 1,
                teamName: 1,
                userName: 1,
                image: 1,
                totalMatch: 1,
                win: 1,
                draw: 1,
                loss: 1,
                goal: 1,
                carryGoal: 1,
                winPercentage: 1,
                goalDifference: 1,
                avgRating: 1,
                ranking: 1,
                players: 1,
                teamOwner: 1,
                teamCaptain: 1,
                createdAt: 1,
                updatedAt: 1
            }
        }
    ]);
    return result;
};
export const playerRankingService = {
    playerRanking,
    teamRanking
};
//# sourceMappingURL=ranking.services.js.map