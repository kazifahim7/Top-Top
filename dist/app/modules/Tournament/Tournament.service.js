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
import AppError from "../../Error/AppError.js";
import { TournamentModel } from "./Tournament.model.js";
const createTournament = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield TournamentModel.create(payload);
    return result;
});
const singleTournament = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield TournamentModel.findById(id).populate("winner qualifiedTeams teams");
    return result;
});
const allTournament = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield TournamentModel.find().populate("winner qualifiedTeams teams");
    return result;
});
const updateTournament = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isTournamentIsExists = yield TournamentModel.findById(id);
    if (!isTournamentIsExists) {
        throw new AppError(404, "this tournament is not found");
    }
    const result = yield TournamentModel.findByIdAndUpdate(id, payload, { new: true });
    return result;
});
const deleteTournament = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isTournamentIsExists = yield TournamentModel.findById(id);
    if (!isTournamentIsExists) {
        throw new AppError(404, "this tournament is not found");
    }
    const result = yield TournamentModel.findByIdAndDelete(id);
    return result;
});
const qualifyTeamsService = (tournamentId, teamIds) => __awaiter(void 0, void 0, void 0, function* () {
    const tournament = yield TournamentModel.findById(tournamentId);
    if (!tournament) {
        throw new Error("Tournament not found");
    }
    const currentQualified = tournament.qualifiedTeams.map((id) => id.toString());
    const uniqueTeams = teamIds.filter((id) => !currentQualified.includes(id.toString()));
    if (uniqueTeams.length === 0) {
        throw new Error("All teams already qualified or invalid");
    }
    tournament.qualifiedTeams.push(...uniqueTeams.map((id) => new Types.ObjectId(id)));
    yield tournament.save();
    return tournament;
});
export const TournamentService = {
    createTournament,
    singleTournament,
    allTournament,
    updateTournament,
    deleteTournament,
    qualifyTeamsService
};
//# sourceMappingURL=Tournament.service.js.map