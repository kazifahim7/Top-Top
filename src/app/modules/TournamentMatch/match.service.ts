import AppError from "../../Error/AppError.js";
import { StandingModel } from "../PointTable/pointtable.model.js";
import { TournamentModel } from "../Tournament/Tournament.model.js";
import type { IMatch } from "./match.interface.js";
import { MatchModel } from "./match.model.js";

const createMatch = async (payload: IMatch) => {
     const result = await MatchModel.create(payload)
     return result ;
}

const allMatch = async(id:string)=>{
     const result = await MatchModel.find({tournament:id}).populate("winner teamB teamA tournament")
     return result;
}

const singleMatch = async(id:string)=>{
     const result = await MatchModel.findById(id).populate("winner teamB teamA tournament")
     return result
}

const deleteMatch = async(id:string)=>{
     const result = await MatchModel.findByIdAndDelete(id)
     return result
}





export const updateMatchAndStanding = async (
     matchId: string,
     scoreA: number,
     scoreB: number
) => {
     const match = await MatchModel.findById(matchId);
     if (!match) throw new AppError(404,"Match not found");

     if (match.status === "Completed") {
          throw new AppError(403,"Match already completed and standings updated.");
     }

     // Get tournament
     const tournament = await TournamentModel.findById(match.tournament);
     if (!tournament) throw new Error("Tournament not found");

     //  Update match info
     match.scoreA = scoreA;
     match.scoreB = scoreB;
     match.status = "Completed";
     match.winner =
          scoreA > scoreB ? match.teamA : scoreB > scoreA ? match.teamB : null;

     await match.save();

     //  Update standings for both teams
     await updateStanding(match.tournament.toString(), match.teamA.toString(), scoreA, scoreB);
     await updateStanding(match.tournament.toString(), match.teamB.toString(), scoreB, scoreA);

     // Check if this is a final match and update tournament winner
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




export const tournamentMatchService = {
     createMatch,
     singleMatch,
     deleteMatch,
     allMatch,
     updateMatchAndStanding

}