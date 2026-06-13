import mongoose, { Types } from "mongoose";
import type { LobbyDocument } from "./lobby.interface.js";
interface UpdatePlayerStatsDTO {
    lobbyId: string;
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
    teamId?: "team1" | "team2" | "defaultTeam1" | "defaultTeam2";
}
export declare const updatePlayerStats: (data: UpdatePlayerStatsDTO) => Promise<{
    goalTeam1: number;
    goalTeam2: number;
    lobbyPlayer?: never;
} | {
    lobbyPlayer: any;
    goalTeam1?: never;
    goalTeam2?: never;
}>;
export declare const lobbyService: {
    createMatch: (payload: LobbyDocument, id: string, role: string) => Promise<mongoose.Document<unknown, {}, LobbyDocument, {}, {}> & LobbyDocument & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    allMatch: (query: Record<string, unknown>) => Promise<any[]>;
    updatePlayerStats: (data: UpdatePlayerStatsDTO) => Promise<{
        goalTeam1: number;
        goalTeam2: number;
        lobbyPlayer?: never;
    } | {
        lobbyPlayer: any;
        goalTeam1?: never;
        goalTeam2?: never;
    }>;
    updateLobbyInfo: (id: string, payload: Record<string, unknown>) => Promise<(mongoose.Document<unknown, {}, LobbyDocument, {}, {}> & LobbyDocument & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }) | null>;
    deleteLobby: (id: string) => Promise<(mongoose.Document<unknown, {}, LobbyDocument, {}, {}> & LobbyDocument & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }) | null>;
    singlelobby: (lobbyId: string) => Promise<any>;
    myUpcomingLobby: (id: string) => Promise<any[]>;
    myCountryMatch: (userId: string, query: Record<string, unknown>) => Promise<any[]>;
    myCountryLobby: (userId: string, lobbyId: string) => Promise<any>;
    organizerLobby: (id: string) => Promise<{
        upcomingLobby: (mongoose.Document<unknown, {}, LobbyDocument, {}, {}> & LobbyDocument & Required<{
            _id: unknown;
        }> & {
            __v: number;
        })[];
        completeLobby: (mongoose.Document<unknown, {}, LobbyDocument, {}, {}> & LobbyDocument & Required<{
            _id: unknown;
        }> & {
            __v: number;
        })[];
        totalEarning: any;
        hostTournaments: (mongoose.Document<unknown, {}, import("../Tournament/Tournament.interface.js").ITournament, {}, {}> & import("../Tournament/Tournament.interface.js").ITournament & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        })[];
    }>;
    assignLobby: (id: string, data: {
        lobbyId: string;
    }, adminId: string) => Promise<(mongoose.Document<unknown, {}, LobbyDocument, {}, {}> & LobbyDocument & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }) | null>;
    assigntournament: (id: string, data: {
        tournamentId: string;
    }, adminId: string) => Promise<(mongoose.Document<unknown, {}, import("../Tournament/Tournament.interface.js").ITournament, {}, {}> & import("../Tournament/Tournament.interface.js").ITournament & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
    organizerMatch: (query: Record<string, unknown>, orgId: string) => Promise<any[]>;
    countryMatch: (countryCode: string, query: Record<string, unknown>) => Promise<any[]>;
};
export {};
//# sourceMappingURL=lobby.services.d.ts.map