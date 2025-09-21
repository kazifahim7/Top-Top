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
import { TeamModel } from "../Team/team.model.js";
const playerRanking = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield userModel.aggregate([
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
});
const teamRanking = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield TeamModel.aggregate([
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
});
export const playerRankingService = {
    playerRanking,
    teamRanking
};
//# sourceMappingURL=ranking.services.js.map