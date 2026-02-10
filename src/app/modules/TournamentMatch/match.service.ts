import AppError from "../../Error/AppError.js";
import { getPlayerOverallRating } from "../../utils/getRating.js";
import { roundRating } from "../../utils/roundRating.js";
import { userModel } from "../auth/auth.model.js";
import { StandingModel } from "../PointTable/pointtable.model.js";
import { TeamModel } from "../Team/team.model.js";
import { TournamentModel } from "../Tournament/Tournament.model.js";
import type { IMatch } from "./match.interface.js";
import { MatchModel } from "./match.model.js";
import { Types } from "mongoose";
interface PlayerData {
     playerId: string;
     matchPosition?: string;
     guest_player?: boolean;
}

interface AddPlayersData {
     team: "A" | "B";
     matchFormat?: string;
     players: PlayerData[];
}

const createMatch = async (payload: IMatch, id: string) => {
     payload.organizer = new Types.ObjectId(id);
     const result = await MatchModel.create(payload)
     return result;
}

const allMatch = async (id: string) => {
     const result = await MatchModel.find({ tournament: id }).populate("winner teamB teamA tournament")
     return result;
}

const singleMatch = async (id: string) => {
     const result = await MatchModel.findById(id)
          .populate("winner")
          .populate("teamA")
          .populate("teamB")
          .populate("tournament")
          .populate("organizer")
          .populate("motm")
          .populate({
               path: "teamA",
               populate: { path: "players" }
          })
          .populate({
               path: "teamA",
               populate: { path: "teamOwner" }
          })
          .populate({
               path: "teamB",
               populate: { path: "players" }
          })
          .populate({
               path: "teamB",
               populate: { path: "teamOwner" }
          }).populate(
               {
                    path: "teamAPlayers",
                    populate: { path: "playerId" }
               }
          ).populate(
               {
                    path: "teamBPlayers",
                    populate: { path: "playerId" }
               }
          );

     return result;
}

const deleteMatch = async (id: string) => {
     const result = await MatchModel.findByIdAndDelete(id)
     return result
}





export const updateMatchAndStanding = async (
     matchId: string,
     data: Partial<IMatch>
) => {
     const match = await MatchModel.findById(matchId);
     if (!match) throw new AppError(404, "Match not found");

     if (match.status === "Completed") {
          throw new AppError(403, "Match already completed");
     }

     const tournament = await TournamentModel.findById(match.tournament);
     if (!tournament) throw new AppError(404, "Tournament not found");

     // ---------- ONLY ALLOWED UPDATES ----------
     if (typeof data.scoreA === "number") match.scoreA = data.scoreA;
     if (typeof data.scoreB === "number") match.scoreB = data.scoreB;

     if (data.media?.length) {
          match.media = [...(match.media || []), ...data.media];
     }

     if (data.motm) {
          match.motm = data.motm;
     }

     // ---------- Auto Winner ----------
     if (
          typeof match.scoreA === "number" &&
          typeof match.scoreB === "number"
     ) {
          match.winner =
               match.scoreA > match.scoreB
                    ? match.teamA
                    : match.scoreB > match.scoreA
                         ? match.teamB
                         : null;
     }

     match.status = "Completed";

     await match.save();

     // ---------- Update Standings ----------
     await updateStanding(
          match.tournament.toString(),
          match.teamA.toString(),
          match.scoreA,
          match.scoreB
     );

     await updateStanding(
          match.tournament.toString(),
          match.teamB.toString(),
          match.scoreB,
          match.scoreA
     );

     // ---------- Final Match ----------
     if (match.group === "Final" && match.winner) {
          tournament.winner = match.winner;
          tournament.status = "completed";
          await tournament.save();
     }

     return match;
};


const updateStanding = async (
     tournamentId: string,
     teamId: string,
     scored: number,
     conceded: number
) => {
     let standing = await StandingModel.findOne({
          tournament: tournamentId,
          team: teamId
     });

     if (!standing) {
          standing = new StandingModel({
               tournament: tournamentId,
               team: teamId,
               played: 0,
               win: 0,
               draw: 0,
               loss: 0,
               goalsFor: 0,
               goalsAgainst: 0,
               points: 0,
          });
     }

     // update stats
     standing.played += 1;
     standing.goalsFor += scored;
     standing.goalsAgainst += conceded;

     if (scored > conceded) {
          standing.win += 1;
          standing.points += 3;
     } else if (scored === conceded) {
          standing.draw += 1;
          standing.points += 1;
     } else {
          standing.loss += 1;
     }

     await standing.save();
     return standing;
};



const addPlayers = async (
     matchId: string,
     data: AddPlayersData,
     userId: string
) => {
     const { team, players, matchFormat } = data;

     // 1️⃣ Find Match
     const match = await MatchModel.findById(matchId);
     if (!match) throw new AppError(404, "Match not found");

     if (match.status === "Completed") {
          throw new AppError(400, "Match already  completed");
     }

     // 2️⃣ Find Team
     const teamId = team === "A" ? match.teamA : match.teamB;
     const teamDoc = await TeamModel.findById(teamId);

     if (!teamDoc) throw new AppError(404, "Team not found");

     const tournamentExist = await TournamentModel.findOne(match.tournament)
     if (!tournamentExist) {
          throw new AppError(404, "Tournament  not found");
     }

     // 3️⃣ Check if user is team owner or captain
     const isOwner = String(teamDoc.teamOwner) === String(userId);
    
     const isCaptain = teamDoc.teamCaptain.some(
          id => String(id) === String(userId)
     );
    
     const isLeader = isOwner || isCaptain;

     if (!isLeader) {
          throw new AppError(403, "You can not add player");
     }



     // 4️⃣ Set match format (Leader only)
     if (isLeader && matchFormat) {
          if (team === "A") match.team1MatchFormat = matchFormat;
          else match.team2MatchFormat = matchFormat;
     }

     // 5️⃣ Add players
     const targetField = team === "A" ? "teamAPlayers" : "teamBPlayers";

     for (const p of players) {
          const isTeamMember = teamDoc.players.some(
               id => id.equals(p.playerId)
          );

          const isTeamOwner = teamDoc.teamOwner.equals(p.playerId);

          if (!isTeamMember && !isTeamOwner) {
               throw new AppError(403, "Player is not in this team");
          }



          const exists = match[targetField].some(
               pl => String(pl.playerId) === String(p.playerId)
          );
          if (exists) {
               throw new AppError(403, "Already exits");

          };
          const enteriedPlayer = match[targetField].filter((player) => player.guest_player == true)
          if (enteriedPlayer.length >= tournamentExist.fieldSize) {
               throw new AppError(403, "Already team is full");
          }

          match[targetField].push({
               playerId: new Types.ObjectId(p.playerId),
               matchPosition: p.matchPosition ?? "",
               guest_player: p.guest_player ?? false,

               // Default stats
               redCard: 0,
               yellowCard: 0,
               contribution: 0,
               assists: 0,
               goal: 0,
               tackle: 0,
               save: 0,
               goodMoment: 0,
               veryGoodMoment: 0,
               rating: 6.5
          });
     }

     // 6️⃣ Calculate avg profile rating
     const calculateAvg = async (arr: any[]) => {
          if (!arr.length) return 0;

          const ids = arr.map(p => p.playerId);
          const profiles = await userModel.find({ _id: { $in: ids } }, { rating: 1 });

          if (!profiles.length) return 0;

          const total = profiles.reduce((sum, p) => sum + (p.rating || 6.5), 0);
          return Number((total / profiles.length).toFixed(2));
     };

     match.team1AvgMatchRatingBefore = await calculateAvg(match.teamAPlayers);
     match.team2AvgMatchRatingBefore = await calculateAvg(match.teamBPlayers);

     // 7️⃣ Save match
     const result = await match.save();
     return result;
};


interface RemovePlayerData {
     team: "A" | "B";
     playerId: string;
}

export const removePlayerFromMatch = async (
     matchId: string,
     data: RemovePlayerData,
     userId: string
) => {
     const { team, playerId } = data;

     // 1️⃣ Find Match
     const match = await MatchModel.findById(matchId);
     if (!match) throw new AppError(404, "Match not found");

     if (match.status !== "Pending") {
          throw new AppError(400, "Cannot remove player from a started or completed match");
     }

     // 2️⃣ Find Team
     const teamId = team === "A" ? match.teamA : match.teamB;
     const teamDoc = await TeamModel.findById(teamId);
     if (!teamDoc) throw new AppError(404, "Team not found");

     // 3️⃣ Check if user is team owner or captain
     const isOwner = String(teamDoc.teamOwner) === String(userId);
     const isCaptain = teamDoc.teamCaptain.some(id => String(id) === String(userId));
     const isLeader = isOwner || isCaptain;

     // ❌ Normal player restriction
     if (!isLeader && String(playerId) !== String(userId)) {
          throw new AppError(403, "You can only remove yourself");
     }

     // 4️⃣ Remove player
     const targetField = team === "A" ? "teamAPlayers" : "teamBPlayers";

     const beforeLength = match[targetField].length;

     match[targetField] = match[targetField].filter(
          p => String(p.playerId) !== String(playerId)
     );

     if (beforeLength === match[targetField].length) {
          throw new AppError(404, "Player not found in this match");
     }

     // 5️⃣ Recalculate avg profile rating
     const calculateAvg = async (arr: any[]) => {
          if (!arr.length) return 0;

          const ids = arr.map(p => p.playerId);
          const profiles = await userModel.find({ _id: { $in: ids } }, { rating: 1 });

          if (!profiles.length) return 0;

          const total = profiles.reduce((sum, p) => sum + (p.rating || 6.5), 0);
          return Number((total / profiles.length).toFixed(2));
     };

     match.team1AvgMatchRatingBefore = await calculateAvg(match.teamAPlayers);
     match.team2AvgMatchRatingBefore = await calculateAvg(match.teamBPlayers);

     // 6️⃣ Save match
     const result = await match.save();

     return result;
};



interface UpdatePlayerStatsDTO {
     matchId: string;
     playerId: string;
     redCard?: number;
     yellowCard?: number;
     goal?: number;
     assists?: number;
     contribution?: number;
     save?: number;
     goodMoment?: number;
     veryGoodMoment?: number

}

export const updatePlayerStats = async (data: UpdatePlayerStatsDTO) => {
     const match = await MatchModel.findById(data.matchId);
     if (!match) throw new Error("Match not found");

     let player: any = null;
     let teamKey: "A" | "B" | null = null;

     // -------- Find player ----------
     player = match.teamAPlayers.find(
          p => p.playerId.toString() === data.playerId
     );
     if (player) {
          teamKey = "A";
     } else {
          player = match.teamBPlayers.find(
               p => p.playerId.toString() === data.playerId
          );
          if (player) teamKey = "B";
     }

     if (!player || !teamKey) {
          throw new Error("Player not found in match");
     }

     // -------- Rating calculation ----------
     let matchRating = player.rating ?? 6.5;

     matchRating -= (data.redCard ?? 0) * 0.5;
     matchRating -= (data.yellowCard ?? 0) * 0.25;

     matchRating += (data.goal ?? 0) * 0.5;
     matchRating += (data.assists ?? 0) * 0.5;
     matchRating += (data.contribution ?? 0) * 0.25;
     matchRating += (data.save ?? 0) * 0.25;
     matchRating += (data.goodMoment ?? 0) * 0.25;
     matchRating += (data.veryGoodMoment ?? 0) * 0.5;

     // matchRating = Math.max(0, Math.min(10, matchRating));
     // Number(matchRating.toFixed(2));
     player.rating = Number(matchRating)

     // -------- Update stats ----------
     const fields: (keyof UpdatePlayerStatsDTO)[] = [
          "redCard",
          "yellowCard",
          "goal",
          "assists",
          "contribution",
          "save",
          "goodMoment",
          "veryGoodMoment",
     ];

     fields.forEach(field => {
          if (data[field] !== undefined) {
               player[field] += data[field]!;
          }
     });

     // -------- Update match score ----------
     if (data.goal && data.goal > 0) {
          if (teamKey === "A") match.scoreA += data.goal;
          if (teamKey === "B") match.scoreB += data.goal;
     }

     await match.save();

     console.log("Before rating:", player.rating);
     console.log("Yellow:", data.yellowCard);
     console.log("After rating:", matchRating);


     // -------- Recalculate player avg rating ----------
     const { averageRating, matchCount } =
          await getPlayerOverallRating(data.playerId);

     // -------- Update player profile ----------
     await userModel.findByIdAndUpdate(
          data.playerId,
          {
               $inc: {
                    redCard: data.redCard ?? 0,
                    yellowCard: data.yellowCard ?? 0,
                    goal: data.goal ?? 0,
                    assists: data.assists ?? 0,
                    contribution: data.contribution ?? 0,
                    save: data.save ?? 0,
               },
               match: matchCount,
               rating: Number(averageRating.toFixed(2)),
          },
          { new: true }
     );

     return { matchPlayer: player };
};




export const tournamentMatchService = {
     createMatch,
     singleMatch,
     deleteMatch,
     allMatch,
     updateMatchAndStanding,
     addPlayers,
     removePlayerFromMatch,
     updatePlayerStats

}