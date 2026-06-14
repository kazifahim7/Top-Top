export declare const adminService: {
    adminData: () => Promise<{
        totalRevenue: any;
        revenueBarGraph: any[];
        organizerPieUsage: any[];
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
        MatchesPlayedVsAvailable: any[];
        mostPlayableDays: any[];
        mostPreferredAreas: any[];
    }>;
    adminDataV2: (countryCode?: unknown) => Promise<{
        selectedCountryCode: string;
        displayCurrency: string;
        countries: (import("mongoose").Document<unknown, {}, import("../Country/country.interface.js").ICountry, {}, {}> & import("../Country/country.interface.js").ICountry & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        })[];
        totalRevenue: any;
        revenueByCurrency: any[];
        revenueBarGraph: any[];
        organizerPieUsage: any[];
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
        MatchesPlayedVsAvailable: any[];
        mostPlayableDays: any[];
        mostPreferredAreas: any[];
    }>;
};
//# sourceMappingURL=admin.services.d.ts.map