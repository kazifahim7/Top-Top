import { Types } from "mongoose";
import { LobbyModel } from "./lobby.model.js";
import QueryBuilder from "../../builder/QueryBuilder.js";
import { userModel } from "../auth/auth.model.js";
import AppError from "../../Error/AppError.js";
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
const singlelobby = async (lobbyId) => {
    const lobbies = await LobbyModel.aggregate([
        {
            $match: {
                _id: new Types.ObjectId(lobbyId),
            },
        },
        /* ================= TEAM 1 ================= */
        {
            $lookup: {
                from: "teams",
                localField: "team1.teamId",
                foreignField: "_id",
                as: "team1Data",
            },
        },
        { $unwind: { path: "$team1Data", preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: "players",
                localField: "team1Data.players",
                foreignField: "_id",
                as: "team1Players",
            },
        },
        /* ================= TEAM 2 ================= */
        {
            $lookup: {
                from: "teams",
                localField: "team2.teamId",
                foreignField: "_id",
                as: "team2Data",
            },
        },
        { $unwind: { path: "$team2Data", preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: "players",
                localField: "team2Data.players",
                foreignField: "_id",
                as: "team2Players",
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
        { $unwind: { path: "$organizerData", preserveNullAndEmptyArrays: true } },
        /* ================= DEFAULT TEAM 1 ================= */
        {
            $lookup: {
                from: "players",
                let: {
                    playerIds: {
                        $ifNull: ["$defaultTeam1.players.playerId", []],
                    },
                },
                pipeline: [
                    {
                        $match: {
                            $expr: { $in: ["$_id", "$$playerIds"] },
                        },
                    },
                ],
                as: "defaultTeam1Players",
            },
        },
        /* ================= DEFAULT TEAM 2 ================= */
        {
            $lookup: {
                from: "players",
                let: {
                    playerIds: {
                        $ifNull: ["$defaultTeam2.players.playerId", []],
                    },
                },
                pipeline: [
                    {
                        $match: {
                            $expr: { $in: ["$_id", "$$playerIds"] },
                        },
                    },
                ],
                as: "defaultTeam2Players",
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
    // Update lobby player stats
    // -------------------
    ["redCard", "yellowCard", "goal", "assist", "contribution", "save"].forEach(field => {
        if (data[field] !== undefined) {
            player[field] += data[field];
        }
    });
    // Calculate match rating for this match
    let matchRating = 6.5;
    matchRating -= player.redCard * 0.5;
    matchRating -= player.yellowCard * 0.25;
    matchRating += player.goal * 0.5;
    matchRating += player.assists * 0.5;
    matchRating += player.contribution * 0.25;
    matchRating += player.save * 0.5;
    player.rating = parseFloat(matchRating.toFixed(2));
    // Update team goals if real team
    if (data.goal && data.goal > 0) {
        if (teamKey === "team1")
            lobby.goalTeam1 += data.goal;
        else if (teamKey === "team2")
            lobby.goalTeam2 += data.goal;
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
            let rating = 6.5;
            rating -= (p.redCard || 0) * 0.5;
            rating -= (p.yellowCard || 0) * 0.25;
            rating += (p.goal || 0) * 0.5;
            rating += (p.assists || 0) * 0.5;
            rating += (p.contribution || 0) * 0.25;
            rating += (p.save || 0) * 0.5;
            totalRating += rating;
            matchCount++;
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
            assists: data.assist || 0,
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
export const lobbyService = {
    createMatch,
    allMatch,
    updatePlayerStats,
    updateLobbyInfo,
    deleteLobby,
    singlelobby
};
//# sourceMappingURL=lobby.services.js.map