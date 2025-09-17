import { Schema, model } from "mongoose";
const teamSchema = new Schema({
    image: { type: String, required: true },
    teamName: { type: String, required: true },
    userName: { type: String, required: true },
    totalMatch: { type: Number, default: 0 },
    win: { type: Number, default: 0 },
    draw: { type: Number, default: 0 },
    loss: { type: Number, default: 0 },
    goal: { type: Number, default: 0 },
    carryGoal: { type: Number, default: 0 },
    players: [
        {
            type: Schema.Types.ObjectId,
            ref: "Players",
            default: []
        },
    ],
    teamOwner: {
        type: Schema.Types.ObjectId,
        ref: "Players",
        required: true,
    },
    teamCaptain: [
        {
            type: Schema.Types.ObjectId,
            ref: "Players",
            default: []
        },
    ],
}, {
    timestamps: true,
});
export const TeamModel = model("Team", teamSchema);
//# sourceMappingURL=team.model.js.map