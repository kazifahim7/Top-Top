
import mongoose, { Types } from "mongoose";
import { PaymentModel } from "../Payment/payment.model.js";
import type { TRefund } from "./refund.interface.js";
import { RefundModel } from "./refund.model.js";
import { LobbyModel } from "../Lobby/lobby.model.js";

export const sendRefundRequest = async (payload: TRefund) => {
     const { lobbyId, playerId,  price } = payload;
     console.log(payload)

     const payment = await PaymentModel.findOne({
          lobbyId: new Types.ObjectId(lobbyId),
          playerId: new Types.ObjectId(playerId),
          price,
     });

     console.log(payment)

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
          price,
          status: "pending",
     });

     return refund;
};

const allRefundRequest = async () => {
     const result = await RefundModel.find().populate("playerId lobbyId")
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

          // Convert to ObjectId to ensure consistent type handling
          const lobbyObjectId = new Types.ObjectId(lobbyId);
          const playerObjectId = new Types.ObjectId(playerId);
          const teamObjectId = teamId ? new Types.ObjectId(teamId) : undefined;

          console.log('Processing refund for:', {
               lobbyId: lobbyObjectId,
               playerId: playerObjectId,
               teamId: teamObjectId
          });

          // 1. Remove player from lobby teams - FIXED: Added proper field reference
          const lobbyUpdate = await LobbyModel.updateOne(
               { _id: lobbyObjectId },
               {
                    $pull: {
                         "team1.players": { playerId: playerObjectId },
                         "team2.players": { playerId: playerObjectId },
                         "defaultTeam1.players": { playerId: playerObjectId },
                         "defaultTeam2.players": { playerId: playerObjectId },
                    },
               },
               { session }
          );

          console.log('Lobby update result:', lobbyUpdate);

          // 2. Update payment status - FIXED: Check if payment exists and can be refunded
          const paymentUpdate = await PaymentModel.updateOne(
               {
                    lobbyId: lobbyObjectId,
                    playerId: playerObjectId,
                    ...(teamObjectId ? { teamId: teamObjectId } : {}),
                    status: "success" 
               },
               { $set: { status: "refund" } }, 
               { session }
          );

          console.log('Payment update result:', paymentUpdate);

          if (paymentUpdate.matchedCount === 0) {
               throw new Error("No successful payment found to refund");
          }

          // 3. Update refund request - FIXED: Only update pending requests and use consistent status
          const refundUpdate = await RefundModel.updateOne(
               {
                    lobbyId: lobbyObjectId,
                    playerId: playerObjectId,
                    ...(teamObjectId ? { teamId: teamObjectId } : {}),
                    status: "pending" 
               },
               { $set: { status: "accept" } }, 
               { session }
          );

          console.log('Refund update result:', refundUpdate);

          if (refundUpdate.matchedCount === 0) {
               throw new Error("No pending refund request found");
          }

          // Commit transaction
          await session.commitTransaction();
          session.endSession();

          return {
               success: true,
               message: "Refund processed successfully",
               lobbyUpdate,
               paymentUpdate,
               refundUpdate
          };

     } catch (error) {
          // Rollback transaction on error
          await session.abortTransaction();
          session.endSession();
          console.error("Accept refund error:", error);
          throw error;
     }
};
const exit_lobby = async (
     payload: {
          lobbyId: string | Types.ObjectId;
          currentUserId: string | Types.ObjectId;
     },
     playerId: string | Types.ObjectId
) => {
     const session = await mongoose.startSession();
     session.startTransaction();

     try {
          const lobbyObjectId = new Types.ObjectId(payload.lobbyId);
          const playerObjectId = new Types.ObjectId(playerId);
          const currentUserObjectId = new Types.ObjectId(payload.currentUserId);

        
          if (!playerObjectId.equals(currentUserObjectId)) {
               throw new Error("You can only remove yourself from the lobby.");
          }

          //  Remove player from all possible teams
          await LobbyModel.updateOne(
               { _id: lobbyObjectId },
               {
                    $pull: {
                         "team1.players": { playerId: playerObjectId },
                         "team2.players": { playerId: playerObjectId },
                         "defaultTeam1.players": { playerId: playerObjectId },
                         "defaultTeam2.players": { playerId: playerObjectId },
                    },
               },
               { session }
          );

          //  Fetch updated lobby inside transaction
          const lobby = await LobbyModel.findById(lobbyObjectId).session(session);
          if (!lobby) {
               throw new Error("Lobby not found");
          }

          //  Reset matchFormat if team players are empty
          const updateData: Record<string, any> = {};

          if (lobby.team1?.players?.length === 0) {
               updateData["team1.matchFormat"] = "";
          }

          if (lobby.team2?.players?.length === 0) {
               updateData["team2.matchFormat"] = "";
          }

          if (lobby.defaultTeam1?.players?.length === 0) {
               updateData["defaultTeam1.matchFormat"] = "";
          }

          if (lobby.defaultTeam2?.players?.length === 0) {
               updateData["defaultTeam2.matchFormat"] = "";
          }

          if (Object.keys(updateData).length > 0) {
               await LobbyModel.updateOne(
                    { _id: lobbyObjectId },
                    { $set: updateData },
                    { session }
               );
          }

          //  Commit transaction
          await session.commitTransaction();
          session.endSession();

          return {
               success: true,
               message: "Successfully exited lobby",
          };
     } catch (error) {
          await session.abortTransaction();
          session.endSession();
          console.error("Exit lobby error:", error);
          throw error;
     }
};

export const refundService = {
     sendRefundRequest,
     allRefundRequest,
     acceptRefundRequest,
     exit_lobby
}