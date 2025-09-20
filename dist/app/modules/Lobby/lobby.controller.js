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
import { lobbyService } from "./lobby.services.js";
import { getLocalImageURL } from "../../utils/multer.js";
const createMatch = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const data = req.body;
    const id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const result = yield lobbyService.createMatch(data, id);
    res.status(200).json({
        success: true,
        message: "Lobby created created successfully",
        data: result
    });
}));
const allMatch = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const result = yield lobbyService.allMatch(query);
    res.status(200).json({
        success: true,
        message: "All lobby successfully",
        data: result
    });
}));
const updatePlayerState = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const data = req.body;
    data.lobbyId = (_a = req.params) === null || _a === void 0 ? void 0 : _a.lobbyId;
    const result = yield lobbyService.updatePlayerStats(data);
    res.status(200).json({
        success: true,
        message: "updated successfully",
        data: result
    });
}));
const lobbyInFo = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const id = (_a = req.params) === null || _a === void 0 ? void 0 : _a.lobbyId;
    const data = req.body;
    const imageFiles = req.files.images || [];
    for (const file of imageFiles) {
        const url = getLocalImageURL(file.filename);
        data.media = url;
    }
    const result = yield lobbyService.updateLobbyInfo(id, data);
    res.status(200).json({
        success: true,
        message: "lobby  update successfully ",
        data: result
    });
}));
export const lobbyController = {
    createMatch,
    allMatch,
    updatePlayerState,
    lobbyInFo
};
//# sourceMappingURL=lobby.controller.js.map