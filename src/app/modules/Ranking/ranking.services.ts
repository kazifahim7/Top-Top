import { userModel } from "../auth/auth.model.js"
import { TeamModel } from "../Team/team.model.js";

interface RankingOptions {
     filterBy?: "weekly" | "monthly" | "all";
     sortField?: string;          
     sortOrder?: "asc" | "desc";  
     matchField?: string;         
     matchValue?: any;            
}

const playerRanking = async (options: RankingOptions) => {
     const { filterBy = "all", sortField = "rating", sortOrder = "desc" } = options;

     const now = new Date();
     let startDate: Date | undefined;

     // Date filter only for weekly & monthly
     if (filterBy === "weekly") {
          startDate = new Date();
          startDate.setDate(now.getDate() - 7); // last 7 days
     } else if (filterBy === "monthly") {
          startDate = new Date();
          startDate.setMonth(now.getMonth() - 1); // last 1 month
     }

     // Minimum match threshold
     const minMatches = filterBy === "weekly" ? 2 : filterBy === "monthly" ? 4 : 15;

     // Match stage
     const matchStage: any = {};

     // All-time ranking → only match count
     if (filterBy === "all") {
          matchStage.match = { $gte: minMatches };
     } else {
          // Weekly / Monthly → match count AND updatedAt filter
          matchStage.match = { $gte: minMatches };
          if (startDate) {
               matchStage.updatedAt = { $gte: startDate, $lte: now };
          }
     }

     const sortDirection = sortOrder === "asc" ? 1 : -1;

     const result = await userModel.aggregate([
          { $match: matchStage },
          { $sort: { [sortField]: sortDirection } },
     ]);

     return result;
};

const teamRanking = async (options: RankingOptions) => {
     const { filterBy = "all", sortField = "avgRating", sortOrder = "desc", matchField, matchValue } = options;

     const now = new Date();
     let startDate: Date | undefined;

     if (filterBy === "weekly") {
          startDate = new Date();
          startDate.setDate(now.getDate() - 7);
     } else if (filterBy === "monthly") {
          startDate = new Date();
          startDate.setMonth(now.getMonth() - 1);
     }

     const matchStage: any = {};

     if (filterBy !== "all" && startDate) {
          matchStage.createdAt = { $gte: startDate, $lte: now };
     }

 
     if (matchField && matchValue !== undefined) {
          matchStage[matchField] = matchValue;
     }

     const sortDirection = sortOrder === "asc" ? 1 : -1;

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
                    "playersData.0": { $exists: true },
                    ...matchStage
               }
          },
          {
               $addFields: {
                    avgRating: { $avg: "$playersData.rating" }
               }
          },
          {
               $sort: { [sortField]: sortDirection }
          }
     ]);

     return result;
};




export const playerRankingService = {
     playerRanking,
     teamRanking
}