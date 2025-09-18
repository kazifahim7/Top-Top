var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from "express";
import Stripe from "stripe";
import { PaymentModel } from "./payment.model.js";
import { LobbyModel } from "../Lobby/lobby.model.js";
import { Types } from "mongoose";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-08-27.basil" });
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
export const stripeWebhook = express.raw({ type: "application/json" });
export const handleWebhook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    const sig = req.headers["stripe-signature"];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    }
    catch (err) {
        return res.status(400).send(`Webhook error: ${err.message}`);
    }
    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const paymentId = (_a = session.metadata) === null || _a === void 0 ? void 0 : _a.paymentId;
        if (!paymentId)
            return res.status(400).send("Payment ID missing");
        const payment = yield PaymentModel.findById(paymentId);
        if (!payment)
            return res.status(404).send("Payment not found");
        payment.status = "success";
        yield payment.save();
        const lobby = yield LobbyModel.findById(payment.lobbyId);
        if (!lobby)
            return res.status(404).send("Lobby not found");
        // Ensure playerId is a string for safe assignment
        const playerIdString = payment.playerId instanceof Types.ObjectId
            ? payment.playerId.toString()
            : payment.playerId;
        const teamIdString = payment.teamId instanceof Types.ObjectId
            ? payment.teamId.toString()
            : payment.teamId;
        const playerData = {
            playerId: new Types.ObjectId(playerIdString),
            matchPosition: (_c = (_b = session.metadata) === null || _b === void 0 ? void 0 : _b.matchPosition) !== null && _c !== void 0 ? _c : "",
            redCard: 0,
            yellowCard: 0,
            substitution: 0,
            assists: 0,
            goal: 0,
            tackle: 0,
            save: 0,
            rating: 0,
        };
        const matchFormat = (_e = (_d = session.metadata) === null || _d === void 0 ? void 0 : _d.matchFormat) !== null && _e !== void 0 ? _e : "";
        if (lobby.matchType === "solo") {
            const targetTeam = (_f = session.metadata) === null || _f === void 0 ? void 0 : _f.defaultTeam;
            const t1Count = (_h = (_g = lobby.defaultTeam1) === null || _g === void 0 ? void 0 : _g.players.length) !== null && _h !== void 0 ? _h : 0;
            const t2Count = (_k = (_j = lobby.defaultTeam2) === null || _j === void 0 ? void 0 : _j.players.length) !== null && _k !== void 0 ? _k : 0;
            if ((t1Count > 0 && t2Count > 0) ||
                (targetTeam === "defaultTeam1" && t1Count > 0) ||
                (targetTeam === "defaultTeam2" && t2Count > 0)) {
                return res.status(400).send("Solo match cannot have players in both default teams");
            }
            if (targetTeam === "defaultTeam1") {
                lobby.defaultTeam1.players.push(playerData);
                if (matchFormat)
                    lobby.defaultTeam1.matchFormat = matchFormat;
            }
            else if (targetTeam === "defaultTeam2") {
                lobby.defaultTeam2.players.push(playerData);
                if (matchFormat)
                    lobby.defaultTeam2.matchFormat = matchFormat;
            }
            else
                return res.status(400).send("Invalid default team for solo match");
        }
        else if (lobby.matchType === "teams") {
            if (!teamIdString)
                return res.status(400).send("Team ID missing for team match");
            const team = teamIdString === lobby.team1.teamId.toString() ? lobby.team1 :
                teamIdString === lobby.team2.teamId.toString() ? lobby.team2 : null;
            if (!team)
                return res.status(400).send("Player does not belong to any team in this match");
            if (team.players.length >= lobby.maxSlot)
                return res.status(400).send("Team is full");
            team.players.push(playerData);
            if (matchFormat)
                team.matchFormat = matchFormat;
        }
        yield lobby.save();
    }
    res.json({ received: true });
});
//# sourceMappingURL=payment.webhook.js.map