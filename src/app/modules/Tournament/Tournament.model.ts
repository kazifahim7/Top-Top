import { model, Schema } from "mongoose";
import type { ITournament } from "./Tournament.interface.js";

const tournamentSchema = new Schema<ITournament>({
     name: { type: String, required: true },
     type: { type: String, enum: ["League", "Knockout","Both"], default: "League" },
     price: { type: Number, default: 0 },
     location: {
          lat: { type: Number, required: true },
          lng: { type: Number, required: true },
          address: { type: String, required: true },
     },
     startDate: { type: Date, required: true },
     duration: { type: Number, required: true },
     fieldSize: { type: Number, enum: [5,8, 7,9,10,11], default: 5 },
     teams: [{ type: Schema.Types.ObjectId, ref: "Team" }],
     qualifiedTeams: [{ type: Schema.Types.ObjectId, ref: "Team" }],
     winner: { type: Schema.Types.ObjectId, ref: "Team", default: null },
     maxTeam: { type: Number, default: 16 },
     status: { type: String, enum: ["active", "block","completed","inactive"], default: "active" },
     organizer: { type: Schema.Types.ObjectId, ref: "Players" },
     imageUrl: { type: String }
          
},{
     timestamps:true
}
);

export const TournamentModel = model<ITournament>("Tournament", tournamentSchema);