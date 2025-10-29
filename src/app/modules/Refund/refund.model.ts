import { model, Schema } from "mongoose";
import type { TRefund } from "./refund.interface.js";

const refundSchema = new Schema<TRefund>(
     {
          lobbyId: { type: Schema.Types.ObjectId, ref: "Lobby", required: true },
          playerId: { type: Schema.Types.ObjectId, ref: "Players", required: true },
          price: { type: Number, required: true },
          status: {
               type: String,
               enum: ["pending", "accept"],
               default: "pending",
          },
     },
     { timestamps: true }
);

export const RefundModel = model<TRefund>("Refund", refundSchema);