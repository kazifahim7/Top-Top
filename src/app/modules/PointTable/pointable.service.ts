import { TournamentModel } from "../Tournament/Tournament.model.js"

const getPointTable =async(id:string)=>{
     const result = await TournamentModel.findById(id)
     return result
}





export const pointTableService ={
     getPointTable
}