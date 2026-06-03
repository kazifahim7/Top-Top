import catchAsync from "../../utils/catcgAsync.js";
import { getLocalImageURL, uploadToS3 } from "../../utils/multer.js";
import { teamsService } from "./teams.service.js";
const createTeam = catchAsync(async (req, res) => {
    const data = req.body;
    const id = req.user?.id;
    const imageFiles = req.files.images || [];
    for (const file of imageFiles) {
        // const url = getLocalImageURL(file.filename);
        const url = await uploadToS3(file);
        data.image = url;
    }
    const result = await teamsService.createTeam(data, id);
    res.status(200).json({
        success: true,
        message: "Teams created successfully",
        data: result
    });
});
const updateTeam = catchAsync(async (req, res) => {
    const data = req.body;
    const id = req.params?.id;
    const requesterId = req.user?.id;
    const requesterRole = req.user?.role;
    const imageFiles = req.files?.images || [];
    for (const file of imageFiles) {
        const url = await uploadToS3(file);
        data.image = url;
    }
    // ✅ requesterId এবং requesterRole service এ পাঠানো হচ্ছে
    const result = await teamsService.updateTeam(data, id, requesterId, requesterRole);
    res.status(200).json({
        success: true,
        message: "Team updated successfully",
        data: result
    });
});
const allTeams = catchAsync(async (req, res) => {
    const result = await teamsService.allTeams();
    res.status(200).json({
        success: true,
        message: "All Teams landed  successfully",
        data: result
    });
});
const myTeam = catchAsync(async (req, res) => {
    const id = req.user.id;
    const result = await teamsService.myTeam(id);
    res.status(200).json({
        success: true,
        message: "My Teams landed  successfully",
        data: result
    });
});
const singleTeam = catchAsync(async (req, res) => {
    const id = req.params.id;
    const result = await teamsService.singleTeam(id);
    res.status(200).json({
        success: true,
        message: " Teams landed  successfully",
        data: result
    });
});
const assignCaptain = catchAsync(async (req, res) => {
    const ownerId = req.user.id;
    const userRole = req.user.role;
    const teamId = req.params?.teamId;
    const { captainId } = req?.body;
    const result = await teamsService.assignCaptain(ownerId, teamId, captainId, userRole // ✅
    );
    res.status(200).json({
        success: true,
        message: "Captain assigned successfully",
        data: result
    });
});
const removePlayer = catchAsync(async (req, res) => {
    const ownerId = req.user.id;
    const teamId = req.params?.teamId;
    const { playerId } = req?.body;
    const result = await teamsService.removePlayer(ownerId, teamId, playerId);
    res.status(200).json({
        success: true,
        message: "player remove successfully successfully",
        data: result
    });
});
const invitePlayer = catchAsync(async (req, res) => {
    const ownerId = req.user.id;
    const teamId = req.params?.teamId;
    const { playerId, message } = req?.body;
    const result = await teamsService.invitePlayer(ownerId, teamId, playerId, message);
    res.status(200).json({
        success: true,
        message: "player invite request send successfully",
        data: result
    });
});
const acceptInvite = catchAsync(async (req, res) => {
    const inviteId = req.params?.inviteId;
    const requesterId = req.user?.id;
    const result = await teamsService.acceptInvite(inviteId, requesterId);
    res.status(200).json({
        success: true,
        message: "Request accepted successfully",
        data: result
    });
});
const rejectInvite = catchAsync(async (req, res) => {
    const inviteId = req.params?.inviteId;
    // ✅ auth middleware থেকে requester এর id নেওয়া হচ্ছে
    const requesterId = req.user?.id;
    const result = await teamsService.rejectInvite(inviteId, requesterId);
    res.status(200).json({
        success: true,
        message: "Request rejected successfully",
        data: result
    });
});
const myRequest = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const result = await teamsService.myRequest(userId);
    res.status(200).json({
        success: true,
        message: "All request  are landed successfully",
        data: result
    });
});
const DeleteTeam = catchAsync(async (req, res) => {
    const teamId = req.params.id;
    const requesterId = req.user?.id;
    const requesterRole = req.user?.role;
    const result = await teamsService.deleteTeam(teamId, requesterId, requesterRole);
    res.status(200).json({
        success: true,
        message: "Team deleted successfully",
        data: result
    });
});
export const TeamController = {
    createTeam,
    updateTeam,
    allTeams,
    myTeam,
    assignCaptain,
    removePlayer,
    invitePlayer,
    acceptInvite,
    rejectInvite,
    myRequest,
    DeleteTeam,
    singleTeam
};
//# sourceMappingURL=team.controller.js.map