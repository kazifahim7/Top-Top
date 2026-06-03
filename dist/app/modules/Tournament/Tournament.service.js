import { Types } from "mongoose";
import AppError from "../../Error/AppError.js";
import { TournamentModel } from "./Tournament.model.js";
import { MatchModel } from "../TournamentMatch/match.model.js";
const createTournament = async (payload) => {
    const result = await TournamentModel.create(payload);
    return result;
};
const singleTournament = async (id) => {
    const result = await TournamentModel.findById(id).populate("winner qualifiedTeams teams organizer");
    return result;
};
const allTournament = async () => {
    const tournaments = await TournamentModel.find({ status: { $ne: "inactive" }, isDelete: { $ne: true } })
        .populate("winner")
        .populate("qualifiedTeams")
        .populate({
        path: "teams",
        populate: [
            { path: "players" },
            { path: "teamOwner" },
        ],
    })
        .populate("organizer")
        .sort({ createdAt: -1 })
        .lean();
    const result = tournaments.map((tournament) => ({
        ...tournament,
        teams: tournament.teams.map((team) => ({
            ...team,
            rating: calculateTeamRating(team),
        })),
        qualifiedTeams: tournament.qualifiedTeams.map((team) => ({
            ...team,
            rating: calculateTeamRating(team),
        })),
        winner: tournament.winner
            ? { ...tournament.winner, rating: calculateTeamRating(tournament.winner) }
            : null,
    }));
    return result;
};
function calculateTeamRating(team) {
    if (!team)
        return 0;
    const members = [...(team.players || []), team.teamOwner].filter(Boolean);
    if (members.length === 0)
        return 0;
    const totalRating = members.reduce((sum, member) => {
        const rating = typeof member === "object" ? (member.rating || 0) : 0;
        return sum + rating;
    }, 0);
    return parseFloat((totalRating / members.length).toFixed(2));
}
const organizerTournament = async (id) => {
    const result = await TournamentModel.find({
        organizer: id,
        status: { $in: ["active", "block"] },
    })
        .populate("winner qualifiedTeams teams organizer")
        .sort({ status: 1, createdAt: -1 });
    return result;
};
// ─── F-05 FIX: ownership check helper ────────────────────────────────────────
const assertTournamentAccess = (tournament, callerId, callerRole) => {
    if (callerRole === "admin")
        return; // admin সব করতে পারবে
    if (callerRole === "organizer") {
        if (tournament.organizer.toString() !== callerId.toString()) {
            throw new AppError(403, "You are not authorized to modify this tournament");
        }
        return;
    }
    throw new AppError(403, "You are not authorized");
};
// F-05 FIX: callerId ও callerRole service-এ 
const updateTournament = async (id, payload, callerId, callerRole) => {
    const tournament = await TournamentModel.findById(id);
    if (!tournament)
        throw new AppError(404, "This tournament is not found");
    // F-05 FIX: organizer 
    assertTournamentAccess(tournament, callerId, callerRole);
    const result = await TournamentModel.findByIdAndUpdate(id, payload, { new: true });
    return result;
};
// F-05 FIX: callerId ও callerRole service
const deleteTournament = async (id, callerId, callerRole) => {
    const tournament = await TournamentModel.findById(id);
    if (!tournament)
        throw new AppError(404, "This tournament is not found");
    // F-05 FIX:
    assertTournamentAccess(tournament, callerId, callerRole);
    const result = await TournamentModel.findByIdAndUpdate(id, { isDelete: true }, { new: true });
    return result;
};
// F-05 FIX: 
const qualifyTeamsService = async (tournamentId, teamIds, callerId, callerRole) => {
    const tournament = await TournamentModel.findById(tournamentId);
    if (!tournament)
        throw new AppError(404, "Tournament not found");
    assertTournamentAccess(tournament, callerId, callerRole);
    const currentQualified = tournament.qualifiedTeams.map((id) => id.toString());
    const uniqueTeams = teamIds.filter((id) => !currentQualified.includes(id.toString()));
    if (uniqueTeams.length === 0) {
        throw new AppError(403, "All teams already qualified or invalid");
    }
    tournament.qualifiedTeams.push(...uniqueTeams.map((id) => new Types.ObjectId(id)));
    await tournament.save();
    return tournament;
};
export const getTopPlayers = async (tournamentId) => {
    const topPlayers = await MatchModel.aggregate([
        { $match: { tournament: new Types.ObjectId(tournamentId), status: "Completed" } },
        { $project: { players: { $concatArrays: ["$teamAPlayers", "$teamBPlayers"] } } },
        { $unwind: "$players" },
        { $match: { "players.guest_player": false } },
        {
            $group: {
                _id: "$players.playerId",
                avgRating: { $avg: "$players.rating" },
                totalMatches: { $sum: 1 },
                totalGoals: { $sum: "$players.goal" },
                totalAssists: { $sum: "$players.assists" },
                totalContribution: { $sum: "$players.contribution" },
                totalTackles: { $sum: "$players.tackle" },
                totalSaves: { $sum: "$players.save" },
                totalYellowCards: { $sum: "$players.yellowCard" },
                totalRedCards: { $sum: "$players.redCard" },
                totalGoodMoments: { $sum: "$players.goodMoment" },
                totalVeryGoodMoments: { $sum: "$players.veryGoodMoment" },
            },
        },
        { $sort: { avgRating: -1 } },
        { $limit: 10 },
        { $lookup: { from: "players", localField: "_id", foreignField: "_id", as: "player" } },
        { $unwind: { path: "$player", preserveNullAndEmptyArrays: false } },
        {
            $project: {
                _id: 0,
                playerId: "$player._id",
                name: "$player.FullName",
                userName: "$player.userName",
                image: "$player.imageUrl",
                position: "$player.position",
                nationality: "$player.nationality",
                avgRating: { $round: ["$avgRating", 2] },
                totalMatches: 1,
                totalGoals: 1,
                totalAssists: 1,
                totalContribution: 1,
                totalTackles: 1,
                totalSaves: 1,
                totalYellowCards: 1,
                totalRedCards: 1,
                totalGoodMoments: 1,
                totalVeryGoodMoments: 1,
            },
        },
    ]);
    return topPlayers;
};
export const TournamentService = {
    createTournament,
    singleTournament,
    allTournament,
    updateTournament,
    deleteTournament,
    qualifyTeamsService,
    getTopPlayers,
    organizerTournament,
};
//# sourceMappingURL=Tournament.service.js.map