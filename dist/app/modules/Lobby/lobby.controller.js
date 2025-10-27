import catchAsync from "../../utils/catcgAsync.js";
import { lobbyService } from "./lobby.services.js";
import { getLocalImageURL } from "../../utils/multer.js";
const createMatch = catchAsync(async (req, res) => {
    const data = req.body;
    const id = req.user?.id;
    const result = await lobbyService.createMatch(data, id);
    res.status(200).json({
        success: true,
        message: "Lobby created created successfully",
        data: result
    });
});
const allMatch = catchAsync(async (req, res) => {
    const query = req.query;
    const result = await lobbyService.allMatch(query);
    res.status(200).json({
        success: true,
        message: "All lobby successfully",
        data: result
    });
});
const updatePlayerState = catchAsync(async (req, res) => {
    const data = req.body;
    data.lobbyId = req.params?.lobbyId;
    const result = await lobbyService.updatePlayerStats(data);
    res.status(200).json({
        success: true,
        message: "updated successfully",
        data: result
    });
});
const lobbyInFo = catchAsync(async (req, res) => {
    const id = req.params?.lobbyId;
    const data = req.body;
    const imageFiles = req.files.images || [];
    for (const file of imageFiles) {
        const url = getLocalImageURL(file.filename);
        data.media = url;
    }
    const result = await lobbyService.updateLobbyInfo(id, data);
    res.status(200).json({
        success: true,
        message: "lobby  update successfully ",
        data: result
    });
});
export const lobbyController = {
    createMatch,
    allMatch,
    updatePlayerState,
    lobbyInFo
};
//# sourceMappingURL=lobby.controller.js.map