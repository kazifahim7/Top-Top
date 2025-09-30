
import { StandingModel } from "./pointtable.model.js"

const getPointTable =async(id:string)=>{
     const result = await StandingModel.find({ tournament: id }).populate("team tournament")
     return result
}





export const pointTableService ={
     getPointTable
}