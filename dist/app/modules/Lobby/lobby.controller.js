import catchAsync from "../../utils/catcgAsync.js";
import { lobbyService } from "./lobby.services.js";
import { getLocalImageURL, uploadToS3 } from "../../utils/multer.js";
const createMatch = catchAsync(async (req, res) => {
    const data = req.body;
    const id = req.user?.id;
    const role = req.user?.role;
    const result = await lobbyService.createMatch(data, id, role);
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
const singlelobby = catchAsync(async (req, res) => {
    const query = req.params?.id;
    const result = await lobbyService.singlelobby(query);
    res.status(200).json({
        success: true,
        message: "single lobby successfully",
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
        // const url = getLocalImageURL(file.filename);
        const url = await uploadToS3(file);
        data.media = url;
    }
    const result = await lobbyService.updateLobbyInfo(id, data);
    res.status(200).json({
        success: true,
        message: "lobby  update successfully ",
        data: result
    });
});
const deleteLobby = catchAsync(async (req, res) => {
    const id = req.params?.id;
    const result = await lobbyService.deleteLobby(id);
    res.status(200).json({
        success: true,
        message: "lobby  delete successfully ",
        data: result
    });
});
export const lobbyController = {
    createMatch,
    allMatch,
    updatePlayerState,
    lobbyInFo,
    deleteLobby,
    singlelobby
};
//# sourceMappingURL=lobby.controller.js.map