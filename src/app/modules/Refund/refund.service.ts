
import mongoose, { Types } from "mongoose";
import { PaymentModel } from "../Payment/payment.model.js";
import type { TRefund } from "./refund.interface.js";
import { RefundModel } from "./refund.model.js";
import { LobbyModel } from "../Lobby/lobby.model.js";

export const sendRefundRequest = async (payload: TRefund) => {
     const { lobbyId, playerId, teamId, price } = payload;

     const payment = await PaymentModel.findOne({
          lobbyId: new Types.ObjectId(lobbyId),
          playerId: new Types.ObjectId(playerId),
          ...(teamId ? { teamId: new Types.ObjectId(teamId) } : {}),
          price,
     });

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


     const refund = await RefundModel.create({
          lobbyId,
          playerId,
          teamId,
          price,
          status: "pending",
     });

     return refund;
};

const allRefundRequest = async () => {
     const result = await RefundModel.find().populate("teamId playerId lobbyId")
     return result
}

 const acceptRefundRequest = async (payload: {
     lobbyId: string | Types.ObjectId;
     playerId: string | Types.ObjectId;
     teamId?: string | Types.ObjectId;
}) => {
     const session = await mongoose.startSession();
     session.startTransaction();

     try {
          const { lobbyId, playerId, teamId } = payload;

          
          await LobbyModel.updateOne(
               { _id: lobbyId },
               {
                    $pull: {
                         "team1.players": { playerId },
                         "team2.players": { playerId },
                         "defaultTeam1.players": { playerId },
                         "defaultTeam2.players": { playerId },
                    },
               },
               { session }
          );

        
          await PaymentModel.updateOne(
               {
                    lobbyId,
                    playerId,
                    ...(teamId ? { teamId } : {}),
               },
               { $set: { status: "refund" } },
               { session }
          );

          
         const result= await RefundModel.updateOne(
               {
                    lobbyId,
                    playerId,
                    ...(teamId ? { teamId } : {}),
               },
               { $set: { status: "accept" } },
               { session }
          );

        
          await session.commitTransaction();
          session.endSession();

          return result
     } catch (error) {
          
          await session.abortTransaction();
          session.endSession();
          throw error;
     }
};
export const refundService = {
     sendRefundRequest,
     allRefundRequest,
     acceptRefundRequest
}