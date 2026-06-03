import Stripe from "stripe";
import { PaymentModel } from "./payment.model.js";
import { LobbyModel } from "../Lobby/lobby.model.js";
import { isValidObjectId, Types } from "mongoose";
import { response, type Request, type Response } from "express";
import config from "../../config/index.js";
import catchAsync from "../../utils/catcgAsync.js";
import QueryBuilder from "../../builder/QueryBuilder.js";
import { userModel } from "../auth/auth.model.js";
import { TournamentModel } from "../Tournament/Tournament.model.js";
import AppError from "../../Error/AppError.js";
import { TeamModel } from "../Team/team.model.js";
import { StandingModel } from "../PointTable/pointtable.model.js";

const stripe = new Stripe(config.sk_key!, { apiVersion: "2024-06-20" as any });

export const joinLobby = async (req: Request, res: Response) => {
     try {
          const {
               lobbyId,
               teamId,
               defaultTeam,
               matchPosition,
               matchFormat,
               method,
               tournamentId,
               paymentType,
               privateKey,
               ExtraPlayerId,
               guest_player,
               teamPlayerId,
          } = req.body;

          let playerId = req.user.id;


          
          // ─── Extra Player (Organizer OR Team Captain OR Team Owner) ───────────
          if (ExtraPlayerId) {
               const isOrganizer = req.user.role === "organizer";

               let isCaptainOfThisTeam = false;
               let isOwnerOfThisTeam = false;  

               if (teamId) {
                    const team = await TeamModel.findById(teamId);
                    if (team) {
                         // Captain check
                         isCaptainOfThisTeam = team.teamCaptain.some(
                              (captain) => captain.toString() === req.user.id.toString()
                         );

                         // ✅ Owner check
                         isOwnerOfThisTeam = team.teamOwner.toString() === req.user.id.toString();
                    }
               }

               if (!isOrganizer && !isCaptainOfThisTeam && !isOwnerOfThisTeam) {  // ✅
                    throw new AppError(
                         403,
                         "Only the organizer, team owner or team captain can add an extra player"
                    );
               }

               
               if (isOrganizer) {
                    const lobby = await LobbyModel.findById(lobbyId);
                    if (!lobby) throw new AppError(404, "Lobby not found");

                    if (lobby.organizer.toString() !== req.user.id) {
                         throw new AppError(403, "Unauthorized lobby access");
                    }
               }

               playerId = ExtraPlayerId;
          }

          const isGuestPlayer = guest_player === true ? true : false;

          if (!playerId) throw new AppError(400, "User ID is required");

          // ─── Global Guard: teamPlayerId শুধু organizer অথবা team captain ব্যবহার করতে পারবে ──
          // Normal member বা অন্য কেউ teamPlayerId দিলে সাথে সাথে reject
          if (teamPlayerId) {
               const isOrganizer = req.user.role === "organizer";

               let isCaptain = false;
               if (teamId) {
                    const team = await TeamModel.findById(teamId);
                    if (team) {
                         isCaptain = team.teamOwner.toString() === playerId.toString();
                    }
               }

               if (!isOrganizer && !isCaptain) {
                    throw new AppError(
                         403,
                         "Only the team captain or organizer can add players on behalf of others"
                    );
               }
          }

          // ─── Lobby Validation ─────────────────────────────────────────────────
          if (lobbyId) {
               const isLobbyExist = await LobbyModel.findById(lobbyId);
               if (!isLobbyExist) throw new AppError(404, "Lobby not found");

               let currentTeam;

               if (isLobbyExist.matchType === "solo") {
                    //@ts-ignore
                    if (isLobbyExist.defaultTeam1?._id?.toString() === teamId?.toString()) {
                         currentTeam = isLobbyExist.defaultTeam1;
                         //@ts-ignore
                    } else if (isLobbyExist.defaultTeam2?._id?.toString() === teamId?.toString()) {
                         currentTeam = isLobbyExist.defaultTeam2;
                    }

               } else if (isLobbyExist.matchType === "teams") {
                    const isTeamsExist = await TeamModel.findById(teamId);
                    if (!isTeamsExist) throw new AppError(404, "Team not found");

                    const isOwner = isTeamsExist.teamOwner.toString() === playerId.toString();
                    const isMember = isTeamsExist.players.some(
                         (p) => p.toString() === playerId.toString()
                    );

                    // ─── Only captain can add other players via teamPlayerId ──────
                    if (!isOwner && teamPlayerId) {
                         throw new AppError(
                              403,
                              "Only the team captain can add players on behalf of others"
                         );
                    }

                    // Captain or team member can join
                    if (!isOwner && !isMember) {
                         throw new AppError(403, "You are not a member of this team");
                    }

                    // Captain adding a member: verify member belongs to the team
                    if (isOwner && teamPlayerId) {
                         const isMemberValid = isTeamsExist.players.some(
                              (p) => p.toString() === teamPlayerId.toString()
                         );
                         if (!isMemberValid) {
                              throw new AppError(403, "This player is not a member of your team");
                         }
                    }

                    // Member joining themselves: check captain hasn't already initiated payment for them
                    if (!isOwner && isMember) {
                         const alreadyPaidByCaptain = await PaymentModel.findOne({
                              lobbyId,
                              playerId: new Types.ObjectId(playerId),
                              teamId,
                              status: { $in: ["pending", "paid", "success"] },
                              paymentType: "team fee",
                         });

                         if (alreadyPaidByCaptain) {
                              throw new AppError(
                                   400,
                                   "Already joined"
                              );
                         }
                    }

                    // Opponent team check
                    const checkPlayerId = teamPlayerId ? teamPlayerId.toString() : playerId.toString();
                    const team1Players = isLobbyExist.team1?.players || [];
                    const team2Players = isLobbyExist.team2?.players || [];

                    const isInTeam1 = team1Players.some((p) => p.playerId.toString() === checkPlayerId);
                    const isInTeam2 = team2Players.some((p) => p.playerId.toString() === checkPlayerId);

                    if (isLobbyExist.team1?.teamId?.toString() === teamId?.toString() && isInTeam2) {
                         throw new AppError(403, "This player is already joined in the opponent team");
                    }
                    if (isLobbyExist.team2?.teamId?.toString() === teamId?.toString() && isInTeam1) {
                         throw new AppError(403, "This player is already joined in the opponent team");
                    }

                    if (isLobbyExist.team1?.teamId?.toString() === teamId?.toString()) {
                         currentTeam = isLobbyExist.team1;
                    } else if (isLobbyExist.team2?.teamId?.toString() === teamId?.toString()) {
                         currentTeam = isLobbyExist.team2;
                    }
               }

               // ─── Duplicate position check ─────────────────────────────────────
              
               const playersInSamePosition = currentTeam?.players?.filter(
                    (p: any) => p.matchPosition === matchPosition
               ) || [];

               // const allowedCountForPosition = matchPosition === "Striker" ? 2 : 1;

               if (playersInSamePosition.length >= 1) {
                    return res.status(400).json({ message: "This position is already taken in this team" });
               }

               // Private lobby key check
               if (isLobbyExist?.matchPrivacy === "private") {
                    if (isLobbyExist.privateKey !== privateKey) {
                         throw new AppError(403, "Wrong key, Please enter a proper key");
                    }
               }
          }

          // ─── Tournament Validation ────────────────────────────────────────────
          if (tournamentId) {
               const isTournamentExist = await TournamentModel.findById(tournamentId);
               if (!isTournamentExist) throw new AppError(404, "Tournament not found");
               if (isTournamentExist.status === "block") {
                    throw new AppError(403, "This tournament is currently blocked");
               }
          }

          // ─── Lobby Block Check ────────────────────────────────────────────────
          if (lobbyId) {
               const isLobbyExist = await LobbyModel.findById(lobbyId);
               if (!isLobbyExist) throw new AppError(404, "Lobby not found");
               if (isLobbyExist.lobbyStatus === "block") {
                    throw new AppError(403, "This lobby is currently blocked");
               }
          }

          const playerObjectId =
               typeof playerId === "string" ? new Types.ObjectId(playerId) : playerId;
          const teamObjectId = teamId
               ? typeof teamId === "string" ? new Types.ObjectId(teamId) : teamId
               : undefined;

          // ─── Pending check ────────────────────────────────────────────────────
     
          const checkPlayerForPending = teamPlayerId
               ? new Types.ObjectId(teamPlayerId)
               : playerObjectId;

          const alreadyBooked = await PaymentModel.findOne({
               lobbyId,
               playerId: checkPlayerForPending,
               teamId,
               matchPosition,
               status: { $in: ["paid", "success"] },
          });

          if (alreadyBooked) {
               throw new AppError(400, "This position is already booked.");
          }

          if (method === "cash") {
               const alreadyPendingInSamePosition = await PaymentModel.findOne({
                    lobbyId,
                    playerId: checkPlayerForPending,
                    teamId,
                    matchPosition,
                    status: "pending",
                    guest_player: isGuestPlayer,
               });

               if (alreadyPendingInSamePosition) {
                    throw new AppError(
                         403,
                         "This player already has a pending cash request for this position."
                    );
               }
          }
          let price: number = 0;
          let payment: any;

          // ─── Team Fee ─────────────────────────────────────────────────────────
          if (paymentType === "team fee") {
               const lobby = await LobbyModel.findById(lobbyId);
               if (!lobby) return res.status(404).json({ message: "Lobby not found" });
               price = lobby.price;
               if (lobby.matchType === "teams") {
                    const isTeamsExist = await TeamModel.findById(teamId);
                    if (!isTeamsExist) throw new AppError(404, "Team not found");

                    const isOwner = isTeamsExist.teamOwner.toString() === playerObjectId.toString();

                    // ══════════════════════════════════════════════════════════════
                    // CASE 1: Captain নিজে join করছে (teamPlayerId নেই)
                    // Captain নিজেই pay করবে — stripe অথবা cash
                    // ══════════════════════════════════════════════════════════════
                    if (isOwner && !teamPlayerId) {
                         const isDuplicate =
                              lobby.team1?.players?.some((p) => p.playerId.toString() === playerObjectId.toString()) ||
                              lobby.team2?.players?.some((p) => p.playerId.toString() === playerObjectId.toString());

                         if (isDuplicate) {
                              return res.status(400).json({ message: "Captain already joined this lobby" });
                         }

                         const team1Count = lobby.team1?.players?.filter((p) => !p.guest_player).length || 0;
                         const team2Count = lobby.team2?.players?.filter((p) => !p.guest_player).length || 0;

                         if (
                              (lobby.team1?.teamId?.toString() === teamId?.toString() && team1Count >= lobby.teamSize) ||
                              (lobby.team2?.teamId?.toString() === teamId?.toString() && team2Count >= lobby.teamSize)
                         ) {
                              return res.status(400).json({ message: "Team is full" });
                         }

                         // Captain pays for himself — normal stripe/cash flow
                         payment = await PaymentModel.create({
                              lobbyId,
                              playerId: playerObjectId,
                              teamId,
                              price,
                              status: "pending",
                              method,
                              matchPosition,
                              matchFormat,
                              paymentType,
                              guest_player: isGuestPlayer,
                         });

                         
                    } else if (isOwner && teamPlayerId) {
                         const teamPlayerObjectId = new Types.ObjectId(teamPlayerId);

                         // Duplicate check for that member
                         const isMemberDuplicate =
                              lobby.team1?.players?.some((p) => p.playerId.toString() === teamPlayerObjectId.toString()) ||
                              lobby.team2?.players?.some((p) => p.playerId.toString() === teamPlayerObjectId.toString());

                         if (isMemberDuplicate) {
                              return res.status(400).json({ message: "This player already joined this lobby" });
                         }

                         const team1Count = lobby.team1?.players?.filter((p) => !p.guest_player).length || 0;
                         const team2Count = lobby.team2?.players?.filter((p) => !p.guest_player).length || 0;

                         if (
                              (lobby.team1?.teamId?.toString() === teamId?.toString() && team1Count >= lobby.teamSize) ||
                              (lobby.team2?.teamId?.toString() === teamId?.toString() && team2Count >= lobby.teamSize)
                         ) {
                              return res.status(400).json({ message: "Team is full" });
                         }

                         // Captain pays full price for this member
                         // playerId = teamPlayerObjectId so webhook correctly adds the member to lobby
                         payment = await PaymentModel.create({
                              lobbyId,
                              playerId: teamPlayerObjectId,
                              teamId,
                              price,
                              status: "pending",
                              method,
                              matchPosition,
                              matchFormat,
                              paymentType,
                              guest_player: isGuestPlayer,
                         });

                         // ══════════════════════════════════════════════════════════════
                         // CASE 3: Member নিজে individually join করছে, নিজেই pay করবে
                         // ══════════════════════════════════════════════════════════════
                    } else if (!isOwner) {
                         const isDuplicate =
                              lobby.team1?.players?.some((p) => p.playerId.toString() === playerObjectId.toString()) ||
                              lobby.team2?.players?.some((p) => p.playerId.toString() === playerObjectId.toString());

                         if (isDuplicate) {
                              return res.status(400).json({ message: "You already joined this lobby" });
                         }

                         const team1Count = lobby.team1?.players?.filter((p) => !p.guest_player).length || 0;
                         const team2Count = lobby.team2?.players?.filter((p) => !p.guest_player).length || 0;

                         if (
                              (lobby.team1?.teamId?.toString() === teamId?.toString() && team1Count >= lobby.teamSize) ||
                              (lobby.team2?.teamId?.toString() === teamId?.toString() && team2Count >= lobby.teamSize)
                         ) {
                              return res.status(400).json({ message: "Team is full" });
                         }

                         // Member pays for himself — normal stripe/cash flow
                         payment = await PaymentModel.create({
                              lobbyId,
                              playerId: playerObjectId,
                              teamId,
                              price,
                              status: "pending",
                              method,
                              matchPosition,
                              matchFormat,
                              paymentType,
                              guest_player: isGuestPlayer,
                         });
                    }

                    // ══════════════════════════════════════════════════════════════════
                    // SOLO match
                    // ══════════════════════════════════════════════════════════════════
               } else {
                    const isDuplicate =
                         (lobby.defaultTeam1?.players?.some((p) => p.playerId.toString() === playerObjectId.toString()) || false) ||
                         (lobby.defaultTeam2?.players?.some((p) => p.playerId.toString() === playerObjectId.toString()) || false);

                    if (isDuplicate) return res.status(400).json({ message: "Player already joined this lobby" });

                    const defTeam1Count = lobby.defaultTeam1?.players?.filter((p) => !p.guest_player).length || 0;
                    const defTeam2Count = lobby.defaultTeam2?.players?.filter((p) => !p.guest_player).length || 0;

                    if (defTeam1Count >= lobby.teamSize || defTeam2Count >= lobby.teamSize) {
                         return res.status(400).json({ message: "Teams are full" });
                    }

                    payment = await PaymentModel.create({
                         lobbyId,
                         playerId: playerObjectId,
                         teamId,
                         price,
                         status: "pending",
                         method,
                         matchPosition,
                         matchFormat,
                         paymentType,
                         guest_player: isGuestPlayer,
                    });
               }

               // ─── Tournament Fee ───────────────────────────────────────────────────
          } else if (paymentType === "tournament fee") {
               const tournament = await TournamentModel.findById(tournamentId);
               if (!tournament) throw new AppError(404, "Tournament Not Found");
               price = tournament.price; 

               const findTeam = await TeamModel.findOne({ teamOwner: playerId });
               if (!findTeam) throw new AppError(404, "Team not Found");

               if (tournament.type === "Both" || tournament.type === "League") {
                    if (tournament.teams.length >= tournament.maxTeam) throw new AppError(403, "Team is full");
                    if (tournament.teams.some((t) => t.toString() === findTeam._id.toString()))
                         throw new AppError(400, "Team already exists");
               }

               if (tournament.type === "Knockout") {
                    if (tournament.qualifiedTeams.length >= tournament.maxTeam) throw new AppError(403, "Team is full");
                    if (tournament.qualifiedTeams.some((t) => t.toString() === findTeam._id.toString()))
                         throw new AppError(400, "Team already exists");
               }

               payment = await PaymentModel.create({
                    tournamentId,
                    teamId: findTeam._id,
                    price,
                    status: "pending",
                    method,
                    paymentType,
               });
          }

          // ─── Cash Payment ─────────────────────────────────────────────────────
          if (method === "cash") {
               const result = await payment.save();
               return res.json({
                    success: true,
                    message: "Cash request successfully sent. Wait for the admin.",
                    data: result,
               });
          }
          const emailPlayerId = teamPlayerId
               ? new Types.ObjectId(teamPlayerId)
               : playerObjectId;

          const player = await userModel.findById(emailPlayerId);

          // ─── Stripe Customer ───
          let stripeCustomer;

          if (player?.email) {
               const existingCustomers = await stripe.customers.list({
                    email: player.email, 
                    limit: 1
               });

               stripeCustomer = existingCustomers.data.length > 0
                    ? existingCustomers.data[0]
                    : await stripe.customers.create({
                         email: player.email,      
                         name: player.FullName ?? "", 
                    });
          }

          // ─── Stripe Payment ───────────────────────────────────────────────────
          const paymentIntent = await stripe.paymentIntents.create({
               amount: price * 100,
               currency: "aed",
               automatic_payment_methods: {
                    enabled: true,  
               },
               ...(stripeCustomer && { customer: stripeCustomer.id }), 
               metadata: {
                    paymentId: payment._id.toString(),
                    lobbyId: lobbyId?.toString() || "",
                    tournamentId: tournamentId?.toString() || "",
                    teamId: teamObjectId?.toString() || "",
                    matchPosition: matchPosition || "",
                    defaultTeam: defaultTeam || "",
                    matchFormat: matchFormat || "",
                    method,
               },
          });

          if (!paymentIntent) {
               await PaymentModel.findByIdAndUpdate(payment._id, { status: "failed" });
               throw new AppError(500, "Payment processing failed");
          }

          payment.stripePaymentIntentId = paymentIntent.id;
          await payment.save();

          return res.json({
               success: true,
               paymentId: payment._id,
               clientSecret: paymentIntent.client_secret,
          });

     } catch (err: any) {
          console.error(err);
          return res.status(500).json({ message: err.message });
     }
};



// ─── Helper Function ──────────────────────────────────────────────────────────
async function checkPositionAvailability(payment: any): Promise<string | null> {
     if (payment.paymentType !== "team fee" || !payment.matchPosition) return null;

     const lobby = await LobbyModel.findById(payment.lobbyId);
     if (!lobby) return "Lobby not found";

     let targetTeamPlayers: any[] = [];

     if (lobby.matchType === "solo") {
          //@ts-ignore
          if (payment.teamId?.toString() === lobby.defaultTeam1?._id?.toString()) {
               targetTeamPlayers = lobby.defaultTeam1?.players || [];
               //@ts-ignore
          } else if (payment.teamId?.toString() === lobby.defaultTeam2?._id?.toString()) {
               targetTeamPlayers = lobby.defaultTeam2?.players || [];
          }
     } else {
          if (payment.teamId?.toString() === lobby.team1?.teamId?.toString()) {
               targetTeamPlayers = lobby.team1?.players || [];
          } else if (payment.teamId?.toString() === lobby.team2?.teamId?.toString()) {
               targetTeamPlayers = lobby.team2?.players || [];
          }
     }

     const positionTakenInLobby = targetTeamPlayers.some(
          (p: any) => p.matchPosition === payment.matchPosition
     );

     const positionTakenInPayment = await PaymentModel.findOne({
          lobbyId: payment.lobbyId,
          teamId: payment.teamId,
          matchPosition: payment.matchPosition,
          status: { $in: ["success", "paid"] },
          _id: { $ne: payment._id },
     });

     if (positionTakenInLobby || positionTakenInPayment) {
          // ✅ same position এ সব pending payment failed করে দাও
          await PaymentModel.updateMany(
               {
                    lobbyId: payment.lobbyId,
                    teamId: payment.teamId,
                    matchPosition: payment.matchPosition,
                    status: "pending",
                    _id: { $ne: payment._id },
               },
               { $set: { status: "failed" } }
          );

          return "This position is already taken. Payment has been cancelled.";
     }

     return null;
}

// ─── Main Controller ──────────────────────────────────────────────────────────
export const paymentSuccess = async (req: Request, res: Response) => {
     try {
          const { paymentId } = req.query;
          if (!paymentId) return res.status(400).json({ message: "Payment ID missing" });

          const payment = await PaymentModel.findById(paymentId);
          if (!payment) return res.status(404).json({ message: "Payment not found" });

          // ─── Already processed check ──────────────────────────────────────────
          if (payment.status === "success" || payment.status === "paid") {
               return res.json({ success: true, message: "Payment already processed" });
          }

          // ─── Cash Payment ─────────────────────────────────────────────────────
          if (payment.method === "cash") {
               const positionError = await checkPositionAvailability(payment);
               if (positionError) {
                    payment.status = "failed";
                    await payment.save();
                    return res.status(400).json({ message: positionError });
               }

               payment.status = "success";
               await payment.save();

               // ─── Stripe Payment ───────────────────────────────────────────────────
          } else {
               const intent = await stripe.paymentIntents.retrieve(payment.stripePaymentIntentId!);

               if (intent.status !== "succeeded") {
                    return res.status(400).json({ message: "Payment not successful" });
               }
               if (intent.metadata.paymentId !== payment._id.toString()) {
                    return res.status(400).json({ message: "Payment metadata mismatch" });
               }
               if (intent.amount !== payment.price * 100 || intent.currency !== "aed") {
                    return res.status(400).json({ message: "Payment amount or currency mismatch" });
               }

               const positionError = await checkPositionAvailability(payment);
               if (positionError) {
                    payment.status = "failed";
                    await payment.save();
                    // Auto-refund
                    await stripe.refunds.create({ payment_intent: intent.id });
                    return res.status(400).json({ message: positionError });
               }

               payment.status = "paid";
               await payment.save();
          }

          // ─── Post-payment: Team Fee ───────────────────────────────────────────
          if (payment.paymentType === "team fee") {
               const lobby = await LobbyModel.findById(payment.lobbyId);
               if (!lobby) return res.status(404).json({ message: "Lobby not found" });

               if (!payment.playerId) {
                    return res.status(400).json({ message: "Player ID missing for team fee payment" });
               }
               if (!payment.teamId) {
                    return res.status(400).json({ message: "Team ID missing for team fee payment" });
               }

               const player = await userModel.findById(payment.playerId);
               if (!player) return res.status(404).json({ message: "Player not found" });

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

               let assignedTeam = "";

               const calculateAverageMainRating = (players: any[]) => {
                    if (!players || players.length === 0) return 0;
                    const sum = players.reduce((total: number, p: any) => {
                         return total + (p.mainRating || p.rating || 0);
                    }, 0);
                    return sum / players.length;
               };

               // ─── Solo Match ────────────────────────────────────────────────────
               if (lobby.matchType === "solo") {
                    const requestedTeamId = payment.teamId.toString();
                    //@ts-ignore
                    if (requestedTeamId === lobby.defaultTeam1?._id?.toString()) {
                         const inTeam1 = lobby.defaultTeam1?.players?.some(
                              (p) => p.playerId.toString() === payment.playerId!.toString()
                         );
                         if (inTeam1) return res.status(400).json({ message: "Player already joined team 1" });

                         if (
                              payment.matchFormat &&
                              (!lobby.defaultTeam1.matchFormat || lobby.defaultTeam1.matchFormat === "") &&
                              lobby.defaultTeam1.players.length === 0
                         ) {
                              lobby.defaultTeam1.matchFormat = payment.matchFormat;
                              lobby.markModified("defaultTeam1.matchFormat");
                         }
                         //@ts-ignore
                         lobby.defaultTeam1.players.push(playerData);
                         assignedTeam = "defaultTeam1";
                         //@ts-ignore
                    } else if (requestedTeamId === lobby.defaultTeam2?._id?.toString()) {
                         const inTeam2 = lobby.defaultTeam2?.players?.some(
                              (p) => p.playerId.toString() === payment.playerId!.toString()
                         );
                         if (inTeam2) return res.status(400).json({ message: "Player already joined team 2" });

                         if (
                              payment.matchFormat &&
                              (!lobby.defaultTeam2.matchFormat || lobby.defaultTeam2.matchFormat === "") &&
                              lobby.defaultTeam2.players.length === 0
                         ) {
                              lobby.defaultTeam2.matchFormat = payment.matchFormat;
                              lobby.markModified("defaultTeam2.matchFormat");
                         }

                         lobby.defaultTeam2.players.push(playerData);
                         assignedTeam = "defaultTeam2";
                    } else {
                         return res.status(400).json({ message: "Invalid team selection" });
                    }

                    if (lobby.defaultTeam1?.players) {
                         lobby.team1AvgMatchRatingBefore = calculateAverageMainRating(lobby.defaultTeam1.players);
                    }
                    if (lobby.defaultTeam2?.players) {
                         lobby.team2AvgMatchRatingBefore = calculateAverageMainRating(lobby.defaultTeam2.players);
                    }

                    // ─── Teams Match ───────────────────────────────────────────────────
               } else {
                    if (lobby.team1?.teamId && payment.teamId.toString() === lobby.team1.teamId.toString()) {
                         assignedTeam = "team1";

                         if (
                              payment.matchFormat &&
                              (!lobby.team1.matchFormat || lobby.team1.matchFormat === "") &&
                              lobby.team1.players.length === 0
                         ) {
                              lobby.team1.matchFormat = payment.matchFormat;
                              lobby.markModified("team1.matchFormat");
                         }
                         if (!lobby.team1.players) lobby.team1.players = [];
                         lobby.team1.players.push(playerData);

                    } else if (lobby.team2?.teamId && payment.teamId.toString() === lobby.team2.teamId.toString()) {
                         assignedTeam = "team2";

                         if (
                              payment.matchFormat &&
                              (!lobby.team2.matchFormat || lobby.team2.matchFormat === "") &&
                              lobby.team2.players.length === 0
                         ) {
                              lobby.team2.matchFormat = payment.matchFormat;
                              lobby.markModified("team2.matchFormat");
                         }
                         if (!lobby.team2.players) lobby.team2.players = [];
                         lobby.team2.players.push(playerData);

                    } else {
                         return res.status(400).json({ message: "Team not found in lobby" });
                    }

                    if (lobby.team1?.players) {
                         lobby.team1AvgMatchRatingBefore = calculateAverageMainRating(lobby.team1.players);
                    }
                    if (lobby.team2?.players) {
                         lobby.team2AvgMatchRatingBefore = calculateAverageMainRating(lobby.team2.players);
                    }
               }

              
               await lobby.save();

               return res.json({
                    success: true,
                    message: "Payment successful and player added",
                    assignedTeam,
                    guest_player: playerData.guest_player,
                    team1AvgMainRating: lobby.team1AvgMatchRatingBefore,
                    team2AvgMainRating: lobby.team2AvgMatchRatingBefore,
               });
          }

          // ─── Post-payment: Tournament Fee ─────────────────────────────────────
          if (payment.paymentType === "tournament fee") {
               const tournament = await TournamentModel.findById(payment.tournamentId);
               if (!tournament) return res.status(404).json({ message: "Tournament not found" });

               if (!payment.teamId) {
                    return res.status(400).json({ message: "Team ID missing for tournament fee payment" });
               }

               let result;
               if (tournament.type === "League" || tournament.type === "Both") {
                    result = await TournamentModel.findByIdAndUpdate(
                         payment.tournamentId,
                         { $addToSet: { teams: payment.teamId } },
                         { new: true }
                    );
               } else {
                    result = await TournamentModel.findByIdAndUpdate(
                         payment.tournamentId,
                         { $addToSet: { qualifiedTeams: payment.teamId } },
                         { new: true }
                    );
               }

               await StandingModel.create({ tournament: tournament._id, team: payment.teamId });

               return res.json({
                    success: true,
                    message: "Payment successful and team added to tournament",
                    data: result,
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

          if (payment.status === "paid" || payment.status === "success") {
               return res.status(400).json({ message: "Cannot cancel a completed payment" });
          }

          const callerId = req.user.id;
          const callerRole = req.user.role;

          if (callerRole === "player") {
               
               if (payment.paymentType === "team fee") {
                    if (payment.playerId?.toString() !== callerId.toString()) {
                         return res.status(403).json({ message: "You can only cancel your own payment" });
                    }
               }

            
               if (payment.paymentType === "tournament fee") {
                    const team = await TeamModel.findById(payment.teamId);
                    if (!team) return res.status(404).json({ message: "Team not found" });
                    if (team.teamOwner.toString() !== callerId.toString()) {
                         return res.status(403).json({ message: "Only the team owner can cancel this payment" });
                    }
               }

          } else if (callerRole === "organizer") {
            
               const lobby = payment.lobbyId
                    ? await LobbyModel.findById(payment.lobbyId).select("organizer")
                    : null;
               const tournament = payment.tournamentId
                    ? await TournamentModel.findById(payment.tournamentId).select("organizer")
                    : null;

               const ownsLobby = lobby?.organizer?.toString() === callerId.toString();
               const ownsTournament = tournament?.organizer?.toString() === callerId.toString();

               if (!ownsLobby && !ownsTournament) {
                    return res.status(403).json({ message: "You are not authorized to cancel this payment" });
               }
          }
         

          payment.status = "failed";
          await payment.save();

          return res.json({ success: true, message: "Payment cancelled", result: {} });

     } catch (err: any) {
          console.error(err);
          return res.status(500).json({ message: "Internal server error" });
     }
};


export const allPaymentHistory = catchAsync(async (req, res) => {
     const paymentQuery = new QueryBuilder(PaymentModel.find().populate("lobbyId  playerId tournamentId teamId").select("-stripePaymentIntentId"), req.query).filter().search(["status", "method"]).sort()
     const result = await paymentQuery.modelQuery

     res.status(200).json({
          success: true,
          message: "all payment data retrieved successfully",
          data: result
     })
})
export const allPaymentHistoryOrganizer = catchAsync(async (req, res) => {
     const organizerId = req.user.id;

     const paymentQuery = new QueryBuilder(
          PaymentModel.find()
               .populate("lobbyId playerId tournamentId teamId")
               .select("-stripePaymentIntentId"),
          req.query
     )
          .filter()
          .search(["status", "method"])
          .sort();

     const result = await paymentQuery.modelQuery;

     // 🔥 Organizer-wise filter
     const organizerPayments = result.filter((payment) => {
          // tournament payment
          if (
               payment.tournamentId &&
               payment.tournamentId.organizer?.toString() === organizerId
          ) {
               return true;
          }

          // lobby payment
          if (
               payment.lobbyId &&
               payment.lobbyId.organizer?.toString() === organizerId
          ) {
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


export const makePaid = async (req: Request, res: Response) => {
     try {
          const { paymentId } = req.params;
          const requesterId = req.user.id;
          const requesterRole = req.user.role;

          if (!paymentId || !isValidObjectId(paymentId)) {
               return res.status(400).json({ message: "Valid Payment ID is required" });
          }

          const payment = await PaymentModel.findById(paymentId)
               .populate("lobbyId")
               .populate("tournamentId");

          if (!payment) {
               return res.status(404).json({ message: "Payment not found" });
          }

          if (payment.status === "paid") {
               return res.status(400).json({ message: "Payment is already marked as paid" });
          }

          // Organizer হলে ownership যাচাই, Admin হলে সরাসরি
          if (requesterRole === "organizer") {
               let isOwner = false;

               if (payment.lobbyId) {
                    const lobby = payment.lobbyId as any;
                    isOwner = lobby.organizer?.toString() === requesterId;
               }

               if (payment.tournamentId) {
                    const tournament = payment.tournamentId as any;
                    isOwner = tournament.organizer?.toString() === requesterId;
               }

               if (!isOwner) {
                    return res.status(403).json({
                         message: "You are not authorized to mark this payment as paid"
                    });
               }
          }

          const result = await PaymentModel.findByIdAndUpdate(
               paymentId,
               { status: "paid" },
               { new: true }
          );

          return res.status(200).json({
               success: true,
               message: "Payment marked as paid successfully",
               result
          });

     } catch (error) {
          console.error("makePaid error:", error);
          return res.status(500).json({ message: "Internal server error" });
     }
};

