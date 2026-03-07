import mongoose, { Types } from "mongoose";
import { LobbyModel } from "./lobby.model.js";
import QueryBuilder from "../../builder/QueryBuilder.js";
import { userModel } from "../auth/auth.model.js";
import AppError from "../../Error/AppError.js";
import { TeamModel } from "../Team/team.model.js";
import { PaymentModel } from "../Payment/payment.model.js";
import { TournamentModel } from "../Tournament/Tournament.model.js";
import { getPlayerOverallRating } from "../../utils/getRating.js";
//lobby match
const createMatch = async (payload, id, role) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const lobbyCount = await LobbyModel.countDocuments({
        organizer: id,
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    });
    if (lobbyCount >= 16 && role === "organizer") {
        throw new AppError(403, "You have reached your monthly lobby limit (16). Please contact admin for payment.");
    }
    let finalData = {};
    if (payload.matchType === "solo") {
        finalData = {
            ...payload,
            defaultTeam1: { teamName: "Team X" },
            defaultTeam2: { teamName: "Team Y" },
        };
    }
    else {
        finalData = { ...payload };
    }
    // ✅ Step 5: Create new lobby
    const result = await LobbyModel.create({
        ...finalData,
        organizer: new Types.ObjectId(id),
    });
    if (result && payload.team1?.teamId && payload.team2?.teamId) {
        const teamId1 = payload.team1?.teamId;
        const teamId2 = payload.team2?.teamId;
        const isTeams1Exist = await TeamModel.findById(teamId1);
        if (!isTeams1Exist) {
            throw new AppError(404, "not found");
        }
        const isTeams2Exist = await TeamModel.findById(teamId2);
        if (!isTeams2Exist) {
            throw new AppError(404, "not found");
        }
    }
    return result;
};
const allMatch = async (query) => {
    const search = query.searchTerms || "";
    const lobbies = await LobbyModel.aggregate([
        {
            $match: {
                lobbyStatus: { $ne: "inactive" }
            }
        },
        {
            $lookup: {
                from: "teams",
                localField: "team1.teamId",
                foreignField: "_id",
                as: "team1Data"
            }
        },
        { $unwind: { path: "$team1Data", preserveNullAndEmptyArrays: true } },
        // Team 2 Data lookup (যদি থাকে)
        {
            $lookup: {
                from: "teams",
                localField: "team2.teamId",
                foreignField: "_id",
                as: "team2Data"
            }
        },
        { $unwind: { path: "$team2Data", preserveNullAndEmptyArrays: true } },
        // Team 1 এর সব প্লেয়ার (team1Data.players থেকে)
        {
            $lookup: {
                from: "players",
                localField: "team1Data.players",
                foreignField: "_id",
                as: "team1AllPlayers"
            }
        },
        // Team 2 এর সব প্লেয়ার (team2Data.players থেকে)
        {
            $lookup: {
                from: "players",
                localField: "team2Data.players",
                foreignField: "_id",
                as: "team2AllPlayers"
            }
        },
        // Organizer Data
        {
            $lookup: {
                from: "players",
                localField: "organizer",
                foreignField: "_id",
                as: "organizerData"
            }
        },
        { $unwind: { path: "$organizerData", preserveNullAndEmptyArrays: true } },
        // Solo match এর জন্য Default Team 1 এর জয়েন করা প্লেয়ার
        {
            $lookup: {
                from: "players",
                let: {
                    playerIds: {
                        $ifNull: [
                            {
                                $map: {
                                    input: { $ifNull: ["$defaultTeam1.players", []] },
                                    as: "player",
                                    in: { $toObjectId: "$$player.playerId" }
                                }
                            },
                            []
                        ]
                    }
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $in: ["$_id", "$$playerIds"]
                            }
                        }
                    }
                ],
                as: "joinedDefaultTeam1Players"
            }
        },
        // Solo match এর জন্য Default Team 2 এর জয়েন করা প্লেয়ার
        {
            $lookup: {
                from: "players",
                let: {
                    playerIds: {
                        $ifNull: [
                            {
                                $map: {
                                    input: { $ifNull: ["$defaultTeam2.players", []] },
                                    as: "player",
                                    in: { $toObjectId: "$$player.playerId" }
                                }
                            },
                            []
                        ]
                    }
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $in: ["$_id", "$$playerIds"]
                            }
                        }
                    }
                ],
                as: "joinedDefaultTeam2Players"
            }
        },
        // Team match এর জন্য Team 1 এর জয়েন করা প্লেয়ার
        {
            $lookup: {
                from: "players",
                let: {
                    playerIds: {
                        $ifNull: [
                            {
                                $map: {
                                    input: { $ifNull: ["$team1.players", []] },
                                    as: "player",
                                    in: { $toObjectId: "$$player.playerId" }
                                }
                            },
                            []
                        ]
                    }
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $in: ["$_id", "$$playerIds"]
                            }
                        }
                    }
                ],
                as: "joinedTeam1Players"
            }
        },
        // Team match এর জন্য Team 2 এর জয়েন করা প্লেয়ার
        {
            $lookup: {
                from: "players",
                let: {
                    playerIds: {
                        $ifNull: [
                            {
                                $map: {
                                    input: { $ifNull: ["$team2.players", []] },
                                    as: "player",
                                    in: { $toObjectId: "$$player.playerId" }
                                }
                            },
                            []
                        ]
                    }
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $in: ["$_id", "$$playerIds"]
                            }
                        }
                    }
                ],
                as: "joinedTeam2Players"
            }
        },
        {
            $match: {
                $or: [
                    { title: { $regex: search, $options: "i" } },
                    // Team match এর জন্য
                    { "team1Data.teamName": { $regex: search, $options: "i" } },
                    { "team2Data.teamName": { $regex: search, $options: "i" } },
                    // Solo match এর জন্য
                    { "defaultTeam1.teamName": { $regex: search, $options: "i" } },
                    { "defaultTeam2.teamName": { $regex: search, $options: "i" } },
                    // Team 1 এর সব প্লেয়ারদের নাম
                    { "team1AllPlayers.FullName": { $regex: search, $options: "i" } },
                    { "team2AllPlayers.FullName": { $regex: search, $options: "i" } },
                    // Team match জয়েন করা প্লেয়ার
                    { "joinedTeam1Players.FullName": { $regex: search, $options: "i" } },
                    { "joinedTeam2Players.FullName": { $regex: search, $options: "i" } },
                    // Solo match জয়েন করা প্লেয়ার
                    { "joinedDefaultTeam1Players.FullName": { $regex: search, $options: "i" } },
                    { "joinedDefaultTeam2Players.FullName": { $regex: search, $options: "i" } }
                ]
            }
        },
        {
            $sort: { createdAt: -1 }
        }
    ]);
    return lobbies;
};
const organizerMatch = async (query, orgId) => {
    const search = query.searchTerms || "";
    const lobbies = await LobbyModel.aggregate([
        {
            $match: {
                lobbyStatus: "ongoing"
            }
        },
        {
            $match: {
                organizer: new Types.ObjectId(orgId)
            }
        },
        {
            $lookup: {
                from: "teams",
                localField: "team1.teamId",
                foreignField: "_id",
                as: "team1Data"
            }
        },
        { $unwind: { path: "$team1Data", preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: "teams",
                localField: "team2.teamId",
                foreignField: "_id",
                as: "team2Data"
            }
        },
        { $unwind: { path: "$team2Data", preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: "players",
                localField: "team1Data.players",
                foreignField: "_id",
                as: "team1Players"
            }
        },
        {
            $lookup: {
                from: "players",
                localField: "team2Data.players",
                foreignField: "_id",
                as: "team2Players"
            }
        },
        {
            $lookup: {
                from: "players",
                localField: "organizer",
                foreignField: "_id",
                as: "organizerData"
            }
        },
        { $unwind: { path: "$organizerData", preserveNullAndEmptyArrays: true } },
        // FIXED: Add $ifNull to handle undefined playerIds
        {
            $lookup: {
                from: "players",
                let: {
                    playerIds: {
                        $ifNull: ["$defaultTeam1.players.playerId", []]
                    }
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $in: ["$_id", "$$playerIds"]
                            }
                        }
                    }
                ],
                as: "defaultTeam1Players"
            }
        },
        // FIXED: Add $ifNull to handle undefined playerIds
        {
            $lookup: {
                from: "players",
                let: {
                    playerIds: {
                        $ifNull: ["$defaultTeam2.players.playerId", []]
                    }
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $in: ["$_id", "$$playerIds"]
                            }
                        }
                    }
                ],
                as: "defaultTeam2Players"
            }
        },
        {
            $match: {
                $or: [
                    { title: { $regex: search, $options: "i" } },
                    { "team1Data.teamName": { $regex: search, $options: "i" } },
                    { "team2Data.teamName": { $regex: search, $options: "i" } },
                    { "team1Players.name": { $regex: search, $options: "i" } },
                    { "team2Players.name": { $regex: search, $options: "i" } },
                ]
            }
        }
    ]);
    return lobbies;
};
const singlelobby = async (lobbyId) => {
    const lobbies = await LobbyModel.aggregate([
        /* ================= MATCH LOBBY ================= */
        {
            $match: {
                _id: new Types.ObjectId(lobbyId),
            },
        },
        /* ================= TEAM 1 JOINED PLAYERS WITH MATCH STATS ================= */
        {
            $lookup: {
                from: "players",
                let: {
                    team1Players: { $ifNull: ["$team1.players", []] },
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $in: [
                                    "$_id",
                                    {
                                        $map: {
                                            input: "$$team1Players",
                                            as: "p",
                                            in: "$$p.playerId",
                                        },
                                    },
                                ],
                            },
                        },
                    },
                    {
                        $project: {
                            password: 0,
                        },
                    },
                    {
                        $addFields: {
                            matchStats: {
                                $arrayElemAt: [
                                    {
                                        $filter: {
                                            input: "$$team1Players",
                                            as: "mp",
                                            cond: {
                                                $eq: ["$$mp.playerId", "$_id"],
                                            },
                                        },
                                    },
                                    0,
                                ],
                            },
                        },
                    },
                    {
                        $addFields: {
                            redCard: "$matchStats.redCard",
                            yellowCard: "$matchStats.yellowCard",
                            contribution: "$matchStats.contribution",
                            assists: "$matchStats.assists",
                            goal: "$matchStats.goal",
                            tackle: "$matchStats.tackle",
                            save: "$matchStats.save",
                            goodMoment: "$matchStats.goodMoment",
                            veryGoodMoment: "$matchStats.veryGoodMoment",
                            rating: "$matchStats.rating",
                            matchPosition: "$matchStats.matchPosition",
                            guest_player: "$matchStats.guest_player",
                        },
                    },
                    {
                        $project: {
                            matchStats: 0,
                        },
                    },
                ],
                as: "team1JoinedPlayers",
            },
        },
        /* ================= TEAM 2 JOINED PLAYERS WITH MATCH STATS ================= */
        {
            $lookup: {
                from: "players",
                let: {
                    team2Players: { $ifNull: ["$team2.players", []] },
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $in: [
                                    "$_id",
                                    {
                                        $map: {
                                            input: "$$team2Players",
                                            as: "p",
                                            in: "$$p.playerId",
                                        },
                                    },
                                ],
                            },
                        },
                    },
                    {
                        $project: {
                            password: 0,
                        },
                    },
                    {
                        $addFields: {
                            matchStats: {
                                $arrayElemAt: [
                                    {
                                        $filter: {
                                            input: "$$team2Players",
                                            as: "mp",
                                            cond: {
                                                $eq: ["$$mp.playerId", "$_id"],
                                            },
                                        },
                                    },
                                    0,
                                ],
                            },
                        },
                    },
                    {
                        $addFields: {
                            redCard: "$matchStats.redCard",
                            yellowCard: "$matchStats.yellowCard",
                            contribution: "$matchStats.contribution",
                            assists: "$matchStats.assists",
                            goal: "$matchStats.goal",
                            tackle: "$matchStats.tackle",
                            save: "$matchStats.save",
                            goodMoment: "$matchStats.goodMoment",
                            veryGoodMoment: "$matchStats.veryGoodMoment",
                            rating: "$matchStats.rating",
                            matchPosition: "$matchStats.matchPosition",
                            guest_player: "$matchStats.guest_player",
                        },
                    },
                    {
                        $project: {
                            matchStats: 0,
                        },
                    },
                ],
                as: "team2JoinedPlayers",
            },
        },
        /* ================= TEAM 1 DATA ================= */
        {
            $lookup: {
                from: "teams",
                localField: "team1.teamId",
                foreignField: "_id",
                as: "team1Data",
            },
        },
        {
            $unwind: {
                path: "$team1Data",
                preserveNullAndEmptyArrays: true,
            },
        },
        /* ================= TEAM 2 DATA ================= */
        {
            $lookup: {
                from: "teams",
                localField: "team2.teamId",
                foreignField: "_id",
                as: "team2Data",
            },
        },
        {
            $unwind: {
                path: "$team2Data",
                preserveNullAndEmptyArrays: true,
            },
        },
        /* ================= ORGANIZER ================= */
        {
            $lookup: {
                from: "players",
                localField: "organizer",
                foreignField: "_id",
                as: "organizerData",
            },
        },
        {
            $unwind: {
                path: "$organizerData",
                preserveNullAndEmptyArrays: true,
            },
        },
        /* ================= DEFAULT TEAM 1 PLAYERS WITH MATCH STATS ================= */
        {
            $lookup: {
                from: "players",
                let: {
                    defaultTeam1Players: { $ifNull: ["$defaultTeam1.players", []] },
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $in: [
                                    "$_id",
                                    {
                                        $map: {
                                            input: "$$defaultTeam1Players",
                                            as: "p",
                                            in: "$$p.playerId",
                                        },
                                    },
                                ],
                            },
                        },
                    },
                    {
                        $project: {
                            password: 0,
                        },
                    },
                    {
                        $addFields: {
                            matchStats: {
                                $arrayElemAt: [
                                    {
                                        $filter: {
                                            input: "$$defaultTeam1Players",
                                            as: "mp",
                                            cond: {
                                                $eq: ["$$mp.playerId", "$_id"],
                                            },
                                        },
                                    },
                                    0,
                                ],
                            },
                        },
                    },
                    {
                        $addFields: {
                            redCard: "$matchStats.redCard",
                            yellowCard: "$matchStats.yellowCard",
                            contribution: "$matchStats.contribution",
                            assists: "$matchStats.assists",
                            goal: "$matchStats.goal",
                            tackle: "$matchStats.tackle",
                            save: "$matchStats.save",
                            goodMoment: "$matchStats.goodMoment",
                            veryGoodMoment: "$matchStats.veryGoodMoment",
                            rating: "$matchStats.rating",
                            matchPosition: "$matchStats.matchPosition",
                            guest_player: "$matchStats.guest_player",
                        },
                    },
                    {
                        $project: {
                            matchStats: 0,
                        },
                    },
                ],
                as: "defaultTeam1Players",
            },
        },
        /* ================= DEFAULT TEAM 2 PLAYERS WITH MATCH STATS ================= */
        {
            $lookup: {
                from: "players",
                let: {
                    defaultTeam2Players: { $ifNull: ["$defaultTeam2.players", []] },
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $in: [
                                    "$_id",
                                    {
                                        $map: {
                                            input: "$$defaultTeam2Players",
                                            as: "p",
                                            in: "$$p.playerId",
                                        },
                                    },
                                ],
                            },
                        },
                    },
                    {
                        $project: {
                            password: 0,
                        },
                    },
                    {
                        $addFields: {
                            matchStats: {
                                $arrayElemAt: [
                                    {
                                        $filter: {
                                            input: "$$defaultTeam2Players",
                                            as: "mp",
                                            cond: {
                                                $eq: ["$$mp.playerId", "$_id"],
                                            },
                                        },
                                    },
                                    0,
                                ],
                            },
                        },
                    },
                    {
                        $addFields: {
                            redCard: "$matchStats.redCard",
                            yellowCard: "$matchStats.yellowCard",
                            contribution: "$matchStats.contribution",
                            assists: "$matchStats.assists",
                            goal: "$matchStats.goal",
                            tackle: "$matchStats.tackle",
                            save: "$matchStats.save",
                            goodMoment: "$matchStats.goodMoment",
                            veryGoodMoment: "$matchStats.veryGoodMoment",
                            rating: "$matchStats.rating",
                            matchPosition: "$matchStats.matchPosition",
                            guest_player: "$matchStats.guest_player",
                        },
                    },
                    {
                        $project: {
                            matchStats: 0,
                        },
                    },
                ],
                as: "defaultTeam2Players",
            },
        },
        /* ================= TEAM 1 PLAYERS FROM TEAM DATA ================= */
        {
            $lookup: {
                from: "players",
                let: {
                    playerIds: { $ifNull: ["$team1Data.players", []] },
                },
                pipeline: [
                    {
                        $match: {
                            $expr: { $in: ["$_id", "$$playerIds"] },
                        },
                    },
                    {
                        $project: {
                            password: 0,
                        },
                    },
                ],
                as: "team1Players",
            },
        },
        /* ================= TEAM 2 PLAYERS FROM TEAM DATA ================= */
        {
            $lookup: {
                from: "players",
                let: {
                    playerIds: { $ifNull: ["$team2Data.players", []] },
                },
                pipeline: [
                    {
                        $match: {
                            $expr: { $in: ["$_id", "$$playerIds"] },
                        },
                    },
                    {
                        $project: {
                            password: 0,
                        },
                    },
                ],
                as: "team2Players",
            },
        },
        /* ================= AVG MATCH RATING AFTER ================= */
        {
            $addFields: {
                team1AvgMatchRatingAfter: {
                    $cond: {
                        if: { $eq: ["$matchType", "solo"] },
                        then: {
                            $cond: {
                                if: { $gt: [{ $size: { $ifNull: ["$defaultTeam1.players", []] } }, 0] },
                                then: {
                                    $avg: "$defaultTeam1.players.rating"
                                },
                                else: 0,
                            },
                        },
                        else: {
                            $cond: {
                                if: { $gt: [{ $size: { $ifNull: ["$team1.players", []] } }, 0] },
                                then: {
                                    $avg: "$team1.players.rating"
                                },
                                else: 0,
                            },
                        },
                    },
                },
                team2AvgMatchRatingAfter: {
                    $cond: {
                        if: { $eq: ["$matchType", "solo"] },
                        then: {
                            $cond: {
                                if: { $gt: [{ $size: { $ifNull: ["$defaultTeam2.players", []] } }, 0] },
                                then: {
                                    $avg: "$defaultTeam2.players.rating"
                                },
                                else: 0,
                            },
                        },
                        else: {
                            $cond: {
                                if: { $gt: [{ $size: { $ifNull: ["$team2.players", []] } }, 0] },
                                then: {
                                    $avg: "$team2.players.rating"
                                },
                                else: 0,
                            },
                        },
                    },
                },
            },
        },
    ]);
    return lobbies[0] || null;
};
export const updatePlayerStats = async (data) => {
    const lobby = await LobbyModel.findById(data.lobbyId);
    if (!lobby)
        throw new Error("Lobby not found");
    let player = null;
    let teamKey = null;
    const teams = [
        "team1",
        "team2",
        "defaultTeam1",
        "defaultTeam2",
    ];
    for (const key of teams) {
        const team = lobby[key];
        if (team?.players?.length) {
            player = team.players.find(p => p.playerId.toString() === data.playerId);
            if (player) {
                teamKey = key;
                break;
            }
        }
    }
    if (!player || !teamKey)
        throw new Error("Player not found in any team");
    // ✅ rawRating থেকে calculate করো, rating থেকে না
    let rawRating = player.rawRating ?? player.rating ?? 6.5;
    rawRating -= (data.redCard || 0) * 0.5;
    rawRating -= (data.yellowCard || 0) * 0.25;
    rawRating += (data.goal || 0) * 0.5;
    rawRating += (data.assists || 0) * 0.5;
    rawRating += (data.contribution || 0) * 0.25;
    rawRating += (data.save || 0) * 0.25;
    rawRating += (data.veryGoodMoment || 0) * 0.5;
    rawRating += (data.goodMoment || 0) * 0.5;
    // ✅ rawRating সংরক্ষণ করো (unclamped), rating clamp করো
    player.rawRating = parseFloat(rawRating.toFixed(2));
    player.rating = parseFloat(Math.max(0, Math.min(10, rawRating)).toFixed(2));
    ["redCard", "yellowCard", "goal", "assists", "contribution", "save", "veryGoodMoment", "goodMoment"].forEach(field => {
        if (data[field] !== undefined) {
            player[field] += data[field];
        }
    });
    if (data.goal !== undefined && data.goal !== 0) {
        if (teamKey === "team1" || teamKey === "defaultTeam1") {
            lobby.goalTeam1 += data.goal;
        }
        else if (teamKey === "team2" || teamKey === "defaultTeam2") {
            lobby.goalTeam2 += data.goal;
        }
    }
    await lobby.save();
    const { averageRating, matchCount } = await getPlayerOverallRating(data.playerId);
    await userModel.findByIdAndUpdate(data.playerId, {
        $inc: {
            redCard: data.redCard || 0,
            yellowCard: data.yellowCard || 0,
            goal: data.goal || 0,
            assists: data.assists || 0,
            contribution: data.contribution || 0,
            save: data.save || 0,
        },
        match: matchCount,
        rating: parseFloat(averageRating.toFixed(2)),
    }, { new: true });
    return { lobbyPlayer: player };
};
const updateLobbyInfo = async (id, payload) => {
    const isLobbyExist = await LobbyModel.findById(id)
        .populate('team1.teamId')
        .populate('team2.teamId');
    if (!isLobbyExist) {
        throw new AppError(404, "This lobby Not Found");
    }
    if (payload.lobbyStatus === "completed") {
        const goalTeam1 = isLobbyExist.goalTeam1 || 0;
        const goalTeam2 = isLobbyExist.goalTeam2 || 0;
        // ==================== TEAMS MATCH ====================
        if (isLobbyExist.matchType === "teams") {
            if (isLobbyExist.team1?.teamId) {
                const team1Update = {
                    $inc: { totalMatch: 1, goal: goalTeam1, carryGoal: goalTeam2 },
                };
                const result = getMatchResult(goalTeam1, goalTeam2);
                team1Update.$inc[result] = 1;
                const team1Id = isLobbyExist.team1.teamId._id || isLobbyExist.team1.teamId;
                await TeamModel.findByIdAndUpdate(team1Id, team1Update, { new: true });
            }
            if (isLobbyExist.team2?.teamId) {
                const team2Update = {
                    $inc: { totalMatch: 1, goal: goalTeam2, carryGoal: goalTeam1 },
                };
                const result = getMatchResult(goalTeam2, goalTeam1);
                team2Update.$inc[result] = 1;
                const team2Id = isLobbyExist.team2.teamId._id || isLobbyExist.team2.teamId;
                await TeamModel.findByIdAndUpdate(team2Id, team2Update, { new: true });
            }
            // ✅ Clean Sheet — team1 players (opponent goalTeam2 === 0)
            if (goalTeam2 === 0) {
                const team1PlayerIds = (isLobbyExist.team1?.players || [])
                    .map((p) => p.playerId)
                    .filter(Boolean);
                if (team1PlayerIds.length > 0) {
                    await userModel.updateMany({ _id: { $in: team1PlayerIds } }, { $inc: { cleanSheet: 1 } });
                }
            }
            // ✅ Clean Sheet — team2 players (opponent goalTeam1 === 0)
            if (goalTeam1 === 0) {
                const team2PlayerIds = (isLobbyExist.team2?.players || [])
                    .map((p) => p.playerId)
                    .filter(Boolean);
                if (team2PlayerIds.length > 0) {
                    await userModel.updateMany({ _id: { $in: team2PlayerIds } }, { $inc: { cleanSheet: 1 } });
                }
            }
        }
        // ==================== SOLO MATCH ====================
        if (isLobbyExist.matchType === "solo") {
            // ✅ Clean Sheet — defaultTeam1 players (opponent goalTeam2 === 0)
            if (goalTeam2 === 0) {
                const defaultTeam1PlayerIds = (isLobbyExist.defaultTeam1?.players || [])
                    .map((p) => p.playerId)
                    .filter(Boolean);
                if (defaultTeam1PlayerIds.length > 0) {
                    await userModel.updateMany({ _id: { $in: defaultTeam1PlayerIds } }, { $inc: { cleanSheet: 1 } });
                }
            }
            // ✅ Clean Sheet — defaultTeam2 players (opponent goalTeam1 === 0)
            if (goalTeam1 === 0) {
                const defaultTeam2PlayerIds = (isLobbyExist.defaultTeam2?.players || [])
                    .map((p) => p.playerId)
                    .filter(Boolean);
                if (defaultTeam2PlayerIds.length > 0) {
                    await userModel.updateMany({ _id: { $in: defaultTeam2PlayerIds } }, { $inc: { cleanSheet: 1 } });
                }
            }
        }
    }
    // ✅ MOTM — payload এ motm আসলে player profile এ increment
    if (payload.motm) {
        await userModel.findByIdAndUpdate(payload.motm, { $inc: { motm: 1 } });
    }
    const result = await LobbyModel.findByIdAndUpdate(id, payload, { new: true });
    return result;
};
function getMatchResult(teamGoals, opponentGoals) {
    if (teamGoals > opponentGoals)
        return 'win';
    if (teamGoals < opponentGoals)
        return 'loss';
    return 'draw';
}
const deleteLobby = async (id) => {
    const result = await LobbyModel.findByIdAndUpdate(id, { lobbyStatus: "inactive" }, { new: true });
    return result;
};
const myUpcomingLobby = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid player ID");
    }
    const playerObjectId = new mongoose.Types.ObjectId(id);
    const result = await LobbyModel.aggregate([
        // ─── Step 1: lobby তে player আছে কিনা সেটা দিয়েই match করো ──────────
        // team1.players.playerId বা team2.players.playerId — এগুলো lobby-র actual joined players
        {
            $match: {
                lobbyStatus: "ongoing",
                $or: [
                    { "team1.players.playerId": playerObjectId },
                    { "team2.players.playerId": playerObjectId },
                    { "defaultTeam1.players.playerId": playerObjectId },
                    { "defaultTeam2.players.playerId": playerObjectId },
                ],
            }
        },
        // ─── Team data lookup ─────────────────────────────────────────────────
        {
            $lookup: {
                from: "teams",
                localField: "team1.teamId",
                foreignField: "_id",
                as: "team1Data"
            }
        },
        { $unwind: { path: "$team1Data", preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: "teams",
                localField: "team2.teamId",
                foreignField: "_id",
                as: "team2Data"
            }
        },
        { $unwind: { path: "$team2Data", preserveNullAndEmptyArrays: true } },
        // ─── Organizer lookup ─────────────────────────────────────────────────
        {
            $lookup: {
                from: "players",
                localField: "organizer",
                foreignField: "_id",
                as: "organizerData"
            }
        },
        { $unwind: { path: "$organizerData", preserveNullAndEmptyArrays: true } },
        // ─── Lobby-র actual joined players lookup (team1.players.playerId থেকে) ──
        {
            $lookup: {
                from: "players",
                let: { playerIds: { $ifNull: ["$team1.players.playerId", []] } },
                pipeline: [
                    { $match: { $expr: { $in: ["$_id", "$$playerIds"] } } }
                ],
                as: "joinedTeam1Players"
            }
        },
        {
            $lookup: {
                from: "players",
                let: { playerIds: { $ifNull: ["$team2.players.playerId", []] } },
                pipeline: [
                    { $match: { $expr: { $in: ["$_id", "$$playerIds"] } } }
                ],
                as: "joinedTeam2Players"
            }
        },
        // ─── Default team players lookup ──────────────────────────────────────
        {
            $lookup: {
                from: "players",
                let: { playerIds: { $ifNull: ["$defaultTeam1.players.playerId", []] } },
                pipeline: [
                    { $match: { $expr: { $in: ["$_id", "$$playerIds"] } } }
                ],
                as: "joinedDefaultTeam1Players"
            }
        },
        {
            $lookup: {
                from: "players",
                let: { playerIds: { $ifNull: ["$defaultTeam2.players.playerId", []] } },
                pipeline: [
                    { $match: { $expr: { $in: ["$_id", "$$playerIds"] } } }
                ],
                as: "joinedDefaultTeam2Players"
            }
        },
        // ─── TeamModel এর all players lookup (team info এর জন্য) ──────────────
        {
            $lookup: {
                from: "players",
                localField: "team1Data.players",
                foreignField: "_id",
                as: "team1AllPlayers"
            }
        },
        {
            $lookup: {
                from: "players",
                localField: "team2Data.players",
                foreignField: "_id",
                as: "team2AllPlayers"
            }
        },
        // ─── No second $match needed — first $match already filters correctly ──
    ]);
    return result;
};
const organizerLobby = async (id) => {
    const organizerId = new Types.ObjectId(id);
    // 1️⃣ Get organizer lobbies
    const upcomingLobby = await LobbyModel.find({
        organizer: organizerId,
        lobbyStatus: "ongoing",
    }).populate("team1.teamId team2.teamId");
    const completeLobby = await LobbyModel.find({
        organizer: organizerId,
        lobbyStatus: "completed",
    });
    // 2️⃣ Collect all lobby ids
    const lobbyIds = [...upcomingLobby, ...completeLobby].map((lobby) => lobby._id);
    // 3️⃣ Calculate total earning
    const earningResult = await PaymentModel.aggregate([
        {
            $match: {
                lobbyId: { $in: lobbyIds },
                status: "success",
            },
        },
        {
            $group: {
                _id: null,
                totalEarning: { $sum: "$price" },
            },
        },
    ]);
    const hostTournaments = await TournamentModel.find({ organizer: organizerId });
    const totalEarning = earningResult.length > 0 ? earningResult[0].totalEarning : 0;
    // 4️⃣ Final response
    return {
        upcomingLobby,
        completeLobby,
        totalEarning,
        hostTournaments
    };
};
const assignLobby = async (id, data, adminId) => {
    const organizerId = new Types.ObjectId(id);
    const admin = new Types.ObjectId(adminId);
    const lobby = await LobbyModel.findById(data.lobbyId);
    if (!lobby) {
        throw new AppError(404, "Lobby not found");
    }
    if (!admin.equals(lobby.organizer)) {
        throw new AppError(403, "This lobby was created by another organizer");
    }
    const result = await LobbyModel.findByIdAndUpdate(data.lobbyId, { organizer: organizerId }, { new: true });
    return result;
};
const assigntournament = async (id, data, adminId) => {
    const organizerId = new Types.ObjectId(id);
    const admin = new Types.ObjectId(adminId);
    const lobby = await TournamentModel.findById(data.tournamentId);
    if (!lobby) {
        throw new AppError(404, "Tournament not found");
    }
    if (!admin.equals(lobby.organizer)) {
        throw new AppError(403, "This tournament was created by another organizer");
    }
    const result = await TournamentModel.findByIdAndUpdate(data.tournamentId, { organizer: organizerId }, { new: true });
    return result;
};
export const lobbyService = {
    createMatch,
    allMatch,
    updatePlayerStats,
    updateLobbyInfo,
    deleteLobby,
    singlelobby,
    myUpcomingLobby,
    organizerLobby,
    assignLobby,
    assigntournament,
    organizerMatch
};
//# sourceMappingURL=lobby.services.js.map