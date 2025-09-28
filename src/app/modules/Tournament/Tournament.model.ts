import { model, Schema } from "mongoose";
import type { ITournament } from "./Tournament.interface.js";

const tournamentSchema = new Schema<ITournament>({
     name: { type: String, required: true },
     type: { type: String, enum: ["Standing", "Knockout"], default: "Standing" },
     price: { type: Number, default: 0 },
     location: {
          lat: { type: Number, required: true },
          lng: { type: Number, required: true },
     },
     startDate: { type: Date, required: true },
     duration: { type: Number, required: true },
     fieldSize: { type: Number, enum: [5, 7, 11], default: 5 },
     teams: [{ type: Schema.Types.ObjectId, ref: "Team" }],
     qualifiedTeams: [{ type: Schema.Types.ObjectId, ref: "Team" }],
     winner: { type: Schema.Types.ObjectId, ref: "Team", default: null },
     maxTeam: { type: Number, default: 16 },
     imageUrl: { type: String }

});

export const TournamentModel = model<ITournament>("Tournament", tournamentSchema);