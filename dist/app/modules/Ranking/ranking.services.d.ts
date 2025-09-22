interface RankingOptions {
    filterBy?: "weekly" | "monthly" | "all";
    sortField?: string;
    sortOrder?: "asc" | "desc";
    matchField?: string;
    matchValue?: any;
}
export declare const playerRankingService: {
    playerRanking: (options: RankingOptions) => Promise<any[]>;
    teamRanking: (options: RankingOptions) => Promise<any[]>;
};
export {};
//# sourceMappingURL=ranking.services.d.ts.map