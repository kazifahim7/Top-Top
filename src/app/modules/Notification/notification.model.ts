import { model, Schema, Types } from "mongoose";
import type { TInvite } from "./notification.interface.js";

const inviteSchema = new Schema<TInvite>(
     {
          team: { type: Schema.Types.ObjectId, ref: "Team", required: true },
          sender: { type: Schema.Types.ObjectId,  ref: "Players", required: true },
          receiver: { type: Schema.Types.ObjectId, ref: "Players", required: true },
          status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
          message: { type: String },
     },
     { timestamps: true }
);

export const InviteModel = model<TInvite>("Invite", inviteSchema);