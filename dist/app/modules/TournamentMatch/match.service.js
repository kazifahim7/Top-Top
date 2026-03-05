import AppError from "../../Error/AppError.js";
import { getPlayerOverallRating } from "../../utils/getRating.js";
import { roundRating } from "../../utils/roundRating.js";
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
        .populate("organizer")
        .populate("motm")
        .populate({
        path: "teamA",
        populate: { path: "players" }
    })
        .populate({
        path: "teamA",
        populate: { path: "teamOwner" }
    })
        .populate({
        path: "teamB",
        populate: { path: "players" }
    })
        .populate({
        path: "teamB",
        populate: { path: "teamOwner" }
    }).populate({
        path: "teamAPlayers",
        populate: { path: "playerId" }
    }).populate({
        path: "teamBPlayers",
        populate: { path: "playerId" }
    });
    return result;
};
const deleteMatch = async (id) => {
    const result = await MatchModel.findByIdAndDelete(id);
    return result;
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
export const updateMatchAndStanding = async (matchId, data) => {
    const match = await MatchModel.findById(matchId)
        .populate('teamA')
        .populate('teamB');
    if (!match)
        throw new AppError(404, "Match not found");
    if (match.status === "Completed") {
        throw new AppError(403, "Match already completed");
    }
    const tournament = await TournamentModel.findById(match.tournament);
    if (!tournament)
        throw new AppError(404, "Tournament not found");
    if (typeof data.scoreA === "number")
        match.scoreA = data.scoreA;
    if (typeof data.scoreB === "number")
        match.scoreB = data.scoreB;
    if (data.media?.length) {
        match.media = [...(match.media || []), ...data.media];
    }
    if (data.motm) {
        match.motm = data.motm;
    }
    if (typeof match.scoreA === "number" &&
        typeof match.scoreB === "number") {
        match.winner =
            match.scoreA > match.scoreB
                ? match.teamA
                : match.scoreB > match.scoreA
                    ? match.teamB
                    : null;
    }
    match.status = "Completed";
    await match.save();
    // ---------- Update Team Overall Statistics ----------
    if (match.teamA) {
        const teamAUpdate = {
            $inc: {
                totalMatch: 1,
                goal: match.scoreA || 0,
                carryGoal: match.scoreB || 0,
            },
        };
        const resultForA = getMatchResult(match.scoreA || 0, match.scoreB || 0);
        teamAUpdate.$inc[resultForA] = 1;
        await TeamModel.findByIdAndUpdate(match.teamA._id, teamAUpdate);
    }
    if (match.teamB) {
        const teamBUpdate = {
            $inc: {
                totalMatch: 1,
                goal: match.scoreB || 0,
                carryGoal: match.scoreA || 0,
            },
        };
        const resultForB = getMatchResult(match.scoreB || 0, match.scoreA || 0);
        teamBUpdate.$inc[resultForB] = 1;
        await TeamModel.findByIdAndUpdate(match.teamB._id, teamBUpdate);
    }
    // ---------- Clean Sheet Update ----------
    if (match.scoreB === 0) {
        const teamAPlayerIds = match.teamAPlayers
            ?.map((p) => p.playerId)
            .filter(Boolean);
        if (teamAPlayerIds?.length) {
            await userModel.updateMany({ _id: { $in: teamAPlayerIds } }, { $inc: { cleanSheet: 1 } });
        }
    }
    if (match.scoreA === 0) {
        const teamBPlayerIds = match.teamBPlayers
            ?.map((p) => p.playerId)
            .filter(Boolean);
        if (teamBPlayerIds?.length) {
            await userModel.updateMany({ _id: { $in: teamBPlayerIds } }, { $inc: { cleanSheet: 1 } });
        }
    }
    // ---------- MOTM Update ----------
    if (data.motm) {
        await userModel.findByIdAndUpdate(data.motm, { $inc: { motm: 1 } });
    }
    // ---------- Update Tournament Standings ----------
    await updateStanding(match.tournament.toString(), match.teamA._id.toString(), match.scoreA || 0, match.scoreB || 0);
    await updateStanding(match.tournament.toString(), match.teamB._id.toString(), match.scoreB || 0, match.scoreA || 0);
    // ---------- Final Match Winner ----------
    if (match.group === "Final" && match.winner) {
        tournament.winner = match.winner;
        tournament.status = "completed";
        await tournament.save();
    }
    return match;
};
function getMatchResult(teamGoals, opponentGoals) {
    if (teamGoals > opponentGoals)
        return 'win';
    if (teamGoals < opponentGoals)
        return 'loss';
    return 'draw';
}
const addPlayers = async (matchId, data, userId) => {
    const { team, players, matchFormat } = data;
    // 1️⃣ Find Match
    const match = await MatchModel.findById(matchId);
    if (!match)
        throw new AppError(404, "Match not found");
    if (match.status === "Completed") {
        throw new AppError(400, "Match already  completed");
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
        const isTeamMember = teamDoc.players.some(id => id.equals(p.playerId));
        const isTeamOwner = teamDoc.teamOwner.equals(p.playerId);
        if (!isTeamMember && !isTeamOwner) {
            throw new AppError(403, "Player is not in this team");
        }
        const exists = match[targetField].some(pl => String(pl.playerId) === String(p.playerId));
        if (exists) {
            throw new AppError(403, "Already exits");
        }
        ;
        const enteriedPlayer = match[targetField].filter((player) => player.guest_player == true);
        if (enteriedPlayer.length >= tournamentExist.fieldSize) {
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
export const updatePlayerStats = async (data) => {
    const match = await MatchModel.findById(data.matchId);
    if (!match)
        throw new Error("Match not found");
    let player = null;
    let teamKey = null;
    // -------- Find player ----------
    player = match.teamAPlayers.find(p => p.playerId.toString() === data.playerId);
    if (player) {
        teamKey = "A";
    }
    else {
        player = match.teamBPlayers.find(p => p.playerId.toString() === data.playerId);
        if (player)
            teamKey = "B";
    }
    if (!player || !teamKey) {
        throw new Error("Player not found in match");
    }
    // -------- Rating calculation ----------
    let rawRating = player.rawRating ?? player.rating ?? 6.5;
    rawRating -= (data.redCard ?? 0) * 0.5;
    rawRating -= (data.yellowCard ?? 0) * 0.25;
    rawRating += (data.goal ?? 0) * 0.5;
    rawRating += (data.assists ?? 0) * 0.5;
    rawRating += (data.contribution ?? 0) * 0.25;
    rawRating += (data.save ?? 0) * 0.25;
    rawRating += (data.goodMoment ?? 0) * 0.25;
    rawRating += (data.veryGoodMoment ?? 0) * 0.5;
    // ✅ rawRating save, rating clamp
    player.rawRating = Number(rawRating.toFixed(2));
    player.rating = Number(Math.max(0, Math.min(10, rawRating)).toFixed(2));
    // -------- Update stats ----------
    const fields = [
        "redCard",
        "yellowCard",
        "goal",
        "assists",
        "contribution",
        "save",
        "goodMoment",
        "veryGoodMoment",
    ];
    fields.forEach(field => {
        if (data[field] !== undefined) {
            player[field] += data[field];
        }
    });
    // -------- Update match score ----------
    if (data.goal !== undefined && data.goal !== 0) {
        if (teamKey === "A")
            match.scoreA += data.goal;
        if (teamKey === "B")
            match.scoreB += data.goal;
    }
    await match.save();
    // -------- Recalculate player avg rating ----------
    const { averageRating, matchCount } = await getPlayerOverallRating(data.playerId);
    // -------- Update player profile ----------
    await userModel.findByIdAndUpdate(data.playerId, {
        $inc: {
            redCard: data.redCard ?? 0,
            yellowCard: data.yellowCard ?? 0,
            goal: data.goal ?? 0,
            assists: data.assists ?? 0,
            contribution: data.contribution ?? 0,
            save: data.save ?? 0,
        },
        match: matchCount,
        rating: Number(averageRating.toFixed(2)),
    }, { new: true });
    return { matchPlayer: player };
};
export const tournamentMatchService = {
    createMatch,
    singleMatch,
    deleteMatch,
    allMatch,
    updateMatchAndStanding,
    addPlayers,
    removePlayerFromMatch,
    updatePlayerStats
};
//# sourceMappingURL=match.service.js.map