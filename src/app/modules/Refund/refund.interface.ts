import type { Schema, Types } from "mongoose";

export interface TRefund {
     lobbyId: string | Types.ObjectId;
     playerId: string | Types.ObjectId;
     teamId?: string | Types.ObjectId;
     price: number;
     status: "pending" | "accept";
}