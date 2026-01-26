import mongoose from "mongoose";
import type { LobbyDocument } from "./lobby.interface.js";
interface UpdatePlayerStatsDTO {
    lobbyId: string;
    playerId: string;
    redCard?: number;
    yellowCard?: number;
    goal?: number;
    assist?: number;
    contribution?: number;
    save?: number;
}
interface UpdatePlayerStatsDTO {
    lobbyId: string;
    playerId: string;
    redCard?: number;
    yellowCard?: number;
    goal?: number;
    assist?: number;
    contribution?: number;
    save?: number;
}
export declare const updatePlayerStats: (data: UpdatePlayerStatsDTO) => Promise<{
    lobbyPlayer: any;
}>;
export declare const lobbyService: {
    createMatch: (payload: LobbyDocument, id: string, role: string) => Promise<mongoose.Document<unknown, {}, LobbyDocument, {}, {}> & LobbyDocument & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    allMatch: (query: Record<string, unknown>) => Promise<any[]>;
    updatePlayerStats: (data: UpdatePlayerStatsDTO) => Promise<{
        lobbyPlayer: any;
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
    myUpcomingLobby: (id: string) => Promise<(mongoose.Document<unknown, {}, LobbyDocument, {}, {}> & LobbyDocument & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[]>;
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
    }>;
    assignLobby: (id: string, data: {
        lobbyId: string;
    }) => Promise<(mongoose.Document<unknown, {}, LobbyDocument, {}, {}> & LobbyDocument & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }) | null>;
};
export {};
//# sourceMappingURL=lobby.services.d.ts.map