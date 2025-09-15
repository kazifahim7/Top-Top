import { Types } from "mongoose";
import type { TTeam } from "./team.interface.js";
export declare const teamsService: {
    createTeam: (payload: TTeam, owner: any) => Promise<import("mongoose").Document<unknown, {}, TTeam, {}, {}> & TTeam & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }>;
    updateTeam: (payload: Partial<TTeam>, id: string) => Promise<(import("mongoose").Document<unknown, {}, TTeam, {}, {}> & TTeam & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
    allTeams: () => Promise<(import("mongoose").Document<unknown, {}, TTeam, {}, {}> & TTeam & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    })[]>;
    myTeam: (id: string) => Promise<(import("mongoose").Document<unknown, {}, TTeam, {}, {}> & TTeam & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
    assignCaptain: (ownerId: string, teamId: string, captainId: string) => Promise<Omit<import("mongoose").Document<unknown, {}, TTeam, {}, {}> & TTeam & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, never>>;
    removePlayer: (ownerId: string, teamId: string, playerId: string) => Promise<(import("mongoose").Document<unknown, {}, TTeam, {}, {}> & TTeam & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
};
//# sourceMappingURL=teams.service.d.ts.map