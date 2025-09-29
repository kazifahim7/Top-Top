import type { Schema } from "mongoose";

export interface Payment {
     lobbyId?: Schema.Types.ObjectId;
     playerId?: Schema.Types.ObjectId;
     teamId?: Schema.Types.ObjectId;
     price: number;
     matchPosition?: string;
     status: "pending" | "success" | "failed" | "refund";
     stripePaymentIntentId?: string;
     defaultTeam?: string,
     method?: string,
     paymentType:"team fee"|"tournament fee";
   
         
          tournamentId: Schema.Types.ObjectId
   
     createdAt: Date;
     updatedAt: Date;
}