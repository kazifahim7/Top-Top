import { Types } from "mongoose";
import AppError from "../../Error/AppError.js";
import { TournamentModel } from "./Tournament.model.js";
const createTournament = async (payload) => {
    const result = await TournamentModel.create(payload);
    return result;
};
const singleTournament = async (id) => {
    const result = await TournamentModel.findById(id).populate("winner qualifiedTeams teams organizer");
    return result;
};
const allTournament = async () => {
    const result = await TournamentModel.find().populate("winner qualifiedTeams teams organizer");
    return result;
};
const organizerTournament = async (id) => {
    const result = await TournamentModel.find({ organizer: id }).populate("winner qualifiedTeams teams organizer");
    return result;
};
const updateTournament = async (id, payload) => {
    const isTournamentIsExists = await TournamentModel.findById(id);
    if (!isTournamentIsExists) {
        throw new AppError(404, "this tournament is not found");
    }
    const result = await TournamentModel.findByIdAndUpdate(id, payload, { new: true });
    return result;
};
const deleteTournament = async (id) => {
    const isTournamentIsExists = await TournamentModel.findById(id);
    if (!isTournamentIsExists) {
        throw new AppError(404, "this tournament is not found");
    }
    const result = await TournamentModel.findByIdAndDelete(id);
    return result;
};
const qualifyTeamsService = async (tournamentId, teamIds) => {
    const tournament = await TournamentModel.findById(tournamentId);
    if (!tournament) {
        throw new AppError(404, "Tournament not found");
    }
    const currentQualified = tournament.qualifiedTeams.map((id) => id.toString());
    const uniqueTeams = teamIds.filter((id) => !currentQualified.includes(id.toString()));
    if (uniqueTeams.length === 0) {
        throw new AppError(403, "All teams already qualified or invalid");
    }
    tournament.qualifiedTeams.push(...uniqueTeams.map((id) => new Types.ObjectId(id)));
    await tournament.save();
    return tournament;
};
const getTopPlayers = async (tournamentId) => {
    const tournament = await TournamentModel.findById(tournamentId)
        .populate({
        path: "teams",
        populate: {
            path: "players",
            model: "Players",
        },
    })
        .lean();
    if (!tournament) {
        throw new AppError(404, "Tournament not found");
    }
    // allPlayers বের করা
    let allPlayers = [];
    tournament.teams.forEach((team) => {
        if (team.players && Array.isArray(team.players)) {
            allPlayers = [...allPlayers, ...team.players];
        }
    });
    // rating অনুযায়ী sort
    const sortedPlayers = allPlayers
        .filter((p) => p.rating > 0)
        .sort((a, b) => b.rating - a.rating);
    return {
        tournament: tournament.name,
        topPlayers: sortedPlayers,
    };
};
export const TournamentService = {
    createTournament,
    singleTournament,
    allTournament,
    updateTournament,
    deleteTournament,
    qualifyTeamsService,
    getTopPlayers,
    organizerTournament
};
//# sourceMappingURL=Tournament.service.js.map