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
     const result = await TournamentModel.find().populate("winner qualifiedTeams teams organizer")
     return result
}
const organizerTournament = async (id:string) => {
     const result = await TournamentModel.find({organizer:id}).populate("winner qualifiedTeams teams organizer")
     return result
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
     const result = await TournamentModel.findByIdAndDelete(id)
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


const getTopPlayers = async (tournamentId: string) => {
     const topPlayers = await MatchModel.aggregate([
          {
               $match: {
                    tournament: new Types.ObjectId(tournamentId),
                    status: "Completed"
               }
          },

          // teamAPlayers + teamBPlayers merge
          {
               $project: {
                    players: {
                         $concatArrays: ["$teamAPlayers", "$teamBPlayers"]
                    }
               }
          },

          { $unwind: "$players" },

          // guest player বাদ
          {
               $match: {
                    "players.guest_player": false
               }
          },

          // group by playerId
          {
               $group: {
                    _id: "$players.playerId",
                    avgRating: { $avg: "$players.rating" },
                    totalMatches: { $sum: 1 }
               }
          },

          // highest rating first
          { $sort: { avgRating: -1 } },

          // top 10
          { $limit: 10 },

          // player info populate
          {
               $lookup: {
                    from: "players",
                    localField: "_id",
                    foreignField: "_id",
                    as: "player"
               }
          },

          { $unwind: "$player" },

          {
               $project: {
                    _id: 0,
                    playerId: "$player._id",
                    name: "$player.name",
                    image: "$player.image",
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

