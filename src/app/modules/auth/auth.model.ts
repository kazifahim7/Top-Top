import { model, Schema } from "mongoose";

import { string } from "zod";
import type { TCreateUser } from "./auth.interface.js";


const userSchema = new Schema<TCreateUser>({
     firstName: { type: String, required: true },
     lastName: { type: String, required: true },
     email: { type: String, required: true },
     password: { type: String, required: true },
     role: { type: String, enum: ["admin", "user"], default: "user" },
     isBlocked: { type: String, enum: ["active", "block"], default: "active" },
     address: { type: String }





}, { timestamps: true })

export const userModel = model<TCreateUser>('User', userSchema);