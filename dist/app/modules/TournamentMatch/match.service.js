import AppError from "../../Error/AppError.js";
import { getPlayerOverallRating } from "../../utils/getRating.js";
import { roundRating } from "../../utils/roundRating.js";
import { userModel } from "../auth/auth.model.js";
import { StandingModel } from "../PointTable/pointtable.model.js";
import { TeamModel } from "../Team/team.model.js";
import { TournamentModel } from "../Tournament/Tournament.model.js";
import { MatchModel } from "./match.model.js";
import { Types } from "mongoose";
import { CountryService } from "../Country/country.service.js";
import { assertSameCountry, getUserCountryCode } from "../../utils/countryAccess.js";
const createMatch = async (payload, id) => {
    const tournament = await TournamentModel.findById(payload.tournament).select("countryCode currencyCode");
    if (!tournament)
        throw new AppError(404, "Tournament not found");
    payload.organizer = new Types.ObjectId(id);
    payload.countryCode = tournament.countryCode || CountryService.DEFAULT_COUNTRY_CODE;
    payload.currencyCode = tournament.currencyCode || CountryService.DEFAULT_CURRENCY_CODE;
    const result = await MatchModel.create(payload);
    return result;
};
const allMatch = async (id) => {
    const result = await MatchModel.find({ tournament: id })
        .populate("winner teamB teamA tournament")
        .sort({ date: -1 });
    return result;
};
const countryMatch = async (countryCode) => {
    await CountryService.assertActiveCountry(countryCode);
    const result = await MatchModel.find(CountryService.buildLegacyCountryFilter(countryCode))
        .populate("winner teamB teamA tournament organizer")
        .sort({ date: -1 });
    return result;
};
const myCountryTournamentMatches = async (userId, tournamentId) => {
    const countryCode = await getUserCountryCode(userId);
    const tournament = await TournamentModel.findById(tournamentId).select("countryCode");
    if (!tournament)
        throw new AppError(404, "Tournament not found");
    assertSameCountry(tournament.countryCode, countryCode);
    return allMatch(tournamentId);
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
    })
        .populate({
        path: "teamAPlayers",
        populate: { path: "playerId" }
    })
        .populate({
        path: "teamBPlayers",
        populate: { path: "playerId" }
    })
        .lean();
    if (!result)
        return null;
    const calcAvg = (players) => {
        if (!players?.length)
            return 0;
        const total = players.reduce((sum, p) => sum + (p.rating ?? 6.5), 0);
        return parseFloat((total / players.length).toFixed(2));
    };
    return {
        ...result,
        team1AvgMatchRatingAfter: result.status === "Completed" ? calcAvg(result.teamAPlayers) : null,
        team2AvgMatchRatingAfter: result.status === "Completed" ? calcAvg(result.teamBPlayers) : null,
    };
};
const myCountrySingleMatch = async (userId, matchId) => {
    const countryCode = await getUserCountryCode(userId);
    const match = await MatchModel.findById(matchId).select("countryCode");
    if (!match)
        throw new AppError(404, "Match not found");
    assertSameCountry(match.countryCode, countryCode);
    return singleMatch(matchId);
};
const deleteMatch = async (id, requesterId) => {
    const match = await MatchModel.findById(id);
    if (!match)
        throw new AppError(404, "Match not found");
    // Only the organizer who created the match may delete it
    if (String(match.organizer) !== String(requesterId)) {
        throw new AppError(403, "You are not authorized to delete this match");
    }
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
export const updateMatchAndStanding = async (matchId, data, requesterId) => {
    const match = await MatchModel.findById(matchId)
        .populate('teamA')
        .populate('teamB');
    if (!match)
        throw new AppError(404, "Match not found");
    // Only the organizer who created the match may update it
    if (String(match.organizer) !== String(requesterId)) {
        throw new AppError(403, "You are not authorized to update this match");
    }
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
    // ==================== MATCH COUNT INCREMENT ====================
    const allTournamentPlayerIds = [
        ...(match.teamAPlayers || []),
        ...(match.teamBPlayers || []),
    ]
        .filter((p) => !p.guest_player)
        .map((p) => p.playerId)
        .filter(Boolean);
    if (allTournamentPlayerIds.length > 0) {
        await userModel.updateMany({ _id: { $in: allTournamentPlayerIds } }, { $inc: { match: 1 } });
    }
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
    const match = await MatchModel.findById(matchId);
    if (!match)
        throw new AppError(404, "Match not found");
    if (match.status === "Completed") {
        throw new AppError(400, "Match already completed");
    }
    const teamId = team === "A" ? match.teamA : match.teamB;
    const teamDoc = await TeamModel.findById(teamId);
    if (!teamDoc)
        throw new AppError(404, "Team not found");
    const tournamentExist = await TournamentModel.findOne(match.tournament);
    if (!tournamentExist) {
        throw new AppError(404, "Tournament not found");
    }
    const isOwner = String(teamDoc.teamOwner) === String(userId);
    const isCaptain = teamDoc.teamCaptain.some(id => String(id) === String(userId));
    const isLeader = isOwner || isCaptain;
    if (!isLeader) {
        throw new AppError(403, "You can not add player");
    }
    if (isLeader && matchFormat) {
        if (team === "A")
            match.team1MatchFormat = matchFormat;
        else
            match.team2MatchFormat = matchFormat;
    }
    const targetField = team === "A" ? "teamAPlayers" : "teamBPlayers";
    for (const p of players) {
        const isTeamMember = teamDoc.players.some(id => id.equals(p.playerId));
        const isTeamOwner = teamDoc.teamOwner.equals(p.playerId);
        if (!isTeamMember && !isTeamOwner) {
            throw new AppError(403, "Player is not in this team");
        }
        const exists = match[targetField].some(pl => String(pl.playerId) === String(p.playerId));
        if (exists) {
            throw new AppError(403, "Already exists");
        }
        const enteredPlayers = match[targetField].filter((player) => player.guest_player == true);
        if (enteredPlayers.length >= tournamentExist.fieldSize) {
            throw new AppError(403, "Already team is full");
        }
        match[targetField].push({
            playerId: new Types.ObjectId(p.playerId),
            matchPosition: p.matchPosition ?? "",
            guest_player: p.guest_player ?? false,
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
    const result = await match.save();
    return result;
};
export const removePlayerFromMatch = async (matchId, data, userId) => {
    const { team, playerId } = data;
    const match = await MatchModel.findById(matchId);
    if (!match)
        throw new AppError(404, "Match not found");
    if (match.status !== "Pending") {
        throw new AppError(400, "Cannot remove player from a started or completed match");
    }
    const teamId = team === "A" ? match.teamA : match.teamB;
    const teamDoc = await TeamModel.findById(teamId);
    if (!teamDoc)
        throw new AppError(404, "Team not found");
    const isOwner = String(teamDoc.teamOwner) === String(userId);
    const isCaptain = teamDoc.teamCaptain.some(id => String(id) === String(userId));
    const isLeader = isOwner || isCaptain;
    if (!isLeader && String(playerId) !== String(userId)) {
        throw new AppError(403, "You can only remove yourself");
    }
    const targetField = team === "A" ? "teamAPlayers" : "teamBPlayers";
    const beforeLength = match[targetField].length;
    match[targetField] = match[targetField].filter(p => String(p.playerId) !== String(playerId));
    if (beforeLength === match[targetField].length) {
        throw new AppError(404, "Player not found in this match");
    }
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
    const result = await match.save();
    return result;
};
export const updatePlayerStats = async (data) => {
    const match = await MatchModel.findById(data.matchId);
    if (!match)
        throw new Error("Match not found");
    if (data.ownGoal !== undefined && data.ownGoal !== 0) {
        if (!data.teamId)
            throw new Error("teamId is required for ownGoal");
        if (data.teamId === "A")
            match.scoreA = (match.scoreA || 0) + data.ownGoal;
        if (data.teamId === "B")
            match.scoreB = (match.scoreB || 0) + data.ownGoal;
        await match.save();
        return { scoreA: match.scoreA, scoreB: match.scoreB };
    }
    if (data.playerId) {
        let player = null;
        let teamKey = null;
        player = match.teamAPlayers.find(p => p.playerId.toString() === data.playerId);
        if (player) {
            teamKey = "A";
        }
        else {
            player = match.teamBPlayers.find(p => p.playerId.toString() === data.playerId);
            if (player)
                teamKey = "B";
        }
        if (!player || !teamKey)
            throw new Error("Player not found in match");
        let rawRating = player.rawRating ?? player.rating ?? 6.5;
        rawRating -= (data.redCard ?? 0) * 0.5;
        rawRating -= (data.yellowCard ?? 0) * 0.25;
        rawRating += (data.goal ?? 0) * 0.5;
        rawRating += (data.assists ?? 0) * 0.5;
        rawRating += (data.contribution ?? 0) * 0.25;
        rawRating += (data.save ?? 0) * 0.25;
        rawRating += (data.goodMoment ?? 0) * 0.25;
        rawRating += (data.veryGoodMoment ?? 0) * 0.5;
        player.rawRating = Number(rawRating.toFixed(2));
        player.rating = Number(Math.max(0, Math.min(10, rawRating)).toFixed(2));
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
        if (data.goal !== undefined && data.goal !== 0) {
            if (teamKey === "A")
                match.scoreA += data.goal;
            if (teamKey === "B")
                match.scoreB += data.goal;
        }
        await match.save();
        const { averageRating, matchCount } = await getPlayerOverallRating(data.playerId);
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
    }
    throw new Error("Either playerId or ownGoal with teamId is required");
};
export const tournamentMatchService = {
    createMatch,
    singleMatch,
    deleteMatch,
    allMatch,
    countryMatch,
    myCountryTournamentMatches,
    myCountrySingleMatch,
    updateMatchAndStanding,
    addPlayers,
    removePlayerFromMatch,
    updatePlayerStats
};
//# sourceMappingURL=match.service.js.map