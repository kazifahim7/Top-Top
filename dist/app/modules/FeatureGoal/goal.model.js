import { model, Schema } from "mongoose";
const goalSchema = new Schema({
    goalTitle: {
        type: String,
        required: true,
    },
    goalBy: {
        type: Schema.Types.ObjectId,
        ref: "Players"
    },
    goalLink: {
        type: String,
        required: true,
    },
    isScheduled: {
        type: Boolean,
        default: false,
    },
    scheduledDate: {
        type: Date,
        default: null,
    },
    status: {
        type: String,
        enum: ["pending", "active", "completed"],
        default: "pending",
    },
}, { timestamps: true });
export const GoalModel = model("Goal", goalSchema);
//# sourceMappingURL=goal.model.js.map