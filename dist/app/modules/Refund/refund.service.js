var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import mongoose, { Types } from "mongoose";
import { PaymentModel } from "../Payment/payment.model.js";
import { RefundModel } from "./refund.model.js";
import { LobbyModel } from "../Lobby/lobby.model.js";
export const sendRefundRequest = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { lobbyId, playerId, teamId, price } = payload;
    const payment = yield PaymentModel.findOne(Object.assign(Object.assign({ lobbyId: new Types.ObjectId(lobbyId), playerId: new Types.ObjectId(playerId) }, (teamId ? { teamId: new Types.ObjectId(teamId) } : {})), { price }));
    if (!payment) {
        throw new Error("Payment record not found");
    }
    if (payment.status !== "success") {
        throw new Error("Payment not successful, refund request denied");
    }
    const paymentTime = new Date(payment.createdAt).getTime();
    const now = Date.now();
    const hoursDiff = (now - paymentTime) / (1000 * 60 * 60);
    if (hoursDiff > 10) {
        throw new Error("Refund request time expired (must be within 10 hours)");
    }
    const refund = yield RefundModel.create({
        lobbyId,
        playerId,
        teamId,
        price,
        status: "pending",
    });
    return refund;
});
const allRefundRequest = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield RefundModel.find().populate("teamId playerId lobbyId");
    return result;
});
const acceptRefundRequest = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose.startSession();
    session.startTransaction();
    try {
        const { lobbyId, playerId, teamId } = payload;
        yield LobbyModel.updateOne({ _id: lobbyId }, {
            $pull: {
                "team1.players": { playerId },
                "team2.players": { playerId },
                "defaultTeam1.players": { playerId },
                "defaultTeam2.players": { playerId },
            },
        }, { session });
        yield PaymentModel.updateOne(Object.assign({ lobbyId,
            playerId }, (teamId ? { teamId } : {})), { $set: { status: "refund" } }, { session });
        const result = yield RefundModel.updateOne(Object.assign({ lobbyId,
            playerId }, (teamId ? { teamId } : {})), { $set: { status: "accept" } }, { session });
        yield session.commitTransaction();
        session.endSession();
        return result;
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
export const refundService = {
    sendRefundRequest,
    allRefundRequest,
    acceptRefundRequest
};
//# sourceMappingURL=refund.service.js.map