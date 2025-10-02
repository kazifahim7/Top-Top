var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { StandingModel } from "../PointTable/pointtable.model.js";
import { MatchModel } from "./match.model.js";
const createMatch = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield MatchModel.create(payload);
    return result;
});
const allMatch = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield MatchModel.find().populate("winner teamB teamA tournament");
    return result;
});
const singleMatch = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield MatchModel.findById(id).populate("winner teamB teamA tournament");
    return result;
});
const deleteMatch = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield MatchModel.findByIdAndDelete(id);
    return result;
});
export const updateMatchAndStanding = (matchId, scoreA, scoreB) => __awaiter(void 0, void 0, void 0, function* () {
    const match = yield MatchModel.findById(matchId);
    if (!match)
        throw new Error("Match not found");
    if (match.status === "Completed") {
        throw new Error("Match already completed and standings updated.");
    }
    //  Update match info
    match.scoreA = scoreA;
    match.scoreB = scoreB;
    match.status = "Completed";
    match.winner =
        scoreA > scoreB ? match.teamA : scoreB > scoreA ? match.teamB : null;
    yield match.save();
    //  Update standings for both teams
    yield updateStanding(match.tournament.toString(), match.teamA.toString(), scoreA, scoreB);
    yield updateStanding(match.tournament.toString(), match.teamB.toString(), scoreB, scoreA);
    return match;
});
const updateStanding = (tournamentId, teamId, scored, conceded) => __awaiter(void 0, void 0, void 0, function* () {
    let standing = yield StandingModel.findOne({ tournament: tournamentId, team: teamId });
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
    yield standing.save();
    return standing;
});
export const tournamentMatchService = {
    createMatch,
    singleMatch,
    deleteMatch,
    allMatch,
    updateMatchAndStanding
};
//# sourceMappingURL=match.service.js.map