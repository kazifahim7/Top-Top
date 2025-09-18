import type { Schema } from "mongoose";

export interface Payment {
     lobbyId: Schema.Types.ObjectId;
     playerId: Schema.Types.ObjectId;
     teamId?: Schema.Types.ObjectId;
     price: number;
     matchPosition?: string;
     status: "pending" | "success" | "failed";
     stripePaymentIntentId?: string;
     defaultTeam?:string
}