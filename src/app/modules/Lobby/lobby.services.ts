import { Types } from "mongoose";
import type { LobbyDocument } from "./lobby.interface.js";
import { LobbyModel } from "./lobby.model.js";
import QueryBuilder from "../../builder/QueryBuilder.js";

const createMatch = async (payload: LobbyDocument, id: string) => {
     if (payload.matchType === "solo") {
          payload.defaultTeam1!.teamName = "Team X"
          payload.defaultTeam2!.teamName = "Team Y"
     }
     payload.organizer = new Types.ObjectId(id)

     const result = await LobbyModel.create(payload)
     return result ;
}

const allMatch = async (query: Record<string, unknown>) => {
     const search = query.searchTerms || "";

     const lobbies = await LobbyModel.aggregate([
     
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

          {
               $lookup: {
                    from: "players",
                    localField: "defaultTeam1.players",
                    foreignField: "_id",
                    as: "defaultTeam1Players"
               }
          },

         
          {
               $lookup: {
                    from: "players",
                    localField: "defaultTeam2.players",
                    foreignField: "_id",
                    as: "defaultTeam2Players"
               }
          },

       
          {
               $match: {
                    $or: [
                         { title: { $regex: search, $options: "i" } },
                         { "team1Data.teamName": { $regex: search, $options: "i" } },
                         { "team2Data.teamName": { $regex: search, $options: "i" } },
                         { "team1Players.name": { $regex: search, $options: "i" } },
                         { "team2Players.name": { $regex: search, $options: "i" } },
                    ]
               }
          }
     ]);

     return lobbies;
};



export const lobbyService = {
     createMatch ,
     allMatch
}