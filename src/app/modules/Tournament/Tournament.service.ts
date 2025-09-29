import AppError from "../../Error/AppError.js";
import type { ITournament } from "./Tournament.interface.js";
import { TournamentModel } from "./Tournament.model.js";

const createTournament = async (payload: ITournament) => {
     const result = await TournamentModel.create(payload)
     return result;
}


const singleTournament = async (id: string) => {
     const result = await TournamentModel.findById(id).populate("winner qualifiedTeams teams")
     return result

}

const allTournament = async () => {
     const result = await TournamentModel.find().populate("winner qualifiedTeams teams")
     return result
}


const updateTournament = async (id: string, payload: Partial<ITournament>) => {
     const isTournamentIsExists = await TournamentModel.findById(id)
     if (!isTournamentIsExists) {
          throw new AppError(404, "this tournament is not found");

     }
     const result = await TournamentModel.findByIdAndUpdate(id, payload, { new: true })
     return result;
}

const deleteTournament = async (id: string) => {
     const isTournamentIsExists = await TournamentModel.findById(id)
     if (!isTournamentIsExists) {
          throw new AppError(404, "this tournament is not found");

     }
     const result = await TournamentModel.findByIdAndDelete(id)
     return result;
}


export const TournamentService = {
     createTournament,
     singleTournament,
     allTournament,
     updateTournament,
     deleteTournament
}

