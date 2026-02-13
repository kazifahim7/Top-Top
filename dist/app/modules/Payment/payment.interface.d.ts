import type { Schema } from "mongoose";
export interface Payment {
    lobbyId?: Schema.Types.ObjectId;
    playerId?: Schema.Types.ObjectId;
    ExtraPlayerId?: Schema.Types.ObjectId;
    teamId?: Schema.Types.ObjectId;
    price: number;
    guest_player?: boolean;
    matchPosition?: string;
    status: "pending" | "success" | "failed" | "refund" | "paid";
    stripePaymentIntentId?: string;
    defaultTeam?: string;
    method?: string;
    matchFormat?: string;
    paymentType: "team fee" | "tournament fee";
    tournamentId: Schema.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=payment.interface.d.ts.map