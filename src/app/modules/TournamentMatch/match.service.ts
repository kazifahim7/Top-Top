import type { IMatch } from "./match.interface.js";
import { MatchModel } from "./match.model.js";

const createMatch = async (payload: IMatch) => {
     const result = await MatchModel.create(payload)
     return result ;
}

const allMatch = async()=>{
     const result = await MatchModel.find().populate("winner teamB teamA tournament")
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



export const tournamentMatchService = {
     createMatch,
     singleMatch,
     deleteMatch,
     allMatch

}