import { userModel } from "../auth/auth.model.js";
import { TeamModel } from "../Team/team.model.js";
const playerRanking = async (options) => {
    const { filterBy = "all", sortField = "rating", sortOrder = "desc", matchField, matchValue, nationality, age, position, } = options;
    const now = new Date();
    let startDate;
    // 📅 date filter
    if (filterBy === "weekly") {
        startDate = new Date();
        startDate.setDate(now.getDate() - 7);
    }
    else if (filterBy === "monthly") {
        startDate = new Date();
        startDate.setMonth(now.getMonth() - 1);
    }
    // 🎯 min match rule
    const minMatches = filterBy === "weekly" ? 2 : filterBy === "monthly" ? 4 : 15;
    // 🔍 base match stage
    const matchStage = {
        role: "player",
        isBlocked: "active",
        match: { $gte: minMatches },
    };
    // ⏱ time filter
    if (startDate) {
        matchStage.updatedAt = { $gte: startDate, $lte: now };
    }
    // 📊 stats filter (goal / rating / assist)
    if (matchField && matchValue) {
        matchStage[matchField] = matchValue;
    }
    // 🌍 nationality filter
    if (nationality) {
        matchStage.nationality = nationality;
    }
    // 🎂 age filter
    if (age) {
        matchStage.age = age.toString();
    }
    // 🧍 position filter (array field)
    if (position) {
        matchStage.position = { $in: [position] };
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