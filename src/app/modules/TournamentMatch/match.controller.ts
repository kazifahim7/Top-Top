import catchAsync from "../../utils/catcgAsync.js";
import { tournamentMatchService } from "./match.service.js";

const createMatch =catchAsync(async(req,res)=>{
     const result = await tournamentMatchService.createMatch(req.body)
     res.status(200).json({
          success:true,
          message:"Match created successfully",
          data:result
     })
})
const allMatch =catchAsync(async(req,res)=>{
     const result = await tournamentMatchService.allMatch()
     res.status(200).json({
          success:true,
          message:"All TOurnament match are retrieved  successfully",
          data:result
     })
})
const singleMatch =catchAsync(async(req,res)=>{
     const result = await tournamentMatchService.singleMatch(req.params.id!)
     res.status(200).json({
          success:true,
          message:"  TOurnament match are retrieved  successfully",
          data:result
     })
})
const deleteMatch =catchAsync(async(req,res)=>{
     const result = await tournamentMatchService.deleteMatch(req.params.id!)
     res.status(200).json({
          success:true, 
          message:" match are deleted  successfully",
          data:{}
     })
})


export const tournamentMatchController ={
     createMatch,
     deleteMatch,
     allMatch,
     singleMatch
     
}