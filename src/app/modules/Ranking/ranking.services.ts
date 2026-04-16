import mongoose from "mongoose";
import type { TCreateProfile } from "../auth/auth.interface.js";
import { userModel } from "../auth/auth.model.js"
import { TeamModel } from "../Team/team.model.js";
import { LobbyModel } from "../Lobby/lobby.model.js";
import { MatchModel } from "../TournamentMatch/match.model.js";

interface RankingOptions {
     filterBy?: "weekly" | "monthly" | "all";
     sortField?: string;
     sortOrder?: "asc" | "desc";
     matchField?: keyof TCreateProfile;
     matchValue?: any;
     nationality?: string;
     age?: string | number;
     position?: string;
}

interface PlayerAggStats {
     matchCount: number;
     totalGoal: number;
     totalAssists: number;
     totalTackle: number;
     totalSave: number;
     totalRedCard: number;
     totalYellowCard: number;
     totalContribution: number;
     ratingSum: number;
     ratingCount: number;
     motm: number; // ✅
}

const playerRanking = async (options: RankingOptions) => {
     const {
          filterBy = "all",
          sortField = "rating",
          sortOrder = "desc",
          nationality,
          age,
          position,
     } = options;

     const now = new Date();
     let startDate: Date | undefined;

     if (filterBy === "weekly") {
          startDate = new Date();
          startDate.setDate(now.getDate() - 7);
     } else if (filterBy === "monthly") {
          startDate = new Date();
          startDate.setMonth(now.getMonth() - 1);
     }

     const minMatches =
          filterBy === "weekly" ? 2 : filterBy === "monthly" ? 4 : 15;

     const dateFilter = startDate ? { $gte: startDate } : undefined;

     const aggregatePlayerStats = async (
          model: mongoose.Model<any>,
          config: {
               dateField: string;
               statusField: string;
               statusValue: string;
               playerArrayPaths: string[];
               motmField: string; // ✅
          }
     ) => {
          const matchStage: any = { [config.statusField]: config.statusValue };
          if (dateFilter) matchStage[config.dateField] = dateFilter;

          return model.aggregate([
               { $match: matchStage },

               {
                    $project: {
                         motmField: `$${config.motmField}`, // ✅
                         allPlayers: {
                              $concatArrays: config.playerArrayPaths.map((path) => ({
                                   $ifNull: [`$${path}`, []],
                              })),
                         },
                    },
               },

               { $unwind: "$allPlayers" },

               { $match: { "allPlayers.guest_player": { $ne: true } } },

               {
                    $group: {
                         _id: "$allPlayers.playerId",
                         matchCount: { $sum: 1 },
                         totalGoal: { $sum: "$allPlayers.goal" },
                         totalAssists: { $sum: "$allPlayers.assists" },
                         totalTackle: { $sum: "$allPlayers.tackle" },
                         totalSave: { $sum: "$allPlayers.save" },
                         totalRedCard: { $sum: "$allPlayers.redCard" },
                         totalYellowCard: { $sum: "$allPlayers.yellowCard" },
                         totalContribution: { $sum: "$allPlayers.contribution" },
                         ratingSum: { $sum: "$allPlayers.rating" },
                         ratingCount: { $sum: 1 },
                         // ✅ motm: player id এর সাথে motm field match করলে count
                         motm: {
                              $sum: {
                                   $cond: [
                                        {
                                             $eq: [
                                                  { $toString: "$allPlayers.playerId" },
                                                  { $toString: "$motmField" },
                                             ],
                                        },
                                        1,
                                        0,
                                   ],
                              },
                         },
                    },
               },
          ]);
     };

     // ─── Step 1: Lobby stats ────────────────────────────
     const lobbyStats = await aggregatePlayerStats(LobbyModel, {
          dateField: "date",
          statusField: "lobbyStatus",
          statusValue: "completed",
          playerArrayPaths: [
               "team1.players",
               "team2.players",
               "defaultTeam1.players",
               "defaultTeam2.players",
          ],
          motmField: "motm", 
     });

     // ─── Step 2: Tournament match stats ──────────────────────────────────────────
     const tournamentStats = await aggregatePlayerStats(MatchModel, {
          dateField: "date",
          statusField: "status",
          statusValue: "Completed",
          playerArrayPaths: ["teamAPlayers", "teamBPlayers"],
          motmField: "motm", // ✅
     });

     // ─── Step 3: Merge both into one Map ─────────────────────────────────────────
     const statsMap = new Map<string, PlayerAggStats>();

     const mergeStats = (entries: any[]) => {
          for (const e of entries) {
               if (!e._id) continue;
               const id = e._id.toString();
               const existing = statsMap.get(id);

               if (existing) {
                    existing.matchCount += e.matchCount;
                    existing.totalGoal += e.totalGoal;
                    existing.totalAssists += e.totalAssists;
                    existing.totalTackle += e.totalTackle;
                    existing.totalSave += e.totalSave;
                    existing.totalRedCard += e.totalRedCard;
                    existing.totalYellowCard += e.totalYellowCard;
                    existing.totalContribution += e.totalContribution;
                    existing.ratingSum += e.ratingSum;
                    existing.ratingCount += e.ratingCount;
                    existing.motm += e.motm; // ✅
               } else {
                    statsMap.set(id, {
                         matchCount: e.matchCount,
                         totalGoal: e.totalGoal,
                         totalAssists: e.totalAssists,
                         totalTackle: e.totalTackle,
                         totalSave: e.totalSave,
                         totalRedCard: e.totalRedCard,
                         totalYellowCard: e.totalYellowCard,
                         totalContribution: e.totalContribution,
                         ratingSum: e.ratingSum,
                         ratingCount: e.ratingCount,
                         motm: e.motm, // ✅
                    });
               }
          }
     };

     mergeStats(lobbyStats);
     mergeStats(tournamentStats);

     // ─── Step 4: Apply min match threshold ───────────────────────────────────────
     const eligibleIds = [...statsMap.entries()]
          .filter(([, s]) => s.matchCount >= minMatches)
          .map(([id]) => new mongoose.Types.ObjectId(id));

     if (eligibleIds.length === 0) return [];

     // ─── Step 5: Fetch user profiles ─────────────────────────────────────────────
     const userQuery: any = {
          _id: { $in: eligibleIds },
          isBlocked: "active",
     };

     if (nationality) userQuery.nationality = nationality;
     if (age) userQuery.age = age.toString();
     if (position) userQuery.position = { $in: [position] };

     const users = await userModel
          .find(userQuery)
          .select("-password")
          .lean();

     // ─── Step 6: Attach window-specific stats ────────────────────────────────────
     const enriched = users.map((user) => {
          const s = statsMap.get((user._id as mongoose.Types.ObjectId).toString())!;
          const avgRating =
               s.ratingCount > 0
                    ? parseFloat((s.ratingSum / s.ratingCount).toFixed(2))
                    : 6.5;

          const matchCount = s.matchCount;

          return {
               ...user,
               windowStats: {
                    matchCount,
                    rating: avgRating,
                    goal: s.totalGoal,
                    assists: s.totalAssists,
                    tackle: s.totalTackle,
                    save: s.totalSave,
                    redCard: s.totalRedCard,
                    yellowCard: s.totalYellowCard,
                    contribution: s.totalContribution,
                    motm: s.motm, // ✅
                    goalsPerGame: matchCount ? parseFloat((s.totalGoal / matchCount).toFixed(2)) : 0,
                    assistsPerGame: matchCount ? parseFloat((s.totalAssists / matchCount).toFixed(2)) : 0,
                    savesPerGame: matchCount ? parseFloat((s.totalSave / matchCount).toFixed(2)) : 0,
                    contributionPerGame: matchCount ? parseFloat((s.totalContribution / matchCount).toFixed(2)) : 0,
               },
          };
     });

     // ─── Step 7: Sort ─────────────────────────────────────────────────────────────
     const windowStatFields = new Set([
          "rating", "goal", "assists", "tackle",
          "save", "redCard", "yellowCard", "contribution", "matchCount",
          "goalsPerGame", "assistsPerGame", "savesPerGame", "contributionPerGame",
          "motm", // ✅
     ]);

     enriched.sort((a, b) => {
          const aVal = windowStatFields.has(sortField)
               ? (a.windowStats as any)[sortField] ?? 0
               : (a as any)[sortField] ?? 0;
          const bVal = windowStatFields.has(sortField)
               ? (b.windowStats as any)[sortField] ?? 0
               : (b as any)[sortField] ?? 0;

          return sortOrder === "desc" ? bVal - aVal : aVal - bVal;
     });

     return enriched;
};


const teamRanking = async (options: RankingOptions) => {
     const { filterBy = "all", sortField = "win", sortOrder = "desc", matchField, matchValue } = options;

     const now = new Date();
     let startDate: Date | undefined;

     if (filterBy === "weekly") {
          startDate = new Date();
          startDate.setDate(now.getDate() - 7);
     } else if (filterBy === "monthly") {
          startDate = new Date();
          startDate.setMonth(now.getMonth() - 1);
     }

     const dateFilter = startDate ? { $gte: startDate, $lte: now } : undefined;
     const sortDirection = sortOrder === "asc" ? 1 : -1;

     const allTeams = await TeamModel.find({}).lean<any[]>();

     const teamStatsMap: Record<string, {
          teamId: string;
          totalMatch: number;
          win: number;
          draw: number;
          loss: number;
          goal: number;
          carryGoal: number;
     }> = {};

     for (const team of allTeams) {
          if (filterBy === "all") {
               teamStatsMap[team._id.toString()] = {
                    teamId: team._id.toString(),
                    totalMatch: team.totalMatch || 0,
                    win: team.win || 0,
                    draw: team.draw || 0,
                    loss: team.loss || 0,
                    goal: team.goal || 0,
                    carryGoal: team.carryGoal || 0,
               };
          } else {
               teamStatsMap[team._id.toString()] = {
                    teamId: team._id.toString(),
                    totalMatch: 0,
                    win: 0,
                    draw: 0,
                    loss: 0,
                    goal: 0,
                    carryGoal: 0,
               };
          }
     }

     // ─── weekly/monthly এর জন্য createdAt দিয়ে filter ─────────────────────────
     if (filterBy !== "all") {

          // ── Lobby থেকে calculate ──────────────────────────────────────────────
          const lobbyFilter: any = {
               lobbyStatus: "completed",
               matchType: "teams",
               $or: [
                    { "team1.teamId": { $exists: true } },
                    { "team2.teamId": { $exists: true } },
               ],
          };

          // ✅ date এর বদলে createdAt ব্যবহার করা হচ্ছে
          if (dateFilter) lobbyFilter.createdAt = dateFilter;

          const completedLobbies = await LobbyModel.find(lobbyFilter).lean();

          for (const lobby of completedLobbies) {
               const team1Id = lobby.team1?.teamId?.toString();
               const team2Id = lobby.team2?.teamId?.toString();

               if (!team1Id || !team2Id) continue;
               if (!teamStatsMap[team1Id] || !teamStatsMap[team2Id]) continue;

               const score1 = lobby.goalTeam1 ?? 0;
               const score2 = lobby.goalTeam2 ?? 0;

               teamStatsMap[team1Id].totalMatch += 1;
               teamStatsMap[team1Id].goal += score1;
               teamStatsMap[team1Id].carryGoal += score2;
               if (score1 > score2) teamStatsMap[team1Id].win += 1;
               else if (score1 === score2) teamStatsMap[team1Id].draw += 1;
               else teamStatsMap[team1Id].loss += 1;

               teamStatsMap[team2Id].totalMatch += 1;
               teamStatsMap[team2Id].goal += score2;
               teamStatsMap[team2Id].carryGoal += score1;
               if (score2 > score1) teamStatsMap[team2Id].win += 1;
               else if (score1 === score2) teamStatsMap[team2Id].draw += 1;
               else teamStatsMap[team2Id].loss += 1;
          }

          // ── Match (Tournament) থেকে calculate ───────────────────────────────
          const matchFilter: any = { status: "Completed" };

          // ✅ date এর বদলে createdAt ব্যবহার করা হচ্ছে
          if (dateFilter) matchFilter.createdAt = dateFilter;

          const completedMatches = await MatchModel.find(matchFilter).lean();

          for (const match of completedMatches) {
               const teamAId = match.teamA?.toString();
               const teamBId = match.teamB?.toString();

               if (!teamAId || !teamBId) continue;
               if (!teamStatsMap[teamAId] || !teamStatsMap[teamBId]) continue;

               const scoreA = match.scoreA ?? 0;
               const scoreB = match.scoreB ?? 0;

               teamStatsMap[teamAId].totalMatch += 1;
               teamStatsMap[teamAId].goal += scoreA;
               teamStatsMap[teamAId].carryGoal += scoreB;
               if (scoreA > scoreB) teamStatsMap[teamAId].win += 1;
               else if (scoreA === scoreB) teamStatsMap[teamAId].draw += 1;
               else teamStatsMap[teamAId].loss += 1;

               teamStatsMap[teamBId].totalMatch += 1;
               teamStatsMap[teamBId].goal += scoreB;
               teamStatsMap[teamBId].carryGoal += scoreA;
               if (scoreB > scoreA) teamStatsMap[teamBId].win += 1;
               else if (scoreA === scoreB) teamStatsMap[teamBId].draw += 1;
               else teamStatsMap[teamBId].loss += 1;
          }
     }

     // ─── Minimum match filter ─────────────────────────────────────────────────
     const minMatches = filterBy === "weekly" ? 4 : filterBy === "monthly" ? 10 : 15; // TODO: production এ 4/10/15 করো

     // ─── Team details + rating calculate ─────────────────────────────────────
     const results = [];

     for (const team of allTeams) {
          const stats = teamStatsMap[team._id.toString()];

          if (!stats) continue;
          if (stats.totalMatch < minMatches) continue;
          if (stats.win < 1) continue;

          if (matchField && matchValue !== undefined) {
               if ((stats as any)[matchField] !== matchValue) continue;
          }

          const winPercentage = stats.totalMatch > 0
               ? parseFloat(((stats.win / stats.totalMatch) * 100).toFixed(2))
               : 0;

          const goalDifference = stats.goal - stats.carryGoal;

          const playerIds = [
               ...(team.players || []),
               team.teamOwner,
          ].filter(Boolean);

          const playerDocs = await userModel
               .find({ _id: { $in: playerIds } }, { rating: 1 })
               .lean();

          const teamRating = playerDocs.length > 0
               ? parseFloat(
                    (playerDocs.reduce((sum, p: any) => sum + (p.rating || 0), 0) / playerDocs.length).toFixed(2)
               )
               : 0;

          results.push({
               _id: team._id,
               teamName: team.teamName,
               userName: team.userName,
               image: team.image,
               players: team.players,
               teamOwner: team.teamOwner,
               teamCaptain: team.teamCaptain,
               createdAt: team.createdAt,
               updatedAt: team.updatedAt,
               totalMatch: stats.totalMatch,
               win: stats.win,
               draw: stats.draw,
               loss: stats.loss,
               goal: stats.goal,
               carryGoal: stats.carryGoal,
               winPercentage,
               goalDifference,
               teamRating,
          });
     }

     // ─── Sort ─────────────────────────────────────────────────────────────────
     results.sort((a, b) => {
          const fields: (keyof typeof a)[] = [
               "win",
               "winPercentage",
               "goalDifference",
               "goal",
               "teamRating",
               sortField as keyof typeof a,
          ];

          for (const field of fields) {
               const diff = ((b[field] as number) - (a[field] as number)) * sortDirection;
               if (diff !== 0) return diff;
          }
          return 0;
     });

     // ─── Ranking number assign ────────────────────────────────────────────────
     const ranked = results.map((team, index) => ({
          ...team,
          ranking: index + 1,
     }));

     return ranked;
};


export const playerRankingService = {
     playerRanking,
     teamRanking
}