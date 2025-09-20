var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Types } from "mongoose";
import { LobbyModel } from "./lobby.model.js";
import QueryBuilder from "../../builder/QueryBuilder.js";
import { userModel } from "../auth/auth.model.js";
import AppError from "../../Error/AppError.js";
const createMatch = (payload, id) => __awaiter(void 0, void 0, void 0, function* () {
    if (payload.matchType === "solo") {
        payload.defaultTeam1.teamName = "Team X";
        payload.defaultTeam2.teamName = "Team Y";
    }
    payload.organizer = new Types.ObjectId(id);
    const result = yield LobbyModel.create(payload);
    return result;
});
const allMatch = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const search = query.searchTerms || "";
    const lobbies = yield LobbyModel.aggregate([
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
        {
            $lookup: {
                from: "players",
                localField: "defaultTeam1.players",
                foreignField: "_id",
                as: "defaultTeam1Players"
            }
        },
        {
            $lookup: {
                from: "players",
                localField: "defaultTeam2.players",
                foreignField: "_id",
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
});
export const updatePlayerStats = (data) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const lobby = yield LobbyModel.findById(data.lobbyId);
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
        if ((_a = team === null || team === void 0 ? void 0 : team.players) === null || _a === void 0 ? void 0 : _a.length) {
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
    yield lobby.save();
    // -------------------
    // Recalculate profile rating from all lobbies
    // -------------------
    const objectId = new Types.ObjectId(data.playerId);
    const allLobbies = yield LobbyModel.find({
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
            var _a;
            const team = lobbyItem[key];
            if (!((_a = team === null || team === void 0 ? void 0 : team.players) === null || _a === void 0 ? void 0 : _a.length))
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
    yield userModel.findByIdAndUpdate(data.playerId, {
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
});
const updateLobbyInfo = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserExist = yield LobbyModel.findById(id);
    if (!isUserExist) {
        throw new AppError(404, "This user Not Found");
    }
    const result = yield userModel.findByIdAndUpdate(id, payload, { new: true });
    return result;
});
export const lobbyService = {
    createMatch,
    allMatch,
    updatePlayerStats,
    updateLobbyInfo
};
//# sourceMappingURL=lobby.services.js.map