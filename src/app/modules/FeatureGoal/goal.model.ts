import { model, Schema } from "mongoose";
import type { IGoal } from "./goal.interface.js";

const goalSchema = new Schema<IGoal>(
     {
          goalTitle: {
               type: String,
               required: true,
          },
          goalLink: {
               type: String,
               required: true,
          },
          isScheduled: {
               type: Boolean,
               default: false,
          },
          scheduledDate: {
               type: Date,
               default: null,
          },
          status: {
               type: String,
               enum: ["pending", "active", "completed"],
               default: "pending",
          },
     },
     { timestamps: true }
);

export const GoalModel = model<IGoal>("Goal", goalSchema);