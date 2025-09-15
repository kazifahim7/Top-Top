import { Schema, model } from "mongoose";
import type { TTeam } from "./team.interface.js";

const teamSchema = new Schema<TTeam>(
     {
          image: { type: String, required: true },
          teamName: { type: String, required: true },
          userName: { type: String, required: true },
          totalMatch: { type: Number, default: 0 },
          win: { type: Number, default: 0 },
          draw: { type: Number, default: 0 },
          loss: { type: Number, default: 0 },

          players: [
               {
                    type: Schema.Types.ObjectId, 
                    ref: "Players",
                    default:[]
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
                    default:[]
                    
               },
          ],
     },
     {
          timestamps: true,
     }
);



export const TeamModel = model<TTeam>("Team", teamSchema);
