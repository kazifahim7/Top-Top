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
import { TeamModel } from "./team.model.js";
import { InviteModel } from "../Notification/notification.model.js";
const createTeam = (payload, owner) => __awaiter(void 0, void 0, void 0, function* () {
    const isTeamOwnerHasATeam = yield TeamModel.findOne({ teamOwner: owner });
    if (isTeamOwnerHasATeam) {
        throw new AppError(403, "you already has a team");
    }
    payload.teamOwner = owner;
    const result = yield TeamModel.create(payload);
    return result;
});
const updateTeam = (payload, id) => __awaiter(void 0, void 0, void 0, function* () {
    const isTeamIsExist = yield TeamModel.findById(id);
    if (!isTeamIsExist) {
        throw new AppError(404, "This team not found");
    }
    const result = yield TeamModel.findByIdAndUpdate(id, payload, { new: true });
    return result;
});
const allTeams = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield TeamModel.find().populate("players")
        .populate("teamOwner")
        .populate("teamCaptain");
    return result;
});
const myTeam = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield TeamModel.findOne({ teamOwner: new Types.ObjectId(id) })
        .populate("players")
        .populate("teamOwner")
        .populate("teamCaptain");
    return result;
});
const assignCaptain = (ownerId, teamId, captainId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const team = yield TeamModel.findById(teamId);
        if (!team) {
            throw new AppError(404, "Team not found");
        }
        if ((team === null || team === void 0 ? void 0 : team.teamOwner.toString()) !== ownerId) {
            throw new AppError(400, "you can not assigned it");
        }
        if (!captainId) {
            throw new AppError(400, "Captain ID is required");
        }
        if (team.teamCaptain.length >= 3) {
            throw new AppError(400, "Team already has 3 captains. Cannot assign more.");
        }
        // Check if the captainId is the teamOwner
        if (team.teamOwner.toString() === captainId) {
            throw new AppError(400, "Team owner cannot be assigned as captain");
        }
        // Check if the captain is already assigned
        if (team.teamCaptain.includes(new Types.ObjectId(captainId))) {
            throw new AppError(400, "This player is already a captain");
        }
        // Assign new captain
        team.teamCaptain.push(new Types.ObjectId(captainId));
        yield team.save();
        const result = yield team.populate("players teamOwner teamCaptain");
        return result;
    }
    catch (err) {
        throw new AppError(400, "something went wrong bro");
    }
});
const removePlayer = (ownerId, teamId, playerId) => __awaiter(void 0, void 0, void 0, function* () {
    const team = yield TeamModel.findById(teamId);
    if (!team) {
        throw new AppError(404, "Team not found");
    }
    // Check if request is from team owner
    if (team.teamOwner.toString() !== ownerId) {
        throw new AppError(403, "Unauthorized person");
    }
    // Check if player is actually in the team
    if (!team.players.some(p => p.toString() === playerId)) {
        throw new AppError(400, "Player is not in the team");
    }
    // Prevent removing team owner
    if (team.teamOwner.toString() === playerId) {
        throw new AppError(400, "Cannot remove the team owner");
    }
    // Prevent removing captain (optional, depends on your rules)
    if (team.teamCaptain.some(c => c.toString() === playerId)) {
        throw new AppError(400, "Cannot remove a captain directly");
    }
    // Remove the player
    const updatedTeam = yield TeamModel.findByIdAndUpdate(teamId, { $pull: { players: new Types.ObjectId(playerId) } }, { new: true })
        .populate("players")
        .populate("teamOwner")
        .populate("teamCaptain");
    return updatedTeam;
});
const invitePlayer = (ownerId, teamId, playerId, message) => __awaiter(void 0, void 0, void 0, function* () {
    const team = yield TeamModel.findById(teamId);
    if (!team) {
        throw new AppError(400, "Cannot remove a captain directly");
    }
    if ((team === null || team === void 0 ? void 0 : team.teamOwner.toString()) !== ownerId) {
        throw new AppError(400, "you can not send invite");
    }
    // Prevent owner inviting themselves
    if (ownerId === playerId) {
        throw new AppError(400, "Owner cannot invite themselves");
    }
    // Create invite in database
    const invite = yield InviteModel.create({
        team: new Types.ObjectId(teamId),
        sender: new Types.ObjectId(ownerId),
        receiver: new Types.ObjectId(playerId),
        message,
    });
    // Push Notification (pseudo-code)
    // You can integrate Firebase Cloud Messaging (FCM) or OneSignal
    // sendPushNotification(receiverId, `You have a new invite to join ${team.teamName}`);
    return invite;
});
const acceptInvite = (inviteId) => __awaiter(void 0, void 0, void 0, function* () {
    const isRequestIsExist = yield InviteModel.findById(inviteId);
    if (!isRequestIsExist) {
        throw new AppError(404, "This request not found");
    }
    const team = yield TeamModel.findById(isRequestIsExist.team);
    if (!team) {
        throw new AppError(404, "Team not found");
    }
    team.players.push(new Types.ObjectId(isRequestIsExist.receiver));
    const result = yield team.save();
    if (result) {
        yield InviteModel.findByIdAndUpdate(inviteId, { status: "accepted" }, { new: true });
    }
    return result;
});
const rejectInvite = (inviteId) => __awaiter(void 0, void 0, void 0, function* () {
    const isRequestIsExist = yield InviteModel.findById(inviteId);
    if (!isRequestIsExist) {
        throw new AppError(404, "This request not found");
    }
    const result = yield InviteModel.findByIdAndUpdate(inviteId, { status: "rejected" }, { new: true });
    return result;
});
const myRequest = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield InviteModel.find({ receiver: userId })
        .populate("sender")
        .populate("receiver").populate("team")
        .sort({ createdAt: -1 });
    if (!result || result.length === 0) {
        return [];
    }
    return result;
});
export const teamsService = {
    createTeam,
    updateTeam,
    allTeams,
    myTeam,
    assignCaptain,
    removePlayer,
    invitePlayer,
    acceptInvite,
    rejectInvite,
    myRequest
};
//# sourceMappingURL=teams.service.js.map