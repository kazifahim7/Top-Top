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
export declare const updateMatchAndStanding: (matchId: string, scoreA: number, scoreB: number) => Promise<import("mongoose").Document<unknown, {}, IMatch, {}, import("mongoose").DefaultSchemaOptions> & IMatch & {
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
export declare const tournamentMatchService: {
    createMatch: (payload: IMatch, id: string) => Promise<import("mongoose").Document<unknown, {}, IMatch, {}, import("mongoose").DefaultSchemaOptions> & IMatch & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }>;
    singleMatch: (id: string) => Promise<(import("mongoose").Document<unknown, {}, IMatch, {}, import("mongoose").DefaultSchemaOptions> & IMatch & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
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
    updateMatchAndStanding: (matchId: string, scoreA: number, scoreB: number) => Promise<import("mongoose").Document<unknown, {}, IMatch, {}, import("mongoose").DefaultSchemaOptions> & IMatch & {
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
};
export {};
//# sourceMappingURL=match.service.d.ts.map