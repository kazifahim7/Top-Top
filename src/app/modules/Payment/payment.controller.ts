import Stripe from "stripe";
import { PaymentModel } from "./payment.model.js";
import { LobbyModel } from "../Lobby/lobby.model.js";
import { Types } from "mongoose";
import type { Request, Response } from "express";
import config from "../../config/index.js";
import catchAsync from "../../utils/catcgAsync.js";
import QueryBuilder from "../../builder/QueryBuilder.js";
import { userModel } from "../auth/auth.model.js";
import { TournamentModel } from "../Tournament/Tournament.model.js";
import AppError from "../../Error/AppError.js";
import { TeamModel } from "../Team/team.model.js";
import { StandingModel } from "../PointTable/pointtable.model.js";

const stripe = new Stripe(config.sk_key!, { apiVersion: "2025-08-27.basil" as any });


export const joinLobby = async (req: Request, res: Response) => {
     try {
          const playerId = req?.user?.id;
          const { lobbyId, teamId, defaultTeam, matchPosition, price, matchFormat, method, tournamentId, paymentType } = req.body;

          const playerObjectId = typeof playerId === "string" ? new Types.ObjectId(playerId) : playerId;
          const teamObjectId = teamId ? (typeof teamId === "string" ? new Types.ObjectId(teamId) : teamId) : undefined;

          let payment: any;

          if (paymentType === "team fee") {
               const lobby = await LobbyModel.findById(lobbyId);
               if (!lobby) return res.status(404).json({ message: "Lobby not found" });

               // Duplicate & slot check
               const isDuplicate =
                    lobby.team1?.players.some(p => p.playerId.toString() === playerObjectId.toString()) ||
                    lobby.team2?.players.some(p => p.playerId.toString() === playerObjectId.toString()) ||
                    lobby.defaultTeam1?.players.some(p => p.playerId.toString() === playerObjectId.toString()) ||
                    lobby.defaultTeam2?.players.some(p => p.playerId.toString() === playerObjectId.toString());

               if (isDuplicate) return res.status(400).json({ message: "Player already joined this lobby" });
               if (lobby.team1!.players.length >= lobby.maxSlot && lobby.team2!.players.length >= lobby.maxSlot)
                    return res.status(400).json({ message: "Both teams are full" });

               // Create Payment Record (pending)
               payment = await PaymentModel.create({
                    lobbyId,
                    playerId: playerObjectId,
                    teamId: teamObjectId,
                    price,
                    status: "pending",
                    method,
                    matchPosition,
                    paymentType
               });

          } else if (paymentType === "tournament fee") {
               const tournament = await TournamentModel.findById(tournamentId);
               if (!tournament) throw new AppError(404, "Tournament Not Found");
               if (tournament.teams.length >= tournament.maxTeam) throw new AppError(403, "Team is full");

               const findTeam = await TeamModel.findOne({ teamOwner: playerId });
               if (!findTeam) throw new AppError(404, "Team not Found");
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

          // 💳 Stripe PaymentIntent for Flutter PaymentSheet
          const paymentIntent = await stripe.paymentIntents.create({
               amount: price * 100,
               currency: "usd",
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

          // Save PaymentIntent ID
          payment.stripePaymentIntentId = paymentIntent.id;
          await payment.save();

          // Return client_secret to Flutter
          return res.json({
               success: true,
               paymentId: payment._id,
               clientSecret: paymentIntent.client_secret
          });

     } catch (err: any) {
          console.error(err);
          return res.status(500).json({ message: err.message });
     }
};



export const paymentSuccess = async (req: Request, res: Response) => {
     try {
          const { paymentId } = req.query;
          if (!paymentId) return res.status(400).json({ message: "Payment ID missing" });

          const payment = await PaymentModel.findById(paymentId);
          if (!payment) return res.status(404).json({ message: "Payment not found" });

          // Cash payments directly success
          if (payment.method === "cash") {
               payment.status = "success";
               await payment.save();
          } else {
               // Stripe PaymentIntent verification
               const intent = await stripe.paymentIntents.retrieve(payment.stripePaymentIntentId!);
               if (intent.status !== "succeeded") {
                    return res.status(400).json({ message: "Payment not successful" });
               }
               payment.status = "success";
               await payment.save();
          }

          // Post-payment actions
          if (payment.paymentType === "team fee") {
               const lobby = await LobbyModel.findById(payment.lobbyId);
               if (!lobby) return res.status(404).json({ message: "Lobby not found" });

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
                    if (targetTeam === "defaultTeam1") lobby.defaultTeam1!.players.push(playerData);
                    //@ts-ignore
                    else if (targetTeam === "defaultTeam2") lobby.defaultTeam2!.players.push(playerData);
               } else {
                    const team = payment.teamId?.toString() === lobby.team1!.teamId.toString() ? lobby.team1 : lobby.team2;
                    //@ts-ignore
                    team!.players.push(playerData);
               }

               const profile = await userModel.findById(payment.playerId);
               if (profile) {
                    profile.match = (profile.match || 0) + 1;
                    await profile.save();
               }

               await lobby.save();
               return res.json({ success: true, message: "Payment successful and player added" });
          }

          if (payment.paymentType === "tournament fee") {
               const tournament = await TournamentModel.findById(payment.tournamentId);
               if (!tournament) return res.status(404).json({ message: "Tournament not found" });

               // Add team to tournament
               const result = await TournamentModel.findByIdAndUpdate(
                    payment.tournamentId,
                    { $addToSet: { teams: payment.teamId } },
                    { new: true }
               );

               // Create standing for the team
               await StandingModel.create({ tournament: tournament._id, team: payment.teamId });

               return res.json({
                    success: true,
                    message: "Payment successful and team added to tournament",
                    data: result
               });
          }

     } catch (err) {
          console.error(err);
          res.status(500).json({ message: "Internal server error" });
     }
};



export const paymentCancel = async (req: Request, res: Response) => {
     try {
          const { paymentId } = req.query;
          if (!paymentId) return res.status(400).json({ message: "Payment ID missing" });

          const payment = await PaymentModel.findById(paymentId);
          if (!payment) return res.status(404).json({ message: "Payment not found" });

          payment.status = "failed";
          await payment.save();

          res.json({ message: "Payment cancelled" });
     } catch (err) {
          console.error(err);
          res.status(500).json({ message: "Internal server error" });
     }
};


export const allPaymentHistory = catchAsync(async (req, res) => {
     const paymentQuery = new QueryBuilder(PaymentModel.find().populate("lobbyId teamId playerId tournamentId").select("-stripePaymentIntentId"), req.query).filter().search(["status", "method"]).sort()
     const result = await paymentQuery.modelQuery

     res.status(200).json({
          success: true,
          message: "all payment data retrieved successfully",
          data: result
     })
})
