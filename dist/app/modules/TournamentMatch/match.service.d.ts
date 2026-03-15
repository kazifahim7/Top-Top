import type { IMatch } from "./match.interface.js";
import { Types } from "mongoose";
interface PlayerData {
    playerId: string;
    matchPosition?: string;
    guest_player?: boolean;
}
interface AddPlayersData {
    team: "A" | "B";
    matchFormat?: string;
    players: PlayerData[];
}
export declare const updateMatchAndStanding: (matchId: string, data: Partial<IMatch>) => Promise<import("mongoose").Document<unknown, {}, IMatch, {}, import("mongoose").DefaultSchemaOptions> & IMatch & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
interface RemovePlayerData {
    team: "A" | "B";
    playerId: string;
}
export declare const removePlayerFromMatch: (matchId: string, data: RemovePlayerData, userId: string) => Promise<import("mongoose").Document<unknown, {}, IMatch, {}, import("mongoose").DefaultSchemaOptions> & IMatch & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
interface UpdatePlayerStatsDTO {
    matchId: string;
    playerId?: string;
    redCard?: number;
    yellowCard?: number;
    goal?: number;
    assists?: number;
    contribution?: number;
    save?: number;
    goodMoment?: number;
    veryGoodMoment?: number;
    ownGoal?: number;
    teamId?: "A" | "B";
}
export declare const updatePlayerStats: (data: UpdatePlayerStatsDTO) => Promise<{
    scoreA: number;
    scoreB: number;
    matchPlayer?: never;
} | {
    matchPlayer: any;
    scoreA?: never;
    scoreB?: never;
}>;
export declare const tournamentMatchService: {
    createMatch: (payload: IMatch, id: string) => Promise<import("mongoose").Document<unknown, {}, IMatch, {}, import("mongoose").DefaultSchemaOptions> & IMatch & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }>;
    singleMatch: (id: string) => Promise<{
        team1AvgMatchRatingAfter: number | null;
        team2AvgMatchRatingAfter: number | null;
        tournament: Types.ObjectId;
        stage: import("./match.interface.js").MatchStage;
        group: import("./match.interface.js").MatchGroup;
        teamA: Types.ObjectId;
        teamB: Types.ObjectId;
        scoreA: number;
        scoreB: number;
        status: "Pending" | "Completed" | "start";
        time: string;
        date: Date;
        winner?: Types.ObjectId | null;
        teamBPlayers: import("mongoose").FlattenMaps<{
            playerId: Types.ObjectId;
            matchPosition?: string;
            redCard: number;
            yellowCard: number;
            contribution: number;
            assists: number;
            goal: number;
            tackle: number;
            save: number;
            rating: number;
            rawRating?: number;
            goodMoment: number;
            veryGoodMoment: number;
            guest_player?: boolean;
            mainRating?: number;
            cleanSheet?: number;
        }>[];
        teamAPlayers: import("mongoose").FlattenMaps<{
            playerId: Types.ObjectId;
            matchPosition?: string;
            redCard: number;
            yellowCard: number;
            contribution: number;
            assists: number;
            goal: number;
            tackle: number;
            save: number;
            rating: number;
            rawRating?: number;
            goodMoment: number;
            veryGoodMoment: number;
            guest_player?: boolean;
            mainRating?: number;
            cleanSheet?: number;
        }>[];
        media: string[];
        organizer: Types.ObjectId;
        motm: Types.ObjectId;
        team1AvgMatchRatingBefore: number;
        team2AvgMatchRatingBefore: number;
        team1MatchFormat: string;
        team2MatchFormat: string;
        _id: Types.ObjectId;
        __v: number;
    } | null>;
    deleteMatch: (id: string) => Promise<(import("mongoose").Document<unknown, {}, IMatch, {}, import("mongoose").DefaultSchemaOptions> & IMatch & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
    allMatch: (id: string) => Promise<(import("mongoose").Document<unknown, {}, IMatch, {}, import("mongoose").DefaultSchemaOptions> & IMatch & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    })[]>;
    updateMatchAndStanding: (matchId: string, data: Partial<IMatch>) => Promise<import("mongoose").Document<unknown, {}, IMatch, {}, import("mongoose").DefaultSchemaOptions> & IMatch & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }>;
    addPlayers: (matchId: string, data: AddPlayersData, userId: string) => Promise<import("mongoose").Document<unknown, {}, IMatch, {}, import("mongoose").DefaultSchemaOptions> & IMatch & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }>;
    removePlayerFromMatch: (matchId: string, data: RemovePlayerData, userId: string) => Promise<import("mongoose").Document<unknown, {}, IMatch, {}, import("mongoose").DefaultSchemaOptions> & IMatch & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }>;
    updatePlayerStats: (data: UpdatePlayerStatsDTO) => Promise<{
        scoreA: number;
        scoreB: number;
        matchPlayer?: never;
    } | {
        matchPlayer: any;
        scoreA?: never;
        scoreB?: never;
    }>;
};
export {};
//# sourceMappingURL=match.service.d.ts.map