import Stripe from "stripe";
import { Types } from "mongoose";
import { LobbyModel } from "../Lobby/lobby.model.js";
import { userModel } from "../auth/auth.model.js";
import { PaymentModel } from "./payment.model.js";
import { TournamentModel } from "../Tournament/Tournament.model.js";
import { StandingModel } from "../PointTable/pointtable.model.js";
import config from "../../config/index.js";
import { CountryService } from "../Country/country.service.js";
import { stripeAmountFromPrice, stripeCurrencyCode } from "../../utils/stripeAmount.js";
const stripe = new Stripe(config.sk_key, {
    apiVersion: "2024-06-20",
});
const STRIPE_WEBHOOK_SECRET = config.web_hook_secret;
// ─── Helper: Player data add to lobby ────────────────────────────────────────
async function addPlayerToLobby(payment) {
    const lobby = await LobbyModel.findById(payment.lobbyId);
    if (!lobby)
        return { success: false, message: "Lobby not found" };
    if (!payment.playerId)
        return { success: false, message: "Player ID missing" };
    if (!payment.teamId)
        return { success: false, message: "Team ID missing" };
    const player = await userModel.findById(payment.playerId);
    if (!player)
        return { success: false, message: "Player not found" };
    const playerData = {
        playerId: new Types.ObjectId(payment.playerId.toString()),
        matchPosition: payment.matchPosition || "",
        redCard: 0,
        yellowCard: 0,
        substitution: 0,
        assists: 0,
        goal: 0,
        tackle: 0,
        save: 0,
        rating: 6.5,
        mainRating: player.rating,
        guest_player: payment.guest_player ?? false,
        contribution: 0,
        goodMoment: 0,
        veryGoodMoment: 0,
    };
    const calculateAverageMainRating = (players) => {
        if (!players || players.length === 0)
            return 0;
        const sum = players.reduce((total, p) => total + (p.mainRating || p.rating || 0), 0);
        return sum / players.length;
    };
    if (lobby.matchType === "solo") {
        const requestedTeamId = payment.teamId.toString();
        //@ts-ignore
        if (requestedTeamId === lobby.defaultTeam1?._id?.toString()) {
            const inTeam1 = lobby.defaultTeam1?.players?.some((p) => p.playerId.toString() === payment.playerId.toString());
            if (inTeam1)
                return { success: false, message: "Player already in team 1" };
            if (payment.matchFormat &&
                (!lobby.defaultTeam1.matchFormat || lobby.defaultTeam1.matchFormat === "") &&
                lobby.defaultTeam1.players.length === 0) {
                lobby.defaultTeam1.matchFormat = payment.matchFormat;
                lobby.markModified("defaultTeam1.matchFormat");
            }
            //@ts-ignore
            lobby.defaultTeam1.players.push(playerData);
            //@ts-ignore
        }
        else if (requestedTeamId === lobby.defaultTeam2?._id?.toString()) {
            const inTeam2 = lobby.defaultTeam2?.players?.some((p) => p.playerId.toString() === payment.playerId.toString());
            if (inTeam2)
                return { success: false, message: "Player already in team 2" };
            if (payment.matchFormat &&
                (!lobby.defaultTeam2.matchFormat || lobby.defaultTeam2.matchFormat === "") &&
                lobby.defaultTeam2.players.length === 0) {
                lobby.defaultTeam2.matchFormat = payment.matchFormat;
                lobby.markModified("defaultTeam2.matchFormat");
            }
            lobby.defaultTeam2.players.push(playerData);
        }
        else {
            return { success: false, message: "Invalid team selection" };
        }
        if (lobby.defaultTeam1?.players) {
            lobby.team1AvgMatchRatingBefore = calculateAverageMainRating(lobby.defaultTeam1.players);
        }
        if (lobby.defaultTeam2?.players) {
            lobby.team2AvgMatchRatingBefore = calculateAverageMainRating(lobby.defaultTeam2.players);
        }
    }
    else {
        if (lobby.team1?.teamId && payment.teamId.toString() === lobby.team1.teamId.toString()) {
            if (payment.matchFormat &&
                (!lobby.team1.matchFormat || lobby.team1.matchFormat === "") &&
                lobby.team1.players.length === 0) {
                lobby.team1.matchFormat = payment.matchFormat;
                lobby.markModified("team1.matchFormat");
            }
            if (!lobby.team1.players)
                lobby.team1.players = [];
            lobby.team1.players.push(playerData);
        }
        else if (lobby.team2?.teamId && payment.teamId.toString() === lobby.team2.teamId.toString()) {
            if (payment.matchFormat &&
                (!lobby.team2.matchFormat || lobby.team2.matchFormat === "") &&
                lobby.team2.players.length === 0) {
                lobby.team2.matchFormat = payment.matchFormat;
                lobby.markModified("team2.matchFormat");
            }
            if (!lobby.team2.players)
                lobby.team2.players = [];
            lobby.team2.players.push(playerData);
        }
        else {
            return { success: false, message: "Team not found in lobby" };
        }
        if (lobby.team1?.players) {
            lobby.team1AvgMatchRatingBefore = calculateAverageMainRating(lobby.team1.players);
        }
        if (lobby.team2?.players) {
            lobby.team2AvgMatchRatingBefore = calculateAverageMainRating(lobby.team2.players);
        }
    }
    await lobby.save();
    return { success: true, message: "Player added to lobby" };
}
// ─── Helper: Position availability check ─────────────────────────────────────
async function checkPositionAvailability(payment) {
    if (payment.paymentType !== "team fee" || !payment.matchPosition)
        return null;
    const lobby = await LobbyModel.findById(payment.lobbyId);
    if (!lobby)
        return "Lobby not found";
    let targetTeamPlayers = [];
    if (lobby.matchType === "solo") {
        //@ts-ignore
        if (payment.teamId?.toString() === lobby.defaultTeam1?._id?.toString()) {
            targetTeamPlayers = lobby.defaultTeam1?.players || [];
            //@ts-ignore
        }
        else if (payment.teamId?.toString() === lobby.defaultTeam2?._id?.toString()) {
            targetTeamPlayers = lobby.defaultTeam2?.players || [];
        }
    }
    else {
        if (payment.teamId?.toString() === lobby.team1?.teamId?.toString()) {
            targetTeamPlayers = lobby.team1?.players || [];
        }
        else if (payment.teamId?.toString() === lobby.team2?.teamId?.toString()) {
            targetTeamPlayers = lobby.team2?.players || [];
        }
    }
    const positionTakenInLobby = targetTeamPlayers.some((p) => p.matchPosition === payment.matchPosition);
    const positionTakenInPayment = await PaymentModel.findOne({
        lobbyId: payment.lobbyId,
        teamId: payment.teamId,
        matchPosition: payment.matchPosition,
        status: { $in: ["success", "paid"] },
        _id: { $ne: payment._id },
    });
    if (positionTakenInLobby || positionTakenInPayment) {
        await PaymentModel.updateMany({
            lobbyId: payment.lobbyId,
            teamId: payment.teamId,
            matchPosition: payment.matchPosition,
            status: "pending",
            _id: { $ne: payment._id },
        }, { $set: { status: "failed" } });
        return "This position is already taken. Payment has been cancelled.";
    }
    return null;
}
// ─── POST /webhook/stripe ─────────────────────────────────────────────────────
export const stripeWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    if (!sig) {
        return res.status(400).json({ message: "Missing stripe-signature header" });
    }
    let event;
    try {
        // req.body must be raw Buffer (NOT parsed JSON)
        event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
    }
    catch (err) {
        console.error("Webhook signature verification failed:", err.message);
        return res.status(400).json({ message: `Webhook Error: ${err.message}` });
    }
    // ─── Handle payment_intent.succeeded ──────────────────────────────────
    if (event.type === "payment_intent.succeeded") {
        const intent = event.data.object;
        const paymentId = intent.metadata?.paymentId;
        if (!paymentId) {
            console.error("No paymentId in metadata");
            return res.status(200).json({ received: true });
        }
        try {
            const payment = await PaymentModel.findById(paymentId);
            if (!payment) {
                console.error("Payment not found:", paymentId);
                return res.status(200).json({ received: true });
            }
            // Already processed — idempotency guard
            if (payment.status === "paid" || payment.status === "success") {
                return res.status(200).json({ received: true });
            }
            // Amount & currency validation
            const expectedCurrency = stripeCurrencyCode(payment.currencyCode || CountryService.DEFAULT_CURRENCY_CODE);
            const expectedAmount = stripeAmountFromPrice(payment.totalPrice ?? payment.price, payment.currencyCode || CountryService.DEFAULT_CURRENCY_CODE);
            if (intent.amount !== expectedAmount || intent.currency !== expectedCurrency) {
                payment.status = "failed";
                await payment.save();
                await stripe.refunds.create({ payment_intent: intent.id });
                console.error("Amount/currency mismatch for payment:", paymentId);
                return res.status(200).json({ received: true });
            }
            // ─── Team Fee ────────────────────────────────────────────────
            if (payment.paymentType === "team fee") {
                // Position check
                const positionError = await checkPositionAvailability(payment);
                if (positionError) {
                    payment.status = "failed";
                    await payment.save();
                    await stripe.refunds.create({ payment_intent: intent.id });
                    console.error("Position conflict:", positionError);
                    return res.status(200).json({ received: true });
                }
                payment.status = "paid";
                await payment.save();
                // Add player to lobby
                const result = await addPlayerToLobby(payment);
                if (!result.success) {
                    console.error("Failed to add player to lobby:", result.message);
                    // Refund since player could not be added
                    payment.status = "failed";
                    await payment.save();
                    await stripe.refunds.create({ payment_intent: intent.id });
                }
            }
            // ─── Tournament Fee ──────────────────────────────────────────
            if (payment.paymentType === "tournament fee") {
                const tournament = await TournamentModel.findById(payment.tournamentId);
                if (!tournament) {
                    payment.status = "failed";
                    await payment.save();
                    await stripe.refunds.create({ payment_intent: intent.id });
                    return res.status(200).json({ received: true });
                }
                payment.status = "paid";
                await payment.save();
                if (tournament.type === "League" || tournament.type === "Both") {
                    await TournamentModel.findByIdAndUpdate(payment.tournamentId, { $addToSet: { teams: payment.teamId } });
                }
                else {
                    await TournamentModel.findByIdAndUpdate(payment.tournamentId, { $addToSet: { qualifiedTeams: payment.teamId } });
                }
                await StandingModel.create({
                    tournament: tournament._id,
                    team: payment.teamId,
                });
            }
        }
        catch (err) {
            console.error("Error processing webhook payment:", err.message);
        }
    }
    // ─── Handle payment_intent.payment_failed ─────────────────────────────
    if (event.type === "payment_intent.payment_failed") {
        const intent = event.data.object;
        const paymentId = intent.metadata?.paymentId;
        if (paymentId) {
            try {
                await PaymentModel.findByIdAndUpdate(paymentId, { status: "failed" });
            }
            catch (err) {
                console.error("Error marking payment as failed:", err.message);
            }
        }
    }
    return res.status(200).json({ received: true });
};
// ─── GET /payment/verify?paymentId=xxx ───────────────────────────────────────
export const verifyPayment = async (req, res) => {
    try {
        const { paymentId } = req.query;
        if (!paymentId) {
            return res.status(400).json({ message: "paymentId is required" });
        }
        const payment = await PaymentModel.findById(paymentId);
        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }
        // Cash payment — organizer manually approve করে, তাই status check করো
        if (payment.method === "cash") {
            return res.json({
                success: true,
                paymentId: payment._id,
                status: payment.status,
                method: payment.method,
                paymentType: payment.paymentType,
                isPaid: payment.status === "success" || payment.status === "paid",
            });
        }
        if (!payment.stripePaymentIntentId) {
            return res.status(400).json({ message: "No Stripe PaymentIntent linked to this payment" });
        }
        const intent = await stripe.paymentIntents.retrieve(payment.stripePaymentIntentId);
        const isPaid = (payment.status === "paid" || payment.status === "success") &&
            intent.status === "succeeded";
        return res.json({
            success: true,
            paymentId: payment._id,
            status: payment.status,
            stripeStatus: intent.status,
            method: payment.method,
            paymentType: payment.paymentType,
            isPaid,
            ...(intent.status === "requires_action" && {
                clientSecret: intent.client_secret,
            }),
        });
    }
    catch (err) {
        console.error("verifyPayment error:", err.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};
//# sourceMappingURL=webhook.controller.js.map