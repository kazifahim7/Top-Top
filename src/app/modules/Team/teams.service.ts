import { Types } from "mongoose";
import AppError from "../../Error/AppError.js";
import type { TTeam } from "./team.interface.js";
import { TeamModel } from "./team.model.js";
import { InviteModel } from "../Notification/notification.model.js";

const createTeam = async (payload: TTeam, owner: any) => {
     const isTeamOwnerHasATeam = await TeamModel.findOne({ teamOwner: owner })
     if (isTeamOwnerHasATeam) {
          throw new AppError(403, "you already has a team");

     }
     payload.teamOwner = owner
     const result = await TeamModel.create(payload)
     return result
}

const updateTeam = async (payload: Partial<TTeam>, id: string) => {

     const isTeamIsExist = await TeamModel.findById(id)
     if (!isTeamIsExist) {
          throw new AppError(404, "This team not found");

     }
     const result = await TeamModel.findByIdAndUpdate(id, payload, { new: true })
     return result

}

const allTeams = async () => {
     const result = await TeamModel.find().populate("players")
          .populate("teamOwner")
          .populate("teamCaptain");
     return result
}
const myTeam = async (id: string) => {

     const result = await TeamModel.findOne({ teamOwner: new Types.ObjectId(id) })
          .populate("players")
          .populate("teamOwner")
          .populate("teamCaptain");


     return result;
};
const assignCaptain = async (ownerId: string, teamId: string, captainId: string) => {

     try {
          const team = await TeamModel.findById(teamId);
          if (!team) {
               throw new AppError(404, "Team not found");
          }


          if (team?.teamOwner.toString() !== ownerId) {
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
          await team.save();

          const result = await team.populate("players teamOwner teamCaptain");

          return result
     } catch (err) {
          throw new AppError(400, "something went wrong bro");

     }


};


const removePlayer = async (ownerId: string, teamId: string, playerId: string) => {
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

     // Prevent removing captain (optional, depends on your rules)
     if (team.teamCaptain.some(c => c.toString() === playerId)) {
          throw new AppError(400, "Cannot remove a captain directly");
     }

     // Remove the player
     const updatedTeam = await TeamModel.findByIdAndUpdate(
          teamId,
          { $pull: { players: new Types.ObjectId(playerId) } },
          { new: true }
     )
          .populate("players")
          .populate("teamOwner")
          .populate("teamCaptain");

     return updatedTeam;
};

const invitePlayer = async (ownerId: string, teamId: string, playerId: string,message:string) => {

     const team = await TeamModel.findById(teamId);
     if (!team){
          throw new AppError(400, "Cannot remove a captain directly");
     } 

     if (team?.teamOwner.toString() !== ownerId) {
          throw new AppError(400, "you can not send invite");
     }

     // Prevent owner inviting themselves
     if (ownerId === playerId) {
          throw new AppError(400, "Owner cannot invite themselves");
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

     return invite ;

}

const acceptInvite = async (inviteId:string)=>{

     const isRequestIsExist = await InviteModel.findById(inviteId)
     if(!isRequestIsExist){
          throw new AppError(404,"This request not found"); 
     }
     const team = await TeamModel.findById(isRequestIsExist.team)

     if (!team) {
          throw new AppError(404, "Team not found");
     }

     team.players.push(new Types.ObjectId(isRequestIsExist.receiver));
    const result = await team.save();
    if(result){
         await InviteModel.findByIdAndUpdate(inviteId, { status:"accepted"},{new:true})
    }
    return result;
}
const rejectInvite = async (inviteId:string)=>{

     const isRequestIsExist = await InviteModel.findById(inviteId)
     if(!isRequestIsExist){
          throw new AppError(404,"This request not found"); 
     }
     const result = await InviteModel.findByIdAndUpdate(inviteId, { status:"rejected"},{new:true})
    return result;
}
const myRequest = async (userId: string) => {
     const result = await InviteModel.find({ receiver: userId })
          .populate("sender")   
          .populate("receiver").populate("team")
          .sort({ createdAt: -1 }); 

     if (!result || result.length === 0) {
          return []; 
     }

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
     myRequest
}