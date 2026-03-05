import { Schema, model, Types } from "mongoose";
import type { IMatch } from "./match.interface.js";
import type { PlayerStats } from "../Lobby/lobby.interface.js";



const PlayerStatsSchema = new Schema<PlayerStats>({
     playerId: { type: Schema.Types.ObjectId, ref: "Players", required: true },
     redCard: { type: Number, default: 0 },
     yellowCard: { type: Number, default: 0 },
     contribution: { type: Number, default: 0 },
     assists: { type: Number, default: 0 },
     goal: { type: Number, default: 0 },
     tackle: { type: Number, default: 0 },
     save: { type: Number, default: 0 },
     goodMoment: { type: Number, default: 0 },
     veryGoodMoment: { type: Number, default: 0 },
     rating: { type: Number, default: 6.5 },
     matchPosition: { type: String },
     guest_player: { type: Boolean, default: false }
});






const matchSchema = new Schema<IMatch>({
     tournament: { type: Schema.Types.ObjectId, ref: "Tournament", required: true },

     // League or Knockout
     stage: {
          type: String,
          enum: ["League", "Knockout", "Both"],
          default: "League"
     },

     group: {
          type: String,
          enum: [
               "LeagueMatch",
               "GroupStage",
               "RoundOf32",
               "RoundOf16",
               "QuarterFinal",
               "SemiFinal",
               "Final"
          ],
          default: "LeagueMatch"
     },

     teamA: { type: Schema.Types.ObjectId, ref: "Team", required: true },
     teamB: { type: Schema.Types.ObjectId, ref: "Team", required: true },
     time: { type: String },
     date: { type: Date },
     teamAPlayers: { type: [PlayerStatsSchema], default: [] },
     teamBPlayers: { type: [PlayerStatsSchema], default: [] },
     scoreA: { type: Number, default: 0 },
     scoreB: { type: Number, default: 0 },

     status: {
          type: String,
          enum: ["Pending", "Completed", "block","start"],
          default: "Pending"
     },
     motm: { type: Schema.Types.ObjectId, ref: "Players" },
     organizer: { type: Schema.Types.ObjectId, ref: "Players" },
     media: { type: [String] },
     team1MatchFormat:{type:String},
     team2MatchFormat: { type: String },
     winner: { type: Schema.Types.ObjectId, ref: "Team", default: null },
     team1AvgMatchRatingBefore: { type: Number, default: 0 },
     team2AvgMatchRatingBefore: { type: Number, default: 0 },
}, {
     timestamps: true
}
);

export const MatchModel = model("Match", matchSchema);
