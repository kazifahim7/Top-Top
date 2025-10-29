import { model, Schema } from "mongoose";
import type { Payment } from "./payment.interface.js";


const PaymentSchema = new Schema<Payment>(
     {
          lobbyId: { type: Schema.Types.ObjectId, ref: "Lobby" },
          playerId: { type: Schema.Types.ObjectId, ref: "Players" },
          teamId: { type: Schema.Types.ObjectId, ref: "Team" },
          price: { type: Number, required: true },
          matchPosition: { type: String }, 
          status: { type: String, enum: ["pending", "success", "failed","refund"], default: "pending" },
          paymentType: { type: String, enum: ["team fee" , "tournament fee"], default: "team fee" },
          stripePaymentIntentId: { type: String },
          defaultTeam: { type: String },
          method: { type: String ,default:"online"},
          //tournament part is here kaka
         
               tournamentId: { type: Schema.Types.ObjectId, ref: "Tournament" },
              
          
          
     },
     { timestamps: true }
);

export const PaymentModel = model<Payment>("Payment", PaymentSchema);