export declare const adminService: {
    adminData: () => Promise<{
        totalRevenue: any[];
        revenueGrowth: number;
        activePlayers: number;
        playerGrowth: number;
        lobbyCount: number;
        lobbyGrowth: number;
        totalMatches: any;
        matchGrowth: number;
        revenueGraph: any[];
        recentTransactions: (import("mongoose").Document<unknown, {}, import("../Payment/payment.interface.js").Payment, {}, {}> & import("../Payment/payment.interface.js").Payment & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        })[];
        trafficByCountry: any[];
    }>;
};
//# sourceMappingURL=admin.services.d.ts.map