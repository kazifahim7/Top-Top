import { userModel } from "../auth/auth.model.js"
import { TeamModel } from "../Team/team.model.js";

const playerRanking = async () => {
     const result = await userModel.aggregate([
          {
               $match: {
                    match: { $gte: 2 }   
               }
          },
          {
               $sort: {
                    rating: -1           
               }
          }
     ]);

     return result;
};

const teamRanking = async () => {
     const result = await TeamModel.aggregate([
     
          {
               $lookup: {
                    from: "players",
                    localField: "players",
                    foreignField: "_id",
                    as: "playersData"
               }
          },

     
          {
               $match: {
                    "playersData.0": { $exists: true }
               }
          },
          

          {
               $addFields: {
                    avgRating: { $avg: "$playersData.rating" }
               }
          },


          {
               $sort: {
                    avgRating: -1
               }
          }

     ]);

     return result;
};




export const playerRankingService = {
     playerRanking,
     teamRanking
}