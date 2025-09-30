import { Schema, model, Types } from "mongoose";
const matchSchema = new Schema({
    tournament: { type: Schema.Types.ObjectId, ref: "Tournament", required: true },
    // League or Knockout
    stage: {
        type: String,
        enum: ["League", "Knockout"],
        default: "League"
    },
    // Match round (for Knockout and League)
    group: {
        type: String,
        enum: [
            "GroupMatch",
            "QuarterFinal1",
            "QuarterFinal2",
            "QuarterFinal3",
            "QuarterFinal4",
            "SemiFinal1",
            "SemiFinal2",
            "Final"
        ],
        default: "GroupMatch"
    },
    teamA: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    teamB: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    scoreA: { type: Number, default: 0 },
    scoreB: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ["Pending", "Completed"],
        default: "Pending"
    },
    winner: { type: Schema.Types.ObjectId, ref: "Team", default: null },
});
export const MatchModel = model("Match", matchSchema);
//# sourceMappingURL=match.model.js.map