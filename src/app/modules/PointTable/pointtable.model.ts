import { Schema, model, Types } from "mongoose";

const standingSchema = new Schema({
     tournament: { type: Types.ObjectId, ref: "Tournament", required: true },
     team: { type: Types.ObjectId, ref: "Team", required: true },
     played: { type: Number, default: 0 },
     win: { type: Number, default: 0 },
     draw: { type: Number, default: 0 },
     loss: { type: Number, default: 0 },
     goalsFor: { type: Number, default: 0 },
     goalsAgainst: { type: Number, default: 0 },
     points: { type: Number, default: 0 },
});

export const StandingModel = model("Standing", standingSchema);
