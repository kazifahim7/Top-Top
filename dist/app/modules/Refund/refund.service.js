import mongoose, { Types } from "mongoose";
import { PaymentModel } from "../Payment/payment.model.js";
import { RefundModel } from "./refund.model.js";
import { LobbyModel } from "../Lobby/lobby.model.js";
const REFUND_WINDOW_HOURS = 12;
const parseMatchStartDate = (date, time) => {
    const matchDate = new Date(date);
    if (!time)
        return matchDate;
    const timeMatch = time.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);
    if (!timeMatch)
        return matchDate;
    let hours = Number(timeMatch[1]);
    const minutes = Number(timeMatch[2] || 0);
    const period = timeMatch[3]?.toUpperCase();
    if (period === "PM" && hours < 12)
        hours += 12;
    if (period === "AM" && hours === 12)
        hours = 0;
    if (hours > 23 || minutes > 59)
        return matchDate;
    return new Date(Date.UTC(matchDate.getUTCFullYear(), matchDate.getUTCMonth(), matchDate.getUTCDate(), hours, minutes, 0, 0));
};
const getHoursUntilMatchStart = (date, time) => {
    const matchStart = parseMatchStartDate(date, time);
    return (matchStart.getTime() - Date.now()) / (1000 * 60 * 60);
};
const playerExistsInLobby = (lobby, playerObjectId) => {
    const playerId = playerObjectId.toString();
    return [
        ...(lobby.team1?.players || []),
        ...(lobby.team2?.players || []),
        ...(lobby.defaultTeam1?.players || []),
        ...(lobby.defaultTeam2?.players || []),
    ].some((player) => player.playerId?.toString() === playerId);
};
const getPlayerTeamIdFromLobby = (lobby, playerObjectId) => {
    const playerId = playerObjectId.toString();
    if (lobby.team1?.players?.some((player) => player.playerId?.toString() === playerId)) {
        return lobby.team1.teamId;
    }
    if (lobby.team2?.players?.some((player) => player.playerId?.toString() === playerId)) {
        return lobby.team2.teamId;
    }
    if (lobby.defaultTeam1?.players?.some((player) => player.playerId?.toString() === playerId)) {
        return lobby.defaultTeam1._id;
    }
    if (lobby.defaultTeam2?.players?.some((player) => player.playerId?.toString() === playerId)) {
        return lobby.defaultTeam2._id;
    }
    return undefined;
};
const removePlayerFromLobby = async (lobbyObjectId, playerObjectId, session) => {
    return LobbyModel.updateOne({ _id: lobbyObjectId }, {
        $pull: {
            "team1.players": { playerId: playerObjectId },
            "team2.players": { playerId: playerObjectId },
            "defaultTeam1.players": { playerId: playerObjectId },
            "defaultTeam2.players": { playerId: playerObjectId },
        },
    }, { session });
};
const resetEmptyMatchFormats = async (lobbyObjectId, session) => {
    const lobby = await LobbyModel.findById(lobbyObjectId).session(session);
    if (!lobby) {
        throw new Error("Lobby not found");
    }
    const updateData = {};
    if (lobby.team1?.players?.length === 0)
        updateData["team1.matchFormat"] = "";
    if (lobby.team2?.players?.length === 0)
        updateData["team2.matchFormat"] = "";
    if (lobby.defaultTeam1?.players?.length === 0)
        updateData["defaultTeam1.matchFormat"] = "";
    if (lobby.defaultTeam2?.players?.length === 0)
        updateData["defaultTeam2.matchFormat"] = "";
    if (Object.keys(updateData).length > 0) {
        await LobbyModel.updateOne({ _id: lobbyObjectId }, { $set: updateData }, { session });
    }
};
export const sendRefundRequest = async (payload) => {
    const { lobbyId, playerId, price } = payload;
    console.log(payload);
    const payment = await PaymentModel.findOne({
        lobbyId: new Types.ObjectId(lobbyId),
        playerId: new Types.ObjectId(playerId),
        price,
    });
    console.log(payment);
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
    const result = await RefundModel.find().populate("playerId lobbyId");
    return result;
};
const acceptRefundRequest = async (payload) => {
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
        const lobbyUpdate = await LobbyModel.updateOne({ _id: lobbyObjectId }, {
            $pull: {
                "team1.players": { playerId: playerObjectId },
                "team2.players": { playerId: playerObjectId },
                "defaultTeam1.players": { playerId: playerObjectId },
                "defaultTeam2.players": { playerId: playerObjectId },
            },
        }, { session });
        console.log('Lobby update result:', lobbyUpdate);
        // 2. Update payment status - FIXED: Check if payment exists and can be refunded
        const paymentUpdate = await PaymentModel.updateOne({
            lobbyId: lobbyObjectId,
            playerId: playerObjectId,
            ...(teamObjectId ? { teamId: teamObjectId } : {}),
            status: { $in: ["success", "paid"] }
        }, { $set: { status: "refund" } }, { session });
        console.log('Payment update result:', paymentUpdate);
        if (paymentUpdate.matchedCount === 0) {
            throw new Error("No successful payment found to refund");
        }
        // 3. Update refund request - FIXED: Only update pending requests and use consistent status
        const refundUpdate = await RefundModel.updateOne({
            lobbyId: lobbyObjectId,
            playerId: playerObjectId,
            ...(teamObjectId ? { teamId: teamObjectId } : {}),
            status: "pending"
        }, { $set: { status: "accept" } }, { session });
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
    }
    catch (error) {
        // Rollback transaction on error
        await session.abortTransaction();
        session.endSession();
        console.error("Accept refund error:", error);
        throw error;
    }
};
const leave_lobby = async (payload, playerId) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const lobbyObjectId = new Types.ObjectId(payload.lobbyId);
        const playerObjectId = new Types.ObjectId(playerId);
        const lobby = await LobbyModel.findById(lobbyObjectId).session(session);
        if (!lobby) {
            throw new Error("Lobby not found");
        }
        const isPlayerJoined = playerExistsInLobby(lobby, playerObjectId);
        const teamId = getPlayerTeamIdFromLobby(lobby, playerObjectId);
        const activePayment = await PaymentModel.findOne({
            lobbyId: lobbyObjectId,
            playerId: playerObjectId,
            status: { $in: ["success", "paid"] },
        }).sort({ createdAt: -1 }).session(session);
        const existingPendingRefund = await RefundModel.findOne({
            lobbyId: lobbyObjectId,
            playerId: playerObjectId,
            status: "pending",
        }).session(session);
        if (!isPlayerJoined) {
            await session.commitTransaction();
            session.endSession();
            return {
                success: true,
                message: existingPendingRefund
                    ? "You have already left this lobby and your refund request is pending."
                    : "You have already left this lobby.",
                refundRequestCreated: false,
                refundRequestAlreadyPending: Boolean(existingPendingRefund),
                refundEligible: Boolean(existingPendingRefund),
                refundIneligibilityReason: existingPendingRefund ? null : "already_left",
                hoursUntilMatchStart: getHoursUntilMatchStart(lobby.date, lobby.time),
            };
        }
        const hoursUntilMatchStart = getHoursUntilMatchStart(lobby.date, lobby.time);
        const isCashPayment = activePayment?.method === "cash";
        const isOutsideRefundWindow = hoursUntilMatchStart > REFUND_WINDOW_HOURS;
        const refundEligible = Boolean(activePayment && !isCashPayment && isOutsideRefundWindow);
        await removePlayerFromLobby(lobbyObjectId, playerObjectId, session);
        let refundRequestCreated = false;
        let refundIneligibilityReason = null;
        if (refundEligible) {
            if (!existingPendingRefund) {
                await RefundModel.create([{
                        lobbyId: lobbyObjectId,
                        playerId: playerObjectId,
                        ...(teamId ? { teamId } : {}),
                        price: activePayment.price,
                        status: "pending",
                    }], { session });
                refundRequestCreated = true;
            }
        }
        else {
            if (!activePayment) {
                refundIneligibilityReason = "no_successful_payment";
            }
            else if (isCashPayment) {
                refundIneligibilityReason = "cash";
            }
            else {
                refundIneligibilityReason = "within_12_hours";
            }
            await PaymentModel.updateMany({
                lobbyId: lobbyObjectId,
                playerId: playerObjectId,
                status: { $in: ["pending", "paid", "success"] },
            }, { $set: { status: "manual_exit" } }, { session });
        }
        await resetEmptyMatchFormats(lobbyObjectId, session);
        await session.commitTransaction();
        session.endSession();
        const message = refundEligible
            ? existingPendingRefund
                ? "You left the lobby. Your refund request is already pending."
                : "You left the lobby and your refund request was created."
            : refundIneligibilityReason === "cash"
                ? "You left the lobby. No refund request was created because this was a cash payment."
                : refundIneligibilityReason === "within_12_hours"
                    ? "You left the lobby. No refund request was created because the match starts within 12 hours."
                    : "You left the lobby. No refund request was created because no successful payment was found.";
        return {
            success: true,
            message,
            refundRequestCreated,
            refundRequestAlreadyPending: Boolean(existingPendingRefund),
            refundEligible,
            refundIneligibilityReason,
            hoursUntilMatchStart,
        };
    }
    catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Leave lobby error:", error);
        throw error;
    }
};
const exit_lobby = async (payload, playerId) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const lobbyObjectId = new Types.ObjectId(payload.lobbyId);
        const playerObjectId = new Types.ObjectId(playerId);
        const currentUserObjectId = new Types.ObjectId(payload.currentUserId);
        if (!playerObjectId.equals(currentUserObjectId)) {
            throw new Error("You can only remove yourself from the lobby.");
        }
        // Remove player from all possible teams
        await LobbyModel.updateOne({ _id: lobbyObjectId }, {
            $pull: {
                "team1.players": { playerId: playerObjectId },
                "team2.players": { playerId: playerObjectId },
                "defaultTeam1.players": { playerId: playerObjectId },
                "defaultTeam2.players": { playerId: playerObjectId },
            },
        }, { session });
        // ─── Cancel all active payments on manual exit ────────────────────
        await PaymentModel.updateMany({
            lobbyId: lobbyObjectId,
            playerId: playerObjectId,
            status: { $in: ["pending", "paid", "success"] },
        }, { $set: { status: "manual_exit" } }, { session });
        // ─────────────────────────────────────────────────────────────────
        // Fetch updated lobby inside transaction
        const lobby = await LobbyModel.findById(lobbyObjectId).session(session);
        if (!lobby) {
            throw new Error("Lobby not found");
        }
        // Reset matchFormat if team players are empty
        const updateData = {};
        if (lobby.team1?.players?.length === 0)
            updateData["team1.matchFormat"] = "";
        if (lobby.team2?.players?.length === 0)
            updateData["team2.matchFormat"] = "";
        if (lobby.defaultTeam1?.players?.length === 0)
            updateData["defaultTeam1.matchFormat"] = "";
        if (lobby.defaultTeam2?.players?.length === 0)
            updateData["defaultTeam2.matchFormat"] = "";
        if (Object.keys(updateData).length > 0) {
            await LobbyModel.updateOne({ _id: lobbyObjectId }, { $set: updateData }, { session });
        }
        await session.commitTransaction();
        session.endSession();
        return {
            success: true,
            message: "Successfully exited lobby",
        };
    }
    catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Exit lobby error:", error);
        throw error;
    }
};
const exit_lobby_organizer = async (payload, playerId) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const lobbyObjectId = new Types.ObjectId(payload.lobbyId);
        const playerObjectId = new Types.ObjectId(playerId);
        const currentUserObjectId = new Types.ObjectId(payload.currentUserId);
        // Remove player from all possible teams
        await LobbyModel.updateOne({ _id: lobbyObjectId, organizer: playerObjectId }, {
            $pull: {
                "team1.players": { playerId: currentUserObjectId },
                "team2.players": { playerId: currentUserObjectId },
                "defaultTeam1.players": { playerId: currentUserObjectId },
                "defaultTeam2.players": { playerId: currentUserObjectId },
            },
        }, { session });
        // ─── Cancel all active payments on organizer-forced exit ──────────
        await PaymentModel.updateMany({
            lobbyId: lobbyObjectId,
            playerId: currentUserObjectId,
            status: { $in: ["pending", "paid", "success"] },
        }, { $set: { status: "manual_exit" } }, { session });
        // ─────────────────────────────────────────────────────────────────
        // Fetch updated lobby inside transaction
        const lobby = await LobbyModel.findById(lobbyObjectId).session(session);
        if (!lobby) {
            throw new Error("Lobby not found");
        }
        // Reset matchFormat if team players are empty
        const updateData = {};
        if (lobby.team1?.players?.length === 0)
            updateData["team1.matchFormat"] = "";
        if (lobby.team2?.players?.length === 0)
            updateData["team2.matchFormat"] = "";
        if (lobby.defaultTeam1?.players?.length === 0)
            updateData["defaultTeam1.matchFormat"] = "";
        if (lobby.defaultTeam2?.players?.length === 0)
            updateData["defaultTeam2.matchFormat"] = "";
        if (Object.keys(updateData).length > 0) {
            await LobbyModel.updateOne({ _id: lobbyObjectId }, { $set: updateData }, { session });
        }
        await session.commitTransaction();
        session.endSession();
        return {
            success: true,
            message: "Successfully exited lobby",
        };
    }
    catch (error) {
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
    leave_lobby,
    exit_lobby,
    exit_lobby_organizer
};
//# sourceMappingURL=refund.service.js.map