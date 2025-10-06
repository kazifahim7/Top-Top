import { Types } from "mongoose";
import type { ITournament } from "./Tournament.interface.js";
export declare const TournamentService: {
    createTournament: (payload: ITournament) => Promise<import("mongoose").Document<unknown, {}, ITournament, {}, {}> & ITournament & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }>;
    singleTournament: (id: string) => Promise<(import("mongoose").Document<unknown, {}, ITournament, {}, {}> & ITournament & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
    allTournament: () => Promise<(import("mongoose").Document<unknown, {}, ITournament, {}, {}> & ITournament & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    })[]>;
    updateTournament: (id: string, payload: Partial<ITournament>) => Promise<(import("mongoose").Document<unknown, {}, ITournament, {}, {}> & ITournament & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
    deleteTournament: (id: string) => Promise<(import("mongoose").Document<unknown, {}, ITournament, {}, {}> & ITournament & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
    qualifyTeamsService: (tournamentId: string, teamIds: string[]) => Promise<import("mongoose").Document<unknown, {}, ITournament, {}, {}> & ITournament & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }>;
    getTopPlayers: (tournamentId: string) => Promise<{
        tournament: string;
        topPlayers: any[];
    }>;
};
//# sourceMappingURL=Tournament.service.d.ts.map