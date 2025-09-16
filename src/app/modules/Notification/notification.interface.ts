import type { Types } from "mongoose";

export type TInvite = {
     team: Types.ObjectId;          
     sender: Types.ObjectId;       
     receiver: Types.ObjectId;     
     status: "pending" | "accepted" | "rejected";
     message?: string;
};