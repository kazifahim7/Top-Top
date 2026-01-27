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
export const joinLobby = async (req, res) => {
    try {
        const { lobbyId, teamId, defaultTeam, matchPosition, price, matchFormat, method, tournamentId, paymentType, privateKey, ExtraPlayerId, guest_player } = req.body;
        let playerId = req.user.id;
        if (ExtraPlayerId) {
            if (req.user.role !== "organizer") {
                throw new AppError(403, "Only organizer can add extra player");
            }
            const lobby = await LobbyModel.findById(lobbyId);
            if (!lobby) {
                throw new AppError(404, "Lobby not found");
            }
            if (lobby.organizer.toString() !== req.user.id) {
                throw new AppError(403, "Unauthorized lobby access");
            }
            playerId = ExtraPlayerId;
        }
        const isGuestPlayer = guest_player === true ? true : false;
        if (!playerId) {
            throw new AppError(400, "User ID is required");
        }
        if (lobbyId) {
            const isLobbyExist = await LobbyModel.findById(lobbyId);
            if (!isLobbyExist) {
                throw new AppError(404, "Lobby not found");
            }
            let currentTeam;
            // Determine which team to check based on matchType
            if (isLobbyExist.matchType === "solo") {
                //@ts-ignore
                if (isLobbyExist.defaultTeam1?._id?.toString() === teamId?.toString()) {
                    currentTeam = isLobbyExist.defaultTeam1;
                    //@ts-ignore
                }
                else if (isLobbyExist.defaultTeam2?._id?.toString() === teamId?.toString()) {
                    currentTeam = isLobbyExist.defaultTeam2;
                }
            }
            else if (isLobbyExist.matchType === "teams") {
                const isTeamsExist = await TeamModel.findById(teamId);
                if (!isTeamsExist) {
                    throw new AppError(404, "Team not found");
                }
                if (isTeamsExist.teamOwner.toString() !== playerId &&
                    !isTeamsExist.players.includes(playerId)) {
                    throw new AppError(403, "You are not a team player");
                }
                if (isLobbyExist.team1?.teamId?.toString() === teamId?.toString()) {
                    currentTeam = isLobbyExist.team1;
                }
                else if (isLobbyExist.team2?.teamId?.toString() === teamId?.toString()) {
                    currentTeam = isLobbyExist.team2;
                }
            }
            // Check duplicate position only inside that specific team
            if (currentTeam?.players?.some((p) => p.matchPosition === matchPosition)) {
                return res.status(400).json({
                    message: "This position is already taken in this team",
                });
            }
            if (isLobbyExist?.matchPrivacy === "private") {
                if (!isLobbyExist) {
                    throw new AppError(404, "Lobby not found");
                }
                if (isLobbyExist.privateKey !== privateKey) {
                    throw new AppError(403, "Wrong key, Please enter a proper key");
                }
            }
        }
        if (tournamentId) {
            const isTournamentExist = await TournamentModel.findById(tournamentId);
            if (!isTournamentExist) {
                throw new AppError(404, "Tournament not found");
            }
            if (isTournamentExist.status === "block") {
                throw new AppError(403, "This tournament is currently blocked");
            }
        }
        if (lobbyId) {
            const isLobbyExist = await LobbyModel.findById(lobbyId);
            if (!isLobbyExist) {
                throw new AppError(404, "Lobby not found");
            }
            if (isLobbyExist.lobbyStatus === "block") {
                throw new AppError(403, "This lobby is currently blocked");
            }
        }
        const playerObjectId = typeof playerId === "string" ? new Types.ObjectId(playerId) : playerId;
        const teamObjectId = teamId ? (typeof teamId === "string" ? new Types.ObjectId(teamId) : teamId) : undefined;
        const allreadyRequestAviableInSamePosition = await PaymentModel.findOne({
            lobbyId,
            playerId,
            teamId,
            matchPosition,
            status: "pending",
            guest_player: isGuestPlayer
        });
        console.log(allreadyRequestAviableInSamePosition, "fahim");
        if (allreadyRequestAviableInSamePosition) {
            throw new AppError(403, "You already have a pending cash request for this position. Please wait for admin approval or choose another position.");
        }
        let payment;
        if (paymentType === "team fee") {
            const lobby = await LobbyModel.findById(lobbyId);
            if (!lobby)
                return res.status(404).json({ message: "Lobby not found" });
            // FIXED: Check if teams exist before accessing players
            const isDuplicate = (lobby.team1?.players?.some(p => p.playerId.toString() === playerObjectId.toString()) || false) ||
                (lobby.team2?.players?.some(p => p.playerId.toString() === playerObjectId.toString()) || false) ||
                (lobby.defaultTeam1?.players?.some(p => p.playerId.toString() === playerObjectId.toString()) || false) ||
                (lobby.defaultTeam2?.players?.some(p => p.playerId.toString() === playerObjectId.toString()) || false);
            if (isDuplicate)
                return res.status(400).json({ message: "Player already joined this lobby" });
            // FIXED: Check if teams exist and have players array before checking length
            const team1PlayersCount = lobby.team1?.players?.filter(player => player.guest_player === false).length || 0;
            const team2PlayersCount = lobby.team2?.players?.filter(player => player.guest_player === false).length || 0;
            const defaultTeam1PlayersCount = lobby.defaultTeam1?.players?.filter(player => player.guest_player === false).length || 0;
            const defaultTeam2PlayersCount = lobby.defaultTeam2?.players?.filter(player => player.guest_player === false).length || 0;
            // if (team1PlayersCount >= lobby.maxSlot && team2PlayersCount >= lobby.maxSlot) {
            //      return res.status(400).json({ message: "Both teams are full" });
            // }
            if (team1PlayersCount >= lobby.teamSize || team2PlayersCount >= lobby.teamSize) {
                return res.status(400).json({ message: " teams are full" });
            }
            // if (defaultTeam1PlayersCount >= lobby.maxSlot && defaultTeam2PlayersCount >= lobby.maxSlot) {
            //      return res.status(400).json({ message: "Both teams are full" });
            // }
            if (defaultTeam1PlayersCount >= lobby.teamSize || defaultTeam2PlayersCount >= lobby.teamSize) {
                return res.status(400).json({ message: " teams are full" });
            }
            // Create Payment Record (pending)
            payment = await PaymentModel.create({
                lobbyId,
                playerId: playerObjectId,
                teamId: teamId,
                price,
                status: "pending",
                method,
                matchPosition,
                matchFormat,
                paymentType,
                guest_player: isGuestPlayer
            });
        }
        else if (paymentType === "tournament fee") {
            const tournament = await TournamentModel.findById(tournamentId);
            if (!tournament)
                throw new AppError(404, "Tournament Not Found");
            if (tournament.teams.length >= tournament.maxTeam)
                throw new AppError(403, "Team is full");
            const findTeam = await TeamModel.findOne({ teamOwner: playerId });
            if (!findTeam)
                throw new AppError(404, "Team not Found");
            if (tournament.teams.some(t => t.toString() === findTeam._id.toString()))
                throw new AppError(400, "Team already exists");
            // Create Payment Record (pending)
            payment = await PaymentModel.create({
                tournamentId,
                teamId: findTeam._id,
                price,
                status: "pending",
                method,
                paymentType
            });
        }
        // Cash payment handling
        if (method === "cash") {
            const result = await payment.save();
            return res.json({
                success: true,
                message: "Cash request successfully sent. Wait for the admin.",
                data: result
            });
        }
        const paymentIntent = await stripe.paymentIntents.create({
            amount: price * 100,
            currency: "aed",
            metadata: {
                paymentId: payment._id.toString(),
                lobbyId: lobbyId?.toString() || "",
                tournamentId: tournamentId?.toString() || "",
                teamId: teamObjectId?.toString() || "",
                matchPosition: matchPosition || "",
                defaultTeam: defaultTeam || "",
                matchFormat: matchFormat || "",
                method
            }
        });
        if (!paymentIntent) {
            // Handle Stripe error
            await PaymentModel.findByIdAndUpdate(payment._id, { status: "failed" });
            throw new AppError(500, "Payment processing failed");
        }
        // Save PaymentIntent ID
        payment.stripePaymentIntentId = paymentIntent.id;
        await payment.save();
        // Return client_secret to Flutter
        return res.json({
            success: true,
            paymentId: payment._id,
            clientSecret: paymentIntent.client_secret
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message });
    }
};
export const paymentSuccess = async (req, res) => {
    try {
        const { paymentId } = req.query;
        if (!paymentId)
            return res.status(400).json({ message: "Payment ID missing" });
        const payment = await PaymentModel.findById(paymentId);
        if (!payment)
            return res.status(404).json({ message: "Payment not found" });
        if (payment.status === "success") {
            return res.json({ success: true, message: "Payment already processed" });
        }
        // Cash payments directly success
        if (payment.method === "cash") {
            payment.status = "success";
            await payment.save();
        }
        else {
            // Stripe PaymentIntent verification
            const intent = await stripe.paymentIntents.retrieve(payment.stripePaymentIntentId);
            if (intent.status !== "succeeded") {
                return res.status(400).json({ message: "Payment not successful" });
            }
            if (intent.metadata.paymentId !== payment._id.toString()) {
                return res.status(400).json({ message: "Payment metadata mismatch" });
            }
            if (intent.amount !== payment.price * 100 || intent.currency !== "aed") {
                return res.status(400).json({ message: "Payment amount or currency mismatch" });
            }
            payment.status = "success";
            await payment.save();
        }
        // Post-payment actions
        if (payment.paymentType === "team fee") {
            const lobby = await LobbyModel.findById(payment.lobbyId);
            if (!lobby)
                return res.status(404).json({ message: "Lobby not found" });
            if (!payment.playerId) {
                return res.status(400).json({ message: "Player ID missing for team fee payment" });
            }
            if (!payment.teamId) {
                return res.status(400).json({ message: "Team ID missing for team fee payment" });
            }
            // Player data with guest_player flag
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
                rating: 6.5,
                guest_player: payment.guest_player ?? false,
            };
            let targetTeam = null;
            let assignedTeam = "";
            if (lobby.matchType === "solo") {
                // FIXED: Check if player already exists in the SPECIFIC team they requested
                const requestedTeamId = payment.teamId.toString();
                // Check which team the player requested to join
                //@ts-ignore
                if (requestedTeamId === lobby.defaultTeam1?._id?.toString()) {
                    // Check if player already in defaultTeam1
                    const inTeam1 = lobby.defaultTeam1?.players?.some(p => p.playerId.toString() === payment.playerId.toString());
                    if (inTeam1) {
                        return res.status(400).json({
                            message: "Player already joined team 1"
                        });
                    }
                    targetTeam = lobby.defaultTeam1;
                    assignedTeam = "defaultTeam1";
                    //@ts-ignore
                }
                else if (requestedTeamId === lobby.defaultTeam2?._id?.toString()) {
                    // Check if player already in defaultTeam2
                    const inTeam2 = lobby.defaultTeam2?.players?.some(p => p.playerId.toString() === payment.playerId.toString());
                    if (inTeam2) {
                        return res.status(400).json({
                            message: "Player already joined team 2"
                        });
                    }
                    targetTeam = lobby.defaultTeam2;
                    assignedTeam = "defaultTeam2";
                }
                else {
                    return res.status(400).json({ message: "Invalid team selection" });
                }
                // Set match format for first player
                if (payment.matchFormat && (!targetTeam.matchFormat || targetTeam.matchFormat === "") && targetTeam.players.length === 0) {
                    targetTeam.matchFormat = payment.matchFormat;
                    lobby.markModified(`${assignedTeam}.matchFormat`);
                }
                // Add player
                targetTeam.players.push(playerData);
            }
            else {
                // Team match (non-solo)
                if (lobby.team1?.teamId && payment.teamId.toString() === lobby.team1.teamId.toString()) {
                    targetTeam = lobby.team1;
                    assignedTeam = "team1";
                }
                else if (lobby.team2?.teamId && payment.teamId.toString() === lobby.team2.teamId.toString()) {
                    targetTeam = lobby.team2;
                    assignedTeam = "team2";
                }
                else {
                    return res.status(400).json({ message: "Team not found in lobby" });
                }
                if (!targetTeam.players)
                    targetTeam.players = [];
                if (payment.matchFormat && (!targetTeam.matchFormat || targetTeam.matchFormat === "") && targetTeam.players.length === 0) {
                    targetTeam.matchFormat = payment.matchFormat;
                    if (assignedTeam === "team1")
                        lobby.markModified("team1.matchFormat");
                    if (assignedTeam === "team2")
                        lobby.markModified("team2.matchFormat");
                }
                targetTeam.players.push(playerData);
            }
            // Update user match count
            await userModel.findByIdAndUpdate(payment.playerId, { $inc: { match: 1 } });
            await lobby.save();
            return res.json({
                success: true,
                message: "Payment successful and player added",
                assignedTeam: assignedTeam,
                guest_player: playerData.guest_player,
            });
        }
        // Tournament fee handling
        if (payment.paymentType === "tournament fee") {
            const tournament = await TournamentModel.findById(payment.tournamentId);
            if (!tournament)
                return res.status(404).json({ message: "Tournament not found" });
            if (!payment.teamId)
                return res.status(400).json({ message: "Team ID missing for tournament fee payment" });
            const result = await TournamentModel.findByIdAndUpdate(payment.tournamentId, { $addToSet: { teams: payment.teamId } }, { new: true });
            await StandingModel.create({ tournament: tournament._id, team: payment.teamId });
            return res.json({
                success: true,
                message: "Payment successful and team added to tournament",
                data: result,
            });
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};
export const paymentCancel = async (req, res) => {
    try {
        const { paymentId } = req.query;
        if (!paymentId)
            return res.status(400).json({ message: "Payment ID missing" });
        const payment = await PaymentModel.findById(paymentId);
        if (!payment)
            return res.status(404).json({ message: "Payment not found" });
        payment.status = "failed";
        await payment.save();
        res.json({ message: "Payment cancelled" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};
export const allPaymentHistory = catchAsync(async (req, res) => {
    const paymentQuery = new QueryBuilder(PaymentModel.find().populate("lobbyId  playerId tournamentId").select("-stripePaymentIntentId"), req.query).filter().search(["status", "method"]).sort();
    const result = await paymentQuery.modelQuery;
    res.status(200).json({
        success: true,
        message: "all payment data retrieved successfully",
        data: result
    });
});
export const allPaymentHistoryOrganizer = catchAsync(async (req, res) => {
    const organizerId = req.user.id;
    const paymentQuery = new QueryBuilder(PaymentModel.find()
        .populate("lobbyId playerId tournamentId teamId")
        .select("-stripePaymentIntentId"), req.query)
        .filter()
        .search(["status", "method"])
        .sort();
    const result = await paymentQuery.modelQuery;
    // 🔥 Organizer-wise filter
    const organizerPayments = result.filter((payment) => {
        // tournament payment
        if (payment.tournamentId &&
            payment.tournamentId.organizer?.toString() === organizerId) {
            return true;
        }
        // lobby payment
        if (payment.lobbyId &&
            payment.lobbyId.organizer?.toString() === organizerId) {
            return true;
        }
        return false;
    });
    res.status(200).json({
        success: true,
        message: "Organizer payment history retrieved successfully",
        data: organizerPayments,
    });
});
//# sourceMappingURL=payment.controller.js.map