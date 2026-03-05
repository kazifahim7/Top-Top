import mongoose from "mongoose";
import type { TCreateProfile } from "../auth/auth.interface.js";
import { userModel } from "../auth/auth.model.js"
import { TeamModel } from "../Team/team.model.js";
import { LobbyModel } from "../Lobby/lobby.model.js";
import { MatchModel } from "../TournamentMatch/match.model.js";

interface RankingOptions {
  filterBy?: "weekly" | "monthly" | "all";

  // sorting
  sortField?: string;
  sortOrder?: "asc" | "desc";

  // stats filter (goal, rating, assists...)
  matchField?: keyof TCreateProfile;
  matchValue?: any;

  // profile filters
  nationality?: string;
  age?: string | number;
  position?: string; // "ST", "GK"
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

     // ─── Date window ─────────────────────────────────────────────────────────────
     if (filterBy === "weekly") {
          startDate = new Date();
          startDate.setDate(now.getDate() - 7);
     } else if (filterBy === "monthly") {
          startDate = new Date();
          startDate.setMonth(now.getMonth() - 1);
     }

     // ─── Min match threshold ──────────────────────────────────────────────────────
     // weekly  → at least 2 matches in last 7 days
     // monthly → at least 4 matches in last 1 month
     // all     → at least 15 matches all time
     const minMatches =
          filterBy === "weekly" ? 2 : filterBy === "monthly" ? 4 : 15;

     // ✅ FIX 1: Only $gte — no upper bound ($lte: now removed)
     // This ensures future-dated completed matches are also included
     const dateFilter = startDate ? { $gte: startDate } : undefined;

     // ─── Reusable aggregation pipeline ───────────────────────────────────────────
     const aggregatePlayerStats = async (
          model: mongoose.Model<any>,
          config: {
               dateField: string;
               statusField: string;
               statusValue: string;
               playerArrayPaths: string[];
          }
     ) => {
          const matchStage: any = { [config.statusField]: config.statusValue };
          if (dateFilter) matchStage[config.dateField] = dateFilter;

          return model.aggregate([
               { $match: matchStage },

               // Flatten all team player arrays into one
               {
                    $project: {
                         allPlayers: {
                              $concatArrays: config.playerArrayPaths.map((path) => ({
                                   $ifNull: [`$${path}`, []],
                              })),
                         },
                    },
               },

               { $unwind: "$allPlayers" },

               // Skip guest players — no real profile exists for them
               { $match: { "allPlayers.guest_player": { $ne: true } } },

               // Aggregate stats per player
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
                    },
               },
          ]);
     };

     // ─── Step 1: Lobby stats ──────────────────────────────────────────────────────
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
     });

     // ─── Step 2: Tournament match stats ──────────────────────────────────────────
     const tournamentStats = await aggregatePlayerStats(MatchModel, {
          dateField: "date",
          statusField: "status",
          statusValue: "Completed",
          playerArrayPaths: ["teamAPlayers", "teamBPlayers"],
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
     // ✅ FIX 2: Removed role: "player" — admin/organizer can also participate
     // in matches and should appear in rankings
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

          return {
               ...user,
               // Stats scoped only to the chosen time window (weekly / monthly / all)
               windowStats: {
                    matchCount: s.matchCount,
                    rating: avgRating,
                    goal: s.totalGoal,
                    assists: s.totalAssists,
                    tackle: s.totalTackle,
                    save: s.totalSave,
                    redCard: s.totalRedCard,
                    yellowCard: s.totalYellowCard,
                    contribution: s.totalContribution,
               },
          };
     });

     // ─── Step 7: Sort by windowStats field ───────────────────────────────────────
     const windowStatFields = new Set([
          "rating", "goal", "assists", "tackle",
          "save", "redCard", "yellowCard", "contribution", "matchCount",
     ]);
     const sortDir = sortOrder === "asc" ? 1 : -1;

     enriched.sort((a, b) => {
          const aVal = windowStatFields.has(sortField)
               ? (a.windowStats as any)[sortField] ?? 0
               : (a as any)[sortField] ?? 0;
          const bVal = windowStatFields.has(sortField)
               ? (b.windowStats as any)[sortField] ?? 0
               : (b as any)[sortField] ?? 0;
          return sortDir * (bVal - aVal);
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

     // ✅ Minimum match requirement per filter
     const minMatches = filterBy === "weekly" ? 4 : filterBy === "monthly" ? 10 : 15;

     const matchStage: any = {
          totalMatch: { $gte: minMatches }, // ✅ minimum match filter
          win: { $gte: 1 },
     };

     if (filterBy !== "all" && startDate) {
          matchStage.updatedAt = { $gte: startDate, $lte: now };
     }

     if (matchField && matchValue !== undefined) {
          matchStage[matchField] = matchValue;
     }

     const sortDirection = sortOrder === "asc" ? 1 : -1;

     const result = await TeamModel.aggregate([
          {
               $match: matchStage
          },
          {
               $lookup: {
                    from: "players",
                    localField: "players",
                    foreignField: "_id",
                    as: "playersData"
               }
          },
          {
               $addFields: {
                    avgRating: { $avg: "$playersData.rating" },
                    winPercentage: {
                         $cond: [
                              { $eq: ["$totalMatch", 0] },
                              0,
                              { $multiply: [{ $divide: ["$win", "$totalMatch"] }, 100] }
                         ]
                    },
                    goalDifference: { $subtract: ["$goal", "$carryGoal"] },

                    // ✅ Team rating formula (0-10)
                    // Win Rate     → max 5.0
                    // Draw Rate    → max 1.5
                    // Goal Diff    → max 2.0
                    // Experience   → max 1.5
                    teamRating: {
                         $let: {
                              vars: {
                                   winRate: {
                                        $cond: [
                                             { $eq: ["$totalMatch", 0] },
                                             0,
                                             { $divide: ["$win", "$totalMatch"] }
                                        ]
                                   },
                                   drawRate: {
                                        $cond: [
                                             { $eq: ["$totalMatch", 0] },
                                             0,
                                             { $divide: ["$draw", "$totalMatch"] }
                                        ]
                                   },
                                   goalDiffPerMatch: {
                                        $cond: [
                                             { $eq: ["$totalMatch", 0] },
                                             0,
                                             {
                                                  $divide: [
                                                       { $subtract: ["$goal", "$carryGoal"] },
                                                       "$totalMatch"
                                                  ]
                                             }
                                        ]
                                   },
                                   experienceScore: {
                                        $min: [{ $divide: ["$totalMatch", 20] }, 1]
                                   }
                              },
                              in: {
                                   $min: [
                                        10,
                                        {
                                             $max: [
                                                  0,
                                                  {
                                                       $add: [
                                                            { $multiply: ["$$winRate", 5] },
                                                            { $multiply: ["$$drawRate", 1.5] },
                                                            {
                                                                 $multiply: [
                                                                      { $min: ["$$goalDiffPerMatch", 1] },
                                                                      2
                                                                 ]
                                                            },
                                                            { $multiply: ["$$experienceScore", 1.5] }
                                                       ]
                                                  }
                                             ]
                                        }
                                   ]
                              }
                         }
                    }
               }
          },
          {
               $sort: {
                    teamRating: sortDirection,
                    win: sortDirection,
                    winPercentage: sortDirection,
                    goalDifference: sortDirection,
                    goal: sortDirection,
                    [sortField]: sortDirection
               }
          },
          {
               $group: {
                    _id: null,
                    teams: { $push: "$$ROOT" }
               }
          },
          {
               $unwind: {
                    path: "$teams",
                    includeArrayIndex: "ranking"
               }
          },
          {
               $replaceRoot: {
                    newRoot: {
                         $mergeObjects: [
                              "$teams",
                              { ranking: { $add: ["$ranking", 1] } }
                         ]
                    }
               }
          },
          {
               $project: {
                    _id: 1,
                    teamName: 1,
                    userName: 1,
                    image: 1,
                    totalMatch: 1,
                    win: 1,
                    draw: 1,
                    loss: 1,
                    goal: 1,
                    carryGoal: 1,
                    winPercentage: 1,
                    goalDifference: 1,
                    avgRating: 1,
                    teamRating: 1, 
                    ranking: 1,
                    players: 1,
                    teamOwner: 1,
                    teamCaptain: 1,
                    createdAt: 1,
                    updatedAt: 1
               }
          }
     ]);

     return result;
};




export const playerRankingService = {
     playerRanking,
     teamRanking
}