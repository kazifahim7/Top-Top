import type { IMatch } from "./match.interface.js";
export declare const updateMatchAndStanding: (matchId: string, scoreA: number, scoreB: number) => Promise<import("mongoose").Document<unknown, {}, IMatch, {}, import("mongoose").DefaultSchemaOptions> & IMatch & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export declare const tournamentMatchService: {
    createMatch: (payload: IMatch) => Promise<import("mongoose").Document<unknown, {}, IMatch, {}, import("mongoose").DefaultSchemaOptions> & IMatch & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    singleMatch: (id: string) => Promise<(import("mongoose").Document<unknown, {}, IMatch, {}, import("mongoose").DefaultSchemaOptions> & IMatch & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
    deleteMatch: (id: string) => Promise<(import("mongoose").Document<unknown, {}, IMatch, {}, import("mongoose").DefaultSchemaOptions> & IMatch & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
    allMatch: () => Promise<(import("mongoose").Document<unknown, {}, IMatch, {}, import("mongoose").DefaultSchemaOptions> & IMatch & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    })[]>;
    updateMatchAndStanding: (matchId: string, scoreA: number, scoreB: number) => Promise<import("mongoose").Document<unknown, {}, IMatch, {}, import("mongoose").DefaultSchemaOptions> & IMatch & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
};
//# sourceMappingURL=match.service.d.ts.map