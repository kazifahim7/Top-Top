import { model, Schema } from "mongoose";
import type { IBookingGuidelines } from "./bookingGuidelines.interface.js";

const BookingGuidelinesSchema = new Schema<IBookingGuidelines>(
     {
          key: { type: String, enum: ["global"], default: "global", unique: true, immutable: true },
          content: { type: String, required: true, trim: false },
     },
     { timestamps: true }
);

export const BookingGuidelinesModel = model<IBookingGuidelines>(
     "BookingGuidelines",
     BookingGuidelinesSchema
);
