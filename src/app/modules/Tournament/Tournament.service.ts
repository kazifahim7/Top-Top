import { Types } from "mongoose";
import AppError from "../../Error/AppError.js";
import type { ITournament } from "./Tournament.interface.js";
import { TournamentModel } from "./Tournament.model.js";
import { MatchModel } from "../TournamentMatch/match.model.js";

const createTournament = async (payload: ITournament) => {
     const result = await TournamentModel.create(payload)
     return result;
}


const singleTournament = async (id: string) => {
     const result = await TournamentModel.findById(id).populate("winner qualifiedTeams teams organizer")
     return result

}

const allTournament = async () => {
     const result = await TournamentModel.find({status:{$ne:"inactive"}})
          .populate("winner")
          .populate("qualifiedTeams")
          .populate("teams")
          .populate("organizer").sort({ createdAt: -1 });
          
     return result;
}

const organizerTournament = async (id: string) => {
     const result = await TournamentModel.find({
          organizer: id,
          status: { $in: ["active", "block"] } 
     })
          .populate("winner qualifiedTeams teams organizer")
          .sort({ status: 1, createdAt: -1 }); 

     return result;
}


const updateTournament = async (id: string, payload: Partial<ITournament>) => {
     const isTournamentIsExists = await TournamentModel.findById(id)
     if (!isTournamentIsExists) {
          throw new AppError(404, "this tournament is not found");

     }
     const result = await TournamentModel.findByIdAndUpdate(id, payload, { new: true })
     return result;
}

const deleteTournament = async (id: string) => {
     const isTournamentIsExists = await TournamentModel.findById(id)
     if (!isTournamentIsExists) {
          throw new AppError(404, "this tournament is not found");

     }
     const result = await TournamentModel.findByIdAndUpdate(id,{status:"inactive"},{new:true})
     return result;
}
 const qualifyTeamsService = async (tournamentId: string, teamIds: string[]) => {
   
     const tournament = await TournamentModel.findById(tournamentId);
     if (!tournament) {
          throw new AppError(404,"Tournament not found");
     }

     
     const currentQualified = tournament.qualifiedTeams.map((id) => id.toString());

     const uniqueTeams = teamIds.filter(
          (id) => !currentQualified.includes(id.toString())
     );

     if (uniqueTeams.length === 0) {
          throw new AppError(403,"All teams already qualified or invalid");
     }

  
     tournament.qualifiedTeams.push(...uniqueTeams.map((id) => new Types.ObjectId(id)));

     await tournament.save();

     return tournament;
};


export const getTopPlayers = async (tournamentId: string) => {
     const topPlayers = await MatchModel.aggregate([

          // ✅ only completed matches of this tournament
          {
               $match: {
                    tournament: new Types.ObjectId(tournamentId),
                    status: "Completed"
               }
          },

          // ✅ merge both team players arrays
          {
               $project: {
                    players: {
                         $concatArrays: ["$teamAPlayers", "$teamBPlayers"]
                    }
               }
          },

          // ✅ flatten players
          { $unwind: "$players" },

          // ✅ remove guest players
          {
               $match: {
                    "players.guest_player": false
               }
          },

          // ✅ group by playerId
          {
               $group: {
                    _id: "$players.playerId",   // already ObjectId in your schema
                    avgRating: { $avg: "$players.rating" },
                    totalMatches: { $sum: 1 }
               }
          },

          // ✅ sort by rating
          { $sort: { avgRating: -1 } },

          // ✅ top 10
          { $limit: 10 },

          // ✅ lookup player profile
          {
               $lookup: {
                    from: "players", // collection name from model('Players')
                    localField: "_id",
                    foreignField: "_id",
                    as: "player"
               }
          },

          // ✅ unwind populated player
          {
               $unwind: {
                    path: "$player",
                    preserveNullAndEmptyArrays: false
               }
          },

          // ✅ final output shape
          {
               $project: {
                    _id: 0,
                    playerId: "$player._id",
                    name: "$player.FullName",
                    userName: "$player.userName",
                    image: "$player.imageUrl",
                    position: "$player.position",
                    avgRating: { $round: ["$avgRating", 2] },
                    totalMatches: 1
               }
          }

     ]);

     return topPlayers;
};



export const TournamentService = {
     createTournament,
     singleTournament,
     allTournament,
     updateTournament,
     deleteTournament,
     qualifyTeamsService,
     getTopPlayers,
     organizerTournament
}

