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
    myTeam: (id: string) => Promise<{
        myTeam: null;
        myTeamRating: number;
        upcomingMatch: never[];
        upcomingMatchTournament: never[];
        completeMatch: never[];
        completeMatchTournament: never[];
        media: never[];
    } | {
        myTeam: import("mongoose").Document<unknown, {}, TTeam, {}, {}> & TTeam & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        };
        myTeamRating: number;
        upcomingMatch: any[];
        upcomingMatchTournament: (import("mongoose").Document<unknown, {}, import("../TournamentMatch/match.interface.js").IMatch, {}, import("mongoose").DefaultSchemaOptions> & import("../TournamentMatch/match.interface.js").IMatch & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        })[];
        completeMatch: any[];
        completeMatchTournament: (import("mongoose").Document<unknown, {}, import("../TournamentMatch/match.interface.js").IMatch, {}, import("mongoose").DefaultSchemaOptions> & import("../TournamentMatch/match.interface.js").IMatch & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        })[];
        media: any[];
    }>;
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
    acceptInvite: (inviteId: string) => Promise<Omit<import("mongoose").Document<unknown, {}, TTeam, {}, {}> & TTeam & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, never>>;
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
    DeleteTeam: (teamId: string) => Promise<(import("mongoose").Document<unknown, {}, TTeam, {}, {}> & TTeam & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
    singleTeam: (id: string) => Promise<{
        myTeam: null;
        myTeamRating: number;
        upcomingMatch: never[];
        upcomingMatchTournament: never[];
        completeMatch: never[];
        completeMatchTournament: never[];
        media: never[];
    } | {
        myTeam: import("mongoose").Document<unknown, {}, TTeam, {}, {}> & TTeam & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        };
        myTeamRating: number;
        upcomingMatch: any[];
        upcomingMatchTournament: (import("mongoose").Document<unknown, {}, import("../TournamentMatch/match.interface.js").IMatch, {}, import("mongoose").DefaultSchemaOptions> & import("../TournamentMatch/match.interface.js").IMatch & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        })[];
        completeMatch: any[];
        completeMatchTournament: (import("mongoose").Document<unknown, {}, import("../TournamentMatch/match.interface.js").IMatch, {}, import("mongoose").DefaultSchemaOptions> & import("../TournamentMatch/match.interface.js").IMatch & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        })[];
        media: any[];
    }>;
};
//# sourceMappingURL=teams.service.d.ts.map