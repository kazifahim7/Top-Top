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
import { teamsService } from "./teams.service.js";
const createTeam = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const data = req.body;
    const id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const imageFiles = req.files.images || [];
    for (const file of imageFiles) {
        const url = getLocalImageURL(file.filename);
        data.image = url;
    }
    const result = yield teamsService.createTeam(data, id);
    res.status(200).json({
        success: true,
        message: "Teams created successfully",
        data: result
    });
}));
const updateTeam = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const data = req.body;
    const id = (_a = req.params) === null || _a === void 0 ? void 0 : _a.id;
    const imageFiles = req.files.images || [];
    for (const file of imageFiles) {
        const url = getLocalImageURL(file.filename);
        data.image = url;
    }
    const result = yield teamsService.updateTeam(data, id);
    res.status(200).json({
        success: true,
        message: "Teams updated successfully",
        data: result
    });
}));
const allTeams = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield teamsService.allTeams();
    res.status(200).json({
        success: true,
        message: "All Teams landed  successfully",
        data: result
    });
}));
const myTeam = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.id;
    const result = yield teamsService.myTeam(id);
    res.status(200).json({
        success: true,
        message: "My Teams landed  successfully",
        data: result
    });
}));
const assignCaptain = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const ownerId = req.user.id;
    const teamId = (_a = req.params) === null || _a === void 0 ? void 0 : _a.teamId;
    const { captainId } = req === null || req === void 0 ? void 0 : req.body;
    const result = yield teamsService.assignCaptain(ownerId, teamId, captainId);
    res.status(200).json({
        success: true,
        message: "Captain assigned successfully",
        data: result
    });
}));
const removePlayer = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const ownerId = req.user.id;
    const teamId = (_a = req.params) === null || _a === void 0 ? void 0 : _a.teamId;
    const { playerId } = req === null || req === void 0 ? void 0 : req.body;
    const result = yield teamsService.removePlayer(ownerId, teamId, playerId);
    res.status(200).json({
        success: true,
        message: "player remove successfully successfully",
        data: result
    });
}));
export const TeamController = {
    createTeam,
    updateTeam,
    allTeams,
    myTeam,
    assignCaptain,
    removePlayer
};
//# sourceMappingURL=team.controller.js.map