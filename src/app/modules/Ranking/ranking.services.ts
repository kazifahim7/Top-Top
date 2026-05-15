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
     let minMatches: number;

     // Set date range and minimum matches based on filter
     if (filterBy === "weekly") {
          startDate = new Date();
          startDate.setDate(now.getDate() - 7);
          startDate.setHours(0, 0, 0, 0);
          minMatches = 2;
          console.log(`📅 Filter: Weekly (last 7 days from ${startDate.toISOString().split('T')[0]})`);
     } else if (filterBy === "monthly") {
          startDate = new Date();
          startDate.setMonth(now.getMonth() - 1);
          startDate.setHours(0, 0, 0, 0);
          minMatches = 4;
          console.log(`📅 Filter: Monthly (last 30 days from ${startDate.toISOString().split('T')[0]})`);
     } else {
          startDate = undefined;
          minMatches = 15;
          console.log(`📅 Filter: All time (no date restriction)`);
     }

     const dateFilter = startDate ? { $gte: startDate } : undefined;

     // Initialize stats map
     const statsMap = new Map<string, PlayerAggStats>();

     // ─── 1. Process Completed Lobbies (Only within time window) ───────────────────
     const lobbyMatchStage: any = { lobbyStatus: "completed" };
     if (dateFilter) lobbyMatchStage.date = dateFilter;

     const completedLobbies = await LobbyModel.find(lobbyMatchStage)
          .select("_id date motm team1 team2 defaultTeam1 defaultTeam2")
          .lean();

     console.log(`📊 Processing ${completedLobbies.length} completed lobbies within the time window`);

     for (const lobby of completedLobbies) {
          const motmId = (lobby as any).motm?.toString() ?? "";

          // Collect all players from both team structures
          const allPlayers = [
               ...((lobby as any).team1?.players ?? []),
               ...((lobby as any).team2?.players ?? []),
               ...((lobby as any).defaultTeam1?.players ?? []),
               ...((lobby as any).defaultTeam2?.players ?? []),
          ];

          if (allPlayers.length === 0) continue;

          // Remove duplicate players per lobby (same player appears once)
          const seenInLobby = new Map<string, any>();
          for (const p of allPlayers) {
               if (!p.playerId || p.guest_player === true) continue;
               const pid = p.playerId.toString();
               if (!seenInLobby.has(pid)) {
                    seenInLobby.set(pid, p);
               }
          }

          // Update stats map
          for (const [pid, p] of seenInLobby.entries()) {
               const existing = statsMap.get(pid);
               if (existing) {
                    existing.matchCount += 1;
                    existing.totalGoal += p.goal ?? 0;
                    existing.totalAssists += p.assists ?? 0;
                    existing.totalTackle += p.tackle ?? 0;
                    existing.totalSave += p.save ?? 0;
                    existing.totalRedCard += p.redCard ?? 0;
                    existing.totalYellowCard += p.yellowCard ?? 0;
                    existing.totalContribution += p.contribution ?? 0;
                    existing.ratingSum += p.rating ?? 0;
                    existing.ratingCount += 1;
                    existing.motm += motmId === pid ? 1 : 0;
               } else {
                    statsMap.set(pid, {
                         matchCount: 1,
                         totalGoal: p.goal ?? 0,
                         totalAssists: p.assists ?? 0,
                         totalTackle: p.tackle ?? 0,
                         totalSave: p.save ?? 0,
                         totalRedCard: p.redCard ?? 0,
                         totalYellowCard: p.yellowCard ?? 0,
                         totalContribution: p.contribution ?? 0,
                         ratingSum: p.rating ?? 0,
                         ratingCount: 1,
                         motm: motmId === pid ? 1 : 0,
                    });
               }
          }
     }

     // ─── 2. Process Completed Tournament Matches (Only within time window) ────────
     const tournamentMatchStage: any = { status: "Completed" };
     if (dateFilter) tournamentMatchStage.date = dateFilter;

     const completedTournamentMatches = await MatchModel.find(tournamentMatchStage)
          .select("_id date motm teamAPlayers teamBPlayers")
          .lean();

     console.log(`📊 Processing ${completedTournamentMatches.length} completed tournament matches within the time window`);

     for (const match of completedTournamentMatches) {
          const motmId = (match as any).motm?.toString() ?? "";

          // Collect all players from both teams
          const allPlayers = [
               ...((match as any).teamAPlayers ?? []),
               ...((match as any).teamBPlayers ?? []),
          ];

          if (allPlayers.length === 0) continue;

          // Remove duplicate players per match
          const seenInMatch = new Map<string, any>();
          for (const p of allPlayers) {
               if (!p.playerId || p.guest_player === true) continue;
               const pid = p.playerId.toString();
               if (!seenInMatch.has(pid)) {
                    seenInMatch.set(pid, p);
               }
          }

          // Update stats map
          for (const [pid, p] of seenInMatch.entries()) {
               const existing = statsMap.get(pid);
               if (existing) {
                    existing.matchCount += 1;
                    existing.totalGoal += p.goal ?? 0;
                    existing.totalAssists += p.assists ?? 0;
                    existing.totalTackle += p.tackle ?? 0;
                    existing.totalSave += p.save ?? 0;
                    existing.totalRedCard += p.redCard ?? 0;
                    existing.totalYellowCard += p.yellowCard ?? 0;
                    existing.totalContribution += p.contribution ?? 0;
                    existing.ratingSum += p.rating ?? 0;
                    existing.ratingCount += 1;
                    existing.motm += motmId === pid ? 1 : 0;
               } else {
                    statsMap.set(pid, {
                         matchCount: 1,
                         totalGoal: p.goal ?? 0,
                         totalAssists: p.assists ?? 0,
                         totalTackle: p.tackle ?? 0,
                         totalSave: p.save ?? 0,
                         totalRedCard: p.redCard ?? 0,
                         totalYellowCard: p.yellowCard ?? 0,
                         totalContribution: p.contribution ?? 0,
                         ratingSum: p.rating ?? 0,
                         ratingCount: 1,
                         motm: motmId === pid ? 1 : 0,
                    });
               }
          }
     }

     console.log(`📊 Total unique players found in this window: ${statsMap.size}`);

     // ─── 3. Filter by Minimum Match Threshold ─────────────────────────────────────
     const eligibleIds = [...statsMap.entries()]
          .filter(([, stats]) => stats.matchCount >= minMatches)
          .map(([id]) => new mongoose.Types.ObjectId(id));

     if (eligibleIds.length === 0) {
          console.log(`⚠️ No players with minimum ${minMatches} matches in this window`);
          return [];
     }

     console.log(`✅ ${eligibleIds.length} players have minimum ${minMatches} matches in this window`);

     // ─── 4. Fetch User Profiles with Filters ──────────────────────────────────────
     const userQuery: any = {
          _id: { $in: eligibleIds },
          isBlocked: "active",
     };

     if (nationality) userQuery.nationality = nationality;
     if (age) userQuery.age = age.toString();
     if (position) userQuery.position = { $in: [position] };

     const users = await userModel.find(userQuery).select("-password").lean();

     console.log(`📊 ${users.length} active users found matching filters`);

     // ─── 5. Enrich with Window Stats (including per-game metrics) ─────────────────
     const enriched = users.map((user) => {
          const stats = statsMap.get((user._id as mongoose.Types.ObjectId).toString())!;

          const avgRating = stats.ratingCount > 0
               ? parseFloat((stats.ratingSum / stats.ratingCount).toFixed(2))
               : 6.5;

          const matchCount = stats.matchCount;

          // Calculate per-game metrics
          const goalsPerGame = matchCount > 0
               ? parseFloat((stats.totalGoal / matchCount).toFixed(2))
               : 0;

          const assistsPerGame = matchCount > 0
               ? parseFloat((stats.totalAssists / matchCount).toFixed(2))
               : 0;

          const contributionPerGame = matchCount > 0
               ? parseFloat((stats.totalContribution / matchCount).toFixed(2))
               : 0;

          const savesPerGame = matchCount > 0
               ? parseFloat((stats.totalSave / matchCount).toFixed(2))
               : 0;

          const tacklesPerGame = matchCount > 0
               ? parseFloat((stats.totalTackle / matchCount).toFixed(2))
               : 0;

          const redCardsPerGame = matchCount > 0
               ? parseFloat((stats.totalRedCard / matchCount).toFixed(2))
               : 0;

          const yellowCardsPerGame = matchCount > 0
               ? parseFloat((stats.totalYellowCard / matchCount).toFixed(2))
               : 0;

          return {
               ...user,
               windowStats: {
                    // Basic stats
                    matchCount,
                    rating: avgRating,
                    goal: stats.totalGoal,
                    assists: stats.totalAssists,
                    tackle: stats.totalTackle,
                    save: stats.totalSave,
                    redCard: stats.totalRedCard,
                    yellowCard: stats.totalYellowCard,
                    contribution: stats.totalContribution,
                    motm: stats.motm,

                    // Per-game stats
                    goalsPerGame,
                    assistsPerGame,
                    contributionPerGame,
                    savesPerGame,
                    tacklesPerGame,
                    redCardsPerGame,
                    yellowCardsPerGame,
               },
          };
     });

     // ─── 6. Sorting Logic ─────────────────────────────────────────────────────────
     const windowStatFields = new Set([
          "rating", "goal", "assists", "tackle", "save",
          "redCard", "yellowCard", "contribution", "matchCount", "motm",
          "goalsPerGame", "assistsPerGame", "contributionPerGame",
          "savesPerGame", "tacklesPerGame", "redCardsPerGame", "yellowCardsPerGame"
     ]);

     enriched.sort((a, b) => {
          let aVal: number, bVal: number;

          if (windowStatFields.has(sortField)) {
               aVal = (a.windowStats as any)[sortField] ?? 0;
               bVal = (b.windowStats as any)[sortField] ?? 0;
          } else {
               aVal = (a as any)[sortField] ?? 0;
               bVal = (b as any)[sortField] ?? 0;
          }

          // Ensure numeric conversion
          aVal = typeof aVal === "number" ? aVal : parseFloat(aVal) || 0;
          bVal = typeof bVal === "number" ? bVal : parseFloat(bVal) || 0;

          return sortOrder === "desc" ? bVal - aVal : aVal - bVal;
     });

     console.log(`🎯 Final ranking count for ${filterBy} window: ${enriched.length}`);

     return enriched;
};

export default playerRanking;


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