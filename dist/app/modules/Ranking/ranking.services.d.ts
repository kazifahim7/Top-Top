import type { TCreateProfile } from "../auth/auth.interface.js";
interface RankingOptions {
    filterBy?: "weekly" | "monthly" | "all";
    sortField?: string;
    sortOrder?: "asc" | "desc";
    matchField?: keyof TCreateProfile;
    matchValue?: any;
    nationality?: string;
    age?: string | number;
    position?: string;
}
export declare const playerRankingService: {
    playerRanking: (options: RankingOptions) => Promise<any[]>;
    teamRanking: (options: RankingOptions) => Promise<any[]>;
};
export {};
//# sourceMappingURL=ranking.services.d.ts.map