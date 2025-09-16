import { model, Schema, Types } from "mongoose";
const inviteSchema = new Schema({
    team: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "Players", required: true },
    receiver: { type: Schema.Types.ObjectId, ref: "Players", required: true },
    status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
    message: { type: String },
}, { timestamps: true });
export const InviteModel = model("Invite", inviteSchema);
//# sourceMappingURL=notification.model.js.map