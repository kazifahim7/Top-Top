import AppError from "../../Error/AppError.js";
import { userModel } from "../auth/auth.model.js";
import { StandingModel } from "../PointTable/pointtable.model.js";
import { TeamModel } from "../Team/team.model.js";
import { TournamentModel } from "../Tournament/Tournament.model.js";
import { MatchModel } from "./match.model.js";
import { Types } from "mongoose";
const createMatch = async (payload, id) => {
    payload.organizer = new Types.ObjectId(id);
    const result = await MatchModel.create(payload);
    return result;
};
const allMatch = async (id) => {
    const result = await MatchModel.find({ tournament: id }).populate("winner teamB teamA tournament");
    return result;
};
const singleMatch = async (id) => {
    const result = await MatchModel.findById(id)
        .populate("winner")
        .populate("teamA")
        .populate("teamB")
        .populate("tournament")
        .populate({
        path: "teamA",
        populate: { path: "players" }
    })
        .populate({
        path: "teamB",
        populate: { path: "players" }
    });
    return result;
};
const deleteMatch = async (id) => {
    const result = await MatchModel.findByIdAndDelete(id);
    return result;
};
export const updateMatchAndStanding = async (matchId, scoreA, scoreB) => {
    const match = await MatchModel.findById(matchId);
    if (!match)
        throw new AppError(404, "Match not found");
    if (match.status === "Completed") {
        throw new AppError(403, "Match already completed and standings updated.");
    }
    // Get tournament
    const tournament = await TournamentModel.findById(match.tournament);
    if (!tournament)
        throw new AppError(404, "Tournament not found");
    //  Update match info
    match.scoreA = scoreA;
    match.scoreB = scoreB;
    match.status = "Completed";
    match.winner =
        scoreA > scoreB ? match.teamA : scoreB > scoreA ? match.teamB : null;
    await match.save();
    //  Update standings for both teams
    await updateStanding(match.tournament.toString(), match.teamA.toString(), scoreA, scoreB);
    await updateStanding(match.tournament.toString(), match.teamB.toString(), scoreB, scoreA);
    // Check if this is a final match and update tournament winner
    if (match.group === "Final" && match.winner) {
        tournament.winner = match.winner;
        tournament.status = "completed";
        await tournament.save();
    }
    return match;
};
const updateStanding = async (tournamentId, teamId, scored, conceded) => {
    let standing = await StandingModel.findOne({
        tournament: tournamentId,
        team: teamId
    });
    if (!standing) {
        standing = new StandingModel({
            tournament: tournamentId,
            team: teamId,
            played: 0,
            win: 0,
            draw: 0,
            loss: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            points: 0,
        });
    }
    // update stats
    standing.played += 1;
    standing.goalsFor += scored;
    standing.goalsAgainst += conceded;
    if (scored > conceded) {
        standing.win += 1;
        standing.points += 3;
    }
    else if (scored === conceded) {
        standing.draw += 1;
        standing.points += 1;
    }
    else {
        standing.loss += 1;
    }
    await standing.save();
    return standing;
};
const addPlayers = async (matchId, data, userId) => {
    const { team, players, matchFormat } = data;
    // 1️⃣ Find Match
    const match = await MatchModel.findById(matchId);
    if (!match)
        throw new AppError(404, "Match not found");
    if (match.status !== "Pending") {
        throw new AppError(400, "Match already started or completed");
    }
    // 2️⃣ Find Team
    const teamId = team === "A" ? match.teamA : match.teamB;
    const teamDoc = await TeamModel.findById(teamId);
    if (!teamDoc)
        throw new AppError(404, "Team not found");
    const tournamentExist = await TournamentModel.findOne(match.tournament);
    if (!tournamentExist) {
        throw new AppError(404, "Tournament  not found");
    }
    // 3️⃣ Check if user is team owner or captain
    const isOwner = String(teamDoc.teamOwner) === String(userId);
    const isCaptain = teamDoc.teamCaptain.some(id => String(id) === String(userId));
    const isLeader = isOwner || isCaptain;
    if (!isLeader) {
        throw new AppError(403, "You can not add player");
    }
    // 4️⃣ Set match format (Leader only)
    if (isLeader && matchFormat) {
        if (team === "A")
            match.team1MatchFormat = matchFormat;
        else
            match.team2MatchFormat = matchFormat;
    }
    // 5️⃣ Add players
    const targetField = team === "A" ? "teamAPlayers" : "teamBPlayers";
    for (const p of players) {
        const exists = match[targetField].some(pl => String(pl.playerId) === String(p.playerId));
        if (exists) {
            throw new AppError(403, "Already exits");
        }
        ;
        if (match[targetField].length >= tournamentExist.fieldSize) {
            throw new AppError(403, "Already team is full");
        }
        match[targetField].push({
            playerId: new Types.ObjectId(p.playerId),
            matchPosition: p.matchPosition ?? "",
            guest_player: p.guest_player ?? false,
            // Default stats
            redCard: 0,
            yellowCard: 0,
            contribution: 0,
            assists: 0,
            goal: 0,
            tackle: 0,
            save: 0,
            goodMoment: 0,
            veryGoodMoment: 0,
            rating: 6.5
        });
    }
    // 6️⃣ Calculate avg profile rating
    const calculateAvg = async (arr) => {
        if (!arr.length)
            return 0;
        const ids = arr.map(p => p.playerId);
        const profiles = await userModel.find({ _id: { $in: ids } }, { rating: 1 });
        if (!profiles.length)
            return 0;
        const total = profiles.reduce((sum, p) => sum + (p.rating || 6.5), 0);
        return Number((total / profiles.length).toFixed(2));
    };
    match.team1AvgMatchRatingBefore = await calculateAvg(match.teamAPlayers);
    match.team2AvgMatchRatingBefore = await calculateAvg(match.teamBPlayers);
    // 7️⃣ Save match
    const result = await match.save();
    return result;
};
export const removePlayerFromMatch = async (matchId, data, userId) => {
    const { team, playerId } = data;
    // 1️⃣ Find Match
    const match = await MatchModel.findById(matchId);
    if (!match)
        throw new AppError(404, "Match not found");
    if (match.status !== "Pending") {
        throw new AppError(400, "Cannot remove player from a started or completed match");
    }
    // 2️⃣ Find Team
    const teamId = team === "A" ? match.teamA : match.teamB;
    const teamDoc = await TeamModel.findById(teamId);
    if (!teamDoc)
        throw new AppError(404, "Team not found");
    // 3️⃣ Check if user is team owner or captain
    const isOwner = String(teamDoc.teamOwner) === String(userId);
    const isCaptain = teamDoc.teamCaptain.some(id => String(id) === String(userId));
    const isLeader = isOwner || isCaptain;
    // ❌ Normal player restriction
    if (!isLeader && String(playerId) !== String(userId)) {
        throw new AppError(403, "You can only remove yourself");
    }
    // 4️⃣ Remove player
    const targetField = team === "A" ? "teamAPlayers" : "teamBPlayers";
    const beforeLength = match[targetField].length;
    match[targetField] = match[targetField].filter(p => String(p.playerId) !== String(playerId));
    if (beforeLength === match[targetField].length) {
        throw new AppError(404, "Player not found in this match");
    }
    // 5️⃣ Recalculate avg profile rating
    const calculateAvg = async (arr) => {
        if (!arr.length)
            return 0;
        const ids = arr.map(p => p.playerId);
        const profiles = await userModel.find({ _id: { $in: ids } }, { rating: 1 });
        if (!profiles.length)
            return 0;
        const total = profiles.reduce((sum, p) => sum + (p.rating || 6.5), 0);
        return Number((total / profiles.length).toFixed(2));
    };
    match.team1AvgMatchRatingBefore = await calculateAvg(match.teamAPlayers);
    match.team2AvgMatchRatingBefore = await calculateAvg(match.teamBPlayers);
    // 6️⃣ Save match
    const result = await match.save();
    return result;
};
export const tournamentMatchService = {
    createMatch,
    singleMatch,
    deleteMatch,
    allMatch,
    updateMatchAndStanding,
    addPlayers,
    removePlayerFromMatch
};
//# sourceMappingURL=match.service.js.map