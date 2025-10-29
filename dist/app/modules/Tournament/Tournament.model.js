import { model, Schema } from "mongoose";
const tournamentSchema = new Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ["Standing", "Knockout"], default: "Standing" },
    price: { type: Number, default: 0 },
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
        address: { type: String, required: true },
    },
    startDate: { type: Date, required: true },
    duration: { type: Number, required: true },
    fieldSize: { type: Number, enum: [5, 8, 7, 9, 11], default: 5 },
    teams: [{ type: Schema.Types.ObjectId, ref: "Team" }],
    qualifiedTeams: [{ type: Schema.Types.ObjectId, ref: "Team" }],
    winner: { type: Schema.Types.ObjectId, ref: "Team", default: null },
    maxTeam: { type: Number, default: 16 },
    status: { type: String, enum: ["active", "block"], default: "active" },
    imageUrl: { type: String }
});
export const TournamentModel = model("Tournament", tournamentSchema);
//# sourceMappingURL=Tournament.model.js.map