import { model, Schema } from "mongoose";
import { boolean } from "zod";
const PaymentSchema = new Schema({
    lobbyId: { type: Schema.Types.ObjectId, ref: "Lobby" },
    playerId: { type: Schema.Types.ObjectId, ref: "Players" },
    ExtraPlayerId: { type: Schema.Types.ObjectId, ref: "Players" },
    teamId: { type: Schema.Types.ObjectId, ref: "Team" },
    price: { type: Number, required: true },
    currencyCode: { type: String, trim: true, uppercase: true, default: "AED" },
    guest_player: { type: Boolean, default: false },
    matchPosition: {
        type: String,
        enum: [
            "Goalkeeper",
            // Defenders
            "Center Back",
            "Second Center Back",
            "Left Back",
            "Right Back",
            "Sweeper",
            "Wing Back",
            "Second Wing Back",
            // Midfielders
            "Defensive Midfielder",
            "Second Defensive Midfielder",
            "Central Midfielder",
            "Second Central Midfielder",
            "Attacking Midfielder",
            "Left Midfielder",
            "Right Midfielder",
            // Forwards
            "Striker",
            "Second Striker",
            "Center Forward",
            "Second Center Forward", // ✅
            "Left Winger",
            "Right Winger",
        ]
    },
    status: {
        type: String,
        enum: ["pending", "success", "failed", "refund", "paid", "manual_exit"],
        default: "pending"
    },
    paymentType: { type: String, enum: ["team fee", "tournament fee"], default: "team fee" },
    stripePaymentIntentId: { type: String },
    defaultTeam: { type: String },
    method: { type: String, default: "online" },
    matchFormat: { type: String },
    //tournament part is here kaka
    tournamentId: { type: Schema.Types.ObjectId, ref: "Tournament" },
}, { timestamps: true });
PaymentSchema.index({ currencyCode: 1, createdAt: -1 });
export const PaymentModel = model("Payment", PaymentSchema);
//# sourceMappingURL=payment.model.js.map