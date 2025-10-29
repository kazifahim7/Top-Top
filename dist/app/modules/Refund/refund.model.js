import { model, Schema } from "mongoose";
const refundSchema = new Schema({
    lobbyId: { type: Schema.Types.ObjectId, ref: "Lobby", required: true },
    playerId: { type: Schema.Types.ObjectId, ref: "Players", required: true },
    price: { type: Number, required: true },
    status: {
        type: String,
        enum: ["pending", "accept"],
        default: "pending",
    },
}, { timestamps: true });
export const RefundModel = model("Refund", refundSchema);
//# sourceMappingURL=refund.model.js.map