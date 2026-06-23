import { Types } from "mongoose";
import AppError from "../../Error/AppError.js";
import type { ITournament } from "./Tournament.interface.js";
import { TournamentModel } from "./Tournament.model.js";
import { MatchModel } from "../TournamentMatch/match.model.js";
import { CountryService } from "../Country/country.service.js";
import { userModel } from "../auth/auth.model.js";
import { assertSameCountry, getUserCountryCode } from "../../utils/countryAccess.js";

const resolveContentCountry = async (payloadCountryCode: unknown, organizerId?: unknown) => {
     if (payloadCountryCode !== undefined && payloadCountryCode !== null && payloadCountryCode !== "") {
          return CountryService.assertActiveCountry(payloadCountryCode);
     }

     if (organizerId) {
          const organizer = await userModel.findById(organizerId.toString()).select("countryCode");
          return CountryService.assertActiveCountry(organizer?.countryCode || CountryService.DEFAULT_COUNTRY_CODE);
     }

     return CountryService.assertActiveCountry(CountryService.DEFAULT_COUNTRY_CODE);
};

const createTournament = async (payload: ITournament) => {
     const country = await resolveContentCountry(payload.countryCode, payload.organizer);
     const result = await TournamentModel.create({
          ...payload,
          countryCode: country.countryCode,
          currencyCode: country.currencyCode,
     });
     return result;
};

const singleTournament = async (id: string) => {
     const result = await TournamentModel
          .findOne({ _id: id, isDelete: { $ne: true } })
          .populate("winner qualifiedTeams teams organizer");
     return result;
};
const allTournament = async () => {
     const tournaments = await TournamentModel.find({ status: { $ne: "inactive" }, isDelete: { $ne: true } })
          .populate("winner")
          .populate("qualifiedTeams")
          .populate({
               path: "teams",
               populate: [
                    { path: "players" },
                    { path: "teamOwner" },
               ],
          })
          .populate("organizer")
          .sort({ createdAt: -1 })
          .lean();

     const result = tournaments.map((tournament) => ({
          ...tournament,
          teams: (tournament.teams as any[]).map((team: any) => ({
               ...team,
               rating: calculateTeamRating(team),
          })),
          qualifiedTeams: (tournament.qualifiedTeams as any[]).map((team: any) => ({
               ...team,
               rating: calculateTeamRating(team),
          })),
          winner: tournament.winner
               ? { ...(tournament.winner as any), rating: calculateTeamRating(tournament.winner as any) }
               : null,
     }));

     return result;
};

const countryTournament = async (countryCode: string) => {
     await CountryService.assertActiveCountry(countryCode);
     const tournaments = await TournamentModel.find({
          status: { $ne: "inactive" },
          isDelete: { $ne: true },
          ...CountryService.buildLegacyCountryFilter(countryCode),
     })
          .populate("winner")
          .populate("qualifiedTeams")
          .populate({
               path: "teams",
               populate: [
                    { path: "players" },
                    { path: "teamOwner" },
               ],
          })
          .populate("organizer")
          .sort({ createdAt: -1 })
          .lean();

     return tournaments.map((tournament) => ({
          ...tournament,
          teams: (tournament.teams as any[]).map((team: any) => ({
               ...team,
               rating: calculateTeamRating(team),
          })),
          qualifiedTeams: (tournament.qualifiedTeams as any[]).map((team: any) => ({
               ...team,
               rating: calculateTeamRating(team),
          })),
          winner: tournament.winner
               ? { ...(tournament.winner as any), rating: calculateTeamRating(tournament.winner as any) }
               : null,
     }));
};

const myCountryTournament = async (userId: string) => {
     const countryCode = await getUserCountryCode(userId);
     return countryTournament(countryCode);
};

const myCountrySingleTournament = async (userId: string, tournamentId: string) => {
     const countryCode = await getUserCountryCode(userId);
     const tournament = await TournamentModel.findById(tournamentId).select("countryCode");
     if (!tournament) throw new AppError(404, "Tournament not found");
     assertSameCountry(tournament.countryCode, countryCode);
     return singleTournament(tournamentId);
};

function calculateTeamRating(team: any): number {
     if (!team) return 0;
     const members = [...(team.players || []), team.teamOwner].filter(Boolean);
     if (members.length === 0) return 0;
     const totalRating = members.reduce((sum: number, member: any) => {
          const rating = typeof member === "object" ? (member.rating || 0) : 0;
          return sum + rating;
     }, 0);
     return parseFloat((totalRating / members.length).toFixed(2));
}

const organizerTournament = async (id: string) => {
     const result = await TournamentModel.find({
          organizer: id,
          status: { $in: ["active", "block"] },
          isDelete: { $ne: true },
     })
          .populate("winner qualifiedTeams teams organizer")
          .sort({ status: 1, createdAt: -1 });
     return result;
};

// ─── F-05 FIX: ownership check helper ────────────────────────────────────────

const assertTournamentAccess = (tournament: any, callerId: string, callerRole: string) => {
     if (callerRole === "admin") return; // admin সব করতে পারবে
     if (callerRole === "organizer") {
          if (tournament.organizer.toString() !== callerId.toString()) {
               throw new AppError(403, "You are not authorized to modify this tournament");
          }
          return;
     }
     throw new AppError(403, "You are not authorized");
};

// F-05 FIX: callerId ও callerRole service-এ 
const updateTournament = async (
     id: string,
     payload: Partial<ITournament>,
     callerId: string,
     callerRole: string
) => {
     const tournament = await TournamentModel.findById(id);
     if (!tournament) throw new AppError(404, "This tournament is not found");

     // F-05 FIX: organizer 
     assertTournamentAccess(tournament, callerId, callerRole);

     if (Object.prototype.hasOwnProperty.call(payload, "countryCode")) {
          const country = await CountryService.assertActiveCountry(payload.countryCode);
          payload.countryCode = country.countryCode;
          payload.currencyCode = country.currencyCode;
     }

     const result = await TournamentModel.findByIdAndUpdate(id, payload, { new: true });
     return result;
};

// F-05 FIX: callerId ও callerRole service
const deleteTournament = async (
     id: string,
     callerId: string,
     callerRole: string
) => {
     const tournament = await TournamentModel.findById(id);
     if (!tournament) throw new AppError(404, "This tournament is not found");

     // F-05 FIX:
     assertTournamentAccess(tournament, callerId, callerRole);

     const result = await TournamentModel.findByIdAndUpdate(id, { isDelete: true }, { new: true });
     return result;
};

// F-05 FIX: 
const qualifyTeamsService = async (
     tournamentId: string,
     teamIds: string[],
     callerId: string,
     callerRole: string
) => {
     const tournament = await TournamentModel.findById(tournamentId);
     if (!tournament) throw new AppError(404, "Tournament not found");

     
     assertTournamentAccess(tournament, callerId, callerRole);

     const currentQualified = tournament.qualifiedTeams.map((id) => id.toString());
     const uniqueTeams = teamIds.filter((id) => !currentQualified.includes(id.toString()));

     if (uniqueTeams.length === 0) {
          throw new AppError(403, "All teams already qualified or invalid");
     }

     tournament.qualifiedTeams.push(...uniqueTeams.map((id) => new Types.ObjectId(id)));
     await tournament.save();

     return tournament;
};

export const getTopPlayers = async (tournamentId: string) => {
     const topPlayers = await MatchModel.aggregate([
          { $match: { tournament: new Types.ObjectId(tournamentId), status: "Completed" } },
          {
               $lookup: {
                    from: "tournaments",
                    localField: "tournament",
                    foreignField: "_id",
                    as: "tournamentData"
               }
          },
          { $unwind: "$tournamentData" },
          { $match: { "tournamentData.isDelete": { $ne: true } } },   
          { $project: { players: { $concatArrays: ["$teamAPlayers", "$teamBPlayers"] } } },
          { $unwind: "$players" },
          { $match: { "players.guest_player": false } },
          {
               $group: {
                    _id: "$players.playerId",
                    avgRating: { $avg: "$players.rating" },
                    totalMatches: { $sum: 1 },
                    totalGoals: { $sum: "$players.goal" },
                    totalAssists: { $sum: "$players.assists" },
                    totalContribution: { $sum: "$players.contribution" },
                    totalTackles: { $sum: "$players.tackle" },
                    totalSaves: { $sum: "$players.save" },
                    totalYellowCards: { $sum: "$players.yellowCard" },
                    totalRedCards: { $sum: "$players.redCard" },
                    totalGoodMoments: { $sum: "$players.goodMoment" },
                    totalVeryGoodMoments: { $sum: "$players.veryGoodMoment" },
               },
          },
          { $sort: { avgRating: -1 } },
          { $limit: 10 },
          { $lookup: { from: "players", localField: "_id", foreignField: "_id", as: "player" } },
          { $unwind: { path: "$player", preserveNullAndEmptyArrays: false } },
          {
               $project: {
                    _id: 0,
                    playerId: "$player._id",
                    name: "$player.FullName",
                    userName: "$player.userName",
                    image: "$player.imageUrl",
                    position: "$player.position",
                    nationality: "$player.nationality",
                    avgRating: { $round: ["$avgRating", 2] },
                    totalMatches: 1,
                    totalGoals: 1,
                    totalAssists: 1,
                    totalContribution: 1,
                    totalTackles: 1,
                    totalSaves: 1,
                    totalYellowCards: 1,
                    totalRedCards: 1,
                    totalGoodMoments: 1,
                    totalVeryGoodMoments: 1,
               },
          },
     ]);

     return topPlayers;
};

export const TournamentService = {
     createTournament,
     singleTournament,
     allTournament,
     updateTournament,
     deleteTournament,
     qualifyTeamsService,
     getTopPlayers,
     organizerTournament,
     countryTournament,
     myCountryTournament,
     myCountrySingleTournament,
};
