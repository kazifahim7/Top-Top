import { Types } from "mongoose";
import AppError from "../../Error/AppError.js";
import type { TTeam } from "./team.interface.js";
import { TeamModel } from "./team.model.js";

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


export const teamsService = {
     createTeam,
     updateTeam,
     allTeams,
     myTeam,
     assignCaptain,
     removePlayer
}