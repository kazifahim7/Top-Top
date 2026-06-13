import { userModel } from "../auth/auth.model.js";
import { CountryModel } from "../Country/country.model.js";
import { CountryService } from "../Country/country.service.js";
import { LobbyModel } from "../Lobby/lobby.model.js";
import { PaymentModel } from "../Payment/payment.model.js";
import { MatchModel } from "../TournamentMatch/match.model.js";
import { TournamentModel } from "../Tournament/Tournament.model.js";
const adminData = async () => {
    const totalRevenue = await PaymentModel.aggregate([
        {
            $match: { status: { $in: ["success", "paid"] } }
        },
        {
            $group: {
                _id: null,
                total: { $sum: "$price" }
            }
        }
    ]);
    const lobbyCount = await LobbyModel.countDocuments();
    const activePlayers = await userModel.countDocuments({ isBlocked: "active" });
    const matchFromTournament = await MatchModel.countDocuments();
    const revenueGraph = await PaymentModel.aggregate([
        {
            $match: { status: { $in: ["success", "paid"] } }
        },
        {
            $group: {
                _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
                total: { $sum: "$price" }
            }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    const recentTransactions = await PaymentModel.find()
        .sort({ createdAt: -1 })
        .limit(5).select("-stripePaymentIntentId");
    const trafficByCountry = await userModel.aggregate([
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
    const matchesPlayed = await userModel.aggregate([
        {
            $group: {
                _id: null,
                totalMatches: { $sum: "$match" }
            }
        }
    ]);
    const totalMatches = matchesPlayed[0]?.totalMatches + matchFromTournament || 0;
    // revenue growth
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    // Current month revenue
    const currentRevenue = await PaymentModel.aggregate([
        { $match: { createdAt: { $gte: startOfThisMonth }, status: { $in: ["success", "paid"] } } },
        { $group: { _id: null, total: { $sum: "$price" } } }
    ]);
    // Last month revenue
    const lastRevenue = await PaymentModel.aggregate([
        { $match: { createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }, status: { $in: ["success", "paid"] } } },
        { $group: { _id: null, total: { $sum: "$price" } } }
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
    const revenueBarGraph = await PaymentModel.aggregate([
        { $match: { status: { $in: ["success", "paid"] } } },
        {
            $group: {
                _id: { hour: { $hour: "$createdAt" }, day: { $dayOfMonth: "$createdAt" } },
                total: { $sum: "$price" }
            }
        },
        { $sort: { "_id.day": 1, "_id.hour": 1 } }
    ]);
    const organizerPieUsage = await userModel.aggregate([
        {
            $group: {
                _id: "$role",
                count: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                role: "$_id",
                count: 1
            }
        }
    ]);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    const MatchesPlayedVsAvailable = await userModel.aggregate([
        {
            $match: {
                isBlocked: "active",
                updatedAt: { $gte: startOfToday, $lte: endOfToday }
            }
        },
        {
            $group: {
                _id: { hour: { $hour: "$updatedAt" } },
                played: {
                    $sum: {
                        $cond: [{ $gt: ["$match", 0] }, 1, 0]
                    }
                },
                available: {
                    $sum: {
                        $cond: [{ $eq: ["$match", 0] }, 1, 0]
                    }
                }
            }
        },
        {
            $project: {
                _id: 0,
                hour: "$_id.hour",
                played: 1,
                available: 1
            }
        },
        { $sort: { hour: 1 } }
    ]);
    const mostPlayableDays = await userModel.aggregate([
        {
            $match: { isBlocked: "active" }
        },
        {
            $unwind: "$playingDays"
        },
        {
            $group: {
                _id: "$playingDays",
                count: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                day: "$_id",
                players: "$count"
            }
        },
        {
            $sort: { players: -1 }
        }
    ]);
    const mostPreferredAreas = await userModel.aggregate([
        {
            $match: {
                isBlocked: "active",
                preferredAreas: { $exists: true, $ne: [] }
            }
        },
        {
            $unwind: "$preferredAreas"
        },
        {
            $match: {
                preferredAreas: { $ne: "" }
            }
        },
        {
            $group: {
                _id: "$preferredAreas",
                players: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                area: "$_id",
                players: 1
            }
        },
        {
            $sort: { players: -1 }
        }
    ]);
    return {
        totalRevenue: totalRevenue[0]?.total || 0,
        revenueBarGraph,
        organizerPieUsage,
        revenueGrowth,
        activePlayers,
        playerGrowth,
        lobbyCount,
        lobbyGrowth,
        totalMatches,
        matchGrowth,
        revenueGraph,
        recentTransactions,
        trafficByCountry,
        MatchesPlayedVsAvailable,
        mostPlayableDays,
        mostPreferredAreas
    };
};
const PAID_PAYMENT_STATUSES = ["success", "paid"];
const calculateGrowth = (current, previous) => {
    return previous ? ((current - previous) / previous) * 100 : 0;
};
const getCountryScopedPaymentMatch = async (countryFilter) => {
    const [lobbyIds, tournamentIds] = await Promise.all([
        LobbyModel.find(countryFilter).distinct("_id"),
        TournamentModel.find(countryFilter).distinct("_id"),
    ]);
    return {
        $or: [
            { lobbyId: { $in: lobbyIds } },
            { tournamentId: { $in: tournamentIds } },
        ],
    };
};
const adminDataV2 = async (countryCode = CountryService.DEFAULT_COUNTRY_CODE) => {
    await CountryService.ensureDefaultCountry();
    const requestedCountry = typeof countryCode === "string" && countryCode.trim()
        ? countryCode.trim()
        : CountryService.DEFAULT_COUNTRY_CODE;
    const selectedCountry = await CountryService.assertActiveCountry(requestedCountry);
    const selectedCountryCode = selectedCountry.countryCode;
    const countryFilter = CountryService.buildLegacyCountryFilter(selectedCountry.countryCode);
    const paymentCountryFilter = await getCountryScopedPaymentMatch(countryFilter);
    const paidPaymentMatch = { status: { $in: PAID_PAYMENT_STATUSES }, ...paymentCountryFilter };
    const countries = await CountryModel.find({ isActive: true }).sort({ name: 1 });
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    const [revenueByCurrency, revenueBarGraph, revenueGraph, recentTransactions, lobbyCount, activePlayers, matchFromTournament, matchesPlayed, currentRevenueByCurrency, lastRevenueByCurrency, currentPlayers, lastPlayers, currentMatches, lastMatches, currentLobbies, lastLobbies, organizerPieUsage, trafficByCountry, MatchesPlayedVsAvailable, mostPlayableDays, mostPreferredAreas,] = await Promise.all([
        PaymentModel.aggregate([
            { $match: paidPaymentMatch },
            {
                $group: {
                    _id: { $ifNull: ["$currencyCode", CountryService.DEFAULT_CURRENCY_CODE] },
                    total: { $sum: "$price" },
                },
            },
            { $project: { _id: 0, currencyCode: "$_id", total: 1 } },
            { $sort: { currencyCode: 1 } },
        ]),
        PaymentModel.aggregate([
            { $match: paidPaymentMatch },
            {
                $group: {
                    _id: {
                        hour: { $hour: "$createdAt" },
                        day: { $dayOfMonth: "$createdAt" },
                        currencyCode: { $ifNull: ["$currencyCode", CountryService.DEFAULT_CURRENCY_CODE] },
                    },
                    total: { $sum: "$price" },
                },
            },
            { $sort: { "_id.day": 1, "_id.hour": 1, "_id.currencyCode": 1 } },
        ]),
        PaymentModel.aggregate([
            { $match: paidPaymentMatch },
            {
                $group: {
                    _id: {
                        month: { $month: "$createdAt" },
                        year: { $year: "$createdAt" },
                        currencyCode: { $ifNull: ["$currencyCode", CountryService.DEFAULT_CURRENCY_CODE] },
                    },
                    total: { $sum: "$price" },
                },
            },
            { $sort: { "_id.year": 1, "_id.month": 1, "_id.currencyCode": 1 } },
        ]),
        PaymentModel.find(paymentCountryFilter)
            .sort({ createdAt: -1 })
            .limit(5)
            .select("-stripePaymentIntentId"),
        LobbyModel.countDocuments(countryFilter),
        userModel.countDocuments({ isBlocked: "active", ...countryFilter }),
        MatchModel.countDocuments(countryFilter),
        userModel.aggregate([
            { $match: countryFilter },
            { $group: { _id: null, totalMatches: { $sum: "$match" } } },
        ]),
        PaymentModel.aggregate([
            { $match: { ...paidPaymentMatch, createdAt: { $gte: startOfThisMonth } } },
            { $group: { _id: { $ifNull: ["$currencyCode", CountryService.DEFAULT_CURRENCY_CODE] }, total: { $sum: "$price" } } },
        ]),
        PaymentModel.aggregate([
            { $match: { ...paidPaymentMatch, createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
            { $group: { _id: { $ifNull: ["$currencyCode", CountryService.DEFAULT_CURRENCY_CODE] }, total: { $sum: "$price" } } },
        ]),
        userModel.countDocuments({ ...countryFilter, createdAt: { $gte: startOfThisMonth } }),
        userModel.countDocuments({ ...countryFilter, createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
        userModel.aggregate([
            { $match: { ...countryFilter, updatedAt: { $gte: startOfThisMonth } } },
            { $group: { _id: null, total: { $sum: "$matchesPlayed" } } },
        ]),
        userModel.aggregate([
            { $match: { ...countryFilter, updatedAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
            { $group: { _id: null, total: { $sum: "$matchesPlayed" } } },
        ]),
        LobbyModel.countDocuments({ ...countryFilter, createdAt: { $gte: startOfThisMonth } }),
        LobbyModel.countDocuments({ ...countryFilter, createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
        userModel.aggregate([
            { $match: countryFilter },
            { $group: { _id: "$role", count: { $sum: 1 } } },
            { $project: { _id: 0, role: "$_id", count: 1 } },
        ]),
        userModel.aggregate([
            { $match: countryFilter },
            {
                $group: {
                    _id: { $ifNull: ["$countryCode", CountryService.DEFAULT_COUNTRY_CODE] },
                    count: { $sum: 1 },
                },
            },
            {
                $group: {
                    _id: null,
                    countries: { $push: { country: "$_id", count: "$count" } },
                    total: { $sum: "$count" },
                },
            },
            { $unwind: "$countries" },
            {
                $project: {
                    _id: 0,
                    country: "$countries.country",
                    count: "$countries.count",
                    percentage: { $multiply: [{ $divide: ["$countries.count", "$total"] }, 100] },
                },
            },
        ]),
        userModel.aggregate([
            {
                $match: {
                    ...countryFilter,
                    isBlocked: "active",
                    updatedAt: { $gte: startOfToday, $lte: endOfToday },
                },
            },
            {
                $group: {
                    _id: { hour: { $hour: "$updatedAt" } },
                    played: { $sum: { $cond: [{ $gt: ["$match", 0] }, 1, 0] } },
                    available: { $sum: { $cond: [{ $eq: ["$match", 0] }, 1, 0] } },
                },
            },
            { $project: { _id: 0, hour: "$_id.hour", played: 1, available: 1 } },
            { $sort: { hour: 1 } },
        ]),
        userModel.aggregate([
            { $match: { ...countryFilter, isBlocked: "active" } },
            { $unwind: "$playingDays" },
            { $group: { _id: "$playingDays", count: { $sum: 1 } } },
            { $project: { _id: 0, day: "$_id", players: "$count" } },
            { $sort: { players: -1 } },
        ]),
        userModel.aggregate([
            { $match: { ...countryFilter, isBlocked: "active", preferredAreas: { $exists: true, $ne: [] } } },
            { $unwind: "$preferredAreas" },
            { $match: { preferredAreas: { $ne: "" } } },
            { $group: { _id: "$preferredAreas", players: { $sum: 1 } } },
            { $project: { _id: 0, area: "$_id", players: 1 } },
            { $sort: { players: -1 } },
        ]),
    ]);
    const displayCurrency = selectedCountry.currencyCode;
    const totalRevenue = revenueByCurrency.find((item) => item.currencyCode === displayCurrency)?.total || 0;
    const currentRevenue = currentRevenueByCurrency.find((item) => item._id === selectedCountry.currencyCode)?.total || 0;
    const lastRevenue = lastRevenueByCurrency.find((item) => item._id === selectedCountry.currencyCode)?.total || 0;
    const totalMatches = (matchesPlayed[0]?.totalMatches || 0) + matchFromTournament;
    return {
        selectedCountryCode,
        displayCurrency,
        countries,
        totalRevenue,
        revenueByCurrency,
        revenueBarGraph,
        organizerPieUsage,
        revenueGrowth: calculateGrowth(currentRevenue, lastRevenue),
        activePlayers,
        playerGrowth: calculateGrowth(currentPlayers, lastPlayers),
        lobbyCount,
        lobbyGrowth: calculateGrowth(currentLobbies, lastLobbies),
        totalMatches,
        matchGrowth: calculateGrowth(currentMatches[0]?.total || 0, lastMatches[0]?.total || 0),
        revenueGraph,
        recentTransactions,
        trafficByCountry,
        MatchesPlayedVsAvailable,
        mostPlayableDays,
        mostPreferredAreas,
    };
};
export const adminService = {
    adminData,
    adminDataV2
};
//# sourceMappingURL=admin.services.js.map