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
import { getLocalImageURL } from "../../utils/multer.js";
import { TournamentService } from "./Tournament.service.js";
const createTournament = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    const imageFiles = req.files.images || [];
    for (const file of imageFiles) {
        const url = getLocalImageURL(file.filename);
        data.imageUrl = url;
    }
    const result = yield TournamentService.createTournament(data);
    res.status(200).json({
        success: true,
        message: "Tournament created successfully",
        data: result
    });
}));
const singleTournament = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield TournamentService.singleTournament(req.params.id);
    res.status(200).json({
        success: true,
        message: "Tournament retrieved successfully",
        data: result
    });
}));
const allTournament = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield TournamentService.allTournament();
    res.status(200).json({
        success: true,
        message: "Tournament retrieved successfully",
        data: result
    });
}));
const updateTournament = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    const imageFiles = req.files.images || [];
    for (const file of imageFiles) {
        const url = getLocalImageURL(file.filename);
        data.imageUrl = url;
    }
    const result = yield TournamentService.updateTournament(req.params.id, data);
    res.status(200).json({
        success: true,
        message: "Tournament updated successfully",
        data: result
    });
}));
const deleteTournament = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield TournamentService.deleteTournament(req.params.id);
    res.status(200).json({
        success: true,
        message: "Tournament deleted successfully",
        data: result
    });
}));
export const TournamentController = {
    createTournament,
    singleTournament,
    updateTournament,
    deleteTournament,
    allTournament
};
//# sourceMappingURL=Tournament.controller.js.map