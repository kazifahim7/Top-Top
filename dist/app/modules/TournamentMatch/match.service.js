var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
export const tournamentMatchService = {
    createMatch,
    singleMatch,
    deleteMatch,
    allMatch
};
//# sourceMappingURL=match.service.js.map