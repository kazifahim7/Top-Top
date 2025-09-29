var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Stripe from "stripe";
import { PaymentModel } from "./payment.model.js";
import { LobbyModel } from "../Lobby/lobby.model.js";
import { Types } from "mongoose";
import config from "../../config/index.js";
import catchAsync from "../../utils/catcgAsync.js";
import QueryBuilder from "../../builder/QueryBuilder.js";
import { userModel } from "../auth/auth.model.js";
import { TournamentModel } from "../Tournament/Tournament.model.js";
import AppError from "../../Error/AppError.js";
import { TeamModel } from "../Team/team.model.js";
import { StandingModel } from "../PointTable/pointtable.model.js";
const stripe = new Stripe(config.sk_key, { apiVersion: "2025-08-27.basil" });
export const joinLobby = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    try {
        const playerId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { lobbyId, teamId, defaultTeam, matchPosition, price, matchFormat, method, tournamentId, paymentType } = req.body;
        if (paymentType === "team fee") {
            const lobby = yield LobbyModel.findById(lobbyId);
            if (!lobby)
                return res.status(404).json({ message: "Lobby not found" });
            const playerObjectId = typeof playerId === "string" ? new Types.ObjectId(playerId) : playerId;
            const teamObjectId = teamId ? (typeof teamId === "string" ? new Types.ObjectId(teamId) : teamId) : undefined;
            // Duplicate & slot check
            const isDuplicate = ((_b = lobby.team1) === null || _b === void 0 ? void 0 : _b.players.some(p => p.playerId.toString() === playerObjectId.toString())) ||
                ((_c = lobby.team2) === null || _c === void 0 ? void 0 : _c.players.some(p => p.playerId.toString() === playerObjectId.toString())) ||
                ((_d = lobby.defaultTeam1) === null || _d === void 0 ? void 0 : _d.players.some(p => p.playerId.toString() === playerObjectId.toString())) ||
                ((_e = lobby.defaultTeam2) === null || _e === void 0 ? void 0 : _e.players.some(p => p.playerId.toString() === playerObjectId.toString()));
            if (isDuplicate)
                return res.status(400).json({ message: "Player already joined this lobby" });
            if (lobby.team1.players.length >= lobby.maxSlot && lobby.team2.players.length >= lobby.maxSlot) {
                return res.status(400).json({ message: "Both teams are full" });
            }
            // Create Payment Record (pending)
            const payment = yield PaymentModel.create({
                lobbyId,
                playerId: playerObjectId,
                teamId: teamObjectId,
                price,
                status: "pending",
                method,
                matchPosition
            });
            if (method === "cash") {
                const result = yield payment.save();
                return res.json({
                    success: true,
                    message: "Cash request successFully sended and wait for the admin",
                    data: result
                });
            }
            // Stripe Checkout Session (expand payment_intent)
            const session = yield stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                line_items: [{
                        price_data: {
                            currency: "usd",
                            product_data: { name: "Lobby Join Fee" },
                            unit_amount: price * 100,
                        },
                        quantity: 1,
                    }],
                mode: "payment",
                success_url: `http://localhost:5000/api/v1/payment/payment-success?paymentId=${payment._id}`,
                cancel_url: `http://localhost:5000/api/v1/payment/payment-cancel?paymentId=${payment._id}`,
                metadata: {
                    paymentId: payment._id.toString(),
                    lobbyId: lobbyId.toString(),
                    playerId: playerObjectId.toString(),
                    teamId: (teamObjectId === null || teamObjectId === void 0 ? void 0 : teamObjectId.toString()) || "",
                    matchPosition: matchPosition || "",
                    defaultTeam: defaultTeam || "",
                    matchFormat: matchFormat || "",
                    method
                },
                expand: ["payment_intent"]
            });
            // Save PaymentIntent ID properly
            payment.stripePaymentIntentId = session.id || "";
            yield payment.save();
            return res.json({ sessionId: session.id, paymentId: payment._id, url: session.url });
        }
        if (paymentType === "tournament fee") {
            const isTournamentIsExists = yield TournamentModel.findById(tournamentId);
            if (!isTournamentIsExists) {
                throw new AppError(404, "Tournament Not Found");
            }
            if (isTournamentIsExists.teams.length >= isTournamentIsExists.maxTeam) {
                throw new AppError(403, "Team is full");
            }
            const findTeam = yield TeamModel.findOne({ teamOwner: playerId });
            if (!findTeam) {
                throw new AppError(404, "Team not Found");
            }
            if (isTournamentIsExists.teams.some(t => t.toString() === teamId.toString())) {
                throw new AppError(400, "Team already exists");
            }
            const payment = yield PaymentModel.create({
                tournamentId,
                teamId: findTeam._id,
                price,
                status: "pending",
                method,
                paymentType
            });
            if (method === "cash") {
                const result = yield payment.save();
                return res.json({
                    success: true,
                    message: "Cash request successFully sended and wait for the admin",
                    data: result
                });
            }
            // Stripe Checkout Session (expand payment_intent)
            const session = yield stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                line_items: [{
                        price_data: {
                            currency: "usd",
                            product_data: { name: "Tournament Join Fee" },
                            unit_amount: price * 100,
                        },
                        quantity: 1,
                    }],
                mode: "payment",
                success_url: `http://localhost:5000/api/v1/payment/payment-success?paymentId=${payment._id}`,
                cancel_url: `http://localhost:5000/api/v1/payment/payment-cancel?paymentId=${payment._id}`,
                metadata: {
                    paymentId: payment._id.toString(),
                    tournamentId,
                    teamId: findTeam._id.toString(),
                    price,
                    status: "pending",
                    method,
                    paymentType
                },
                expand: ["payment_intent"]
            });
            // Save PaymentIntent ID properly
            payment.stripePaymentIntentId = session.id || "";
            yield payment.save();
            return res.json({ sessionId: session.id, paymentId: payment._id, url: session.url });
        }
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message });
    }
});
export const paymentSuccess = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { paymentId } = req.query;
        if (!paymentId)
            return res.status(400).json({ message: "Payment ID missing" });
        const payment = yield PaymentModel.findById(paymentId);
        if (!payment)
            return res.status(404).json({ message: "Payment not found" });
        if (payment.paymentType === "team fee") {
            if (payment.method !== "cash") {
                // Retrieve PaymentIntent from Stripe
                const session = yield stripe.checkout.sessions.retrieve(payment.stripePaymentIntentId, {
                    expand: ["payment_intent"],
                });
                if (((_a = session.payment_intent) === null || _a === void 0 ? void 0 : _a.status) !== "succeeded") {
                    return res.status(400).json({ message: "Payment not successful" });
                }
            }
            payment.status = "success";
            yield payment.save();
            // Add player to lobby
            const lobby = yield LobbyModel.findById(payment.lobbyId);
            if (!lobby)
                return res.status(404).json({ message: "Lobby not found" });
            const playerData = {
                playerId: payment.playerId,
                matchPosition: payment.matchPosition || "",
                redCard: 0,
                yellowCard: 0,
                substitution: 0,
                assists: 0,
                goal: 0,
                tackle: 0,
                save: 0,
                rating: 0,
            };
            if (lobby.matchType === "solo") {
                const targetTeam = payment.defaultTeam;
                //@ts-ignore
                if (targetTeam === "defaultTeam1")
                    lobby.defaultTeam1.players.push(playerData);
                //@ts-ignore
                else if (targetTeam === "defaultTeam2")
                    lobby.defaultTeam2.players.push(playerData);
            }
            else {
                const team = ((_b = payment.teamId) === null || _b === void 0 ? void 0 : _b.toString()) === lobby.team1.teamId.toString() ? lobby.team1 : lobby.team2;
                //@ts-ignore
                team.players.push(playerData);
            }
            const profile = yield userModel.findById(payment.playerId);
            if (profile) {
                // Increment match count
                profile.match = (profile.match || 0) + 1;
                yield profile.save();
            }
            yield lobby.save();
            res.json({
                success: true,
                message: "Payment success and player added"
            });
        }
        if (payment.paymentType === "tournament fee") {
            if (payment.method !== "cash") {
                // Retrieve PaymentIntent from Stripe
                const session = yield stripe.checkout.sessions.retrieve(payment.stripePaymentIntentId, {
                    expand: ["payment_intent"],
                });
                if (((_c = session.payment_intent) === null || _c === void 0 ? void 0 : _c.status) !== "succeeded") {
                    return res.status(400).json({ message: "Payment not successful" });
                }
            }
            payment.status = "success";
            yield payment.save();
            const findTournament = yield TournamentModel.findById(payment.tournamentId);
            if (findTournament) {
                // team enter the tournament kaka
                const result = yield TournamentModel.findByIdAndUpdate(payment.tournamentId, { $addToSet: { teams: payment.teamId } }, { new: true });
                // standing model created
                yield StandingModel.create({ tournament: findTournament._id, team: payment.teamId });
                res.json({
                    success: true,
                    message: "Payment success and team added in Tournament",
                    data: result
                });
            }
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});
export const paymentCancel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { paymentId } = req.query;
        if (!paymentId)
            return res.status(400).json({ message: "Payment ID missing" });
        const payment = yield PaymentModel.findById(paymentId);
        if (!payment)
            return res.status(404).json({ message: "Payment not found" });
        payment.status = "failed";
        yield payment.save();
        res.json({ message: "Payment cancelled" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});
export const allPaymentHistory = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const paymentQuery = new QueryBuilder(PaymentModel.find().populate("lobbyId teamId playerId tournamentId").select("-stripePaymentIntentId"), req.query).filter().search(["status", "method"]).sort();
    const result = yield paymentQuery.modelQuery;
    res.status(200).json({
        success: true,
        message: "all payment data retrieved successfully",
        data: result
    });
}));
//# sourceMappingURL=payment.controller.js.map