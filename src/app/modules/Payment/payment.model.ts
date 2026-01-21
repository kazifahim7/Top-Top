import { model, Schema } from "mongoose";
import type { Payment } from "./payment.interface.js";
import { boolean } from "zod";


const PaymentSchema = new Schema<Payment>(
     {
          lobbyId: { type: Schema.Types.ObjectId, ref: "Lobby" },
          playerId: { type: Schema.Types.ObjectId, ref: "Players" },
          ExtraPlayerId: { type: Schema.Types.ObjectId, ref: "Players" },
          teamId: { type: Schema.Types.ObjectId, ref: "Team" },
          price: { type: Number, required: true },
          guest_player:{type:Boolean,default:false},
          matchPosition: {
               type: String,
               enum: [
                   
                    "Goalkeeper",

                    // Defenders
                    "Center Back",
                    "Left Back",
                    "Right Back",
                    "Sweeper",
                    "Wing Back",

                    // Midfielders
                    "Defensive Midfielder",
                    "Central Midfielder",
                    "Attacking Midfielder",
                    "Left Midfielder",
                    "Right Midfielder",

                    // Forwards / Attackers
                    "Striker",
                    "Center Forward",
                    "Second Striker",
                    "Left Winger",
                    "Right Winger",
               ]
          },

          status: { type: String, enum: ["pending", "success", "failed","refund"], default: "pending" },
          paymentType: { type: String, enum: ["team fee" , "tournament fee"], default: "team fee" },
          stripePaymentIntentId: { type: String },
          defaultTeam: { type: String },
          method: { type: String ,default:"online"},
          matchFormat: { type: String},
          //tournament part is here kaka
         
               tournamentId: { type: Schema.Types.ObjectId, ref: "Tournament" },
              
          
          
     },
     { timestamps: true }
);

export const PaymentModel = model<Payment>("Payment", PaymentSchema);