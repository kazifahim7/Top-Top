var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import catchAsync from "../../utils/catcgAsync.js";
import { tournamentMatchService } from "./match.service.js";
const createMatch = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield tournamentMatchService.createMatch(req.body);
    res.status(200).json({
        success: true,
        message: "Match created successfully",
        data: result
    });
}));
const allMatch = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield tournamentMatchService.allMatch();
    res.status(200).json({
        success: true,
        message: "All TOurnament match are retrieved  successfully",
        data: result
    });
}));
const singleMatch = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield tournamentMatchService.singleMatch(req.params.id);
    res.status(200).json({
        success: true,
        message: "  TOurnament match are retrieved  successfully",
        data: result
    });
}));
const deleteMatch = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield tournamentMatchService.deleteMatch(req.params.id);
    res.status(200).json({
        success: true,
        message: " match are deleted  successfully",
        data: {}
    });
}));
export const tournamentMatchController = {
    createMatch,
    deleteMatch,
    allMatch,
    singleMatch
};
//# sourceMappingURL=match.controller.js.map