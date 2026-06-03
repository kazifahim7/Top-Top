import { Types } from "mongoose";
import type { ITournament } from "./Tournament.interface.js";
export declare const getTopPlayers: (tournamentId: string) => Promise<any[]>;
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
    allTournament: () => Promise<{
        teams: any[];
        qualifiedTeams: any[];
        winner: any;
        name: string;
        type: "League" | "Knockout" | "Both";
        price: number;
        location: import("mongoose").FlattenMaps<{
            lat: number;
            lng: number;
        }>;
        startDate: Date;
        duration: number;
        fieldSize: 5 | 7 | 11 | 8 | 9 | 10;
        maxTeam: number;
        imageUrl: string;
        status: string;
        organizer: Types.ObjectId;
        isDelete: boolean;
        _id: Types.ObjectId;
        __v: number;
    }[]>;
    updateTournament: (id: string, payload: Partial<ITournament>, callerId: string, callerRole: string) => Promise<(import("mongoose").Document<unknown, {}, ITournament, {}, {}> & ITournament & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
    deleteTournament: (id: string, callerId: string, callerRole: string) => Promise<(import("mongoose").Document<unknown, {}, ITournament, {}, {}> & ITournament & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
    qualifyTeamsService: (tournamentId: string, teamIds: string[], callerId: string, callerRole: string) => Promise<import("mongoose").Document<unknown, {}, ITournament, {}, {}> & ITournament & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }>;
    getTopPlayers: (tournamentId: string) => Promise<any[]>;
    organizerTournament: (id: string) => Promise<(import("mongoose").Document<unknown, {}, ITournament, {}, {}> & ITournament & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    })[]>;
};
//# sourceMappingURL=Tournament.service.d.ts.map