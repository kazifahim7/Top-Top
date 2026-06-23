import { isValidObjectId, Types } from "mongoose";
import AppError from "../../Error/AppError.js";
import { TeamModel } from "./team.model.js";
import { InviteModel } from "../Notification/notification.model.js";
import { LobbyModel } from "../Lobby/lobby.model.js";
import { MatchModel } from "../TournamentMatch/match.model.js";
import { userModel } from "../auth/auth.model.js";
const createTeam = async (payload, owner) => {
    const isTeamOwnerHasATeam = await TeamModel.findOne({ teamOwner: owner });
    if (isTeamOwnerHasATeam) {
        throw new AppError(403, "you already has a team");
    }
    payload.teamOwner = owner;
    const result = await TeamModel.create(payload);
    return result;
};
const updateTeam = async (payload, id, requesterId, requesterRole) => {
    const isTeamExist = await TeamModel.findById(id);
    if (!isTeamExist) {
        throw new AppError(404, "This team not found");
    }
    // ✅ Owner 
    const isOwner = isTeamExist.teamOwner.toString() === requesterId;
    const isAdmin = requesterRole === "admin";
    if (!isOwner && !isAdmin) {
        throw new AppError(403, "You are not authorized to update this team");
    }
    const result = await TeamModel.findByIdAndUpdate(id, payload, { new: true });
    return result;
};
function calculateTeamRating(team) {
    if (!team)
        return 0;
    const members = [...(team.players || []), team.teamOwner].filter(Boolean);
    if (members.length === 0)
        return 0;
    const totalRating = members.reduce((sum, member) => {
        const rating = typeof member === "object" ? (member.rating || 0) : 0;
        return sum + rating;
    }, 0);
    return parseFloat((totalRating / members.length).toFixed(2));
}
const allTeams = async () => {
    const result = await TeamModel.find()
        .populate("players")
        .populate("teamOwner")
        .populate("teamCaptain");
    const teamsWithRatings = result.map(team => {
        const teamObj = team.toObject();
        return { ...teamObj, rating: calculateTeamRating(team) };
    });
    return teamsWithRatings;
};
const myTeam = async (id) => {
    const myTeam = await TeamModel.findOne({ teamOwner: new Types.ObjectId(id) })
        .populate("players")
        .populate("teamOwner")
        .populate("teamCaptain");
    if (!myTeam) {
        return {
            myTeam: null,
            myTeamRating: 0,
            upcomingMatch: [],
            upcomingMatchTournament: [],
            completeMatch: [],
            completeMatchTournament: [],
            media: []
        };
    }
    const teamId = myTeam._id;
    const rating = calculateTeamRating(myTeam);
    // ── FIX: deleted lobby exclude in aggregate $match ──────────
    const getLobbyMatches = async (status) => {
        return await LobbyModel.aggregate([
            {
                $match: {
                    isDelete: { $ne: true },
                    $or: [
                        { "team1.teamId": teamId },
                        { "team2.teamId": teamId },
                    ],
                    lobbyStatus: status
                }
            },
            {
                $lookup: {
                    from: "teams", localField: "team1.teamId", foreignField: "_id", as: "team1Data"
                }
            },
            { $unwind: { path: "$team1Data", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "teams", localField: "team2.teamId", foreignField: "_id", as: "team2Data"
                }
            },
            { $unwind: { path: "$team2Data", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "players", localField: "team1Data.players", foreignField: "_id", as: "team1Players"
                }
            },
            {
                $lookup: {
                    from: "players", localField: "team2Data.players", foreignField: "_id", as: "team2Players"
                }
            },
            {
                $lookup: {
                    from: "players", localField: "organizer", foreignField: "_id", as: "organizerData"
                }
            },
            { $unwind: { path: "$organizerData", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "players",
                    let: { playerIds: { $ifNull: ["$defaultTeam1.players.playerId", []] } },
                    pipeline: [{ $match: { $expr: { $in: ["$_id", "$$playerIds"] } } }],
                    as: "defaultTeam1Players"
                }
            },
            {
                $lookup: {
                    from: "players",
                    let: { playerIds: { $ifNull: ["$defaultTeam2.players.playerId", []] } },
                    pipeline: [{ $match: { $expr: { $in: ["$_id", "$$playerIds"] } } }],
                    as: "defaultTeam2Players"
                }
            },
            { $sort: status === "ongoing" ? { date: 1 } : { date: -1 } }
        ]);
    };
    const upcomingMatch = await getLobbyMatches("ongoing");
    const completeMatch = await getLobbyMatches("completed");
    // ── FIX: deleted tournament-er match exclude ──────────────────
    const rawUpcomingMatchTournament = await MatchModel.find({
        $or: [{ teamA: teamId }, { teamB: teamId }],
        status: "Pending"
    })
        .populate({ path: "tournament", match: { isDelete: { $ne: true } } })
        .populate("teamA")
        .populate("teamB")
        .sort({ date: 1 });
    const upcomingMatchTournament = rawUpcomingMatchTournament.filter((m) => m.tournament !== null);
    const rawCompleteMatchTournament = await MatchModel.find({
        $or: [{ teamA: teamId }, { teamB: teamId }],
        status: "Completed"
    })
        .populate({ path: "tournament", match: { isDelete: { $ne: true } } })
        .populate("teamA")
        .populate("teamB")
        .sort({ date: -1 });
    const completeMatchTournament = rawCompleteMatchTournament.filter((m) => m.tournament !== null);
    const allMedia = [
        ...completeMatch.flatMap((match) => match.media || []),
        ...completeMatchTournament.flatMap((match) => match.media || [])
    ];
    return {
        myTeam,
        myTeamRating: rating,
        upcomingMatch,
        upcomingMatchTournament,
        completeMatch,
        completeMatchTournament,
        media: allMedia
    };
};
const singleTeam = async (id) => {
    const myTeam = await TeamModel.findOne({ _id: new Types.ObjectId(id) })
        .populate("players")
        .populate("teamOwner")
        .populate("teamCaptain");
    if (!myTeam) {
        return {
            myTeam: null,
            myTeamRating: 0,
            upcomingMatch: [],
            upcomingMatchTournament: [],
            completeMatch: [],
            completeMatchTournament: [],
            media: []
        };
    }
    const teamId = myTeam._id;
    const rating = calculateTeamRating(myTeam);
    // ── FIX: deleted lobby exclude ──────────────────
    const getLobbyMatches = async (status) => {
        return await LobbyModel.aggregate([
            {
                $match: {
                    isDelete: { $ne: true },
                    $or: [
                        { "team1.teamId": teamId },
                        { "team2.teamId": teamId },
                    ],
                    lobbyStatus: status
                }
            },
            {
                $lookup: { from: "teams", localField: "team1.teamId", foreignField: "_id", as: "team1Data" }
            },
            { $unwind: { path: "$team1Data", preserveNullAndEmptyArrays: true } },
            {
                $lookup: { from: "teams", localField: "team2.teamId", foreignField: "_id", as: "team2Data" }
            },
            { $unwind: { path: "$team2Data", preserveNullAndEmptyArrays: true } },
            {
                $lookup: { from: "players", localField: "team1Data.players", foreignField: "_id", as: "team1Players" }
            },
            {
                $lookup: { from: "players", localField: "team2Data.players", foreignField: "_id", as: "team2Players" }
            },
            {
                $lookup: { from: "players", localField: "organizer", foreignField: "_id", as: "organizerData" }
            },
            { $unwind: { path: "$organizerData", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "players",
                    let: { playerIds: { $ifNull: ["$defaultTeam1.players.playerId", []] } },
                    pipeline: [{ $match: { $expr: { $in: ["$_id", "$$playerIds"] } } }],
                    as: "defaultTeam1Players"
                }
            },
            {
                $lookup: {
                    from: "players",
                    let: { playerIds: { $ifNull: ["$defaultTeam2.players.playerId", []] } },
                    pipeline: [{ $match: { $expr: { $in: ["$_id", "$$playerIds"] } } }],
                    as: "defaultTeam2Players"
                }
            },
            { $sort: status === "ongoing" ? { date: 1, time: 1 } : { date: -1, time: -1 } }
        ]);
    };
    const upcomingMatch = await getLobbyMatches("ongoing");
    const completeMatch = await getLobbyMatches("completed");
    // ── FIX: deleted tournament-er match exclude ──────────────────
    const rawUpcomingMatchTournament = await MatchModel.find({
        $or: [{ teamA: teamId }, { teamB: teamId }],
        status: "Pending"
    })
        .populate({ path: "tournament", match: { isDelete: { $ne: true } } })
        .populate("teamA")
        .populate("teamB");
    const upcomingMatchTournament = rawUpcomingMatchTournament.filter((m) => m.tournament !== null);
    const rawCompleteMatchTournament = await MatchModel.find({
        $or: [{ teamA: teamId }, { teamB: teamId }],
        status: "Completed"
    })
        .populate({ path: "tournament", match: { isDelete: { $ne: true } } })
        .populate("teamA")
        .populate("teamB");
    const completeMatchTournament = rawCompleteMatchTournament.filter((m) => m.tournament !== null);
    const allMedia = [
        ...completeMatch.flatMap((match) => match.media || []),
        ...completeMatchTournament.flatMap((match) => match.media || [])
    ];
    return {
        myTeam,
        myTeamRating: rating,
        upcomingMatch,
        upcomingMatchTournament,
        completeMatch,
        completeMatchTournament,
        media: allMedia
    };
};
const assignCaptain = async (ownerId, teamId, captainId, userRole) => {
    if (!captainId || !isValidObjectId(captainId)) {
        throw new AppError(400, "Valid Captain ID is required");
    }
    if (!isValidObjectId(teamId)) {
        throw new AppError(400, "Valid Team ID is required");
    }
    const team = await TeamModel.findById(teamId);
    if (!team) {
        throw new AppError(404, "Team not found");
    }
    if (userRole === "player" && team.teamOwner.toString() !== ownerId) {
        throw new AppError(403, "You are not allowed to assign captains");
    }
    const isTeamMember = team.players.some(p => p.toString() === captainId);
    if (!isTeamMember) {
        throw new AppError(400, "This player is not a member of the team");
    }
    // if (team.teamOwner.toString() === captainId) {
    //      throw new AppError(400, "Team owner cannot be assigned as captain");
    // }
    if (team.teamCaptain.some(c => c.toString() === captainId)) {
        throw new AppError(400, "This player is already a captain");
    }
    if (team.teamCaptain.length >= 3) {
        throw new AppError(400, "Team already has 3 captains. Cannot assign more.");
    }
    team.teamCaptain.push(new Types.ObjectId(captainId));
    await team.save();
    return await team.populate("players teamOwner teamCaptain");
};
const removePlayer = async (ownerId, teamId, playerId) => {
    const team = await TeamModel.findById(teamId);
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
    if (team.teamCaptain.some(c => c.toString() === playerId)) {
        await TeamModel.findByIdAndUpdate(teamId, { $pull: { teamCaptain: new Types.ObjectId(playerId) } }, { new: true });
    }
    // remove invitation
    await InviteModel.findOneAndDelete({
        receiver: new Types.ObjectId(playerId)
    });
    // Remove the player
    const updatedTeam = await TeamModel.findByIdAndUpdate(teamId, { $pull: { players: new Types.ObjectId(playerId) } }, { new: true })
        .populate("players")
        .populate("teamOwner")
        .populate("teamCaptain");
    return updatedTeam;
};
const invitePlayer = async (ownerId, teamId, playerId, message) => {
    const team = await TeamModel.findById(teamId);
    const isUserExist = await userModel.findById(playerId);
    if (team?.players.some((player) => player.toString() === playerId)) {
        throw new AppError(400, "this player are already available in your team");
    }
    if (!isUserExist) {
        throw new AppError(400, "this player are not available");
    }
    if (!team) {
        throw new AppError(400, "Team is not Found");
    }
    if (team?.teamOwner.toString() !== ownerId) {
        throw new AppError(400, "you can not send invite");
    }
    // Prevent owner inviting themselves
    if (ownerId === playerId) {
        throw new AppError(400, "Owner cannot invite themselves");
    }
    const alreadyRequestSend = await InviteModel.findOne({
        team: new Types.ObjectId(teamId),
        sender: new Types.ObjectId(ownerId),
        receiver: new Types.ObjectId(playerId)
    });
    if (alreadyRequestSend) {
        throw new AppError(400, "Already request send!");
    }
    // Create invite in database
    const invite = await InviteModel.create({
        team: new Types.ObjectId(teamId),
        sender: new Types.ObjectId(ownerId),
        receiver: new Types.ObjectId(playerId),
        message,
    });
    // Push Notification (pseudo-code)
    // You can integrate Firebase Cloud Messaging (FCM) or OneSignal
    // sendPushNotification(receiverId, `You have a new invite to join ${team.teamName}`);
    return invite;
};
const acceptInvite = async (inviteId, requesterId) => {
    const invite = await InviteModel.findById(inviteId);
    if (!invite) {
        throw new AppError(404, "This request not found");
    }
    // ✅ Invite এর receiver এবং requester একই কিনা check
    if (invite.receiver.toString() !== requesterId) {
        throw new AppError(403, "You are not authorized to accept this invite");
    }
    const team = await TeamModel.findById(invite.team);
    if (!team) {
        throw new AppError(404, "Team not found");
    }
    const playerTeams = await TeamModel.find({ players: invite.receiver });
    if (playerTeams.length >= 2) {
        throw new AppError(400, "This player already belongs to 2 teams. Cannot join more.");
    }
    const alreadyInTeam = team.players.some((p) => p.toString() === invite.receiver.toString());
    if (alreadyInTeam) {
        throw new AppError(400, "This player is already in this team");
    }
    team.players.push(new Types.ObjectId(invite.receiver));
    const result = await team.save();
    await InviteModel.findByIdAndUpdate(inviteId, { status: "accepted" }, { new: true });
    return await result.populate("players teamOwner teamCaptain");
};
const rejectInvite = async (inviteId, requesterId) => {
    const invite = await InviteModel.findById(inviteId);
    if (!invite) {
        throw new AppError(404, "This request not found");
    }
    // ✅ Invite এর receiver এবং requester একই কিনা check
    if (invite.receiver.toString() !== requesterId) {
        throw new AppError(403, "You are not authorized to reject this invite");
    }
    const result = await InviteModel.findByIdAndUpdate(inviteId, { status: "rejected" }, { new: true });
    return result;
};
const myRequest = async (userId) => {
    const result = await InviteModel.find({ receiver: userId })
        .populate("sender")
        .populate("receiver").populate("team")
        .sort({ createdAt: -1 });
    if (!result || result.length === 0) {
        return [];
    }
    return result;
};
const deleteTeam = async (id, requesterId, requesterRole) => {
    const isTeamExist = await TeamModel.findById(id);
    if (!isTeamExist) {
        throw new AppError(404, "This team not found");
    }
    const isOwner = isTeamExist.teamOwner.toString() === requesterId;
    const isAdmin = requesterRole === "admin";
    if (!isOwner && !isAdmin) {
        throw new AppError(403, "You are not authorized to delete this team");
    }
    return await TeamModel.findByIdAndDelete(id);
};
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
    myRequest,
    deleteTeam,
    singleTeam
};
//# sourceMappingURL=teams.service.js.map