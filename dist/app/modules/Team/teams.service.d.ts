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
    invitePlayer: (ownerId: string, teamId: string, playerId: string, message: string) => Promise<import("mongoose").Document<unknown, {}, import("../Notification/notification.interface.js").TInvite, {}, {}> & import("../Notification/notification.interface.js").TInvite & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }>;
    acceptInvite: (inviteId: string) => Promise<import("mongoose").Document<unknown, {}, TTeam, {}, {}> & TTeam & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }>;
    rejectInvite: (inviteId: string) => Promise<(import("mongoose").Document<unknown, {}, import("../Notification/notification.interface.js").TInvite, {}, {}> & import("../Notification/notification.interface.js").TInvite & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
    myRequest: (userId: string) => Promise<(import("mongoose").Document<unknown, {}, import("../Notification/notification.interface.js").TInvite, {}, {}> & import("../Notification/notification.interface.js").TInvite & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    })[]>;
};
//# sourceMappingURL=teams.service.d.ts.map