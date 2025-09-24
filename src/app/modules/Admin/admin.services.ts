import { userModel } from "../auth/auth.model.js";
import { LobbyModel } from "../Lobby/lobby.model.js";
import { PaymentModel } from "../Payment/payment.model.js";

const adminData = async () => {
     const totalRevenue = await PaymentModel.aggregate([
          {
               $group: {
                    _id: null,
                    total: { $sum: "$amount" }
               }
          }
     ]);

     const lobbyCount = await LobbyModel.countDocuments();
     const activePlayers = await userModel.countDocuments({ isBlocked: "active" });
     const revenueGraph = await PaymentModel.aggregate([
          {
               $group: {
                    _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
                    total: { $sum: "$amount" }
               }
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } }
     ]);

     const recentTransactions = await PaymentModel.find()
          .sort({ createdAt: -1 })
          .limit(5);


     const trafficByCountry = await userModel.aggregate([
          {
               $group: {
                    _id: "$country",
                    count: { $sum: 1 }
               }
          },
          {
               $project: {
                    country: "$_id",
                    percentage: {
                         $multiply: [{ $divide: ["$count", { $sum: "$count" }] }, 100]
                    }
               }
          }
     ]);


     const matchesPlayed = await userModel.aggregate([
          {
               $group: {
                    _id: null,
                    totalMatches: { $sum: "$match" }
               }
          }
     ]);

     const totalMatches = matchesPlayed[0]?.totalMatches || 0;



     // revenue growth
     const now = new Date();
     const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
     const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
     const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

     // Current month revenue
     const currentRevenue = await PaymentModel.aggregate([
          { $match: { createdAt: { $gte: startOfThisMonth } } },
          { $group: { _id: null, total: { $sum: "$amount" } } }
     ]);

     // Last month revenue
     const lastRevenue = await PaymentModel.aggregate([
          { $match: { createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
          { $group: { _id: null, total: { $sum: "$amount" } } }
     ]);

     const revenueGrowth = lastRevenue[0]?.total
          ? ((currentRevenue[0]?.total || 0) - lastRevenue[0].total) / lastRevenue[0].total * 100
          : 0;



     // player growth 
     const currentPlayers = await userModel.countDocuments({ createdAt: { $gte: startOfThisMonth } });
     const lastPlayers = await userModel.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } });

     const playerGrowth = lastPlayers
          ? ((currentPlayers - lastPlayers) / lastPlayers) * 100
          : 0;



     const currentMatches = await userModel.aggregate([
          { $match: { updatedAt: { $gte: startOfThisMonth } } },
          { $group: { _id: null, total: { $sum: "$matchesPlayed" } } }
     ]);

     const lastMatches = await userModel.aggregate([
          { $match: { updatedAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
          { $group: { _id: null, total: { $sum: "$matchesPlayed" } } }
     ]);

     const matchGrowth = lastMatches[0]?.total
          ? ((currentMatches[0]?.total || 0) - lastMatches[0].total) / lastMatches[0].total * 100
          : 0;



     const currentLobbies = await LobbyModel.countDocuments({ createdAt: { $gte: startOfThisMonth } });
     const lastLobbies = await LobbyModel.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } });

     const lobbyGrowth = lastLobbies
          ? ((currentLobbies - lastLobbies) / lastLobbies) * 100
          : 0;


     return {
          totalRevenue,
          revenueGrowth,
          activePlayers,
          playerGrowth,
          lobbyCount,
          lobbyGrowth,
          totalMatches,
          matchGrowth,
          revenueGraph,
          recentTransactions,
          trafficByCountry
          

     }





}


export const adminService ={
     adminData
}