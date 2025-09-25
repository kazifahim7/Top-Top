var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { userModel } from "../auth/auth.model.js";
import { LobbyModel } from "../Lobby/lobby.model.js";
import { PaymentModel } from "../Payment/payment.model.js";
const adminData = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    const totalRevenue = yield PaymentModel.aggregate([
        {
            $match: { status: "success" }
        },
        {
            $group: {
                _id: null,
                total: { $sum: "$price" }
            }
        }
    ]);
    const lobbyCount = yield LobbyModel.countDocuments();
    const activePlayers = yield userModel.countDocuments({ isBlocked: "active" });
    const revenueGraph = yield PaymentModel.aggregate([
        {
            $match: { status: "success" }
        },
        {
            $group: {
                _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
                total: { $sum: "$price" }
            }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    const recentTransactions = yield PaymentModel.find()
        .sort({ createdAt: -1 })
        .limit(5).select("-stripePaymentIntentId");
    const trafficByCountry = yield userModel.aggregate([
        {
            $group: {
                _id: "$nationality",
                count: { $sum: 1 }
            }
        },
        {
            $group: {
                _id: null,
                countries: { $push: { country: "$_id", count: "$count" } },
                total: { $sum: "$count" }
            }
        },
        {
            $unwind: "$countries"
        },
        {
            $project: {
                _id: 0,
                country: "$countries.country",
                count: "$countries.count",
                percentage: {
                    $multiply: [
                        { $divide: ["$countries.count", "$total"] },
                        100
                    ]
                }
            }
        }
    ]);
    const matchesPlayed = yield userModel.aggregate([
        {
            $group: {
                _id: null,
                totalMatches: { $sum: "$match" }
            }
        }
    ]);
    const totalMatches = ((_a = matchesPlayed[0]) === null || _a === void 0 ? void 0 : _a.totalMatches) || 0;
    // revenue growth
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    // Current month revenue
    const currentRevenue = yield PaymentModel.aggregate([
        { $match: { createdAt: { $gte: startOfThisMonth }, status: "success" } },
        { $group: { _id: null, total: { $sum: "$price" } } }
    ]);
    // Last month revenue
    const lastRevenue = yield PaymentModel.aggregate([
        { $match: { createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }, status: "success" } },
        { $group: { _id: null, total: { $sum: "$price" } } }
    ]);
    const revenueGrowth = ((_b = lastRevenue[0]) === null || _b === void 0 ? void 0 : _b.total)
        ? ((((_c = currentRevenue[0]) === null || _c === void 0 ? void 0 : _c.total) || 0) - lastRevenue[0].total) / lastRevenue[0].total * 100
        : 0;
    // player growth 
    const currentPlayers = yield userModel.countDocuments({ createdAt: { $gte: startOfThisMonth } });
    const lastPlayers = yield userModel.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } });
    const playerGrowth = lastPlayers
        ? ((currentPlayers - lastPlayers) / lastPlayers) * 100
        : 0;
    const currentMatches = yield userModel.aggregate([
        { $match: { updatedAt: { $gte: startOfThisMonth } } },
        { $group: { _id: null, total: { $sum: "$matchesPlayed" } } }
    ]);
    const lastMatches = yield userModel.aggregate([
        { $match: { updatedAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
        { $group: { _id: null, total: { $sum: "$matchesPlayed" } } }
    ]);
    const matchGrowth = ((_d = lastMatches[0]) === null || _d === void 0 ? void 0 : _d.total)
        ? ((((_e = currentMatches[0]) === null || _e === void 0 ? void 0 : _e.total) || 0) - lastMatches[0].total) / lastMatches[0].total * 100
        : 0;
    const currentLobbies = yield LobbyModel.countDocuments({ createdAt: { $gte: startOfThisMonth } });
    const lastLobbies = yield LobbyModel.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } });
    const lobbyGrowth = lastLobbies
        ? ((currentLobbies - lastLobbies) / lastLobbies) * 100
        : 0;
    return {
        totalRevenue: ((_f = totalRevenue[0]) === null || _f === void 0 ? void 0 : _f.total) || 0,
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
    };
});
export const adminService = {
    adminData
};
//# sourceMappingURL=admin.services.js.map