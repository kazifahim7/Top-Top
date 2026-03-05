import { Types } from "mongoose";
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
const updateTeam = async (payload, id) => {
    const isTeamIsExist = await TeamModel.findById(id);
    if (!isTeamIsExist) {
        throw new AppError(404, "This team not found");
    }
    const result = await TeamModel.findByIdAndUpdate(id, payload, { new: true });
    return result;
};
const allTeams = async () => {
    const result = await TeamModel.find().populate("players")
        .populate("teamOwner")
        .populate("teamCaptain");
    return result;
};
function calculateTeamRating(team) {
    if (team.totalMatch === 0)
        return 0;
    const winRate = team.win / team.totalMatch;
    const drawRate = team.draw / team.totalMatch;
    const goalDiff = team.goal - team.carryGoal;
    // Base score (0-10)
    let rating = winRate * 5 + // জেতার হার (max 5)
        drawRate * 1.5 + // ড্র এর হার (max 1.5)
        Math.min(goalDiff / team.totalMatch, 1) * 2 + // গোল পার্থক্য (max 2)
        Math.min(team.totalMatch / 20, 1) * 1.5; // অভিজ্ঞতা (max 1.5)
    // 0-10 এর মধ্যে রাখো
    rating = Math.max(0, Math.min(10, rating));
    // ২ দশমিক পর্যন্ত
    return parseFloat(rating.toFixed(2));
}
const myTeam = async (id) => {
    // First get the team where this user is the owner
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
            media: [] // Empty media array when no team found
        };
    }
    const teamId = myTeam._id;
    const rating = calculateTeamRating(myTeam);
    // Helper function to get matches with proper population
    const getLobbyMatches = async (status) => {
        return await LobbyModel.aggregate([
            {
                $match: {
                    $or: [
                        { "team1.teamId": teamId },
                        { "team2.teamId": teamId },
                    ],
                    lobbyStatus: status
                }
            },
            {
                $lookup: {
                    from: "teams",
                    localField: "team1.teamId",
                    foreignField: "_id",
                    as: "team1Data"
                }
            },
            { $unwind: { path: "$team1Data", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "teams",
                    localField: "team2.teamId",
                    foreignField: "_id",
                    as: "team2Data"
                }
            },
            { $unwind: { path: "$team2Data", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "players",
                    localField: "team1Data.players",
                    foreignField: "_id",
                    as: "team1Players"
                }
            },
            {
                $lookup: {
                    from: "players",
                    localField: "team2Data.players",
                    foreignField: "_id",
                    as: "team2Players"
                }
            },
            {
                $lookup: {
                    from: "players",
                    localField: "organizer",
                    foreignField: "_id",
                    as: "organizerData"
                }
            },
            { $unwind: { path: "$organizerData", preserveNullAndEmptyArrays: true } },
            // For solo matches (default teams)
            {
                $lookup: {
                    from: "players",
                    let: {
                        playerIds: {
                            $ifNull: ["$defaultTeam1.players.playerId", []]
                        }
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $in: ["$_id", "$$playerIds"]
                                }
                            }
                        }
                    ],
                    as: "defaultTeam1Players"
                }
            },
            {
                $lookup: {
                    from: "players",
                    let: {
                        playerIds: {
                            $ifNull: ["$defaultTeam2.players.playerId", []]
                        }
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $in: ["$_id", "$$playerIds"]
                                }
                            }
                        }
                    ],
                    as: "defaultTeam2Players"
                }
            },
            // Sort by date (newest first for completed, upcoming first for ongoing)
            {
                $sort: status === "ongoing" ?
                    { date: 1, time: 1 } : // For upcoming: sort by nearest date
                    { date: -1, time: -1 } // For completed: sort by latest first
            }
        ]);
    };
    // Get upcoming matches (ongoing)
    const upcomingMatch = await getLobbyMatches("ongoing");
    // Get completed matches
    const completeMatch = await getLobbyMatches("completed");
    // Get tournament matches (using your existing MatchModel)
    const upcomingMatchTournament = await MatchModel.find({
        $or: [{ teamA: teamId }, { teamB: teamId }],
        status: "Pending"
    })
        .populate("teamA")
        .populate("teamB")
        .populate("tournament");
    const completeMatchTournament = await MatchModel.find({
        $or: [{ teamA: teamId }, { teamB: teamId }],
        status: "Completed"
    })
        .populate("teamA")
        .populate("teamB")
        .populate("tournament");
    // Extract all media from complete matches and complete tournament matches
    const allMedia = [
        // Get media from regular complete matches
        ...completeMatch.flatMap(match => match.media || []),
        // Get media from tournament complete matches
        ...completeMatchTournament.flatMap(match => match.media || [])
    ];
    return {
        myTeam,
        myTeamRating: rating,
        upcomingMatch,
        upcomingMatchTournament,
        completeMatch,
        completeMatchTournament,
        media: allMedia // Array containing all media URLs from completed matches
    };
};
const singleTeam = async (id) => {
    const myTeam = await TeamModel.findById(id)
        .populate("players")
        .populate("teamOwner")
        .populate("teamCaptain");
    const rating = calculateTeamRating(myTeam);
    return {
        ...myTeam,
        teamRating: rating
    };
};
const assignCaptain = async (ownerId, teamId, captainId) => {
    if (!captainId) {
        throw new AppError(400, "Captain ID is required");
    }
    const team = await TeamModel.findById(teamId);
    if (!team) {
        throw new AppError(404, "Team not found");
    }
    if (team.teamOwner.toString() !== ownerId) {
        throw new AppError(403, "You are not allowed to assign captains");
    }
    if (team.teamCaptain.some(c => c.toString() === captainId)) {
        throw new AppError(400, "This player is already a captain");
    }
    if (team.teamCaptain.length >= 3) {
        throw new AppError(400, "Team already has 3 captains. Cannot assign more.");
    }
    if (team.teamOwner.toString() === captainId) {
        throw new AppError(400, "Team owner cannot be assigned as captain");
    }
    // Assign captain
    team.teamCaptain.push(new Types.ObjectId(captainId));
    await team.save();
    const result = await team.populate("players teamOwner teamCaptain");
    return result;
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
const acceptInvite = async (inviteId) => {
    const invite = await InviteModel.findById(inviteId);
    if (!invite) {
        throw new AppError(404, "This request not found");
    }
    const team = await TeamModel.findById(invite.team);
    if (!team) {
        throw new AppError(404, "Team not found");
    }
    const playerTeams = await TeamModel.find({
        players: invite.receiver,
    });
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
const rejectInvite = async (inviteId) => {
    const isRequestIsExist = await InviteModel.findById(inviteId);
    if (!isRequestIsExist) {
        throw new AppError(404, "This request not found");
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
const DeleteTeam = async (teamId) => {
    const result = await TeamModel.findByIdAndDelete(teamId);
    return result;
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
    DeleteTeam,
    singleTeam
};
//# sourceMappingURL=teams.service.js.map