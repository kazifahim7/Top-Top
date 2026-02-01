import { Types } from 'mongoose'
import { MatchModel } from '../modules/TournamentMatch/match.model.js';
import { LobbyModel } from '../modules/Lobby/lobby.model.js';

export const getPlayerOverallRating = async (playerId: string) => {
     const objectId = new Types.ObjectId(playerId);
     let totalRating = 0;
     let matchCount = 0;

     // ---------------- TOURNAMENT MATCH ----------------
     const matches = await MatchModel.find({
          $or: [
               { "teamAPlayers.playerId": objectId },
               { "teamBPlayers.playerId": objectId },
          ],
     });

     matches.forEach(match => {
          [...match.teamAPlayers, ...match.teamBPlayers].forEach(p => {
               if (p.playerId.toString() === playerId && p.rating) {
                    totalRating += p.rating;
                    matchCount++;
               }
          });
     });

     // ---------------- LOBBY MATCH ----------------
     const teams = ["team1", "team2", "defaultTeam1", "defaultTeam2"] as const;

     const lobbies = await LobbyModel.find({
          $or: [
               { "team1.players.playerId": objectId },
               { "team2.players.playerId": objectId },
               { "defaultTeam1.players.playerId": objectId },
               { "defaultTeam2.players.playerId": objectId },
          ],
     });

     lobbies.forEach(lobby => {
          teams.forEach(key => {
               const team = lobby[key];
               if (!team?.players?.length) return;

               const player = team.players.find(
                    p => p.playerId.toString() === playerId
               );

               if (player?.rating) {
                    totalRating += player.rating;
                    matchCount++;
               }
          });
     });

     const averageRating = matchCount ? totalRating / matchCount : 6.5;

     return {
          averageRating: Number(averageRating.toFixed(2)),
          matchCount,
     };
};
