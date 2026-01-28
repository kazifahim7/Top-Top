import mongoose, { Types } from "mongoose";
import { LobbyModel } from "./lobby.model.js";
import QueryBuilder from "../../builder/QueryBuilder.js";
import { userModel } from "../auth/auth.model.js";
import AppError from "../../Error/AppError.js";
import { TeamModel } from "../Team/team.model.js";
import { PaymentModel } from "../Payment/payment.model.js";
import { TournamentModel } from "../Tournament/Tournament.model.js";
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
        await TeamModel.findByIdAndUpdate(teamId1, { $inc: { totalMatch: 1 } });
        await TeamModel.findByIdAndUpdate(teamId2, { $inc: { totalMatch: 1 } });
    }
    return result;
};
const allMatch = async (query) => {
    const search = query.searchTerms || "";
    const lobbies = await LobbyModel.aggregate([
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
const organizerMatch = async (query, orgId) => {
    const search = query.searchTerms || "";
    const lobbies = await LobbyModel.aggregate([
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
    // -------------------
    // Find player in any team
    // -------------------
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
    // -------------------
    // Calculate match rating BEFORE updating stats
    // -------------------
    let matchRating = player.rating || 6.5;
    // Subtract penalties for NEW cards only (data contains the increments)
    matchRating -= (data.redCard || 0) * 0.5;
    matchRating -= (data.yellowCard || 0) * 0.25;
    // Add bonuses for NEW stats only
    matchRating += (data.goal || 0) * 0.5;
    matchRating += (data.assists || 0) * 0.5;
    matchRating += (data.contribution || 0) * 0.25;
    matchRating += (data.save || 0) * 0.5;
    matchRating += (data.veryGoodMoment || 0) * 0.25; // Added for consistency
    matchRating += (data.goodMoment || 0) * 0.25; // Added for consistency
    // Clamp rating between 0 and 10 (optional but good practice)
    matchRating = Math.max(0, Math.min(10, matchRating));
    player.rating = parseFloat(matchRating.toFixed(2));
    // -------------------
    // Update lobby player stats (AFTER rating calculation)
    // -------------------
    ["redCard", "yellowCard", "goal", "assists", "contribution", "save", "veryGoodMoment", "goodMoment"].forEach(field => {
        if (data[field] !== undefined) {
            player[field] += data[field];
        }
    });
    // Update team goals if real team
    if (data.goal && data.goal > 0) {
        if (teamKey === "team1" || teamKey === "defaultTeam1") {
            lobby.goalTeam1 += data.goal;
        }
        else if (teamKey === "team2" || teamKey === "defaultTeam2") {
            lobby.goalTeam2 += data.goal;
        }
    }
    await lobby.save();
    // -------------------
    // Recalculate profile rating from all lobbies
    // -------------------
    const objectId = new Types.ObjectId(data.playerId);
    const allLobbies = await LobbyModel.find({
        $or: [
            { "team1.players.playerId": objectId },
            { "team2.players.playerId": objectId },
            { "defaultTeam1.players.playerId": objectId },
            { "defaultTeam2.players.playerId": objectId },
        ],
    });
    let totalRating = 0;
    let matchCount = 0;
    allLobbies.forEach(lobbyItem => {
        teams.forEach(key => {
            const team = lobbyItem[key];
            if (!team?.players?.length)
                return;
            const p = team.players.find(pl => pl.playerId.toString() === data.playerId);
            if (!p)
                return;
            // Use the already calculated rating from each lobby
            if (p.rating) {
                totalRating += p.rating;
                matchCount++;
            }
        });
    });
    const averageRating = matchCount ? totalRating / matchCount : 6.5;
    // -------------------
    // Update player profile stats + rating
    // -------------------
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
    const isLobbyExist = await LobbyModel.findById(id);
    console.log(payload);
    if (!isLobbyExist) {
        throw new AppError(404, "This lobby Not Found");
    }
    const result = await LobbyModel.findByIdAndUpdate(id, payload, { new: true });
    return result;
};
const deleteLobby = async (id) => {
    const result = await LobbyModel.findByIdAndDelete(id);
    return result;
};
const myUpcomingLobby = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid player ID");
    }
    const playerObjectId = new mongoose.Types.ObjectId(id);
    const result = await LobbyModel.find({
        lobbyStatus: "ongoing",
        $or: [
            { "team1.players.playerId": playerObjectId },
            { "team2.players.playerId": playerObjectId },
            { "defaultTeam1.players.playerId": playerObjectId },
            { "defaultTeam2.players.playerId": playerObjectId },
        ],
    });
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