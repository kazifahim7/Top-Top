import { model, Schema } from "mongoose";
import type { Payment } from "./payment.interface.js";


const PaymentSchema = new Schema<Payment>(
     {
          lobbyId: { type: Schema.Types.ObjectId, ref: "Lobby", required: true },
          playerId: { type: Schema.Types.ObjectId, ref: "Players", required: true },
          teamId: { type: Schema.Types.ObjectId, ref: "Team" },
          price: { type: Number, required: true },
          matchPosition: { type: String }, 
          status: { type: String, enum: ["pending", "success", "failed","refund"], default: "pending" },
          stripePaymentIntentId: { type: String },
          defaultTeam: { type: String },
          method: { type: String },
          
     },
     { timestamps: true }
);

export const PaymentModel = model<Payment>("Payment", PaymentSchema);