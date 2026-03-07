import mongoose from "mongoose";
import { userModel } from "../auth/auth.model.js";
import { TeamModel } from "../Team/team.model.js";
import { LobbyModel } from "../Lobby/lobby.model.js";
import { MatchModel } from "../TournamentMatch/match.model.js";
const playerRanking = async (options) => {
    const { filterBy = "all", sortField = "rating", sortOrder = "desc", nationality, age, position, } = options;
    const now = new Date();
    let startDate;
    // ─── Date window ─────────────────────────────────────────────────────────────
    if (filterBy === "weekly") {
        startDate = new Date();
        startDate.setDate(now.getDate() - 7);
    }
    else if (filterBy === "monthly") {
        startDate = new Date();
        startDate.setMonth(now.getMonth() - 1);
    }
    // ─── Min match threshold ──────────────────────────────────────────────────────
    // weekly  → at least 2 matches in last 7 days
    // monthly → at least 4 matches in last 1 month
    // all     → at least 15 matches all time
    const minMatches = filterBy === "weekly" ? 2 : filterBy === "monthly" ? 4 : 15;
    // ✅ FIX 1: Only $gte — no upper bound ($lte: now removed)
    // This ensures future-dated completed matches are also included
    const dateFilter = startDate ? { $gte: startDate } : undefined;
    // ─── Reusable aggregation pipeline ───────────────────────────────────────────
    const aggregatePlayerStats = async (model, config) => {
        const matchStage = { [config.statusField]: config.statusValue };
        if (dateFilter)
            matchStage[config.dateField] = dateFilter;
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
    const statsMap = new Map();
    const mergeStats = (entries) => {
        for (const e of entries) {
            if (!e._id)
                continue;
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
            }
            else {
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
    if (eligibleIds.length === 0)
        return [];
    // ─── Step 5: Fetch user profiles ─────────────────────────────────────────────
    // ✅ FIX 2: Removed role: "player" — admin/organizer can also participate
    // in matches and should appear in rankings
    const userQuery = {
        _id: { $in: eligibleIds },
        isBlocked: "active",
    };
    if (nationality)
        userQuery.nationality = nationality;
    if (age)
        userQuery.age = age.toString();
    if (position)
        userQuery.position = { $in: [position] };
    const users = await userModel
        .find(userQuery)
        .select("-password")
        .lean();
    // ─── Step 6: Attach window-specific stats ────────────────────────────────────
    const enriched = users.map((user) => {
        const s = statsMap.get(user._id.toString());
        const avgRating = s.ratingCount > 0
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
            ? a.windowStats[sortField] ?? 0
            : a[sortField] ?? 0;
        const bVal = windowStatFields.has(sortField)
            ? b.windowStats[sortField] ?? 0
            : b[sortField] ?? 0;
        return sortDir * (bVal - aVal);
    });
    return enriched;
};
const teamRanking = async (options) => {
    const { filterBy = "all", sortField = "win", sortOrder = "desc", matchField, matchValue } = options;
    const now = new Date();
    let startDate;
    if (filterBy === "weekly") {
        startDate = new Date();
        startDate.setDate(now.getDate() - 7);
    }
    else if (filterBy === "monthly") {
        startDate = new Date();
        startDate.setMonth(now.getMonth() - 1);
    }
    const dateFilter = startDate ? { $gte: startDate, $lte: now } : undefined;
    const sortDirection = sortOrder === "asc" ? 1 : -1;
    const allTeams = await TeamModel.find({}).lean();
    // ─── teamStatsMap initialize ──────────────────────────────────────────────
    // filterBy === "all" হলে TeamModel এর stored stats দিয়ে শুরু করো
    // weekly/monthly হলে 0 থেকে শুরু করো (date filter দিয়ে fresh calculate হবে)
    const teamStatsMap = {};
    for (const team of allTeams) {
        if (filterBy === "all") {
            // alltime: TeamModel এ stored stats সরাসরি use করো
            teamStatsMap[team._id.toString()] = {
                teamId: team._id.toString(),
                totalMatch: team.totalMatch || 0,
                win: team.win || 0,
                draw: team.draw || 0,
                loss: team.loss || 0,
                goal: team.goal || 0,
                carryGoal: team.carryGoal || 0,
            };
        }
        else {
            // weekly/monthly: 0 থেকে শুরু, date filter দিয়ে calculate হবে
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
    // ─── weekly/monthly এর জন্য Lobby + Match থেকে fresh calculate ────────────
    if (filterBy !== "all") {
        const lobbyFilter = {
            lobbyStatus: "completed",
            matchType: "teams",
            $or: [
                { "team1.teamId": { $exists: true } },
                { "team2.teamId": { $exists: true } },
            ],
        };
        if (dateFilter)
            lobbyFilter.date = dateFilter;
        const completedLobbies = await LobbyModel.find(lobbyFilter).lean();
        for (const lobby of completedLobbies) {
            const team1Id = lobby.team1?.teamId?.toString();
            const team2Id = lobby.team2?.teamId?.toString();
            if (!team1Id || !team2Id)
                continue;
            if (!teamStatsMap[team1Id] || !teamStatsMap[team2Id])
                continue;
            const score1 = lobby.goalTeam1 ?? 0;
            const score2 = lobby.goalTeam2 ?? 0;
            teamStatsMap[team1Id].totalMatch += 1;
            teamStatsMap[team1Id].goal += score1;
            teamStatsMap[team1Id].carryGoal += score2;
            if (score1 > score2)
                teamStatsMap[team1Id].win += 1;
            else if (score1 === score2)
                teamStatsMap[team1Id].draw += 1;
            else
                teamStatsMap[team1Id].loss += 1;
            teamStatsMap[team2Id].totalMatch += 1;
            teamStatsMap[team2Id].goal += score2;
            teamStatsMap[team2Id].carryGoal += score1;
            if (score2 > score1)
                teamStatsMap[team2Id].win += 1;
            else if (score1 === score2)
                teamStatsMap[team2Id].draw += 1;
            else
                teamStatsMap[team2Id].loss += 1;
        }
        const matchFilter = { status: "Completed" };
        if (dateFilter)
            matchFilter.date = dateFilter;
        const completedMatches = await MatchModel.find(matchFilter).lean();
        for (const match of completedMatches) {
            const teamAId = match.teamA?.toString();
            const teamBId = match.teamB?.toString();
            if (!teamAId || !teamBId)
                continue;
            if (!teamStatsMap[teamAId] || !teamStatsMap[teamBId])
                continue;
            const scoreA = match.scoreA ?? 0;
            const scoreB = match.scoreB ?? 0;
            teamStatsMap[teamAId].totalMatch += 1;
            teamStatsMap[teamAId].goal += scoreA;
            teamStatsMap[teamAId].carryGoal += scoreB;
            if (scoreA > scoreB)
                teamStatsMap[teamAId].win += 1;
            else if (scoreA === scoreB)
                teamStatsMap[teamAId].draw += 1;
            else
                teamStatsMap[teamAId].loss += 1;
            teamStatsMap[teamBId].totalMatch += 1;
            teamStatsMap[teamBId].goal += scoreB;
            teamStatsMap[teamBId].carryGoal += scoreA;
            if (scoreB > scoreA)
                teamStatsMap[teamBId].win += 1;
            else if (scoreA === scoreB)
                teamStatsMap[teamBId].draw += 1;
            else
                teamStatsMap[teamBId].loss += 1;
        }
    }
    // ─── Minimum match filter ─────────────────────────────────────────────────
    const minMatches = filterBy === "weekly" ? 4 : filterBy === "monthly" ? 10 : 15; // TODO: production এ 4/10/15 করো
    // ─── Team details + rating calculate ─────────────────────────────────────
    const results = [];
    for (const team of allTeams) {
        const stats = teamStatsMap[team._id.toString()];
        if (!stats)
            continue;
        if (stats.totalMatch < minMatches)
            continue;
        if (stats.win < 1)
            continue;
        if (matchField && matchValue !== undefined) {
            if (stats[matchField] !== matchValue)
                continue;
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
            ? parseFloat((playerDocs.reduce((sum, p) => sum + (p.rating || 0), 0) / playerDocs.length).toFixed(2))
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
        const fields = [
            "win",
            "winPercentage",
            "goalDifference",
            "goal",
            "teamRating",
            sortField,
        ];
        for (const field of fields) {
            const diff = (b[field] - a[field]) * sortDirection;
            if (diff !== 0)
                return diff;
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
};
//# sourceMappingURL=ranking.services.js.map