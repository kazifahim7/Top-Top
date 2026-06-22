import { model, Schema } from "mongoose";
const BookingGuidelinesSchema = new Schema({
    key: { type: String, enum: ["global"], default: "global", unique: true, immutable: true },
    content: { type: String, required: true, trim: false },
}, { timestamps: true });
export const BookingGuidelinesModel = model("BookingGuidelines", BookingGuidelinesSchema);
//# sourceMappingURL=bookingGuidelines.model.js.map